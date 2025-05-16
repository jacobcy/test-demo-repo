import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { parseMessageBlocks } from '../utils/parsing/messageParser';
import { formatDate } from '../utils/formatting/dateFormatter';
import {
  CodeBlock, 
  StatusBlock, 
  OptionsBlock, 
  DetailsBlock, 
  TableBlock
} from './special-blocks';

const MessageItem = memo(({ message, activeTheme, onClick }) => {
  const [blocks, setBlocks] = useState([]);
  
  useEffect(() => {
    if (message && message.content) {
      // 解析消息内容为结构化块
      const messageBlocks = parseMessageBlocks(message.content);
      setBlocks(messageBlocks);
    }
  }, [message]);
  
  if (!message || !message.content) {
    return null;
  }

  // 确保我们有正确的类型，因为SillyTavern消息可能格式不同
  const { 
    content, 
    type = 'ai', 
    timestamp,
    sender = type === 'user' ? '用户' : 'AI' 
  } = message;
  
  const isDarkTheme = activeTheme && activeTheme.type === 'dark';

  // 获取样式颜色
  const getThemeColors = () => {
    if (!activeTheme || !activeTheme.colors) {
      return isDarkTheme ? {
        background: '#1e3a8a',
        text: '#dbeafe',
        border: '#1e40af',
        timestamp: '#9ca3af'
      } : {
        background: '#eff6ff',
        text: '#1e40af',
        border: '#dbeafe',
        timestamp: '#6b7280'
      };
    }

    const colors = activeTheme.colors;
    
    if (type === 'user') {
      return {
        background: colors.userBubbleBg || (isDarkTheme ? '#065f46' : '#dcfce7'),
        text: colors.userBubbleText || (isDarkTheme ? '#d1fae5' : '#166534'),
        border: colors.userBubbleBorder || (isDarkTheme ? '#047857' : '#a7f3d0'),
        timestamp: colors.timestampText || (isDarkTheme ? '#6b7280' : '#9ca3af')
      };
    }
    
    return {
      background: colors.charBubbleBg || (isDarkTheme ? '#1e3a8a' : '#eff6ff'),
      text: colors.charBubbleText || (isDarkTheme ? '#dbeafe' : '#1e40af'),
      border: colors.charBubbleBorder || (isDarkTheme ? '#1e40af' : '#dbeafe'),
      timestamp: colors.timestampText || (isDarkTheme ? '#6b7280' : '#9ca3af')
    };
  };

  const colors = getThemeColors();

  // 生成消息样式
  const messageStyle = {
    backgroundColor: colors.background,
    color: colors.text,
    borderLeft: `4px solid ${colors.border}`,
    margin: '12px 0',
    padding: '12px 16px',
    borderRadius: '0.5rem',
    boxShadow: isDarkTheme 
      ? '0 2px 4px rgba(0, 0, 0, 0.2)' 
      : '0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  // 渲染发送者名称
  const renderSender = () => {
    const senderStyle = {
      fontWeight: 'bold',
      color: isDarkTheme ? '#e5e7eb' : '#4b5563',
      marginBottom: '4px',
      fontSize: '0.9rem'
    };
    return <div style={senderStyle}>{sender}</div>;
  };

  // 渲染时间戳
  const renderTimestamp = () => {
    if (!timestamp) return null;
    
    const timestampStyle = {
      fontSize: '0.75rem',
      color: colors.timestamp,
      marginTop: '8px',
      textAlign: 'right'
    };
    
    try {
      const formattedDate = formatDate(timestamp);
      return <div style={timestampStyle}>{formattedDate}</div>;
    } catch (error) {
      console.error("格式化时间戳时出错:", error);
      return null;
    }
  };

  // 渲染文本块
  const renderTextBlock = (content, key) => {
    // 处理基本的 Markdown 语法
    const formattedText = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');

    return (
      <div 
        key={key}
        className="message-text"
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    );
  };

  // 渲染单个块
  const renderBlock = (block, index) => {
    const key = `block-${index}`;
    
    switch (block.type) {
      case 'text':
        return renderTextBlock(block.content, key);
        
      case 'code':
        return (
          <CodeBlock 
            key={key}
            language={block.language}
            content={block.content}
            activeTheme={activeTheme}
          />
        );
        
      case 'table':
        return (
          <TableBlock 
            key={key}
            headers={block.headers}
            rows={block.rows}
            activeTheme={activeTheme}
          />
        );
        
      case 'details':
        return (
          <DetailsBlock 
            key={key}
            title={block.title}
            content={block.content}
            activeTheme={activeTheme}
          />
        );
        
      case 'status':
        return (
          <StatusBlock 
            key={key}
            type={block.statusType}
            title={block.title}
            content={block.content}
            activeTheme={activeTheme}
          />
        );
        
      case 'options':
        return (
          <OptionsBlock 
            key={key}
            title={block.title}
            options={block.options}
            activeTheme={activeTheme}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div
      className={`message ${type}-message message-fade-in`}
      style={messageStyle}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      {renderSender()}
      
      <div className="message-blocks">
        {blocks.map((block, index) => renderBlock(block, index))}
      </div>
      
      {renderTimestamp()}
    </div>
  );
});

MessageItem.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    type: PropTypes.string,
    timestamp: PropTypes.string,
    sender: PropTypes.string
  }),
  activeTheme: PropTypes.object,
  onClick: PropTypes.func,
};

MessageItem.defaultProps = {
  onClick: () => {},
};

MessageItem.displayName = 'MessageItem';

export default MessageItem; 