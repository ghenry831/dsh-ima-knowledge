import crypto from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const API_BASE = 'https://ima.qq.com/openapi/wiki/v1'
const NOTE_API_BASE = 'https://ima.qq.com/openapi/note/v1'
const CRED_KEY = 'ima-knowledge/openapi'
const MAX_HTTP_BODY = 260 * 1024 * 1024 // ~200MB file as base64 JSON

export const inject = ['credentials', 'tools', 'webServer']

// ---------------------------------------------------------------------------
// ima OpenAPI client
// ---------------------------------------------------------------------------

class ImaError extends Error {}

async function loadCredentials(ctx) {
  const rec = await ctx.credentials.readRecord(CRED_KEY)
  const payload = rec && rec.kind === 'grant' ? rec.payload : undefined
  if (
    !payload ||
    typeof payload.clientId !== 'string' ||
    typeof payload.apiKey !== 'string' ||
    !payload.clientId ||
    !payload.apiKey
  ) {
    throw new ImaError(
      '尚未配置 ima OpenAPI 凭证。请在「ima 知识库」面板中填入 Client ID 与 API Key（申请地址：https://ima.qq.com/agent-interface）',
    )
  }
  return { clientId: payload.clientId, apiKey: payload.apiKey }
}

async function imaApi(creds, endpoint, body, signal, base = API_BASE) {
  let res
  try {
    res = await fetch(`${base}/${endpoint}`, {
      method: 'POST',
      headers: {
        'ima-openapi-clientid': creds.clientId,
        'ima-openapi-apikey': creds.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
      signal: signalWithTimeout(signal, 60_000),
    })
  } catch (error) {
    if (error instanceof ImaError) throw error
    throw new ImaError(`无法连接 ima OpenAPI：${error.message}`)
  }
  let json
  try {
    json = await res.json()
  } catch {
    throw new ImaError(`ima OpenAPI 返回了非 JSON 响应（HTTP ${res.status}）`)
  }
  if (json.code !== 0) throw new ImaError(json.msg || `ima API 错误码 ${json.code}`)
  return json.data
}

function signalWithTimeout(signal, ms, extra) {
  const timeout = AbortSignal.timeout(ms)
  return signal ? AbortSignal.any([signal, timeout]) : timeout
}

// ---------------------------------------------------------------------------
// COS upload (PUT Object, q-sign-algorithm=sha1, temp credentials)
// ---------------------------------------------------------------------------

const hmacSha1 = (key, data) => crypto.createHmac('sha1', key).update(data).digest('hex')
const sha1 = (data) => crypto.createHash('sha1').update(data).digest('hex')

function buildCosAuthorization({ secretId, secretKey, pathname, headers, startTime, expiredTime }) {
  const keyTime = `${startTime};${expiredTime}`
  const signKey = hmacSha1(secretKey, keyTime)
  const headerKeys = Object.keys(headers).sort()
  const httpHeaders = headerKeys
    .map((k) => `${k.toLowerCase()}=${encodeURIComponent(headers[k])}`)
    .join('&')
  const httpString = `put\n${pathname}\n\n${httpHeaders}\n`
  const stringToSign = `sha1\n${keyTime}\n${sha1(httpString)}\n`
  const signature = hmacSha1(signKey, stringToSign)
  const headerList = headerKeys.map((k) => k.toLowerCase()).join(';')
  return [
    'q-sign-algorithm=sha1',
    `q-ak=${secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=${headerList}`,
    'q-url-param-list=',
    `q-signature=${signature}`,
  ].join('&')
}

async function cosUpload(credential, content, contentType, signal) {
  const hostname = `${credential.bucket_name}.cos.${credential.region}.myqcloud.com`
  const pathname = `/${credential.cos_key}`
  const startTime = String(credential.start_time || Math.floor(Date.now() / 1000))
  const expiredTime = String(credential.expired_time || Math.floor(Date.now() / 1000) + 3600)
  const authorization = buildCosAuthorization({
    secretId: credential.secret_id,
    secretKey: credential.secret_key,
    pathname,
    headers: { 'content-length': String(content.length), host: hostname },
    startTime,
    expiredTime,
  })
  const res = await fetch(`https://${hostname}${pathname}`, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      Authorization: authorization,
      'x-cos-security-token': credential.token,
    },
    body: content,
    signal: signalWithTimeout(signal, 300_000),
  })
  if (!(res.status >= 200 && res.status < 300)) {
    const text = await res.text().catch(() => '')
    throw new ImaError(`COS 上传失败（HTTP ${res.status}）：${text.slice(0, 300)}`)
  }
}

// ---------------------------------------------------------------------------
// File type table (media_type / content_type / size limit in MB)
// ---------------------------------------------------------------------------

const FILE_TYPES = {
  pdf: { media_type: 1, content_type: 'application/pdf', limit: 200 },
  doc: { media_type: 3, content_type: 'application/msword', limit: 200 },
  docx: {
    media_type: 3,
    content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    limit: 200,
  },
  ppt: { media_type: 4, content_type: 'application/vnd.ms-powerpoint', limit: 200 },
  pptx: {
    media_type: 4,
    content_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    limit: 200,
  },
  xls: { media_type: 5, content_type: 'application/vnd.ms-excel', limit: 10 },
  xlsx: {
    media_type: 5,
    content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    limit: 10,
  },
  csv: { media_type: 5, content_type: 'text/csv', limit: 10 },
  md: { media_type: 7, content_type: 'text/markdown', limit: 10 },
  markdown: { media_type: 7, content_type: 'text/markdown', limit: 10 },
  png: { media_type: 9, content_type: 'image/png', limit: 30 },
  jpg: { media_type: 9, content_type: 'image/jpeg', limit: 30 },
  jpeg: { media_type: 9, content_type: 'image/jpeg', limit: 30 },
  webp: { media_type: 9, content_type: 'image/webp', limit: 30 },
  txt: { media_type: 13, content_type: 'text/plain', limit: 10 },
  xmind: { media_type: 14, content_type: 'application/x-xmind', limit: 10 },
  mp3: { media_type: 15, content_type: 'audio/mpeg', limit: 200 },
  m4a: { media_type: 15, content_type: 'audio/x-m4a', limit: 200 },
  wav: { media_type: 15, content_type: 'audio/wav', limit: 200 },
  aac: { media_type: 15, content_type: 'audio/aac', limit: 200 },
}

const MEDIA_TYPE_NAMES = {
  1: 'PDF',
  2: '网页',
  3: 'Word',
  4: 'PPT',
  5: 'Excel',
  6: '微信文章',
  7: 'Markdown',
  9: '图片',
  11: '笔记',
  13: 'TXT',
  14: 'Xmind',
  15: '录音',
}

function typeOfFile(fileName) {
  const ext = path.extname(fileName).slice(1).toLowerCase()
  const info = FILE_TYPES[ext]
  if (!info) {
    throw new ImaError(
      `不支持的文件类型 .${ext || '(无扩展名)'}。支持：${Object.keys(FILE_TYPES).join(' / ')}`,
    )
  }
  return { ext, ...info }
}

// ---------------------------------------------------------------------------
// Operations (single implementation shared by HTTP route and agent tools)
// ---------------------------------------------------------------------------

function makeOps(ctx) {
  const ops = {}

  ops.status = async () => {
    const info = await ctx.credentials.describeRecord(CRED_KEY)
    return { configured: Boolean(info.configured), writable: info.writable !== false }
  }

  ops.configure = async ({ clientId, apiKey }) => {
    if (typeof clientId !== 'string' || !clientId.trim())
      throw new ImaError('请填写 Client ID')
    if (typeof apiKey !== 'string' || !apiKey) throw new ImaError('请填写 API Key')
    const creds = { clientId: clientId.trim(), apiKey: apiKey.trim() }
    // Validate before storing so typos surface immediately.
    await imaApi(creds, 'search_knowledge_base', { query: '', cursor: '', limit: 1 })
    await ctx.credentials.modifyRecord(CRED_KEY, async () => ({ kind: 'grant', payload: creds }))
    return { configured: true }
  }

  ops.clear = async () => {
    await ctx.credentials.deleteRecord(CRED_KEY)
    return { configured: false }
  }

  async function enrichBases(list) {
    const ids = list.map((b) => b.id).filter(Boolean).slice(0, 20)
    if (!ids.length) return list
    try {
      const creds = await loadCredentials(ctx)
      const data = await imaApi(creds, 'get_knowledge_base', { ids })
      const infos = data?.infos ?? {}
      return list.map((b) => ({ ...b, ...(infos[b.id] ?? {}) }))
    } catch {
      return list
    }
  }

  ops.listBases = async ({ cursor = '', limit = 20 } = {}, signal) => {
    const creds = await loadCredentials(ctx)
    const data = await imaApi(
      creds,
      'get_addable_knowledge_base_list',
      { cursor, limit: clamp(limit, 1, 50) },
      signal,
    )
    const list = await enrichBases(data?.addable_knowledge_base_list ?? [])
    return { list, is_end: Boolean(data?.is_end), next_cursor: data?.next_cursor ?? '' }
  }

  ops.searchBases = async ({ query = '', cursor = '', limit = 20 } = {}, signal) => {
    const creds = await loadCredentials(ctx)
    const data = await imaApi(
      creds,
      'search_knowledge_base',
      { query, cursor, limit: clamp(limit, 1, 20) },
      signal,
    )
    const list = await enrichBases(data?.info_list ?? [])
    return { list, is_end: Boolean(data?.is_end), next_cursor: data?.next_cursor ?? '' }
  }

  ops.listKnowledge = async (
    { knowledge_base_id, folder_id, cursor = '', limit = 50 } = {},
    signal,
  ) => {
    require(knowledge_base_id, 'knowledge_base_id')
    const creds = await loadCredentials(ctx)
    const body = { knowledge_base_id, cursor, limit: clamp(limit, 1, 50) }
    if (folder_id) body.folder_id = folder_id
    const data = await imaApi(creds, 'get_knowledge_list', body, signal)
    return {
      list: data?.knowledge_list ?? [],
      current_path: data?.current_path ?? [],
      is_end: Boolean(data?.is_end),
      next_cursor: data?.next_cursor ?? '',
    }
  }

  ops.searchKnowledge = async ({ query, knowledge_base_id, cursor = '' } = {}, signal) => {
    require(knowledge_base_id, 'knowledge_base_id')
    if (typeof query !== 'string' || !query.trim()) throw new ImaError('请提供搜索关键词 query')
    const creds = await loadCredentials(ctx)
    const data = await imaApi(
      creds,
      'search_knowledge',
      { query: query.trim(), knowledge_base_id, cursor },
      signal,
    )
    return {
      list: data?.info_list ?? [],
      is_end: Boolean(data?.is_end),
      next_cursor: data?.next_cursor ?? '',
    }
  }

  ops.mediaInfo = async ({ media_id } = {}, signal) => {
    require(media_id, 'media_id')
    const creds = await loadCredentials(ctx)
    const data = await imaApi(creds, 'get_media_info', { media_id }, signal)
    return {
      media_type: data?.media_type,
      media_type_name: MEDIA_TYPE_NAMES[data?.media_type] ?? '未知',
      url: data?.url_info?.url ?? '',
      notebook_id: data?.notebook_ext_info?.notebook_id ?? '',
    }
  }

  async function uploadBuffer({
    knowledge_base_id,
    folder_id,
    file_name,
    content,
    content_type,
    media_type,
    ext,
    onRepeated,
  }, signal) {
    const creds = await loadCredentials(ctx)
    // GATE 3: duplicate name check
    const checkBody = {
      params: [{ name: file_name, media_type }],
      knowledge_base_id,
    }
    if (folder_id) checkBody.folder_id = folder_id
    const check = await imaApi(creds, 'check_repeated_names', checkBody, signal)
    const repeated = (check?.results ?? []).find((r) => r.name === file_name)?.is_repeated
    if (repeated) {
      const renamed = await onRepeated?.(file_name)
      if (!renamed) {
        throw new ImaError(`知识库中已存在同名文件「${file_name}」。请换个文件名后重试（不支持覆盖）。`)
      }
      file_name = renamed
      const recheck = await imaApi(
        creds,
        'check_repeated_names',
        { params: [{ name: file_name, media_type }], knowledge_base_id, ...(folder_id ? { folder_id } : {}) },
        signal,
      )
      if ((recheck?.results ?? []).find((r) => r.name === file_name)?.is_repeated) {
        throw new ImaError(`重命名后仍然同名：「${file_name}」，请手动指定其他名称。`)
      }
    }
    // create_media
    const created = await imaApi(
      creds,
      'create_media',
      {
        file_name,
        file_size: content.length,
        content_type,
        knowledge_base_id,
        file_ext: ext,
      },
      signal,
    )
    const mediaId = created?.media_id
    const cosCredential = created?.cos_credential
    if (!mediaId || !cosCredential) throw new ImaError('create_media 未返回有效的上传凭证')
    // COS PUT
    await cosUpload(cosCredential, content, content_type, signal)
    // add_knowledge (GATE 2: title === file_name)
    const addBody = {
      media_type,
      media_id: mediaId,
      title: file_name,
      knowledge_base_id,
      file_info: {
        cos_key: cosCredential.cos_key,
        file_size: content.length,
        last_modify_time: Math.floor(Date.now() / 1000),
        file_name,
      },
    }
    if (folder_id) addBody.folder_id = folder_id
    const added = await imaApi(creds, 'add_knowledge', addBody, signal)
    return { media_id: added?.media_id ?? mediaId, title: file_name }
  }

  ops.uploadText = async (
    { knowledge_base_id, folder_id, title, content } = {},
    signal,
  ) => {
    require(knowledge_base_id, 'knowledge_base_id')
    if (typeof title !== 'string' || !title.trim()) throw new ImaError('请提供标题 title')
    if (typeof content !== 'string' || !content) throw new ImaError('请提供文本内容 content')
    const file_name = title.trim().endsWith('.md') ? title.trim() : `${title.trim()}.md`
    const buffer = Buffer.from(content, 'utf8')
    if (buffer.length > 10 * 1024 * 1024) throw new ImaError('Markdown 内容超过 10MB 限制')
    return uploadBuffer(
      {
        knowledge_base_id,
        folder_id,
        file_name,
        content: buffer,
        content_type: 'text/markdown',
        media_type: 7,
        ext: 'md',
        onRepeated: async (name) => appendTimestamp(name),
      },
      signal,
    )
  }

  ops.uploadFile = async (
    { knowledge_base_id, folder_id, file_name, content_base64 } = {},
    signal,
  ) => {
    require(knowledge_base_id, 'knowledge_base_id')
    if (typeof file_name !== 'string' || !file_name.trim()) throw new ImaError('请提供文件名 file_name')
    if (typeof content_base64 !== 'string' || !content_base64)
      throw new ImaError('请提供文件内容 content_base64')
    const { ext, content_type, media_type, limit } = typeOfFile(file_name.trim())
    const content = Buffer.from(content_base64, 'base64')
    if (content.length > limit * 1024 * 1024)
      throw new ImaError(`文件超过 ${limit}MB 大小限制（实际 ${(content.length / 1048576).toFixed(1)}MB）`)
    return uploadBuffer(
      {
        knowledge_base_id,
        folder_id,
        file_name: file_name.trim(),
        content,
        content_type,
        media_type,
        ext,
        onRepeated: async () => undefined, // surface duplicate as error for UI uploads
      },
      signal,
    )
  }

  ops.uploadLocalFile = async (
    { knowledge_base_id, folder_id, file_path } = {},
    signal,
  ) => {
    require(knowledge_base_id, 'knowledge_base_id')
    if (typeof file_path !== 'string' || !file_path.trim()) throw new ImaError('请提供文件路径 file_path')
    const filePath = file_path.trim()
    const fileName = path.basename(filePath)
    const { ext, content_type, media_type, limit } = typeOfFile(fileName)
    const content = await readFile(filePath)
    if (content.length > limit * 1024 * 1024)
      throw new ImaError(`文件超过 ${limit}MB 大小限制（实际 ${(content.length / 1048576).toFixed(1)}MB）`)
    return uploadBuffer(
      {
        knowledge_base_id,
        folder_id,
        file_name: fileName,
        content,
        content_type,
        media_type,
        ext,
        onRepeated: async (name) => appendTimestamp(name),
      },
      signal,
    )
  }

  ops.importUrls = async ({ knowledge_base_id, folder_id, urls } = {}, signal) => {
    require(knowledge_base_id, 'knowledge_base_id')
    if (!Array.isArray(urls) || !urls.length || urls.length > 10)
      throw new ImaError('urls 需要是 1-10 个 URL 的数组')
    const list = urls.map((u) => String(u).trim()).filter(Boolean)
    if (!list.length) throw new ImaError('urls 中没有有效的 URL')
    const creds = await loadCredentials(ctx)
    const body = { knowledge_base_id, urls: list, folder_id: folder_id || knowledge_base_id }
    const data = await imaApi(creds, 'import_urls', body, signal)
    const results = Object.entries(data?.results ?? {}).map(([url, r]) => ({
      url,
      ok: r?.ret_code === 0,
      media_id: r?.media_id ?? '',
    }))
    return { results }
  }

  // ---- notes (openapi/note/v1) ------------------------------------------
  // 笔记 API 只支持：列出笔记本 / 列出笔记 / 读正文 / 从 Markdown 新建 /
  // 向末尾追加 Markdown。没有全量替换、任意位置编辑或删除接口；
  // 读取优先 Markdown（format=1，保留换行与结构），失败回退纯文本（format=0
  // 服务端会折叠换行）；写入仅支持 Markdown。

  ops.listNotebooks = async ({ cursor = '0', limit = 20 } = {}, signal) => {
    const creds = await loadCredentials(ctx)
    const data = await imaApi(
      creds,
      'list_notebook',
      { cursor, limit: clamp(limit, 1, 20) },
      signal,
      NOTE_API_BASE,
    )
    return {
      list: data?.note_folder_infos ?? [],
      is_end: Boolean(data?.is_end),
      next_cursor: data?.next_cursor ?? '',
    }
  }

  ops.listNotes = async ({ folder_id = '', sort_type = 0, cursor = '', limit = 20 } = {}, signal) => {
    const creds = await loadCredentials(ctx)
    const data = await imaApi(
      creds,
      'list_note',
      { folder_id, sort_type, cursor, limit: clamp(limit, 1, 20) },
      signal,
      NOTE_API_BASE,
    )
    return {
      list: data?.note_book_list ?? [],
      is_end: Boolean(data?.is_end),
      next_cursor: data?.next_cursor ?? '',
    }
  }

  ops.readNote = async ({ note_id, max_chars = 60000 } = {}, signal) => {
    require(note_id, 'note_id')
    const creds = await loadCredentials(ctx)
    // format 1 返回 Markdown 源码（保留换行与结构）；个别笔记可能不支持，
    // 失败时回退 format 0 纯文本（服务端会折叠换行，属已知限制）。
    let data = null
    try {
      data = await imaApi(
        creds,
        'get_doc_content',
        { note_id, target_content_format: 1 },
        signal,
        NOTE_API_BASE,
      )
    } catch (err) {
      if (signal?.aborted) throw err
      data = await imaApi(
        creds,
        'get_doc_content',
        { note_id, target_content_format: 0 },
        signal,
        NOTE_API_BASE,
      )
    }
    const content = data?.content ?? ''
    const truncated = content.length > max_chars
    return {
      note_id,
      truncated,
      content: truncated ? content.slice(0, max_chars) : content,
    }
  }

  ops.createNote = async ({ folder_id, folder_name, title, content } = {}, signal) => {
    if (typeof content !== 'string' || !content.trim()) throw new ImaError('请提供笔记内容 content')
    // import_doc 没有 title 字段，标题取自正文首个标题行；内容本身不以
    // '#' 开头时，把 title 提升为一级标题，保证笔记有可读标题。
    let body = content
    if (typeof title === 'string' && title.trim() && !content.trimStart().startsWith('#')) {
      body = `# ${title.trim()}\n\n${content}`
    }
    const creds = await loadCredentials(ctx)
    const data = await imaApi(
      creds,
      'import_doc',
      {
        content_format: 1,
        content: body,
        ...(folder_id ? { folder_id, folder_name } : {}),
      },
      signal,
      NOTE_API_BASE,
    )
    return { note_id: data?.note_id ?? '' }
  }

  ops.appendNote = async ({ note_id, content } = {}, signal) => {
    require(note_id, 'note_id')
    if (typeof content !== 'string' || !content.trim()) {
      throw new ImaError('请提供要追加的内容 content')
    }
    const creds = await loadCredentials(ctx)
    await imaApi(
      creds,
      'append_doc',
      { note_id, content_format: 1, content },
      signal,
      NOTE_API_BASE,
    )
    return { note_id, appended: true }
  }

  ops.readDocument = async ({ media_id, max_chars = 60000 } = {}, signal) => {
    require(media_id, 'media_id')
    const creds = await loadCredentials(ctx)
    const data = await imaApi(creds, 'get_media_info', { media_id }, signal)
    const mediaType = data?.media_type
    const typeName = MEDIA_TYPE_NAMES[mediaType] ?? '未知'
    if (mediaType === 11) {
      const noteId = data?.notebook_ext_info?.notebook_id
      if (noteId) {
        // 笔记正文走 note/v1 get_doc_content，优先 Markdown（保留换行）
        let note = null
        try {
          note = await imaApi(
            creds,
            'get_doc_content',
            { note_id: noteId, target_content_format: 1 },
            signal,
            NOTE_API_BASE,
          )
        } catch (err) {
          if (signal?.aborted) throw err
          note = await imaApi(
            creds,
            'get_doc_content',
            { note_id: noteId, target_content_format: 0 },
            signal,
            NOTE_API_BASE,
          )
        }
        const content = note?.content ?? ''
        const truncated = content.length > max_chars
        return {
          media_type: mediaType,
          media_type_name: typeName,
          note_id: noteId,
          truncated,
          content: truncated ? content.slice(0, max_chars) : content,
        }
      }
      return {
        media_type: mediaType,
        media_type_name: typeName,
        note: '这是 ima 笔记，请在 ima 客户端查看',
      }
    }
    const url = data?.url_info?.url
    if (!url) {
      return {
        media_type: mediaType,
        media_type_name: typeName,
        note: '该文档暂无可访问的原文链接，请使用 ima 客户端查看原文。',
      }
    }
    const headers = data?.url_info?.headers ?? {}
    const textTypes = new Set([2, 6, 7, 13])
    if (!textTypes.has(mediaType)) {
      return {
        media_type: mediaType,
        media_type_name: typeName,
        url,
        note: '二进制文档，可用此链接下载原文后用 office/文档工具解析。',
      }
    }
    let res
    try {
      res = await fetch(url, { headers, signal: signalWithTimeout(signal, 60_000) })
    } catch (error) {
      throw new ImaError(`获取原文失败：${error.message}`)
    }
    if (!res.ok) throw new ImaError(`获取原文失败（HTTP ${res.status}），请使用 ima 客户端查看原文`)
    const raw = await res.text()
    const truncated = raw.length > max_chars
    return {
      media_type: mediaType,
      media_type_name: typeName,
      url,
      truncated,
      content: truncated ? raw.slice(0, max_chars) : raw,
    }
  }

  return ops
}

function clamp(value, min, max) {
  const n = Number(value) || min
  return Math.min(max, Math.max(min, n))
}

function require(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new ImaError(`缺少必填参数 ${name}`)
}

function appendTimestamp(fileName) {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const ext = path.extname(fileName)
  return `${fileName.slice(0, fileName.length - ext.length)}_${stamp}${ext}`
}

// ---------------------------------------------------------------------------
// Agent tools
// ---------------------------------------------------------------------------

const jsonOutput = {
  // 显式写 additionalProperties：DSH 的 JSON Schema 子集要求 object 类型必须
  // 声明开放性（`defineTool()` 会对此强制校验），写死 true 可避免后续升级被拒。
  schema: { type: 'object', additionalProperties: true },
  render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
}

const NO_CREDENTIALS_HINT =
  '若提示未配置凭证，请引导用户打开「ima 知识库」面板（左侧栏图标）填写 Client ID 与 API Key。'

/**
 * 把 author 侧的参数 DSL（属性表 + 每个属性里的 `required: true`）编译成
 * 根为 `object` 的标准 JSON Schema。
 *
 * 注意：`@deepseek-ai/dsh-tools` 的 `defineTool()` 会做同样的投影，但那是
 * Host 内部包，插件目录里解析不到，所以这里本地实现一份等价逻辑。若直接把
 * DSL 原样交给 `ctx.tools.register()`，schema 会按原样上送给模型供应商，
 * 缺少根节点 `type: "object"`，严格校验的供应商（如 kimi）会直接拒绝请求：
 * `tools.function.parameters.type is required and must be "object"`。
 */
function compileParameters(spec) {
  const properties = {}
  const required = []
  for (const [key, value] of Object.entries(spec ?? {})) {
    const { required: isRequired, ...schema } = value
    if (isRequired === true) required.push(key)
    properties[key] = schema
  }
  const compiled = { type: 'object', properties }
  if (required.length > 0) compiled.required = required
  return compiled
}

function defineImaTool(def) {
  return { ...def, parameters: compileParameters(def.parameters) }
}

const TOOLS = [
  defineImaTool({
    name: 'ima_list_knowledge_bases',
    description:
      '列出当前用户在腾讯 ima 中可添加内容的知识库（含名称、描述、推荐问题）。当用户想浏览自己的知识库，或要上传内容但未指定目标知识库时使用。返回 ima 知识库列表，每项含 id（knowledge_base_id）与 name。',
    parameters: {
      cursor: { type: 'string', description: '翻页游标，首次传空字符串' },
      limit: { type: 'number', description: '每页数量，1-50，默认 20' },
    },
    output: jsonOutput,
    isConcurrencySafe: () => true,
    execute: async (args, exec) => {
      const ops = execImaOps(exec)
      return ops.listBases(args, exec.signal)
    },
  }),
  defineImaTool({
    name: 'ima_search_knowledge_bases',
    description:
      '按名称关键词搜索 ima 知识库（query 传空字符串可列出全部知识库）。用户给出知识库名称但需要其 ID 时使用。',
    parameters: {
      query: { type: 'string', required: true, description: '知识库名称关键词，空字符串列出全部' },
      cursor: { type: 'string', description: '翻页游标，首次传空字符串' },
    },
    output: jsonOutput,
    isConcurrencySafe: () => true,
    execute: async (args, exec) => execImaOps(exec).searchBases(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_list_documents',
    description:
      '浏览 ima 知识库中的文档与文件夹（返回混合列表：文件夹有 folder_id，文档有 media_id）。可传 folder_id 进入子文件夹，current_path 为面包屑。根目录省略 folder_id。',
    parameters: {
      knowledge_base_id: { type: 'string', required: true, description: '知识库 ID' },
      folder_id: { type: 'string', description: '文件夹 ID，省略则列根目录' },
      cursor: { type: 'string', description: '翻页游标，首次传空字符串' },
      limit: { type: 'number', description: '每页数量，1-50，默认 50' },
    },
    output: jsonOutput,
    isConcurrencySafe: () => true,
    execute: async (args, exec) => execImaOps(exec).listKnowledge(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_search_documents',
    description:
      '在指定 ima 知识库内按关键词搜索文档与文件夹，返回标题与命中内容的高亮摘要（highlight_content），适合在做分析前定位相关文档。',
    parameters: {
      query: { type: 'string', required: true, description: '搜索关键词' },
      knowledge_base_id: { type: 'string', required: true, description: '知识库 ID' },
      cursor: { type: 'string', description: '翻页游标，首次传空字符串' },
    },
    output: jsonOutput,
    isConcurrencySafe: () => true,
    execute: async (args, exec) => execImaOps(exec).searchKnowledge(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_read_document',
    description:
      '读取 ima 知识库文档原文。文本类文档（网页/微信文章/Markdown/TXT）直接返回正文内容；PDF/Word 等二进制文档返回可下载的原文链接（可用支持下载解析的工具继续处理）；ima 笔记（media_type 11）优先返回 Markdown 源码（保留换行与结构，note_id 可用于 ima_append_note 追加内容）。',
    parameters: {
      media_id: { type: 'string', required: true, description: '文档的 media_id' },
      max_chars: { type: 'number', description: '正文最大字符数，默认 60000' },
    },
    output: jsonOutput,
    timeoutMs: 90_000,
    isConcurrencySafe: () => true,
    execute: async (args, exec) => execImaOps(exec).readDocument(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_upload_text',
    description:
      '把一段 Markdown 文本作为文档上传到指定 ima 知识库（标题自动补 .md 后缀；同名时自动追加时间戳）。适合把分析结论、笔记、摘要沉淀到知识库。',
    parameters: {
      knowledge_base_id: { type: 'string', required: true, description: '知识库 ID' },
      title: { type: 'string', required: true, description: '文档标题' },
      content: { type: 'string', required: true, description: 'Markdown 正文内容' },
      folder_id: { type: 'string', description: '目标文件夹 ID，省略则根目录' },
    },
    output: jsonOutput,
    timeoutMs: 120_000,
    execute: async (args, exec) => execImaOps(exec).uploadText(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_upload_file',
    description:
      '把本机文件上传到指定 ima 知识库。支持 pdf/doc/docx/ppt/pptx/xls/xlsx/csv/md/txt/xmind/png/jpg/jpeg/webp/mp3/m4a/wav/aac；同名时自动追加时间戳。注意大小限制：md/txt/excel/xmind 10MB，图片 30MB，pdf/word/ppt/音频 200MB。',
    parameters: {
      knowledge_base_id: { type: 'string', required: true, description: '知识库 ID' },
      file_path: { type: 'string', required: true, description: '本机文件绝对路径' },
      folder_id: { type: 'string', description: '目标文件夹 ID，省略则根目录' },
    },
    output: jsonOutput,
    timeoutMs: 300_000,
    execute: async (args, exec) => execImaOps(exec).uploadLocalFile(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_import_urls',
    description:
      '把网页或微信公众号文章链接导入指定 ima 知识库（1-10 个 URL，服务端自动识别网页/微信文章）。B 站/YouTube 等视频页不支持。',
    parameters: {
      knowledge_base_id: { type: 'string', required: true, description: '知识库 ID' },
      urls: {
        type: 'array',
        required: true,
        description: 'URL 列表（1-10 个）',
        items: { type: 'string' },
      },
      folder_id: { type: 'string', description: '目标文件夹 ID，省略则根目录' },
    },
    output: jsonOutput,
    timeoutMs: 120_000,
    execute: async (args, exec) => execImaOps(exec).importUrls(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_list_notebooks',
    description:
      '列出腾讯 ima 的笔记本（含名称、笔记数量、嵌套关系）。当用户想浏览笔记或新建/追加笔记前需要确认目标笔记本时使用。',
    parameters: {
      cursor: { type: 'string', description: '翻页游标，第一页传 "0"' },
      limit: { type: 'number', description: '每页数量，1-20，默认 20' },
    },
    output: jsonOutput,
    isConcurrencySafe: () => true,
    execute: async (args, exec) => execImaOps(exec).listNotebooks(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_list_notes',
    description:
      '列出腾讯 ima 笔记。folder_id 省略则列出全部笔记，返回标题、简介、创建/修改时间。翻页：首次 cursor 传空字符串。',
    parameters: {
      folder_id: { type: 'string', description: '笔记本 ID，省略则列出全部笔记' },
      sort_type: { type: 'number', description: '排序：0=修改时间(默认)，1=创建时间，2=标题，3=大小' },
      cursor: { type: 'string', description: '翻页游标，首次传空字符串' },
      limit: { type: 'number', description: '每页数量，1-20，默认 20' },
    },
    output: jsonOutput,
    isConcurrencySafe: () => true,
    execute: async (args, exec) => execImaOps(exec).listNotes(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_read_note',
    description:
      '读取腾讯 ima 笔记正文，优先返回 Markdown 源码（保留换行与结构；个别笔记可能回退为纯文本，会丢失换行与格式）。',
    parameters: {
      note_id: { type: 'string', required: true, description: '笔记 ID' },
      max_chars: { type: 'number', description: '正文最大字符数，默认 60000' },
    },
    output: jsonOutput,
    timeoutMs: 90_000,
    isConcurrencySafe: () => true,
    execute: async (args, exec) => execImaOps(exec).readNote(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_create_note',
    description:
      '在腾讯 ima 中新建一篇笔记（Markdown 内容）。笔记将保存到指定笔记本（folder_id 省略则存入默认位置）。注意：ima 笔记 API 不支持设置标题字段，若 content 不以 # 开头且提供了 title，会把 title 作为一级标题插入正文开头。返回新笔记的 note_id。',
    parameters: {
      content: { type: 'string', required: true, description: 'Markdown 正文内容' },
      title: { type: 'string', description: '笔记标题（content 不以 # 开头时提升为一级标题）' },
      folder_id: { type: 'string', description: '目标笔记本 ID，省略则默认位置' },
      folder_name: { type: 'string', description: '目标笔记本名称（与 folder_id 一起提供）' },
    },
    output: jsonOutput,
    timeoutMs: 120_000,
    execute: async (args, exec) => execImaOps(exec).createNote(args, exec.signal),
  }),
  defineImaTool({
    name: 'ima_append_note',
    description:
      '向腾讯 ima 笔记末尾追加 Markdown 内容。ima 笔记 API 只支持追加，不支持替换、插入或删除已有内容；如需"修改"，通常是读出原文后由用户确认，再追加修订内容。',
    parameters: {
      note_id: { type: 'string', required: true, description: '目标笔记 ID' },
      content: { type: 'string', required: true, description: '要追加的 Markdown 内容' },
    },
    output: jsonOutput,
    timeoutMs: 120_000,
    execute: async (args, exec) => execImaOps(exec).appendNote(args, exec.signal),
  }),
]

let opsInstance
function execImaOps() {
  if (!opsInstance) throw new ImaError('ima 插件尚未初始化')
  return opsInstance
}

// ---------------------------------------------------------------------------
// Host plugin entry
// ---------------------------------------------------------------------------

export function apply(ctx) {
  opsInstance = makeOps(ctx)

  ctx.on('dispose', () => {
    opsInstance = undefined
  })

  // HTTP bridge for the browser half.
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/ima-api',
        handler: async (req, res) => {
          const reply = (status, obj) => {
            const body = JSON.stringify(obj)
            res.writeHead(status, {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store',
            })
            res.end(body)
          }
          try {
            if (req.method !== 'POST') {
              res.writeHead(405, { Allow: 'POST' })
              res.end()
              return
            }
            const chunks = []
            let size = 0
            for await (const chunk of req) {
              size += chunk.length
              if (size > MAX_HTTP_BODY) {
                reply(413, { ok: false, error: '请求体过大' })
                return
              }
              chunks.push(chunk)
            }
            let payload
            try {
              payload = JSON.parse(Buffer.concat(chunks).toString('utf8'))
            } catch {
              reply(400, { ok: false, error: '请求体不是合法 JSON' })
              return
            }
            const op = payload?.op
            const params = payload?.params ?? {}
            const handler = opsInstance?.[op]
            if (!handler) {
              reply(404, { ok: false, error: `未知操作 ${String(op)}` })
              return
            }
            const data = await handler(params)
            reply(200, { ok: true, data })
          } catch (error) {
            reply(200, { ok: false, error: error?.message ?? String(error) })
          }
        },
      }),
    'ima http api',
  )

  // Agent tools.
  for (const tool of TOOLS) {
    ctx.effect(() => ctx.tools.register(tool), `ima tool ${tool.name}`)
  }

  // Hint for the model so it knows the tools exist and how credentials flow.
  const prompt = ctx.get('systemPrompt')
  if (prompt) {
    ctx.effect(
      () =>
        prompt.section({
          name: 'ima-knowledge',
          order: 90,
          text:
            `腾讯 ima 知识库已接入：可调用 ima_list_knowledge_bases / ima_search_knowledge_bases / ima_list_documents / ima_search_documents / ima_read_document / ima_upload_text / ima_upload_file / ima_import_urls 工具读写用户的 ima 知识库；可调用 ima_list_notebooks / ima_list_notes / ima_read_note / ima_create_note / ima_append_note 工具管理 ima 笔记（笔记读取优先返回 Markdown 源码，写入仅支持 Markdown 新建/末尾追加，不支持替换或删除）。${NO_CREDENTIALS_HINT}`,
        }),
      'ima system prompt',
    )
  }
}
