SWAM.Collections = SWAM.Collections || {};

SWAM.Collection = SWAM.Object.extend({
    defaults: {
        Model: SWAM.Model,
        size: 50,
        stale_after_ms: 15000,
        max_visible_pages: 4,
        reset_before_fetch: false,
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
        this.count = 0;
        this.start = 0;
        this.size = 0;
        this.length = 0;
        this.is_loading = false;
        this.init_options(opts);
        this.set(models);
        this.params = _.extend({size:this.options.size}, this.params, this.options.params);
        this.resetPager();
        if (!this.options.url) this.options.url = this.options.Model.prototype.defaults.url;
    },

    clone: function() {
        var obj = new this.constructor(this.models, this.options);
        obj.params = _.extend({}, this.params);
        return obj;
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

    exclude: function(ids, field) {
        if (field === undefined) field = "id";
        if (_.isFunction(ids.getIds)) ids = ids.getIds();
        if (this.shadow_models == null) this.shadow_models = this.models;
        this.models = _.filter(this.models, function(model) {
            return !_.contains(ids, model.get(field));
        });
        this.length = this.models.length;
        this.trigger("reset", this);
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

    triggerChange: function() {
        this.trigger("loading:end", this);
    },

    set: function(models, append) {
        if (!append) {
            this.models = [];
        }

        _.each(models, function(m, i){
            var model;
            if (_.isObject(m.attributes)) {
                model = m;
            } else {
                if (!m.id) m.id = i+1; // fix collections with no id
                model = new this.options.Model(m);
            }
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
        if (this.params.start) delete this.params.start;
    },

    reset: function(silent) {
        this.models = [];
        this.shadow_models = null;
        this.count = 0;
        this.start = 0;
        this.size = 0;
        this.length = 0;
        this.last_fetched_at = 0;
        if (!silent) this.trigger("reset", this);
    },

    add: function(model, at_top) {
        if (!_.isDict(model.attributes) && _.isDict(model)) {
            // support for adding just a dictionary
            model = new this.options.Model(model);
        }
        if (!this.get(model)) {
            if (!at_top) {
                this.models.push(model);
            } else {
                this.models.insertAt(model, 0);
            }

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
        if (!id) return null;
        if (id.id) id = id.id;
        return _.findWhere(this.models, {id:parseInt(id)});
    },

    getIndex: function(model) {
        if (_.isNumber(model)) model = this.get(model);
        return this.models.indexOf(model);
    },

    getAfter: function(model) {
        let index = this.getIndex(model);
        if (index < 0) return null;
        index += 1;
        if (index < this.models.length) return this.models[index];
        return this.models[0];
    },

    getBefore: function(model) {
        let index = this.getIndex(model);
        if (index < 0) return null;
        index -= 1;
        if (index < 0) index = this.models.length - 1;
        return this.models[index];
    },

    find: function(predicate) {
        return _.find(this.models, predicate);
    },

    findWhere: function(query) {
        return _.find(this.models, function(m){
            for (const [key, value] of Object.entries(query)) {
                if (m.get(key) != value) return false;
            }
            return true;
        });
    },

    pluck: function(field) {
        var output = [];
        _.each(this.models, function(obj){ output.push(obj.get(field));});
        return output;
    },

    each: function(callback) {
        _.each(this.models, callback);
    },

    toList: function() {
        var output = [];
        _.each(this.models, function(obj){ output.push(obj.attributes);});
        return output;
    },

    getIds: function() {
        return this.models.map(function(obj) {
            return obj.id;
        });
    },

    getValues: function(field) {
        return this.models.map(function(obj) {
            return obj.get(field);
        });
    },

    parseResponse: function(resp) {
        this.set(resp.data, this.options.append);
        this.count = resp.count;
        this.size = resp.size;
        this.start = resp.start;
        this.end = Math.min(this.count, resp.start + resp.size);
        this.dr_start = resp.dr_start;
        this.dr_end = resp.dr_end;
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
        } else if (resp.error_code == 420) {
            // ignore aborted requests?
            return;
        } else if (resp.error_code == 401) {
            // permission denied
            this.reset(true);
            this.resetPager();
            // check to make sure we are still logged in
            if (app.me) app.me.checkAuth();
            this.trigger("error", this. resp);
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
        if (this.options.no_fetch) return;
        if (this.options.fetch_debounced) {
            this.fetchDebounced(callback, opts);
        } else {
            this._fetch(callback, opts);
        }
    },

    fetchSummary: function(callback, opts) {
        SWAM.Rest.GET(
            this.getUrl(),
            _.extend({format:"summary_only"}, this.params),
            function(data, status) {
                this._request = null;
                if (callback) callback(this, status, data);
            }.bind(this),
            opts
        );
    },

    _debounced_callbacks: function(col, status, data) {
        if (this._callbacks) {
            _.each(this._callbacks, function(callback){
                callback(col, status, data);
            });
            this._callbacks = null;
        }
    },

    _fetch: function(callback, opts) {
        this.abort();
        this.is_loading = true;
        if (opts && opts.if_stale) {
            if (!this.isStale()) {
                if (callback) callback(this, 200);
                this._debounced_callbacks(this, 200);
                this.trigger("fetched", this);
                this.trigger('loading:end', this);
                return;
            }
        }
        if (this.options.reset_before_fetch) this.reset();
        this.trigger('loading:begin', this);
        let params = this.params;
        if (this.options.ignore_params) {
            params = _.extend({}, params);
            this.options.ignore_params.forEach(e => delete params[e]);
        }
        this._request = SWAM.Rest.GET(this.getUrl(), params, function(data, status) {
            this._request = null;
            this._on_fetched(data, status);
            if (callback) callback(this, status, data);
            this._debounced_callbacks(this, status, data);
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
        if (!this._callbacks) this._callbacks = [];
        if (callback) {
            this._callbacks.push(callback);
            callback = null;
        }
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
    },

    downloadLocal: function(name, fields) {
        var output = [];
        var field_labels = [];
        var field_localize = {};
        var field_templates = {};
        var field_names = [];
        _.each(fields, function(f){
            if (f.field) {
                let field = f.field;
                let label = f.field;
                if (f.template) {
                    field_templates[field] = f.template;
                } else if (field.contains("|")) {
                    let fl = field.split("|");
                    field = fl.shift();
                    field_localize[field] = fl.join("|");
                } else if (f.localize) {
                    field_localize[field] = f.localize;
                }
                if (f.label) label = f.label;
                field_names.push(field);
                field_labels.push(label);
            } else if (_.isString(f)) {
                field_names.push(f);
                field_labels.push(f);
            }
        });
        output.push(field_labels.join(','));
        _.each(this.models, function (model) {
            let row = [];
            for (let i = 0; i < field_names.length; i++) {
                let name = field_names[i];
                if (field_templates[name]) {
                    row.push('"' + SWAM.renderString(field_templates[name], {model: model}) + '"');
                } else if (field_localize[name]) {
                    row.push('"' + model.get(field_names[i] + "|" + field_localize[name]) + '"');
                } else {
                    row.push(model.get(field_names[i]));
                }
            }

            output.push(row.join(","));
        }.bind(this));
        let blob = new Blob([output.join("\n")]);
        let a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, {
          type: "text/csv"
        });
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    download: function(filename, format, callback, localize) {
        if (localize) localize = JSON.stringify(localize);
        SWAM.Rest.DOWNLOAD(this.getRawUrl(
            {
                format_filename: filename,
                format:format,
                localize: localize
            }), null,
            function(status, state){
                // do nothing?
                if (callback) callback(status, state);
            }.bind(this), {filename:filename});
        SWAM.toast("Download Started", "Your file is downloading: " + filename, "success");
    },

    saveEach: function(data, callback) {
        const total = this.length;
        let completed = 0;
        let saved = [];
        if ((total === 0) && (callback)) return callback(saved);
        this.each(function(model){
            model.save(data, function(m, resp){
                completed++;
                if (resp.status) saved.push(m);
                if (completed == total) {
                    if (callback) callback(saved);
                }
            });
        });
    },

    batchUpdate: function(data, callback) {
        let params = this.params;
        if (this.options.ignore_params) {
            params = _.extend({}, params);
            this.options.ignore_params.forEach(e => delete params[e]);
        }
        payload = _.extend({rest_batch:"update", batch_data:data}, opts.params);
        SWAM.Rest.POST(this.getUrl(), payload, callback);
    },

    batchDelete: function(data, callback) {
        let params = this.params;
        if (this.options.ignore_params) {
            params = _.extend({}, params);
            this.options.ignore_params.forEach(e => delete params[e]);
        }
        payload = _.extend({rest_batch:"delete", batch_data:data}, opts.params);
        SWAM.Rest.POST(this.getUrl(), payload, callback);
    },

    batchUpload: function(data, callback) {
        let model = new this.options.Model();
        model.save({
            rest_batch: "create",
            batch_data: data
        }, callback);
    }
});
