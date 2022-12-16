PORTAL.Views.MetricsChart = SWAM.View.extend(SWAM.Ext.BS).extend({
    template: "swamcore.plugins.portal_ext.views.metrics.chart",

    defaults: {
        title: "Metrics Chart",
        category: null,
        slugs: null,
    },

    on_init: function(opts) {
        this.addChild("metrics_chart", new SWAM.Views.Chart({type:"line", max_length:12}));
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

    refresh: function() {
        // slugs are sorted automatically, so metrics data values will be arranged accordingly
        var params = {};
        if (this.options.category) {
            params.category = this.options.category
        } else if (this.options.slugs) {
            params.slugs = this.options.slugs;
        }
        this.showBusy();

        SWAM.Rest.GET("/rpc/metrics/metrics", params, function(resp, status) {
            this.hideBusy();
            if (resp.status) {
                this.on_metrics(resp.data);
            }
        }.bind(this));
    },

    refreshDebounced: function() {
        if (!this._debounce_refresh) {
            this._debounce_time = this.options.debounce_time || 400;
           this._debounce_refresh = window.debounce(
               this.refresh.bind(this),
               this._debounce_time
           );
        }
        this.is_loading = true;
        this.trigger('loading:begin', this);
        this._debounce_refresh();
    },

    on_metrics: function (data) {
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
        _.each(data.data, function(slug_data) {
            let color = null;
            if (this.options.slugs) {
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

    on_pre_render: function() {
        this.refreshDebounced();
    }

});