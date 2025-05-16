import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

// 使用 forwardRef 创建组件
const HeaderTools = forwardRef(({ 
  onTableClick, 
  onImageSettingsClick, 
  onPdfExportClick, 
  onSettingsClick,
  isDarkMode,
  hasData
}, ref) => {
  return (
    <div ref={ref} className="flex items-center space-x-2">
      {/* PDF导出按钮 */}
      <button 
        onClick={onPdfExportClick}
        disabled={!hasData}
        className={`p-2 rounded-full transition-colors duration-200 ${
          isDarkMode 
            ? (hasData ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed') 
            : (hasData ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
        }`}
        title="导出PDF"
        aria-label="导出PDF"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
      
      {/* 表格按钮 */}
      <button 
        onClick={onTableClick}
        disabled={!hasData}
        className={`p-2 rounded-full transition-colors duration-200 ${
          isDarkMode 
            ? (hasData ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed') 
            : (hasData ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
        }`}
        title="查看表格"
        aria-label="查看表格"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
      
      {/* 图像设置按钮 */}
      <button 
        onClick={onImageSettingsClick}
        disabled={!hasData}
        className={`p-2 rounded-full transition-colors duration-200 ${
          isDarkMode 
            ? (hasData ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed') 
            : (hasData ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
        }`}
        title="图像设置"
        aria-label="图像设置"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      {/* 设置按钮 */}
      <button 
        onClick={onSettingsClick}
        className={`p-2 rounded-full transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="设置"
        aria-label="设置"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
});

HeaderTools.displayName = 'HeaderTools';

HeaderTools.propTypes = {
  onTableClick: PropTypes.func.isRequired,
  onImageSettingsClick: PropTypes.func.isRequired,
  onPdfExportClick: PropTypes.func.isRequired,
  onSettingsClick: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  hasData: PropTypes.bool.isRequired
};

export default HeaderTools; 