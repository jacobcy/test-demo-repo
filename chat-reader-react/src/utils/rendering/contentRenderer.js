import { sanitizeHtml } from '../helpers/sanitize';
import DOMPurify from 'dompurify';
import { parseTableRowData, normalizeTableData } from '../tableUtils';
import { 
  renderCodeBlock,
  renderDetailsBlock,
  renderInlineCode,
  renderStatusBlock,
  renderOptionsBlock
} from './specialBlockRenderer';
import { renderTables, renderSingleTable } from './tableRenderer';

/**
 * 渲染解析后的消息内容
 * @param {object|string} parsedContent - 解析后的内容对象或原始文本字符串
 * @param {object} options - 渲染选项
 * @returns {string} 渲染后的HTML字符串
 */
export const renderContent = async (parsedContent, options = {}) => {
  if (!parsedContent) {
    return '';
  }

  // 如果传入的是字符串而不是对象，转换为对象格式
  if (typeof parsedContent === 'string') {
    parsedContent = {
      content: parsedContent,
      blocks: []
    };
  }

  const {
    colors = {},
    activeTheme = { type: 'light', colors: {} },
    specialBlockBaseClass = 'my-3 rounded-md overflow-hidden border shadow-sm',
    specialBlockHeaderBaseClass = 'px-3 py-2 font-medium text-sm flex items-center border-b',
    specialBlockContentBaseClass = 'p-3 text-sm overflow-x-auto'
  } = options;

  const blockClasses = {
    base: specialBlockBaseClass,
    header: specialBlockHeaderBaseClass,
    content: specialBlockContentBaseClass
  };

  // 确保有内容属性
  let renderedContent = parsedContent.content || '';
  const blocks = parsedContent.blocks || [];

  // 处理基本Markdown格式
  renderedContent = renderedContent
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // 粗体
    .replace(/\*([^*]+)\*/g, '<em>$1</em>') // 斜体
    .replace(/_([^_]+)_/g, '<em>$1</em>'); // 下划线斜体

  // 渲染所有特殊块
  for (const block of blocks) {
    let renderedBlock = '';
    
    switch (block.type) {
      case 'code':
        renderedBlock = renderCodeBlock(
          block.language,
          block.content,
          colors,
          activeTheme,
          blockClasses.base,
          blockClasses.header,
          blockClasses.content
        );
        break;
        
      case 'details':
        renderedBlock = renderDetailsBlock(
          block.title,
          block.content,
          colors,
          activeTheme,
          blockClasses.base,
          blockClasses.header,
          blockClasses.content
        );
        break;
        
      case 'status':
        renderedBlock = renderStatusBlock(
          block.statusType,
          block.title,
          block.content,
          colors,
          activeTheme,
          blockClasses.base,
          blockClasses.header,
          blockClasses.content
        );
        break;
        
      case 'options':
        renderedBlock = renderOptionsBlock(
          block.title,
          block.options,
          colors,
          activeTheme,
          blockClasses.base,
          blockClasses.header,
          blockClasses.content
        );
        break;
        
      case 'inlineCode':
        renderedBlock = renderInlineCode(
          block.content,
          colors,
          activeTheme
        );
        break;
    }
    
    renderedContent = renderedContent.replace(block.placeholder, renderedBlock);
  }

  // 处理换行符
  renderedContent = renderedContent.replace(/\n/g, '<br />');

  // 最终的安全处理
  return sanitizeHtml(renderedContent, {
    allowedTags: ['div', 'span', 'p', 'br', 'i', 'em', 'strong', 'code', 'pre', 'ul', 'li', 'h4', 'details', 'summary'],
    allowedAttributes: {
      '*': ['class', 'style']
    },
    allowedStyles: {
      '*': {
        'color': [/^#(0-9a-f){3,6}$/i, /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/],
        'background-color': [/^#(0-9a-f){3,6}$/i, /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/],
        'padding': [/^[\d.]+(px|em|rem)(\s+[\d.]+(px|em|rem)){0,3}$/],
        'margin': [/^[\d.]+(px|em|rem)(\s+[\d.]+(px|em|rem)){0,3}$/],
        'border-radius': [/^[\d.]+(px|em|rem)$/],
        'border-color': [/^#(0-9a-f){3,6}$/i, /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/],
        'border-left': [/.*/],
        'border': [/.*/],
        'font-family': [/.*/],
        'font-weight': [/.*/],
        'font-size': [/.*/],
        'white-space': ['pre'],
        'line-height': [/^[\d.]+$/],
        'text-align': [/.*/],
        'cursor': [/.*/],
        'box-shadow': [/.*/],
        'transition': [/.*/]
      }
    }
  });
};

/**
 * 渲染普通文本内容
 * @param {string} content - 要渲染的内容
 * @returns {string} - 处理后的HTML内容
 */
export const renderTextContent = (content) => {
  if (!content) return '';
  
  // 处理基本的Markdown语法
  let processedContent = content
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // 粗体
    .replace(/\*([^*]+)\*/g, '<em>$1</em>') // 斜体
    .replace(/`([^`]+)`/g, '<code>$1</code>') // 内联代码
    .replace(/\n/g, '<br />'); // 换行
    
  return sanitizeHtml(processedContent);
};

/**
 * 渲染表格内容
 * @param {Array} tableData - 表格数据数组
 * @returns {string} - 表格的HTML字符串
 */
export const renderTableContent = (tableData) => {
  if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
    return '<div class="text-center text-slate-500 dark:text-slate-400 py-4">无表格数据</div>';
  }
  
  let tableHtml = '<table class="w-full border-collapse">';
  
  // 添加表头
  const hasHeader = Array.isArray(tableData[0]);
  if (hasHeader) {
    tableHtml += '<thead class="bg-slate-100 dark:bg-slate-700">';
    tableHtml += '<tr>';
    
    for (const cell of tableData[0]) {
      tableHtml += `<th class="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">${sanitizeHtml(String(cell))}</th>`;
    }
    
    tableHtml += '</tr>';
    tableHtml += '</thead>';
  }
  
  // 添加表格主体
  tableHtml += '<tbody>';
  
  const startRow = hasHeader ? 1 : 0;
  for (let i = startRow; i < tableData.length; i++) {
    tableHtml += `<tr class="${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-750'}">`; 
    
    for (const cell of tableData[i]) {
      tableHtml += `<td class="border border-slate-300 dark:border-slate-600 px-4 py-2">${sanitizeHtml(String(cell))}</td>`;
    }
    
    tableHtml += '</tr>';
  }
  
  tableHtml += '</tbody>';
  tableHtml += '</table>';
  
  return tableHtml;
};

export default {
  renderContent,
  renderTextContent,
  renderTableContent
}; 