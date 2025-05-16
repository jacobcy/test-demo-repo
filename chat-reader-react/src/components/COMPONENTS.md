# 组件说明文档

本文档提供了项目中所有React组件的详细说明。

## 主要组件

### Message.jsx
消息展示组件,负责渲染单条消息。

**Props:**
- `message`: 消息对象,包含内容、发送者等信息
- `characterName`: 角色名称
- `userName`: 用户名称
- `activeTheme`: 当前主题
- `fontSize`: 字体大小
- `tableHeaders`: 表格头部定义
- `showImageGeneration`: 是否显示图片生成
- `showTableEdit`: 是否显示表格编辑
- `showStatusBlock`: 是否显示状态块
- `showDetailsBlock`: 是否显示详情块
- `showOptionsBlock`: 是否显示选项块
- `showCodeBlock`: 是否显示代码块

**渲染流程:**
1. 使用`messageParser.js`中的`parseMessage`解析消息文本
2. 使用`contentRenderer.js`中的`renderContent`渲染解析后的内容
3. 对于`status_block`和`options`属性,使用对应的React组件直接渲染

### ChatDisplay.jsx
聊天消息列表组件,负责渲染整个聊天界面。

**Props:**
- `chatData`: 聊天数据对象
- `activeTheme`: 当前主题
- `changeTheme`: 主题切换函数
- `fontSize`: 字体大小
- `setFontSize`: 设置字体大小
- `paragraphSpacing`: 段落间距
- `setParagraphSpacing`: 设置段落间距
- `messages`: 消息列表
- `colors`: 颜色配置

### HeaderTools.jsx
页面头部工具栏组件。

**Props:**
- `onThemeChange`: 主题切换回调
- `onFontSizeChange`: 字体大小调整回调
- `onParagraphSpacingChange`: 段落间距调整回调

## 特殊块组件 (`special-blocks/`)

### CodeBlock.jsx
代码块展示组件。

**Props:**
- `language`: 代码语言
- `content`: 代码内容
- `colors`: 颜色配置
- `fontSize`: 字体大小

### TableBlock.jsx
表格展示组件。

**Props:**
- `data`: 表格数据
- `headers`: 表格头部
- `colors`: 颜色配置

### DetailsBlock.jsx
详情块展示组件。

**Props:**
- `title`: 详情块标题
- `content`: 详情块内容
- `colors`: 颜色配置

### StatusBlock.jsx
状态块展示组件。

**Props:**
- `type`: 状态类型(info/success/warning/error)
- `title`: 状态块标题
- `content`: 状态块内容
- `colors`: 颜色配置

### OptionsBlock.jsx
选项块展示组件。

**Props:**
- `title`: 选项块标题
- `content`: 选项列表
- `colors`: 颜色配置

## 模态框组件

### TableModal.jsx
表格编辑模态框。

**Props:**
- `show`: 是否显示
- `onClose`: 关闭回调
- `tableData`: 表格数据
- `tableHeaders`: 表格头部定义

### ImageSettingsModal.jsx
图片设置模态框。

**Props:**
- `show`: 是否显示
- `onClose`: 关闭回调
- `settings`: 图片设置
- `onSettingsChange`: 设置变更回调

### FileLoader.jsx
文件加载组件：
- 处理文件上传和加载逻辑
- 支持多种文件格式的处理
- 启动时自动尝试从 public/processed_chat.json 加载默认聊天数据
- 如默认文件不存在，则显示文件上传界面 