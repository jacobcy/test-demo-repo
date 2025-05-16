import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * 表格块组件，用于显示结构化的表格数据
 */
const TableBlock = ({ 
  title = '表格', 
  headers = [], 
  rows = [], 
  activeTheme,
  onEdit 
}) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    // 以表格格式构建纯文本内容
    let plainText = '';
    
    // 添加表头
    if (headers && headers.length > 0) {
      plainText += headers.join('\t') + '\n';
    }
    
    // 添加表格行
    if (rows && rows.length > 0) {
      rows.forEach(row => {
        plainText += row.join('\t') + '\n';
      });
    }
    
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isDarkTheme = activeTheme?.type === 'dark';
  
  return (
    <div className="rounded-block overflow-hidden border border-slate-300 dark:border-slate-600 mb-4">
      <div className="flex items-center justify-between bg-blue-600 dark:bg-blue-800 text-white px-4 py-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="text-white hover:bg-blue-700 dark:hover:bg-blue-900 p-1 rounded"
              title="编辑表格"
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}
          <button 
            onClick={copyToClipboard}
            className="text-white hover:bg-blue-700 dark:hover:bg-blue-900 p-1 rounded"
            title="复制表格"
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
      </div>
      <div className="p-4 bg-blue-50 dark:bg-slate-800 overflow-x-auto">
        {headers.length === 0 && rows.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-4">
            无表格数据
          </div>
        ) : (
          <table className="w-full border-collapse">
            {headers.length > 0 && (
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  {headers.map((header, index) => (
                    <th 
                      key={`header-${index}`}
                      className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr 
                  key={`row-${rowIndex}`}
                  className={rowIndex % 2 === 0 
                    ? 'bg-white dark:bg-slate-800' 
                    : 'bg-slate-50 dark:bg-slate-750'
                  }
                >
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className="border border-slate-300 dark:border-slate-600 px-4 py-2"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

TableBlock.propTypes = {
  title: PropTypes.string,
  headers: PropTypes.array,
  rows: PropTypes.array,
  activeTheme: PropTypes.object,
  onEdit: PropTypes.func
};

export default TableBlock; 