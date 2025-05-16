/**
 * 表格渲染工具函数
 * 负责处理表格数据并返回结构化格式
 */

/**
 * 处理表格数据并返回结构化的数据
 * @param {Array|Object} tableData - 表格数据
 * @returns {Object} - 包含格式化后的表格数据的对象
 */
export const processTable = (tableData) => {
  if (!tableData) {
    return {
      headers: [],
      rows: [],
      isEmpty: true
    };
  }

  // 处理数组形式的表格数据
  if (Array.isArray(tableData)) {
    if (tableData.length === 0) {
      return {
        headers: [],
        rows: [],
        isEmpty: true
      };
    }

    // 判断是否有表头
    const hasHeader = Array.isArray(tableData[0]);
    
    if (hasHeader) {
      return {
        headers: tableData[0].map(header => String(header)),
        rows: tableData.slice(1),
        isEmpty: false
      };
    } else {
      // 没有表头，使用索引作为表头
      return {
        headers: tableData[0].map((_, index) => `列 ${index + 1}`),
        rows: tableData,
        isEmpty: false
      };
    }
  }

  // 处理对象形式的表格数据
  if (typeof tableData === 'object' && !Array.isArray(tableData)) {
    const headers = Object.keys(tableData);
    
    // 找出最长的数组长度
    const maxLength = Math.max(...headers.map(key => 
      Array.isArray(tableData[key]) ? tableData[key].length : 0
    ));
    
    // 创建行数据
    const rows = [];
    for (let i = 0; i < maxLength; i++) {
      const row = headers.map(key => {
        if (Array.isArray(tableData[key]) && i < tableData[key].length) {
          return tableData[key][i];
        }
        return '';
      });
      rows.push(row);
    }
    
    return {
      headers,
      rows,
      isEmpty: rows.length === 0
    };
  }

  // 无法处理的数据类型
  return {
    headers: [],
    rows: [],
    isEmpty: true
  };
};

/**
 * 处理表格行数据
 * @param {Array} rows - 表格行数据
 * @param {Object} headers - 表格头部配置
 * @returns {Array} - 处理后的表格行数据
 */
export const processTableRows = (rows, headers = {}) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  return rows.map((row, rowIndex) => {
    // 如果行是字符串，尝试解析为JSON
    if (typeof row === 'string') {
      try {
        row = JSON.parse(row);
      } catch (e) {
        // 解析失败，将其作为单元格内容
        return [row];
      }
    }

    // 处理数组格式的行
    if (Array.isArray(row)) {
      return row.map(cell => String(cell));
    }

    // 处理对象格式的行
    if (typeof row === 'object' && row !== null) {
      if (headers && Object.keys(headers).length > 0) {
        // 使用表头配置的顺序
        return Object.keys(headers).map(key => {
          const headerConfig = headers[key];
          const field = headerConfig.value || key;
          return String(row[field] || '');
        });
      } else {
        // 没有表头配置，使用对象自身的键
        return Object.keys(row).map(key => String(row[key] || ''));
      }
    }

    // 默认返回空行
    return [];
  });
};

/**
 * 转换表格数据为标准格式
 * @param {Array|Object} tableData - 表格数据
 * @returns {Object} - 标准格式的表格数据
 */
export const normalizeTableData = (tableData) => {
  if (!tableData) return { headers: [], rows: [] };

  // 已经是标准格式
  if (tableData.headers && tableData.rows) {
    return tableData;
  }

  return processTable(tableData);
};

/**
 * 处理表格单元格数据
 * @param {*} cell - 单元格数据
 * @returns {string} - 格式化后的单元格内容
 */
export const processCellContent = (cell) => {
  if (cell === null || cell === undefined) {
    return '';
  }

  if (typeof cell === 'object') {
    try {
      return JSON.stringify(cell);
    } catch (e) {
      return String(cell);
    }
  }

  return String(cell);
};

export default {
  processTable,
  processTableRows,
  normalizeTableData,
  processCellContent
}; 