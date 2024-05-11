
SWAM.Models = SWAM.Models || {};

SWAM.Model = SWAM.Object.extend({
    defaults: {
        url:"",
        id: null,
        stale_after_ms: 60000, // default 60s stale
    },
    attributes: {},
    params: {},
    id: null,
    last_fetched_at: null,

    initialize: function(attributes, opts) {
        this.id = null;
        this.init_options(opts);
        this.id = this.options.id;
        this.params = _.extend({}, this.params, this.options.params);
        this.set(attributes);
        this.on_init();
    },

    clone: function() {
        return new this.constructor(this.attributes, this.options);
    },

    on_init: function() {
        // this is just a simple helper method to avoid having to call inheritance chains
        
    },

    clear: function() {
        this.attributes = {};
        this.trigger("change", this);
    },

    set: function(key, value) {
        if (_.isObject(key)) {
            this._prev_attributes = _.deepClone(this.attributes);
            this.attributes = window.expandObject(_.extend({}, this.attributes, key));
            if (!_.isEqual(this._prev_attributes, this.attributes)) {
                // console.log("model changed");
                this.trigger("change", this);
            }
        } else if (key) {
            if (key.contains('.')) {
                var sub = key.split('.');
                var a = sub.shift();
                var attrs = this.attributes;
                while (a) {
                    if (sub.length) {
                        if (!attrs[a]) attrs[a] = {};
                        attrs = attrs[a];
                    } else {
                        if (attrs[a] != value) {
                            attrs[a] = value;
                            this.trigger("change", this);
                        }
                    }
                    a = sub.shift();
                }
            } else if (this.attributes[key] != value) {
                this.attributes[key] = value;
                this.trigger("change", this);
            }
            
        }
        if (this.attributes.id && !this.options.no_id) this.id = this.attributes.id;
    },

    get: function(key, defaultValue, localize) {
        if (localize) {
            return this.lookup(key  + "|" + localize);
        } else if (key.contains("|")) {
            return this.lookup(key);
        }

        var sub = key.split('.');
        var a = sub.shift();
        var ret = defaultValue;

        if (key.startsWith('.')) {
            a = sub.shift();
            ret = this;
        } else {
            ret = this.attributes[a];
        }

        if ((ret === undefined) && (a && this[a])) {
            if (_.isFunction(this[a])) {
                ret = this[a]();
            } else {
                ret = this[a];
            }
        }

        if ((ret === undefined) || (ret === null)) {
            ret = defaultValue;
            return ret;
        }

        while (sub.length) {
            if (ret.attributes && ret.attributes.hasOwnProperty(sub[0])) {
                ret = ret.attributes[sub[0]];
            } else if (ret.hasOwnProperty(sub[0])) {
                ret = ret[sub[0]];
            } else if (_.isArray(ret) && (ret.indexOf(sub[0]) >= 0)) {
                return true;
            } else {
                return defaultValue;
            }

            if (ret === null) {
                return defaultValue;
            }
            sub.shift();
        }
        return ret;
    },

    hasSetting: function(setting) {
        if (_.isArray(setting)) {
            for (var i = 0; i < setting.length; i++) {
                if (this.hasSetting(setting[i])) return true;
            }
            return false;
        }
        var val = this.get("metadata." + setting);
        if (val == undefined) val = this.get(setting);
        return ["True", "true", "1", 1, true].indexOf(val) >= 0;
    },

    lookup: function(key) {
        var mc = new Mustache.Context(this);
        return mc.lookup(key);
    },

    on_fetched: function(data, status) {
        this.on_updated();
    },

    on_saved: function(data, status) {
        this.on_updated();
    },

    on_updated: function() {

    },

    _on_fetched: function(data, status) {
        if (data && data.data) {
            this.set(data.data);
            this.last_fetched_at = Date.now();
            this.trigger("fetched", this);
            this.on_fetched(data, status);
        } else {
            this.trigger("error", {model:this, response:{data:data, status:status}});
        }
    },

    _on_saved: function(data, status) {
        if (data && data.data) {
            this.set(data.data);
            this.trigger("saved", this);
            this.on_saved(data, status);
        }
    },

    dataAge: function() {
        // returns the age of the data (ie last fetched)
        return (Date.now() - this.last_fetched_at);
    },

    isStale: function() {
        if (!this.last_fetched_at) return true;
        return (this.dataAge() > this.options.stale_after_ms);
    },

    abort: function() {
        if (this._request) {
            this._request.abort();
            this._request = null;
        }
    },

    setDebounced: function(key, value) {
        if (!this._debounce_set) {
           let ms = 2000;
           this._debounce_set = window.debounce( 
               this.set.bind(this),
               ms
           );
        }
        this._debounce_set(key, value);
    },

    fetch: function(callback, opts) {
        if ((opts == undefined) && (window.isDict(callback))) {
            opts = callback;
            callback = undefined;
        }
        this.abort();
        if (opts && opts.if_stale) {
            if (!this.isStale()) {
                if (callback) callback(this, {status:true, cached:true});
                return;
            }
        }
        this.trigger("fetch:started", this);
        this._request = SWAM.Rest.GET(this.getUrl(), this.params, function(response, status) {
            this._request = null;
            this._on_fetched(response, status);
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    fetchDebounced: function(callback, opts) {
        if (!this._debounce_fetch) {
           this.options.fetch_debounce_time = this.options.fetch_debounce_time || 400;
           this._debounce_fetch = window.debounce( 
               this.fetch.bind(this),
               this.options.fetch_debounce_time
           );
        }
        this._debounce_fetch(callback, opts);
    },

    fetchIfStale: function(callback, opts) {
        if ((opts == undefined) && (window.isDict(callback))) {
            opts = callback;
            callback = undefined;
        }
        opts = opts || {};
        opts.if_stale = true;
        return this.fetch(callback, opts);
    },

    hasActiveRequest: function() {
        return ((this._request != null) || (this._request != undefined));
    },

    save: function(data, callback, opts) {
        if (opts && opts.abort_previous) this.abort();
        this._request = SWAM.Rest.POST(this.getUrl(), data, function(response, status) {
            if (response.status) {
                this.set(data);
            }
            this._request = null;
            this._on_saved(response, status);
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    destroy: function(callback, opts) {
        this.abort();
        this._request = SWAM.Rest.DELETE(this.getUrl(), null, function(response, status) {
            this._request = null;
            this.trigger("destroyed", this);
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    deleteModel: function(callback, opts) {
        return this.destroy(callback, opts);
    },

    getUrl: function() {
        var url = this.options.url;
        if (_.isFunction(this.options.url)) {
            return this.options.url(this);
        }
        if (this.options.no_url_id || !this.id) return url;
        if (url.endsWith("/")) return url + this.id;
        return url + "/" + this.id;
    },

    getRawUrl: function(params) {
        var obj = _.extend({}, this.params, params);
        var str = [];
        for(var p in obj)
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          }

        var url = this.getUrl();

        // only override if it doesn't have hose
        if (!url.startsWith("http")) {
            if (window.app && window.app.options.api_url) {
                url = window.app.options.api_url + url;
            }
        }
        return url + "?" + str.join("&");
    }
});
