// طبقة تواصل عامة بين الواجهة وC# (WebView2).
// ترسل طلب وتنتظر الرد عبر requestId.
(function (global) {
  const callbacks = {};

  function genId() {
    return 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  // استماع للرسائل الواردة من C#
  if (window.chrome && window.chrome.webview && window.chrome.webview.addEventListener) {
    window.chrome.webview.addEventListener('message', (event) => {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (msg && msg.type === 'response' && msg.requestId) {
          const cb = callbacks[msg.requestId];
          if (cb) {
            if (msg.status === 'ok') cb.resolve(msg.payload);
            else cb.reject(msg.payload || { message: 'Unknown error' });
            delete callbacks[msg.requestId];
          }
        }
      } catch (err) {
        console.error('api.js message handler error', err);
      }
    });
  } else {
    console.warn('WebView2 messaging not available.');
  }

  function send(action, payload = {}) {
    return new Promise((resolve, reject) => {
      const requestId = genId();
      callbacks[requestId] = { resolve, reject };
      const message = {
        type: 'request',
        requestId,
        action,
        payload
      };
      try {
        const json = JSON.stringify(message);
        if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
          window.chrome.webview.postMessage(json);
        } else {
          reject({ message: 'Host messaging not available' });
        }
      } catch (err) {
        reject(err);
      }
      // optional: timeout
      setTimeout(() => {
        if (callbacks[requestId]) {
          callbacks[requestId].reject({ message: 'Request timeout' });
          delete callbacks[requestId];
        }
      }, 30000);
    });
  }

  // واجهة بسيطة
  global.HostApi = {
    send
  };
})(window);