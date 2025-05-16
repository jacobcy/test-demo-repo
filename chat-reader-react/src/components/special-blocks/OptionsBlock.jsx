import React from 'react';
import PropTypes from 'prop-types';
import { sanitizeHtml } from '../../utils/helpers/sanitize';

/**
 * 选项块组件 - 显示可供选择的选项列表
 */
const OptionsBlock = ({ title, options = [], colors }) => {
  const isDark = colors && colors.type === 'dark';

  // 根据主题决定样式
  const styles = {
    container: {
      backgroundColor: colors?.optionsBlockBg || (isDark ? '#1f2937' : '#f9fafb'),
      border: `1px solid ${colors?.optionsBorder || (isDark ? '#374151' : '#e5e7eb')}`,
      borderRadius: '0.5rem',
      padding: '1rem',
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    title: {
      color: colors?.optionsTitle || (isDark ? '#e5e7eb' : '#1f2937'),
      fontWeight: '600',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
    },
    optionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    option: {
      backgroundColor: colors?.optionBg || (isDark ? '#374151' : '#ffffff'),
      color: colors?.optionText || (isDark ? '#d1d5db' : '#374151'),
      border: `1px solid ${colors?.optionBorder || (isDark ? '#4b5563' : '#e5e7eb')}`,
      borderRadius: '0.375rem',
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      transition: 'all 150ms ease',
      display: 'block',
      width: '100%',
      textAlign: 'left',
    },
    optionHover: {
      backgroundColor: colors?.optionHoverBg || (isDark ? '#4b5563' : '#f3f4f6'),
    }
  };

  // 安全地处理每个选项内容
  const sanitizedOptions = options.map(option => {
    return {
      ...option,
      content: sanitizeHtml(option.content || '')
    };
  });
  
  // 处理选项点击
  const handleOptionClick = (option) => {
    console.log('Selected option:', option);
    // 这里可以添加选项点击后的处理逻辑
    // 例如：触发回调函数，更新状态等
  };

  return (
    <div className="options-block" style={styles.container}>
      {title && (
        <div className="options-title" style={styles.title}>
          <i className="fas fa-list-ul mr-2" aria-hidden="true"></i>
          {title}
        </div>
      )}
      
      <div className="options-list" style={styles.optionList}>
        {sanitizedOptions.map((option, index) => (
          <button
            key={index}
            className="option-item"
            style={styles.option}
            onClick={() => handleOptionClick(option)}
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, styles.optionHover);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = styles.option.backgroundColor;
            }}
          >
            {option.label && (
              <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">{option.label}</h4>
            )}
            <div className="text-slate-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: option.content }}></div>
          </button>
        ))}
      </div>
    </div>
  );
};

OptionsBlock.propTypes = {
  title: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.object),
  colors: PropTypes.object
};

export default OptionsBlock; 