PORTAL.Views.MetricsChart = SWAM.View.extend(SWAM.Ext.BS).extend({
    template: "swamcore.plugins.portal_ext.views.metrics.chart",

    defaults: {
        title: "Metrics Chart",
        category: null,
        slugs: null,
        group: null,
        chart_type: "line",
        granularity: "daily",
        keys: null
    },

    on_init: function(opts) {
        if (this.options.source == "db") {
            this.options.url = "/rpc/metrics/db/metrics"
        } else {
            this.options.url = "/rpc/metrics/metrics"
        }

        this.addChild("metrics_chart", new SWAM.Views.Chart({
            type:this.options.chart_type, max_length:12,
            hide_tooltips: this.options.hide_tooltips,
            hide_legend: this.options.hide_legend
        }));
    },

    showBusy: function() {
        this.busy_dlg = SWAM.Dialog.showLoading({
            parent:this.$el
        });
    },

    hideBusy: function() {
        if (this.busy_dlg) {
            this.busy_dlg.removeFromDOM();
            this.busy_dlg = null;
        }
    },

    _refresh: function() {
        // slugs are sorted automatically, so metrics data values will be arranged accordingly
        var params = {granularity:this.options.granularity};
        if (this.options.no_refresh) return; // this assume data is coming from somewhere else
        if (this.options.category) {
            params.category = this.options.category
        } else if (this.options.slugs) {
            params.slugs = this.options.slugs;
        }

        if (this.options.group) {
            params.group = this.options.group;
        }
        
        this.showBusy();

        SWAM.Rest.GET(this.options.url, params, function(resp, status) {
            this.hideBusy();
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

    on_metrics: function (data) {
        if (this.options.on_localize) {
            data = this.options.on_localize(data);
        }
        this.options.labels = data.periods;
        this.options.period_beg = data.periods[0];
        this.options.period_end = data.periods[7];
        this.children.metrics_chart.clearData();
        this.children.metrics_chart.setLabels(this.options.labels);
        var colors = [];
        if (!this.options.colors) {
            var rgb_colors = SWAM.Views.Chart.GenerateColors([255, 0, 0], [0,0,255], 20);
            _.each(rgb_colors, function(c) {
                colors.push(`rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.5)`);
            });
            colors.shuffle(); // mix it up
        } else {
            colors = [...this.options.colors];
        }

        if (this.options.source == "db") {
            this.on_db_metrics(data, colors);
        } else {
            this.on_redis_metrics(data, colors);
        }
        this.trigger("metrics", data); // allow others to use data via event
    },

    on_redis_metrics: function(data, colors) {
        _.each(data.data, function(slug_data, slug) {
            let color = null;
            if (_.isArray(this.options.slugs)) {
                color = colors[this.options.slugs.indexOf(slug_data.slug)];
            } else {
                color = colors.pop();
            }

            this.children.metrics_chart.addDataSet(
                slug_data.slug, slug_data.values, 
                {backgroundColor: color});
        }.bind(this));

        this.renderChildren();
    },

    on_db_metrics: function(data, colors) {
        _.each(data.data, function(slug_data, slug) {
            let color = null;
            if (this.options.keys) {
                if (this.options.keys.indexOf(slug)<0) return;
                color = colors[this.options.keys.indexOf(slug)];
            } else {
                color = colors.pop();
            }
            
            this.children.metrics_chart.addDataSet(
                slug, slug_data, 
                {backgroundColor: color});
        }.bind(this));

        this.renderChildren();
    },

    on_pre_render: function() {
        this.refreshDebounced();
    }

});