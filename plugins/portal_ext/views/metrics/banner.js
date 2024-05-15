PORTAL.Views.MetricsBanner = SWAM.View.extend({
    template: "portal_ext.views.metrics.banner",
    classes: "position-relative swam-metrics-banner",

    defaults: {
        granularity: null,
        source: null
    },

    on_init: function(opts) {
        if (!this.options.url) {
            if (this.options.source == "db") {
                this.options.url = "/api/metrics/db/metric";
            } else {
                this.options.url = "/api/metrics/metric";
            }
        }
    },

    _refresh: function() {
        // slugs are sorted automatically, so metrics data values will be arranged accordingly
        var params = {};
        if (this.options.no_refresh) return; // this assume data is coming from somewhere else
        if (this.options.category) {
            params.category = this.options.category
        } else if (this.options.slugs) {
            params.slugs = this.options.slugs;
        }

        if (this.options.group) {
            params.group = this.options.group;
        }

        if (this.options.prefix) {
            params.prefix = this.options.prefix;
        }

        if (this.options.slug) {
            params.slug = this.options.slug;
        }

        if (this.options.granularity) {
            params.granularity = this.options.granularity;
        } else if (this.options.min_granularity) {
            params.min_granularity = this.options.min_granularity;
        }
        if (this.options.max_granularity) {
            params.max_granularity = this.options.max_granularity;
        }

        if (this.options.summary) {
            params.format = "summary_only";
        }

        SWAM.Rest.GET(this.options.url, params, function(resp, status) {
            if (resp.status) {
                this.on_metrics(resp.data);
            }
        }.bind(this));
    },

    refresh: function() {
        this.refreshDebounced();
    },

    refreshDebounced: function() {
        if (!this._debounce_refresh) {
            this._debounce_time = this.options.debounce_time || 400;
           this._debounce_refresh = window.debounce(
               this._refresh.bind(this),
               this._debounce_time
           );
        }
        this.is_loading = true;
        this.trigger('loading:begin', this);
        this._debounce_refresh();
    },

    on_metrics: function(data) {
        if (this.options.field_labels) {
            let new_data = {};
            _.each(this.options.field_labels, function(v, k) {
                if (data[k] != undefined) new_data[v] = data[k];
            });
            this.data = new_data;
        } else {
            this.data = data;
        }
        this.render();
    }

});