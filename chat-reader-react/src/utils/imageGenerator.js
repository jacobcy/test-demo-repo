/**
 * 图像生成工具 - 基于通用ai插图脚本
 * 这个模块提供了简化版的图像生成功能
 */

// 从localStorage获取设置
const getSettings = () => {
  // 默认设置
  const defaultSettings = {
    scriptEnabled: true,
    mode: 'free', // free, sd, novelai, comfyui
    sdUrl: 'http://localhost:7860',
    novelaiApi: '',
    width: '512',
    height: '512',
    steps: '28',
    seed: '0',
    fixedPrompt: 'best quality, amazing quality, very aesthetic, absurdres',
    negativePrompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers'
  };

  // 从localStorage获取设置
  const settings = {};
  for (const [key, defaultValue] of Object.entries(defaultSettings)) {
    settings[key] = GM_getValue(key, defaultValue);
  }

  return settings;
};

// 生成随机种子
const generateRandomSeed = () => {
  return Math.floor(Math.random() * 10000000000);
};

// 免费模式生成图片
const generateImageFree = async (prompt, width, height) => {
  const settings = getSettings();
  const seed = generateRandomSeed();
  
  // 简单处理prompt
  prompt = prompt.replace(/\s+/g, ' ').trim();
  
  // 使用pollinations.ai API
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width || settings.width}&height=${height || settings.height}&seed=${seed}`;
  
  return url;
};

// 处理图像生成指令
const processImageGeneration = async (content) => {
  // 不处理图像生成标记，保持原样以便油猴脚本处理
  // 这里不再替换image###标记，只返回原始内容
  return content;
};

export {
  getSettings,
  processImageGeneration
}; 