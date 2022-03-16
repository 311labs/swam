
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

Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    if ((L == 1) && (_.isArray(a[0]))) {
        count = this.removeList(a[0]);
    } else {
        count = this.removeList(a);
    }
    return this;
};

Array.prototype.removeList = function(lst) {
    var what, a = lst,
        L = a.length,
        ax;
    var count = 0;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            count += 1;
            this.splice(ax, 1);
        }
    }
    return count;
};

Array.prototype.has = function() {
    if ((arguments.length == 1) && (_.isArray(arguments[0]))) {
        var lst = arguments[0];
        var i = lst.length;
        var c = 0;
        while (i--) {
            var item = lst[i];
            if (this.indexOf(item) >= 0) c += 1;
        }
        return c;
    } else if (arguments.length > 0) {
        return this.has(Array.from(arguments).sort(function (a, b) { return a - b; }));
    }
    return false;
};

String.prototype.replaceAll = function(oldVal, newVal) {
    if (typeof oldVal !== "string" || typeof newVal !== "string" || oldVal === "") {
        return this;
    }
    if (oldVal == newVal) {
        return this;
    }
    try {
        var returnVal = this;
        try {
            var replaceAllRegex = function(str) {
                return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }
            oldvalue = oldvalue.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            // var replaceAllRegex = new RegExp(eval("/" + RegExp.escape(oldVal) + "/gm"));
            return this.replace(oldvalue, newVal);
        } catch (invalidRegExp) {}
        var loopCount = 0; /* hit a RegExp exception, do it the old fashioned way */
        while (returnVal.contains(oldVal) && loopCount < 1000) {
            returnVal = returnVal.replace(oldVal, newVal);
            loopCount++;
        }
        return returnVal;
    } catch (exc) {}
    return this;
};

String.prototype.removeAll = function(str) {
    return this.replaceAll(str, "");
};

String.prototype.slugify = function() {
    // remove non-words and replace consecutive spaces with a hyphen
    return this.toLowerCase().replace(/[^\w ]+/g, '').replace(/[ ]+/g, '-');
};

String.prototype.removeAll = function(str) {
    return this.replaceAll(str, "");
};

String.prototype.toInt = function() {
    return parseInt(this.removeAll(',').removeAll('$').removeAll("%"), 10);
};

String.prototype.toNumberString = function() {
    return this.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
};

String.prototype.toNumber = function() {
    return Number(this);
};

String.prototype.toFloat = function() {
    return parseFloat(this.removeAll(',').removeAll('$').removeAll("%"));
};

String.prototype.upper = String.prototype.toUpperCase;
String.prototype.lower = String.prototype.toLowerCase;

// Gracias STACKOVERFLOW Crescent Fresh & Niaz
String.prototype.urlify = function(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    // var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return this.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
};

String.prototype.format = function() {
  // "This is {0} {1} {0}".format("another", "test")
  var arg1 = arguments[0];
  if (_.isObject(arg1)) return this.formatWithDict(arg1);
  var formatted = this;
  for (arg in arguments) {
    formatted = formatted.replaceAll("{" + arg + "}", String(arguments[arg]));
  }
  return formatted;
};

String.prototype.formatWithDict = function(dict) {
  // "This is {name} {place} {name}".formatWithDict("another", "test")
  var formatted = this;
  for (key in dict) {
    formatted = formatted.replaceAll("{" + key + "}", String(dict[key]));
  }
  return formatted;
};

String.Random = function(length, possible) {
    length = length || 16;
    var text = "";
    possible = possible || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

String.prototype.toHex = function(){
    // var hex, i;

    // var result = "";
    // for (i=0; i<this.length; i++) {
    //     hex = this.charCodeAt(i).toString(16);
    //     result += ("000"+hex).slice(-4);
    // }

    // return result

    // utf8 to latin1
    var s = unescape(encodeURIComponent(this))
    var h = ''
    for (var i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16)
    }
    return h
}

String.prototype.fromHex = function(){
    var s = ''
    for (var i = 0; i < this.length; i+=2) {
        s += String.fromCharCode(parseInt(this.substr(i, 2), 16))
    }
    return decodeURIComponent(escape(s))
}

String.prototype.contains = function(str, caseSensitive) {
    if (typeof caseSensitive != "boolean") {
        caseSensitive = true;
    }
    try {
        if (typeof str == "undefined") {
            return false;
        }
        if (typeof str != "string") {
            str = String(str);
        }
        if (typeof str != "string" || str === "") {
            return false;
        }
        if (!caseSensitive) {
            return (this.toLowerCase().indexOf(str.toLowerCase()) != -1);
        }
        return (this.indexOf(str) != -1);
    } catch (exc) {}
    return false;
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};


if (window._) {
    window._.deepClone = function(object) {
        var clone = _.clone(object);

        _.each(clone, function(value, key) {
          if (_.isObject(value)) {
            clone[key] = _.deepClone(value);
          }
        });

        return clone;
  };
}

window.browser_guid = function() {

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
    ].join("###").hash();
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

