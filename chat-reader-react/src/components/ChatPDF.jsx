import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
// 移除旧的 base64 字体导入
// import { notoSansSCBase64 } from '../fonts/notoSansSC.js';

// 从 src/assets/fonts 导入字体文件
import NotoSansSCRegular from '../assets/fonts/NotoSansSC-Regular.ttf';
import ArialUnicode from '../assets/fonts/Arial-Unicode.ttf'; // 假设也需要Arial

// 注册字体
Font.register({
  family: 'NotoSansSC',
  src: NotoSansSCRegular,
  // format: 'truetype' // src 直接导入时，format 通常可以省略，库会自动推断
});

Font.register({
  family: 'ArialUnicode', // 确保与样式中使用的 family 名称一致
  src: ArialUnicode,
  // format: 'truetype'
});

// 注册断字回调 - 确保只注册一次，且适合中文场景
// Font.registerHyphenationCallback(word => [word]); // 旧的回调，对于中文 Array.from(word) 更合适
Font.registerHyphenationCallback(word => Array.from(word));


// 创建样式
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'NotoSansSC', // 默认字体
  },
  messageContainer: {
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
    // backgroundColor: '#f0f0f0', // 由主题控制
  },
  userMessage: {
    // backgroundColor: '#d1eaff', // 由主题控制
    alignSelf: 'flex-end',
  },
  botMessage: {
    // backgroundColor: '#e0e0e0', // 由主题控制
    alignSelf: 'flex-start',
  },
  metadata: {
    marginBottom: 5,
    fontSize: 10,
    // color: '#555', // 由主题控制
  },
  username: {
    fontWeight: 'bold',
    marginRight: 5,
    // color: '#333', // 由主题控制
  },
  timestamp: {
    fontSize: 8,
    // color: '#777', // 由主题控制
  },
  content: {
    fontSize: 12, // 默认字体大小，可以被 props.fontSize覆盖
    // color: '#000', // 由主题控制
    fontFamily: 'NotoSansSC', // 确保内容也使用注册的字体
    // wordBreak: 'break-all', // react-pdf 中通常不需要，依赖字体和断字回调
  },
  image: {
    width: 200, // 默认图片宽度
    height: 'auto',
    marginTop: 5,
    marginBottom: 5,
  },
  imagePlaceholder: {
    width: 200,
    height: 100,
    backgroundColor: '#cccccc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  imagePlaceholderText: {
    fontSize: 10,
    color: '#555555',
    fontFamily: 'NotoSansSC',
  },
   codeBlock: {
    backgroundColor: '#f5f5f5', // 浅灰色背景
    padding: 10,
    borderRadius: 4,
    marginVertical: 5,
    fontFamily: 'ArialUnicode', // 为代码块使用一个等宽或不同的字体
    fontSize: 10, // 代码块使用稍小字体
  },
  codeText: {
    fontFamily: 'ArialUnicode', // 确保代码文本本身也用此字体
    color: '#333333',
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'NotoSansSC',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    fontSize: 8,
    bottom: 10,
    left: 20,
    right: 20,
    textAlign: 'center',
    color: 'grey',
    fontFamily: 'NotoSansSC',
  },
});

// 内容处理函数
const processContentForPDF = (content) => {
  if (typeof content !== 'string') {
    // 如果content不是字符串（例如，对于图片消息可能是对象），直接返回
    return content;
  }
  // 移除 __SPECIAL_BLOCK_ emblematic_image_generation_command __ 标记
  // 并移除可能的额外 __SPECIAL_BLOCK_ 前缀（如果存在）
  let processedContent = content.replace(/__SPECIAL_BLOCK_\s*emblematic_image_generation_command\s*__/g, '');
  // 移除所有剩余的 __SPECIAL_BLOCK_ 前缀和 __ 后缀，但保留中间的内容
  processedContent = processedContent.replace(/__SPECIAL_BLOCK_([\s\S]*?)__/g, '$1');
  // 将 Markdown 粗体 **text** 转换为普通文本，因为 react-pdf 的 Text 不直接支持 Markdown
  processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '$1');
  // 将 Markdown 斜体 *text* 或 _text_ 转换为普通文本
  processedContent = processedContent.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // 简单处理Markdown代码块 ```code``` 为普通文本，或考虑更复杂的解析
  // 这里仅作移除标记处理，实际渲染时需要配合<View>和特定样式
  // processedContent = processedContent.replace(/```([\s\S]*?)```/g, '$1');


  // 进一步清理：移除一些可能导致问题的HTML实体或特殊字符（根据需要添加）
  // processedContent = processedContent.replace(/&nbsp;/g, ' ');

  return processedContent;
};


const CodeBlock = ({ code }) => (
  <View style={styles.codeBlock}>
    <Text style={styles.codeText}>{code}</Text>
  </View>
);


// PDF组件
const ChatPDF = ({ chatData, theme, fontSize }) => {
  // console.log("ChatPDF chatData:", chatData);
  // console.log("ChatPDF theme:", theme);
  // console.log("ChatPDF fontSize:", fontSize);

  // 应用主题颜色
  const themeColors = theme?.colors || {};
  const currentFontSize = fontSize ? parseInt(fontSize, 10) : 12;

  if (!chatData || !Array.isArray(chatData.messages) || !chatData.metadata) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No valid chat data available (metadata or messages missing/invalid).</Text>
        </Page>
      </Document>
    );
  }
  
  // 为样式动态应用主题颜色和字体大小
  const dynamicStyles = {
    page: {
      ...styles.page,
      backgroundColor: themeColors.background || '#FFFFFF',
      color: themeColors.text || '#000000',
    },
    messageContainer: {
      ...styles.messageContainer,
    },
    userMessage: {
      ...styles.userMessage,
      backgroundColor: themeColors.userMessageBackground || '#d1eaff',
    },
    botMessage: {
      ...styles.botMessage,
      backgroundColor: themeColors.botMessageBackground || '#e0e0e0',
    },
    metadata: {
      ...styles.metadata,
      color: themeColors.timestamp || '#555',
    },
    username: {
      ...styles.username,
      color: themeColors.username || '#333',
    },
    timestamp: {
      ...styles.timestamp,
      color: themeColors.timestamp || '#777',
    },
    content: {
      ...styles.content,
      fontSize: currentFontSize,
      color: themeColors.text || '#000000',
    },
    header: {
      ...styles.header,
       color: themeColors.text || '#000000',
    },
    footer: {
      ...styles.footer,
      color: themeColors.timestamp || 'grey',
    }
  };

  const chatTitle = chatData.metadata.character_name && chatData.metadata.user_name 
                    ? `${chatData.metadata.character_name} & ${chatData.metadata.user_name}` 
                    : chatData.metadata.title || 'Chat Export';
  const exportTimestamp = new Date().toLocaleString();

  return (
    <Document>
      <Page size="A4" style={dynamicStyles.page}>
        <Text style={dynamicStyles.header}>{chatTitle}</Text>
        {chatData.messages.map((msg, index) => {
          if (!msg || typeof msg.mes !== 'string') {
            return null;
          }

          let senderName = 'Unknown';
          let isUser = false;

          if (typeof msg.name === 'string' && msg.name.trim() !== '') {
            senderName = msg.name;
            if (typeof msg.is_user === 'boolean') {
              isUser = msg.is_user;
            } else if (chatData.metadata && chatData.metadata.user_name === msg.name) {
              isUser = true;
            } else if (chatData.metadata && chatData.metadata.character_name === msg.name) {
              isUser = false;
            }
          } else {
            if (msg.is_user === true && chatData.metadata && chatData.metadata.user_name) {
                senderName = chatData.metadata.user_name;
                isUser = true;
            } else if (msg.is_user === false && chatData.metadata && chatData.metadata.character_name) {
                senderName = chatData.metadata.character_name;
                isUser = false;
            }
          }
          
          const displayName = senderName;
          const messageContent = msg.mes;
          const messageTimestamp = msg.send_date || msg.timestamp || Date.now();

          if (messageContent.startsWith('emblematic_image_generation_command')) {
            const command = messageContent.substring('emblematic_image_generation_command'.length).trim();
            return (
              <View key={index} style={[dynamicStyles.messageContainer, isUser ? dynamicStyles.userMessage : dynamicStyles.botMessage]}>
                <Text style={dynamicStyles.metadata}>
                  <Text style={dynamicStyles.username}>{displayName}</Text> - {new Date(messageTimestamp).toLocaleString()}
                </Text>
                 <CodeBlock code={processContentForPDF(command)} />
              </View>
            );
          }
          if (msg.image_url) {
            return (
              <View key={index} style={[dynamicStyles.messageContainer, isUser ? dynamicStyles.userMessage : dynamicStyles.botMessage]}>
                <Text style={dynamicStyles.metadata}>
                  <Text style={dynamicStyles.username}>{displayName}</Text> - {new Date(messageTimestamp).toLocaleString()}
                </Text>
                <Text style={dynamicStyles.content}>{processContentForPDF(messageContent)}</Text>
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>[Image: {msg.image_url}]</Text>
                </View>
              </View>
            );
          }
          
          if (messageContent.includes('```')) {
            const parts = messageContent.split(/```([\\s\\S]*?)```/g);
            return (
               <View key={index} style={[dynamicStyles.messageContainer, isUser ? dynamicStyles.userMessage : dynamicStyles.botMessage]}>
                <Text style={dynamicStyles.metadata}>
                  <Text style={dynamicStyles.username}>{displayName}</Text> - {new Date(messageTimestamp).toLocaleString()}
                </Text>
                {parts.map((part, i) => {
                  if (i % 2 === 1) {
                    return <CodeBlock key={i} code={part} />;
                  } else {
                    return <Text key={i} style={dynamicStyles.content}>{processContentForPDF(part)}</Text>;
                  }
                })}
              </View>
            )
          }

          return (
            <View key={index} style={[dynamicStyles.messageContainer, isUser ? dynamicStyles.userMessage : dynamicStyles.botMessage]}>
              <Text style={dynamicStyles.metadata}>
                <Text style={dynamicStyles.username}>{displayName}</Text> - {new Date(messageTimestamp).toLocaleString()}
              </Text>
              <Text style={dynamicStyles.content}>{processContentForPDF(messageContent)}</Text>
            </View>
          );
        })}
        <Text style={dynamicStyles.footer}>Exported on {exportTimestamp}</Text>
      </Page>
    </Document>
  );
};

export default ChatPDF; 