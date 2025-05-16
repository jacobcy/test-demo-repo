export function parseTableRowData(dataString) {
  console.log("[parseTableRowData] Processing data string:", dataString);
  
  if (!dataString || typeof dataString !== 'string') {
    console.error("[parseTableRowData] Invalid data string:", dataString);
    return [];
  }
  
  try {
    const entries = [];
    // RegExp to match key:"value" pairs, handling escaped quotes in value
    const pairRegex = /(\d+):"((?:\\.|[^"\\])*)"/g;
    let match;
    
    while ((match = pairRegex.exec(dataString)) !== null) {
      // Key is match[1], Value is match[2]. Replace escaped quotes in value.
      const key = parseInt(match[1], 10);
      const value = match[2].replace(/\\"/g, '"');
      console.log(`[parseTableRowData] Found entry - key: ${key}, value: ${value}`);
      entries.push([key, value]);
    }
    
    if (entries.length === 0) {
      console.warn("[parseTableRowData] No valid entries found in:", dataString);
    }
    
    // Sort by key to ensure correct order
    entries.sort((a, b) => a[0] - b[0]);
    
    // Return only the values (second element of each pair)
    const result = entries.map(entry => entry[1]);
    console.log("[parseTableRowData] Final parsed result:", result);
    return result;
  } catch (error) {
    console.error("[parseTableRowData] Error parsing table data:", error, "Data:", dataString);
    return [];
  }
} 

// 辅助函数：整理表格数据并填充可能缺失的单元格
export function normalizeTableData(rows, expectedColumnCount) {
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    console.warn("[normalizeTableData] No rows to normalize");
    return [];
  }
  
  try {
    console.log(`[normalizeTableData] Normalizing ${rows.length} rows to ${expectedColumnCount} columns`);
    
    // 确保每行都有相同数量的列
    return rows.map(row => {
      if (!Array.isArray(row)) {
        console.warn("[normalizeTableData] Row is not an array:", row);
        // 如果行不是数组，创建一个空数组填充
        return Array(expectedColumnCount).fill('');
      }
      
      // 如果行的长度不足，用空字符串填充
      if (row.length < expectedColumnCount) {
        console.log(`[normalizeTableData] Row has ${row.length} columns, expected ${expectedColumnCount}. Padding...`);
        return [...row, ...Array(expectedColumnCount - row.length).fill('')];
      }
      
      // 如果行太长，截断
      if (row.length > expectedColumnCount) {
        console.log(`[normalizeTableData] Row has ${row.length} columns, expected ${expectedColumnCount}. Truncating...`);
        return row.slice(0, expectedColumnCount);
      }
      
      return row;
    });
  } catch (error) {
    console.error("[normalizeTableData] Error normalizing table data:", error);
    return rows; // 返回原始数据以避免丢失
  }
}

// 新增函数：解析tableEdit内容，支持insertRow和updateRow操作
export function parseTableEditContent(content, tableHeaders) {
  console.log("[parseTableEditContent] Parsing tableEdit content");
  
  if (!content || typeof content !== 'string') {
    console.error("[parseTableEditContent] Invalid content:", content);
    return {};
  }

  // 提取注释内容中的表格操作
  const commentMatch = content.match(/<!--([\s\S]*?)-->/);
  if (!commentMatch || !commentMatch[1]) {
    console.warn("[parseTableEditContent] No valid comment found in tableEdit content");
    return {};
  }

  const operationsContent = commentMatch[1].trim();
  console.log("[parseTableEditContent] Extracted operations:", operationsContent);

  // 解析所有表格操作
  const insertRowRegex = /insertRow\((\d+),\s*({.*?})\)/g;
  const updateRowRegex = /updateRow\((\d+),\s*(\d+),\s*({.*?})\)/g;
  
  const tables = {}; // 存储所有表格的数据
  const operations = []; // 存储所有操作，便于按顺序处理

  // 收集所有insertRow操作
  let match;
  while ((match = insertRowRegex.exec(operationsContent)) !== null) {
    const tableId = match[1];
    const rowData = match[2];
    operations.push({
      type: 'insert',
      tableId,
      rowData,
      original: match[0],
      index: match.index
    });
  }

  // 收集所有updateRow操作
  while ((match = updateRowRegex.exec(operationsContent)) !== null) {
    const tableId = match[1];
    const rowIndex = parseInt(match[2], 10);
    const rowData = match[3];
    operations.push({
      type: 'update',
      tableId,
      rowIndex,
      rowData,
      original: match[0],
      index: match.index
    });
  }

  // 按照在原文中出现的顺序排序操作
  operations.sort((a, b) => a.index - b.index);
  
  // 按顺序执行所有操作
  for (const operation of operations) {
    const { type, tableId, rowData } = operation;
    
    // 检查表格定义是否存在
    const tableDefinition = tableHeaders && tableHeaders[tableId];
    if (!tableDefinition) {
      console.warn(`[parseTableEditContent] Table definition not found for tableId: ${tableId}`);
      continue; // 跳过此操作
    }
    
    // 获取表格的列数和列定义
    const expectedColumns = tableDefinition.columns.length;
    const columnDefinitions = tableDefinition.columns;
    
    // 初始化表格数据结构
    if (!tables[tableId]) {
      tables[tableId] = [];
    }
    
    try {
      if (type === 'insert') {
        // 解析行数据并验证格式
        const rawDataEntries = [];
        const pairRegex = /(\d+):"((?:\\.|[^"\\])*)"/g;
        let dataMatch;
        
        // 收集所有的键值对
        while ((dataMatch = pairRegex.exec(rowData)) !== null) {
          const key = parseInt(dataMatch[1], 10);
          const value = dataMatch[2].replace(/\\"/g, '"');
          rawDataEntries.push([key, value]);
        }
        
        // 检查数据是否有足够的列，以及是否与表头定义的结构匹配
        if (rawDataEntries.length === 0) {
          console.warn(`[parseTableEditContent] No valid data found for insertion in table ${tableId}`);
          continue;
        }
        
        // 检查列索引是否在有效范围内
        const validData = rawDataEntries.every(([key, _]) => key >= 0 && key < expectedColumns);
        if (!validData) {
          console.warn(`[parseTableEditContent] Data contains invalid column indices for table ${tableId}`);
          continue;
        }
        
        // 创建一个新行，初始化为空
        const newRow = Array(expectedColumns).fill('');
        
        // 填充有效数据
        for (const [key, value] of rawDataEntries) {
          if (key < expectedColumns) {
            newRow[key] = value;
          }
        }
        
        // 确保行数据与表头定义匹配
        // 检查是否至少有一个非空值
        const hasData = newRow.some(cell => cell !== '');
        if (!hasData) {
          console.warn(`[parseTableEditContent] Row data is empty for table ${tableId}`);
          continue;
        }
        
        // 将行添加到表格中
        tables[tableId].push(newRow);
        console.log(`[parseTableEditContent] Inserted row to table ${tableId}:`, newRow);
      } 
      else if (type === 'update') {
        const { rowIndex } = operation;
        
        // 确保表格中有这一行
        if (rowIndex >= tables[tableId].length) {
          console.warn(`[parseTableEditContent] Cannot update row ${rowIndex} in table ${tableId}, row does not exist`);
          continue; // 跳过此操作
        }
        
        // 解析要更新的数据
        const updateEntries = [];
        const pairRegex = /(\d+):"((?:\\.|[^"\\])*)"/g;
        let dataMatch;
        
        // 收集所有的键值对
        while ((dataMatch = pairRegex.exec(rowData)) !== null) {
          const key = parseInt(dataMatch[1], 10);
          const value = dataMatch[2].replace(/\\"/g, '"');
          updateEntries.push([key, value]);
        }
        
        // 检查数据是否有效，且列索引在范围内
        const validUpdate = updateEntries.every(([key, _]) => key >= 0 && key < expectedColumns);
        if (!validUpdate) {
          console.warn(`[parseTableEditContent] Update contains invalid column indices for table ${tableId}`);
          continue;
        }
        
        // 获取当前行进行更新
        const currentRow = tables[tableId][rowIndex];
        
        // 只更新有效列的数据
        for (const [key, value] of updateEntries) {
          if (key < expectedColumns) {
            currentRow[key] = value;
          }
        }
        
        console.log(`[parseTableEditContent] Updated row ${rowIndex} in table ${tableId}:`, currentRow);
      }
    } catch (error) {
      console.error(`[parseTableEditContent] Error processing operation: ${operation.original}`, error);
    }
  }
  
  // 清理结果：移除空表格，确保每个表格至少有一行有效数据
  const finalTables = {};
  for (const [tableId, rows] of Object.entries(tables)) {
    if (rows.length > 0) {
      // 检查是否至少有一行包含实际数据
      const hasData = rows.some(row => row.some(cell => cell.trim() !== ''));
      if (hasData) {
        finalTables[tableId] = rows;
      } else {
        console.log(`[parseTableEditContent] Table ${tableId} has no valid data, skipping`);
      }
    }
  }

  return finalTables;
} 