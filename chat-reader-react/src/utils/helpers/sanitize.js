import DOMPurify from 'dompurify';

/**
 * 清理HTML内容以防止XSS攻击
 * @param {string} content - 要清理的HTML内容
 * @param {Object} options - DOMPurify选项 
 * @returns {string} 清理后的HTML
 */
export const sanitizeHtml = (content, options = {}) => {
  // 添加安全检查
  if (!content) return '';
  
  // 尝试确保内容是字符串
  if (typeof content !== 'string') {
    console.warn('sanitizeHtml: content is not a string, attempting to convert', content);
    try {
      content = String(content);
    } catch (error) {
      console.error('sanitizeHtml: failed to convert content to string', error);
      return '';
    }
  }
  
  // 防止过度嵌套标签造成浏览器卡死
  // 简单的嵌套监测 - 检查是否有连续的开标签但没有关闭标签
  const tagRegex = /<([a-z][a-z0-9]*)\b[^>]*>/gi;
  const matches = content.match(tagRegex) || [];
  if (matches.length > 200) {
    console.warn('sanitizeHtml: excessive HTML tags detected, truncating content');
    content = content.substring(0, 5000); // 限制内容长度
  }

  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'div', 'span', 'br', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'blockquote', 'img'],
    ALLOWED_ATTR: ['href', 'target', 'class', 'id', 'style', 'src', 'alt', 'title'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ADD_ATTR: ['target'], // 添加target属性到a标签
    // 添加更多安全选项
    WHOLE_DOCUMENT: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    MAX_ATTRIBUTE_NAME_LENGTH: 100,
    MAX_ATTRIBUTE_VALUE_LENGTH: 500,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return DOMPurify.sanitize(content, mergedOptions);
  } catch (error) {
    console.error('sanitizeHtml: DOMPurify failed', error);
    // 失败时返回纯文本 - 去除所有HTML标签
    return content.replace(/<[^>]*>/g, '');
  }
};

/**
 * 清理并保留代码块语法的HTML内容
 * @param {string} content - 要清理的HTML内容
 * @returns {string} 清理后的HTML
 */
export const sanitizeCodeContent = (content) => {
  return sanitizeHtml(content, {
    ALLOWED_TAGS: ['code', 'pre', 'span'],
    ALLOWED_ATTR: ['class'],
  });
};

/**
 * 清理表格HTML内容
 * @param {string} content - 要清理的表格HTML内容
 * @returns {string} 清理后的HTML
 */
export const sanitizeTableContent = (content) => {
  return sanitizeHtml(content, {
    ALLOWED_TAGS: ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'br'],
    ALLOWED_ATTR: ['class', 'style'],
  });
};

export default sanitizeHtml; 