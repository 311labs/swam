
window.sleep = function(time) {
    // sleep(500).then(() => {
    // Do something after the sleep!
    // });
    time = time || 0;
    return new Promise(function(resolve) {
      setTimeout(resolve, time);
    }).catch(error => alert(error.message));
}

window.debounce = function (func, context, threshold, execAsap) {
    // Example usage:
    // on_keyup: function(evt) {
    //     if (!this._debounce) {
    //         this._debounce = window.debounce(
    //                 _.bind(this.on_amount_update, this),
    //                 400
    //             );
    //     }
    //     this._debounce(evt);
    // },
    var timeout;
    if (_.isObject(context)) {
        func = _.bind(func, context);
    } else {
        execAsap = threshold;
        threshold = context;
    }

    return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null;
        };

        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);

        timeout = setTimeout(delayed, threshold || 100);
    };
};

window.deleteCookie = function(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

// BEGIN STRING EXT


Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};




if (window._) {
    window._.isJQuery = function(object) {
        return (object instanceof jQuery);
    }

    window._.deepClone = function(object) {
        var clone = _.clone(object);

        _.each(clone, function(value, key) {
          if (_.isObject(value) && !_.isFunction(value) && !_.isJQuery(value)) {
            if (_.isString(key) && key.startsWith("__")) return;
            clone[key] = _.deepClone(value);
          }
        });

        return clone;
  };

}

window.typeOf = o => Object.prototype.toString.call(o);
window.isObject = o => o !== null && !Array.isArray(o) && typeOf(o).split(" ")[1].slice(0, -1) === "Object";

window.isPrimitive = o => {
  switch (typeof o) {
    case "object": {
      return false;
    }
    case "function": {
      return false;
    }
    default: {
      return true;
    }
  }
};

window.deepDiff = function(o1, o2){
    var diff = {};
    // Iterate over o1 and o2
    for (var prop in o1) {
        // Check if o2 has the same property
        if (prop in o2) {
            // Compare values
            if (o1[prop] !== o2[prop]) {
                // If values are not the same, check if they are objects
                if ((typeof o1[prop] === 'object' && typeof o2[prop] === 'object')&&(o1[prop] != null) && (o2[prop] != null)) {
                    // If they are objects, compare them recursively
                    var subDiff = deepDiff(o1[prop], o2[prop]);
                    if (Object.keys(subDiff).length > 0) {
                        diff[prop] = subDiff;
                    }
                } else {
                    // Otherwise add the difference to the diff
                    diff[prop] = o2[prop];
                }
            }
        }
    }
    // Do the same for o2
    for (var prop in o2) {
        if (!(prop in o1)) {
            diff[prop] = o2[prop];
        }
    }
    return diff;
};

window.expandObject = function(obj) {
  const expandedObj = {};
  for (let key in obj) {
    const splitKeys = key.split('.');
    let currentObj = expandedObj;
    for (let i = 0; i < splitKeys.length; i++) {
      const currentKey = splitKeys[i];
      if (i === splitKeys.length - 1) {
        currentObj[currentKey] = obj[key];
      } else {
        if (typeof currentObj[currentKey] !== 'object' || currentObj[currentKey] === null) {
          currentObj[currentKey] = {};
        }
        currentObj = currentObj[currentKey];
      }
    }
  }
  return expandedObj;
};

window.getBrowserUID = function() {
    if (window.buid) return window.buid;
    window.buid = window.localStorage.getItem("__buid__");
    if (!window.buid) {
        window.buid = String.Random(16);
        window.localStorage.setItem("__buid__", window.buid);
    }
    return window.buid;
};

window.getBrowserUIDLegacy = function() {
    if (window.buid) return window.buid;
    var data = window.getBrowserHash();
    window.buid = data.toString().toHex();
    return window.buid;
};

window.getBrowserHash = function() {
    var data = window.getBrowserFingerData();
    return data.hash();
};

window.getBrowserFingerData = function() {

    // var nav = window.navigator;
    // var screen = window.screen;
    // var guid = nav.mimeTypes.length;
    // guid += nav.userAgent.replace(/\D+/g, '');
    // guid += nav.plugins.length;
    // guid += screen.height || '';
    // guid += screen.width || '';
    // guid += screen.pixelDepth || '';

    // return guid;

    return [navigator.userAgent,
      [ screen.height, screen.width, screen.colorDepth ].join("x"),
      ( new Date() ).getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      $.map( navigator.plugins, function(p) {
        return [
          p.name,
          p.description,
          $.map( p, function(mt) {
            return [ mt.type, mt.suffixes ].join("~");
          }).join(",")
        ].join("::");
      }).join(";")
    ].join("###");
};

window.syntaxHighlight = function(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 4);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
            if (/false/.test(match)) cls += ' false';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
};

window.parseJWT = function(token) {
    var base64Url = token.split('.')[1];
    return window.b64ToDict(base64Url);
};

window.b64ToDict = function(base64Url) {
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

window.stackToMethods = function(stackTrace) {
  if (!stackTrace) return "";
  return stackTrace.split('\n')
                   .filter(line => line.trim().startsWith("at "))
                   .map(line => line.trim().substring(3, line.trim().indexOf("(")))
                   .join("\n");
};

window.findNestedValue = function(obj, key, default_value) {
    if (key[0] == '.') key = key.slice(1);
    var res = window.getNestedValue(obj, key, undefined);
    if (res != undefined) {
        return res;
    }
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop) && _.isObject(obj[prop])) {
            robj = obj[prop];
            // check if the key is here
            var res = window.getNestedValue(robj, key, undefined);
            if (res != undefined) {
                return res;
            }
            // go another level deep
            res = window.findNestedValue(robj, key, undefined);
            if (res != undefined) {
                return res;
            }
        }
    }
    return default_value;
};

window.parseJWT = function(token) {
    var base64Url = token.split('.')[1];
    return window.b64ToDict(base64Url);
};

window.b64ToDict = function(base64Url) {
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

window.getNestedValue = function(obj, key, default_valued) {
    var sub = key.split('.');
    var ret = obj;
    while (sub.length) {
        if (ret.attributes && ret.attributes.hasOwnProperty(sub[0])) {
            ret = ret.attributes[sub[0]];
        } else if (ret.hasOwnProperty(sub[0])) {
            ret = ret[sub[0]];
        } else {
            return default_valued;
        }
        if (ret === null) {
            return default_valued;
        }
        sub.shift();
    }
    return ret;
};

window.deepExtend = function(obj) {
  var parentRE = /#{\s*?_\s*?}/,
      slice = Array.prototype.slice;

  _.each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (_.isUndefined(obj[prop])) {
        obj[prop] = source[prop];
      } else if (_.isObject(obj[prop]) && _.isObject(source[prop])) {
        obj[prop] = _.deepExtend(obj[prop], source[prop]);
      } else if (parentRE.test(source[prop])) {
        if (_.isObject(obj[prop])) {
          obj[prop] = obj[prop] || {};
          obj[prop][(source[prop].match(/^#{\s*?_?\s*?}(.*)#{\s*?_?\s*?}$/)[1])] = source[prop].replace(parentRE, obj[prop][(source[prop].match(/^#{\s*?_?\s*?}(.*)#{\s*?_?\s*?}$/)[1])]);
        } else {
          obj[prop] = obj[prop] || source[prop].replace(parentRE, obj[prop]);
        }
      } else {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

if (window._) window._.deepExtend = window.deepExtend;

window.changeFavicon = function(src) {
    var link = document.getElementById('dynamic-favicon');
    if (!link) {
        link = document.createElement('link');
        link.id = 'dynamic-favicon';
        link.rel = 'icon';
        link.type = 'image/png';
        document.head.appendChild(link);
    }
    link.href = src;
};

window.addStylesheet = function(css, id) {
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  styleEl.id = id;
  document.head.appendChild(styleEl);
};

window.removeStylesheet = function(id) {
  const styleEl = document.getElementById(id);
  if (styleEl) {
    styleEl.remove();
  }
};

window._script_cache = [];

window.loadScript =  function(url, callback) {
    if (window._script_cache.indexOf(url) >= 0) {
        if (_.isFunction(callback)) {
            callback();
        }
        return;
    }
    window._script_cache.push(url);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    if (!url.contains("?")) {
        if (window.app && window.app.version) {
            url += `?version=${app.version}`;
        } else {
            url += `?_=${Date.now()}`;
        }
    }
    script.src = url;
    script.async = true;
    // Event listener for script load
    if (_.isFunction(callback)) {
        script.onload = callback;
    }
    // Append the script to the DOM to start loading
    document.head.appendChild(script);
};

window.lss = function(url, callback) {
    window.loadScript(url.fromHex(), callback);
};

window.__TRUE_VALUES__ = [true, 1, "true", "yes", "True", "1", "Y", "y"];

window.testTrue = function(value) {
    return window.__TRUE_VALUES__.indexOf(value) >= 0;
}

if (window._) window._.isTrue = window.testTrue;

window.isDict = function(obj) {
    if (_.isArray(obj) || _.isFunction(obj)) return false;
    return (_.isObject(obj) && obj && (obj["__super__"] == undefined));
};

if (window._) window._.isDict = window.isDict;

window.flipDict = function(obj) {
    var ret = {};
    for(var key in obj){
      ret[obj[key]] = key;
    }
    return ret;
}

window.decodeSearchParams = function(url) {
    if ((url.indexOf('?') < 0)||(url.endsWith("?"))) return {};
    var qs = url.substring(url.indexOf('?') + 1).split('&');
    for(var i = 0, result = {}; i < qs.length; i++){
        qs[i] = qs[i].split('=');
        var dv = decodeURIComponent(qs[i][1]).replace(/\+/g, ' ');
        if (dv[dv.length-1] == "#") dv = dv.substring(0, dv.length-1);
        var k = qs[i][0];
        if (k) result[k] = dv;
    }
    return result;
};

window.encodeSearchParams = function(url, params) {
    return url + "?" + $.param(params);
}

window.randomColor = function() {
    return "#" + Math.floor(Math.random()*16777215).toString(16);
};

window.isNumeric = function(value) {
    if ((value == null)||(value == undefined)) return false;
    if (_.isFunction(value.isNumber)) return value.isNumber();
    return false;
}

window.identifyMediaType = function(contentType) {
    // Define the MIME types for images and videos
    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    const videoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mpeg', 'video/avi'];

    // Check if the contentType is in the list of image MIME types
    if (imageMimeTypes.includes(contentType)) {
        return 'image';
    }
    // Check if the contentType is in the list of video MIME types
    else if (videoMimeTypes.includes(contentType)) {
        return 'video';
    } else if (contentType == "application/pdf") {
        return "pdf";
    }
    // Return 'unknown' if the content type is neither image nor video
    return 'unknown';
}


window.getScrollParent = function(element, includeHidden) {
    var style = getComputedStyle(element);
    var excludeStaticParent = style.position === "absolute";
    var overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

    if (style.position === "fixed") return document.body;
    for (var parent = element; (parent = parent.parentElement);) {
        style = getComputedStyle(parent);
        if (excludeStaticParent && style.position === "static") {
            continue;
        }
        if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
    }

    return document.body;
}

if (window._) window._.isNumeric = window.isNumeric;

navigator.hasRegex = function(reg_token) {
    return (navigator.userAgent.match(reg_token) !== null);
};

navigator.getOS = function() {
    navigator.detectBrowser();
    if (navigator.is_windows) return "Windows";
    if (navigator.is_mac) return "Mac";
    if (navigator.is_linux) return "Linux";
    if (navigator.is_unix) return "Unix";
    return "unknown";
};

navigator.getBrowserVersion = function() {
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE',version:(tem[1]||'')};
        }
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR|Edge\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 };

navigator.detectBrowser = function() {
    if (navigator.is_iphone === undefined) {
        navigator.is_iphone = navigator.hasRegex(/iphone/i);
        navigator.is_ipod = navigator.hasRegex(/ipod/i);
        navigator.is_ipad = navigator.hasRegex(/ipad/i);
        navigator.is_android = navigator.hasRegex(/android/i);
        navigator.is_blackberry = navigator.hasRegex(/blackBerry/i);
        navigator.is_chrome = navigator.hasRegex(/chrome/i);
        navigator.is_firefox = navigator.hasRegex(/firefox/i);
        navigator.is_safari = navigator.hasRegex(/safari/i);
        navigator.is_ie = navigator.hasRegex(/msie/i);
        navigator.is_ie_le_8 = navigator.hasRegex(/msie [0-8]\./i);
        navigator.is_ie_le_7 = navigator.hasRegex(/msie [0-7]\./i);
        navigator.is_cloudit = navigator.hasRegex(/cloudit/i);
        navigator.is_electron = navigator.hasRegex(/electron/i);

        navigator.is_ios = navigator.is_iphone || navigator.is_ipad || navigator.is_ipod;
        navigator.is_mobile = navigator.is_ios || navigator.is_android;
        navigator.supports_touch = false;

        navigator.is_windows = (navigator.appVersion.indexOf("Win") != -1);
        navigator.is_mac = (navigator.appVersion.indexOf("Mac") != -1);
        navigator.is_unix = (navigator.appVersion.indexOf("X11") != -1);
        navigator.is_linux = (navigator.appVersion.indexOf("Linux") != -1);

        navigator.browser = navigator.getBrowserVersion();

        try {
            navigator.supports_touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) || navigator.userAgent.indexOf('IEMobile') != -1;
        } catch (e) {

        }
        return navigator;

    }
};

window.captureScreen = function(callback) {
    html2canvas(document.body).then(function(canvas){
        var data = canvas.toDataURL("image/png");
        data = data.substr(data.indexOf(',')+1);
        callback(data);
    }.bind(this));
}


window.supportsInputEvent = function() {
    if ('oninput' in document.body) {
        return true;
    }

    document.body.setAttribute('oninput', 'return');

    var supports = typeof document.body.oninput === 'function';
    delete document.body.oninput;
    return supports;
}

window.supportsPropertyChangeEvent = function() {
    return 'onpropertychange' in document.body;
}

window.now = function() {
  if (typeof performance !== 'undefined') {
    return performance.now();
  } else {
    return Date.now();
  }
}

window.DevTools = {
  detect_only_open: true,  // only detect if open, not closed
  is_open: false,
  clear_console: true,
  debug: false,
  ignore_local: true,
  detect: function() {
    if (this.detect_only_open && this.is_open) return true;
    if (this.detect_by_performance()) {
        this.is_open = this.detect_by_performance(true);
        if (this.is_open && this.debug) SWAM.toast("devtools", "it looks like devtools are open?", "info");
    }
    return this.is_open;
  },

  detect_by_performance: function(max_time) {
    if (location.host.contains("localhost") && this.ignore_local) return false;
    if (window.DevTools.largeObjectArray == undefined) {
      window.DevTools.largeObjectArray = window.DevTools.createLargeObjectArray();
    }

    const tablePrintTime = window.DevTools.calcTablePrintTime();
    const logPrintTime = window.DevTools.calcLogPrintTime();
    let maxPrintTime = Math.max(0, logPrintTime);
    let delta = Math.abs(tablePrintTime - logPrintTime);
    if (this.clear_console) console.clear();
    // console.log(`table_print_time: ${tablePrintTime}`);
    // console.log(`log_print_time: ${logPrintTime}`);
    // console.log(`delta: ${delta}`);
    if (tablePrintTime === 0) return false;
    if (maxPrintTime === 0) return false;
    if (!max_time) return delta > 10;
    return tablePrintTime > maxPrintTime * 10;
  },

  createLargeObject: function() {
    const largeObject = {};
    for (let i = 0; i < 500; i++) {
      largeObject[`${i}`] = `${i}`;
    }
    return largeObject;
  },

  createLargeObjectArray: function() {
    const largeObject = window.DevTools.createLargeObject();
    const largeObjectArray = [];

    for (let i = 0; i < 50; i++) {
      largeObjectArray.push(largeObject);
    }

    return largeObjectArray;
  },

  calcTablePrintTime: function() {
    const start = now();

    console.table(window.DevTools.largeObjectArray);

    return now() - start;
  },

  calcLogPrintTime: function() {
    const start = now();

    console.log(window.DevTools.largeObjectArray);

    return now() - start;
  }
};
