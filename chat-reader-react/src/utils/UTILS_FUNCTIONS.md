# 工具函数说明文档

本文档提供了项目中所有工具函数的详细说明。

## 格式化工具 (`utils/formatting/`)

（已迁移到专门组件和工具中）

## 渲染工具 (`utils/rendering/`)

### contentRenderer.js
- `renderContent(parsedMessage, options)`: 渲染解析后的消息内容,包括特殊块
- `renderTextContent(content)`: 渲染普通文本内容,支持基本Markdown语法

### specialBlockRenderer.js
- `renderCodeBlock(language, codeContent, colors, activeTheme)`: 渲染代码块
- `renderDetailsBlock(title, content, colors, activeTheme)`: 渲染详情块
- `renderInlineCode(inlineCode, colors, activeTheme)`: 渲染内联代码
- `renderStatusBlock(type, title, content, colors, activeTheme)`: 渲染状态块
- `renderOptionsBlock(title, options, colors, activeTheme)`: 渲染选项块

### tableRenderer.js
- `renderTables(tables, tableHeaders, colors, activeTheme)`: 渲染多个表格
- `renderSingleTable(tableId, rows, tableHeaders, colors, activeTheme)`: 渲染单个表格

## 解析工具 (`utils/parsing/`)

### messageParser.js
- `parseMessage(message)`: 解析消息内容,提取特殊块和文本
- `parseStatusBlock(content)`: 解析状态块内容
- `parseOptionsBlock(content)`: 解析选项块内容

### contentParser.js
- `parseMessageContent(content)`: 将内容分割为文本块和特殊块对象
- `parseCodeBlock(content)`: 解析代码块内容
- `parseTableContent(content)`: 解析表格内容
- `parseOptionsContent(content)`: 解析选项内容

## 辅助工具 (`utils/helpers/`)

### sanitize.js
- `sanitizeHtml(html)`: HTML内容净化工具,防止XSS攻击

## 表格工具 (`utils/tableUtils.js`)

- `parseTableRowData(dataString)`: 解析表格行数据
- `normalizeTableData(data)`: 标准化表格数据格式

## 图像工具 (`utils/imageGenerator.js`)

- `generateImage(prompt)`: 根据提示生成图像
- `processImage(imageData)`: 处理图像数据

## 导出工具 (`utils/messageFormatters.js`)

此文件导出了需要在多处使用的工具函数：
- 重导出特殊块组件工厂函数 `createSpecialBlock`
- 重导出渲染工具中的各种渲染函数
- 提供时间格式化工具 `formatTimestamp`

## 其他工具

### tampermonkeyPolyfill.js
- 提供Tampermonkey扩展兼容层 