



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

String.prototype.hash = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
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

String.prototype.isNumber = function() {
    var numberreg = /^\d+$/;
    return numberreg.test(this.removeAll(',').removeAll('$').removeAll("%"));
};

