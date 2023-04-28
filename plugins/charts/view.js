SWAM.Views.Chart = SWAM.View.extend({
    tagName: "canvas",

    on_init: function() {
        if (!this.id) this.id = SWAM.Views.Chart.GetNextID(); // charts require unique ids
        if (!this.options.data) this.options.data = {datasets:[]};
        this.options.labels = [];
    },

    setLabels: function(labels) {
        this.options.labels = labels;
    },

    addDataSet: function(label, data, opts) {
        this.options.data.datasets.push(_.extend({
            label: label,
            data: data
        }, opts));
    },

    pushData: function(label, data, opts) {
        // this pushes data to the end of each dataset
        this.options.labels.push(label);
        if (this.options.max_length && (this.options.labels.length > this.options.max_length)) {
            this.options.labels.shift();
        }

        if (["line", "bar"].has(this.options.type)) {
            for (var i = 0; i < this.options.data.datasets.length; i++) {
                var ds = this.options.data.datasets[i];
                ds.data.push(data[i]);
                if (this.options.max_length && (ds.data.length > this.options.max_length)) {
                    ds.data.shift();
                }
            }
        } else if (["pie", "doughnut"].has(this.options.type)) {
            if (this.options.data.datasets.length==0) {
                this.options.data.datasets.push({
                    label: "dataset 1",
                    data: [],
                    backgroundColor: []
                });
            }

            var ds = this.options.data.datasets[0];
            ds.data.push(data);
            var color;
            if (!opts || !opts.backgroundColor) {
                opts = {backgroundColor:window.randomColor()};
            }
            ds.backgroundColor.push(opts.backgroundColor);
        }

        if (this.chart) this.chart.update();
    },

    getLength: function() {
        return this.options.data.datasets[0].data.length;
    },

    clearData: function() {
        this.options.data = {datasets:[]};
    },

    on_init_bar: function(config) {
        config.data.labels = this.options.labels;
        config.options = _.extend({scales:{y:{beginAtZero: true}}}, config.options);
        if (this.options.yaxis_localize) {
            config.options = _.extend({scales:{y:{beginAtZero: true}}}, config.options);
            var ylocalizer = this.options.yaxis_localize;
            config.options.scales.y.ticks = {
                callback: function(value, index, ticks) {
                    return SWAM.Localize.localize(value, ylocalizer);
                }
            }
        }
        if (this.options.xaxis_localize) {
            if (!config.options.scales) {
                config.options = _.extend({scales:{x:{beginAtZero: true}}}, config.options);
            } else {
                config.options.scales.x = {beginAtZero: true};
            }
            
            var xlocalizer = this.options.xaxis_localize;
            var labels = this.options.labels;
            config.options.scales.x.ticks = {
                callback: function(value, index, ticks) {
                    // if (index == 0) return "";
                    return SWAM.Localize.localize(labels[index], xlocalizer);
                }
            }
        }
    },

    on_init_line: function(config) {
        config.data.labels = this.options.labels;
        _.each(config.data.datasets, function(ds){
            if (ds.fill == undefined) ds.fill = false;
            if (ds.tension == undefined) ds.tension = 0.1;
        });
        if (this.options.yaxis_localize) {
            config.options = _.extend({scales:{y:{beginAtZero: true}}}, config.options);
            var ylocalizer = this.options.yaxis_localize;
            config.options.scales.y.ticks = {
                callback: function(value, index, ticks) {
                    return SWAM.Localize.localize(value, ylocalizer);
                }
            }

            if (!config.options.plugins) config.options.plugins = {};
            if (!config.options.plugins.tooltip) config.options.plugins.tooltip = {};
            config.options.plugins.tooltip.callbacks = {
                label: function(context) {
                    return SWAM.Localize.localize(context.parsed.y, ylocalizer);
                }
            };
        }
        if (this.options.xaxis_localize) {
            if (!config.options.scales) {
                config.options = _.extend({scales:{x:{beginAtZero: true}}}, config.options);
            } else {
                config.options.scales.x = {beginAtZero: true};
            }
            
            var self = this;
            config.options.scales.x.ticks = {
                callback: function(value, index, ticks) {
                    // if (index == 0) return "";
                    return SWAM.Localize.localize(self.options.labels[index], self.options.xaxis_localize);
                }
            }
        }
    },

    updateConfig: function() {
        this.chart.update();
    },

    on_init_pie: function(config) {
        config.data.labels = this.options.labels;
    },

    on_init_doughnut: function(config) {
        config.data.labels = this.options.labels;
        this.chart_config.plugins = [Chart.plugins.centerText];

        if (this.options.centerText) {
            this.chart_config.options.plugins = this.chart_config.options.plugins || {};
            this.chart_config.options.plugins.centerText = this.options.centerText;
        }
    },

    on_post_render: function() {
        this.$el.attr("id", this.id);
        this.chart_config = {data:this.options.data, options: this.options.options || {}};
        var fname = "on_init_" + this.options.type;
        if (_.isFunction(this[fname])) this[fname](this.chart_config);

        this.chart_config.options.plugins = this.chart_config.options.plugins || {};
        if (this.options.hide_legend) {
            this.chart_config.options.plugins.legend = {display:false};
        }
        if (this.options.hide_tooltips) {
            this.chart_config.options.plugins.tooltips = {enabled:false};
        }

        if (this.chart) this.chart.destroy();
        this.chart = new Chart(this.el, {
            type: this.options.type,
            data: this.chart_config.data,
            options: this.chart_config.options,
            plugins: this.chart_config.plugins
        });
    },

    on_dom_removed: function() {
        this.chart.destroy();
        this.chart = null;
        this.$el.empty();
    },

    update: function() {
        this.on_dom_removed();
        this.on_post_render();
    }
}, {
    LAST_ID: 0,
    GetNextID: function() {
        this.LAST_ID += 1;
        return "chart_" + this.LAST_ID;
    },

    GenerateColors: function(start, end, n) {
        //Distance between each color
        var steps = [
          (end[0] - start[0]) / n,  
          (end[1] - start[1]) / n,  
          (end[2] - start[2]) / n  
        ];
        
        //Build array of colors
        var colors = [start];
        for(var ii = 0; ii < n - 1; ++ii) {
          colors.push([
            Math.floor(colors[ii][0] + steps[0]),
            Math.floor(colors[ii][1] + steps[1]),
            Math.floor(colors[ii][2] + steps[2])
          ]);
        }
        colors.push(end); 
        return colors;
    }
});