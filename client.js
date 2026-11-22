// @local/dsh-ima-knowledge — browser half: sidebar entry + knowledge-base panel.
// Communicates with the Host half exclusively through POST /ima-api.

const PACKAGE_ID = '@local/dsh-ima-knowledge'
const PANEL_ID = 'ima-knowledge'
const NS = 'ima-knowledge'

const zh = {
  panel: 'ima 知识库',
  loading: '加载中…',
  error_prefix: '出错了：',
  retry: '重试',
  settings_title: '连接腾讯 ima',
  settings_intro:
    '填入 ima OpenAPI 的 Client ID 与 API Key 后，即可浏览、搜索知识库并上传内容。凭证仅保存在本机 DSH 凭据存储中。',
  settings_get_key: '前往 ima 智能体接口页面申请凭证',
  client_id: 'Client ID',
  api_key: 'API Key',
  save: '保存并验证',
  saving: '验证中…',
  clear_credentials: '清除已保存的凭证',
  pick_base: '选择知识库',
  pick_base_placeholder: '— 选择一个知识库 —',
  load_more: '加载更多',
  refresh: '刷新',
  tab_browse: '浏览',
  tab_search: '搜索',
  tab_upload: '上传',
  section_kb: '知识库',
  section_notes: '笔记',
  notebook: '笔记本',
  all_notes: '全部笔记',
  note_badge: '笔记',
  create_note_title: '新建笔记',
  create_note_hint: '内容以 Markdown 保存；填写标题时会作为正文首个一级标题。',
  note_title_placeholder: '笔记标题（可选）',
  note_content_placeholder: 'Markdown 正文内容…',
  create_note_button: '新建笔记',
  note_created_ok: '笔记已创建',
  save_to_notebook: '保存到笔记本',
  append_title: '追加内容到笔记末尾',
  append_placeholder: '要追加的 Markdown 内容…',
  append_button: '追加',
  append_ok: '已追加到笔记末尾',
  modified_at: '修改于 {time}',
  folder: '文件夹',
  root: '根目录',
  empty_list: '这里还没有内容',
  search_placeholder: '在「{name}」中搜索…',
  search_button: '搜索',
  search_empty_hint: '输入关键词搜索文档标题与内容',
  no_results: '没有匹配的结果',
  open_original: '打开原文',
  reading: '读取中…',
  upload_text_title: '上传 Markdown 文本',
  upload_text_title_placeholder: '文档标题',
  upload_text_content_placeholder: 'Markdown 正文内容…',
  upload_text_button: '上传文本',
  upload_file_title: '上传本地文件',
  upload_file_hint: '支持 pdf / doc / docx / ppt / pptx / xls / xlsx / csv / md / txt / xmind / png / jpg / webp / mp3 / m4a / wav / aac',
  upload_file_button: '选择文件并上传',
  upload_url_title: '导入网页链接',
  upload_url_placeholder: '每行一个 URL（网页或微信公众号文章，最多 10 个）',
  upload_url_button: '导入链接',
  uploading: '上传中…',
  upload_ok: '上传成功：{title}',
  import_results: '导入结果：{ok}/{total} 成功',
  docs_count: '{count} 项',
  note_badge: '笔记',
  type_folder: '文件夹',
  configured_as: '已连接',
  back: '返回列表',
  open_in_browser: '在浏览器中打开',
  truncated_note: '内容较长，仅显示前一部分',
  no_preview: '该类型暂不支持面板内预览，可在浏览器中打开原文',
}

const en = {
  panel: 'ima Knowledge',
  loading: 'Loading…',
  error_prefix: 'Error: ',
  retry: 'Retry',
  settings_title: 'Connect to Tencent ima',
  settings_intro:
    'Enter your ima OpenAPI Client ID and API Key to browse, search and upload knowledge. Credentials are stored locally in the DSH credential store.',
  settings_get_key: 'Apply for credentials on the ima agent interface page',
  client_id: 'Client ID',
  api_key: 'API Key',
  save: 'Save & verify',
  saving: 'Verifying…',
  clear_credentials: 'Clear saved credentials',
  pick_base: 'Knowledge base',
  pick_base_placeholder: '— Select a knowledge base —',
  load_more: 'Load more',
  refresh: 'Refresh',
  tab_browse: 'Browse',
  tab_search: 'Search',
  tab_upload: 'Upload',
  section_kb: 'Knowledge base',
  section_notes: 'Notes',
  notebook: 'Notebook',
  all_notes: 'All notes',
  note_badge: 'Note',
  create_note_title: 'New note',
  create_note_hint: 'Content is saved as Markdown; the title becomes the first heading when provided.',
  note_title_placeholder: 'Note title (optional)',
  note_content_placeholder: 'Markdown content…',
  create_note_button: 'Create note',
  note_created_ok: 'Note created',
  save_to_notebook: 'Save to notebook',
  append_title: 'Append to end of note',
  append_placeholder: 'Markdown content to append…',
  append_button: 'Append',
  append_ok: 'Appended to note',
  modified_at: 'Modified {time}',
  folder: 'Folder',
  root: 'Root',
  empty_list: 'Nothing here yet',
  search_placeholder: 'Search in "{name}"…',
  search_button: 'Search',
  search_empty_hint: 'Type a keyword to search document titles and content',
  no_results: 'No matching results',
  open_original: 'Open original',
  reading: 'Reading…',
  upload_text_title: 'Upload Markdown text',
  upload_text_title_placeholder: 'Document title',
  upload_text_content_placeholder: 'Markdown content…',
  upload_text_button: 'Upload text',
  upload_file_title: 'Upload local file',
  upload_file_hint: 'Supports pdf / doc / docx / ppt / pptx / xls / xlsx / csv / md / txt / xmind / png / jpg / webp / mp3 / m4a / wav / aac',
  upload_file_button: 'Pick a file & upload',
  upload_url_title: 'Import web pages',
  upload_url_placeholder: 'One URL per line (web pages or WeChat articles, up to 10)',
  upload_url_button: 'Import URLs',
  uploading: 'Uploading…',
  upload_ok: 'Uploaded: {title}',
  import_results: 'Import result: {ok}/{total} succeeded',
  docs_count: '{count} items',
  note_badge: 'Note',
  type_folder: 'Folder',
  configured_as: 'Connected',
  back: 'Back to list',
  open_in_browser: 'Open in browser',
  truncated_note: 'Content is long — showing the first part only',
  no_preview: 'This type cannot be previewed here; open the original in a browser',
}

const MEDIA_TYPE_NAMES = {
  1: 'PDF',
  2: 'Web',
  3: 'Word',
  4: 'PPT',
  5: 'Excel',
  6: 'WeChat',
  7: 'Markdown',
  9: 'Image',
  11: 'Note',
  13: 'TXT',
  14: 'Xmind',
  15: 'Audio',
}

function makeImaIcon(React) {
  const e = React.createElement
  return function ImaIcon({ size = 18, active }) {
    const color = 'currentColor'
    return e(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        style: { opacity: active ? 1 : 0.75, color },
        'aria-hidden': true,
      },
      e('path', {
        d: 'M4 4.5A1.5 1.5 0 0 1 5.5 3h6.172a1.5 1.5 0 0 1 1.06.44l6.829 6.828a1.5 1.5 0 0 1 .439 1.06V19.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5v-15Z',
        stroke: color,
        strokeWidth: 1.6,
        fill: active ? 'currentColor' : 'none',
        fillOpacity: active ? 0.16 : 0,
      }),
      e('path', { d: 'M12 3v7.5H20', stroke: color, strokeWidth: 1.6, strokeLinejoin: 'round' }),
      e('path', {
        d: 'M8 15.5h8M8 18h5',
        stroke: color,
        strokeWidth: 1.6,
        strokeLinecap: 'round',
      }),
    )
  }
}

async function call(op, params) {
  const res = await fetch('/ima-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, params: params ?? {} }),
  })
  const json = await res.json().catch(() => null)
  if (!json) throw new Error(`HTTP ${res.status}`)
  if (!json.ok) throw new Error(json.error || 'Unknown error')
  return json.data
}

function fmt(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars ? vars[k] : `{${k}}`))
}

window.__ModuleLoader__.load({
  id: PACKAGE_ID,
  factory(require) {
    const React = require('react')
    const ImaIcon = makeImaIcon(React)
    const e = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ima locale')
        const t = ctx.locale.bind(NS)

        // ---- shared styles -------------------------------------------------
        const C = {
          bg: 'var(--dsw-alias-bg-base)',
          layer1: 'var(--dsw-alias-bg-layer-1)',
          layer2: 'var(--dsw-alias-bg-layer-2)',
          border: 'var(--dsw-alias-border-l1)',
          label: 'var(--dsw-alias-label-primary)',
          label2: 'var(--dsw-alias-label-secondary)',
          brand: 'var(--dsw-alias-brand-primary)',
          error: 'var(--dsw-alias-state-error-primary)',
          success: 'var(--dsw-alias-state-success-primary)',
        }
        const styles = {
          page: {
            height: '100%',
            overflow: 'auto',
            background: C.bg,
            color: C.label,
            fontSize: 13,
            display: 'flex',
            flexDirection: 'column',
          },
          inner: { maxWidth: 880, width: '100%', margin: '0 auto', padding: '20px 24px 48px' },
          headerRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
          title: { fontSize: 18, fontWeight: 650, marginRight: 4 },
          grow: { flex: 1 },
          input: {
            background: C.layer1,
            border: `1px solid ${C.border}`,
            color: C.label,
            borderRadius: 8,
            padding: '7px 10px',
            fontSize: 13,
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
          },
          button: {
            background: C.layer2,
            border: `1px solid ${C.border}`,
            color: C.label,
            borderRadius: 8,
            padding: '7px 14px',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          },
          primary: {
            background: C.brand,
            border: `1px solid ${C.brand}`,
            color: 'var(--dsw-alias-bg-base)',
            borderRadius: 8,
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          },
          tabs: { display: 'flex', gap: 6, margin: '16px 0 12px' },
          tab: (on) => ({
            padding: '6px 14px',
            borderRadius: 8,
            border: `1px solid ${on ? C.brand : C.border}`,
            background: on ? C.layer2 : 'transparent',
            color: on ? C.brand : C.label2,
            fontSize: 13,
            cursor: 'pointer',
          }),
          seg: {
            display: 'flex',
            gap: 3,
            background: C.layer1,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: 3,
            marginBottom: 16,
          },
          segItem: (on) => ({
            flex: 1,
            padding: '7px 14px',
            borderRadius: 8,
            border: 'none',
            background: on ? C.layer2 : 'transparent',
            color: on ? C.brand : C.label2,
            fontSize: 13,
            fontWeight: on ? 650 : 400,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }),
          card: {
            background: C.layer1,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: 14,
            marginBottom: 12,
          },
          row: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 10px',
            borderRadius: 8,
            cursor: 'pointer',
          },
          badge: {
            fontSize: 11,
            padding: '1px 7px',
            borderRadius: 99,
            border: `1px solid ${C.border}`,
            color: C.label2,
            whiteSpace: 'nowrap',
          },
          muted: { color: C.label2, fontSize: 12 },
          errorBox: {
            background: C.layer1,
            border: `1px solid ${C.error}`,
            borderRadius: 8,
            padding: '10px 12px',
            color: C.error,
            fontSize: 12.5,
            marginBottom: 12,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          },
          okBox: {
            background: C.layer1,
            border: `1px solid ${C.success}`,
            borderRadius: 8,
            padding: '10px 12px',
            color: C.success,
            fontSize: 12.5,
            marginBottom: 12,
          },
          crumb: { color: C.brand, cursor: 'pointer' },
          link: { color: C.brand, textDecoration: 'none', cursor: 'pointer' },
          textarea: {
            background: C.layer1,
            border: `1px solid ${C.border}`,
            color: C.label,
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 13,
            outline: 'none',
            width: '100%',
            minHeight: 110,
            boxSizing: 'border-box',
            resize: 'vertical',
            fontFamily: 'inherit',
          },
          // ---- markdown rendering -------------------------------------------
          mdWrap: { lineHeight: 1.75, wordBreak: 'break-word' },
          mdP: { margin: '0 0 10px' },
          mdH1: { fontSize: 20, fontWeight: 700, margin: '16px 0 8px' },
          mdH2: { fontSize: 17, fontWeight: 650, margin: '14px 0 6px' },
          mdH3: { fontSize: 15, fontWeight: 650, margin: '12px 0 5px' },
          mdH4: { fontSize: 13.5, fontWeight: 600, margin: '10px 0 4px' },
          mdH5: { fontSize: 13, fontWeight: 600, margin: '8px 0 4px' },
          mdH6: { fontSize: 12.5, fontWeight: 600, margin: '8px 0 4px', color: C.label2 },
          mdHr: { border: 'none', borderTop: `1px solid ${C.border}`, margin: '12px 0' },
          mdQuote: {
            borderLeft: `3px solid ${C.brand}`,
            margin: '0 0 10px',
            padding: '2px 0 2px 12px',
            color: C.label2,
          },
          mdUl: { margin: '0 0 10px', paddingLeft: 22 },
          mdOl: { margin: '0 0 10px', paddingLeft: 24 },
          mdLi: { margin: '2px 0' },
          mdPre: {
            background: C.layer2,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '10px 12px',
            overflow: 'auto',
            margin: '0 0 10px',
          },
          mdCode: {
            fontFamily: 'ui-monospace, Consolas, "Courier New", monospace',
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          },
          mdCodeInline: {
            fontFamily: 'ui-monospace, Consolas, "Courier New", monospace',
            fontSize: 12,
            background: C.layer2,
            borderRadius: 4,
            padding: '1px 5px',
          },
        }

        // ---- lightweight markdown renderer -----------------------------------
        // Renders the common note subset (headings / lists / quotes / code /
        // inline emphasis / links) directly to React elements — never via
        // HTML strings, so note content cannot inject markup.
        let mdKey = 0
        const mdK = () => 'md' + mdKey++

        function renderInline(text) {
          // undo ima markdown-export escaping (e.g. import\_doc → import_doc)
          const src = String(text).replace(/\\([\\`*_[\]()>#])/g, '$1')
          const out = []
          const re = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(~~[^~\n]+~~)|(\[[^\]\n]+\]\([^)\s]+\))/g
          let last = 0
          let m
          while ((m = re.exec(src))) {
            if (m.index > last) out.push(src.slice(last, m.index))
            if (m[1]) {
              out.push(e('code', { key: mdK(), style: styles.mdCodeInline }, m[1].slice(1, -1)))
            } else if (m[2]) {
              out.push(e('strong', { key: mdK() }, renderInline(m[2].slice(2, -2))))
            } else if (m[3]) {
              out.push(e('em', { key: mdK() }, renderInline(m[3].slice(1, -1))))
            } else if (m[4]) {
              out.push(e('s', { key: mdK() }, m[4].slice(2, -2)))
            } else if (m[5]) {
              const lm = m[5].match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
              const href = lm && lm[2]
              if (href && /^(https?:|mailto:)/i.test(href)) {
                out.push(e('a', { key: mdK(), href, target: '_blank', rel: 'noreferrer', style: styles.link }, lm[1]))
              } else {
                out.push(m[5])
              }
            }
            last = re.lastIndex
          }
          if (last < src.length) out.push(src.slice(last))
          return out
        }

        function mdIsBlockStart(line) {
          return /^\s*```/.test(line) ||
            /^(#{1,6})\s/.test(line) ||
            /^\s*>\s?/.test(line) ||
            /^\s*([-*+]|\d+[.)])\s+/.test(line) ||
            /^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)
        }

        // flat list items (indent-aware) → nested ul/ol React tree
        function mdBuildList(items, idx, indent) {
          const ordered = items[idx].ordered
          const rows = []
          let i = idx
          while (i < items.length) {
            const it = items[i]
            if (it.indent < indent) break
            if (it.indent > indent) {
              const sub = mdBuildList(items, i, it.indent)
              const last = rows[rows.length - 1]
              if (last) last.children.push(sub.node)
              i = sub.next
              continue
            }
            rows.push({ text: it.text, children: [] })
            i++
          }
          const tag = ordered ? 'ol' : 'ul'
          return {
            next: i,
            node: e(tag, { key: mdK(), style: ordered ? styles.mdOl : styles.mdUl },
              rows.map((r, n) => e('li', { key: mdK(), style: styles.mdLi },
                renderInline(r.text),
                r.children))),
          }
        }

        function renderMarkdown(source) {
          const lines = String(source).replace(/\r\n?/g, '\n').split('\n')
          const out = []
          let i = 0
          while (i < lines.length) {
            const line = lines[i]
            if (!line.trim()) { i++; continue }
            const fence = line.match(/^\s*```/)
            if (fence) {
              const buf = []
              i++
              while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { buf.push(lines[i]); i++ }
              i++ // skip closing fence
              out.push(e('pre', { key: mdK(), style: styles.mdPre }, e('code', { style: styles.mdCode }, buf.join('\n'))))
              continue
            }
            const h = line.match(/^(#{1,6})\s+(.*)$/)
            if (h) {
              out.push(e('div', { key: mdK(), style: styles['mdH' + h[1].length] }, renderInline(h[2])))
              i++
              continue
            }
            if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
              out.push(e('hr', { key: mdK(), style: styles.mdHr }))
              i++
              continue
            }
            if (/^\s*>\s?/.test(line)) {
              const buf = []
              while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
                buf.push(lines[i].replace(/^\s*>\s?/, ''))
                i++
              }
              out.push(e('blockquote', { key: mdK(), style: styles.mdQuote }, renderMarkdown(buf.join('\n'))))
              continue
            }
            const lm = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
            if (lm) {
              const items = []
              while (i < lines.length) {
                const m2 = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
                if (!m2) break
                items.push({ indent: m2[1].length, ordered: /\d/.test(m2[2]), text: m2[3] })
                i++
              }
              out.push(mdBuildList(items, 0, items[0].indent).node)
              continue
            }
            // paragraph: consecutive plain lines folded into one
            const buf = [line.trim()]
            i++
            while (i < lines.length && lines[i].trim() && !mdIsBlockStart(lines[i])) {
              buf.push(lines[i].trim())
              i++
            }
            out.push(e('p', { key: mdK(), style: styles.mdP }, renderInline(buf.join(' '))))
          }
          return out
        }

        // ---- settings view --------------------------------------------------
        function SettingsView({ onSaved }) {
          const [clientId, setClientId] = useState('')
          const [apiKey, setApiKey] = useState('')
          const [busy, setBusy] = useState(false)
          const [error, setError] = useState('')
          const save = async () => {
            setBusy(true)
            setError('')
            try {
              await call('configure', { clientId, apiKey })
              onSaved()
            } catch (err) {
              setError(err.message)
            } finally {
              setBusy(false)
            }
          }
          return e('div', { style: { ...styles.card, maxWidth: 460, margin: '40px auto 0' } },
            e('div', { style: { fontSize: 16, fontWeight: 650, marginBottom: 8 } }, t('settings_title')),
            e('div', { style: { ...styles.muted, marginBottom: 14, lineHeight: 1.7 } }, t('settings_intro')),
            e('div', { style: { marginBottom: 10 } },
              e('div', { style: { ...styles.muted, marginBottom: 4 } }, t('client_id')),
              e('input', {
                style: styles.input,
                value: clientId,
                autoComplete: 'off',
                onChange: (ev) => setClientId(ev.target.value),
              })),
            e('div', { style: { marginBottom: 14 } },
              e('div', { style: { ...styles.muted, marginBottom: 4 } }, t('api_key')),
              e('input', {
                style: styles.input,
                type: 'password',
                value: apiKey,
                autoComplete: 'off',
                onChange: (ev) => setApiKey(ev.target.value),
                onKeyDown: (ev) => ev.key === 'Enter' && !busy && save(),
              })),
            error && e('div', { style: styles.errorBox }, error),
            e('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
              e('button', { style: styles.primary, disabled: busy, onClick: save },
                busy ? t('saving') : t('save')),
              e('a', {
                style: styles.link,
                href: 'https://ima.qq.com/agent-interface',
                target: '_blank',
                rel: 'noreferrer',
              }, t('settings_get_key'))),
          )
        }

        // ---- document row ---------------------------------------------------
        function itemTitle(item) {
          return item.title || item.name || item.file_name || item.folder_name || '(untitled)'
        }
        // Folders arrive as media_type 99 with the folder id in media_id.
        function isFolderItem(item) {
          return item.media_type === 99 || Boolean(item.folder_id)
        }
        function folderIdOf(item) {
          return item.folder_id || item.media_id || ''
        }
        function itemType(item) {
          if (isFolderItem(item)) return t('type_folder')
          return MEDIA_TYPE_NAMES[item.media_type] || 'Doc'
        }

        function DocRow({ item, onOpenFolder, onOpenDoc }) {
          const [hover, setHover] = useState(false)
          const isFolder = isFolderItem(item)
          return e('div', {
            style: { ...styles.row, background: hover ? C.layer2 : 'transparent' },
            onMouseEnter: () => setHover(true),
            onMouseLeave: () => setHover(false),
            onClick: () => (isFolder ? onOpenFolder(item) : onOpenDoc(item)),
          },
            e('span', { style: { fontSize: 15 } }, isFolder ? '📁' : '📄'),
            e('span', { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
              itemTitle(item)),
            e('span', { style: styles.badge }, itemType(item)),
          )
        }

        // ---- in-panel preview ------------------------------------------------
        function PreviewView({ preview, onBack }) {
          const { item, loading, data, error } = preview
          const mt = data?.media_type
          const frameStyle = {
            width: '100%',
            height: '70vh',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            background: '#fff',
          }
          let body
          if (loading) {
            body = e('div', { style: { ...styles.muted, padding: 12 } }, t('reading'))
          } else if (error) {
            body = e('div', { style: styles.errorBox }, error)
          } else if (data?.content != null && (mt === 2 || mt === 6)) {
            // web page / WeChat article: render fetched HTML in a sandboxed frame
            body = e('iframe', { style: frameStyle, sandbox: '', srcDoc: data.content })
          } else if (data?.content != null) {
            // Markdown documents render formatted; other text stays plain
            body = mt === 7
              ? e('div', { style: { ...styles.card, ...styles.mdWrap } }, renderMarkdown(data.content))
              : e('div', { style: { ...styles.card, whiteSpace: 'pre-wrap', lineHeight: 1.7, wordBreak: 'break-word' } },
                  data.content)
          } else if (mt === 9 && data?.url) {
            body = e('img', {
              src: data.url,
              alt: itemTitle(item),
              style: { maxWidth: '100%', borderRadius: 8, border: `1px solid ${C.border}` },
            })
          } else if (mt === 1 && data?.url) {
            body = e('iframe', { style: frameStyle, src: data.url })
          } else {
            body = e('div', { style: styles.card },
              e('div', { style: { marginBottom: 8 } }, data?.note || t('no_preview')),
              data?.url
                ? e('a', { style: styles.link, href: data.url, target: '_blank', rel: 'noreferrer' },
                    t('open_in_browser'))
                : null)
          }
          return e('div', null,
            e('div', { style: { display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' } },
              e('button', { style: styles.button, onClick: onBack }, '‹ ' + t('back')),
              e('span', {
                style: { fontWeight: 650, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
              }, itemTitle(item)),
              e('span', { style: styles.badge }, data?.media_type_name || itemType(item)),
              data?.url
                ? e('a', { style: styles.link, href: data.url, target: '_blank', rel: 'noreferrer' },
                    t('open_in_browser'))
                : null),
            data?.truncated && e('div', { style: { ...styles.muted, marginBottom: 8 } }, t('truncated_note')),
            body)
        }

        // ---- notes ----------------------------------------------------------
        function fmtTime(ms) {
          const n = Number(ms)
          if (!n) return ''
          const d = new Date(n)
          const pad = (x) => String(x).padStart(2, '0')
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
        }

        function NoteRow({ note, onOpen }) {
          const [hover, setHover] = useState(false)
          return e('div', {
            style: { ...styles.row, background: hover ? C.layer2 : 'transparent' },
            onMouseEnter: () => setHover(true),
            onMouseLeave: () => setHover(false),
            onClick: () => onOpen(note),
          },
            e('span', { style: { fontSize: 15 } }, '📝'),
            e('span', { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
              note.title || '(untitled)'),
            note.summary
              ? e('span', {
                  style: { ...styles.muted, flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                  note.summary)
              : null,
            e('span', { style: styles.badge }, fmtTime(note.modify_time) || t('note_badge')))
        }

        function NotePreviewView({ preview, appendText, busyAppend, onAppendText, onAppend, onBack }) {
          const { note, loading, data, error } = preview
          return e('div', null,
            e('div', { style: { display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' } },
              e('button', { style: styles.button, onClick: onBack }, '‹ ' + t('back')),
              e('span', {
                style: { fontWeight: 650, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
              }, note.title || '(untitled)'),
              e('span', { style: styles.badge }, t('note_badge'))),
            loading
              ? e('div', { style: { ...styles.muted, padding: 12 } }, t('reading'))
              : error
                ? e('div', { style: styles.errorBox }, error)
                : e('div', { style: { ...styles.card, ...styles.mdWrap } },
                    renderMarkdown(data?.content ?? '')),
            data?.truncated && e('div', { style: { ...styles.muted, marginTop: 8 } }, t('truncated_note')),
            e('div', { style: { ...styles.card, marginTop: 12 } },
              e('div', { style: { fontWeight: 650, marginBottom: 8 } }, t('append_title')),
              e('textarea', {
                style: styles.textarea,
                value: appendText,
                placeholder: t('append_placeholder'),
                onChange: (ev) => onAppendText(ev.target.value),
              }),
              e('div', { style: { marginTop: 8 } },
                e('button', {
                  style: styles.primary,
                  disabled: busyAppend || !appendText.trim(),
                  onClick: onAppend,
                }, busyAppend ? t('uploading') : t('append_button')))))
        }

        function CreateNoteView({
          notebooks, folderId, onFolderChange,
          title, onTitleChange, content, onContentChange,
          busy, onCreate, onBack,
        }) {
          return e('div', null,
            e('div', { style: { display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' } },
              e('button', { style: styles.button, onClick: onBack }, '‹ ' + t('back')),
              e('span', { style: { fontWeight: 650, fontSize: 15 } }, t('create_note_title'))),
            e('div', { style: { ...styles.card, marginTop: 14 } },
              e('div', { style: { ...styles.muted, marginBottom: 8 } }, t('create_note_hint')),
              e('div', { style: { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' } },
                e('span', { style: styles.muted }, t('save_to_notebook')),
                e('select', {
                  style: { ...styles.input, width: 'auto', minWidth: 160 },
                  value: folderId,
                  onChange: (ev) => onFolderChange(ev.target.value),
                },
                  e('option', { value: '' }, t('all_notes')),
                  notebooks.map((nb) => e('option', { key: nb.folder_id, value: nb.folder_id }, nb.name)))),
              e('input', {
                style: { ...styles.input, marginBottom: 8 },
                value: title,
                placeholder: t('note_title_placeholder'),
                onChange: (ev) => onTitleChange(ev.target.value),
              }),
              e('textarea', {
                style: styles.textarea,
                value: content,
                placeholder: t('note_content_placeholder'),
                onChange: (ev) => onContentChange(ev.target.value),
              }),
              e('div', { style: { marginTop: 8 } },
                e('button', {
                  style: styles.primary,
                  disabled: busy || !content.trim(),
                  onClick: onCreate,
                }, busy ? t('uploading') : t('create_note_button')))))
        }

        // ---- main page ------------------------------------------------------
        function KnowledgePage() {
          const [status, setStatus] = useState('loading') // loading | unconfigured | ready
          const [error, setError] = useState('')
          const [notice, setNotice] = useState('')

          const [bases, setBases] = useState([])
          const [basesCursor, setBasesCursor] = useState('')
          const [basesEnd, setBasesEnd] = useState(true)
          const [base, setBase] = useState(null) // selected {id, name}

          const [view, setView] = useState('browse')
          const [section, setSection] = useState('kb') // 'kb' | 'notes'

          const [nav, setNav] = useState({ folderId: '', path: [] })
          const [docs, setDocs] = useState([])
          const [docsCursor, setDocsCursor] = useState('')
          const [docsEnd, setDocsEnd] = useState(true)
          const [busyDocs, setBusyDocs] = useState(false)

          const [query, setQuery] = useState('')
          const [results, setResults] = useState(null) // null = not searched yet
          const [resultsCursor, setResultsCursor] = useState('')
          const [resultsEnd, setResultsEnd] = useState(true)
          const [busySearch, setBusySearch] = useState(false)

          const [textTitle, setTextTitle] = useState('')
          const [textContent, setTextContent] = useState('')
          const [urls, setUrls] = useState('')
          const [busyUpload, setBusyUpload] = useState(false)
          const fileRef = useRef(null)

          const flashError = (err) => {
            setError(err?.message || String(err))
            setNotice('')
          }

          const loadBases = useCallback(async (cursor = '', append = false) => {
            const data = await call('listBases', { cursor, limit: 20 })
            setBases((prev) => (append ? [...prev, ...data.list] : data.list))
            setBasesCursor(data.next_cursor || '')
            setBasesEnd(data.is_end)
            return data.list
          }, [])

          const boot = useCallback(async () => {
            setError('')
            setStatus('loading')
            try {
              const st = await call('status')
              if (!st.configured) {
                setStatus('unconfigured')
                return
              }
              const list = await loadBases()
              setBase((prev) => prev || list[0] || null)
              setStatus('ready')
            } catch (err) {
              flashError(err)
              setStatus('ready')
            }
          }, [loadBases])

          useEffect(() => {
            boot().catch(() => {})
          }, [boot])

          const loadDocs = useCallback(
            async ({ kbId, folderId, cursor = '', append = false }) => {
              setBusyDocs(true)
              try {
                const data = await call('listKnowledge', {
                  knowledge_base_id: kbId,
                  ...(folderId ? { folder_id: folderId } : {}),
                  cursor,
                  limit: 50,
                })
                setDocs((prev) => (append ? [...prev, ...data.list] : data.list))
                setDocsCursor(data.next_cursor || '')
                setDocsEnd(data.is_end)
                if (!append) setNav((prev) => ({ ...prev, path: data.current_path || [] }))
              } catch (err) {
                flashError(err)
              } finally {
                setBusyDocs(false)
              }
            },
            [],
          )

          // reload docs when base/folder changes
          useEffect(() => {
            if (status !== 'ready' || !base || section !== 'kb') return
            setDocs([])
            setDocsCursor('')
            setDocsEnd(true)
            loadDocs({ kbId: base.id, folderId: nav.folderId })
          }, [status, base, nav.folderId, loadDocs, section])

          const openFolder = (item) => {
            const id = folderIdOf(item)
            if (id) setNav({ folderId: id, path: nav.path })
          }
          const jumpTo = (index) => {
            // index -1 => root
            if (index < 0) setNav({ folderId: '', path: [] })
            else {
              const target = nav.path[index]
              setNav({ folderId: target?.folder_id || '', path: nav.path.slice(0, index + 1) })
            }
          }

          const [preview, setPreview] = useState(null) // {item, loading, data, error}

          const openDoc = (item) => {
            if (!item.media_id) return
            setError('')
            setNotice('')
            setPreview({ item, loading: true, data: null, error: '' })
            call('readDocument', { media_id: item.media_id })
              .then((data) => setPreview({ item, loading: false, data, error: '' }))
              .catch((err) => setPreview({ item, loading: false, data: null, error: err.message }))
          }

          // ---- notes --------------------------------------------------------
          const [notebooks, setNotebooks] = useState([])
          const [notesFolder, setNotesFolder] = useState('') // '' = all notes
          const [notes, setNotes] = useState([])
          const [notesCursor, setNotesCursor] = useState('')
          const [notesEnd, setNotesEnd] = useState(true)
          const [busyNotes, setBusyNotes] = useState(false)
          const [notePreview, setNotePreview] = useState(null) // {note, loading, data, error}
          const [noteTitle, setNoteTitle] = useState('')
          const [noteContent, setNoteContent] = useState('')
          const [appendText, setAppendText] = useState('')
          const [busyNote, setBusyNote] = useState(false)
          const [noteView, setNoteView] = useState('list') // 'list' | 'create'

          // notebooks are few — pull all pages up front
          const loadNotebooks = useCallback(async () => {
            const all = []
            let cursor = '0'
            for (let page = 0; page < 20; page++) {
              const data = await call('listNotebooks', { cursor, limit: 20 })
              all.push(...data.list)
              if (data.is_end) break
              cursor = data.next_cursor || '0'
            }
            setNotebooks(all)
          }, [])

          useEffect(() => {
            if (status !== 'ready' || section !== 'notes') return
            loadNotebooks().catch(flashError)
          }, [status, loadNotebooks, section])

          const loadNotes = useCallback(
            async ({ folderId, cursor = '', append = false }) => {
              setBusyNotes(true)
              try {
                const data = await call('listNotes', { folder_id: folderId, cursor, limit: 20 })
                setNotes((prev) => (append ? [...prev, ...data.list] : data.list))
                setNotesCursor(data.next_cursor || '')
                setNotesEnd(data.is_end)
              } catch (err) {
                flashError(err)
              } finally {
                setBusyNotes(false)
              }
            },
            [],
          )

          useEffect(() => {
            if (status !== 'ready' || section !== 'notes') return
            setNotes([])
            setNotesCursor('')
            setNotesEnd(true)
            setNotePreview(null)
            setNoteView('list')
            loadNotes({ folderId: notesFolder }).catch(() => {})
          }, [status, notesFolder, loadNotes, section])

          const openNote = (note) => {
            if (!note.note_id) return
            setError('')
            setNotice('')
            setAppendText('')
            setNotePreview({ note, loading: true, data: null, error: '' })
            call('readNote', { note_id: note.note_id })
              .then((data) => setNotePreview({ note, loading: false, data, error: '' }))
              .catch((err) => setNotePreview({ note, loading: false, data: null, error: err.message }))
          }

          const createNote = async () => {
            if (!noteContent.trim()) return
            setBusyNote(true)
            setError('')
            try {
              const title = noteTitle.trim()
              const nb = notebooks.find((x) => x.folder_id === notesFolder)
              const r = await call('createNote', {
                ...(notesFolder ? { folder_id: notesFolder, folder_name: nb?.name } : {}),
                ...(title ? { title } : {}),
                content: noteContent,
              })
              setNotice(t('note_created_ok'))
              setNoteTitle('')
              setNoteContent('')
              setNoteView('list')
              loadNotes({ folderId: notesFolder })
              if (r.note_id) openNote({ note_id: r.note_id, title })
            } catch (err) {
              flashError(err)
            } finally {
              setBusyNote(false)
            }
          }

          const appendToNote = async () => {
            if (!notePreview?.note || !appendText.trim()) return
            setBusyNote(true)
            setError('')
            try {
              await call('appendNote', { note_id: notePreview.note.note_id, content: appendText })
              setNotice(t('append_ok'))
              setAppendText('')
              const data = await call('readNote', { note_id: notePreview.note.note_id })
              setNotePreview((prev) => (prev ? { ...prev, data } : prev))
              loadNotes({ folderId: notesFolder })
            } catch (err) {
              flashError(err)
            } finally {
              setBusyNote(false)
            }
          }

          const doSearch = async (cursor = '', append = false) => {
            if (!base || !query.trim()) return
            setBusySearch(true)
            try {
              const data = await call('searchKnowledge', {
                knowledge_base_id: base.id,
                query: query.trim(),
                cursor,
              })
              setResults((prev) => (append && prev ? [...prev, ...data.list] : data.list))
              setResultsCursor(data.next_cursor || '')
              setResultsEnd(data.is_end)
            } catch (err) {
              flashError(err)
            } finally {
              setBusySearch(false)
            }
          }

          const readFileAsBase64 = (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onerror = () => reject(new Error('read failed'))
              reader.onload = () => {
                const url = String(reader.result)
                resolve(url.slice(url.indexOf(',') + 1))
              }
              reader.readAsDataURL(file)
            })

          const uploadText = async () => {
            if (!base || !textTitle.trim() || !textContent) return
            setBusyUpload(true)
            setError('')
            try {
              const r = await call('uploadText', {
                knowledge_base_id: base.id,
                ...(nav.folderId ? { folder_id: nav.folderId } : {}),
                title: textTitle.trim(),
                content: textContent,
              })
              setNotice(fmt(t('upload_ok'), { title: r.title }))
              setTextTitle('')
              setTextContent('')
              loadDocs({ kbId: base.id, folderId: nav.folderId })
            } catch (err) {
              flashError(err)
            } finally {
              setBusyUpload(false)
            }
          }

          const uploadFile = async (file) => {
            if (!base || !file) return
            setBusyUpload(true)
            setError('')
            try {
              const content_base64 = await readFileAsBase64(file)
              const r = await call('uploadFile', {
                knowledge_base_id: base.id,
                ...(nav.folderId ? { folder_id: nav.folderId } : {}),
                file_name: file.name,
                content_base64,
              })
              setNotice(fmt(t('upload_ok'), { title: r.title }))
              loadDocs({ kbId: base.id, folderId: nav.folderId })
            } catch (err) {
              flashError(err)
            } finally {
              setBusyUpload(false)
              if (fileRef.current) fileRef.current.value = ''
            }
          }

          const importUrls = async () => {
            const list = urls.split(/\n+/).map((s) => s.trim()).filter(Boolean)
            if (!base || !list.length) return
            setBusyUpload(true)
            setError('')
            try {
              const r = await call('importUrls', {
                knowledge_base_id: base.id,
                ...(nav.folderId ? { folder_id: nav.folderId } : {}),
                urls: list,
              })
              const ok = r.results.filter((x) => x.ok).length
              setNotice(fmt(t('import_results'), { ok, total: r.results.length }))
              setUrls('')
              loadDocs({ kbId: base.id, folderId: nav.folderId })
            } catch (err) {
              flashError(err)
            } finally {
              setBusyUpload(false)
            }
          }

          const clearCredentials = async () => {
            try {
              await call('clear')
            } finally {
              setStatus('unconfigured')
              setBases([])
              setBase(null)
              setDocs([])
              setResults(null)
              setNotebooks([])
              setNotes([])
              setNotePreview(null)
            }
          }

          // ---- render --------------------------------------------------------
          if (status === 'loading') {
            return e('div', { style: styles.page },
              e('div', { style: styles.inner }, e('div', { style: styles.muted }, t('loading'))))
          }
          if (status === 'unconfigured') {
            return e('div', { style: styles.page },
              e('div', { style: styles.inner }, e(SettingsView, { onSaved: boot })))
          }

          const baseName = base?.name || base?.title || base?.id || ''

          return e('div', { style: styles.page },
            e('div', { style: styles.inner },
              // ---- top-level section switcher: knowledge base / notes ----
              e('div', { style: styles.seg },
                ['kb', 'notes'].map((s) =>
                  e('button', {
                    key: s,
                    style: styles.segItem(section === s),
                    onClick: () => { setSection(s); setPreview(null); setNotePreview(null) },
                  }, t(`section_${s}`)))),
              error ? e('div', { style: { ...styles.errorBox, marginTop: 12 } }, error) : null,
              notice ? e('div', { style: { ...styles.okBox, marginTop: 12 } }, notice) : null,

              // ---- knowledge base section ----
              section === 'kb' && e(React.Fragment, null,
              e('div', { style: styles.headerRow },
                e('span', { style: styles.title }, t('panel')),
                e('select', {
                  style: { ...styles.input, width: 'auto', minWidth: 220 },
                  value: base?.id || '',
                  onChange: (ev) => {
                    const next = bases.find((b) => b.id === ev.target.value)
                    setBase(next || null)
                    setNav({ folderId: '', path: [] })
                    setResults(null)
                  },
                },
                  !base && e('option', { value: '' }, t('pick_base_placeholder')),
                  bases.map((b) =>
                    e('option', { key: b.id, value: b.id }, b.name || b.title || b.id))),
                !basesEnd && e('button', { style: styles.button, onClick: () => loadBases(basesCursor, true).catch(flashError) }, t('load_more')),
                e('div', { style: styles.grow }),
                e('button', { style: styles.button, onClick: () => base && loadDocs({ kbId: base.id, folderId: nav.folderId }) }, t('refresh')),
                e('button', { style: styles.button, onClick: clearCredentials }, t('clear_credentials')),
              ),
              base?.description && e('div', { style: { ...styles.muted, marginTop: 8, lineHeight: 1.6 } }, base.description),

              // in-panel document preview replaces the tab area
              preview
                ? e(PreviewView, { preview, onBack: () => setPreview(null) })
                : e(React.Fragment, null,

              // tabs
              e('div', { style: styles.tabs },
                ['browse', 'search', 'upload'].map((v) =>
                  e('button', {
                    key: v,
                    style: styles.tab(view === v),
                    onClick: () => setView(v),
                  }, t(`tab_${v}`)))),

              // browse
              view === 'browse' && e('div', null,
                e('div', { style: { ...styles.muted, marginBottom: 8 } },
                  e('span', { style: styles.crumb, onClick: () => jumpTo(-1) }, t('root')),
                  nav.path.map((p, i) =>
                    e('span', { key: p.folder_id || i },
                      ' / ',
                      e('span', { style: styles.crumb, onClick: () => jumpTo(i) },
                        p.name || p.folder_name || p.folder_id)))),
                e('div', { style: styles.card },
                  docs.length === 0 && !busyDocs
                    ? e('div', { style: { ...styles.muted, padding: 8 } }, t('empty_list'))
                    : docs.map((item, i) =>
                        e(DocRow, {
                          key: item.media_id || item.folder_id || i,
                          item,
                          onOpenFolder: openFolder,
                          onOpenDoc: openDoc,
                        })),
                  busyDocs && e('div', { style: { ...styles.muted, padding: 8 } }, t('loading'))),
                !docsEnd && e('button', {
                  style: styles.button,
                  disabled: busyDocs,
                  onClick: () => base && loadDocs({ kbId: base.id, folderId: nav.folderId, cursor: docsCursor, append: true }),
                }, t('load_more')),
              ),

              // search
              view === 'search' && e('div', null,
                e('div', { style: { display: 'flex', gap: 8, marginBottom: 12 } },
                  e('input', {
                    style: { ...styles.input, flex: 1 },
                    value: query,
                    placeholder: fmt(t('search_placeholder'), { name: baseName }),
                    onChange: (ev) => setQuery(ev.target.value),
                    onKeyDown: (ev) => ev.key === 'Enter' && doSearch(),
                  }),
                  e('button', { style: styles.primary, disabled: busySearch || !base, onClick: () => doSearch() },
                    busySearch ? t('loading') : t('search_button'))),
                results === null
                  ? e('div', { style: styles.muted }, t('search_empty_hint'))
                  : results.length === 0
                    ? e('div', { style: styles.muted }, t('no_results'))
                    : e('div', { style: styles.card },
                        results.map((item, i) =>
                          e('div', { key: item.media_id || item.folder_id || i, style: { padding: '8px 4px', borderBottom: `1px solid ${C.border}` } },
                            e('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                              e('span', {
                                style: { flex: 1, cursor: 'pointer', fontWeight: 600 },
                                onClick: () => {
                                  if (isFolderItem(item)) {
                                    openFolder(item)
                                    setView('browse')
                                  } else {
                                    openDoc(item)
                                  }
                                },
                              }, itemTitle(item)),
                              e('span', { style: styles.badge }, itemType(item))),
                            item.highlight_content
                              ? e('div', { style: { ...styles.muted, marginTop: 4, lineHeight: 1.6 } }, item.highlight_content)
                              : null))),
                results && !resultsEnd && e('button', {
                  style: styles.button,
                  disabled: busySearch,
                  onClick: () => doSearch(resultsCursor, true),
                }, t('load_more')),
              ),

              // upload
              view === 'upload' && e('div', null,
                e('div', { style: { ...styles.muted, marginBottom: 12 } },
                  `${t('pick_base')}: ${baseName}${nav.path.length ? ' / ' + nav.path.map((p) => p.name || p.folder_name).join(' / ') : ''}`),
                e('div', { style: styles.card },
                  e('div', { style: { fontWeight: 650, marginBottom: 8 } }, t('upload_text_title')),
                  e('input', {
                    style: { ...styles.input, marginBottom: 8 },
                    value: textTitle,
                    placeholder: t('upload_text_title_placeholder'),
                    onChange: (ev) => setTextTitle(ev.target.value),
                  }),
                  e('textarea', {
                    style: styles.textarea,
                    value: textContent,
                    placeholder: t('upload_text_content_placeholder'),
                    onChange: (ev) => setTextContent(ev.target.value),
                  }),
                  e('div', { style: { marginTop: 8 } },
                    e('button', {
                      style: styles.primary,
                      disabled: busyUpload || !base || !textTitle.trim() || !textContent,
                      onClick: uploadText,
                    }, busyUpload ? t('uploading') : t('upload_text_button')))),
                e('div', { style: styles.card },
                  e('div', { style: { fontWeight: 650, marginBottom: 8 } }, t('upload_file_title')),
                  e('div', { style: { ...styles.muted, marginBottom: 8 } }, t('upload_file_hint')),
                  e('input', {
                    ref: fileRef,
                    type: 'file',
                    style: { display: 'none' },
                    onChange: (ev) => uploadFile(ev.target.files && ev.target.files[0]),
                  }),
                  e('button', {
                    style: styles.primary,
                    disabled: busyUpload || !base,
                    onClick: () => fileRef.current && fileRef.current.click(),
                  }, busyUpload ? t('uploading') : t('upload_file_button'))),
                e('div', { style: styles.card },
                  e('div', { style: { fontWeight: 650, marginBottom: 8 } }, t('upload_url_title')),
                  e('textarea', {
                    style: { ...styles.textarea, minHeight: 80 },
                    value: urls,
                    placeholder: t('upload_url_placeholder'),
                    onChange: (ev) => setUrls(ev.target.value),
                  }),
                  e('div', { style: { marginTop: 8 } },
                    e('button', {
                      style: styles.primary,
                      disabled: busyUpload || !base || !urls.trim(),
                      onClick: importUrls,
                    }, busyUpload ? t('uploading') : t('upload_url_button')))),
              ),

                ), // end kb content fragment
              ), // end kb section

              // ---- notes section ----
              section === 'notes' && e(React.Fragment, null,
                e('div', { style: { ...styles.headerRow, marginTop: 14 } },
                  e('span', { style: styles.title }, t('section_notes')),
                  e('select', {
                    style: { ...styles.input, width: 'auto', minWidth: 200 },
                    value: notesFolder,
                    onChange: (ev) => setNotesFolder(ev.target.value),
                  },
                    e('option', { value: '' }, t('all_notes')),
                    notebooks.map((nb) =>
                      e('option', { key: nb.folder_id, value: nb.folder_id },
                        nb.name + (nb.note_number != null ? ` (${nb.note_number})` : '')))),
                  e('div', { style: styles.grow }),
                  e('button', {
                    style: styles.primary,
                    onClick: () => setNoteView('create'),
                  }, t('create_note_button')),
                  e('button', {
                    style: styles.button,
                    disabled: busyNotes,
                    onClick: () => loadNotes({ folderId: notesFolder }).catch(flashError),
                  }, t('refresh'))),
                notePreview
                  ? e(NotePreviewView, {
                      preview: notePreview,
                      appendText,
                      busyAppend: busyNote,
                      onAppendText: setAppendText,
                      onAppend: appendToNote,
                      onBack: () => setNotePreview(null),
                    })
                  : noteView === 'create'
                    ? e(CreateNoteView, {
                        notebooks,
                        folderId: notesFolder,
                        onFolderChange: setNotesFolder,
                        title: noteTitle,
                        onTitleChange: setNoteTitle,
                        content: noteContent,
                        onContentChange: setNoteContent,
                        busy: busyNote,
                        onCreate: createNote,
                        onBack: () => setNoteView('list'),
                      })
                    : e(React.Fragment, null,
                e('div', { style: { ...styles.card, marginTop: 14 } },
                  notes.length === 0 && !busyNotes
                    ? e('div', { style: { ...styles.muted, padding: 8 } }, t('empty_list'))
                    : notes.map((n, i) => e(NoteRow, { key: n.note_id || i, note: n, onOpen: openNote })),
                  busyNotes && e('div', { style: { ...styles.muted, padding: 8 } }, t('loading'))),
                !notesEnd && notesCursor && e('button', {
                  style: { ...styles.button, marginBottom: 12 },
                  disabled: busyNotes,
                  onClick: () => loadNotes({ folderId: notesFolder, cursor: notesCursor, append: true }),
                }, t('load_more')),
                ), // end notes content fragment
              ), // end notes section
            ))
        }

        // ---- slot registrations --------------------------------------------
        ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, KnowledgePage))

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: PANEL_ID,
              order: 30,
              locale: NS,
              label: () => t('panel'),
            },
            ImaIcon,
          ))
      },
    }
  },
})
