/**
 * 消息格式化工具
 * 重导出特殊块渲染相关的函数和组件
 */

// 从special-blocks组件目录导出特殊块工厂函数
export { createSpecialBlock } from '../components/special-blocks/index.jsx';

// 从渲染工具导出渲染函数
export {
  renderCodeBlock,
  renderDetailsBlock,
  renderInlineCode,
  renderTableEdit,
  renderLegacyTable,
  renderStatusBlock,
  renderOptionsBlock
} from './rendering/specialBlockRenderer';

// 导出时间格式化工具
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}; 