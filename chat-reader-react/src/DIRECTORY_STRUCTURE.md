# chat-reader-react 项目目录结构

## 根目录结构

```
src/
├── assets/         - 静态资源文件（字体等）
├── components/     - React组件
│   └── special-blocks/ - 特殊块组件
├── utils/          - 工具函数
│   ├── helpers/    - 通用辅助函数
│   ├── parsing/    - 解析相关工具
│   └── rendering/  - 渲染相关工具
├── App.jsx         - 主应用组件
├── App.css         - 应用样式（使用Tailwind简化）
├── index.css       - 全局样式和Tailwind指令
├── main.jsx        - 应用入口
└── themes.js       - 主题配置
```

## 组件目录 (`components/`)

- `ChatDisplay.jsx` - 聊天显示主组件
- `Message.jsx` - 单条消息渲染组件（重构完成）
- `TableModal.jsx` - 表格弹窗组件
- `ImageSettingsModal.jsx` - 图像设置弹窗
- `HeaderTools.jsx` - 页面头部工具组件
- `ChatPDF.jsx` - PDF聊天展示组件
- `FileLoader.jsx` - 文件加载组件
- `COMPONENTS.md` - 组件说明文档

### 特殊块组件 (`components/special-blocks/`)

- `index.js` - 导出所有特殊块组件的统一接口，包含createSpecialBlock工厂函数
- `CodeBlock.jsx` - 代码块组件
- `TableBlock.jsx` - 表格块组件
- `DetailsBlock.jsx` - 详情块组件
- `StatusBlock.jsx` - 状态块组件
- `OptionsBlock.jsx` - 选项块组件

## 工具函数目录 (`utils/`)

### 辅助函数 (`utils/helpers/`)

- `sanitize.js` - DOMPurify封装，用于内容净化

### 解析相关 (`utils/parsing/`)

- `contentParser.js` - 内容解析工具
- `messageParser.js` - 消息解析工具（重构完成）

### 渲染相关 (`utils/rendering/`)

- `contentRenderer.js` - 内容渲染工具（重构完成）
- `specialBlockRenderer.js` - 特殊块渲染工具
- `tableRenderer.js` - 表格渲染工具

### 其他工具函数

- `messageFormatters.js` - 消息格式化函数导出（重构完成）
- `imageGenerator.js` - 图像生成工具
- `tableUtils.js` - 表格处理工具
- `tampermonkeyPolyfill.js` - Tampermonkey扩展兼容层
- `UTILS_FUNCTIONS.md` - 工具函数说明文档 