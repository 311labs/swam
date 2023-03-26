
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
                if (typeof o1[prop] === 'object' && typeof o2[prop] === 'object') {
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
        if (currentObj[currentKey] === undefined) {
          currentObj[currentKey] = {};
        }
        currentObj = currentObj[currentKey];
      }
    }
  }
  return expandedObj;
};

window.getBrowserUID = function() {
    var data = window.getBrowserHash();
    return data.toString().toHex();
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


