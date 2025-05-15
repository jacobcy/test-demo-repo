import React, { useState, useEffect, useRef } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Message from './Message';
import ChatPDF from '../components/ChatPDF';
import TableModal from '../components/TableModal';
import ImageSettingsModal from '../components/ImageSettingsModal';
import { themes } from '../themes'; // Import themes to populate selector
import HeaderTools from './HeaderTools'; // 导入HeaderTools组件
import { parseTableRowData } from '../utils/tableUtils'; // 导入辅助函数

function ChatDisplay({ 
  chatData, 
  activeTheme, // New prop: activeTheme object
  changeTheme, // New prop: function to change theme
  fontSize, setFontSize, // User preference
  paragraphSpacing, setParagraphSpacing // User preference
  // Removed props: darkMode, setBubbleBackgroundColor, setFontColor, setQuoteColor, etc.
}) {
  // 移除右上角设置按钮相关状态
  const [showSettings, setShowSettings] = useState(false);
  const settingsPanelRef = useRef(null);
  const settingsButtonRef = useRef(null);

  // Visibility states for content blocks remain local
  const [showImageGeneration, setShowImageGeneration] = useState(() => localStorage.getItem('showImageGeneration') !== 'false');
  const [showTableEdit, setShowTableEdit] = useState(() => localStorage.getItem('showTableEdit') !== 'false');
  const [showStatusBlock, setShowStatusBlock] = useState(() => localStorage.getItem('showStatusBlock') !== 'false');
  const [showDetailsBlock, setShowDetailsBlock] = useState(() => localStorage.getItem('showDetailsBlock') !== 'false');
  const [showOptionsBlock, setShowOptionsBlock] = useState(() => localStorage.getItem('showOptionsBlock') !== 'false');
  const [showCodeBlock, setShowCodeBlock] = useState(() => localStorage.getItem('showCodeBlock') !== 'false');
  
  // 添加模态框相关状态
  const [showTableModal, setShowTableModal] = useState(false);
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [showPdfExport, setShowPdfExport] = useState(false);
  
  // 表格数据状态
  const [tableData, setTableData] = useState({});
  const [tableHeaders, setTableHeaders] = useState(null);
  
  // 加载表格头部数据
  useEffect(() => {
    const loadTableHeaders = async () => {
      try {
        const response = await fetch('/table_headers.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for /table_headers.json`);
        }
        const data = await response.json();
        setTableHeaders(data);
        console.log("Table headers loaded successfully:", data);
      } catch (error) {
        console.error("Failed to load table headers:", error);
        setTableHeaders({});
      }
    };
    loadTableHeaders();
  }, []);
  
  // 模态框操作函数
  const handleShowTableModal = () => {
    if (!chatData) return;
    
    // 扫描所有消息以查找表格数据
    const tables = {};
    
    chatData.messages.forEach(message => {
      if (message.mes && typeof message.mes === 'string') {
        const lines = message.mes.split('\n');
        let currentTableId = null;
        let currentRows = [];
        
        lines.forEach(line => {
          const tableRowMatch = line.match(/^insertRow\((\d+),\s*({.*?})\)$/);
          if (tableRowMatch) {
            const tableId = parseInt(tableRowMatch[1], 10);
            const dataObjectString = tableRowMatch[2];
            
            if (currentTableId !== null && tableId !== currentTableId) {
              if (!tables[currentTableId]) {
                tables[currentTableId] = [];
              }
              tables[currentTableId] = [...tables[currentTableId], ...currentRows];
              currentRows = [];
            }
            
            currentTableId = tableId;
            try {
              const rowData = parseTableRowData(dataObjectString);
              currentRows.push(rowData);
            } catch (e) {
              console.error("Error parsing table row data:", e);
            }
          }
        });
        
        if (currentTableId !== null && currentRows.length > 0) {
          if (!tables[currentTableId]) {
            tables[currentTableId] = [];
          }
          tables[currentTableId] = [...tables[currentTableId], ...currentRows];
        }
      }
    });
    
    setTableData(tables);
    setShowTableModal(true);
  };
  
  const handleCloseTableModal = () => setShowTableModal(false);
  
  const handleShowImageSettings = () => setShowImageSettings(true);
  const handleCloseImageSettings = () => setShowImageSettings(false);
  
  const handleExportPdf = () => setShowPdfExport(true);
  const handleClosePdfExport = () => setShowPdfExport(false);
  
  // 新增：切换设置面板的函数
  const handleToggleSettings = () => {
    setShowSettings(prev => !prev);
  };

  // PDF文件名生成函数
  const getPdfFilename = () => {
    if (!chatData || !chatData.metadata) return 'chat-export.pdf';
    return `${chatData.metadata.character_name || 'Character'}_${chatData.metadata.user_name || 'User'}_Chat.pdf`;
  };

  // 移除点击外部关闭设置面板的效果
  useEffect(() => {
    if (!showSettings) return;
    const handleClickOutside = (event) => {
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(event.target) &&
          settingsButtonRef.current && !settingsButtonRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  // Save visibility settings to localStorage
  useEffect(() => {
    localStorage.setItem('showImageGeneration', showImageGeneration.toString());
    localStorage.setItem('showTableEdit', showTableEdit.toString());
    localStorage.setItem('showStatusBlock', showStatusBlock.toString());
    localStorage.setItem('showDetailsBlock', showDetailsBlock.toString());
    localStorage.setItem('showOptionsBlock', showOptionsBlock.toString());
    localStorage.setItem('showCodeBlock', showCodeBlock.toString());
  }, [showImageGeneration, showTableEdit, showStatusBlock, showDetailsBlock, showOptionsBlock, showCodeBlock]);

  if (!chatData || !chatData.metadata || !chatData.messages) {
    return <p style={{ color: activeTheme.colors.textColor }} className={`text-center`}>未能加载聊天数据。</p>;
  }

  const { metadata, messages } = chatData;

  const formatDate = (dateString) => {
    if (!dateString) return '未知日期';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (error) {
      return dateString;
    }
  };

  const handleFontSizeChange = (e) => setFontSize(parseFloat(e.target.value));
  const handleParagraphSpacingChange = (e) => setParagraphSpacing(parseFloat(e.target.value));
  const handleThemeChange = (e) => {
    changeTheme(e.target.value);
  };
  
  const currentThemeKey = Object.keys(themes).find(key => themes[key].name === activeTheme.name) || 'defaultLight';

  const getChatDisplayStyles = () => ({
    fontSize: `${fontSize}rem`,
    lineHeight: paragraphSpacing,
    color: activeTheme.colors.textColor,
  });

  // 判断是否为暗色模式
  const isDarkMode = activeTheme.type === 'dark';

  return (
    <div style={getChatDisplayStyles()} className={`mt-6 space-y-8`}>
      {/* Settings Bar */}
      <div 
        style={{ backgroundColor: activeTheme.colors.settingsPanelBg, borderColor: activeTheme.colors.settingsBorder }}
        className={`sticky top-0 z-10 flex justify-between items-center p-3 rounded-lg mb-6 shadow-sm`}
      >
        <div className="flex items-center space-x-4">
          <div style={{ backgroundColor: activeTheme.colors.iconActive, color: activeTheme.colors.buttonPrimaryText }} className={`p-2 rounded-full`}>
            <i className="fas fa-comments"></i>
          </div>
          <div>
            <h3 style={{ color: activeTheme.colors.textColor }} className={`font-semibold`}>
              {metadata.character_name || '角色'} 与 {metadata.user_name || '用户'}
            </h3>
            <p style={{ color: activeTheme.colors.settingsTextColor }} className={`text-xs`}>
              {messages.length} 条消息 · {formatDate(metadata.create_date)}
            </p>
          </div>
        </div>
        
        {/* 在标题栏右侧添加工具按钮 */}
        <div className="flex items-center space-x-2">
          <HeaderTools 
            onTableClick={handleShowTableModal}
            onImageSettingsClick={handleShowImageSettings}
            onPdfExportClick={handleExportPdf}
            onSettingsClick={handleToggleSettings}
            ref={settingsButtonRef}
            isDarkMode={isDarkMode}
            hasData={!!chatData && !!chatData.messages && chatData.messages.length > 0}
          />
        </div>
      </div>
      
      {/* 设置面板 */}
      {showSettings && (
        <div 
          ref={settingsPanelRef} 
          style={{ backgroundColor: activeTheme.colors.settingsPanelBg, borderColor: activeTheme.colors.settingsBorder, color: activeTheme.colors.textColor }}
          className="absolute right-0 mt-2 w-72 p-4 rounded-lg shadow-xl z-20 border"
        >
          <h4 style={{ color: activeTheme.colors.metadataHeader }} className="text-lg font-semibold mb-3">显示设置</h4>
          <div className="space-y-3">
            {[
              { label: '图片生成块', state: showImageGeneration, setState: setShowImageGeneration, storageKey: 'showImageGeneration' },
              { label: '表格编辑块', state: showTableEdit, setState: setShowTableEdit, storageKey: 'showTableEdit' },
              { label: '状态块', state: showStatusBlock, setState: setShowStatusBlock, storageKey: 'showStatusBlock' },
              { label: '详情块', state: showDetailsBlock, setState: setShowDetailsBlock, storageKey: 'showDetailsBlock' },
              { label: '选项块', state: showOptionsBlock, setState: setShowOptionsBlock, storageKey: 'showOptionsBlock' },
              { label: '代码块', state: showCodeBlock, setState: setShowCodeBlock, storageKey: 'showCodeBlock' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <label htmlFor={item.storageKey} className="text-sm">
                  {item.label}
                </label>
                <button
                  id={item.storageKey}
                  onClick={() => item.setState(prev => !prev)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ease-in-out ${item.state ? 'bg-green-500' : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-300 ease-in-out ${item.state ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 添加模态框 */}
      {/* PDF导出模态框 */}
      {showPdfExport && chatData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`relative p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-w-lg w-full`}>
            <button 
              onClick={handleClosePdfExport}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="关闭"
            >
              <i className="fas fa-times"></i>
            </button>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              导出PDF
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              点击下方按钮下载聊天记录的PDF版本。
            </p>
            <PDFDownloadLink 
              document={
                <ChatPDF 
                  chatData={chatData} 
                  theme={activeTheme} 
                  fontSize={fontSize}
                />
              } 
              fileName={getPdfFilename()}
              className={`w-full px-4 py-3 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-green-600 text-white hover:bg-green-500 disabled:bg-gray-700' 
                  : 'bg-green-500 text-white hover:bg-green-400 disabled:bg-gray-300'
              } shadow-lg disabled:cursor-not-allowed`}
            >
              {({ blob, url, loading, error }) => 
                loading ? (
                  <>
                    <span className="inline-block animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                    <span>PDF生成中...</span>
                  </>
                ) : error ? (
                  <>
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    <span>PDF生成错误</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-download mr-2"></i>
                    <span>下载PDF</span>
                  </>
                )
              }
            </PDFDownloadLink>
          </div>
        </div>
      )}

      {/* 表格模态框 */}
      <TableModal
        isOpen={showTableModal}
        onClose={handleCloseTableModal}
        tables={tableData}
        tableHeaders={tableHeaders}
        isDarkMode={isDarkMode}
      />

      {/* 图像设置模态框 */}
      <ImageSettingsModal
        isOpen={showImageSettings}
        onClose={handleCloseImageSettings}
        isDarkMode={isDarkMode}
      />

      {/* Metadata Section */}
      <section style={{ backgroundColor: activeTheme.colors.metadataSectionBg, borderColor: activeTheme.colors.settingsBorder, color: activeTheme.colors.metadataText }} className={`p-6 rounded-lg shadow-md border`}>
        <h2 style={{ color: activeTheme.colors.metadataHeader, borderColor: activeTheme.colors.settingsBorder }} className={`text-2xl font-semibold mb-5 pb-2 border-b`}>
          <i style={{color: activeTheme.colors.iconDefault, opacity: 0.8}} className="fas fa-info-circle mr-2"></i>聊天信息
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          {[{
              label: '用户:', 
              value: metadata.user_name || '未知用户', 
              icon: 'fas fa-user',
              valueColor: activeTheme.colors.iconActive 
            },{
              label: '角色:', 
              value: metadata.character_name || '未知角色', 
              icon: 'fas fa-robot',
              valueColor: activeTheme.colors.quoteTextColor
            },{
              label: '创建日期:', 
              value: formatDate(metadata.create_date), 
              icon: 'fas fa-calendar-alt',
              valueColor: activeTheme.colors.metadataText
            }
          ].map(item => (
            <div key={item.label} style={{backgroundColor: activeTheme.colors.metadataInfoBoxBg, color: activeTheme.colors.metadataText, boxShadow: activeTheme.colors.shadow || '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} className={`p-3 rounded-md shadow-sm`}>
              <p className={`flex items-center`}>
                <i style={{color: activeTheme.colors.iconDefault}} className={`${item.icon} mr-2 w-5 text-center`}></i>
                <strong className="font-medium mr-1">{item.label}</strong> 
                <span style={{color: item.valueColor}} className={`ml-1`}>{item.value}</span>
              </p>
            </div>
          ))}
          {metadata.chat_metadata && metadata.chat_metadata.description && (
            <div style={{backgroundColor: activeTheme.colors.metadataInfoBoxBg, color: activeTheme.colors.metadataText, boxShadow: activeTheme.colors.shadow || '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} className={`p-3 rounded-md md:col-span-2 shadow-sm`}>
              <p className={`flex items-start`}>
                <i style={{color: activeTheme.colors.iconDefault}} className="fas fa-align-left mr-2 w-5 text-center mt-0.5"></i>
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
          <div style={{borderColor: activeTheme.colors.settingsBorder}} className={`flex-grow border-t mr-4`}></div>
          <h2 style={{color: activeTheme.colors.metadataHeader}} className={`text-2xl font-semibold flex items-center`}>
            <i style={{color: activeTheme.colors.iconDefault}} className="fas fa-comment-dots mr-2"></i>聊天记录
          </h2>
          <div style={{borderColor: activeTheme.colors.settingsBorder}} className={`flex-grow border-t ml-4`}></div>
        </div>
        
        <div className="space-y-8 messages-container">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <Message 
                key={msg.id || index} 
                message={msg} 
                characterName={metadata.character_name || 'Character'} 
                userName={metadata.user_name || 'User'} 
                activeTheme={activeTheme} 
                fontSize={fontSize} 
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
              style={{color: activeTheme.colors.systemBubbleText, borderColor: activeTheme.colors.settingsBorder}}
              className={`text-center italic p-10 border border-dashed rounded-md`}
            >
              <i style={{color: activeTheme.colors.iconDefault}} className="fas fa-inbox mr-2"></i>没有消息可显示。
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ChatDisplay;