# dsh-ima-knowledge

在 [DeepSeek Harness](https://github.com/deepseek-ai) (DSH) 中接入腾讯 **ima 知识库**的插件：浏览、搜索、读取、上传知识库文档，全部在 DSH 内完成。

## 功能

- **可视化面板**：左侧栏「ima 知识库」入口，支持知识库切换、文件夹浏览（面包屑）、关键词搜索、面板内文档预览（Markdown/TXT 正文、网页/微信文章沙箱渲染、PDF 内嵌查看、图片直显）
- **笔记**：面板「笔记」页签支持列出笔记本与笔记、面板内预览笔记正文（纯文本）、新建笔记（Markdown）、向笔记末尾追加内容；知识库中的笔记条目也能直接读取正文
- **上传**：粘贴文本生成 Markdown 文档、上传本地文件（pdf/word/ppt/excel/图片/音频/xmind 等）、导入网页与微信公众号文章 URL
- **Agent 工具**：13 个 `ima_*` 工具（列库、搜库、列文档、搜文档、读原文、传文本、传文件、导 URL、列笔记本、列笔记、读笔记、建笔记、追加笔记），任何 DSH 会话都可以直接让 agent 读写知识库与笔记
- **凭证安全**：Client ID / API Key 存储在 DSH profile 的凭据存储中，不落盘到插件目录，不随安装介质分发

## 安装

1. 下载 release 中的 `local-dsh-ima-knowledge-*.tgz`（或本仓库 `npm pack` 自行打包）
2. 在 DSH 对话中让 agent 执行：
   > 用 plugin_manager 安装 `/路径/local-dsh-ima-knowledge-x.y.z.tgz`
3. 刷新 GUI 页面，打开左侧栏「ima 知识库」面板，在设置页填入 Client ID 与 API Key

凭证在 <https://ima.qq.com/agent-interface> 申请。

## PDF 正文提取依赖

读取 PDF 时，插件会尝试提取正文而不是只给下载链接。为正确处理中文 CID 字体与扫描件以外的文本层，它依赖 Python 的 **PyMuPDF**：

- 需要本机有 `python3`（或 `python`）
- 首次读取 PDF 时，若检测不到 `fitz`（PyMuPDF），插件会**自动尝试安装**：`pip install pymupdf`（先全局，再 `--user`）
- 只有安装失败（如网络不通、无 pip 权限）时才回退到内置的纯 JS 提取器——它只处理「literal-string 文本层」PDF，对中文 CID 字体或扫描件可能提取不到正文

想手动预装：

```bash
pip3 install pymupdf
```

> 扫描件 / 纯图片 PDF 没有文本层，任何提取器都取不到正文，此时插件会返回原文下载链接，可自行 OCR。

## 结构

```
index.js          Host 端：ima OpenAPI 客户端（wiki/v1 + note/v1）、COS 直传签名、HTTP 桥（/ima-api）、13 个 agent 工具
client.js         Client 端：React 面板（浏览/搜索/上传/预览/设置）
locale/           中英文案
cordis.patch.yml  bundle 清单
docs/DETAIL.md    插件详情页说明
```

## 参考

- ima OpenAPI：`https://ima.qq.com/openapi/wiki/v1`
- 上传链路：create_media → COS PUT 直传（HMAC-SHA1 签名）→ add_knowledge
