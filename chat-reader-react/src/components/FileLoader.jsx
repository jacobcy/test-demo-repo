import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import PropTypes from 'prop-types';
import { filterProblematicContent } from '../utils/parsing/messageParser';

function FileLoader({ onFileLoaded = () => {} }) {
  const { activeTheme, setMessages, setFilename, fileLoaded, setFileLoaded } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 使用其他组件引入的过滤函数，如果不可用则定义一个本地版本
  const filterContent = filterProblematicContent || ((content) => {
    if (!content) return '';
    try {
      // 简化版的过滤逻辑
      let filtered = content;
      
      // 移除<thinking>标签及其内容
      filtered = filtered.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
      
      // 移除其他可能导致解析问题的标签
      ['script', 'style', 'thinking', 'dataTable', 'analyze'].forEach(tag => {
        const tagRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
        filtered = filtered.replace(tagRegex, '');
      });
      
      return filtered.trim();
    } catch (error) {
      console.error('简化过滤内容出错:', error);
      return content;
    }
  });

  // 在处理消息时应用过滤
  const sanitizeMessage = (message) => {
    if (!message) return message;
    
    // 确保mes字段存在并是字符串
    if (message.mes && typeof message.mes === 'string') {
      // 应用过滤函数
      message.mes = filterContent(message.mes);
      
      // 消息内容过长时截断
      if (message.mes.length > 50000) {
        message.mes = message.mes.substring(0, 50000) + "... (内容过长已截断)";
      }
    }
    
    return message;
  };

  // 安全的JSON解析函数
  const safeJsonParse = (jsonString) => {
    try {
      // 首先尝试直接解析
      return JSON.parse(jsonString);
    } catch (initialError) {
      console.warn("标准JSON解析失败，尝试修复...", initialError);
      
      try {
        // 第二次尝试：清理可能导致解析问题的字符
        const cleanedJsonString = jsonString
          .replace(/[\u0000-\u0019]+/g, "") // 移除控制字符
          .replace(/\\(?!["\\/bfnrt])/g, "\\\\"); // 转义反斜杠
        return JSON.parse(cleanedJsonString);
      } catch (secondError) {
        console.error("JSON修复解析失败", secondError);
        throw new Error(`无法解析JSON: ${secondError.message}`);
      }
    }
  };

  // 预处理消息数据，过滤可能导致问题的内容
  const preprocessMessages = (data) => {
    // 确保数据存在且是数组或包含messages字段的对象
    if (!data) return [];
    
    // 提取消息数组，如果data是数组则直接使用，否则从messages字段中提取
    let messages = [];
    
    if (Array.isArray(data)) {
      // 1. 如果data是数组，则直接使用
      messages = data;
    } else if (data.messages && Array.isArray(data.messages)) {
      // 2. 如果data是包含messages字段的数组对象，则使用messages字段
      messages = data.messages;
    } else {
      console.error("预期消息格式为数组或包含messages字段的对象，但收到:", typeof data);
      return [];
    }
    
    return messages.map(msg => {
      if (!msg) return msg;
      
      try {
        // 复制消息对象，避免修改原始数据
        const processedMsg = {...msg};
        
        // 处理消息内容，过滤problematic内容
        if (processedMsg.mes) {
          processedMsg.mes = filterProblematicContent(processedMsg.mes);
        }
        
        return processedMsg;
      } catch (error) {
        console.error("处理消息时出错:", error);
        return msg; // 返回原始消息，避免完全丢失数据
      }
    });
  };

  // 处理文件上传
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // 读取文件内容
        const content = e.target.result;
        
        // 解析JSON
        const data = safeJsonParse(content);
        
        // 处理并过滤消息内容
        const processedMessages = preprocessMessages(data);
        
        // 更新应用状态
        setMessages(processedMessages);
        setFilename(file.name);
        setFileLoaded(true);
        onFileLoaded(processedMessages);
        setIsLoading(false);
      } catch (error) {
        console.error("处理文件时出错:", error);
        setError(`文件处理错误: ${error.message}`);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("读取文件时出错");
      setIsLoading(false);
    };

    reader.readAsText(file);
  }, [setMessages, setFilename, setFileLoaded, onFileLoaded]);

  // 默认加载 processed_chat.json 文件
  useEffect(() => {
    const loadDefaultChatFile = async () => {
      // 如果已经加载了数据，则不再重复加载
      if (fileLoaded) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/processed_chat.json');
        if (!response.ok) {
          console.log("默认聊天文件不存在，使用上传界面");
          setIsLoading(false);
          return;
        }
        
        const text = await response.text();
        const data = safeJsonParse(text);
        
        if (!data || typeof data !== 'object') {
          throw new Error('JSON文件格式错误');
        }
        
        if (!data.messages || !Array.isArray(data.messages)) {
          throw new Error('JSON文件格式错误: 缺少messages字段');
        }
        
        // 处理并过滤消息内容
        const messagesArr = data.messages.map(msg => {
          if (!msg) return msg;
          const processedMsg = {...msg};
          
          if (processedMsg.mes) {
            processedMsg.mes = filterContent(processedMsg.mes);
          }
          
          return processedMsg;
        });
        
        // 更新应用状态
        setMessages(messagesArr);
        setFilename('processed_chat.json');
        setFileLoaded(true);
        onFileLoaded(messagesArr);
      } catch (error) {
        console.error("加载默认文件时出错:", error);
        setError(`加载默认文件错误: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultChatFile();
  }, [fileLoaded, setMessages, setFilename, setFileLoaded, onFileLoaded]);

  const isDarkMode = activeTheme && activeTheme.type === 'dark';

  // 如果已经加载了文件，则不显示文件上传界面
  if (fileLoaded) {
    return null;
  }

  return (
    <div className="w-full">
      <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg ${isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-800'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-gray-200' : 'border-gray-800'}`}></div>
            <p className="mt-4">正在加载文件...</p>
          </div>
        ) : (
          <>
            <label 
              htmlFor="file-upload"
              className={`cursor-pointer flex flex-col items-center justify-center rounded-lg p-6 transition-colors duration-200 w-full ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <svg 
                className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-lg font-medium">点击或拖拽文件到此处</span>
              <span className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                支持 SillyTavern JSONL 聊天记录导出文件
              </span>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {error && (
              <div className={`mt-6 p-4 border rounded-md ${
                isDarkMode 
                  ? 'bg-red-900/40 border-red-800 text-red-200' 
                  : 'bg-red-100 border-red-400 text-red-700'
              }`}>
                <p className="font-semibold">错误:</p>
                <p>{error}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

FileLoader.propTypes = {
  onFileLoaded: PropTypes.func
};

export default FileLoader; 