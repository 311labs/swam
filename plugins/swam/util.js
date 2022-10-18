
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

window.isDict = function(obj) {
    if (_.isArray(obj) || _.isFunction(obj)) return false;
    return (_.isObject(obj) && obj && (obj["__super__"] == undefined));
};

if (window._) window._.isDict = window.isDict;

window.decodeSearchParams = function(url) {
    if ((url.indexOf('?') < 0)||(url.endsWith("?"))) return {};
    var qs = url.substring(url.indexOf('?') + 1).split('&');
    for(var i = 0, result = {}; i < qs.length; i++){
        qs[i] = qs[i].split('=');
        var dv = decodeURIComponent(qs[i][1]);
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
