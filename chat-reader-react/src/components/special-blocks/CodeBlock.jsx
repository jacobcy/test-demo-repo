import { useState } from 'react';
import PropTypes from 'prop-types';
import { sanitizeCodeContent } from '../../utils/helpers/sanitize';

/**
 * 代码块组件，用于显示格式化的代码内容
 */
const CodeBlock = ({ 
  title = '代码', 
  content, 
  language = '', 
  showLineNumbers = true 
}) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    // 提取纯文本内容，移除HTML标签
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText;
    
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 安全地处理代码内容
  const sanitizedContent = sanitizeCodeContent(content);
  
  return (
    <div className="rounded-block overflow-hidden border border-slate-300 dark:border-slate-600 mb-4">
      <div className="flex items-center justify-between bg-primary-600 dark:bg-primary-800 text-white px-4 py-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span className="font-medium">{title}{language && ` - ${language}`}</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="text-white hover:bg-primary-700 dark:hover:bg-primary-900 p-1 rounded"
          title="复制代码"
        >
          {copied ? (
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
            </svg>
          )}
        </button>
      </div>
      <div className={`p-4 bg-slate-50 dark:bg-slate-800 overflow-x-auto`}>
        <pre className={`font-mono text-sm whitespace-pre text-slate-800 dark:text-slate-200 ${showLineNumbers ? 'line-numbers' : ''}`} dangerouslySetInnerHTML={{ __html: sanitizedContent }}></pre>
      </div>
    </div>
  );
};

CodeBlock.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string.isRequired,
  language: PropTypes.string,
  showLineNumbers: PropTypes.bool
};

export default CodeBlock; 