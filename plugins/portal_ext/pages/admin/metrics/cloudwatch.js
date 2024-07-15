
PORTAL.Pages.CloudWatch = SWAM.Page.extend({
    template: "portal_ext.pages.admin.metrics.cloudwatch",
    classes: "page-view page-padded has-topbar",

    defaults: {
        auto_refresh_time: 150000
    },

    on_init: function() {
        this.addChild("filter_bar", new SWAM.Form.View({
            fields: [
                {
                    type: "select",
                    name: "duration",
                    default: 3600,
                    size: "sm",
                    options: [
                        {label: "30m", value: 1800},
                        {label: "1h", value: 3600},
                        {label: "3h", value: 10800},
                        {label: "12h", value: 43200},
                        {label: "1d", value: 86400},
                        {label: "3d", value: 259200},
                        {label: "1w", value: 604800},
                    ]
                }
            ]
        }));
        this.getChild("filter_bar").on("input:change", this.on_input_change, this);

        this.addChild("ec2_cpu",
            new PORTAL.Views.MetricsChart({
                url: "/api/metrics/aws/ec2/cpu",
                title: "EC2 CPU",
                source: "aws",
                xaxis_localize: "simple_time",
                show_refresh: true,
                granularity: null,
                live_data: true,
                ids:["all"],
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                    "rgba(220, 150, 150, 0.9)",
                    "rgba(150, 20, 155, 0.9)",
                    "rgba(100, 180, 200, 0.9)",
                    "rgba(25, 225, 225, 0.9)",
                    "rgba(150, 155, 0, 0.9)"
                ]
            }));

        this.addChild("ec2_network",
            new PORTAL.Views.MetricsChart({
                url: "/api/metrics/aws/ec2/network/out",
                title: "EC2 Network Out",
                source: "aws",
                yaxis_localize: "bytes",
                xaxis_localize: "simple_time",
                show_refresh: true,
                granularity: null,
                live_data: true,
                ids:["all"],
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                    "rgba(220, 150, 150, 0.9)",
                    "rgba(150, 20, 155, 0.9)",
                    "rgba(100, 180, 200, 0.9)",
                    "rgba(25, 225, 225, 0.9)",
                    "rgba(150, 155, 0, 0.9)"
                ]
            }));

        this.addChild("ec2_cons",
            new PORTAL.Views.MetricsChart({
                url: "/api/metrics/aws/ec2/network/established",
                title: "EC2 Connections",
                source: "aws",
                xaxis_localize: "simple_time",
                show_refresh: true,
                granularity: null,
                live_data: true,
                ids:["all"],
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                    "rgba(220, 150, 150, 0.9)",
                    "rgba(150, 20, 155, 0.9)",
                    "rgba(100, 180, 200, 0.9)",
                    "rgba(25, 225, 225, 0.9)",
                    "rgba(150, 155, 0, 0.9)"
                ]
            }));

        this.addChild("rds_cpu",
            new PORTAL.Views.MetricsChart({
                url: "/api/metrics/aws/rds/cpu",
                title: "RDS CPU",
                source: "aws",
                xaxis_localize: "simple_time",
                show_refresh: true,
                granularity: null,
                live_data: true,
                ids:["all"],
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                    "rgba(220, 150, 150, 0.9)",
                    "rgba(150, 20, 155, 0.9)",
                    "rgba(100, 180, 200, 0.9)",
                    "rgba(25, 225, 225, 0.9)",
                    "rgba(150, 155, 0, 0.9)"
                ]
            }));

        this.addChild("rds_memory",
            new PORTAL.Views.MetricsChart({
                url: "/api/metrics/aws/rds/memory",
                title: "RDS Memory",
                source: "aws",
                yaxis_localize: "bytes",
                xaxis_localize: "simple_time",
                show_refresh: true,
                granularity: null,
                live_data: true,
                ids:["all"],
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                    "rgba(220, 150, 150, 0.9)",
                    "rgba(150, 20, 155, 0.9)",
                    "rgba(100, 180, 200, 0.9)",
                    "rgba(25, 225, 225, 0.9)",
                    "rgba(150, 155, 0, 0.9)"
                ]
            }));

        this.addChild("rds_cons",
            new PORTAL.Views.MetricsChart({
                url: "/api/metrics/aws/rds/cons",
                title: "RDS Connections",
                source: "aws",
                xaxis_localize: "simple_time",
                show_refresh: true,
                granularity: null,
                live_data: true,
                ids:["all"],
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                    "rgba(220, 150, 150, 0.9)",
                    "rgba(150, 20, 155, 0.9)",
                    "rgba(100, 180, 200, 0.9)",
                    "rgba(25, 225, 225, 0.9)",
                    "rgba(150, 155, 0, 0.9)"
                ]
            }));

        this.addChild("redis_cpu",
            new PORTAL.Views.MetricsChart({
                url: "/api/metrics/aws/redis/cpu",
                title: "Redis CPU",
                source: "aws",
                xaxis_localize: "simple_time",
                show_refresh: true,
                granularity: null,
                live_data: true,
                ids:["all"],
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                    "rgba(220, 150, 150, 0.9)",
                    "rgba(150, 20, 155, 0.9)",
                    "rgba(100, 180, 200, 0.9)",
                    "rgba(25, 225, 225, 0.9)",
                    "rgba(150, 155, 0, 0.9)"
                ]
            }));

        this.addChild("redis_mem",
            new PORTAL.Views.MetricsChart({
                url: "/api/metrics/aws/redis/memory",
                title: "Redis Memory",
                source: "aws",
                xaxis_localize: "simple_time",
                show_refresh: true,
                granularity: null,
                live_data: true,
                ids:["all"],
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                    "rgba(220, 150, 150, 0.9)",
                    "rgba(150, 20, 155, 0.9)",
                    "rgba(100, 180, 200, 0.9)",
                    "rgba(25, 225, 225, 0.9)",
                    "rgba(150, 155, 0, 0.9)"
                ]
            }));
        this.addChild("redis_cons",
            new PORTAL.Views.MetricsChart({
                url: "/api/metrics/aws/redis/cons",
                title: "Redis Connections",
                source: "aws",
                xaxis_localize: "simple_time",
                show_refresh: true,
                granularity: null,
                live_data: true,
                ids:["all"],
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                    "rgba(220, 150, 150, 0.9)",
                    "rgba(150, 20, 155, 0.9)",
                    "rgba(100, 180, 200, 0.9)",
                    "rgba(25, 225, 225, 0.9)",
                    "rgba(150, 155, 0, 0.9)"
                ]
            }));
    },

    on_input_change: function(evt) {
        let duration = this.getChild("filter_bar").getData().duration;
        _.each(this.children, function(view){
            if (_.isFunction(view.refresh)) {
                view.options.duration = duration;
                view.options.xaxis_localize = "simple_time";
                view.options.size = 7;
                if (duration > 86400) {
                    view.options.xaxis_localize = "date";
                    view.options.size = 24;
                } else if (duration >= 43200) {
                    view.options.size = 12;
                    view.options.xaxis_localize = "simple_time";
                } else if (duration >= 10800) {
                    view.options.size = 12;
                } else if (duration >= 3600) {
                    view.options.size = 12;
                }
                view.update();
                view.refresh();
            }
        });
    },

    on_action_refresh: function() {
        this.refresh();
    },

    refresh: function() {
        _.each(this.children, function(view){
            if (_.isFunction(view.refresh)) view.refresh();
        });
    },

    on_page_pre_enter: function() {
        this.refresh();
    },

    startAutoRefresh: function() {
        if (this._ar_timer || !this.options.auto_refresh_time) return;
        this._ar_timer = setTimeout(function(){
            this.refresh();
            this._ar_timer = null;
            this.startAutoRefresh();
        }.bind(this), this.options.auto_refresh_time);
    },

    stopAutoRefresh: function() {
        if (this._ar_timer) {
            clearTimeout(this._ar_timer);
            this._ar_timer = null;
        }
    },

    on_action_auto_refresh: function(evt, id) {
        if (evt.target.checked) {
            SWAM.toast("Auto Refresh", "ENABLED", "success", 1000);
            this.startAutoRefresh();
        } else {
            SWAM.toast("Auto Refresh", "DISABLED", "danger", 1000);
            this.stopAutoRefresh();
        }
    }

});
