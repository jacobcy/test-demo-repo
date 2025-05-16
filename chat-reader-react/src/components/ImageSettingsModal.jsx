import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, addPreset, deletePreset, updateSetting, updatePreset } from '../utils/imageSettings';
import '../utils/tampermonkeyPolyfill';

const ImageSettingsModal = ({ isOpen, onClose, isDarkMode }) => {
  const [settings, setSettings] = useState(getSettings());
  const [selectedPreset, setSelectedPreset] = useState(settings.yusheid || '默认');
  const [presets, setPresets] = useState(settings.yushe || { '默认': { negativePrompt: '', fixedPrompt: '' } });

  // 监控设置变化，并更新到localStorage
  useEffect(() => {
    if (settings) {
      saveSettings(settings);
    }
  }, [settings]);

  // 当预设变化时更新设置
  useEffect(() => {
    if (selectedPreset && presets[selectedPreset]) {
      try {
        const newSettings = updatePreset(settings, selectedPreset);
        setSettings(newSettings);
      } catch (error) {
        console.error('Error updating preset:', error);
      }
    }
  }, [selectedPreset]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    try {
      const newSettings = updateSetting(settings, name, newValue);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  // 处理预设变化
  const handlePresetChange = (e) => {
    setSelectedPreset(e.target.value);
  };

  // 添加新预设
  const handleAddPreset = () => {
    const presetName = prompt('请输入新预设名称:');
    if (presetName && presetName.trim() !== '') {
      try {
        const newSettings = addPreset(settings, presetName);
        setSettings(newSettings);
        setPresets(newSettings.yushe);
        setSelectedPreset(presetName);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // 删除当前预设
  const handleDeletePreset = () => {
    if (Object.keys(presets).length <= 1) {
      alert('无法删除最后一个预设');
      return;
    }
    
    if (confirm(`确定要删除预设 "${selectedPreset}" 吗?`)) {
      try {
        const newSettings = deletePreset(settings, selectedPreset);
        setSettings(newSettings);
        setPresets(newSettings.yushe);
        setSelectedPreset(newSettings.yusheid);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`relative p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-w-lg w-full max-h-[80vh] overflow-auto`}>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="关闭"
        >
          <i className="fas fa-times"></i>
        </button>
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          图像生成设置
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input 
                type="checkbox" 
                name="scriptEnabled" 
                checked={settings.scriptEnabled} 
                onChange={handleChange}
                className="mr-2"
              />
              启用图像生成
            </label>
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              生成模式:
            </label>
            <select 
              name="mode" 
              value={settings.mode} 
              onChange={handleChange}
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            >
              <option value="free">免费模式 (pollinations.ai)</option>
              <option value="sd">Stable Diffusion</option>
              <option value="novelai">NovelAI</option>
              <option value="comfyui">ComfyUI</option>
            </select>
          </div>

          {/* 预设选择与管理 */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className={`block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                提示词预设:
              </label>
              <div className="flex space-x-2">
                <button 
                  onClick={handleAddPreset}
                  className={`px-2 py-1 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <i className="fas fa-plus mr-1"></i>新增
                </button>
                <button 
                  onClick={handleDeletePreset}
                  className={`px-2 py-1 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  disabled={Object.keys(presets).length <= 1}
                >
                  <i className="fas fa-trash-alt mr-1"></i>删除
                </button>
              </div>
            </div>
            <select 
              value={selectedPreset} 
              onChange={handlePresetChange}
              className={`w-full p-2 rounded border mb-2 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            >
              {Object.keys(presets).map(presetName => (
                <option key={presetName} value={presetName}>{presetName}</option>
              ))}
            </select>
          </div>

          {settings.mode === 'free' && (
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                免费模式服务:
              </label>
              <select 
                name="freeMode" 
                value={settings.freeMode || 'flux-anime'} 
                onChange={handleChange}
                className={`w-full p-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
              >
                <option value="flux-anime">Flux Anime</option>
                <option value="pollinations">Pollinations.ai</option>
                <option value="dalle-mini">DALL-E Mini</option>
              </select>
            </div>
          )}

          {settings.mode !== 'free' && (
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                API URL:
              </label>
              <input 
                type="text" 
                name="sdUrl" 
                value={settings.sdUrl} 
                onChange={handleChange}
                placeholder="http://localhost:7860"
                className={`w-full p-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
              />
            </div>
          )}

          {settings.mode === 'novelai' && (
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                NovelAI API Key:
              </label>
              <input 
                type="password" 
                name="novelaiApi" 
                value={settings.novelaiApi} 
                onChange={handleChange}
                placeholder="你的NovelAI API Key"
                className={`w-full p-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
              />
            </div>
          )}

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              宽度:
            </label>
            <input 
              type="number" 
              name="width" 
              value={settings.width} 
              onChange={handleChange}
              min="256"
              max="1024"
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              高度:
            </label>
            <input 
              type="number" 
              name="height" 
              value={settings.height} 
              onChange={handleChange}
              min="256"
              max="1024"
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              步数:
            </label>
            <input 
              type="number" 
              name="steps" 
              value={settings.steps} 
              onChange={handleChange}
              min="1"
              max="50"
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              种子 (0 为随机):
            </label>
            <input 
              type="number" 
              name="seed" 
              value={settings.seed} 
              onChange={handleChange}
              min="0"
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              固定正面提示词:
            </label>
            <textarea 
              name="fixedPrompt" 
              value={settings.fixedPrompt} 
              onChange={handleChange}
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              } min-h-[80px]`}
            />
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              负面提示词:
            </label>
            <textarea 
              name="negativePrompt" 
              value={settings.negativePrompt} 
              onChange={handleChange}
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              } min-h-[80px]`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSettingsModal; 