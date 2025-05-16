import { sanitizeHtml } from '../helpers/sanitize';

/**
 * 解析特殊块的正则表达式
 */
const BLOCK_PATTERNS = {
  CODE: /^```(\w*)\n([\s\S]*?)```$/m,
  DETAILS: /^<details>([\s\S]*?)<\/details>$/m,
  STATUS: /^<status type="(info|success|warning|error)"(?:\s+title="([^"]*)")?>([^]*?)<\/status>$/m,
  OPTIONS: /^<options(?:\s+title="([^"]*)")?>\n([\s\S]*?)<\/options>$/m,
  INLINE_CODE: /`([^`]+)`/g
};

/**
 * 解析代码块
 * @param {string} content - 原始内容
 * @returns {object} 解析后的代码块对象
 */
const parseCodeBlocks = (content) => {
  const blocks = [];
  let processedContent = content;

  processedContent = processedContent.replace(BLOCK_PATTERNS.CODE, (match, language, code) => {
    const placeholder = `__CODE_BLOCK_${blocks.length}__`;
    blocks.push({
      type: 'code',
      language,
      content: code,
      placeholder
    });
    return placeholder;
  });

  return { blocks, content: processedContent };
};

/**
 * 解析详情块
 * @param {string} content - 原始内容
 * @returns {object} 解析后的详情块对象
 */
const parseDetailsBlocks = (content) => {
  const blocks = [];
  let processedContent = content;

  processedContent = processedContent.replace(BLOCK_PATTERNS.DETAILS, (match, details) => {
    const placeholder = `__DETAILS_BLOCK_${blocks.length}__`;
    const [title, ...contentLines] = details.split('\\n');
    blocks.push({
      type: 'details',
      title,
      content: contentLines.join('\\n'),
      placeholder
    });
    return placeholder;
  });

  return { blocks, content: processedContent };
};

/**
 * 解析状态块
 * @param {string} content - 原始内容
 * @returns {object} 解析后的状态块对象
 */
const parseStatusBlocks = (content) => {
  const blocks = [];
  let processedContent = content;

  processedContent = processedContent.replace(BLOCK_PATTERNS.STATUS, (match, type, title, content) => {
    const placeholder = `__STATUS_BLOCK_${blocks.length}__`;
    blocks.push({
      type: 'status',
      statusType: type,
      title,
      content,
      placeholder
    });
    return placeholder;
  });

  return { blocks, content: processedContent };
};

/**
 * 解析选项块
 * @param {string} content - 原始内容
 * @returns {object} 解析后的选项块对象
 */
const parseOptionsBlocks = (content) => {
  const blocks = [];
  let processedContent = content;

  processedContent = processedContent.replace(BLOCK_PATTERNS.OPTIONS, (match, title, optionsContent) => {
    const placeholder = `__OPTIONS_BLOCK_${blocks.length}__`;
    const options = optionsContent.split('\\n')
      .filter(line => line.trim())
      .map(line => {
        const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numberMatch) {
          return {
            number: numberMatch[1],
            content: numberMatch[2]
          };
        }
        
        const labelMatch = line.match(/^([^:]+):\s+(.*)$/);
        if (labelMatch) {
          return {
            label: labelMatch[1],
            content: labelMatch[2]
          };
        }
        
        return {
          content: line
        };
      });

    blocks.push({
      type: 'options',
      title,
      options,
      placeholder
    });
    return placeholder;
  });

  return { blocks, content: processedContent };
};

/**
 * 解析内联代码
 * @param {string} content - 原始内容
 * @returns {object} 解析后的内联代码对象
 */
const parseInlineCode = (content) => {
  const blocks = [];
  let processedContent = content;

  processedContent = processedContent.replace(BLOCK_PATTERNS.INLINE_CODE, (match, code) => {
    const placeholder = `__INLINE_CODE_${blocks.length}__`;
    blocks.push({
      type: 'inlineCode',
      content: code,
      placeholder
    });
    return placeholder;
  });

  return { blocks, content: processedContent };
};

/**
 * 解析消息内容
 * @param {string} content - 原始消息内容
 * @param {object} activeTheme - 当前主题对象
 * @returns {string} - 格式化后的HTML内容
 */
export const parseContent = (content, activeTheme) => {
  if (!content) return '';

  let processedContent = content;
  let allBlocks = [];

  // 按顺序处理各种特殊块
  const codeResult = parseCodeBlocks(processedContent);
  processedContent = codeResult.content;
  allBlocks = [...allBlocks, ...codeResult.blocks];

  const detailsResult = parseDetailsBlocks(processedContent);
  processedContent = detailsResult.content;
  allBlocks = [...allBlocks, ...detailsResult.blocks];

  const statusResult = parseStatusBlocks(processedContent);
  processedContent = statusResult.content;
  allBlocks = [...allBlocks, ...statusResult.blocks];

  const optionsResult = parseOptionsBlocks(processedContent);
  processedContent = optionsResult.content;
  allBlocks = [...allBlocks, ...optionsResult.blocks];
  
  const inlineCodeResult = parseInlineCode(processedContent);
  processedContent = inlineCodeResult.content;
  allBlocks = [...allBlocks, ...inlineCodeResult.blocks];

  // 处理换行符
  processedContent = processedContent.replace(/\\n/g, '\n');

  // 处理基本Markdown格式
  processedContent = processedContent
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // 粗体
    .replace(/\*([^*]+)\*/g, '<em>$1</em>') // 斜体
    .replace(/_([^_]+)_/g, '<em>$1</em>'); // 下划线斜体

  // 渲染特殊块
  allBlocks.forEach(block => {
    const blockHtml = renderBlock(block, activeTheme || { type: 'light', colors: {} });
    processedContent = processedContent.replace(block.placeholder, blockHtml);
  });

  // 处理换行符为HTML换行
  processedContent = processedContent.replace(/\n/g, '<br />');

  // 清理和安全处理
  processedContent = sanitizeHtml(processedContent);

  return processedContent;
};

// 渲染特殊块
const renderBlock = (block, activeTheme) => {
  const isDark = activeTheme.type === 'dark';
  const colors = activeTheme.colors || {};
  
  switch (block.type) {
    case 'code':
      return `<pre class="code-block-container ${isDark ? 'dark' : 'light'}" style="background-color: ${colors.codeBlockContentBg || (isDark ? '#1e293b' : '#f8f8f8')}; color: ${colors.codeBlockContentText || (isDark ? '#e2e8f0' : '#333333')}; border-radius: 0.375rem; padding: 1rem; margin: 1rem 0; overflow-x: auto;"><code class="language-${block.language}">${block.content}</code></pre>`;
    
    case 'inlineCode':
      return `<code class="inline-code" style="background-color: ${colors.inlineCodeBg || (isDark ? '#2d3748' : '#f3f4f6')}; color: ${colors.inlineCodeText || (isDark ? '#f87171' : '#ef4444')}; padding: 0.1em 0.3em; border-radius: 0.25em; font-family: monospace, 'Courier New';">${block.content}</code>`;
    
    case 'details':
      return `<details class="details-block my-3 rounded-md overflow-hidden border shadow-sm" style="border-color: ${colors.specialBlockBorder || (isDark ? '#4b5563' : '#e5e7eb')}">
        <summary style="background-color: ${colors.specialBlockDefaultHeaderBg || (isDark ? '#374151' : '#6B7280')}; color: ${colors.specialBlockDefaultHeaderText || (isDark ? '#f3f4f6' : '#FFFFFF')}; padding: 0.5rem 1rem; font-weight: 500; cursor: pointer;">${block.title}</summary>
        <div style="background-color: ${colors.specialBlockDefaultContentBg || (isDark ? '#1f2937' : '#f9fafb')}; color: ${colors.specialBlockDefaultContentText || (isDark ? '#e5e7eb' : '#1f2937')}; padding: 1rem;">${block.content}</div>
      </details>`;
    
    case 'status':
      let headerBg, headerText, contentBg, contentText;
      
      switch (block.statusType) {
        case 'info':
          headerBg = colors.infoBg || (isDark ? '#2563eb' : '#3b82f6');
          headerText = colors.infoText || '#ffffff';
          contentBg = colors.infoContentBg || (isDark ? '#1e3a8a' : '#eff6ff');
          contentText = colors.infoContentText || (isDark ? '#bfdbfe' : '#1e3a8a');
          break;
        case 'success':
          headerBg = colors.successBg || (isDark ? '#059669' : '#10b981');
          headerText = colors.successText || '#ffffff';
          contentBg = colors.successContentBg || (isDark ? '#064e3b' : '#ecfdf5');
          contentText = colors.successContentText || (isDark ? '#a7f3d0' : '#064e3b');
          break;
        case 'warning':
          headerBg = colors.warningBg || (isDark ? '#d97706' : '#f59e0b');
          headerText = colors.warningText || '#ffffff';
          contentBg = colors.warningContentBg || (isDark ? '#92400e' : '#fffbeb');
          contentText = colors.warningContentText || (isDark ? '#fcd34d' : '#92400e');
          break;
        case 'error':
          headerBg = colors.errorBg || (isDark ? '#dc2626' : '#ef4444');
          headerText = colors.errorText || '#ffffff';
          contentBg = colors.errorContentBg || (isDark ? '#991b1b' : '#fef2f2');
          contentText = colors.errorContentText || (isDark ? '#fca5a5' : '#991b1b');
          break;
        default:
          headerBg = colors.specialBlockDefaultHeaderBg || (isDark ? '#374151' : '#6B7280');
          headerText = colors.specialBlockDefaultHeaderText || (isDark ? '#f3f4f6' : '#FFFFFF');
          contentBg = colors.specialBlockDefaultContentBg || (isDark ? '#1f2937' : '#f9fafb');
          contentText = colors.specialBlockDefaultContentText || (isDark ? '#e5e7eb' : '#1f2937');
      }
      
      return `<div class="status-block my-3 rounded-md overflow-hidden border shadow-sm" style="border-color: ${colors.specialBlockBorder || (isDark ? '#4b5563' : '#e5e7eb')}">
        <div class="status-header px-3 py-2 font-medium" style="background-color: ${headerBg}; color: ${headerText};">${block.title || block.statusType.toUpperCase()}</div>
        <div class="status-content p-3" style="background-color: ${contentBg}; color: ${contentText};">${block.content}</div>
      </div>`;
    
    case 'options':
      return `<div class="options-block my-3 rounded-md overflow-hidden border shadow-sm" style="border-color: ${colors.specialBlockBorder || (isDark ? '#4b5563' : '#e5e7eb')}">
        ${block.title ? `<div class="options-header px-3 py-2 font-medium" style="background-color: ${colors.specialBlockDefaultHeaderBg || (isDark ? '#374151' : '#6B7280')}; color: ${colors.specialBlockDefaultHeaderText || (isDark ? '#f3f4f6' : '#FFFFFF')};">${block.title}</div>` : ''}
        <div class="options-content p-3" style="background-color: ${colors.specialBlockDefaultContentBg || (isDark ? '#1f2937' : '#f9fafb')}; color: ${colors.specialBlockDefaultContentText || (isDark ? '#e5e7eb' : '#1f2937')};">
          ${block.options.map(option => `<div class="option py-1">${option.number ? `<span style="font-weight: 500; color: ${colors.primary || '#6366f1'}">${option.number}.</span> ` : ''}${option.label ? `<span style="font-weight: 500;">${option.label}:</span> ` : ''}${option.content}</div>`).join('')}
        </div>
      </div>`;
    
    default:
      return block.content;
  }
};

/**
 * 解析消息内容，识别特殊块
 * @param {string} content - 消息内容
 * @returns {Array} - 解析后的内容块数组
 */
export const parseMessageContent = (content) => {
  if (!content) return [{ type: 'text', content: '' }];
  
  const specialBlockRegex = /```(\w*)\s*(?:\[(.*?)\])?\s*\n([\s\S]*?)```/g;
  const blocks = [];
  let lastIndex = 0;
  let match;
  
  while ((match = specialBlockRegex.exec(content)) !== null) {
    // 添加特殊块前的普通文本（如果有）
    if (match.index > lastIndex) {
      const textContent = content.substring(lastIndex, match.index).trim();
      if (textContent) {
        blocks.push({ type: 'text', content: textContent });
      }
    }
    
    // 解析特殊块类型和内容
    const blockType = (match[1] || 'code').toLowerCase();
    const blockTitle = match[2] || '';
    const blockContent = match[3];
    
    blocks.push({
      type: blockType,
      title: blockTitle,
      content: blockContent
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // 添加最后一段普通文本（如果有）
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex).trim();
    if (textContent) {
      blocks.push({ type: 'text', content: textContent });
    }
  }
  
  return blocks;
};

/**
 * 解析代码块，提取语言和内容
 * @param {Object} block - 代码块对象
 * @returns {Object} - 扩展的代码块对象
 */
export const parseCodeBlock = (block) => {
  if (block.type !== 'code') return block;
  
  // 尝试从第一行中提取语言信息
  const lines = block.content.split('\n');
  let language = '';
  let content = block.content;
  
  if (lines.length > 0 && lines[0].trim().startsWith('language:')) {
    language = lines[0].trim().substring(9).trim();
    content = lines.slice(1).join('\n');
  } else {
    // 默认视为普通代码块
    language = block.type === 'code' ? '' : block.type;
  }
  
  return {
    ...block,
    language,
    content
  };
};

/**
 * 解析表格内容，转换为结构化数据
 * @param {string} content - 表格内容文本
 * @returns {Array} - 解析后的表格数据数组
 */
export const parseTableContent = (content) => {
  if (!content) return [];
  
  // 分割每一行
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];
  
  // 检查表格格式
  const headerMatch = lines[0].match(/^\|(.+)\|$/);
  if (!headerMatch) return [];
  
  const tableData = [];
  
  // 处理每一行
  for (let i = 0; i < lines.length; i++) {
    // 跳过分隔行（通常是第二行，如：| --- | --- |）
    if (i === 1 && lines[i].match(/^\|[-:\s|]+\|$/)) continue;
    
    const line = lines[i].trim();
    if (!line.startsWith('|') || !line.endsWith('|')) continue;
    
    // 提取单元格内容
    const cells = line.substring(1, line.length - 1).split('|');
    
    // 处理每个单元格，去除前后空格
    const rowData = cells.map(cell => cell.trim());
    tableData.push(rowData);
  }
  
  return tableData;
};

/**
 * 解析选项列表内容
 * @param {string} content - 选项内容文本
 * @returns {Array} - 解析后的选项数组
 */
export const parseOptionsContent = (content) => {
  if (!content) return [];
  
  const lines = content.trim().split('\n');
  const options = [];
  let currentOption = null;
  
  for (const line of lines) {
    // 检查是否是新选项的开始（数字+点+空格）
    const optionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    
    if (optionMatch) {
      // 保存前一个选项（如果有）
      if (currentOption) {
        options.push(currentOption);
      }
      
      // 创建新选项
      currentOption = {
        number: parseInt(optionMatch[1], 10),
        label: optionMatch[2],
        content: ''
      };
    } else if (currentOption) {
      // 继续添加到当前选项的内容
      currentOption.content += (currentOption.content ? '\n' : '') + line;
    }
  }
  
  // 添加最后一个选项
  if (currentOption) {
    options.push(currentOption);
  }
  
  return options;
};

export default {
  parseMessageContent,
  parseCodeBlock,
  parseTableContent,
  parseOptionsContent,
  parseContent
}; 