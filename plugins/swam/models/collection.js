
SWAM.Collections = SWAM.Collections || {};

SWAM.Collection = SWAM.Object.extend({
    defaults: {
        Model: SWAM.Model
    },

    params: {size:50},
    models: [],

    initialize: function(models, opts) {
        if (_.isObject(models) && !_.isArray(models)){
            opts = models;
            models = [];
        } 
        this.id = null;
        this.set(models);
        this.options = _.extend({}, this.defaults, opts);
        this.params = _.extend({}, this.params, this.options.params);
    },

    getUrl: function() {
        if (this.options.url) return url;
    },

    set: function(models, append) {
        if (!append) {
            this.models = [];
        }

        _.each(models, function(m){
            this.models.push(new this.options.Model(m));
        }.bind(this));

        this.size = this.models.length;
        this.length = this.models.length;
    },

    reset: function() {
        this.models = [];
        this.count = 0;
        this.start = 0;
        this.size = 0;
        this.length = 0;
        this.params.start = 0;
        this.trigger("reset", this);
    },

    getAt: function(index) {
        if (index > this.models.length) return undefined;
        return this.models[index];
    },

    get: function(id) {
        return _.findWhere(this.models, {id:id});
    },

    parseResponse: function(resp) {
        this.set(resp.data, this.options.append);
        this.count = resp.count;
        this.start = resp.start;
        this.pagesize = resp.size;

        this.visible_pages = this.options.visible_pages || 4;
        this.current_page = Math.ceil(this.start / this.pagesize);
        this.total_pages = Math.ceil(this.count / this.pagesize);
        this._start_page = Math.min(this.current_page-2, this.total_pages - this.visible_pages);
        this._start_page = Math.max(0, this._start_page);
        this.has_more_pages = (this._start_page  + this.visible_pages) < this.total_pages;
        this.has_less_pages = this._start_page > 0;
    },

    _on_fetched: function(data, status) {
        this.trigger('loading:end', this);
        if (data && _.isArray(data.data)) {
            this.parseResponse(data);
            this.trigger("fetched", this);
        }
    },

    fetch: function(callback, opts) {
        this.trigger('loading:begin', this);
        SWAM.Rest.GET(this.options.url, this.params, function(data, status) {
            this._on_fetched(data, status);
            if (callback) callback(this, status, data);
        }.bind(this), opts);
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
    }
});