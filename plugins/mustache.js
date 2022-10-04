var Mustache;!function(t){"undefined"!=typeof module&&module.exports?module.exports=t:"function"==typeof define?define(t):Mustache=t}(function(){function t(t,e){return RegExp.prototype.test.call(t,e)}function e(e){return!t(g,e)}function n(t){return t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function r(t){return String(t).replace(/[&<>"'\/]/g,function(t){return _[t]})}function i(t){this.string=t,this.tail=t,this.pos=0}function o(t,e){this.view=t,this.parent=e,this.clearCache()}function a(){this.clearCache()}function c(t){for(var e,n=t[3],r=n;(e=t[4])&&e.length;)t=e[e.length-1],r=t[3];return[n,r]}function s(t){function e(t,e,r){if(!n[t]){var i=s(e);n[t]=function(t,e){return i(t,e,r)}}return n[t]}var n={};return function(n,r,i){for(var o,a,s="",u=0,l=t.length;l>u;++u)switch(o=t[u],o[0]){case"#":a=i.slice.apply(i,c(o)),s+=n._section(o[1],r,a,e(u,o[4],i));break;case"^":s+=n._inverted(o[1],r,e(u,o[4],i));break;case">":s+=n._partial(o[1],r);break;case"&":s+=n._name(o[1],r);break;case"name":s+=n._escaped(o[1],r);break;case"text":s+=o[1]}return s}}function u(t){for(var e,n,r=[],i=r,o=[],a=0;a<t.length;++a)switch(e=t[a],e[0]){case"#":case"^":e[4]=[],o.push(e),i.push(e),i=e[4];break;case"/":if(0===o.length)throw new Error("Unopened section: "+e[1]);if(n=o.pop(),n[1]!==e[1])throw new Error("Unclosed section: "+n[1]);i=o.length>0?o[o.length-1][4]:r;break;default:i.push(e)}if(n=o.pop())throw new Error("Unclosed section: "+n[1]);return r}function l(t){for(var e,n,r=[],i=0;i<t.length;++i)e=t[i],n&&"text"===n[0]&&"text"===e[0]?(n[1]+=e[1],n[3]=e[3]):(n=e,r.push(e));return r}function p(t){if(2!==t.length)throw new Error("Invalid tags: "+t.join(" "));return[new RegExp(n(t[0])+"\\s*"),new RegExp("\\s*"+n(t[1]))]}var h={};h.name="mustache.js",h.version="0.7.1",h.tags=["{{","}}"],h.Scanner=i,h.Context=o,h.Writer=a;var f=/\s*/,v=/\s+/,g=/\S/,d=/\s*=/,m=/\s*\}/,y=/#|\^|\/|>|\{|&|=|!/,w=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},_={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};h.escape=r,i.prototype.eos=function(){return""===this.tail},i.prototype.scan=function(t){var e=this.tail.match(t);return e&&0===e.index?(this.tail=this.tail.substring(e[0].length),this.pos+=e[0].length,e[0]):""},i.prototype.scanUntil=function(t){var e,n=this.tail.search(t);switch(n){case-1:e=this.tail,this.pos+=this.tail.length,this.tail="";break;case 0:e="";break;default:e=this.tail.substring(0,n),this.tail=this.tail.substring(n),this.pos+=n}return e},o.make=function(t){return t instanceof o?t:new o(t)},o.prototype.clearCache=function(){this._cache={}},o.prototype.push=function(t){return new o(t,this)},o.prototype.lookup=function(t){var e=this._cache[t];if(!e){if("."===t)e=this.view;else for(var n=this;n;){if(t.indexOf(".")>0){var r=t.split("."),i=0;for(e=n.view;e&&i<r.length;)e=e[r[i++]]}else e=n.view[t];if(null!=e)break;n=n.parent}this._cache[t]=e}return"function"==typeof e&&(e=e.call(this.view)),e},a.prototype.clearCache=function(){this._cache={},this._partialCache={}},a.prototype.compile=function(t,e){var n=this._cache[t];if(!n){var r=h.parse(t,e);n=this._cache[t]=this.compileTokens(r,t)}return n},a.prototype.compilePartial=function(t,e,n){var r=this.compile(e,n);return this._partialCache[t]=r,r},a.prototype.compileTokens=function(t,e){var n=s(t),r=this;return function(t,i){if(i)if("function"==typeof i)r._loadPartial=i;else for(var a in i)r.compilePartial(a,i[a]);return n(r,o.make(t),e)}},a.prototype.render=function(t,e,n){return this.compile(t)(e,n)},a.prototype._section=function(t,e,n,r){var i=e.lookup(t);switch(typeof i){case"object":if(w(i)){for(var o="",a=0,c=i.length;c>a;++a)o+=r(this,e.push(i[a]));return o}return i?r(this,e.push(i)):"";case"function":var s=this,u=function(t){return s.render(t,e)},l=i.call(e.view,n,u);return null!=l?l:"";default:if(i)return r(this,e)}return""},a.prototype._inverted=function(t,e,n){var r=e.lookup(t);return!r||w(r)&&0===r.length?n(this,e):""},a.prototype._partial=function(t,e){t in this._partialCache||!this._loadPartial||this.compilePartial(t,this._loadPartial(t));var n=this._partialCache[t];return n?n(e):""},a.prototype._name=function(t,e){var n=e.lookup(t);return"function"==typeof n&&(n=n.call(e.view)),null==n?"":String(n)},a.prototype._escaped=function(t,e){return h.escape(this._name(t,e))},h.parse=function(t,r){function o(){if(x&&!C)for(;b.length;)k.splice(b.pop(),1);else b=[];x=!1,C=!1}t=t||"",r=r||h.tags;for(var a,c,s,g,w=p(r),_=new i(t),k=[],b=[],x=!1,C=!1;!_.eos();){if(a=_.pos,s=_.scanUntil(w[0]))for(var U=0,E=s.length;E>U;++U)g=s.charAt(U),e(g)?b.push(k.length):C=!0,k.push(["text",g,a,a+1]),a+=1,"\n"===g&&o();if(a=_.pos,!_.scan(w[0]))break;if(x=!0,c=_.scan(y)||"name",_.scan(f),"="===c)s=_.scanUntil(d),_.scan(d),_.scanUntil(w[1]);else if("{"===c){var P=new RegExp("\\s*"+n("}"+r[1]));s=_.scanUntil(P),_.scan(m),_.scanUntil(w[1]),c="&"}else s=_.scanUntil(w[1]);if(!_.scan(w[1]))throw new Error("Unclosed tag at "+_.pos);k.push([c,s,a,_.pos]),("name"===c||"{"===c||"&"===c)&&(C=!0),"="===c&&(r=s.split(v),w=p(r))}return k=l(k),u(k)};var k=new a;return h.clearCache=function(){return k.clearCache()},h.compile=function(t,e){return k.compile(t,e)},h.compilePartial=function(t,e,n){return k.compilePartial(t,e,n)},h.compileTokens=function(t,e){return k.compileTokens(t,e)},h.render=function(t,e,n){return k.render(t,e,n)},h.to_html=function(t,e,n,r){var i=h.render(t,e,n);return"function"!=typeof r?i:void r(i)},h}());

(function() {

Mustache.Context.prototype.ext_lang = function(name) {
    // uses language packs loaded to window.language_packs
    // use quotes for language key
    // LANG("btn_cancel")
    // no quotes is a variable, and can include multiple variables with commas
    // advance use INCLUDE()
    var keys = this.parseValueName(name);
    var key = keys.shift();
    var params = key.params.split(',');
    var lang_key = "";
    _.each(params, function(param){
        param = param.trim();
        if ((param.indexOf('"') === 0) || (param.indexOf("'") === 0)) {
            // string path
            param = param.removeAll('"').removeAll("'");
            lang_key += param;
        } else {
            // variable path
            lang_key += this.lookup(param);
        }
    }.bind(this));

    var context = {mustache_local_context:this.view};
    if (this.parent && this.parent.view) context.mustache_parent_context = this.parent;
    return SWAM.renderTemplate(SWAM.Localize.lang(lang_key.lower()), this.view);
};

Mustache.Context.prototype.ext_include = function(name) {
    // use quotes for template path
    // INCLUDE("template_path")
    // no quotes is a variable, and can include multiple variables with commas
    // advance use INCLUDE()
    var keys = this.parseValueName(name);
    var key = keys.shift();
    var params = key.params.split(',');
    var template_path = "";
    _.each(params, function(param){
        param = param.trim();
        if ((param.indexOf('"') === 0) || (param.indexOf("'") === 0)) {
            // string path
            param = param.removeAll('"').removeAll("'");
            if (param[0] === '.') {
                template_path += window.last_template_path + param;
            } else {
                template_path += param;
            }
        } else {
            // variable path
            template_path += this.lookup(param);
        }
    }.bind(this));
    var context = {mustache_local_context:this.view};
    if (this.parent && this.parent.view) context.mustache_parent_context = this.parent;
    return SWAM.renderTemplate(template_path, context);
};

Mustache.Context.prototype.ext_icon = function(name) {
    var keys = this.parseValueName(name);
    if (!keys.length) return null;
    var value = keys[0].params;
    if (value.startsWith("'") || value.startsWith('"')) {
        value = value.removeAll('"').removeAll("'");
    } else {
        value = this.findValue(value);
        if (!value) value = keys[0].params;
    }
    if (!value) return null;
    var icon = SWAM.Icons.getIcon(value);
    // if (!icon) icon = '<i class="bi bi-' + value + '"></i>'
    return icon;
};


Mustache.Context.prototype.ext_dot = function(name) {
    if (name.startsWith(".|")) {
        var info = this.parseValueName(name.slice(1));
        if (info.length) return this.applyFilters(this.view, info[0].filters);
    }
    return this.view;
};

Mustache.Context.prototype.ext_list = ["INCLUDE", "LANG", "ICON"];

Mustache.Context.prototype.runExtCheck = function(name){
    // first lets check our extensions
    var i = 0;
    for (; i < this.ext_list.length; i++) {
        var ext_name = this.ext_list[i];
        if (name.indexOf(ext_name + "(") == 0) {
            // we found an extension, lets run it
            // console.log("found ext: " + ext_name);
            var func_name = "ext_" + ext_name.toLowerCase();
            if (_.isFunction(this[func_name])) {
                return this[func_name](name);
            }
        }
    }
    return null;
};

Mustache.Context.prototype.parseValueName = function(name) {
    // has nested object
    // obj.value1|filter1|filter2.value2|filter3
    // walk through each value and apply filters
    // we must honor quotes ' and " ingoring inside
    var i = 0;
    var key = {key:""};
    var is_filter = false;
    var is_params = false;
    var keys = [];
    var has_quote = null;
    for (; i < name.length; i++) {
        if (has_quote) {
            // we have an open quote
            // read until we find the closing quote
            if (name[i] == has_quote) {
                has_quote = null;
            }
            if (is_filter) {
                key.filter += name[i];
            } else if (is_params && (name[i] != ')')) {
                key.params += name[i];
            } else if (is_params && (name[i] == ')')) {
                is_params = false;
            } else {
                key.key += name[i];
            }
        } else if (name[i] == '.') {
            if (is_filter && key.filter) {
                if (!key.filters) key.filters = [];
                key.filters.push(key.filter);
                key.filter = null;
            }
            keys.push(key);
            key = {key:""};
            is_filter = false;
            is_params = false;
        } else if ((name[i] == '"')||(name[i] == "'")) {
            key.key += name[i];
            has_quote = name[i];
        } else if (name[i] == '(') {
            if (!is_filter) {
                is_params = true;
                key.params = "";
            } else {
                key.filter += name[i];
            }
            has_quote = ')';
        } else if (name[i] == '|') {
            if (is_filter && key.filter) {
                if (!key.filters) key.filters = [];
                key.filters.push(key.filter);
            }
            is_filter = true;
            key.filter = "";
        } else if (is_filter) {
            key.filter += name[i];
        } else {
            key.key += name[i];
        }
    }
    if (key) {
        if (is_filter && key.filter) {
            if (!key.filters) key.filters = [];
            key.filters.push(key.filter);
            delete key.filter;
        }
        keys.push(key);
    }
    return keys;
};

Mustache.Context.prototype.getValueForContext = function(key, context) {
    // looks through the context for the given key to find the value
    if (_.isUndefined(context)) return undefined;
    if (_.isNull(context)) return null;
    if (!_.isUndefined(context[key])) {
        var value = context[key];
        // handle functions
        if (_.isFunction(value)) return value.call(context);
        return value;
    } else if (_.isFunction(context.get)) {
        return context.get(key);
    }
    return undefined;
}

Mustache.Context.prototype.parseFilterParams = function(params) {
    var i = 0;
    var output = [];
    var can_quote = true;
    var has_quote = null;
    var cv = null;
    var p = "";
    for (; i < params.length; i++) {
        if (has_quote) {
            // we have an open quote
            // read until we find the closing quote
            if (params[i] == has_quote) {
                has_quote = null;
                output.push(p);
                p = "";
                can_quote = true;
            } else {
                p += params[i];
            }

        } else if (can_quote && ((params[i] == '"')||(params[i] == "'"))) {
            // p = "" + params[i];
            p = '';
            has_quote = params[i];
            can_quote = false;
        } else if (params[i] == ',') {
            can_quote = true;
            if (p) {
                // this is not quoted, lets try and find a context value
                cv = this.findValue(p.trim());
                // this is where we need to force not quoted to context lookup
                // but for legacy support we will fallback
                if (cv) {
                    output.push(cv);
                } else {
                    output.push(p);
                }
            }
            p = "";
        } else if (params[i] == ' ') {
            p += params[i];
        } else {
            can_quote = false;
            p += params[i];
        }
    }
    if (p) {
        p = p.trim();
        // this is not quoted, lets try and find a context value
        cv = this.findValue(p);
        // this is where we need to force not quoted to context lookup
        // but for legacy support we will fallback
        if (Mustache.smart_params_require_quotes) {
            output.push(cv);
        } else if (cv) {
            output.push(cv);
        } else {
            output.push(p);
        }
    }
    return output;
};

Mustache.Context.prototype.applyFilters = function(context, filters) {
    var value = context;
    _.each(filters, function(filter){
        var name = filter;
        var params = null;
        if (filter.indexOf('(') >= 0) {
            var pos = filter.indexOf('(');
            name = filter.substr(0, pos);
            params = filter.substr(pos+1, filter.indexOf(')')-pos-1);
            if (params && Mustache.smart_params) {
                params = this.parseFilterParams(params);
                if (params.length == 1) params = params[0];
            }
        }

        if (SWAM.Localize[name]) {
            value = SWAM.Localize.localize(value, name, params, this);
        }
    }.bind(this));
    return value;
}

Mustache.Context.prototype.findValue = function(name) {
    // if simple local ref, call dot ext
    if ((name === ".")||(name.startsWith(".|"))) return this.ext_dot(name);
    var index = name.indexOf('<');
    if ((index >= 0)&&(index <= 3)) return name;

    // now walk through context to find objects
    var context = this;
    var view = context.view;

    var loc_opts = null;
    var is_explicit = false;

    if (name.indexOf('..') == 0) {
        // walk one layer back?
        context = this.parent;
        view = this.parent.view;
        name = name.slice(2);
    } else if (name[0] == '.') {
        // context is reference the current object
        // do anything special??
        name = name.slice(1);
        is_explicit = true;
    } else if (this.parent) {
        // if not dot then we should walk back to the parent?
        // a better method might be to use ".." to walk backwards?
        while (context.parent) {
            context = context.parent;
            view = context.view;
        }
        // context = this.parent;
        // view = this.parent.view;
    }

    var obj_tree = this.parseValueName(name);
    var key = obj_tree.shift();
    while (key) {
        value = this.getValueForContext(key.key, view);
        if (!is_explicit && _.isUndefined(value) && context.parent) {
            // try the parent context
            while (context.parent && _.isUndefined(value)) {
                context = context.parent;
                view = context.view;
                value = this.getValueForContext(key.key, view);
            }
        }

        // handle collections with models
        // only there are no more keys in the tree
        if ((obj_tree.length == 0) && _.isObject(value) && _.isNumber(value.count) && _.isArray(value.models)) value = value.models;

        view = value;
        // apply filters
        if (key.filters) {
            view = this.applyFilters(value, key.filters);
        }

        if (_.isUndefined(view) || (view === null)) {
            // lets get to the end
            while(key) {
                key = obj_tree.shift();
                if (key && key.filters) {
                    view = this.applyFilters(value, key.filters);
                }
            }
            return view;
        }
        context = view;
        key = obj_tree.shift();
    }
    return context;
};

Mustache.Context.prototype.lookup = function(name) {
    // this = Context
    // this.view = current object 'in view'
    // this.parent = prev context
    // this.parent.view = prev context 'in view'
    var value = this._cache[name];
    if (!value) {
        // run extensions, if they return data, return it (no cache)
        if (this.view && this.view.mustache_local_context) {
            this.parent = this.view.mustache_parent_context;
            this.view = this.view.mustache_local_context;
        }
        value = this.runExtCheck(name);
        if (value) return value;
        // attempt to find the value
        value = this.findValue(name);
        this._cache[name] = value;
    }
    return value;
}

Mustache.Context.prototype.test = function() {

};

})();