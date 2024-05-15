PORTAL.Views.Leaders = SWAM.View.extend({
    template: "portal_ext.views.metrics.top",
    classes: "position-relative swam-metrics-top",

    defaults: {
        url: null,
        timeframe: "month",
        field: "id"
    },

    _refresh: function() {
        // slugs are sorted automatically, so metrics data values will be arranged accordingly
        var params = {};
        if (this.options.no_refresh) return; // this assume data is coming from somewhere else

        if (this.options.field) {
            params.field = this.options.field;
        }

        if (this.options.timeframe) {
            params.timeframe = this.options.timeframe;
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