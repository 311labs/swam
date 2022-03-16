
SWAM.Localize = {
    'lang': function(lang_key, lang) {
        if (!app.lang) app.lang = "eng";
        if (!lang) lang = app.lang;
        if (!window.language_packs) return "no lang packs";
        var eng_pack = window.language_packs["eng"];
        if (!eng_pack) return "no lang packs";
        var pack = window.language_packs[lang];
        if (!pack) pack = eng_pack;
        var value = pack[lang_key];
        if (value == undefined) {
            value = eng_pack[lang_key];
            if (value == undefined) {
                return "lang key not defined: '" + lang_key + "'";
            }
        }
        return value;
    },
    'sectoms': function(value) {
        // to support legacy calls we change this into a date
        return new Date(value * 1000);
    },
    'iter': function(value, attr, fmt) {
        if (_.isObject(value)) {
            var res = [];
            _.each(value, function(value, key){
                if ((fmt == "no_objects")&& _.isObject(value)) return;
                res.push({key:key, value:value});
            });
            return res;
        }
        return null;
    },
    'bytes': function(value, attr, fmt) {
        if (value > 0 ){
            if (value < 1024)             { return value + " Bytes"}
            if (value < 1048576)          { return (value/1024).toFixed(0) + " KB"}
            if (value < 1073741824)       { return (value/1024/1024).toFixed(0) + " MB" }
            if (value < 1099511600000)    { return (value/1024/1024/1024).toFixed(1) + " GB"}
            return (value/1024/1024/1024/1024).toFixed(2) + " TB";
        }
        return value;
    },
    'ifemptyornull': function(value, attr, fmt) {
        var arg1, arg2 = null;
        if (_.isArray(fmt)) {
            arg1 = fmt[0];
            arg2 = fmt[1];
        } else {
            arg1 = fmt;
            arg2 = value;
        }
        if (_.isUndefined(value) || _.isNull(value)|| _.isEmpty(value)) {
            return arg1;
        }
        return arg2;
    },
    'yesno': function(value, attr, fmt) {
        var v = this.bool(value);
        if (v) {
            return "yes";
        }
        return "no";
    },

    'yesno_color': function(value, attr, fmt) {
        var v = this.bool(value);
        var color = 'color-green';
        if (!v) color = 'color-red';

        if (fmt == "invert_color") {
            if (!v) color = 'color-green';
            if (v) color = 'color-red';
        }
        return "<div class='"+color+"'>"+(v?"YES":"NO")+"</div>";
    },

    'yesno_icon': function(value, attr, fmt) {
        var v = this.bool(value);
        var yes_icon = "bi bi-check-circle-fill";
        var no_icon = "bi bi-slash-circle";
        var action = null;
        if (_.isArray(fmt)) {
            yes_icon = fmt[0];
            no_icon = fmt[0];
        } else {
            action = fmt;
        }
        if (action == "invert_color") {
            yes_icon = yes_icon + " color-red";
            no_icon = no_icon + " color-green";
        } else if (action == "no_color") {

        } else {
            yes_icon = yes_icon + " color-green";
            no_icon = no_icon + " color-red";
        }
        if (v) {
            return '<i class="' + yes_icon + '"></i>';
        }
        return '<i class="' + no_icon + '"></i>';
    },

    'iftruefalse': function(value, attr, fmt) {
        var values;
        if (_.isString(fmt)) {
            fmt = fmt.removeAll("'");
            values = fmt.split(',');
        } else {
            values = fmt;
        }
        if (this.bool(value)) {
            return values[0].trim();
        }
        return values[1].trim();
    },

    'bool': function(value, attr, fmt) {
        if (!value) return false;
        if (value) {
            if (_.isBoolean(value)) {
                return value;
            } else if (_.isString(value)) {
                if (value.isNumber()) return value.toInt();
                if (value == '') return false;
                // return (["on", "true", "True", "y", "yes", "Yes"].indexOf(value) >= 0);
                return (["off", "false", "False", "n", "no", "No", "0"].indexOf(value) < 0);
            } else if (_.isNumber(value)) {
                return true;
            }
        }
        return value;
    },

    'timerSince': function(value, attr, fmt) {
        return SWAM.Localize.timer((Date.now() - value)/1000);
    },

    'timer': function(value, attr, fmt) {
        var d = {};
        d.SS = Math.floor(parseInt(value, 10));
        d.ss = d.SS % 60;
        d.MM = Math.floor(d.SS / 60);
        d.mm = d.MM % 60;
        d.HH = Math.floor(d.MM / 60);
        d.hh = d.HH % 60;
        d.DD = Math.floor(d.HH / 24);
        d.dd = d.DD;

        _.each(['SS', 'ss', 'MM', 'mm', 'HH', 'hh', 'DD', 'dd'], function(v) {
            if(d[v] < 10) {
                d[v] = "0" + d[v];
            }
        });
        return this.formatDate(d, attr, fmt || 'MM:ss');
    },
    'prettytimer': function(seconds, attr, fmt) {
        var interval = Math.floor(seconds / 31536000);

        if(interval > 1) {
            return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if(interval > 1) {
            return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if(interval > 1) {
            return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if(interval > 1) {
            return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if(interval > 1) {
            return interval + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    },

    'timesince': function(value, attr, fmt) {
        value = this.safe_datetime(value, attr, fmt);
        value = Math.floor((new Date() - value) / 1000);
        var d = {};
        d.SS = Math.floor(parseInt(value, 10));
        d.ss = d.SS % 60;
        d.MM = Math.floor(d.SS / 60);
        d.mm = d.MM % 60;
        d.HH = Math.floor(d.MM / 60);
        d.hh = d.HH % 60;
        d.DD = Math.floor(d.HH / 24);
        d.dd = d.DD;

        _.each(['SS', 'ss', 'MM', 'mm', 'HH', 'hh', 'DD', 'dd'], function(v) {
            if(d[v] < 10) {
                d[v] = "0" + d[v];
            }
        });
        return this.formatDate(d, attr, fmt || 'MM:ss');
    },
    'safe_datetime': function(value, attr, fmt) {
        if(_.isUndefined(value)||(value === null)||(value == 0)) {
            return 0;
        }

        if (_.isNumber(value)) {
            // we will assume then this is secs
            value = value * 1000;
        } else if (_.isString(value)) {
            // assume is date string
            dt = Date.parse(value);
            if (dt) value = dt.getTime();
        } else if (_.isFunction(value.getMonth)) {
            value = value.getTime();
        }
        return value;
    },
    'dateobj': function(value) {
        if((value === null)||(value == 0)) {
            return null;
        }
        var d = new Date(value);
        var ret = {
            yyyy: d.getFullYear(),
            MM: d.getMonth() + 1,
            dd: d.getDate(),
            HH: d.getHours(),
            mm: d.getMinutes(),
            ss: d.getSeconds(),
            M: d.getMonth() + 1,
            d: d.getDate(),
            H: d.getHours(),
            m: d.getMinutes(),
            s: d.getSeconds(),
            dow: d.getDay(),
            ms: d.getMilliseconds()
        };
        ret.yy = ret.yyyy % 100;
        ret.y = ret.yyyy % 100;
        ret.hh = ret.H % 12;
        ret.h = ret.hh;
        if(ret.hh === 0) {
            ret.hh = 12;
            ret.h = 12;
        }
        ret.tt = (ret.H < 12) ? 'am' : 'pm';
        ret.TT = (ret.H < 12) ? 'AM' : 'PM';
        ret.t = (ret.H < 12) ? 'am' : 'pm';
        ret.T = (ret.H < 12) ? 'AM' : 'PM';

        _.each(['yy', 'MM', 'dd', 'hh', 'HH', 'mm', 'ss'], function(v) {
            if(ret[v] < 10) {
                ret[v] = "0" + ret[v];
            } else {
                ret[v] = ret[v];
            }
        });
        return ret;
    },
    'datetime': function(value, attr, fmt) {
        if((value === null)||(value == 0)) {
            return '';
        }
        var d = this.dateobj(this.safe_datetime(value));
        if (!fmt) fmt = "yyyy-MM-dd HH:mm:ss t";
        return this.formatDate(d, attr, fmt);
    },
    'date': function(value, attr, fmt) {
        if(value === null) {
            return '';
        }
        if(!fmt) fmt = "yyyy-MM-dd";
        var d = this.dateobj(this.safe_datetime(value));
        return this.formatDate(d, attr, fmt);
    },
    'time': function(value, attr, fmt) {
        if(value === null) {
            return '';
        }
        if(!fmt) fmt = "HH:mm:ss t";
        var d = this.dateobj(this.safe_datetime(value));
        return this.formatDate(d, attr, fmt);
    },
    "formatDate": function(obj, attr, fmt) {
        var tok = '';
        var ret = '';
        _.each(fmt.split('').concat(['_']), function(c) {
            if((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
                tok += c;
            } else {
                if(tok && obj.hasOwnProperty(tok)) {
                    ret += obj[tok];
                } else {
                    ret += tok;
                }
                tok = '';
                if(c != '_') {
                    ret += c;
                }
            }
        });
        return ret;
    },
    'default': function(value, attr, fmt) {
        var arg1, arg2 = null;
        if (_.isArray(fmt)) {
            arg1 = fmt[0];
            arg2 = fmt[1];
        } else {
            arg1 = fmt;
            arg2 = value;
        }
        if (_.isUndefined(value) || _.isNull(value)) {
            return arg1;
        }
        return value;
    },
    'prettyjson': function(value, attr, fmt) {
        if (_.isObject(value)) {
            return window.syntaxHighlight(value);
            // return JSON.stringify(value, undefined, 2);
        } else if (!value) {
            return "";
        }

        resp = value.trim();
        if (resp.length && (resp[0] == "{")) {
            value = resp.replace(/u\'/g, '"');
            value = value.replace(/\t/g, '');
            value = value.replace(/\n/g, '');
            value = value.replace(/\'/g, '"');
            value = value.replace(/None/g, 'null');
            value = value.replace(/True/g, 'true');
            value = value.replace(/False/g, 'false');
            value = value.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')
            try {
                value = JSON.parse(value);
                return window.syntaxHighlight(value);
                // return JSON.stringify(value, undefined, 2);
            } catch(err) {
                console.log(err);
            }
        }
        return resp;
    },
    'prettyxml': function(xml) {
        var formatted = '';
        var reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, '$1\r\n$2$3');
        var pad = 0;
        jQuery.each(xml.split('\r\n'), function(index, node) {
            var indent = 0;
            if (node.match( /.+<\/\w[^>]*>$/ )) {
                indent = 0;
            } else if (node.match( /^<\/\w/ )) {
                if (pad != 0) {
                    pad -= 1;
                }
            } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
                indent = 1;
            } else {
                indent = 0;
            }

            var padding = '';
            for (var i = 0; i < pad; i++) {
                padding += '  ';
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        });

        return formatted.htmlEncode();
    },
    'prettystacktrace': function(value, attr, fmt) {
        if (_.isObject(value)) return this.prettyjson(value, attr, fmt);
        if (_.isString(value) && (value.startsWith("<") || (value.indexOf("<GMF") >= 0))) return this.prettyxml(value);
        if ((value.indexOf("aceback") == -1) && (value.indexOf("stack:") == -1)) return this.prettyjson(value, attr, fmt);
        if (value.indexOf("aceback") != -1) {
            value = value.replace(/Traceback/g, function(url) {
                return '<b>' + url + '</b>';
            });
            value = value.replace(/[A-Za-z]*:/ig, function(url) {
                return '<b style=\'color: red;\'>' + url + '</b>';
            });
            value = value.replace(/line [0-9]+/g, function(url) {
                return '<b style=\'color: green;\'>' + url + '</b>';
            });
            value = value.replace(/\".*\"/g, function(url) {
                return '<b style="color: #337ab7;">' + url + '</b>';
            });
        } else {
            // value = value.replace(/[A-Za-z]*:/ig, function(url) {
            //  return '<b style=\'color: #337ab7;\'>' + url + '</b>';
            // });
            value = value.replace(/error:\s*([^\n\r]*)/ig, function(url) {
                return '<b style=\'color: red\'>' + url + '</b>';
            });
        }

        return value;
    },
}

