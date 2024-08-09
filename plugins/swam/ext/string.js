
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(search, replace) {
        return this.split(search).join(replace);
    };
}

String.prototype.slugify = function() {
    // remove non-words and replace consecutive spaces with a underscore
    return this.toLowerCase().replace(/[^\w ]+/g, '').replace(/[ ]+/g, '_');
};

String.prototype.capitalize = function() {
    // remove non-words and replace consecutive spaces with a underscore
  // split the string into an array of words
    const words = this.split(' ');
    // iterate over each word and capitalize the first letter
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    // join the capitalized words back into a single string
    const capitalized = words.join(' ');
    return capitalized;
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

String.prototype.isHex = function(){
    var re = /^[a-fA-F0-9]+$/;
    return re.test(this);
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
    // var numberreg = /^\d+$/;
    // return numberreg.test(this.removeAll(',').removeAll('$').removeAll("%"));
    const str = this.removeAll(',').removeAll('$').removeAll("%");
    // Check if the string is a number
    const num = Number(str);
    // Check if the conversion to number was successful and if the result is finite
    return !isNaN(num) && isFinite(num);
};

String.prototype.initials = function(max_length) {
    max_length = max_length || 2;
    if (this.length == 0) return '';

    const words = this.trim().split(/\s+/);
    let initials = '';

    for (let i = 0; i < words.length && initials.length < max_length; i++) {
        initials += words[i][0].toUpperCase();
    }

    return initials;
}


String.prototype.isZipcode = function() {
    var numberreg = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    return numberreg.test(this);
};

String.prototype.isPhone = function() {
    return this.match(/^\s*\+?\s*1?[ \.\-\(]*[2-9]\d{2}[ \.\-\)]*[2-9]\d{2}[ \.\-]*\d{4}\s*$/) && true;
};

String.prototype.formatPhone = function() {
    // return this.replace(/^(\d{3})(\d{3})(\d)+$/, "($1)$2-$3");
    var value = this;
    if (value.length && value[0] === "1") value = value.substr(1);
    if (value.length > 10) return value.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)(\d+)/, '($1) $2-$3 $4');
    if (value.length == 10) return value.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, '($1) $2-$3');
    if (value.length > 6) return value.replace(/(\d\d\d)(\d\d\d)(\d+)/, '($1) $2-$3');
    if (value.length == 6) return value.replace(/(\d\d\d)(\d\d\d)/, '($1) $2');
    if (value.length > 3) return value.replace(/(\d\d\d)(.)/, '($1) $2');
    if (value.length == 3) return value.replace(/(\d\d\d)/, '($1) ');
    return value.substr(0);
};

String.prototype.isSSN = function() {
    return this.length == 9 && this.match(/^\d+$/) && true;
};

window.IPV4PATTERN = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})$/;

String.prototype.isIPV4 = function() {
    return IPV4PATTERN.test(this);
};

String.prototype.formatSSN = function() {
    // return this.replace(/^(\d{3})(\d{3})(\d)+$/, "($1)$2-$3");
    var value = this;
    if (value.length > 5) return value.replace(/(\d\d\d)(\d\d)(\d+)/, '$1-$2-$3');
    if (value.length > 3) return value.replace(/(\d\d\d)(\d+)/, '$1-$2');
    return value.substr(0);
};

String.prototype.count = function(text) {
    return (this.split(text).length - 1);
};

String.prototype.formatEveryNth = function(n, delimiter) {
    var value = this;
    delimiter = delimiter || " ";
    var re = new RegExp("(.{" + n + "})", "g");
    return value.replace(re, "$1" + delimiter)
};

String.prototype.formatHiddenExpects = function(length, empty, not_empty) {
    var value = this;
    empty = empty || "_";
    not_empty = not_empty || "*";
    var remaining = length - value.length;
    if (remaining) {
        return new Array(value.length + 1).join( not_empty ) + new Array(remaining + 1).join( empty );
    }
    return new Array(value.length + 1).join( not_empty );
};


String.prototype.isEmail = function() {
    return (/^[\w\-\+_]+(?:\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(?:\.[\w\-\+_]+)*$/).test(this);
};

String.prototype.__emojify_prefix = "twa twa-"; // this is twitter emoji (requires scss include)

String.prototype.emojify = function() {
    var urlRegex = /\:([^)]+)\:/gm;
    var matches = this.match(urlRegex);
    if (!matches) {
        return this;
    }
    var result = this;
    for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        if ((match.indexOf('/') == -1)&&(match.indexOf('/') == -1)) {
            var emoji_class = matches[i].removeAll(":").replaceAll("_", "-");
            result = result.replaceAll(match, "<i class=' " + this.__emojify_prefix + emoji_class + "'></i>");
        }
    }
    return result;
};
