import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { parseMessageBlocks, filterProblematicContent } from '../utils/parsing/messageParser';
import { sanitizeHtml } from '../utils/helpers/sanitize';
import CodeBlock from './special-blocks/CodeBlock';
import { useApp } from '../contexts/AppContext';
import {
  StatusBlock, 
  OptionsBlock, 
  DetailsBlock, 
  TableBlock
} from './special-blocks';
import { formatDate } from '../utils/formatting/dateFormatter';

/**
 * 消息组件 - 重构版本，使用特殊块组件和结构化方式渲染内容
 * @param {object} props - 组件属性
 */
function Message({ 
  message, 
  characterName, 
  userName, 
  activeTheme,
  fontSize,
  tableHeaders,
  showImageGeneration = true, 
  showTableEdit = true, 
  showStatusBlock = true,
  showDetailsBlock = true,
  showOptionsBlock = true,
  showCodeBlock = true
}) {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simplified, setSimplified] = useState(false);
  const { activeTheme: appTheme } = useApp();

  // 从消息对象中解构需要的属性
  const { name, mes, is_user } = message || {};

  useEffect(() => {
    const processMessage = () => {
      if (!message || !mes) {
        setBlocks([]);
        setIsLoading(false);
        return;
      }

      // 创建一个安全处理任务
      const processTask = async () => {
        try {
          // 设置处理超时保护 - 3秒后如果还没处理完就显示一个简化版本
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('处理超时')), 3000);
          });
          
          // 实际处理逻辑
          const processingPromise = new Promise(resolve => {
            try {
              // 过滤可能导致问题的内容
              const filteredContent = filterProblematicContent(mes);
              
              // 解析消息内容为结构化块
              const messageBlocks = parseMessageBlocks(filteredContent);
              resolve(messageBlocks);
            } catch (err) {
              console.error('消息处理错误:', err);
              // 发生错误时返回简单的文本块
              resolve([{
                type: 'text',
                content: '消息处理失败: ' + err.message
              }]);
            }
          });
          
          // 竞争处理 - 如果超时则显示简化版本
          const result = await Promise.race([processingPromise, timeoutPromise])
            .catch(error => {
              console.warn('消息处理问题:', error.message);
              setSimplified(true);
              // 返回简化版本
              return [{
                type: 'text',
                content: sanitizeHtml(mes.substring(0, 1000) + 
                  (mes.length > 1000 ? '... (消息过长，已截断)' : ''))
              }];
            });
          
          setBlocks(result);
        } catch (error) {
          console.error('消息处理失败:', error);
          setError(error.message);
          // 出错时显示简化版本
          setBlocks([{
            type: 'text',
            content: '无法显示消息: ' + error.message
          }]);
        } finally {
          setIsLoading(false);
        }
      };

      // 启动处理任务
      setIsLoading(true);
      setError(null);
      setSimplified(false);
      processMessage();
    };
  }, [message, mes]);

  if (!message) return null;

  const { mes: messageContent, name: messageName, is_user: isUser, send_date, status_block, options } = message;

  // 如果消息为空且没有状态块或选项，则不渲染
  if (!messageContent && !status_block && !options) return null;

  const isDarkTheme = activeTheme.type === 'dark';

  // 根据消息类型设置样式
  const messageClass = useMemo(() => 
    isUser ? 'message user-message' : 'message assistant-message', 
  [isUser]);
  
  // 根据当前主题设置颜色
  const themeStyle = useMemo(() => ({
    backgroundColor: isUser 
      ? activeTheme?.userMessageBg || '#E6F7FF'
      : activeTheme?.assistantMessageBg || '#F5F5F5',
    color: isUser
      ? activeTheme?.userMessageText || '#333'
      : activeTheme?.assistantMessageText || '#333'
  }), [isUser, activeTheme]);

  if (isLoading) {
    return (
      <div className={`${messageClass} animate-pulse`} style={themeStyle}>
        <div className="message-header">
          <strong>{messageName || (isUser ? userName : characterName || name)}</strong>
        </div>
        <div className="message-content loading">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${messageClass} animate-pulse`} style={themeStyle}>
        <div className="message-header">
          <strong>{messageName || (isUser ? userName : characterName || name)}</strong>
        </div>
        <div className="message-content error">
          <p>加载错误: {error}</p>
          <p className="plain-text">{sanitizeHtml(messageContent)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${messageClass}`} style={themeStyle}>
      <div className="message-header">
        <strong>{messageName || (isUser ? userName : characterName || name)}</strong>
      </div>
      <div className="message-content">
        {/* 状态块 */}
        {showStatusBlock && status_block && (
          <StatusBlock
            type={status_block.type}
            title={status_block.title}
            content={status_block.content}
            activeTheme={activeTheme}
          />
        )}

        {/* 选项块 */}
        {showOptionsBlock && options && (
          <OptionsBlock
            title={options.title}
            options={options.list}
            activeTheme={activeTheme}
          />
        )}

        {/* 主要消息内容 */}
        <div className="message-blocks">
          {blocks.map((block, index) => {
            if (block.type === 'code') {
              if (!showCodeBlock) return null;
              return (
                <CodeBlock 
                  key={`code-${index}`}
                  language={block.language}
                  content={block.content}
                />
              );
            }
            // 针对文本块的安全渲染
            return (
              <div 
                key={`text-${index}`}
                className="text-block"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }}
              />
            );
          })}
        </div>

        {/* 时间戳 */}
        {send_date && (
          <div className="timestamp">
            {formatDate(send_date)}
          </div>
        )}
      </div>
    </div>
  );
}

Message.propTypes = {
  message: PropTypes.shape({
    name: PropTypes.string,
    mes: PropTypes.string,
    is_user: PropTypes.bool
  }).isRequired,
  characterName: PropTypes.string,
  userName: PropTypes.string,
  activeTheme: PropTypes.object.isRequired,
  fontSize: PropTypes.number,
  tableHeaders: PropTypes.object,
  showImageGeneration: PropTypes.bool,
  showTableEdit: PropTypes.bool,
  showStatusBlock: PropTypes.bool,
  showDetailsBlock: PropTypes.bool,
  showOptionsBlock: PropTypes.bool,
  showCodeBlock: PropTypes.bool
};

export default Message; 