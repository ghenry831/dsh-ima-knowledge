# dsh-ima-knowledge

在 [DeepSeek Harness](https://github.com/deepseek-ai) (DSH) 中接入腾讯 **ima 知识库**的插件：浏览、搜索、读取、上传知识库文档，全部在 DSH 内完成。

## 功能

- **可视化面板**：左侧栏「ima 知识库」入口，支持知识库切换、文件夹浏览（面包屑）、关键词搜索、面板内文档预览（Markdown/TXT 正文、网页/微信文章沙箱渲染、PDF 内嵌查看、图片直显）
- **上传**：粘贴文本生成 Markdown 文档、上传本地文件（pdf/word/ppt/excel/图片/音频/xmind 等）、导入网页与微信公众号文章 URL
- **Agent 工具**：8 个 `ima_*` 工具（列库、搜库、列文档、搜文档、读原文、传文本、传文件、导 URL），任何 DSH 会话都可以直接让 agent 读写知识库
- **凭证安全**：Client ID / API Key 存储在 DSH profile 的凭据存储中，不落盘到插件目录，不随安装介质分发

## 安装

1. 下载 release 中的 `local-dsh-ima-knowledge-*.tgz`（或本仓库 `npm pack` 自行打包）
2. 在 DSH 对话中让 agent 执行：
   > 用 plugin_manager 安装 `/路径/local-dsh-ima-knowledge-x.y.z.tgz`
3. 刷新 GUI 页面，打开左侧栏「ima 知识库」面板，在设置页填入 Client ID 与 API Key

凭证在 <https://ima.qq.com/agent-interface> 申请。

## 结构

```
index.js          Host 端：ima OpenAPI 客户端、COS 直传签名、HTTP 桥（/ima-api）、8 个 agent 工具
client.js         Client 端：React 面板（浏览/搜索/上传/预览/设置）
locale/           中英文案
cordis.patch.yml  bundle 清单
docs/DETAIL.md    插件详情页说明
```

## 参考

- ima OpenAPI：`https://ima.qq.com/openapi/wiki/v1`
- 上传链路：create_media → COS PUT 直传（HMAC-SHA1 签名）→ add_knowledge
