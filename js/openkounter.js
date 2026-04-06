/* global CONFIG, Fluid */

(function(window, document) {
  'use strict';

  const API_SERVER = (CONFIG.web_analytics.openkounter && CONFIG.web_analytics.openkounter.server_url) || '';

  if (!API_SERVER) {
    console.warn('OpenKounter: server_url is not configured');
    return;
  }

  function getRecord(target) {
    return fetch(`${API_SERVER}/api/counter?target=${encodeURIComponent(target)}`)
      .then(resp => {
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }
        return resp.json();
      })
      .then(({ data, code, message }) => {
        if (code !== 0) {
          throw new Error(message || 'Unknown error');
        }
        return { time: data.time || 0, objectId: data.target };
      })
      .catch(error => {
        console.error('OpenKounter fetch error:', error);
        return { time: 0, objectId: target };
      });
  }

  function increment(incrArr) {
    if (!incrArr || incrArr.length === 0) {
      return Promise.resolve([]);
    }

    return fetch(`${API_SERVER}/api/counter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'batch_inc',
        requests: incrArr
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(res => {
        if (res.code !== 0) {
          throw new Error(res.message || 'Failed to increment counter');
        }
        return res.data;
      })
      .catch(error => {
        console.error('OpenKounter increment error:', error);
        return null;
      });
  }

  function buildIncrement(objectId) {
    return { target: objectId };
  }

  function incrementDisplay(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      return;
    }
    const current = parseInt(el.innerText, 10) || 0;
    el.innerText = current + 1;
  }

  function validHost() {
    const ignoreLocal = CONFIG.web_analytics.openkounter && CONFIG.web_analytics.openkounter.ignore_local;
    if (ignoreLocal !== false) {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
        return false;
      }
    }
    return true;
  }

  function validUV() {
    const key = 'OpenKounter_UV_Flag';
    const now = Date.now();

    try {
      const flag = localStorage.getItem(key);
      if (flag) {
        const lastVisit = parseInt(flag, 10);
        if (now - lastVisit <= 86400000) {
          return false;
        }
      }
      localStorage.setItem(key, now.toString());
    } catch (e) {
      console.warn('OpenKounter: localStorage is not available');
    }
    return true;
  }

  function normalizePageTarget(path) {
    const rawPath = String(path || '/');
    const withoutHash = rawPath.split('#')[0];
    const withoutQuery = withoutHash.split('?')[0];
    const normalized = decodeURI(withoutQuery).replace(/\/*(index\.html)?$/, '/');
    return normalized || '/';
  }

  function validPagePV(path) {
    const key = `OpenKounter_PV_Flag_${encodeURIComponent(normalizePageTarget(path))}`;

    try {
      if (sessionStorage.getItem(key) === '1') {
        return false;
      }
      sessionStorage.setItem(key, '1');
    } catch (e) {
      console.warn('OpenKounter: sessionStorage is not available');
    }
    return true;
  }

  function addCount() {
    const enableIncr = CONFIG.web_analytics.enable && (!window.Fluid || !Fluid.ctx.dnt) && validHost();
    const getterArr = [];
    const incrArr = [];
    const displayUpdates = [];

    const pvCtn = document.querySelector('#openkounter-site-pv-container');
    if (pvCtn) {
      const pvGetter = getRecord('site-pv').then((record) => {
        if (enableIncr) {
          incrArr.push(buildIncrement(record.objectId));
          displayUpdates.push('#openkounter-site-pv');
        }
        const ele = document.querySelector('#openkounter-site-pv');
        if (ele) {
          ele.innerText = (record.time || 0);
          pvCtn.style.display = 'inline';
        }
      });
      getterArr.push(pvGetter);
    }

    const uvCtn = document.querySelector('#openkounter-site-uv-container');
    if (uvCtn) {
      const uvGetter = getRecord('site-uv').then((record) => {
        const incrUV = validUV() && enableIncr;
        if (incrUV) {
          incrArr.push(buildIncrement(record.objectId));
          displayUpdates.push('#openkounter-site-uv');
        }
        const ele = document.querySelector('#openkounter-site-uv');
        if (ele) {
          ele.innerText = (record.time || 0);
          uvCtn.style.display = 'inline';
        }
      });
      getterArr.push(uvGetter);
    }

    const viewCtn = document.querySelector('#openkounter-page-views-container');
    if (viewCtn) {
      let path;
      try {
        const pathConfig = CONFIG.web_analytics.openkounter.path || 'window.location.pathname';
        path = eval(pathConfig);
      } catch (e) {
        console.warn('OpenKounter: failed to eval path config, falling back to pathname');
        path = window.location.pathname;
      }
      
      const target = normalizePageTarget(path);
      const incrPV = validPagePV(target) && enableIncr;

      const viewGetter = getRecord(target).then((record) => {
        if (incrPV) {
          incrArr.push(buildIncrement(record.objectId));
          displayUpdates.push('#openkounter-page-views');
        }
        const ele = document.querySelector('#openkounter-page-views');
        if (ele) {
          ele.innerText = (record.time || 0);
          viewCtn.style.display = 'inline';
        }
      });
      getterArr.push(viewGetter);
    }

    Promise.all(getterArr).then(() => {
      if (enableIncr && incrArr.length > 0) {
        increment(incrArr).then(result => {
          if (!result) {
            return;
          }
          displayUpdates.forEach(incrementDisplay);
        });
      }
    }).catch(error => {
      console.error('OpenKounter error:', error);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCount);
  } else {
    addCount();
  }

})(window, document);
