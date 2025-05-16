import React, { useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useVirtualizer } from '@tanstack/react-virtual';
import MessageItem from './MessageItem';

const MessageList = ({ 
  messages = [], 
  activeTheme = { type: 'light', colors: {} },
  colors = {},
  onMessageClick = () => {} 
}) => {
  const parentRef = useRef(null);
  const estimateSize = useCallback(() => 100, []); // 预估每个消息的高度

  // 确保有有效的 colors
  const themeColors = colors || (activeTheme && activeTheme.colors) || {};
  
  // 转换不同格式的消息数据
  const normalizedMessages = useCallback(() => {
    if (!messages || !Array.isArray(messages)) return [];
    
    return messages.map((msg, index) => {
      // 如果消息已经是符合预期的格式
      if (msg.id && msg.content && msg.type) {
        return msg;
      }
      
      // SillyTavern 格式的消息
      if (msg.mes || msg.name) {
        const isUser = msg.name === 'You' || msg.is_user === true;
        return {
          id: msg.id || `msg-${index}`,
          content: msg.mes || '',
          type: isUser ? 'user' : 'ai',
          timestamp: msg.send_date || new Date().toISOString(),
          sender: msg.name || (isUser ? 'You' : 'AI')
        };
      }
      
      // 未知格式，创建一个基本的消息对象
      return {
        id: `msg-${index}`,
        content: typeof msg === 'string' ? msg : JSON.stringify(msg),
        type: 'system',
        timestamp: new Date().toISOString()
      };
    });
  }, [messages]);

  const processedMessages = normalizedMessages();
  
  const rowVirtualizer = useVirtualizer({
    count: processedMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5, // 预加载的项数
  });

  // 自动滚动到底部
  useEffect(() => {
    if (processedMessages.length > 0) {
      rowVirtualizer.scrollToIndex(processedMessages.length - 1);
    }
  }, [processedMessages.length, rowVirtualizer]);

  if (!activeTheme) {
    return (
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4 text-center text-gray-500 dark:text-gray-400">
        等待主题加载...
      </div>
    );
  }

  const isDarkMode = activeTheme.type === 'dark';

  return (
    <div
      ref={parentRef}
      className={`flex-1 overflow-auto ${isDarkMode ? 'dark' : ''}`}
      style={{
        height: '100%',
        width: '100%',
        contain: 'strict',
        backgroundColor: themeColors.background || (isDarkMode ? '#111827' : '#ffffff')
      }}
    >
      {processedMessages.length === 0 ? (
        <div className={`flex items-center justify-center h-full text-center p-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div>
            <svg 
              className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-lg">没有消息可显示</p>
            <p className="text-sm mt-2">请加载 SillyTavern 聊天记录文件</p>
          </div>
        </div>
      ) : (
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const message = processedMessages[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MessageItem
                  message={message}
                  activeTheme={activeTheme}
                  colors={themeColors}
                  onClick={() => onMessageClick(message)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array,
  activeTheme: PropTypes.object,
  colors: PropTypes.object,
  onMessageClick: PropTypes.func,
};

export default MessageList; 