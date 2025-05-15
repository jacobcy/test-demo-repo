import React from 'react';

const HeaderTools = ({ 
  onTableClick, 
  onImageSettingsClick, 
  onPdfExportClick, 
  onSettingsClick,
  isDarkMode,
  hasData
}) => {
  const buttonBaseClasses = "p-2 rounded-full hover:opacity-80 transition-all duration-200";
  const iconColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const disabledIconColor = isDarkMode ? 'text-gray-600' : 'text-gray-400';
  
  return (
    <div className="flex items-center space-x-2">
      {/* 表格按钮 */}
      <button
        onClick={onTableClick}
        className={`${buttonBaseClasses} ${hasData ? '' : 'cursor-not-allowed'}`}
        disabled={!hasData}
        title="查看表格数据"
      >
        <i className={`fas fa-table ${hasData ? iconColor : disabledIconColor}`}></i>
      </button>
      
      {/* 图像设置按钮 */}
      <button
        onClick={onImageSettingsClick}
        className={buttonBaseClasses}
        title="图像生成设置"
      >
        <i className={`fas fa-image ${iconColor}`}></i>
      </button>
      
      {/* PDF导出按钮 */}
      <button
        onClick={onPdfExportClick}
        className={`${buttonBaseClasses} ${hasData ? '' : 'cursor-not-allowed'}`}
        disabled={!hasData}
        title="导出为PDF"
      >
        <i className={`fas fa-file-pdf ${hasData ? iconColor : disabledIconColor}`}></i>
      </button>

      {/* 设置按钮 */}
      <button
        onClick={onSettingsClick}
        className={buttonBaseClasses}
        title="页面显示设置"
      >
        <i className={`fas fa-cog ${iconColor}`}></i>
      </button>
    </div>
  );
};

export default HeaderTools; 