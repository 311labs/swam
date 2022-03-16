
SWAM.Models = SWAM.Models || {};

SWAM.Model = SWAM.Object.extend({
    defaults: {
        url:"",
        stale_after_ms: 60000, // default 60s stale
    },
    attributes: {},
    id: null,
    last_fetched_at: null,

    initialize: function(attributes, opts) {
        this.id = null;
        this.set(attributes);
        this.options = _.extend({}, this.defaults, opts);
        this.on_init();
    },

    on_init: function() {
        // this is just a simple helper method to avoid having to call inheritance chains
        
    },

    getUrl: function() {
        if (this.options.no_url_id || !this.id) return this.options.url;
        return this.options.url + "/" + this.id;
    },

    set: function(key, value) {
        if (_.isObject(key)) {
            this._prev_attributes = _.deepClone(this.attributes);
            this.attributes = _.extend({}, this.attributes, key);
            if (!_.isEqual(this._prev_attributes, this.attributes)) {
                console.log("model changed");
                this.trigger("change", this);
            }
        } else {
            if (this.attributes[key] != value) {
                this.attributes[key] = value;
                this.trigger("change", this);
            }
            
        }
        if (this.attributes.id) this.id = this.attributes.id;
    },

    get: function(key, defaultValue, localize) {
        if (localize) {
            return this.lookup(key  + "|" + localize);
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

    lookup: function(key) {
        var mc = new Mustache.Context(this);
        return mc.lookup(key);
    },

    _on_fetched: function(data, status) {
        if (data && data.data) {
            this.set(data.data);
            this.last_fetched_at = Date.now();
            this.trigger("fetched", this);
        }
    },

    _on_saved: function(data, status) {
        if (data && data.data) {
            this.set(data.data);
            this.trigger("saved", this);
        }
    },

    isStale: function() {
        if (!this.last_fetched_at) return true;
        return (Date.now() - this.last_fetched_at) > this.options.stale_after_ms;
    },

    abort: function() {
        if (this._request) {
            this._request.abort();
            this._request = null;
        }
    },

    fetch: function(callback, opts) {
        this.abort();
        if (opts && opts.if_stale) {
            if (!this.isStale()) {
                if (callback) callback(this, "success", this.attributes);
                return;
            }
        }
        this._request = SWAM.Rest.GET(this.getUrl(), null, function(response, status) {
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

    save: function(data, callback, opts) {
        this.abort();
        this.set(data);
        this._request = SWAM.Rest.POST(this.getUrl(), data, function(response, status) {
            this._request = null;
            this._on_saved(response, status);
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    deleteModel: function(callback, opts) {
        throw Exception("not implemented");
    }
});
