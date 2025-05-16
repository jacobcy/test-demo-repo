/**
 * 图像生成工具 - 基于通用ai插图脚本
 * 这个模块提供了简化版的图像生成功能
 * 
 * 使用指南:
 * 1. 默认格式：image###[提示词]###
 * 2. 示例: image###1girl, solo, masterpiece###
 * 3. 油猴脚本会自动识别这些标签并处理图片生成
 */

// 从localStorage获取设置
const getSettings = () => {
  // 默认设置
  const defaultSettings = {
    scriptEnabled: true,
    mode: 'sd', // free, sd, novelai, comfyui
    freeMode: 'flux-anime',
    sdUrl: 'http://localhost:7860',
    novelaiApi: '',
    width: '512',
    height: '512',
    steps: '28',
    seed: '0',
    fixedPrompt: 'best quality, amazing quality, very aesthetic, absurdres',
    negativePrompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers',
    yushe: { "默认": { negativePrompt: "", fixedPrompt: "" } },
    yusheid: "默认"
  };

  // 初始化 GM_getValue 函数如果不存在
  if (typeof GM_getValue !== 'function') {
    console.warn('GM_getValue not available, using localStorage fallback');
    window.GM_getValue = (key, defaultValue) => {
      const value = localStorage.getItem(key);
      return value !== null ? JSON.parse(value) : defaultValue;
    };
    
    window.GM_setValue = (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    };
  }

  try {
    console.log("[getSettings] Loading image settings");
    
    // 从localStorage获取设置
    const settings = {};
    
    // 首先尝试从userImageSettings_v2获取完整设置
    const savedSettings = GM_getValue("userImageSettings_v2", null);
    
    if (savedSettings && typeof savedSettings === 'object') {
      console.log("[getSettings] Found userImageSettings_v2:", savedSettings);
      // 返回保存的完整设置，但用默认值填充缺失的属性
      return { ...defaultSettings, ...savedSettings };
    }
    
    // 如果没有找到完整的设置，逐个加载各个设置项
    for (const [key, defaultValue] of Object.entries(defaultSettings)) {
      // 对于复杂对象，需要特殊处理，确保不会将字符串解析错误
      if (key === 'yushe') {
        const yusheStr = GM_getValue(key, null);
        if (yusheStr && typeof yusheStr === 'string') {
          try {
            settings[key] = JSON.parse(yusheStr);
          } catch (e) {
            console.error(`[getSettings] Error parsing yushe JSON:`, e);
            settings[key] = defaultValue;
          }
        } else if (yusheStr && typeof yusheStr === 'object') {
          settings[key] = yusheStr;
        } else {
          settings[key] = defaultValue;
        }
      } else {
        settings[key] = GM_getValue(key, defaultValue);
      }
    }
    
    console.log("[getSettings] Compiled settings:", settings);
    return settings;
  } catch (error) {
    console.error("[getSettings] Error loading settings:", error);
    return defaultSettings;
  }
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
  // 这里添加一些调试日志，帮助理解标签处理过程
  if (content && content.includes('image###')) {
    console.log('[processImageGeneration] 检测到图像标签', {
      rawContent: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      hasImageTag: content.includes('image###'),
      imageTagCount: (content.match(/image###/g) || []).length
    });
  }
  return content;
};

export {
  getSettings,
  processImageGeneration
}; 