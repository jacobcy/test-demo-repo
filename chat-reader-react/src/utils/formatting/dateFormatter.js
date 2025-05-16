/**
 * 格式化日期为可读格式
 * @param {string|number|Date} date - 日期或时间戳
 * @param {object} options - 格式化选项
 * @returns {string} - 格式化后的日期字符串
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    
    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
      return '';
    }

    const {
      format = 'full', // 'full', 'date', 'time', 'relative'
      locale = 'zh-CN'
    } = options;

    // 相对时间格式化
    if (format === 'relative') {
      const now = new Date();
      const diffMs = now - dateObj;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      const diffMonth = Math.floor(diffDay / 30);
      const diffYear = Math.floor(diffDay / 365);

      if (diffSec < 60) return '刚刚';
      if (diffMin < 60) return `${diffMin}分钟前`;
      if (diffHour < 24) return `${diffHour}小时前`;
      if (diffDay < 30) return `${diffDay}天前`;
      if (diffMonth < 12) return `${diffMonth}个月前`;
      return `${diffYear}年前`;
    }

    // 标准时间格式化
    let dateOptions = {};
    
    switch (format) {
      case 'full':
        dateOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };
        break;
      case 'date':
        dateOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        };
        break;
      case 'time':
        dateOptions = {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };
        break;
      default:
        if (typeof format === 'object') {
          dateOptions = format;
        }
    }

    return dateObj.toLocaleString(locale, dateOptions);
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '';
  }
};

/**
 * 标准化日期格式
 * @param {string|number|Date} date - 日期输入
 * @returns {string} - ISO格式日期字符串
 */
export const normalizeDate = (date) => {
  if (!date) return '';
  
  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.error('日期标准化错误:', error);
    return '';
  }
};

export default {
  formatDate,
  normalizeDate
}; 