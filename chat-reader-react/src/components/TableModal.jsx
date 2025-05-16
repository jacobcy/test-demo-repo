import React from 'react';
import PropTypes from 'prop-types';

const TableModal = ({ isOpen, onClose, message, headers, theme }) => {
  if (!isOpen || !message) return null;
  
  // 从主题获取isDarkMode
  const isDarkMode = theme && theme.type === 'dark';
  
  // 获取消息中的表格数据
  const tables = message.tables || {};

  // 为表格添加背景色交替的函数
  const getRowStyle = (index, isDarkTheme) => {
    const isEven = index % 2 === 0;
    return {
      backgroundColor: isDarkTheme 
        ? (isEven ? '#1f2937' : '#111827') 
        : (isEven ? '#ffffff' : '#f9fafb')
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`relative p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-w-4xl w-full max-h-[80vh] overflow-auto`}>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="关闭"
        >
          <i className="fas fa-times"></i>
        </button>
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          表格数据
        </h3>
        
        {Object.entries(tables).length === 0 ? (
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            没有找到表格数据。
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(tables).map(([tableId, tableData], tableIndex) => {
              // 如果没有数据，跳过这个表格
              if (!tableData || !Array.isArray(tableData.rows) || tableData.rows.length === 0) {
                return null;
              }
              
              // 获取表头
              const columns = tableData.headers || (headers && headers[tableId] ? 
                Object.values(headers[tableId]).map(h => h.text) : 
                []);
              
              return (
                <div key={tableId} className="overflow-x-auto">
                  <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    表格 {tableIndex + 1}
                  </h4>
                  <table className={`min-w-full divide-y ${
                    isDarkMode ? 'divide-gray-700 border-gray-700' : 'divide-gray-200 border-gray-200'
                  } border`}>
                    <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        {columns.length > 0 ? (
                          columns.map((header, index) => (
                            <th 
                              key={index} 
                              scope="col" 
                              className={`px-3 py-2 text-left text-xs font-medium ${
                                isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-500 border-gray-300'
                              } uppercase tracking-wider border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                            >
                              {header}
                            </th>
                          ))
                        ) : (
                          <th className={`px-3 py-2 text-left text-xs font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-500'
                          } uppercase tracking-wider`}>
                            数据
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${
                      isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                    }`}>
                      {tableData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} style={getRowStyle(rowIndex, isDarkMode)}>
                          {columns.length > 0 ? (
                            columns.map((header, colIndex) => {
                              const cellData = typeof row === 'object' ? 
                                (row[colIndex] || row[header] || '') : 
                                (rowIndex === 0 ? header : '');
                              
                              return (
                                <td 
                                  key={colIndex} 
                                  className={`px-3 py-2 whitespace-nowrap text-sm ${
                                    isDarkMode ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-200'
                                  } border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                                >
                                  {cellData}
                                </td>
                              );
                            })
                          ) : (
                            <td className={`px-3 py-2 whitespace-nowrap text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {typeof row === 'object' ? JSON.stringify(row) : row}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

TableModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.object,
  headers: PropTypes.object,
  theme: PropTypes.object
};

export default TableModal; 