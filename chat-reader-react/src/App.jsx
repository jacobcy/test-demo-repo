import { useState, useCallback, useEffect } from 'react';
import FileLoader from './components/FileLoader';
import ChatDisplay from './components/ChatDisplay';
import './index.css';
import './utils/tampermonkeyPolyfill';
import { themes, defaultThemeName } from './themes';

function App() {
  const [chatData, setChatData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);
  
  // Theme state
  const [currentThemeName, setCurrentThemeName] = useState(() => {
    return localStorage.getItem('currentThemeName') || defaultThemeName;
  });
  const activeTheme = themes[currentThemeName] || themes[defaultThemeName];
  
  // 计算是否为暗色模式
  const isDarkMode = activeTheme.type === 'dark';

  // Font size and paragraph spacing remain as user preferences on top of themes
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [paragraphSpacing, setParagraphSpacing] = useState(() => {
    const saved = localStorage.getItem('paragraphSpacing');
    return saved ? parseFloat(saved) : 1.5;
  });

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('currentThemeName')) { // Only if user hasn't picked a theme
        setCurrentThemeName(e.matches ? 'defaultDark' : 'defaultLight');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // When currentThemeName changes, save to localStorage
  useEffect(() => {
    localStorage.setItem('currentThemeName', currentThemeName);
  }, [currentThemeName]);

  // Save other user preferences to localStorage
  useEffect(() => {
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('paragraphSpacing', paragraphSpacing.toString());
  }, [paragraphSpacing]);

  // 自动加载数据
  useEffect(() => {
    if (autoLoadAttempted) return;

    const loadPreprocessedData = async () => {
      setIsLoading(true);
      setAutoLoadAttempted(true);
      try {
        const response = await fetch('/processed_chat.json');
        if (!response.ok) {
          if (response.status === 404) {
            console.log("No pre-processed chat data found (processed_chat.json), awaiting user input.");
          } else {
            console.error(`HTTP error! status: ${response.status} when fetching processed_chat.json`);
          }
          setIsLoading(false);
          return;
        }
        const data = await response.json(); 
        if (data && data.metadata && data.messages) {
          setChatData(data);
          console.log("Successfully loaded and parsed pre-processed chat data (processed_chat.json).");
        } else {
          console.error("Pre-processed chat data (processed_chat.json) is not in the expected format.");
        }
      } catch (e) {
        console.error("Error fetching or parsing pre-processed chat data (processed_chat.json):", e);
      }
      setIsLoading(false);
    };

    loadPreprocessedData();
  }, [autoLoadAttempted]);

  // 处理文件加载
  const handleFileLoad = useCallback(async (file) => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setChatData(null); // Clear previous data

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileContent = event.target.result;
        const lines = fileContent.split('\n');
        if (lines.length < 1) {
          throw new Error("File is empty or not in the expected JSONL format for manual upload.");
        }

        // First line is metadata for JSONL
        const metadata = JSON.parse(lines[0]);
        const messages = [];

        // Subsequent lines are messages for JSONL
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue; // Skip empty lines
          const msg = JSON.parse(lines[i]);
          messages.push(msg);
        }
        console.log("Successfully parsed manually uploaded JSONL file.");
        setChatData({ metadata, messages });
      } catch (e) {
        console.error("Error parsing manually uploaded JSONL file:", e);
        setError(`Failed to parse file: ${e.message}. Please ensure it's a valid SillyTavern JSONL chat export.`);
        setChatData(null);
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
      console.error("Error reading manually uploaded file:", reader.error);
      setError(`Error reading file: ${reader.error.message}`);
      setIsLoading(false);
    };
    reader.readAsText(file); // For manual upload, expect JSONL
  }, []);

  // 切换暗/亮模式
  const toggleDarkMode = () => {
    setCurrentThemeName(isDarkMode ? 'defaultLight' : 'defaultDark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`w-full py-8 ${isDarkMode ? 'bg-indigo-900' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <h1 className={`text-4xl md:text-5xl font-bold text-white text-center`}>
            聊天记录阅读器
            <span className="block text-sm md:text-base font-normal mt-2 opacity-80">专为 SillyTavern 聊天记录设计</span>
          </h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleDarkMode} 
              className={`px-4 py-2 rounded-lg flex items-center transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                  : 'bg-indigo-900 text-white hover:bg-indigo-800'
              } shadow-lg`}
              aria-label={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} mr-2`}></i>
              <span className="hidden sm:inline">{isDarkMode ? '亮色模式' : '暗色模式'}</span>
            </button>
          </div>
        </div>
      </header>

      <main 
        id="chat-content" 
        className={`w-full max-w-6xl mx-auto px-6 py-10 shadow-xl rounded-lg my-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
      >
        {!chatData && !isLoading && (
          <FileLoader onFileLoad={handleFileLoad} isLoading={isLoading} darkMode={isDarkMode} />
        )}

        {error && (
          <div className={`mt-6 p-4 ${isDarkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded-md`}>
            <p className="font-semibold">错误:</p>
            <p>{error}</p>
          </div>
        )}

        {chatData && (
          <ChatDisplay 
            chatData={chatData} 
            activeTheme={activeTheme}
            changeTheme={setCurrentThemeName}
            fontSize={fontSize}
            setFontSize={setFontSize}
            paragraphSpacing={paragraphSpacing}
            setParagraphSpacing={setParagraphSpacing}
          />
        )}
      </main>

      <footer 
        className={`text-center py-6 ${isDarkMode ? 'bg-gray-900 text-gray-500' : 'bg-gray-50 text-gray-600'}`}
      >
        <p className="text-sm">
          聊天记录阅读器 v0.1 - 专为 SillyTavern 聊天记录设计
        </p>
      </footer>
    </div>
  );
}

export default App;
