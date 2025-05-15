import React from 'react';

const TableModal = ({ isOpen, onClose, tables, tableHeaders, isDarkMode }) => {
  if (!isOpen) return null;

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
          Object.entries(tables).map(([tableId, rows]) => {
            const headers = tableHeaders && tableHeaders[tableId] ? tableHeaders[tableId] : [];
            
            if (rows.length === 0) return null;
            
            return (
              <div key={tableId} className="mb-6">
                <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  表格 {tableId}
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300 mb-4">
                    <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        {headers.length > 0 ? (
                          headers.map((header, index) => (
                            <th 
                              key={index} 
                              scope="col" 
                              className={`px-3 py-2 text-left text-xs font-medium ${
                                isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-500 border-gray-300'
                              } uppercase tracking-wider border-b`}
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
                      {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {headers.length > 0 ? (
                            headers.map((_, cellIndex) => {
                              const cellData = row[cellIndex] !== undefined ? row[cellIndex] : '';
                              return (
                                <td 
                                  key={cellIndex} 
                                  className={`px-3 py-2 whitespace-normal text-sm ${
                                    isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-300'
                                  } border-r last:border-r-0`}
                                >
                                  {cellData}
                                </td>
                              );
                            })
                          ) : (
                            <td className={`px-3 py-2 whitespace-normal text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {row.join(', ')}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TableModal; 