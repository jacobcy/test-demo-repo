import React, { useState, useEffect } from 'react';
import { getSettings } from '../utils/imageGenerator';
import '../utils/tampermonkeyPolyfill';

const ImageSettingsModal = ({ isOpen, onClose, isDarkMode }) => {
  const [settings, setSettings] = useState(getSettings());

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setSettings({
      ...settings,
      [name]: newValue,
    });

    // 保存到localStorage
    GM_setValue(name, newValue);
  };

  useEffect(() => {
    // 当设置变化时，更新到localStorage
    Object.entries(settings).forEach(([key, value]) => {
      GM_setValue(key, value);
    });
  }, [settings]);

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