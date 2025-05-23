# chat-reader-react

一个用于阅读和展示聊天记录的React应用，支持各种特殊内容块的渲染和交互。

## 项目概述

chat-reader-react是一个专门用于展示聊天记录的React应用，它支持丰富的内容格式，包括代码块、表格、可折叠详情等。项目使用了React 18和Tailwind CSS进行构建，采用了模块化的设计模式，以提高代码的可维护性和扩展性。

## 核心功能

- 展示聊天记录，包括用户和AI的消息
- 支持多种特殊内容块的渲染：
  - 代码块（支持语法高亮）
  - 表格（支持排序和过滤）
  - 可折叠详情
  - 状态消息（信息、成功、警告、错误）
  - 选项列表
- 支持浅色/深色主题切换
- 支持图像设置和优化
- 支持文件加载和保存

## 项目结构

项目源码结构已按功能领域组织，详细说明请查看各目录下的文档：

- [目录结构概览](./src/DIRECTORY_STRUCTURE.md) - 包含整体目录结构说明
- [组件说明](./src/components/COMPONENTS.md) - 详细介绍React组件
- [工具函数说明](./src/utils/UTILS_FUNCTIONS.md) - 详细介绍工具函数

## 技术栈

- React 18.3.1
- Tailwind CSS 4.1.6
- DOMPurify（内容安全）
- 其他依赖库...

## 开发指南

### 安装依赖

```bash
cd chat-reader-react
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 重构进度

本项目正在进行重构以提高代码质量和可维护性。详细的重构计划和进度请查看[重构计划](../plan.md)文档。

## 贡献指南

欢迎贡献代码和提出建议。请遵循以下原则：

1. 使用Tailwind CSS进行样式开发
2. 遵循模块化和组件化的设计原则
3. 为新功能编写必要的文档
4. 保持代码的可测试性

## 许可证

[MIT许可证](LICENSE)
