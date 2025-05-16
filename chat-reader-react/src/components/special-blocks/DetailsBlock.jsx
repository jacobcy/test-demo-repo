import { useState } from 'react';
import PropTypes from 'prop-types';
import { sanitizeHtml } from '../../utils/helpers/sanitize';

/**
 * 详情块组件，用于显示可折叠的内容详情
 */
const DetailsBlock = ({ title = '详情', content }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // 安全地处理内容
  const sanitizedContent = sanitizeHtml(content);
  
  return (
    <div className="rounded-block overflow-hidden border border-slate-300 dark:border-slate-600 mb-4">
      <button 
        className="w-full flex items-center justify-between bg-purple-600 dark:bg-purple-800 text-white px-4 py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <svg 
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="font-medium">{title}</span>
        </div>
        <span className="text-sm">
          {isOpen ? '收起' : '展开'}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-purple-50 dark:bg-slate-800 overflow-x-auto">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedContent }}></div>
        </div>
      )}
    </div>
  );
};

DetailsBlock.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string.isRequired
};

export default DetailsBlock; 