
SWAM.Collections = SWAM.Collections || {};

SWAM.Collection = SWAM.Object.extend({
    defaults: {
        Model: SWAM.Model,
        size: 50,
        max_visible_pages: 4
    },

    params: {},
    models: [],

    initialize: function(models, opts) {
        if (_.isObject(models) && !_.isArray(models)){
            opts = models;
            models = [];
        } 
        this.id = _.uniqueId("collection");;
        this.set(models);
        this.init_options(opts);
        this.params = _.extend({size:this.options.size}, this.params, this.options.params);
        this.resetPager();
        if (!this.options.url) this.options.url = this.options.Model.prototype.defaults.url;
    },

    getUrl: function() {
        if (this.options.url) return url;
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

    _on_fetched: function(resp, status) {
        if (resp.status) {
            if (resp && _.isArray(resp.data)) {
                this.parseResponse(resp);
                this.trigger("fetched", this);
            }
        } else {
            this.trigger("error", this. resp);
        }
        this.trigger('loading:end', this);
    },

    fetch: function(callback, opts) {
        this.trigger('loading:begin', this);
        SWAM.Rest.GET(this.options.url, this.params, function(data, status) {
            this._on_fetched(data, status);
            if (callback) callback(this, status, data);
        }.bind(this), opts);
    },

    fetchPage: function(page, callback, opts) {
        page = parseInt(page, 10) - 1;
        this.params.start = page * this.size;
        this.reset();
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
    }
});