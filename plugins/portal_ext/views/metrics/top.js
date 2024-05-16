PORTAL.Views.Leaders = SWAM.View.extend({
    template: "portal_ext.views.metrics.top",
    classes: "position-relative swam-metrics-top",

    defaults: {
        url: null,
        timeframe: "month",
        field: "id"
    },

    on_action_chart_refresh: function(evt, id) {
        this.refresh();
    },

    on_pre_render: function() {
        if (this.options.show_filters && !this.getChild("card_filter")) {
            this.enable_filters();
        }
    },

    enable_filters: function() {
        let fields = [
            {
                type: "select",
                name: "timeframe",
                size: "sm",
                options: [
                    {
                        label: "Day",
                        value: "day"
                    },
                    {
                        label: "Month",
                        value: "month"
                    },
                    {
                        label: "Year",
                        value: "year"
                    }
                ]
            }
        ];

        this.addChild("card_filter", new SWAM.Form.View({
            classes: "form-view nopad",
            fields: fields,
            defaults: this.options
        }));

        this.children.card_filter.on("input:change", this.on_input_change, this);
    },

    on_input_change: function(evt) {
        this.options[evt.name] = evt.value;
        this.refresh();
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