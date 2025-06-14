
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

    'prefix': function(value, attr, fmt) {
        if (value === null) return "";
        if (!_.isString(value)) value = String(value);
        return fmt + value;
    },

    'suffix': function(value, attr, fmt) {
        if (value === null) return "";
        if (!_.isString(value)) value = String(value);
        return value + fmt;
    },

    'phone': function(value, attr, fmt) {
        if (_.isString(value)) {
            return value.formatPhone();
        }
        return value;
    },

    'ssn': function(value, attr, fmt) {
        if (value) {
            return value.formatSSN();
        }
        return value;
    },

    'lightbox' :function(value, attr, fmt) {
        // lightbox('https://example.com/1.mp4', 'video')

        var thumb_url = value;
        var media_url = value;
        var media_kind = "image";
        var title = null;
        if (value && value.attributes) value = value.attributes;

        if (value && value.thumbnail) {
            thumb_url = value.thumbnail;
            title = value.name;
            if (value.renditions) {
                if (value.kind == "I") {
                    media_kind = "image";
                    if (value.renditions.large) media_url = value.renditions.large.url;
                } else if (value.kind == "V") {
                    media_kind = "video";
                    if (value.renditions.large) media_url = value.renditions.large.url;
                } else if (value.kind == "*") {
                    media_kind = "download";
                    if (value.renditions.original) media_url = value.renditions.original.url;
                }
            }

        } else if (value && value.renditions) {
            media_kind = "download";
            if (value.renditions && value.renditions.original) media_url = value.renditions.original.url;
            var output = "<i class='bi bi-cloud-download-fill' data-action='lightbox'";
            if (media_url) output += " data-media='" + media_url + "'";
            if (media_kind) output += " data-kind='" + media_kind + "'";
            if (title) output += " data-title='" + title + "'";
            output += ">";
            return output;
        }

        if (_.isArray(fmt) && fmt.length) {
            media_url = fmt[0];
            if (fmt.length > 1) media_kind = fmt[1];
            if (fmt.length > 2) title = fmt[2];
        } else if (fmt) {
            classes = fmt;
        }

        if (!value) return "";
        var output = "<img class='swam-lighbox-img' src='" + thumb_url + "' data-action='lightbox'";
        if (media_url) output += " data-media='" + media_url + "'";
        if (media_kind) output += " data-kind='" + media_kind + "'";
        if (title) output += " data-title='" + title + "'";
        output += ">";
        return output;
    },

    'img' :function(value, attr, fmt) {
        var d = fmt;
        var classes = "swam-image";
        if (_.isArray(fmt)) {
            d = fmt[0];
            classes = fmt[1];
        } else if (fmt) {
            classes = fmt;
        }

        if (value && value.thumbnail) {
            value = value.thumbnail;
        }

        if (!value) value = d;
        if (!value) return "";
        return "<img class='" + classes + "' src='" + value + "' >";
    },

    'image': function(value, attr, fmt) {
        return this.img(value, attr, fmt);
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
    'isnull': function(value, attr, fmt) {
        return ((value == null)||(value == undefined));
    },
    'ifempty': function(value, attr, fmt) {
        return SWAM.Localize.ifemptyornull(value, attr, fmt);
    },
    'ifemptyornull': function(value, attr, fmt) {
        var arg1, arg2 = null;
        if (_.isArray(fmt)) {
            arg1 = fmt[0];
            arg2 = value;
            if (fmt[1]) arg2 = fmt[1];
        } else {
            arg1 = fmt || "not set";
            arg2 = value;
        }
        if (_.isUndefined(value) || _.isNull(value)|| (value == "")) {
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

    'clipboard': function(value, attr, fmt) {
        if (!value) return;
        let vid = _.uniqueId("clipboard");
        return `<span id="${vid}">${value}</span><button type="button" class="btn btn-link btn-clipboard" data-clipboard-target="#${vid}" data-bs-toggle="tooltip" data-bs-placement="right" title="" data-bs-original-title="Copy to clipboard" aria-label="Copy to clipboard"><i class="bi bi-clipboard"></i></button>`;
    },

    'tooltip': function(value, attr, fmt) {
        let tip = "This is toolip";
        let pos = "right";
        if (_.isArray(fmt)) {
            tip = fmt[0];
            pos = fmt[1];
        } else {
            tip = fmt || "not set";
        }
        return `<span data-bs-toggle="tooltip" data-bs-placement="${pos}" title="" data-bs-original-title="${tip}" aria-label="${tip}">${value}</span>`;
    },

    'yesno_color': function(value, attr, fmt) {
        var v = this.bool(value);
        var color = 'text-success';
        if (!v) color = 'text-danger';

        if (fmt == "invert_color") {
            if (!v) color = 'text-success';
            if (v) color = 'text-danger';
        }
        return "<div class='"+color+"'>"+(v?"YES":"NO")+"</div>";
    },

    'yesno_icon': function(value, attr, fmt) {
        var v = this.bool(value);
        var yes_icon = "bi bi-check-circle-fill";
        var no_icon = "bi bi-slash-circle-fill";
        var action = null;
        if (_.isArray(fmt)) {
            yes_icon = fmt[0];
            no_icon = yes_icon;
            if (fmt.length > 1) no_icon = fmt[1];
            if (fmt.length > 2) action = fmt[2];
        } else if (fmt) {
            if (fmt == "invert_color") {
                action = "invert_color"
            } else {
                yes_icon = fmt;
                no_icon = fmt;
            }
        }
        let icon = yes_icon;
        let classes = "text-success";
        if (action=="invert_color") v = !v;
        if (!v) {
            icon = no_icon;
            classes = "text-danger";
        }
        return SWAM.Icons.getIcon(icon, classes);
    },

    'iftruefalse': function(value, attr, fmt) {
        var values = fmt;
        if (!values) return "<span class='text-danger'>missing params</span>";
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
            } else if (_.isNumeric(value)) {
                return true;
            } else if (_.isArray(value)) {
                return value.length > 0;
            }
        }
        return value;
    },

    'gt_zero': function(value, attr, fmt) {
        return value > 0;
    },

    'lt_zero': function(value, attr, fmt) {
        return value < 0;
    },

    'gt': function(value, attr, fmt) {
        return value > parseFloat(fmt.trim());
    },

    'lt': function(value, attr, fmt) {
        return value < parseFloat(fmt.trim());
    },

    'eq': function(value, attr, fmt) {
        return value == fmt;
    },

    'timerSince': function(value, attr, fmt) {
        return SWAM.Localize.timer((Date.now() - value)/1000);
    },

    'timerObject': function(value, attr, fmt) {
        var d = {};
        d.SS = Math.floor(parseInt(value, 10));
        d.ss = d.SS % 60;
        d.MM = Math.floor(d.SS / 60);
        d.mm = d.MM % 60;
        d.HH = Math.floor(d.MM / 60);
        d.hh = d.HH % 60;
        d.DD = Math.floor(d.HH / 24);
        d.dd = d.DD;
        return d;
    },
    'timer': function(value, attr, fmt) {
        var d = this.timerObject(value, attr, fmt);
        _.each(['SS', 'ss', 'MM', 'mm', 'HH', 'hh', 'DD', 'dd'], function(v) {
            if(d[v] < 10) {
                d[v] = "0" + d[v];
            }
        });
        return this.formatDate(d, attr, fmt || 'hh:mm:ss');
    },
    'timer_ms': function(value, attr, fmt) {
        const seconds = milliseconds * 0.001;
        return this.prettytimer(seconds, attr, fmt);
    },
    'prettyTimer': function(seconds, attr, fmt) {
        return this.prettytimer(seconds, attr, fmt);
    },
    'prettytimer': function(seconds, attr, fmt) {
        if (!seconds) return "0 seconds";
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

    'eod': function(value, attr, fmt) {
        return SWAM.DataSets.hours[value];
    },

    'dow': function(value, attr, fmt) {
        return Date.DOW[value];
    },
    'sectoms': function(value) {
        // to support legacy calls we change this into a date
        return new Date(value * 1000);
    },
    'mintosecs': function(value) {
        // to support legacy calls we change this into a date
        return value * 60;
    },

    'safe_datetime': function(value, attr, fmt) {
        if(_.isUndefined(value)||(value === null)||(value == 0)) {
            return 0;
        }

        if (_.isFunction(value.dayOfYear)) return value;

        if (_.isNumeric(value)) {
            // we will assume then this is secs
            value = value * 1000;
        } else if (_.isString(value)) {
            // assume is date string
            dt = Date.parse(value);
            if (dt) value = dt;
        } else if (_.isFunction(value.getMonth)) {
            value = value.getTime();
        } else if ((value.attributes != undefined)&&(value.attributes.hour != undefined)) {
            value = value.attributes;
            value = moment(value);
        } else if (value.hour != undefined) {
            value = new Date(value.year, value.month, value.hour, value.minute, value.second,value.millisecond);
            value = value.getTime();
        }
        return value;
    },

    'datetoobj': function(value) {
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
    // 'datetime': function(value, attr, fmt) {
    //     if((value === null)||(value == 0)) {
    //         return '';
    //     }
    //     var d = this.datetoobj(this.safe_datetime(value));
    //     if (!fmt) fmt = "yyyy-MM-dd HH:mm:ss t";
    //     return this.formatDate(d, attr, fmt);
    // },
    // 'date': function(value, attr, fmt) {
    //     if(value === null) {
    //         return '';
    //     }
    //     if(!fmt) fmt = "yyyy-MM-dd";
    //     var d = this.datetoobj(this.safe_datetime(value));
    //     return this.formatDate(d, attr, fmt);
    // },
    // 'time': function(value, attr, fmt) {
    //     if(value === null) {
    //         return '';
    //     }
    //     if(!fmt) fmt = "HH:mm:ss t";
    //     var d = this.datetoobj(this.safe_datetime(value));
    //     return this.formatDate(d, attr, fmt);
    // },
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

    'pydict_to_json': function(value, attr, fmt) {
        try {
            value = value.replace(/\t/g, '');
            value = value.replace(/\n/g, '');
            value = value.replace(/None/g, 'null');
            value = value.replace(/True/g, 'true');
            value = value.replace(/False/g, 'false');
            value = value.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
            return value;
            // Convert the string to a JSON object
            // Replace single quotes with double quotes
            // Use a regular expression to match single quotes that are not inside other quotes
            // let jsonString = value.replace(/(\s*?{\s*?|\s*?,\s*?)(('\w+')\s*?:)/g, function(_, $1, $2){
            //     return $1 + $2.replace(/'/g, '"');
            // });
            // or another version
            // let jsonString = pythonDictString.replace(/\'/g, "\"")
            //                                       .replace(/True/g, "true")
            //                                       .replace(/False/g, "false")
            //                                       .replace(/None/g, "null");
            // let jsonObj = JSON.parse(jsonString);
            // return jsonObj;
        } catch (error) {
            console.log(`Error converting string to JSON: ${error}`);
            return null;
        }
    },

    'json': function(value, attr, fmt) {
        return this.prettyjson(value, attr, fmt);
    },

    'prettyjson': function(value, attr, fmt) {
        if (_.isObject(value)) {
            return window.syntaxHighlight(value);
            // return JSON.stringify(value, undefined, 2);
        } else if (_.isNumber(value)) {
            return value;
        } else if (!value) {
            return "";
        }

        resp = value.trim();
        if (resp.length && (resp[0] == "{")) {
            try {
                value = JSON.parse(value);
                return window.syntaxHighlight(value);
                // return JSON.stringify(value, undefined, 2);
            } catch(err) {
                value = this.pydict_to_json(value);
                if (value != null) {
                    value = JSON.parse(value);
                    return window.syntaxHighlight(value);
                }
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
    HTML_URL_REG: /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
    'linkify': function(value, attr, fmt) {
        // Replace URLs with anchor tags
        let label = null;
        if (fmt) {
            if (_.isArray(fmt)) {
                label = fmt[0];
            } else {
                label = fmt;
            }
        }

        return value?.replace(this.HTML_URL_REG, function(url) {
            let ulbl = url;
            if (label) ulbl = label;
            return '<a data-showurl="' + url + '" class="swam-link" href="' + url + '" target="blank">' + ulbl + '</a>';
        });
    },
    'escape': function(value, attr, fmt) {
        if (!value) return value;
        return escapeHtml(value);
    },
    'badges': function(value, attr, fmt) {
        if (_.isObject(value)) {
            var out = [];
            _.each(value, function(obj, key) {
                if (obj) out.push('<span class="badge bg-warning text-dark pr-1">' + key + '</span>');
            });
            return out.join(" ");
        }
        return value;
    },
    'badge': function(value, attr, fmt) {
        let color = "primary";
        if (fmt) {
            if (_.isArray(fmt)) {
                color = fmt[0];
            } else {
                color = fmt;
            }
        }
        return `<span class="badge bg-${color}">${value}</span>`;
    },
    'icon': function(value, attr, fmt) {
        if (!value) return "";
        return SWAM.Icons.getIcon(value);
    },

    'subtract': function(value, attr, fmt) {
        return this.minus(value, attr, fmt);
    },

    'minus': function(value, attr, fmt) {
        var m = 0;
        if (_.isNumeric(fmt)){
            m = fmt;
        } else if (fmt && fmt.isNumber()) {
            m = Number(fmt);
        }
        return value - m;
    },

    'add': function(value, attr, fmt) {
        return this.plus(value, attr, fmt);
    },

    'plus': function(value, attr, fmt) {
        var m = 0;
        if (_.isNumber(fmt)){
            m = fmt;
        } else if (fmt && fmt.isNumber()) {
            m = Number(fmt);
        }
        if (_.isNumber(value)) {
            value = value;
        } else if (value && value.isNumber()) {
            value = Number(value);
        }
        return value + m;
    },

    'multiply': function(value, attr, fmt) {
        var m = 1;
        if (_.isNumber(fmt)){
            m = fmt;
        } else if (fmt && fmt.isNumber()) {
            m = Number(fmt);
        }
        return value * m;
    },
    'divide': function(value, attr, fmt) {
        // console.log(fmt);
        if (_.isString(fmt)) fmt = fmt.removeAll("'");
        var m = 1;
        if (_.isNumber(fmt)){
            m = fmt;
        } else if (_.isString(fmt) && fmt.isNumber()) {
            m = Number(fmt);
        }
        return value / m;
    },

    'percent': function(value, attr, fmt) {
        return this.percentage(value, attr, fmt);
    },

    'percentage': function(value, attr, fmt) {
        let pos = 0;
        let empty_lbl = "0%"
        if (_.isNumber(fmt)){
            pos = fmt;
        } else if (fmt && fmt.isNumber()) {
            pos = Number(fmt);
        } else if (fmt) {
            empty_lbl = fmt;
        }

        if (!value) return empty_lbl;

        return (value*100.0).toFixed(pos) + "%";
    },

    CURRENCY_FORMATS: {
        'dollars': {
            decimal_digits:0,
            thousand_sep:",",
            decimal_sep:".",
            symbol:"$"
        },
        'dollarscents': {
            decimal_digits:2,
            thousand_sep:",",
            decimal_sep:".",
            symbol:"$"
        },
        'plain': {
            decimal_digits:0,
            thousand_sep:",",
            decimal_sep:".",
            symbol:""
        },
        'decimal': {
            decimal_digits:2,
            thousand_sep:",",
            decimal_sep:".",
            symbol:""
        },
        'crypto': {
            decimal_digits:8,
            thousand_sep:",",
            decimal_sep:".",
            symbol:""
        },
        "usd": {
            "symbol": "$",
            "name": "US Dollar",
            "symbol_native": "$",
            "decimal_digits": 2,
            "rounding": 0,
            "code": "USD",
            "name_plural": "US dollars"
        },
        "eur": {
            "symbol": "€",
            "name": "Euro",
            "symbol_native": "€",
            "decimal_digits": 2,
            "rounding": 0,
            "code": "EUR",
            "name_plural": "euros"
        },

    },

    'cents_to_currency': function(value, attr, fmt) {
        return this.currency(value / 100, attr, fmt);
    },

    'cents_to_dollars': function(value, attr, fmt) {
        return this.currency(value / 100, attr, "dollars");
    },

    'currency': function(value, attr, fmt) {
        if (value == null) return "n/a";
        if (!fmt) {
            fmt = "USD";
        } else {
            fmt = fmt.upper();
        }

        try {
            let info = null;
            if (SWAM.DataSets.currency) {
                info = SWAM.DataSets.currency[fmt];
            } else {
                info = this.CURRENCY_FORMATS[fmt.lower()];
            }

            var n = value;
            var c = info.decimal_digits;
            var t = ",";
            var d = ".";
            var s = n < 0 ? "-" : "";
            var i = parseInt(n = Math.abs(+n || 0).toFixed(c), 10) + "";
            var j = (j = i.length) > 3 ? j % 3 : 0;
            return info.symbol + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");

        } catch(err) {
            console.log(err);
        }
        return value;
    },

    'number': function(value, attr, fmt) {
        if (_.isNumber(value)) {
            return value.toLocaleString();
        }
        return '0';
    },

    'squash_number': function(value, attr, fmt) {
        let formats = 'TBMK';
        let pos = 0;
        if (_.isString(value) && value.isNumber()) {
            value = Number(value);
        }
        if (_.isNumber(value)) {
            const absValue = Math.abs(value);
            if (_.isArray(fmt)) {
                if (fmt.length === 1) {
                    if (_.isNumber(fmt[0])) {
                        pos = parseInt(fmt[0]);
                    } else if (_.isString(fmt[0])) {
                        formats = fmt[0];
                    }
                } else {
                    formats = fmt[0];
                    pos = parseInt(fmt[1]);
                }
            } else if (_.isNumber(fmt) || (_.isString(fmt) && fmt.isNumber())) {
                pos = parseInt(fmt);
            } else if (_.isString(fmt)) {
                formats = fmt;
            }
            let formattedValue;
            let ext = '';
            if (absValue >= 1.0e+12 && formats.includes('T')) {
                formattedValue = value / 1.0e+12;
                ext = 'T';
            } else if (absValue >= 1.0e+9 && formats.includes('B')) {
                formattedValue = value / 1.0e+9;
                ext = 'B';
            } else if (absValue >= 1.0e+6 && formats.includes('M')) {
                formattedValue = value / 1.0e+6;
                ext = 'M';
            } else if (absValue >= 1.0e+3 && formats.includes('K')) {
                formattedValue = value / 1.0e+3;
                ext = 'K';
            } else {
                return value.toLocaleString();
            }
            // Show decimals only if the whole number is 1 digit
            if ((formattedValue < 10) || (pos > 0)) {
                if (pos === 0) pos = 1;
                return formattedValue.toFixed(pos) + ext;
            }
            return Math.round(formattedValue) + ext;
        }
        return '0';
    },

    'currency_name': function(value, attr, fmt) {
        if (SWAM.DataSets.currency) {
            if (SWAM.DataSets.currency[value]) {
                return SWAM.DataSets.currency[value].name;
            }
        }
        return value;
    },

    'has': function(value, attr, fmt) {
        if (_.isString(value)) {
            return value.includes(fmt);
        }
        return false;
    },

    'hasperm': function(value, attr, fmt) {
        if (!value) return false;
        var values;
        if (_.isString(fmt)) {
            fmt = fmt.removeAll("'");
            values = fmt.split(',');
        } else {
            values = fmt;
        }
        if (value.hasPerm) return value.hasPerm(values);
        return false
    },

    'has_setting': function(value, attr, fmt) {
        if (!value) return false;
        var values;
        if (_.isString(fmt)) {
            fmt = fmt.removeAll("'");
            values = fmt.split(',');
        } else {
            values = fmt;
        }
        if (value.hasSetting) return value.hasSetting(values);
        return false
    },

    'tz': function(value, attr, fmt) {
        if (!fmt) return moment(value);
        var tz = fmt;
        if (_.isArray(fmt)) {
            fmt = fmt.pop();
            tz = fmt.pop();
            fmt = fmt.replaceAll("yy", "YY");
            if (fmt) return moment(value).tz(tz).format(fmt);
        }
        return moment(value).tz(tz);
    },
    'parse_date': function(value, attr, fmt) {
        if (!value) return "";
        if (_.isString(value) && fmt) {
            if (_.isArray(fmt)) fmt = fmt.pop();
            return moment(value, fmt);
        }
        return this.safe_datetime(value, attr, fmt);
    },
    'moment': function(value, attr, fmt, default_fmt) {
        value = this.safe_datetime(value, attr, fmt);
        if (value == 0) return null;
        var tz = moment.tz.guess();
        if (this.force_timezone) tz = this.force_timezone;
        if (_.isArray(fmt)) {
            tz = fmt.pop();
            fmt = fmt.pop();
            if (!fmt) fmt = default_fmt;
            fmt = fmt.replaceAll("yy", "YY");
            return moment(value).tz(tz).format(fmt);
        }
        // if (!fmt) out_fmt = default_fmt;
        // fmt = fmt.replaceAll("yy", "YY");
        if (fmt) {
            return moment(value, fmt).tz(tz).format(default_fmt);
        }
        return moment(value).tz(tz).format(default_fmt);
    },
    'time': function(value, attr, fmt) {
        return this.moment(value, attr, fmt, "h:mm:ss A");
    },
    'date': function(value, attr, fmt) {
        return this.moment(value, attr, fmt, "M/DD/YYYY");
    },
    'pretty_date': function(value, attr, fmt) {
        return this.moment(value, attr, fmt, "MMMM Do YYYY");
    },
    'datetime': function(value, attr, fmt) {
        return this.moment(value, attr, fmt, "M/DD/YYYY h:mm:ss A");
    },
    'datetime24': function(value, attr, fmt) {
        return this.moment(value, attr, fmt, "M/DD/YYYY H:mm:ss");
    },
    'time_tz': function(value, attr, fmt) {
        return this.moment(value, attr, fmt, "h:mm:ss A z");
    },
    'date_tz': function(value, attr, fmt) {
        return this.date(value, attr, fmt);
    },
    'datetime_tz': function(value, attr, fmt) {
        return this.moment(value, attr, fmt, "M/DD/YYYY h:mm:ss A z");
    },
    'datetime_utc': function(value, attr, fmt) {
        return moment.unix(value).utc().format("M/DD/YYYY h:mm:ss A z");
    },
    'date_utc': function(value, attr, fmt) {
        return moment.unix(value).utc().format("M/DD/YYYY");
    },
    'simple_time': function(value, attr, fmt) {
        return this.moment(value, attr, fmt, "h:mm A");
    },

    'years': function(value, attr, fmt) {
        value = this.safe_datetime(value, attr, fmt);
        if (value == 0) {
            return '';
        }
        return moment().diff(value, "years");
    },

    'days': function(value, attr, fmt) {
        value = this.safe_datetime(value, attr, fmt);
        if (value == 0) {
            return '';
        }
        return moment().diff(value, "days");
    },

    'until': function(value, attr, fmt) {
        value = this.safe_datetime(value, attr, fmt);
        if (window.moment) {
            return moment(value).fromNow();
        }
        return value;
    },

    'fromnow': function(value, attr, fmt) {
        if (!value) return "";
        value = this.safe_datetime(value, attr, fmt);
        if (value == 0) {
            return '';
        }
        if ((fmt == null) && window.moment) {
            value = moment(value).fromNow();
            if (value.indexOf("seconds ago") > 0) return "seconds ago";
        }
        return value;
    },

    'ago': function(value, attr, fmt) {
        if (!value) return "never";
        return this.fromnow(value, attr, fmt);
    },

    'wrap': function(value, attr, fmt) {
        fmt = fmt || "div";
        return "<" + fmt + "/>" + value + "</" + fmt + ">";
    },

    'action': function(value, attr, fmt) {
        console.log(value);
        console.log("attr:" + attr);
        console.log(fmt);
        return `<span class='localized-action' data-action="${fmt}" data-id="${value}">${value}</span>`;
    },

    'truncate': function(value, attr, fmt) {
        fmt = fmt || 0;
        fmt = parseInt(fmt, 10);
        if (!value) return value;

        if (value.length > fmt) {
            return value.slice(0, fmt) + "...";
        }
        return value;
    },

    'truncate_front': function(value, attr, fmt) {
        fmt = fmt || 14;
        fmt = parseInt(fmt, 10);
        if (!value) return value;

        if (value.length > fmt) {
            return "..." + value.slice(value.length - fmt, value.length);
        }
        return value;
    },

    'link': function(value, attr, fmt) {
        return this.href(value, attr, fmt);
    },

    'href': function(value, attr, fmt) {
        var url = "#";
        if (_.isArray(fmt)) {
            url = fmt[0];
        } else {
            url = fmt;
        }
        if (!url.startsWith("http")) {
            url = `https://${url}`
        }
        return `<a href="${url}">${value}</a>`;
    },

    'table': function(value, attr, fmt) {
        if (!value) return null;
        if (value.attributes) value = value.attributes;

        var $table = $("<table />").addClass("swam-table swam-table-bs table table-striped");
        var $thead = $("<thead />").appendTo($table);
        var $tbody = $("<tbody />").appendTo($table);
        var $hrow = $("<tr />").appendTo($thead);
        $hrow.append("<th>key</th>").append("<th>value</th>");

        var obj_to_models = function(obj, prefix) {
            _.each(obj, function(value, key){
                var lbl = key;
                if (prefix) lbl = prefix + "." + key
                if (_.isDict(value)) return obj_to_models(value, lbl);
                if (["modified", "created", "when", "last_activity", "last_login"].has(key)) value = SWAM.Localize.datetime(value);
                var $row = $("<tr />").appendTo($tbody);
                $row.append($("<td />").text(lbl)).append($("<td />").text(value));
            });
        };
        obj_to_models(value);
        var $w = $("<div />").append($table);
        return $w.html();
    },

    'list2str': function(value, attr, fmt) {
        if (_.isArray(value)) {
            return value.join(", ");
        }
        return value;
    },

    'lower': function(value, attr, fmt) {
        return this.lowercase(value, attr, fmt);
    },

    'lowercase': function(value, attr, fmt) {
        if (_.isString(value)) {
            return value.toLowerCase();
        }
        return value;
    },

    'capitalize': function(value, attr, fmt) {
        if (_.isString(value)) {
            return value.capitalize();
        }
        return value;
    },

    'caps': function(value, attr, fmt) {
        return this.capitalize(value, attr, fmt);
    },

    'upper': function(value, attr, fmt) {
        return this.uppercase(value, attr, fmt);
    },

    'uppercase': function(value, attr, fmt) {
        if (_.isString(value)) {
            return value.toUpperCase();
        }
        return value;
    },

    'unslugify': function(value, attr, fmt) {
        return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    },

    'lpad': function(value, attr, fmt) {
        if (_.isNumber(value)) value = value.toString();
        if (!_.isString(value)) return value;
        var pad_len = 4;
        var pad_char = " ";
        if (_.isArray(fmt)) {
            pad_len = parseInt(fmt[0]);
            if (fmt.length > 1) pad_char = fmt[1];
        } else {
            pad_len = parseInt(fmt);
        }
        return value.padStart(pad_len, pad_char);
    },

    'rpad': function(value, attr, fmt) {
        if (_.isNumber(value)) value = value.toString();
        if (!_.isString(value)) return value;
        var pad_len = 4;
        var pad_char = " ";
        if (_.isArray(fmt)) {
            pad_len = parseInt(fmt[0]);
            if (fmt.length > 1) pad_char = fmt[1];
        } else {
            pad_len = parseInt(fmt);
        }
        return value.padEnd(pad_len, pad_char);
    },

    "fontsize": function(value, attr, fmt) {
        if (!value) return value;
        let base_len = 22;
        let text_len = value.length;
        if (_.isArray(fmt)) {
            base_len = parseInt(fmt[0]);
            // if (fmt.length > 1) pad_char = fmt[1];
        } else if (fmt) {
            base_len = parseInt(fmt);
        }

        if (text_len >= base_len) {
            text_len = base_len - 2;
        }
        let font_size = base_len - text_len;
        return `<span style="font-size: ${font_size}vw !important;">${value}</span>`
    },

    location: function(value, attr, fmt) {
        if (!value || !value.city) return "not set";
        if (value.lat) {
            return `${value.city}, ${value.state}, ${value.country} (${value.lat}, ${value.lng})`;
        }
        return `${value.city}, ${value.state}, ${value.country}`;
    },

    address: function(value, attr, fmt, opts) {
        opts = opts || {};
        if (!value || !value.city) return "not set";
        let output = "";
        if (value.line1) {
            output = `<div>${value.line1}</div>`;
        }
        if (value.line2) {
            output += `<div>${value.line2}</div>`;
        }
        output += `<div>${value.city}, ${value.state}, ${value.postalcode}</div>`;
        if (!opts.no_country && value.country) output += `<div>${value.country}</div>`;
        return output;
    },

    address_us: function(value, attr, fmt, opts) {
        return this.address(value, attr, fmt, {no_country:true});
    },

    ignore_errors: true,
    localize: function(value, attr, fmt, context) {
        try {
            if (attr.contains('|')||attr.contains('(')) return this.localizer(value, attr, fmt, context);
            return SWAM.Localize[attr](value, attr, fmt, context);
        } catch (error) {
            console.error(error);
            if (!SWAM.Localize.ignore_errors) return error;
        }
        return value;
    },

    localizer: function(value, attr, fmt, context) {
        try {
            const functions = attr.split('|').map(fn => {
                const bracketIndex = fn.indexOf('(');
                if (bracketIndex !== -1) {
                    const fnName = fn.substring(0, bracketIndex);
                    const params = fn.substring(bracketIndex + 1, fn.length - 1).split(',').map(param => {
                        param = param.trim();
                        if ((param.startsWith("'") && param.endsWith("'") && param !== "'")
                            || (param.startsWith('"') && param.endsWith('"') && param !== '"')) {
                            return param.substring(1, param.length - 1);
                        }
                        return param;
                    });
                    return { fnName, params };
                }
                return { fnName: fn, params: [] };
            });

            let result = value;
            functions.forEach(({ fnName, params }) => {
                if (params != null) {
                    if (params.length === 0) {
                        params = null;
                    } else if (params.length === 1) {
                        params = params[0];
                    }
                }
                result = SWAM.Localize[fnName](result, attr, params, context);
            });

            return result;
        } catch (error) {
            console.error(error);
            if (!SWAM.Localize.ignore_errors) return error;
        }
        return value;
    },

    render: function(key, context) {
        // bug fix for flat keys with . notation
        if (key && key.contains(".")) context = expandObject(context);
        var mc = new Mustache.Context(context);
        return mc.lookup(key);
    },
}
