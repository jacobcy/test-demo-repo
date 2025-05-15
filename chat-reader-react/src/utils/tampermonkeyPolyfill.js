/**
 * Tampermonkey API 的模拟实现
 * 这个模块提供了一组与Tampermonkey兼容的API函数
 */

// 使用localStorage作为存储
window.GM_getValue = (key, defaultValue) => {
  const value = localStorage.getItem(`GM_${key}`);
  return value === null ? defaultValue : JSON.parse(value);
};

window.GM_setValue = (key, value) => {
  localStorage.setItem(`GM_${key}`, JSON.stringify(value));
};

window.GM_deleteValue = (key) => {
  localStorage.removeItem(`GM_${key}`);
};

window.GM_listValues = () => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('GM_')) {
      keys.push(key.substring(3)); // 移除 "GM_" 前缀
    }
  }
  return keys;
};

// 简单实现的xmlHttpRequest
window.GM_xmlhttpRequest = (options) => {
  const xhr = new XMLHttpRequest();
  xhr.open(options.method, options.url);
  
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
  }
  
  xhr.onload = function() {
    if (this.status >= 200 && this.status < 300) {
      if (options.onload) {
        options.onload({
          responseText: this.responseText,
          responseXML: this.responseXML,
          response: this.response,
          status: this.status,
          statusText: this.statusText,
          readyState: this.readyState
        });
      }
    } else {
      if (options.onerror) {
        options.onerror({
          error: new Error(`Request failed with status ${this.status}`),
          status: this.status,
          statusText: this.statusText,
          readyState: this.readyState
        });
      }
    }
  };
  
  xhr.onerror = function() {
    if (options.onerror) {
      options.onerror({
        error: new Error('Network error'),
        status: this.status,
        statusText: this.statusText,
        readyState: this.readyState
      });
    }
  };
  
  xhr.send(options.data);
  
  return xhr;
};

console.log('Tampermonkey API polyfill loaded'); 