/**
 * 定义应用的主题
 * 提供亮色和暗色主题配置
 */

const lightTheme = {
  name: 'light',
  type: 'light',
  colors: {
    // 基础颜色
    primary: '#6366f1', // 主色
    secondary: '#8b5cf6', // 次要色
    accent: '#ec4899', // 强调色
    
    // 背景颜色
    background: '#ffffff', // 主背景
    paperBg: '#f9fafb', // 卡片背景
    
    // 文本颜色
    textPrimary: '#1f2937', // 主要文本
    textSecondary: '#4b5563', // 次要文本
    textDisabled: '#9ca3af', // 禁用文本
    
    // 边框颜色
    border: '#e5e7eb', // 常规边框
    divider: '#f3f4f6', // 分隔线
    
    // 消息气泡
    userBubbleBg: '#dcfce7', // 用户消息气泡背景
    userBubbleText: '#166534', // 用户消息文本
    charBubbleBg: '#eff6ff', // AI消息气泡背景
    charBubbleText: '#1e40af', // AI消息文本
    charBubbleBorder: '#dbeafe', // AI消息边框
    systemBubbleBg: '#f3f4f6', // 系统消息气泡背景
    systemBubbleText: '#4b5563', // 系统消息文本
    
    // 头像
    avatarBg: '#8b5cf6', // AI头像背景
    avatarText: '#ffffff', // AI头像文本
    userAvatarBg: '#10b981', // 用户头像背景
    userAvatarText: '#ffffff', // 用户头像文本
    
    // 表格样式
    tableHeaderBg: '#f9fafb', // 表格头部背景
    tableHeaderText: '#4b5563', // 表格头部文本
    tableBodyBg: '#ffffff', // 表格主体背景
    tableBodyAltBg: '#f9fafb', // 表格交替行背景
    tableBodyText: '#4b5563', // 表格主体文本
    tableBorder: '#e5e7eb', // 表格边框
    
    // 特殊块样式
    specialBlockBorder: '#e5e7eb', // 特殊块边框
    specialBlockDefaultHeaderBg: '#6B7280', // 默认特殊块头部背景
    specialBlockDefaultHeaderText: '#FFFFFF', // 默认特殊块头部文本
    specialBlockDefaultContentBg: '#f9fafb', // 默认特殊块内容背景
    specialBlockDefaultContentText: '#1f2937', // 默认特殊块内容文本
    codeBlockContentBg: '#f8f8f8',
    codeBlockContentText: '#333333', // 代码块内容文本
    
    // 内联代码样式
    inlineCodeBg: '#f3f4f6', // 内联代码背景
    inlineCodeText: '#ef4444', // 内联代码文本
    
    // 其他元素
    senderNameText: '#4b5563', // 发送者名称文本
    timestampText: '#9ca3af', // 时间戳文本
    
    // 设置面板
    settingsPanelBg: '#f9fafb', // 设置面板背景
    settingsBorder: '#e5e7eb', // 设置面板边框
    settingsTextColor: '#4b5563', // 设置面板文本
    iconDefault: '#4b5563', // 默认图标颜色
    iconActive: '#6366f1', // 激活图标颜色
    buttonPrimaryText: '#ffffff', // 主按钮文本
    
    // 元数据部分
    metadataSectionBg: '#f9fafb', // 元数据部分背景
    metadataText: '#4b5563', // 元数据文本
    metadataHeader: '#1f2937', // 元数据标题
    metadataInfoBoxBg: '#ffffff', // 元数据信息框背景
    quoteTextColor: '#8b5cf6', // 引用文本颜色
    shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' // 阴影
  }
};

const darkTheme = {
  name: 'dark',
  type: 'dark',
  colors: {
    // 基础颜色
    primary: '#818cf8', // 主色
    secondary: '#a78bfa', // 次要色
    accent: '#f472b6', // 强调色
    
    // 背景颜色
    background: '#111827', // 主背景
    paperBg: '#1f2937', // 卡片背景
    
    // 文本颜色
    textPrimary: '#f9fafb', // 主要文本
    textSecondary: '#e5e7eb', // 次要文本
    textDisabled: '#6b7280', // 禁用文本
    
    // 边框颜色
    border: '#374151', // 常规边框
    divider: '#1f2937', // 分隔线
    
    // 消息气泡
    userBubbleBg: '#065f46', // 用户消息气泡背景
    userBubbleText: '#d1fae5', // 用户消息文本
    charBubbleBg: '#1e3a8a', // AI消息气泡背景
    charBubbleText: '#dbeafe', // AI消息文本
    charBubbleBorder: '#1e40af', // AI消息边框
    systemBubbleBg: '#1f2937', // 系统消息气泡背景
    systemBubbleText: '#e5e7eb', // 系统消息文本
    
    // 头像
    avatarBg: '#7c3aed', // AI头像背景
    avatarText: '#ffffff', // AI头像文本
    userAvatarBg: '#059669', // 用户头像背景
    userAvatarText: '#ffffff', // 用户头像文本
    
    // 表格样式
    tableHeaderBg: '#374151', // 表格头部背景
    tableHeaderText: '#f3f4f6', // 表格头部文本
    tableBodyBg: '#1f2937', // 表格主体背景
    tableBodyAltBg: '#111827', // 表格交替行背景
    tableBodyText: '#e5e7eb', // 表格主体文本
    tableBorder: '#4b5563', // 表格边框
    
    // 特殊块样式
    specialBlockBorder: '#4b5563', // 特殊块边框
    specialBlockDefaultHeaderBg: '#374151', // 默认特殊块头部背景
    specialBlockDefaultHeaderText: '#f3f4f6', // 默认特殊块头部文本
    specialBlockDefaultContentBg: '#1f2937', // 默认特殊块内容背景
    specialBlockDefaultContentText: '#e5e7eb', // 默认特殊块内容文本
    codeBlockContentBg: '#1e293b', // 代码块内容背景
    codeBlockContentText: '#e2e8f0',
    
    // 内联代码样式
    inlineCodeBg: '#2d3748', // 内联代码背景
    inlineCodeText: '#f87171', // 内联代码文本
    
    // 其他元素
    senderNameText: '#e5e7eb', // 发送者名称文本
    timestampText: '#6b7280', // 时间戳文本
    
    // 设置面板
    settingsPanelBg: '#1f2937', // 设置面板背景
    settingsBorder: '#374151', // 设置面板边框
    settingsTextColor: '#e5e7eb', // 设置面板文本
    iconDefault: '#9ca3af', // 默认图标颜色
    iconActive: '#818cf8', // 激活图标颜色
    buttonPrimaryText: '#ffffff', // 主按钮文本
    
    // 元数据部分
    metadataSectionBg: '#1f2937', // 元数据部分背景
    metadataText: '#e5e7eb', // 元数据文本
    metadataHeader: '#f9fafb', // 元数据标题
    metadataInfoBoxBg: '#111827', // 元数据信息框背景
    quoteTextColor: '#a78bfa', // 引用文本颜色
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)' // 阴影
  }
};

// 默认主题
const defaultTheme = lightTheme;

// 可用主题映射
const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export {
  defaultTheme,
  themes,
  lightTheme,
  darkTheme
}; 