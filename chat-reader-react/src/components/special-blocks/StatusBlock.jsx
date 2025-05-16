import React from 'react';
import PropTypes from 'prop-types';
import { sanitizeHtml } from '../../utils/helpers/sanitize';

/**
 * 状态块组件 - 显示通知、警告、错误等信息
 */
const StatusBlock = ({ type = 'info', title, content, colors }) => {
  // 根据类型设置样式
  const getTypeStyles = () => {
    const isDark = colors && colors.type === 'dark';
    
    const typeStyles = {
      info: {
        bg: colors?.statusInfoBg || (isDark ? '#1e3a8a' : '#eff6ff'),
        border: colors?.statusInfoBorder || (isDark ? '#1e40af' : '#bfdbfe'),
        icon: 'fas fa-info-circle',
        text: colors?.statusInfoText || (isDark ? '#93c5fd' : '#1e40af'),
        title: colors?.statusInfoTitle || (isDark ? '#bfdbfe' : '#1e3a8a')
      },
      success: {
        bg: colors?.statusSuccessBg || (isDark ? '#065f46' : '#ecfdf5'),
        border: colors?.statusSuccessBorder || (isDark ? '#047857' : '#a7f3d0'),
        icon: 'fas fa-check-circle',
        text: colors?.statusSuccessText || (isDark ? '#6ee7b7' : '#065f46'),
        title: colors?.statusSuccessTitle || (isDark ? '#a7f3d0' : '#047857')
      },
      warning: {
        bg: colors?.statusWarningBg || (isDark ? '#78350f' : '#fffbeb'),
        border: colors?.statusWarningBorder || (isDark ? '#92400e' : '#fef3c7'),
        icon: 'fas fa-exclamation-triangle',
        text: colors?.statusWarningText || (isDark ? '#fbbf24' : '#92400e'),
        title: colors?.statusWarningTitle || (isDark ? '#fcd34d' : '#78350f')
      },
      error: {
        bg: colors?.statusErrorBg || (isDark ? '#7f1d1d' : '#fef2f2'),
        border: colors?.statusErrorBorder || (isDark ? '#991b1b' : '#fecaca'),
        icon: 'fas fa-times-circle',
        text: colors?.statusErrorText || (isDark ? '#f87171' : '#991b1b'),
        title: colors?.statusErrorTitle || (isDark ? '#fca5a5' : '#7f1d1d')
      }
    };
    
    return typeStyles[type] || typeStyles.info;
  };
  
  const styles = getTypeStyles();
  
  // 安全地处理内容
  const sanitizedContent = sanitizeHtml(content);
  
  return (
    <div
      className="status-block rounded-md my-4"
      style={{
        backgroundColor: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        padding: '1rem',
        position: 'relative',
      }}
    >
      {title && (
        <div className="status-title font-medium mb-2" style={{ color: styles.title }}>
          <i className={`${styles.icon} mr-2`} aria-hidden="true"></i>
          {title}
        </div>
      )}
      <div className="status-content" style={{ color: styles.text }}>
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }}></div>
      </div>
    </div>
  );
};

StatusBlock.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  content: PropTypes.string,
  colors: PropTypes.object
};

export default StatusBlock; 