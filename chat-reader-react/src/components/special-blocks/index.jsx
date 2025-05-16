/**
 * 特殊块组件导出文件
 * 统一导出所有特殊块组件
 */
import React from 'react';
import CodeBlock from './CodeBlock';
import TableBlock from './TableBlock';
import DetailsBlock from './DetailsBlock';
import StatusBlock from './StatusBlock';
import OptionsBlock from './OptionsBlock';

/**
 * 创建特殊块组件的工厂函数
 * 用于以统一方式创建各种特殊块组件
 * @param {string} type - 特殊块类型
 * @param {object} props - 传递给组件的属性
 * @returns {React.ReactElement} - React组件元素
 */
export const createSpecialBlock = (type, props = {}) => {
  const { key, ...otherProps } = props;
  
  switch(type) {
    case 'code':
      return <CodeBlock key={key} {...otherProps} />;
    case 'table':
      return <TableBlock key={key} {...otherProps} />;
    case 'details':
      return <DetailsBlock key={key} {...otherProps} />;
    case 'info':
    case 'success':
    case 'warning':
    case 'error':
      return <StatusBlock key={key} type={type} {...otherProps} />;
    case 'options':
      return <OptionsBlock key={key} {...otherProps} />;
    default:
      return <div key={key} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
        <p className="text-sm text-gray-500 dark:text-gray-400">未知块类型: {type}</p>
        {props.content && <div dangerouslySetInnerHTML={{ __html: props.content }} />}
      </div>;
  }
};

// 导出所有组件
export {
  CodeBlock,
  TableBlock,
  DetailsBlock,
  StatusBlock,
  OptionsBlock
}; 