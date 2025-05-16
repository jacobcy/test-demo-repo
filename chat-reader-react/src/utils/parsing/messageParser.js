import { parseTableEditContent } from '../tableUtils';

/**
 * 消息解析器
 * 负责将原始消息文本解析为结构化对象，包含特殊块标记
 */

/**
 * 解析特殊块的正则表达式
 */
const BLOCK_PATTERNS = {
  CODE: /^```(\w*)\n([\s\S]*?)```$/m,
  DETAILS: /^<details>([\s\S]*?)<\/details>$/m,
  STATUS: /^<status type="(info|success|warning|error)"(?:\s+title="([^"]*)")?>([^]*?)<\/status>$/m,
  OPTIONS: /^<options(?:\s+title="([^"]*)")?>\n([\s\S]*?)<\/options>$/m,
  INLINE_CODE: /`([^`]+)`/g,
  TABLE: /<!-- TABLE_START -->([\s\S]*?)<!-- TABLE_END -->/g
};

/**
 * 过滤<thinking>标签内容和其他可能导致解析问题的内容
 * @param {string} content - 原始内容
 * @returns {string} - 过滤后的内容
 */
export const filterProblematicContent = (content) => {
  if (!content) return '';
  
  try {
    let filtered = content;
    
    // 移除<thinking>标签及其内容（处理多行内容）
    filtered = filtered.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    
    // 过滤```thinking\n...\n```形式的内容
    filtered = filtered.replace(/```thinking[\s\S]*?```/g, '');
    
    // 过滤<thinking>\n...\n</thinking>形式的内容（可能有换行符）
    filtered = filtered.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    
    // 过滤以<thinking>开头但没有正确结束的内容
    const thinkingStartIndex = filtered.indexOf('<thinking>');
    if (thinkingStartIndex !== -1 && filtered.indexOf('</thinking>', thinkingStartIndex) === -1) {
      filtered = filtered.substring(0, thinkingStartIndex);
    }
    
    // 移除其他可能导致解析问题的标签及内容
    const problematicTags = [
      'script', 'style', 'iframe', 'object', 'embed',
      'thinking', 'dataTable', 'ai_thinking', 'internal', 'debugging',
      'analyze', 'analysis', 'planning', 'reasoning', 'Human_inputs', 'User_inputs',
      'Judgment', 'Character', 'Expressive', 'Review'
    ];
    
    problematicTags.forEach(tag => {
      // 移除<tag>...</tag>格式的内容
      const tagRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
      filtered = filtered.replace(tagRegex, '');
      
      // 移除自闭合标签 <tag />
      const selfClosingRegex = new RegExp(`<${tag}[^>]*/?>`, 'gi');
      filtered = filtered.replace(selfClosingRegex, '');
      
      // 处理标签中没有结束标签的情况
      const startTagIndex = filtered.indexOf(`<${tag}`);
      if (startTagIndex !== -1 && filtered.indexOf(`</${tag}>`, startTagIndex) === -1) {
        const endTagIndex = filtered.indexOf('>', startTagIndex);
        if (endTagIndex !== -1) {
          filtered = filtered.substring(0, startTagIndex) + filtered.substring(endTagIndex + 1);
        }
      }
    });
    
    // 过滤掉markdown形式的```标签块
    filtered = filtered.replace(/```[\s\S]*?```/g, '');
    
    // 过滤成对数字（如1. Human_inputs analyze, 2.Review:）
    filtered = filtered.replace(/\d+\.\s*(Human_inputs|Review|Judgment|Character|Expressive)[\s\S]*?(?=\d+\.|$)/gi, '');
    
    // 过滤多余的换行符
    filtered = filtered.replace(/\n{3,}/g, '\n\n');
    
    return filtered;
  } catch (error) {
    console.error('Error filtering problematic content:', error);
    return content; // 返回原始内容，避免过滤错误导致内容丢失
  }
};

/**
 * 解析消息内容为结构化数据
 * @param {string} content - 原始消息内容
 * @returns {Array} - 包含解析后的块对象的数组
 */
export const parseMessageBlocks = (content) => {
  if (!content) return [];

  // 安全措施，防止过度复杂内容
  if (typeof content !== 'string') {
    console.error('Invalid content type, expected string but got:', typeof content);
    return [{ 
      type: 'text',
      content: String(content || '无效内容')
    }];
  }
  
  // 过滤<thinking>标签内容和其他可能导致问题的内容
  content = filterProblematicContent(content);

  // 循环保护 - 限制嵌套和特殊块数量
  const MAX_BLOCKS = 100; // 限制解析的块数量
  let blockCount = 0;

  try {
    // 初始化结果数组
    const blocks = [];
    
    // 使用临时内容变量进行处理
    let remainingContent = content;
    
    // 解析代码块
    const codeMatches = [...remainingContent.matchAll(new RegExp(BLOCK_PATTERNS.CODE, 'g'))];
    for (const match of codeMatches) {
      if (blockCount >= MAX_BLOCKS) {
        console.warn('Max block count reached, stopping parsing');
        break;
      }
      
      // 提取代码块前的文本
      const textBeforeCode = remainingContent.substring(0, match.index);
      if (textBeforeCode.trim()) {
        blocks.push({
          type: 'text',
          content: textBeforeCode
        });
        blockCount++;
      }
      
      // 提取代码块内容
      const codeBlock = match[0];
      const language = match[1] || 'text';
      const code = match[2];
      
      blocks.push({
        type: 'code',
        language,
        content: code
      });
      blockCount++;
      
      // 更新剩余内容
      remainingContent = remainingContent.substring(match.index + codeBlock.length);
    }
    
    // 处理剩余文本
    if (remainingContent.trim()) {
      blocks.push({
        type: 'text',
        content: remainingContent
      });
    }
    
    return blocks;
  } catch (error) {
    console.error('Error parsing message content:', error);
    return [{
      type: 'text',
      content: '解析错误: ' + error.message
    }];
  }
};

/**
 * 通用块解析函数
 * @param {string} content - 要解析的内容
 * @param {RegExp} pattern - 正则表达式模式
 * @param {Function} createBlockObj - 创建块对象的回调函数
 * @param {Array} blocksArray - 块数组引用
 * @param {number} maxBlocks - 最大块数量限制
 * @param {number} currentCount - 当前已处理的块数量
 * @returns {string} - 处理后剩余的内容
 */
const parseBlockType = (content, pattern, createBlockObj, blocksArray, maxBlocks = 100, currentCount = 0) => {
  let blockCount = currentCount;
  let remainingContent = content;
  
  try {
    const matches = [...remainingContent.matchAll(new RegExp(pattern, 'g'))];
    
    for (const match of matches) {
      if (blockCount >= maxBlocks) {
        console.warn('Maximum block count reached in parseBlockType, stopping further parsing');
        break;
      }
      blockCount++;
      
      const fullMatch = match[0];
      const startIndex = remainingContent.indexOf(fullMatch);
      
      // 如果块前有文本，把它作为普通文本块
      if (startIndex > 0) {
        const textBefore = remainingContent.substring(0, startIndex).trim();
        if (textBefore) {
          blocksArray.push({
            type: 'text',
            content: textBefore
          });
        }
      }
      
      // 添加特殊块
      try {
        blocksArray.push(createBlockObj(match));
      } catch (blockError) {
        console.error('Error creating block object:', blockError);
        // 出错时将该部分作为普通文本处理
        blocksArray.push({
          type: 'text',
          content: fullMatch
        });
      }
      
      // 更新剩余内容
      remainingContent = remainingContent.substring(startIndex + fullMatch.length);
    }
  } catch (error) {
    console.error('Error in parseBlockType:', error);
    // 错误恢复 - 不修改内容，直接返回
  }
  
  return remainingContent;
};

/**
 * 解析内联元素
 * @param {string} content - 要解析的文本内容
 * @returns {object} - 包含解析后的内联元素
 */
export const parseInlineElements = (content) => {
  if (!content) return { content };

  // 提取内联代码
  const inlineCodes = [];
  const processedContent = content.replace(BLOCK_PATTERNS.INLINE_CODE, (match, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
    inlineCodes.push({
      type: 'inlineCode',
      content: code,
      placeholder
    });
    return placeholder;
  });

  return {
    content: processedContent,
    inlineCodes
  };
};

/**
 * 解析简单的 Markdown 格式
 * @param {string} content - 要解析的文本内容
 * @returns {object} - 包含格式元素的映射
 */
export const parseMarkdownFormat = (content) => {
  if (!content) return {};

  const formats = {};
  
  // 查找粗体文本
  formats.bold = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let boldMatch;
  while ((boldMatch = boldRegex.exec(content)) !== null) {
    formats.bold.push({
      text: boldMatch[1],
      index: boldMatch.index,
      length: boldMatch[0].length
    });
  }
  
  // 查找斜体文本
  formats.italic = [];
  const italicRegex = /\*(.*?)\*|_(.*?)_/g;
  let italicMatch;
  while ((italicMatch = italicRegex.exec(content)) !== null) {
    formats.italic.push({
      text: italicMatch[1] || italicMatch[2],
      index: italicMatch.index,
      length: italicMatch[0].length
    });
  }
  
  return formats;
};

export default {
  parseMessageBlocks,
  parseInlineElements,
  parseMarkdownFormat,
  filterProblematicContent
}; 