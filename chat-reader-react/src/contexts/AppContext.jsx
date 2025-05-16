import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { themes } from '../themes';

// 创建Context
const AppContext = createContext(null);

// 自定义Hook - 单独导出以防止Fast Refresh问题
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// 创建Provider组件
export function AppProvider({ children }) {
  // 主题状态
  const [activeTheme, setActiveTheme] = useState(themes.light);
  const [fontSize, setFontSize] = useState(1); // 默认字体大小为 1rem
  const [paragraphSpacing, setParagraphSpacing] = useState(1.5);
  
  // 文件相关状态
  const [messages, setMessages] = useState([]);
  const [filename, setFilename] = useState('');
  const [fileLoaded, setFileLoaded] = useState(false);
  
  // 全局配置
  const [config, setConfig] = useState({
    showImageGeneration: true,
    showTableEdit: true,
    showStatusBlock: true,
    showDetailsBlock: true,
    showOptionsBlock: true,
    showCodeBlock: true
  });

  // 切换主题 - 修复函数逻辑
  const toggleTheme = useCallback((themeName) => {
    if (themeName && typeof themeName === 'string' && themes[themeName]) {
      setActiveTheme(themes[themeName]);
    } else {
      // 如果没有提供有效的主题名称，则切换明暗模式
      setActiveTheme(prevTheme => 
        prevTheme.type === 'light' ? themes.dark : themes.light
      );
    }
  }, []);

  const value = {
    // 主题相关
    activeTheme,
    toggleTheme,
    // 字体相关
    fontSize,
    setFontSize,
    // 段落间距
    paragraphSpacing,
    setParagraphSpacing,
    // 文件相关
    messages,
    setMessages,
    filename,
    setFilename,
    fileLoaded,
    setFileLoaded,
    // 配置相关
    config,
    setConfig
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// PropTypes
AppProvider.propTypes = {
  children: PropTypes.node.isRequired
}; 