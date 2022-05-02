
SWAM.Collections = SWAM.Collections || {};

SWAM.Collection = SWAM.Object.extend({
    defaults: {
        Model: SWAM.Model,
        size: 50,
        stale_after_ms: 15000,
        max_visible_pages: 4,
        reset_after_fetch: true,
        fetch_debounced: true  // by default debounce fetch requests (ie avoid double clicks, etc)
    },

    initialize: function(models, opts) {
        if (_.isObject(models) && !_.isArray(models)){
            opts = models;
            models = [];
        } 
        this.id = _.uniqueId("col");
        this.models = [];
        this.shadow_models = null;
        this.is_loading = false;
        this.set(models);
        this.init_options(opts);
        this.params = _.extend({size:this.options.size}, this.params, this.options.params);
        this.resetPager();
        if (!this.options.url) this.options.url = this.options.Model.prototype.defaults.url;
    },

    sortBy: function(field, decending, models) {
        var comparator = null;
        if (!decending) {
            comparator = function(model) {
                var val = model.get(field);
                if (_.isString(val)) {
                    if (val.length) return val.lower();
                } else if (isNaN(val)) {
                    return 0;
                }
                return val;
            }
        } else {
            comparator = function(model) {
                var val = model.get(field);
                if (_.isString(val)) {
                    if (val.length) {
                        val = val.lower().split("");
                        return _.map(val, function(letter) { return String.fromCharCode(-(letter.charCodeAt(0))) });
                    }
                } else if (isNaN(val)) {
                    return 0;
                }
                return -val;
            }
        }

        if (this.shadow_models == null) this.shadow_models = this.models;
        if (!models) {
            models = this.shadow_models;
        }
        models = _.sortBy(models, comparator);
        this.trigger("reset", this);
        this.setModels(models);
        return models;
    },

    clearFilter: function() {
        // reverts back to shadow models before filtering
        if (this.shadow_models) {
            this.setModels(this.shadow_models);
            this.shadow_models = null;
        }
    },

    filter: function(params) {
        // this will do local filtering and create a copy of the shadow array
        if (this.shadow_models == null) this.shadow_models = this.models;
        // now this.models will be a new array of filtered models
        var matcher = _.matcher(params);
        this.models = _.filter(this.shadow_models, function(obj){
            return matcher(obj.attributes);
        });
    },

    search: function(field, value, inplace) {
        // this will do local filtering and create a copy of the shadow array
        // can only search string fields
        if (this.shadow_models == null) this.shadow_models = this.models;
        // now this.models will be a new array of filtered models
        var models = _.filter(this.shadow_models, function(obj){
            var val = obj.attributes[field];
            return (val && val.contains(value, false));
        }.bind(this));
        if (inplace) {
            this.trigger("reset", this);
            this.setModels(models);
        }
        return models;
    },

    remoteFilter: function(params) {
        // this will do a remove filter
    },

    remoteSearch: function(params) {
        // this will do a remove filter
    },

    setModels: function(models) {
        // this assumes they are already models
        this.models = [];
        _.each(models, function(m){
            this.models.push(m);
            this.trigger("add", m);
        }.bind(this));

        this.size = this.models.length;
        this.length = this.models.length;
        this.trigger("loading:end", this);
    },

    set: function(models, append) {
        if (!append) {
            this.models = [];
        }

        _.each(models, function(m){
            var model = new this.options.Model(m);
            this.models.push(model);
            this.trigger("add", model);
        }.bind(this));

        this.size = this.models.length;
        this.length = this.models.length;
    },

    resetPager: function() {
        this.pager = {
            visible: 4,
            total: 0,
            current: 1,
            start: 0,
            has_more: false,
            has_less: false
        };
    },

    reset: function(silent) {
        this.models = [];
        this.shadow_models = null;
        this.count = 0;
        this.start = 0;
        this.size = 0;
        this.length = 0;
        if (!silent) this.trigger("reset", this);
    },

    add: function(model) {
        if (!this.get(model)) {
            this.models.push(model);
            this.length = this.models.length;
            this.trigger("add", model);
        }
    },

    remove: function(model) {
        if (this.get(model)) {
            this.models.remove(model);
            this.length = this.models.length;
            this.trigger("remove", model);
        }
    },

    getAt: function(index) {
        if (index > this.models.length) return undefined;
        return this.models[index];
    },

    get: function(id) {
        return _.findWhere(this.models, {id:id});
    },

    find: function(predicate) {
        return _.find(this.models, predicate);
    },

    parseResponse: function(resp) {
        this.set(resp.data, this.options.append);
        this.count = resp.count;
        this.size = resp.size;
        this.start = resp.start;
        this.end = Math.min(this.count, resp.start + resp.size);
        this.updatePager();
    },

    updatePager: function(start) {
        this.pager.current = Math.ceil(this.start / this.size) + 1;
        this.pager.total = Math.ceil(this.count / this.size);
        this.pager.visible = Math.min(this.pager.total, this.options.max_visible_pages);

        this.pager.start = Math.max(1, this.pager.current - (this.pager.visible-2));
        // var start = Math.max(this.pager.current - this.options.max_visible_pages / 2, this.pager.current);
        // if (this.pager.visible < this.options.max_visible_pages) {
        //     this.pager.start = 1;
        // } else if (this.pager.current + (this.pager.visible/2) >= this.pager.total) {
        //     this.pager.start = Math.max(1, this.pager.current - this.pager.visible);
        // } else {
        //     this.pager.start = Math.max(this.pager.visible - 1 - (this.pager.visible - this.pager.current), 1);
        // }
        
        this.pager.can_page = this.pager.total > 1;

        this.pager.has_more = (this.pager.start  + this.pager.visible) <= this.pager.total;
        this.pager.more_page = 0;
        if (this.pager.has_more) this.pager.more_page = Math.min(this.pager.total, this.pager.current+(this.pager.visible*2));

        this.pager.has_less = this.pager.start > 1;
        this.pager.less_page = 0;
        if (this.pager.has_less) this.pager.less_page = Math.max(1, this.pager.start-this.pager.visible);
        this.pager.next_page = (this.pager.current + 1 <= this.pager.total) ? this.pager.current + 1 : 1;
        this.pager.prev_page = (this.pager.current - 1 > 0) ? this.pager.current - 1 : this.pager.total;
        this.pager.pages = [];

        for (var i = 0; i < this.pager.visible; i++) {
            var page_id = i+this.pager.start;
            if (page_id <= this.pager.total) {
                this.pager.pages.push({
                    page:page_id,
                    is_current: page_id == this.pager.current
                });
            }

        }
    },

    abort: function() {
        if (this._request) {
            this._request.abort();
            this._request = null;
        }
    },

    isStale: function() {
        if (!this.last_fetched_at) return true;
        return (Date.now() - this.last_fetched_at) > this.options.stale_after_ms;
    },

    _on_fetched: function(resp, status) {
        this.is_loading = false;
        if (resp.status) {
            if (resp && _.isArray(resp.data)) {
                this.last_fetched_at = Date.now();
                if (this.options.reset_after_fetch) this.reset();
                this.parseResponse(resp);
                this.trigger("fetched", this);
            }
        } else {
            this.trigger("error", this. resp);
        }
        this.trigger('loading:end', this);
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

    fetch: function(callback, opts) {
        if (this.options.fetch_debounced) {
            this.fetchDebounced(callback, opts);
        } else {
            this._fetch(callback, opts);
        }
    },

    _fetch: function(callback, opts) {
        this.is_loading = true;
        this.abort();
        if (opts && opts.if_stale) {
            if (!this.isStale()) {
                if (callback) callback(this, 200);
                this.trigger("fetched", this);
                this.trigger('loading:end', this);
                return;
            }
        }
        this.trigger('loading:begin', this);
        this._request = SWAM.Rest.GET(this.getUrl(), this.params, function(data, status) {
            this._request = null;
            this._on_fetched(data, status);
            if (callback) callback(this, status, data);
        }.bind(this), opts);
    },

    fetchDebounced: function(callback, opts) {
        if (!this._debounce_fetch) {
            this._debounce_time = this.options.debounce_time || 400;
           this._debounce_fetch = window.debounce(
               this._fetch.bind(this),
               this._debounce_time
           );
        }
        this.is_loading = true;
        this.trigger('loading:begin', this);
        this._debounce_fetch(callback, opts);
    },

    fetchPage: function(page, callback, opts) {
        page = parseInt(page, 10) - 1;
        this.params.start = page * this.size;
        if (!this.options.reset_after_fetch) this.reset();
        this.fetch(callback, opts);
    },

    next: function(callback, opts) {
        this.start = this.start || 0;
        this.params.start += this.params.size;
        if ((this.count) && (this.params.start > this.count)) {
            this.params.start = 0;
        }
        this.fetch(callback, opts);
    },

    prev: function(callback, opts) {
        this.start = this.start || 0;
        this.params.start -= this.params.size;
        if ((this.count) && (this.params.start < 0)) {
            this.params.start = this.count - this.params.size;
        }
        this.fetch(callback, opts);
    },

    getUrl: function() {
        if (_.isFunction(this.options.url)) {
            return this.options.url();
        }
        return this.options.url;
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