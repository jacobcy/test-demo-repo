// 图像设置管理工具

/**
 * 默认的图像设置
 */
const DEFAULT_SETTINGS = {
  scriptEnabled: false,
  mode: 'free',
  freeMode: 'flux-anime',
  sdUrl: 'http://localhost:7860',
  novelaiApi: '',
  width: 512,
  height: 512,
  steps: 20,
  seed: 0,
  fixedPrompt: '',
  negativePrompt: '',
  yushe: {
    '默认': {
      negativePrompt: '',
      fixedPrompt: ''
    }
  },
  yusheid: '默认'
};

/**
 * 从localStorage获取图像设置
 * @returns {Object} 图像设置对象
 */
export const getSettings = () => {
  try {
    const savedSettings = GM_getValue('userImageSettings_v2');
    return savedSettings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading image settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * 保存图像设置到localStorage
 * @param {Object} settings - 要保存的设置对象
 */
export const saveSettings = (settings) => {
  try {
    // 保存整体设置
    GM_setValue('userImageSettings_v2', settings);
    
    // 同时保存各个独立设置项以兼容旧版本
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        GM_setValue(key, JSON.stringify(value));
      } else {
        GM_setValue(key, value);
      }
    });
  } catch (error) {
    console.error('Error saving image settings:', error);
  }
};

/**
 * 添加新的预设
 * @param {Object} settings - 当前设置对象
 * @param {string} presetName - 新预设名称
 * @returns {Object} 更新后的设置对象
 */
export const addPreset = (settings, presetName) => {
  if (!presetName || presetName.trim() === '') {
    throw new Error('预设名称不能为空');
  }

  const newPresetName = presetName.trim();
  if (settings.yushe[newPresetName]) {
    throw new Error(`预设 "${newPresetName}" 已存在`);
  }

  const newSettings = {
    ...settings,
    yushe: {
      ...settings.yushe,
      [newPresetName]: {
        negativePrompt: settings.negativePrompt || '',
        fixedPrompt: settings.fixedPrompt || ''
      }
    },
    yusheid: newPresetName
  };

  saveSettings(newSettings);
  return newSettings;
};

/**
 * 删除预设
 * @param {Object} settings - 当前设置对象
 * @param {string} presetName - 要删除的预设名称
 * @returns {Object} 更新后的设置对象
 */
export const deletePreset = (settings, presetName) => {
  if (Object.keys(settings.yushe).length <= 1) {
    throw new Error('无法删除最后一个预设');
  }

  const newPresets = { ...settings.yushe };
  delete newPresets[presetName];
  
  // 选择第一个可用的预设
  const firstPreset = Object.keys(newPresets)[0];
  
  const newSettings = {
    ...settings,
    yushe: newPresets,
    yusheid: firstPreset
  };

  saveSettings(newSettings);
  return newSettings;
};

/**
 * 更新设置
 * @param {Object} settings - 当前设置对象
 * @param {string} key - 要更新的设置键
 * @param {any} value - 新的设置值
 * @returns {Object} 更新后的设置对象
 */
export const updateSetting = (settings, key, value) => {
  const newSettings = {
    ...settings,
    [key]: value
  };

  saveSettings(newSettings);
  return newSettings;
};

/**
 * 更新预设
 * @param {Object} settings - 当前设置对象
 * @param {string} presetName - 预设名称
 * @returns {Object} 更新后的设置对象
 */
export const updatePreset = (settings, presetName) => {
  if (!settings.yushe[presetName]) {
    throw new Error(`预设 "${presetName}" 不存在`);
  }

  const newSettings = {
    ...settings,
    yusheid: presetName
  };

  saveSettings(newSettings);
  return newSettings;
}; 