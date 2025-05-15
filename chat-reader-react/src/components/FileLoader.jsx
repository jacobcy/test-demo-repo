import { useState, useRef } from 'react';

function FileLoader({ onFileLoad, isLoading, darkMode }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleLoadClick = () => {
    if (selectedFile) {
      onFileLoad(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`mb-8 p-6 rounded-xl shadow-lg ${darkMode 
      ? 'bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-indigo-900/40 border border-indigo-800' 
      : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      
      <div className="mb-6 text-center">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
          导入聊天记录
        </h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          选择并上传一个 SillyTavern 导出的 .jsonl 格式聊天记录文件
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <input
          type="file"
          accept=".jsonl,application/jsonl"
          onChange={handleFileChange}
          className="hidden" // Hidden, will be triggered by the button
          ref={fileInputRef}
          id="fileInput"
        />
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isLoading}
          className={`w-full sm:w-auto flex-grow px-6 py-3.5 text-base font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
            darkMode
              ? 'text-indigo-200 bg-indigo-900/50 border-2 border-indigo-700 hover:bg-indigo-800/60 focus:ring-indigo-700'
              : 'text-indigo-700 bg-white border-2 border-indigo-500 hover:bg-indigo-50 focus:ring-indigo-500'
          }`}
        >
          <i className="fas fa-file-upload mr-2"></i>
          {selectedFile ? selectedFile.name : '选择聊天记录文件'}
        </button>
        <button
          type="button"
          onClick={handleLoadClick}
          disabled={!selectedFile || isLoading}
          className={`w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
            darkMode
              ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
          }`}
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
              正在加载...
            </>
          ) : (
            <>
              <i className="fas fa-book-reader mr-2"></i>
              导入并阅读
            </>
          )}
        </button>
      </div>
      {selectedFile && (
        <p className={`mt-4 text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-600'} bg-opacity-10 p-2 rounded flex items-center`}>
          <i className="fas fa-check-circle mr-2"></i>
          已选择: <span className="font-semibold ml-1">{selectedFile.name}</span>
        </p>
      )}
    </div>
  );
}

export default FileLoader; 