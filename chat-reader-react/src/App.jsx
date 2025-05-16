import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import ChatDisplay from './components/ChatDisplay';
import FileLoader from './components/FileLoader';
import { defaultTheme, themes } from './themes';
import './App.css'; // 确保导入 App.css

// 默认聊天数据结构 - 添加测试消息
const defaultChatData = {
  metadata: {
    character_name: 'AI助手',
    user_name: '用户',
    create_date: new Date().toISOString()
  },
  messages: [
    {
      id: 1,
      name: 'AI助手',
      mes: '欢迎使用聊天记录阅读器！这是一条**加粗文本**的消息。\n\n您可以尝试上传 SillyTavern JSONL 聊天记录文件以查看更多内容。',
      send_date: new Date().toISOString(),
      is_user: false
    },
    {
      id: 2,
      name: '用户',
      mes: '这是用户的消息，包含`内联代码`示例。',
      send_date: new Date(Date.now() - 10000).toISOString(),
      is_user: true
    },
    {
      id: 3,
      name: 'AI助手',
      mes: '这是一个代码块示例：\n\n```js\nconsole.log("Hello World!");\nconst answer = 42;\n```\n\n代码块上方和下方的文本也会正确显示。',
      send_date: new Date(Date.now() - 5000).toISOString(),
      is_user: false
    },
    {
      id: 4,
      name: 'AI助手',
      mes: '<status type="info" title="信息通知">这是一个状态块示例。</status>\n\n状态块可以用来显示重要信息。',
      send_date: new Date(Date.now() - 2000).toISOString(),
      is_user: false
    }
  ]
};

function AppContent() {
  const { 
    activeTheme, 
    toggleTheme, 
    fontSize, 
    setFontSize, 
    paragraphSpacing, 
    setParagraphSpacing,
    setMessages,
    messages,
    fileLoaded,
    setFileLoaded,
    filename,
    setFilename
  } = useApp();

  const [darkMode, setDarkMode] = useState(false);
  
  // 当暗黑模式状态改变时更新主题
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      toggleTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      toggleTheme('light');
    }
    
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode, toggleTheme]);
  
  // 检测系统暗黑模式并初始化
  useEffect(() => {
    // 检查用户是否已设置首选项
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode !== null) {
      // 使用用户保存的设置
      setDarkMode(savedMode === 'true');
    } else {
      // 使用系统首选项
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);
  
  // 模拟加载聊天数据
  useEffect(() => {
    // 如果已经加载过文件，则不再加载默认数据
    if (fileLoaded) return;
    
    // 如果有本地存储的数据，尝试加载
    const savedChat = localStorage.getItem('savedChat');
    if (savedChat) {
      try {
        const parsedData = JSON.parse(savedChat);
        setMessages(parsedData.messages || []);
        setFileLoaded(true);
        setFilename('saved_chat.json');
      } catch (e) {
        console.error('无法解析保存的聊天数据', e);
        setMessages(defaultChatData.messages);
      }
    } else {
      // 否则使用默认数据
      setMessages(defaultChatData.messages);
    }
  }, [fileLoaded, setMessages, setFileLoaded, setFilename]);

  const handleFileLoaded = (data) => {
    // 数据已经在FileLoader组件中通过setMessages设置
    // 这里保存到本地存储
    localStorage.setItem('savedChat', JSON.stringify({messages: data}));
  };

  // 构造传递给ChatDisplay的数据
  const chatData = {
    metadata: defaultChatData.metadata,
    messages: messages || []
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            聊天记录阅读器专为 SillyTavern 聊天记录设计
          </h1>
          <button 
            onClick={() => setDarkMode(prev => !prev)}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
            aria-label={darkMode ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        <FileLoader onFileLoaded={handleFileLoaded} />
        <main className="mt-6">
          <ChatDisplay 
            chatData={chatData} 
            activeTheme={activeTheme}
            fontSize={fontSize}
            setFontSize={setFontSize}
            paragraphSpacing={paragraphSpacing}
            setParagraphSpacing={setParagraphSpacing}
            toggleTheme={toggleTheme}
          />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
