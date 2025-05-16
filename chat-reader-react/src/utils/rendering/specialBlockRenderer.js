/**
 * 特殊块渲染工具函数
 * 负责将解析后的特殊块数据渲染为 HTML
 */
import DOMPurify from 'dompurify';
import { sanitizeHtml } from '../helpers/sanitize';

/**
 * 渲染代码块
 * @param {string} language - 代码语言
 * @param {string} codeContent - 代码内容
 * @param {object} colors - 主题颜色
 * @param {object} activeTheme - 当前主题
 * @param {string} specialBlockBaseClass - 基础CSS类
 * @param {string} specialBlockHeaderBaseClass - 头部CSS类
 * @param {string} specialBlockContentBaseClass - 内容CSS类
 * @returns {string} 渲染后的HTML字符串
 */
export const renderCodeBlock = (
  language,
  codeContent,
  colors,
  activeTheme,
  specialBlockBaseClass,
  specialBlockHeaderBaseClass,
  specialBlockContentBaseClass
) => {
  const langDisplay = language ? sanitizeHtml(language) : '代码';
  const isDarkTheme = activeTheme.type === 'dark';
  
  const headerBg = colors.specialBlockDefaultHeaderBg || (isDarkTheme ? '#374151' : '#6B7280');
  const headerTextCol = colors.specialBlockDefaultHeaderText || (isDarkTheme ? '#f3f4f6' : '#FFFFFF');
  const contentBg = colors.codeBlockContentBg || (isDarkTheme ? '#1e293b' : '#f8f8f8');
  const contentTextCol = colors.codeBlockContentText || (isDarkTheme ? '#e2e8f0' : '#333333');
  const blockBorderCol = colors.specialBlockBorder || (isDarkTheme ? '#4b5563' : '#e5e7eb');

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const cleanedContent = codeContent.trim();
  const escapedCode = escapeHtml(cleanedContent);
  const codeLines = escapedCode.split('\\n');

  let codeBlockHtml = `
    <div class="${specialBlockBaseClass}" style="border-color: ${blockBorderCol};">
      <div class="${specialBlockHeaderBaseClass}" style="background-color: ${headerBg}; color: ${headerTextCol};">
        <i class="fas fa-code mr-2"></i>${langDisplay}
      </div>
      <div class="${specialBlockContentBaseClass}" style="padding: 0; line-height: 1.5;">
        <pre class="m-0 overflow-x-auto" style="background-color: ${contentBg}; color: ${contentTextCol}; margin: 0;">
          <code class="block p-4 text-sm" style="font-family: monospace, 'Courier New'; white-space: pre;">`;

  codeLines.forEach(line => {
    const indentedLine = line.replace(/^(\\s+)/, match => {
      return match.replace(/ /g, '&nbsp;').replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    });
    codeBlockHtml += indentedLine + '\\n';
  });

  codeBlockHtml += `</code>
        </pre>
      </div>
    </div>`;

  return codeBlockHtml;
};

/**
 * 渲染详情块
 * @param {string} title - 详情块标题
 * @param {string} content - 详情块内容
 * @param {object} colors - 主题颜色
 * @param {object} activeTheme - 当前主题
 * @param {string} specialBlockBaseClass - 基础CSS类
 * @param {string} specialBlockHeaderBaseClass - 头部CSS类
 * @param {string} specialBlockContentBaseClass - 内容CSS类
 * @returns {string} 渲染后的HTML字符串
 */
export const renderDetailsBlock = (
  title,
  content,
  colors,
  activeTheme,
  specialBlockBaseClass,
  specialBlockHeaderBaseClass,
  specialBlockContentBaseClass
) => {
  const isDarkTheme = activeTheme.type === 'dark';
  const headerBg = colors.specialBlockDefaultHeaderBg || (isDarkTheme ? '#374151' : '#6B7280');
  const headerTextCol = colors.specialBlockDefaultHeaderText || (isDarkTheme ? '#f3f4f6' : '#FFFFFF');
  const contentBg = colors.specialBlockDefaultContentBg || (isDarkTheme ? '#1f2937' : '#f9fafb');
  const contentTextCol = colors.specialBlockDefaultContentText || (isDarkTheme ? '#e5e7eb' : '#1f2937');
  const blockBorderCol = colors.specialBlockBorder || (isDarkTheme ? '#4b5563' : '#e5e7eb');

  const sanitizedTitle = sanitizeHtml(title || '详情');
  let sanitizedContent = sanitizeHtml(content);
  sanitizedContent = sanitizedContent.replace(/\\n/g, '<br />');

  return `<div class="${specialBlockBaseClass}" style="border-color: ${blockBorderCol};">
            <div class="${specialBlockHeaderBaseClass}" style="background-color: ${headerBg}; color: ${headerTextCol};">
              <i class="fas fa-eye mr-2"></i>${sanitizedTitle}
            </div>
            <div class="${specialBlockContentBaseClass}" style="background-color: ${contentBg}; color: ${contentTextCol}; line-height: 1.5;">
              ${sanitizedContent}
            </div>
          </div>`;
};

/**
 * 渲染内联代码
 * @param {string} inlineCode - 内联代码内容
 * @param {object} colors - 主题颜色
 * @param {object} activeTheme - 当前主题
 * @returns {string} 渲染后的HTML字符串
 */
export const renderInlineCode = (inlineCode, colors, activeTheme) => {
  const isDarkTheme = activeTheme.type === 'dark';
  const bgColor = colors.inlineCodeBg || (isDarkTheme ? '#2d3748' : '#f3f4f6');
  const textColor = colors.inlineCodeText || (isDarkTheme ? '#e2e8f0' : '#e53e3e');

  const sanitizedCode = sanitizeHtml(inlineCode, {USE_PROFILES: {html: false, mathMl: false, svg: false}});

  return `<code style="background-color: ${bgColor}; color: ${textColor}; padding: 0.1em 0.3em; border-radius: 0.25em; font-family: monospace, 'Courier New';">${sanitizedCode}</code>`;
};

/**
 * 渲染状态块
 * @param {string} type - 状态类型
 * @param {string} title - 状态块标题
 * @param {string} content - 状态块内容
 * @param {object} colors - 主题颜色
 * @param {object} activeTheme - 当前主题
 * @param {string} specialBlockBaseClass - 基础CSS类
 * @param {string} specialBlockHeaderBaseClass - 头部CSS类
 * @param {string} specialBlockContentBaseClass - 内容CSS类
 * @returns {string} 渲染后的HTML字符串
 */
export const renderStatusBlock = (
  type,
  title,
  content,
  colors,
  activeTheme,
  specialBlockBaseClass,
  specialBlockHeaderBaseClass,
  specialBlockContentBaseClass
) => {
  const isDarkTheme = activeTheme.type === 'dark';
  let headerBg, headerTextCol, contentBg, contentTextCol;

  switch (type) {
    case 'info':
      headerBg = colors.infoBg || (isDarkTheme ? '#2563eb' : '#3b82f6');
      headerTextCol = colors.infoText || '#ffffff';
      contentBg = colors.infoContentBg || (isDarkTheme ? '#1e3a8a' : '#eff6ff');
      contentTextCol = colors.infoContentText || (isDarkTheme ? '#bfdbfe' : '#1e3a8a');
      break;
    case 'success':
      headerBg = colors.successBg || (isDarkTheme ? '#059669' : '#10b981');
      headerTextCol = colors.successText || '#ffffff';
      contentBg = colors.successContentBg || (isDarkTheme ? '#064e3b' : '#ecfdf5');
      contentTextCol = colors.successContentText || (isDarkTheme ? '#a7f3d0' : '#064e3b');
      break;
    case 'warning':
      headerBg = colors.warningBg || (isDarkTheme ? '#d97706' : '#f59e0b');
      headerTextCol = colors.warningText || '#ffffff';
      contentBg = colors.warningContentBg || (isDarkTheme ? '#92400e' : '#fffbeb');
      contentTextCol = colors.warningContentText || (isDarkTheme ? '#fcd34d' : '#92400e');
      break;
    case 'error':
      headerBg = colors.errorBg || (isDarkTheme ? '#dc2626' : '#ef4444');
      headerTextCol = colors.errorText || '#ffffff';
      contentBg = colors.errorContentBg || (isDarkTheme ? '#991b1b' : '#fef2f2');
      contentTextCol = colors.errorContentText || (isDarkTheme ? '#fca5a5' : '#991b1b');
      break;
    default:
      headerBg = colors.specialBlockDefaultHeaderBg || (isDarkTheme ? '#374151' : '#6B7280');
      headerTextCol = colors.specialBlockDefaultHeaderText || (isDarkTheme ? '#f3f4f6' : '#FFFFFF');
      contentBg = colors.specialBlockDefaultContentBg || (isDarkTheme ? '#1f2937' : '#f9fafb');
      contentTextCol = colors.specialBlockDefaultContentText || (isDarkTheme ? '#e5e7eb' : '#1f2937');
  }

  const blockBorderCol = colors.specialBlockBorder || (isDarkTheme ? '#4b5563' : '#e5e7eb');
  const sanitizedTitle = sanitizeHtml(title || type.charAt(0).toUpperCase() + type.slice(1));
  let sanitizedContent = sanitizeHtml(content);
  sanitizedContent = sanitizedContent.replace(/\\n/g, '<br />');

  const iconMap = {
    info: 'fa-info-circle',
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    error: 'fa-times-circle'
  };

  return `<div class="${specialBlockBaseClass}" style="border-color: ${blockBorderCol};">
            <div class="${specialBlockHeaderBaseClass}" style="background-color: ${headerBg}; color: ${headerTextCol};">
              <i class="fas ${iconMap[type] || 'fa-info-circle'} mr-2"></i>${sanitizedTitle}
            </div>
            <div class="${specialBlockContentBaseClass}" style="background-color: ${contentBg}; color: ${contentTextCol}; line-height: 1.5;">
              ${sanitizedContent}
            </div>
          </div>`;
};

/**
 * 渲染选项块
 * @param {string} title - 选项块标题
 * @param {Array} options - 选项数组
 * @param {object} colors - 主题颜色
 * @param {object} activeTheme - 当前主题
 * @param {string} specialBlockBaseClass - 基础CSS类
 * @param {string} specialBlockHeaderBaseClass - 头部CSS类
 * @param {string} specialBlockContentBaseClass - 内容CSS类
 * @returns {string} 渲染后的HTML字符串
 */
export const renderOptionsBlock = (
  title,
  options,
  colors,
  activeTheme,
  specialBlockBaseClass,
  specialBlockHeaderBaseClass,
  specialBlockContentBaseClass
) => {
  const isDarkTheme = activeTheme.type === 'dark';
  const headerBg = colors.specialBlockDefaultHeaderBg || (isDarkTheme ? '#374151' : '#6B7280');
  const headerTextCol = colors.specialBlockDefaultHeaderText || (isDarkTheme ? '#f3f4f6' : '#FFFFFF');
  const contentBg = colors.specialBlockDefaultContentBg || (isDarkTheme ? '#1f2937' : '#f9fafb');
  const contentTextCol = colors.specialBlockDefaultContentText || (isDarkTheme ? '#e5e7eb' : '#1f2937');
  const blockBorderCol = colors.specialBlockBorder || (isDarkTheme ? '#4b5563' : '#e5e7eb');

  const sanitizedTitle = sanitizeHtml(title || '选项');
  const sanitizedOptions = options.map(option => ({
    number: option.number,
    label: option.label ? sanitizeHtml(option.label) : undefined,
    content: sanitizeHtml(option.content)
  }));

  let optionsHtml = '<ul class="space-y-2">';
  sanitizedOptions.forEach((option, index) => {
    optionsHtml += `
      <li class="flex items-start gap-3 p-2 hover:bg-opacity-20 hover:bg-gray-500 transition-colors rounded">
        <span class="flex items-center justify-center w-6 h-6 bg-amber-500 dark:bg-amber-700 text-white rounded-full shrink-0 font-medium">
          ${option.number || index + 1}
        </span>
        <div class="flex-1">
          ${option.label ? `<h4 class="font-medium text-amber-800 dark:text-amber-300 mb-1">${option.label}</h4>` : ''}
          <div class="text-slate-700 dark:text-slate-200">${option.content}</div>
        </div>
      </li>`;
  });
  optionsHtml += '</ul>';

  return `<div class="${specialBlockBaseClass}" style="border-color: ${blockBorderCol};">
            <div class="${specialBlockHeaderBaseClass}" style="background-color: ${headerBg}; color: ${headerTextCol};">
              <i class="fas fa-list-ul mr-2"></i>${sanitizedTitle}
            </div>
            <div class="${specialBlockContentBaseClass}" style="background-color: ${contentBg}; color: ${contentTextCol}; line-height: 1.5;">
              ${optionsHtml}
            </div>
          </div>`;
};

/**
 * 渲染表格编辑块
 * @param {string} tableContent - 表格内容
 * @param {object} tableHeaders - 表格头部定义
 * @param {object} colors - 主题颜色
 * @param {object} activeTheme - 当前主题
 * @param {string} specialBlockBaseClass - 基础CSS类
 * @param {string} specialBlockHeaderBaseClass - 头部CSS类
 * @param {string} specialBlockContentBaseClass - 内容CSS类
 * @returns {string} 渲染后的HTML字符串
 */
export const renderTableEdit = (
  tableContent,
  tableHeaders,
  colors,
  activeTheme,
  specialBlockBaseClass,
  specialBlockHeaderBaseClass,
  specialBlockContentBaseClass
) => {
  if (!tableHeaders) {
    console.warn("[renderTableEdit] tableHeaders is null/false. Showing raw content.");
    return `<div class="overflow-auto my-4 p-3 bg-gray-100 dark:bg-gray-800 rounded border" style="white-space: pre-wrap;">${DOMPurify.sanitize(tableContent)}</div>`;
  }

  const parsedTables = parseTableEditContent(tableContent, tableHeaders);

  if (!parsedTables || Object.keys(parsedTables).length === 0) {
    return '';
  }

  let allTablesHtml = '';
  const isDarkTheme = activeTheme.type === 'dark';

  const headerBgColor = colors.tableHeaderBg || (isDarkTheme ? '#374151' : '#f9fafb');
  const headerTextColor = colors.tableHeaderText || (isDarkTheme ? '#f3f4f6' : '#4b5563');
  const bodyBgColor = colors.tableBodyBg || (isDarkTheme ? '#1f2937' : '#ffffff');
  const bodyAltBgColor = colors.tableBodyAltBg || (isDarkTheme ? '#111827' : '#f9fafb');
  const bodyTextColor = colors.tableBodyText || (isDarkTheme ? '#e5e7eb' : '#4b5563');
  const borderColor = colors.tableBorder || (isDarkTheme ? '#4b5563' : '#e5e7eb');

  for (const [tableId, rows] of Object.entries(parsedTables)) {
    if (!rows || rows.length === 0) continue;

    const tableDefinition = tableHeaders[tableId];
    if (!tableDefinition) continue;

    const tableName = tableDefinition.name || `表格 ${tableId}`;
    const columns = tableDefinition.columns || [];

    if (columns.length === 0) continue;

    const hasValidData = rows.some(row => row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
    if (!hasValidData) continue;

    let tableHtml = `
      <div class="my-4">
        <h4 class="text-lg font-semibold mb-2" style="color: ${isDarkTheme ? '#e5e7eb' : '#4b5563'};">${DOMPurify.sanitize(tableName)}</h4>
        <div class="overflow-auto">
          <table class="min-w-full divide-y border" style="border-collapse: collapse; border: 1px solid ${borderColor};">`;

    tableHtml += `<thead style="background-color: ${headerBgColor};"><tr>`;
    columns.forEach(header => {
      tableHtml += `<th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style="border: 1px solid ${borderColor}; color: ${headerTextColor};">${DOMPurify.sanitize(header)}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    rows.forEach((rowData, rowIndex) => {
      const hasRowData = rowData && rowData.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
      if (!hasRowData) return;

      const rowStyle = `background-color: ${rowIndex % 2 === 0 ? bodyBgColor : bodyAltBgColor};`;
      tableHtml += `<tr style="${rowStyle}">`;
      
      for (let i = 0; i < columns.length; i++) {
        const cellData = (rowData && rowData[i] !== undefined) ? rowData[i] : '';
        tableHtml += `<td class="px-3 py-2 whitespace-normal text-sm" style="border: 1px solid ${borderColor}; color: ${bodyTextColor};">${DOMPurify.sanitize(String(cellData))}</td>`;
      }
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table></div></div>';
    allTablesHtml += tableHtml;
  }

  return allTablesHtml;
};

/**
 * 渲染旧版表格
 * @param {string} tableId - 表格ID
 * @param {Array} tableRows - 表格行数据
 * @param {object} tableHeaders - 表格头部定义
 * @param {object} colors - 主题颜色
 * @param {object} activeTheme - 当前主题
 * @param {string} specialBlockBaseClass - 基础CSS类
 * @param {Function} normalizeTableDataUtil - 表格数据标准化工具函数
 * @returns {string} 渲染后的HTML字符串
 */
export const renderLegacyTable = (
  tableId,
  tableRows,
  tableHeaders,
  colors,
  activeTheme,
  specialBlockBaseClass,
  normalizeTableDataUtil
) => {
  if (!tableHeaders || !tableHeaders[tableId]) {
    console.warn(`[renderLegacyTable] No table definition found for tableId: ${tableId}`);
    return '';
  }

  const isDarkTheme = activeTheme.type === 'dark';
  const tableDefinition = tableHeaders[tableId];
  const tableName = tableDefinition.name || `表格 ${tableId}`;
  const columns = tableDefinition.columns || [];

  if (!columns.length || !tableRows || !tableRows.length) {
    return '';
  }

  const headerBgColor = colors.tableHeaderBg || (isDarkTheme ? '#374151' : '#f9fafb');
  const headerTextColor = colors.tableHeaderText || (isDarkTheme ? '#f3f4f6' : '#4b5563');
  const bodyBgColor = colors.tableBodyBg || (isDarkTheme ? '#1f2937' : '#ffffff');
  const bodyAltBgColor = colors.tableBodyAltBg || (isDarkTheme ? '#111827' : '#f9fafb');
  const bodyTextColor = colors.tableBodyText || (isDarkTheme ? '#e5e7eb' : '#4b5563');
  const borderColor = colors.tableBorder || (isDarkTheme ? '#4b5563' : '#e5e7eb');

  let tableHtml = `
    <div class="my-4">
      <h4 class="text-lg font-semibold mb-2" style="color: ${isDarkTheme ? '#e5e7eb' : '#4b5563'};">${DOMPurify.sanitize(tableName)}</h4>
      <div class="overflow-auto">
        <table class="min-w-full divide-y border" style="border-collapse: collapse; border: 1px solid ${borderColor};">`;

  tableHtml += `<thead style="background-color: ${headerBgColor};"><tr>`;
  columns.forEach(header => {
    tableHtml += `<th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style="border: 1px solid ${borderColor}; color: ${headerTextColor};">${DOMPurify.sanitize(header)}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';

  const normalizedRows = normalizeTableDataUtil ? normalizeTableDataUtil(tableRows) : tableRows;

  normalizedRows.forEach((rowData, rowIndex) => {
    const hasRowData = rowData && rowData.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
    if (!hasRowData) return;

    const rowStyle = `background-color: ${rowIndex % 2 === 0 ? bodyBgColor : bodyAltBgColor};`;
    tableHtml += `<tr style="${rowStyle}">`;
    
    for (let i = 0; i < columns.length; i++) {
      const cellData = (rowData && rowData[i] !== undefined) ? rowData[i] : '';
      tableHtml += `<td class="px-3 py-2 whitespace-normal text-sm" style="border: 1px solid ${borderColor}; color: ${bodyTextColor};">${DOMPurify.sanitize(String(cellData))}</td>`;
    }
    tableHtml += '</tr>';
  });

  tableHtml += '</tbody></table></div></div>';
  return tableHtml;
}; 