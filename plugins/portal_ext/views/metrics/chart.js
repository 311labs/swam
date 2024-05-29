PORTAL.Views.MetricsChart = SWAM.View.extend(SWAM.Ext.BS).extend({
    template: "portal_ext.views.metrics.chart",
    classes: "position-relative swam-metrics-chart",

    defaults: {
        title: "Metrics Chart",
        title_classes: "",
        category: null,
        slugs: null,
        parse_slug: null,
        group: null,
        requires_group: false,
        chart_type: "line",
        granularity: "daily",
        keys: null,
        url: null,
        duration: null,
        line_width: 1,
        size: 8,
        show_table: true,
        max_colors: 20,
        start_color: [255, 0, 0],
        end_color: [0, 0, 255]
    },

    on_init: function(opts) {
        if (!this.options.url) {
            if (this.options.source == "db") {
                this.options.url = "/api/metrics/db/metrics"
            } else {
                this.options.url = "/api/metrics/metrics"
            }
        }

        this.addChild("metrics_chart", new SWAM.Views.Chart({
            type:this.options.chart_type, max_length:12,
            line_width: this.options.line_width,
            aspect_ratio: this.options.aspect_ratio,
            yaxis_localize: this.options.yaxis_localize,
            xaxis_localize: this.options.xaxis_localize,
            hide_tooltips: this.options.hide_tooltips,
            hide_legend: this.options.hide_legend,
            height: this.options.height,
            xaxis_hide: this.options.xaxis_hide
        }));

        if (this.options.filters) {
            this.enable_filters();
        }

        if (this.options.chart_types) {
            this.enable_chart_types();
        }

        if (this.options.group_select) {
            this.enable_group_select();
        }
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
        if (this.options.requires_group && !this.options.group) return;
        if (this.options.prefix) params.prefix = this.options.prefix;
        if (this.options.category) {
            params.category = this.options.category
        } else if (this.options.slugs) {
            params.slugs = this.options.slugs;
        } else if (this.options.ids) {
            params.ids = this.options.ids;
            if (this.options.duration) {
                params.duration = this.options.duration;
                params.period = parseInt(this.options.duration / this.options.size);
                params.period = (Math.ceil(params.period / 60)) * 60;
            }
        }

        if (this.options.samples) {
            if (this.options.granularity == "daily") {
                params.since = moment().subtract(this.options.samples, "d").format("YYYY-MM-DD");
            } else if (this.options.granularity == "monthly") {
                params.since = moment().subtract(this.options.samples, "months").format("YYYY-MM-DD");
            }
            if (this.options.source != "db") {
                params.samples = this.options.samples;
            }
        }

        if (this.options.group) {
            params.group = this.options.group;
        }

        if (this.options.field) {
            params.field = this.options.field;
        }

        if (this.options.group_select) {
            let gs = this.getChild("group_select");
            
            if (this.options.parent) {
                gs.collection.params.child_of = this.options.parent;
                // gs.setActive(this.options.group);
            }

            gs.collection.fetch();
        }
        
        this.showBusy();

        SWAM.Rest.GET(this.options.url, params, function(resp, status) {
            this.hideBusy();
            if (resp.status) {
                this.on_metrics(resp.data);
            }
        }.bind(this));
    },

    update: function() {
        if (this.options.yaxis_localize) this.getChild("metrics_chart").options.yaxis_localize = this.options.yaxis_localize;
        if (this.options.xaxis_localize) this.getChild("metrics_chart").options.xaxis_localize = this.options.xaxis_localize;
        // this.getChild("metrics_chart").updateConfig();
    },

    refresh: function() {
        this.refreshDebounced();
    },

    setGroup: function(group) {
        if (this.getChild("group_select")) {
            this.getChild("group_select").setActive(group);
            this.getChild("group_select").collection.params.child_of = group.id;
        }
    },

    enable_filters: function() {
        let fields = [
            {
                type: "select",
                name: "granularity",
                size: "sm",
                options: [
                    {
                        label: "Hourly",
                        value: "hourly"
                    },
                    {
                        label: "Daily",
                        value: "daily"
                    },
                    {
                        label: "Weekly",
                        value: "weekly"
                    },
                    {
                        label: "Monthly",
                        value: "monthly"
                    },
                    {
                        label: "Yearly",
                        value: "yearly"
                    },
                ]
            }
        ];

        if (this.options.support_minutes) {
            fields[0].options.insertAt({label:"Minutes", value:"minutes"}, 0);
        }

        if (_.isDict(this.options.filters) && this.options.filters.fields) {
            fields[0].columns = 6;
            fields.push({
                    type: "select",
                    name: "field",
                    size: "sm",
                    options: this.options.filters.fields,
                    columns: 6
                });
        }

        this.addChild("card_filter", new SWAM.Form.View({
            classes: "form-view nopad",
            fields: fields,
            defaults: this.options
        }));

        this.children.card_filter.on("input:change", this.on_input_change, this);
    },

    enable_chart_types: function() {

        this.addChild("chart_types", new SWAM.Form.View({
            classes: "form-view nopad",
            fields:[
                {
                    type: "select",
                    name: "chart_type",
                    size: "sm",
                    options: this.options.chart_types,
                    columns: 12
                },
            ],
            defaults: this.options
        }));

        this.children.chart_types.on("input:change", this.on_input_change, this);
    },

    enable_group_select: function() {
        let collection = new SWAM.Collections.Group();

        this.addChild("group_select", new SWAM.Views.SearchDown({
            btn_classes: "btn btn-default btn-sm text-decoration-none",
            remote_search: true,
            auto_fetch: true,
            collection: collection, 
            empty_label: this.options.empty_label
        }));
        // this.children.chart_types.on("input:change", this.on_input_change, this);
    },

    on_action_searchdown: function(evt) {
        // get the model straight from the component
        // let model = this.getChild("group_select").active_model;
        this.options.group = $(evt.currentTarget).data("id");
        this.refresh();
    },

    on_input_change: function(evt) {
        this.options[evt.name] = evt.value;
        if (evt.name == "chart_type") {
            this.getChild("metrics_chart").options.type = evt.value;
        }
        this.refresh();
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
        this.options.period_end = data.periods[data.periods.length-1];
        this.children.metrics_chart.clearData();
        this.children.metrics_chart.setLabels(this.options.labels);
        var colors = [];
        if (!this.options.colors) {
            let rgb_colors;
            if (this.options.max_colors > 10) {
                for (var i = 0; i < this.options.max_colors; i+=10) {
                    let mi = i % 3;
                    let r1, g1, b1, r2, g2, b2;
                    if (mi == 1) {
                        r1 = Math.min(255, i*3);
                        g1 = i;
                        b1 = i;
                        r2 = i;
                        g2 = Math.max(0, 255-(i*2));
                        b2 = Math.max(0, 255-(i*3));
                    } else if (mi == 2) {
                        r1 = i;
                        g1 = Math.min(255, i*3);
                        b1 = i;
                        r2 = 255;
                        g2 = i;
                        b2 = 255;
                    } else if (mi == 0) {
                        r1 = i;
                        g1 = i;
                        b1 = Math.min(255, i*3);
                        r2 = 255;
                        g2 = 255;
                        b2 = i;
                    }
                    rgb_colors = SWAM.Views.Chart.GenerateColors(
                                    [r1, g1, b1],
                                    [r2, g2, b2], 
                                    10);
                    _.each(rgb_colors, function(c) {
                        colors.push(`rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.5)`);
                    });
                }
            } else {
                rgb_colors = SWAM.Views.Chart.GenerateColors(
                                this.options.start_color,
                                this.options.end_color, 
                                this.options.max_colors);
                _.each(rgb_colors, function(c) {
                    colors.push(`rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.5)`);
                });
            }

            colors.shuffle(); // mix it up
            this.options.colors = colors;
        }
        colors = [...this.options.colors];

        if ((this.options.keys == "all")||(this.options.field)) {
            this.on_all_metrics(data, colors);
        } else if (this.options.source == "db") {
            this.on_db_metrics(data, colors);
        } else if (this.options.source == "aws") {
            this.on_aws_metrics(data, colors);
        } else {
            this.on_redis_metrics(data, colors);
        }
        this.trigger("metrics", data); // allow others to use data via event
    },

    on_aws_metrics: function(data, colors) {
        _.each(data.data, function(data, key) {
            let color = colors.pop();

            this.children.metrics_chart.addDataSet(
                key, data, 
                {backgroundColor: color});
        }.bind(this));

        this.renderChildren();
    },

    on_redis_metrics: function(data, colors) {
        _.each(data.data, function(slug_data, slug) {
            let color = null;
            if (_.isArray(this.options.slugs)) {
                color = colors[this.options.slugs.indexOf(slug_data.slug)];
            } else {
                color = colors.pop();
            }

            let key = slug_data.slug;
            if (this.options.parse_slug) {
                key = key.split(this.options.parse_slug).pop();
            }

            this.children.metrics_chart.addDataSet(
                key, slug_data.values, 
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
                {
                    backgroundColor: color,
                    borderColor: color,
                    borderWidth: this.options.line_width
                });
        }.bind(this));

        this.renderChildren();
    },

    on_all_metrics: function(data, colors) {
        if (this.options.filters && this.options.filters.yaxis_localize) {
            this.options.yaxis_localize = this.options.filters.yaxis_localize[this.options.field];
            this.getChild("metrics_chart").options.yaxis_localize = this.options.yaxis_localize;
        }
        this.options.yaxis_localize = 
        _.each(data.data, function(slug_data, slug) {
            let color = colors.pop();
            if (this.options.parse_slug) {
                slug = slug.split(this.options.parse_slug).pop();
            }
            this.children.metrics_chart.addDataSet(
                slug, slug_data, 
                {
                    backgroundColor: color,
                    borderColor: color,
                    borderWidth: this.options.line_width
                });
        }.bind(this));

        this.renderChildren();
    },

    on_action_chart_refresh: function(evt, id) {
        this.refresh();
    },

    on_action_show_table: function(evt, id) {
        this.showTable();
    },

    showTable: function() {
        let collection = new SWAM.Collection();
        let data = this.children.metrics_chart.options.data;
        let columns = [{label:"Label", field:"label"}];
        for (let i=0; i<data.labels.length-1; i++) {
            let obj = {id:i, label:data.labels[i]};
            for (let x = 0; x < data.datasets.length; x++) {
                if ((columns.length-2) < x) {
                    columns.push({
                        label:data.datasets[x].label,
                        field:data.datasets[x].label
                    });
                }
                obj[data.datasets[x].label] = data.datasets[x].data[i];
            }
            collection.add(obj);
        }
        let view = new SWAM.Views.Table({
            remote_sort: false,
            collection:collection,
            columns: columns
        });
        SWAM.Dialog.showView(view, {
            title:this.options.title, 
            scrollable: true,
            padded: true});
    },

    on_pre_render: function() {
        this.refreshDebounced();
    }

});