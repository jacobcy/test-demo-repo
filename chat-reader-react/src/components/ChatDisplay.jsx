import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Message from './Message';
import ChatPDF from '../components/ChatPDF';
import TableModal from '../components/TableModal';
import ImageSettingsModal from '../components/ImageSettingsModal';
import { themes, defaultTheme } from '../themes'; // 导入主题
import HeaderTools from './HeaderTools'; // 导入HeaderTools组件
import { parseTableRowData } from '../utils/tableUtils'; // 导入辅助函数
import { formatDate } from '../utils/formatting/dateFormatter'; // 导入 formatDate
import MessageList from './MessageList';
import PropTypes from 'prop-types';
import { useApp } from '../contexts/AppContext';

const defaultChatData = {
  metadata: {
    character_name: 'AI',
    user_name: 'User'
  },
  messages: []
};

function ChatDisplay({ 
  chatData = defaultChatData,
  activeTheme = defaultTheme,
  fontSize = 1,
  setFontSize = () => {},
  paragraphSpacing = 1.5,
  setParagraphSpacing = () => {},
  toggleTheme = () => {}
}) {
  const [theme, setTheme] = useState(activeTheme);
  const [fontSizeValue, setFontSizeValue] = useState(fontSize);
  const [paragraphSpacingValue, setParagraphSpacingValue] = useState(paragraphSpacing);
  const [showSettings, setShowSettings] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [tableHeaders, setTableHeaders] = useState({});
  const settingsPanelRef = useRef(null);
  
  // 判断是否为暗色模式
  const isDarkMode = theme && theme.type === 'dark';
  
  // 默认检查是否开启显示特殊块
  const {
    config: {
      showImageGeneration = true,
      showTableEdit = true,
      showStatusBlock = true,
      showDetailsBlock = true,
      showOptionsBlock = true,
      showCodeBlock = true
    } = {}
  } = useApp();

  // 保证我们有有效的聊天数据
  const chatDataWithDefault = chatData || defaultChatData;

  useEffect(() => {
    setTheme(activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    setFontSizeValue(fontSize);
  }, [fontSize]);

  useEffect(() => {
    setParagraphSpacingValue(paragraphSpacing);
  }, [paragraphSpacing]);

  // 创建 outside click 处理函数来关闭设置面板
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    }

    // 绑定事件监听
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 清理事件监听
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 加载表格头部数据
  useEffect(() => {
    // 模拟的表格头部数据
    const mockTableHeaders = {
      0: { text: "序号", value: "index" },
      1: { text: "描述", value: "description" },
      2: { text: "状态", value: "status" },
      3: { text: "日期", value: "date" },
      4: { text: "标签", value: "tags" },
      5: { text: "操作", value: "actions" }
    };

    setTableHeaders(mockTableHeaders);
    console.log("Table headers loaded successfully:", mockTableHeaders);
  }, []);

  // 字体大小更改处理函数
  const handleSetFontSize = useCallback((value) => {
    setFontSizeValue(value);
    setFontSize && setFontSize(value);
  }, [setFontSize]);

  // 段落间距更改处理函数
  const handleSetParagraphSpacing = useCallback((value) => {
    setParagraphSpacingValue(value);
    setParagraphSpacing && setParagraphSpacing(value);
  }, [setParagraphSpacing]);

  // 主题切换处理函数
  const handleToggleTheme = useCallback((value) => {
    // 如果提供了值，则使用该值切换主题
    if (value) {
      const newTheme = themes[value] || themes.light;
      setTheme(newTheme);
      toggleTheme && toggleTheme(value);
    } else {
      // 否则切换明暗主题
      const newTheme = theme.type === 'light' ? themes.dark : themes.light;
      setTheme(newTheme);
      toggleTheme && toggleTheme(newTheme.name);
    }
  }, [theme, toggleTheme]);

  // 打开设置面板
  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // 消息点击处理
  const handleMessageClick = useCallback((message) => {
    if (message && message.table_data) {
      setSelectedMessage(message);
      setShowTableModal(true);
    }
  }, []);

  // 表格模态框处理
  const handleShowTableModal = useCallback(() => {
    // 检查是否有聊天消息
    if (chatDataWithDefault && chatDataWithDefault.messages && chatDataWithDefault.messages.length > 0) {
      // 查找第一个包含表格数据的消息
      const messageWithTable = chatDataWithDefault.messages.find(msg => msg.table_data);
      
      if (messageWithTable) {
        setSelectedMessage(messageWithTable);
        setShowTableModal(true);
      } else {
        alert("没有找到包含表格数据的消息。");
      }
    } else {
      alert("没有可用的聊天消息。");
    }
  }, [chatDataWithDefault]);

  // 图像设置处理
  const handleShowImageSettings = useCallback(() => {
    setShowImageSettings(true);
  }, []);

  // PDF导出处理
  const handleExportPdf = useCallback(() => {
    // PDF导出功能将在此处理
    console.log("导出为PDF");
  }, []);

  // 处理关闭所有模态框
  const handleCloseModals = useCallback(() => {
    setShowTableModal(false);
    setShowImageSettings(false);
    setSelectedMessage(null);
  }, []);

  // 在标题栏右侧添加工具按钮
  const headerToolsElement = (
    <HeaderTools 
      onTableClick={handleShowTableModal}
      onImageSettingsClick={handleShowImageSettings}
      onPdfExportClick={handleExportPdf}
      onSettingsClick={handleToggleSettings}
      isDarkMode={isDarkMode}
      hasData={!!(chatDataWithDefault && chatDataWithDefault.messages && chatDataWithDefault.messages.length > 0)}
    />
  );

  if (!chatDataWithDefault || !chatDataWithDefault.metadata || !chatDataWithDefault.messages) {
    return <p style={{ color: theme.colors.textPrimary }} className={`text-center`}>未能加载聊天数据。</p>;
  }

  const { metadata, messages: chatMessages } = chatDataWithDefault;

  const handleFontSizeChange = (e) => handleSetFontSize(parseFloat(e.target.value));
  const handleParagraphSpacingChange = (e) => handleSetParagraphSpacing(parseFloat(e.target.value));
  const handleThemeChange = (e) => {
    handleToggleTheme(e.target.value);
  };
  
  const currentThemeKey = Object.keys(themes).find(key => themes[key].name === theme.name) || 'light';

  const getChatDisplayStyles = () => ({
    fontSize: `${fontSizeValue}rem`,
    lineHeight: paragraphSpacingValue,
    color: theme.colors.textPrimary,
  });

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={chatMessages}
        activeTheme={theme}
        colors={theme.colors}
        onMessageClick={handleMessageClick}
      />

      {/* Settings Bar */}
      <div 
        style={{ backgroundColor: theme.colors.settingsPanelBg || '#f9fafb', borderColor: theme.colors.settingsBorder || '#e5e7eb' }}
        className={`sticky top-0 z-10 flex justify-between items-center p-3 rounded-lg mb-6 shadow-sm`}
      >
        <div className="flex items-center space-x-4">
          <div 
            style={{ 
              backgroundColor: theme.colors.iconActive, 
              color: theme.colors.buttonPrimaryText,
              width: '2.5rem', // 例如 40px
              height: '2.5rem' // 例如 40px
            }} 
            className={`p-2 rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <i className="fas fa-comments text-lg"></i> {/* 调整图标大小 */}
          </div>
          <div>
            <h3 style={{ color: theme.colors.textPrimary }} className={`font-semibold`}>
              {metadata.character_name || '角色'} 与 {metadata.user_name || '用户'}
            </h3>
            <p style={{ color: theme.colors.settingsTextColor }} className={`text-xs`}>
              {chatMessages.length} 条消息 · {formatDate(metadata.create_date)}
            </p>
          </div>
        </div>
        
        {/* 在标题栏右侧添加工具按钮 */}
        <div className="flex items-center space-x-2">
          {headerToolsElement}
        </div>
      </div>
      
      {/* 设置面板 */}
      {showSettings && (
        <div 
          ref={settingsPanelRef} 
          style={{ backgroundColor: theme.colors.settingsPanelBg, borderColor: theme.colors.settingsBorder, color: theme.colors.textPrimary }}
          className="absolute right-0 mt-2 w-72 p-4 rounded-lg shadow-xl z-20 border"
        >
          <h4 style={{ color: theme.colors.metadataHeader }} className="text-lg font-semibold mb-3">显示设置</h4>
          <div className="space-y-3">
            {/* Theme Selector */}
            <div className="flex items-center justify-between">
              <label htmlFor="theme-select" className="text-sm">
                主题选择:
              </label>
              <select 
                id="theme-select"
                value={currentThemeKey} 
                onChange={handleThemeChange} 
                className={`p-1.5 rounded text-sm ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border`}
              >
                {Object.keys(themes).map(key => (
                  <option key={key} value={key}>
                    {themes[key].name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size Control */}
            <div className="flex items-center justify-between">
              <label htmlFor="font-size-slider" className="text-sm">
                字体大小: {fontSizeValue.toFixed(1)}rem
              </label>
              <input 
                type="range" 
                id="font-size-slider"
                min="0.8" 
                max="1.5" 
                step="0.1" 
                value={fontSizeValue} 
                onChange={handleFontSizeChange} 
                className="w-2/5 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* Paragraph Spacing Control */}
            <div className="flex items-center justify-between">
              <label htmlFor="paragraph-spacing-slider" className="text-sm">
                行间距: {paragraphSpacingValue.toFixed(1)}
              </label>
              <input 
                type="range" 
                id="paragraph-spacing-slider"
                min="1.2" 
                max="2.0" 
                step="0.1" 
                value={paragraphSpacingValue} 
                onChange={handleParagraphSpacingChange} 
                className="w-2/5 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* Toggle Special Blocks */}
            <div className="mt-4 pt-3 border-t" style={{ borderColor: theme.colors.settingsBorder }}>
              <h5 className="text-sm font-medium mb-2">特殊块显示:</h5>
              <div className="space-y-2">
                {/* 这里可以添加控制特殊块显示的开关，例如显示/隐藏代码块、表格等 */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && selectedMessage && (
        <TableModal 
          message={selectedMessage} 
          onClose={handleCloseModals} 
          headers={tableHeaders}
          theme={theme}
        />
      )}

      {/* Image Settings Modal */}
      {showImageSettings && (
        <ImageSettingsModal 
          onClose={handleCloseModals} 
          theme={theme}
        />
      )}

      {/* PDF Export */}
      <div style={{ display: 'none' }}>
        {chatDataWithDefault && (
          <PDFDownloadLink 
            document={<ChatPDF chatData={chatDataWithDefault} darkMode={isDarkMode} />} 
            fileName={`chat-export-${new Date().toISOString().slice(0, 10)}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ blob, url, loading, error }) => ''}
          </PDFDownloadLink>
        )}
      </div>

      {/* Metadata Section */}
      <section style={{ backgroundColor: theme.colors.metadataSectionBg, borderColor: theme.colors.settingsBorder, color: theme.colors.metadataText }} className={`p-6 rounded-lg shadow-md border`}>
        <h2 style={{ color: theme.colors.metadataHeader, borderColor: theme.colors.settingsBorder }} className={`text-2xl font-semibold mb-5 pb-2 border-b flex items-center`}>
          <i style={{color: theme.colors.iconDefault, opacity: 0.8}} className="fas fa-info-circle mr-2 flex-shrink-0"></i>聊天信息
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          {[{
              label: '用户:', 
              value: metadata.user_name || '未知用户', 
              icon: 'fas fa-user',
              valueColor: theme.colors.iconActive 
            },{
              label: '角色:', 
              value: metadata.character_name || '未知角色', 
              icon: 'fas fa-robot',
              valueColor: theme.colors.quoteTextColor
            },{
              label: '创建日期:', 
              value: formatDate(metadata.create_date), 
              icon: 'fas fa-calendar-alt',
              valueColor: theme.colors.metadataText
            }
          ].map(item => (
            <div key={item.label} style={{backgroundColor: theme.colors.metadataInfoBoxBg, color: theme.colors.metadataText, boxShadow: theme.colors.shadow || '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} className={`p-3 rounded-md shadow-sm`}>
              <p className={`flex items-center`}>
                <i style={{color: theme.colors.iconDefault}} className={`${item.icon} mr-2 w-5 text-center`}></i>
                <strong className="font-medium mr-1">{item.label}</strong> 
                <span style={{color: item.valueColor}} className={`ml-1`}>{item.value}</span>
              </p>
            </div>
          ))}
          {metadata.chat_metadata && metadata.chat_metadata.description && (
            <div style={{backgroundColor: theme.colors.metadataInfoBoxBg, color: theme.colors.metadataText, boxShadow: theme.colors.shadow || '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} className={`p-3 rounded-md md:col-span-2 shadow-sm`}>
              <p className={`flex items-start`}>
                <i style={{color: theme.colors.iconDefault}} className="fas fa-align-left mr-2 w-5 text-center mt-0.5"></i>
                <strong className="font-medium mr-1">描述:</strong> 
                <span className={`ml-1`}>{metadata.chat_metadata.description}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Messages Section */}
      <section className={`mb-10`}>
        <div className="flex items-center mb-6 pt-4">
          <div style={{borderColor: theme.colors.settingsBorder}} className={`flex-grow border-t mr-4`}></div>
          <h2 style={{color: theme.colors.metadataHeader}} className={`text-2xl font-semibold flex items-center`}>
            <i style={{color: theme.colors.iconDefault}} className="fas fa-comment-dots mr-2 flex-shrink-0"></i>聊天记录
          </h2>
          <div style={{borderColor: theme.colors.settingsBorder}} className={`flex-grow border-t ml-4`}></div>
        </div>
        
        <div className="space-y-8 messages-container">
          {chatMessages.length > 0 ? (
            chatMessages.map((msg, index) => (
              <Message 
                key={msg.id || index} 
                message={msg} 
                characterName={metadata.character_name || 'Character'} 
                userName={metadata.user_name || 'User'} 
                activeTheme={theme} 
                fontSize={fontSizeValue} 
                tableHeaders={tableHeaders}
                showImageGeneration={showImageGeneration}
                showTableEdit={showTableEdit}
                showStatusBlock={showStatusBlock}
                showDetailsBlock={showDetailsBlock}
                showOptionsBlock={showOptionsBlock}
                showCodeBlock={showCodeBlock}
              />
            ))
          ) : (
            <p 
              style={{color: theme.colors.systemBubbleText, borderColor: theme.colors.settingsBorder}}
              className={`text-center italic p-10 border border-dashed rounded-md`}
            >
              <i style={{color: theme.colors.iconDefault}} className="fas fa-inbox mr-2"></i>没有消息可显示。
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

ChatDisplay.propTypes = {
  chatData: PropTypes.shape({
    metadata: PropTypes.object,
    messages: PropTypes.array
  }),
  activeTheme: PropTypes.object,
  fontSize: PropTypes.number,
  setFontSize: PropTypes.func,
  paragraphSpacing: PropTypes.number,
  setParagraphSpacing: PropTypes.func,
  toggleTheme: PropTypes.func
};

export default ChatDisplay;