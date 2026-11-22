# ima 知识库（dsh-ima-knowledge）

将腾讯 ima 知识库接入 DeepSeek Harness。

## 功能

- **可视化浏览**：侧边栏新增「ima 知识库」面板，列出你的知识库，逐级浏览文件夹与文档，支持翻页与面包屑导航。
- **搜索**：在指定知识库内按关键词搜索文档（含高亮摘要），或按名称搜索知识库。
- **查看原文**：一键获取文档的原文链接并在浏览器中打开；知识库中的 ima 笔记直接返回纯文本正文。
- **笔记**：面板「笔记」页签浏览笔记本与笔记、预览正文、新建 Markdown 笔记、向笔记末尾追加内容。
- **上传内容**：
  - 上传本地文件（PDF / Word / PPT / Excel / Markdown / TXT / 图片 / 音频等）
  - 将一段文本保存为 Markdown 文档
  - 批量导入网页或微信公众号文章链接
- **Agent 工具**：任何会话中的模型都可以直接调用 `ima_*` 工具，在分析、写作、研究类任务里引用知识库内容：
  - `ima_list_knowledge_bases` / `ima_search_knowledge_bases` — 列出 / 搜索知识库
  - `ima_list_documents` / `ima_search_documents` — 浏览 / 搜索文档
  - `ima_read_document` — 读取文档原文（文本类直接返回内容，二进制返回访问链接，笔记返回纯文本）
  - `ima_upload_text` / `ima_upload_file` — 上传文本或本地文件
  - `ima_import_urls` — 导入网页链接
  - `ima_list_notebooks` / `ima_list_notes` — 列出笔记本 / 笔记
  - `ima_read_note` — 读取笔记正文（纯文本）
  - `ima_create_note` / `ima_append_note` — 新建 Markdown 笔记 / 向笔记末尾追加内容（笔记 API 不支持替换或删除已有内容）

## 配置

1. 打开 https://ima.qq.com/agent-interface 申请 OpenAPI 凭证（Client ID 与 API Key）。
2. 在「ima 知识库」面板的设置页填入并保存。凭证存储在 DSH 凭据库中（`ima-knowledge/openapi`），不会写入配置文件。

## 接口说明

插件通过 ima 官方 OpenAPI（`https://ima.qq.com/openapi/wiki/v1`）工作，全部请求由 Host 侧发起，浏览器界面通过本机 `/ima-api` 路由与 Host 通信。
