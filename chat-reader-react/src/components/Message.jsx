import React, { useState, useEffect } from 'react';
// 条件导入DOMPurify，如果不可用则使用空函数
let DOMPurify = { sanitize: (html) => html };
try {
  DOMPurify = require('dompurify');
} catch (error) {
  console.warn('DOMPurify not available, using unsanitized HTML');
}
import { processImageGeneration } from '../utils/imageGenerator';
import { parseTableRowData } from '../utils/tableUtils'; // 从 utils 导入

// 移除硬编码的tableHeaders，将从外部加载
// const tableHeaders = { ... }; 

// Helper function to parse table row data string - 已移至 tableUtils.js
/*
function parseTableRowData(dataString) {
  // console.log("[parseTableRowData] Input:", dataString);
  const entries = [];
  const pairRegex = /(\d+):"((?:\\.|[^"\\])*)"/g;
  let match;
  while ((match = pairRegex.exec(dataString)) !== null) {
    entries.push([parseInt(match[1], 10), match[2].replace(/\\"/g, '"')]);
  }
  entries.sort((a, b) => a[0] - b[0]);
  const result = entries.map(entry => entry[1]);
  // console.log("[parseTableRowData] Output:", result);
  return result;
}
*/

function Message({ 
  message, 
  characterName, 
  userName, 
  activeTheme,
  fontSize,
  tableHeaders, // 新增 prop: 从 ChatDisplay 接收 tableHeaders
  showImageGeneration = true, 
  showTableEdit = true, 
  showStatusBlock = true,
  showDetailsBlock = true,
  showOptionsBlock = true,
  showCodeBlock = true
}) {
  const { name, is_user, is_name, mes, status_block, options, create_date, role, source } = message;
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  // 移除 fetchedTableHeaders 状态，将直接使用 props 中的 tableHeaders
  // const [fetchedTableHeaders, setFetchedTableHeaders] = useState(null); 

  // 移除 useEffect Hook，因为 tableHeaders 将通过 props 传入
  /*
  useEffect(() => {
    // console.log("[Message Effect] Attempting to load table headers..."); // 移除
    const loadTableHeaders = async () => {
      try {
        const response = await fetch('/table_headers.json');
        // console.log("[Message Effect] Fetch response status:", response.status); // 移除
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for /table_headers.json`);
        }
        const data = await response.json();
        setFetchedTableHeaders(data);
        // console.log("[Message Effect] Table headers loaded successfully:", data); // 移除
      } catch (error) {
        console.error("[Message Effect] Failed to load table headers:", error);
        setFetchedTableHeaders({}); 
      }
    };
    loadTableHeaders();
  }, []); 
  */

  const senderName = is_user ? userName : (name || characterName);
  const isSystemMessage = role === 'system' || name === 'System';
  const messageTimestamp = create_date ? new Date(create_date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '';

  const { colors } = activeTheme;

  let bubbleClasses = "px-5 py-4 rounded-xl shadow-md max-w-xl lg:max-w-2xl xl:max-w-3xl break-words";
  let wrapperClasses = "flex mb-6 items-end";
  let nameClasses = "font-semibold mb-2";
  let contentClasses = "leading-relaxed whitespace-pre-wrap mes_text";
  let timestampClasses = "mt-2 text-xs";
  
  let bubbleStyles = {};
  if (is_user) {
    bubbleStyles = {
      backgroundColor: colors.userBubbleBg,
      color: colors.userBubbleText,
    };
    wrapperClasses += " justify-end";
    nameClasses += " text-right";
    timestampClasses += " text-right";
  } else if (isSystemMessage) {
    bubbleStyles = {
      backgroundColor: colors.systemBubbleBg,
      color: colors.systemBubbleText,
    };
    wrapperClasses += " justify-center text-center";
    contentClasses += " italic";
    timestampClasses += " text-right";
  } else { 
    bubbleStyles = {
      backgroundColor: colors.charBubbleBg,
      color: colors.charBubbleText,
      borderColor: colors.charBubbleBorder,
    };
    bubbleClasses += " border";
    wrapperClasses += " justify-start";
  }

  const specialBlockClasses = "my-3 rounded-md overflow-hidden border shadow-sm";
  const blockHeaderClasses = "px-3 py-2 font-medium text-sm flex items-center";
  const blockContentClasses = "p-3 text-sm overflow-x-auto";

  const specialBlockFontStyle = {
    fontSize: `${fontSize}rem`
  };

  const processImageTags = async (text) => {
    return text;
  };

  const createSpecialBlock = (icon, title, content, type = "default") => {
    let headerBg = colors.specialBlockCodeHeaderBg || '#f9fafb';
    let headerText = colors.specialBlockDefaultHeaderText || '#374151';
    let contentBg = colors.specialBlockCodeContentBg || '#ffffff';
    let contentText = colors.specialBlockDefaultContentText || '#1f2937';
    let blockBorder = colors.specialBlockBorder || '#e5e7eb';

    const headerStyle = `background-color: ${headerBg}; color: ${headerText}; font-size: ${fontSize * 0.85}rem;`;
    const actualContentBg = (type === "code" && colors.specialBlockCodeOnlyContentBg) ? colors.specialBlockCodeOnlyContentBg : contentBg;
    const actualContentText = (type === "code" && colors.specialBlockCodeOnlyContentText) ? colors.specialBlockCodeOnlyContentText : contentText;
    const contentStyle = `background-color: ${actualContentBg}; color: ${actualContentText}; font-size: ${fontSize * 0.85}rem;`;
    const borderStyle = `border-color: ${blockBorder};`;
    
    const sanitizedTitle = DOMPurify.sanitize(title);
    let processedContent;

    if (type === "code") {
      const escapeHtml = (unsafe) => {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
      };
      processedContent = `<pre><code style="white-space: pre-wrap; display: block;">${escapeHtml(content)}</code></pre>`;
    } else if (type === "options_block_type") {
      processedContent = content;
    } else {
      processedContent = DOMPurify.sanitize(content).replace(/\n/g, '<br/>');
    }

    return `<div class="${specialBlockClasses}" style="${borderStyle}">
      <div class="${blockHeaderClasses} border-b" style="${headerStyle} border-color: ${blockBorder};">
        <i class="${icon} mr-2"></i>${sanitizedTitle}
      </div>
      <div class="${blockContentClasses}" style="${contentStyle}">
        ${processedContent}
      </div>
    </div>`;
  };

  const processContent = async (rawContent) => {
    // console.log("[processContent] Called. rawContent (start):", rawContent ? rawContent.substring(0, 50) + '...' : 'null'); // 移除
    if (typeof rawContent !== 'string') {
      console.warn("[processContent] rawContent is not a string. Returning empty.");
      return '';
    }
    // 使用传入的 tableHeaders prop
    if (!tableHeaders) {
      console.warn("[processContent] tableHeaders prop is null/false. Returning raw content (basic newline replace).");
      return DOMPurify.sanitize(rawContent).replace(/\n/g, '<br />');
    }
    // console.log("[processContent] Headers available:", JSON.parse(JSON.stringify(tableHeaders))); // 移除

    let processedString = rawContent;
    const specialBlocks = []; 

    if (showCodeBlock) {
      processedString = processedString.replace(
        /```([\s\S]*?)```/gi,
        (match, codeContent) => {
          const blockHTML = createSpecialBlock("fas fa-code", "代码", codeContent.trim(), "code");
          const placeholder = `__SPECIAL_BLOCK_${specialBlocks.length}__`;
          specialBlocks.push({ placeholder, blockHTML });
          return placeholder;
        }
      );
    }
    
    const lines = processedString.split('\n');
    // console.log(`[processContent] Split into ${lines.length} lines.`); // 移除
    let finalHtmlSegments = [];
    let currentTableId = null;
    let currentTableRows = [];

    const renderTable = () => {
      if (currentTableId === null && currentTableRows.length === 0) {
        return;
      }
      // 使用传入的 tableHeaders prop
      if (!tableHeaders) {
        console.warn("[renderTable] tableHeaders prop is null/false. Cannot render table.");
        // Push rows as text if they exist
        currentTableRows.forEach(rowData => finalHtmlSegments.push(DOMPurify.sanitize(rowData.join(', '))));
        currentTableId = null;
        currentTableRows = [];
        return;
      }
      // 使用传入的 tableHeaders prop
      if (tableHeaders && !tableHeaders[currentTableId]) {
         console.warn(`[renderTable] No headers defined in tableHeaders prop for tableId: ${currentTableId}. Rows will be joined as text.`);
         currentTableRows.forEach(rowData => finalHtmlSegments.push(DOMPurify.sanitize(rowData.join(', '))));
         currentTableId = null;
         currentTableRows = [];
         return;
      }

      // 使用传入的 tableHeaders prop
      if (currentTableId !== null && currentTableRows.length > 0 && tableHeaders && tableHeaders[currentTableId]) {
        const headers = tableHeaders[currentTableId];
        console.log(`[renderTable] Headers for table ${currentTableId}:`, headers);
        if (headers && headers.length > 0) {
          const isDarkTheme = colors.charBubbleBg.startsWith('#1') || colors.charBubbleBg.startsWith('#2') || colors.charBubbleBg.startsWith('#0');
          const headerBgColor = isDarkTheme ? '#374151' : '#f9fafb';
          const headerTextColor = isDarkTheme ? '#f3f4f6' : '#4b5563';
          const bodyBgColor = isDarkTheme ? '#1f2937' : '#ffffff';
          const bodyTextColor = isDarkTheme ? '#e5e7eb' : '#4b5563';
          const borderColor = isDarkTheme ? '#4b5563' : '#e5e7eb';
          
          let tableHtml = `<table class="min-w-full divide-y my-2" style="border-collapse: collapse; border: 1px solid ${borderColor};">`;
          tableHtml += `<thead style="background-color: ${headerBgColor}"><tr>`;
          headers.forEach(header => {
            tableHtml += `<th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style="border: 1px solid ${borderColor}; color: ${headerTextColor};">${DOMPurify.sanitize(header)}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
          currentTableRows.forEach((rowData, rowIndex) => {
            console.log(`[renderTable] Rendering row ${rowIndex} for table ${currentTableId}:`, rowData);
            const rowStyle = rowIndex % 2 === 0 ? `background-color: ${bodyBgColor};` : `background-color: ${isDarkTheme ? '#111827' : '#f9fafb'};`;
            tableHtml += `<tr style="${rowStyle}">`;
            for (let i = 0; i < headers.length; i++) {
                const cellData = rowData[i] !== undefined ? rowData[i] : '';
                tableHtml += `<td class="px-3 py-2 whitespace-normal text-sm" style="border: 1px solid ${borderColor}; color: ${bodyTextColor};">${DOMPurify.sanitize(cellData)}</td>`;
            }
            tableHtml += '</tr>';
          });
          tableHtml += '</tbody></table>';
          finalHtmlSegments.push(tableHtml);
          console.log(`[renderTable] Table ${currentTableId} HTML generated and pushed.`);
        } else {
           console.warn(`[renderTable] Headers array for tableId ${currentTableId} is empty or undefined. Rows will be joined as text.`);
           currentTableRows.forEach(rowData => finalHtmlSegments.push(DOMPurify.sanitize(rowData.join(', '))));
        }
      
        currentTableId = null;
        currentTableRows = [];
        return;
      }
      
      // 如果没有满足上面的条件，作为文本处理
      if (currentTableRows.length > 0) {
          console.warn(`[renderTable] Condition for rendering table not fully met. Orphaned rows for tableId ${currentTableId}. Rendering as text.`);
          currentTableRows.forEach(rowData => finalHtmlSegments.push(DOMPurify.sanitize(rowData.join(', '))));
      }
      currentTableId = null;
      currentTableRows = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // console.log(`[processContent] Processing line ${i + 1}/${lines.length}: "${line ? line.substring(0, 70) + '...' : ''}"`); // 移除
      const tableRowMatch = line.match(/^insertRow\((\d+),\s*({.*?})\)$/);
      if (showTableEdit && tableRowMatch) {
        // console.log("[processContent] Table row matched:", tableRowMatch[0]); // 移除
        const tableId = parseInt(tableRowMatch[1], 10);
        const dataObjectString = tableRowMatch[2];
        if (tableId !== currentTableId && currentTableId !== null) {
          console.log(`[processContent] Table ID changed from ${currentTableId} to ${tableId}. Rendering old table.`);
          renderTable(); 
        }
        currentTableId = tableId;
        try {
          const rowData = parseTableRowData(dataObjectString);
          currentTableRows.push(rowData);
          // console.log(`[processContent] Added row to table ${currentTableId}:`, rowData); // 移除
        } catch (e) {
          console.error("[processContent] Error parsing table row data for string:", dataObjectString, e);
          renderTable(); 
          finalHtmlSegments.push(DOMPurify.sanitize(line)); 
        }
      } else {
        // console.log("[processContent] Line is not a table row. Rendering pending table (if any) and adding line."); // 移除
        renderTable(); 
        if (specialBlocks.some(b => b.placeholder === line.trim())) {
            finalHtmlSegments.push(line);
        } else {
            finalHtmlSegments.push(DOMPurify.sanitize(line));
        }
      }
    }
    // console.log("[processContent] Finished processing all lines. Rendering any final pending table."); // 移除
    renderTable(); 

    let resultHtml = finalHtmlSegments.join('\n');
    // console.log("[processContent] HTML segments joined. Length:", resultHtml.length); // 移除

    for (const { placeholder, blockHTML } of specialBlocks) {
      const escapedPlaceholder = placeholder.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
      const regex = new RegExp(escapedPlaceholder, 'g');
      resultHtml = resultHtml.replace(regex, blockHTML);
    }
    // console.log("[processContent] Special blocks replaced. Final HTML length:", resultHtml.length); // 移除
    return resultHtml.replace(/\n/g, '<br />');
  };

  const [processedHtml, setProcessedHtml] = useState('');
  
  useEffect(() => {
    // console.log("[Message Effect for mes] Triggered. mes (start):", message.mes ? message.mes.substring(0,30) + '...' : 'null', "Headers loaded?", !!tableHeaders); // 移除
    const processMessageContent = async () => {
      if (message.mes && tableHeaders) { 
        // console.log("[Message Effect for mes] Both mes and tableHeaders are available. Calling processContent."); // 移除
        try {
          const processed = await processContent(message.mes);
          setProcessedHtml(processed);
          // console.log("[Message Effect for mes] processContent finished. processedHtml (start):", processed ? processed.substring(0,100) + '...' : 'null'); // 移除
        } catch (error) {
          console.error("[Message Effect for mes] Error in processContent:", error);
          setProcessedHtml('处理消息出错，请刷新页面重试。');
        }
      } else if (message.mes && !tableHeaders) {
        console.warn("[Message Effect for mes] Headers not loaded yet for this message. Setting raw mes (basic newline handling).");
        setProcessedHtml(DOMPurify.sanitize(message.mes).replace(/\n/g, '<br />'));
      } else if (!message.mes) {
        // console.log("[Message Effect for mes] mes is null or empty. Setting empty processedHtml."); // 移除
        setProcessedHtml('');
      } else {
        // This case (headers loaded but no mes) should ideally not set processedHtml if it depends on mes.
        // Or, if mes can be empty and still needs some default rendering based on headers, handle here.
        // console.log("[Message Effect for mes] message.mes is falsy or headers not loaded, state:", {hasMes: !!message.mes, hasHeaders: !!tableHeaders}); // 移除
        setProcessedHtml(''); // Default to empty if no message content
      }
    };
    processMessageContent();
  }, [message.mes, tableHeaders, showCodeBlock, showTableEdit]); // Removed processContent from dependencies, it's defined in same scope
  
  const createMarkup = () => ({ __html: processedHtml });

  const parseOptions = (optionsString) => {
    if (!showOptionsBlock || !optionsString) return null; 
    
    let processedString = optionsString;
    const detailsMatches = [];
    
    if (showDetailsBlock) {
        processedString = processedString.replace(/<details>([\s\S]*?)<\/details>/gi, (match) => {
            const placeholder = `__DETAILS_PLACEHOLDER_${detailsMatches.length}__`;
            detailsMatches.push(match);
            return placeholder;
        });
    } else {
        processedString = processedString.replace(/<details>([\s\S]*?)<\/details>/gi, "[详情已隐藏]"); 
    }
        
    const lines = processedString.replace(/\r\n/g, '\n').split('\n');
    let title = '';
    const choices = [];
    let noteLines = [];
    let parsingStage = 'title_or_choice';

    for (const rawLine of lines) {
      const trimmedLine = rawLine.trim();
      if (trimmedLine === '') {
        if (choices.length > 0 && parsingStage !== 'note') {
          parsingStage = 'note_pending_content'; 
        }
        continue; 
      }

      if (showDetailsBlock && trimmedLine.includes('__DETAILS_PLACEHOLDER_')) {
        const placeholderIndexMatch = trimmedLine.match(/__DETAILS_PLACEHOLDER_(\d+)__/);
        if (placeholderIndexMatch) {
            const placeholderIndex = parseInt(placeholderIndexMatch[1]);
            if (!isNaN(placeholderIndex) && placeholderIndex < detailsMatches.length) {
                if (choices.length === 0 && parsingStage === 'title_or_choice') {
                    title = trimmedLine.replace(/__DETAILS_PLACEHOLDER_\d+__/g, '').trim();
                    parsingStage = 'choices_or_note';
                } else {
                    choices.push(trimmedLine); 
                    parsingStage = 'choices';
                }
            }
            continue;
        }        
      }

      if (parsingStage === 'title_or_choice') {
        if (/^\d+\.\s/.test(trimmedLine)) {
          choices.push(trimmedLine);
          parsingStage = 'choices';
        } else {
          title = trimmedLine;
          parsingStage = 'choices_or_note';
        }
      } else if (parsingStage === 'choices_or_note') {
          if (/^\d+\.\s/.test(trimmedLine)) {
              choices.push(trimmedLine);
              parsingStage = 'choices';
          } else {
              noteLines.push(trimmedLine);
              parsingStage = 'note';
          }
      } else if (parsingStage === 'choices') {
        if (/^\d+\.\s/.test(trimmedLine)) {
          choices.push(trimmedLine);
        } else {
          noteLines.push(trimmedLine);
          parsingStage = 'note';
        }
      } else if (parsingStage === 'note' || parsingStage === 'note_pending_content') {
        noteLines.push(trimmedLine);
        parsingStage = 'note';
      }
    }
    
    let finalChoices = choices;
    if (showDetailsBlock) {
        finalChoices = choices.map(choice => {
            return choice.replace(/__DETAILS_PLACEHOLDER_(\d+)__/g, (match, index) => {
                return detailsMatches[parseInt(index)] || '';
            });
        });
    }
    
    let finalNote = noteLines.join('\n');
    if (showDetailsBlock) {
        finalNote = finalNote.replace(/__DETAILS_PLACEHOLDER_(\d+)__/g, (match, index) => {
            return detailsMatches[parseInt(index)] || '';
        });
    }
        
    if (!title && finalChoices.length === 0 && !finalNote && optionsString.trim()) {
      return { title: '', choices: [], note: DOMPurify.sanitize(optionsString.trim()) };
    }

    return { 
      title: DOMPurify.sanitize(title), 
      choices: finalChoices, 
      note: DOMPurify.sanitize(finalNote) 
    };
  };

  // Removed the autoProcessImageTags useEffect as油猴 script is responsible.

  return (
    <div className={wrapperClasses}>
      {!is_user && !isSystemMessage && (
        <div 
          style={{ backgroundColor: colors.charBubbleBg, color: colors.charBubbleText }} 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0`}
        >
          {senderName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className={`flex flex-col ${is_user ? 'items-end' : 'items-start'}`}>
        {!isSystemMessage && (
            <p className={nameClasses} style={{ color: is_user ? colors.userBubbleText : colors.charBubbleText, opacity: 0.9 }}>{senderName}</p>
        )}
        <div className={bubbleClasses} style={bubbleStyles}>
          {/* Added message-content class for potential querySelectorAll target */}
          <div className={`${contentClasses} message-content`} dangerouslySetInnerHTML={createMarkup()} /> 
          
          {status_block && showStatusBlock && (
            <div dangerouslySetInnerHTML={{__html: createSpecialBlock("fas fa-info-circle", "状态信息", status_block, "default")}} />
          )}

          {options && showOptionsBlock && (() => {
            const parsed = parseOptions(options);
            if (!parsed) return null; 

            let optionsContent = '';
            if (parsed.title) {
              optionsContent += `<h4 class="font-semibold mb-3">${parsed.title}</h4>`; 
            }
            if (parsed.choices.length > 0) {
              optionsContent += '<ul class="list-none pl-1 mb-3 space-y-2">';
              parsed.choices.forEach(choice => {
                const matchNumber = choice.match(/^\d+\./)?.[0] || '';
                let content = choice.replace(/^\d+\.\s*/, '');
                optionsContent += `<li class="flex items-start rounded-md p-2">
                  <span class="mr-2 font-medium" style="color: ${colors.iconActive || '#4F46E5'}">${matchNumber}</span>
                  <div class="flex-1 choice-content">${content}</div>
                </li>`;
              });
              optionsContent += '</ul>';
            }
            if (parsed.note) {
              optionsContent += `<p class="whitespace-pre-wrap pt-2 border-t" style="border-color: ${colors.specialBlockBorder || '#e5e7eb'}; opacity: 0.9">
                <i class="fas fa-info-circle mr-1.5 opacity-70"></i>${parsed.note} 
              </p>`; 
            }
            if (!optionsContent.trim()) return null; 
            return <div dangerouslySetInnerHTML={{__html: createSpecialBlock("fas fa-list-alt", "选项", optionsContent, "options_block_type")}} />;
          })()}
          
          {messageTimestamp && <p className={timestampClasses} style={{color: bubbleStyles.color, opacity: 0.7}}>{messageTimestamp}</p>}
        </div>
      </div>

      {is_user && !isSystemMessage && (
         <div 
          style={{ backgroundColor: colors.userBubbleBg, color: colors.userBubbleText }} 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ml-3 flex-shrink-0`}
         >
          {senderName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default Message; 