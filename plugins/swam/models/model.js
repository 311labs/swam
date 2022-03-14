
SWAM.Models = SWAM.Models || {};

SWAM.Model = SWAM.Object.extend({
    defaults: {url:""},
    attributes: {},
    id: null,

    initialize: function(attributes, opts) {
        this.id = null;
        this.set(attributes);
        this.options = _.extend({}, this.defaults, opts);
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
            this.trigger("fetched", this);
        }
    },

    _on_saved: function(data, status) {
        if (data && data.data) {
            this.set(data.data);
            this.trigger("saved", this);
        }
    },

    fetch: function(callback, opts) {
        SWAM.Rest.GET(this.getUrl(), null, function(response, status) {
            this._on_fetched(response, status);
            if (callback) callback(this, status, response);
        }.bind(this), opts);
    },

    save: function(data, callback, opts) {
        this.set(data);
        SWAM.Rest.POST(this.getUrl(), data, function(response, status) {
            this._on_saved(response, status);
            if (callback) callback(this, status, response);
        }.bind(this), opts);
    },
});
