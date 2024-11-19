
PORTAL.Views.TaskTabs = SWAM.Views.Tabs.extend({
    on_init: function() {
        SWAM.Views.Tabs.prototype.on_init.call(this)
        this.addTab("Overview", "overview", new SWAM.View({template:"portal_ext.pages.admin.taskqueue.tasktabs.overview", model: this.options.model}));
        this.addTab("Data", "data", new SWAM.View({template:"portal_ext.pages.admin.taskqueue.tasktabs.data", model: this.options.model}));
        this.addTab("Logs", "logs", new SWAM.Views.Table({
            collection: new SWAM.Collection({url:"/api/taskqueue/task/log"}),
            remote_sort: false,
            add_classes: "swam-table-clickable",
            columns: [
                {label:"Datetime", field: "created|datetime"},
                {label: "Kind", field: "kind"},
                {label:"Text", field: "text"}
            ],
            pagination: true,
        }));

        this.setActiveTab("overview");
    },

    setModel: function(model) {
        // filter the collection models to pertain only to the views model id
        SWAM.Views.Tabs.prototype.setModel.call(this, model);
        this.options.model = model;
        this.getTab("logs").collection.params.task = this.options.model.get("id");
        this.getTab("logs").collection.fetch();
    }
});

PORTAL.Pages.TaskQueue = SWAM.Pages.TablePage.extend({
    template: "portal_ext.pages.admin.taskqueue",
    classes: "page-view page-padded has-topbar",
    defaults: {
        table_options: {
            add_classes: "swam-table-clickable small table-sm",
            batch_select: false,
            view_only: true // don't show edit for on click
        },
        item_url_param: "item",
        add_button: null,
        filter_bar: [
            {
                type: "group",
                classes: "justify-content-sm-end",
                columns: 12,
                fields: [
                    {
                        name: "search",
                        columns: 6,
                        columns_classes: "col-sm-12 col-md-5 col-lg-6",
                        form_wrap: "search",
                        placeholder: "search",
                        button: {
                            icon: "bi bi-search"
                        }
                    },
                    {
                        columns: 3,
                        columns_classes: "col-sm-3 col-md-3 col-lg-2",
                        type: "select",
                        name: "size",
                        options: [
                            5, 10, 20, 50, 100
                        ]
                    },
                    {
                        columns: 3,
                        columns_classes: "col-sm-auto",
                        type: "buttongroup",
                        buttons: [
                            {
                                classes: "btn btn-secondary",
                                icon: "bi bi-eyedropper",
                                action: "test_task"
                            },
                            {
                                classes: "btn btn-secondary",
                                icon: "bi bi-power",
                                action: "restart_task"
                            },
                            {
                                classes: "btn btn-secondary",
                                icon: "bi bi-arrow-repeat",
                                action: "reload_stats"
                            },
                            {
                                type: "dropdown",
                                icon: "bi bi-download",
                                items: [
                                    {
                                        icon: "bi bi-filetype-csv",
                                        label: "Download CSV",
                                        action: "download_csv"
                                    },
                                    {
                                        icon: "bi bi-filetype-json",
                                        label: "Download JSON",
                                        action: "download_json"
                                    },
                                ]
                            }

                        ]
                    },
                ]
            }
        ],
        filters: [
            {
                label: "Date Range",
                name: "created",
                type: "daterange",
                operator: "is"
            },
            {
                label: "State",
                type: "select",
                name: "state",
                operator: "is",
                options: [
                    {label:"Started/Schedule", value:"__in:0,1,2"},
                    {label:"Completed", value:"10"},
                    {label:"Failed", value:"-1"},
                    {label:"Canceled", value:"-2"},
                    {label:"Retry Later", value:"2"},
                    {label:"Started", value:"1"},
                    {label:"Scheduled", value:"0"}
                ]
            },
            {
                label: "Function",
                name: "fname",
                type: "text",
                operator: "is"
            },
            {
                label: "Model",
                name: "model",
                type: "text",
                operator: "is"
            },
            {
                label: "Channel",
                name: "channel",
                type: "text",
                operator: "is"
            },
        ],
        columns: [
           {label:"Id", field:"id"},
           {label:"State", field:"state_display"},
           {
                label:"Runtime", field:"current_runtime",
                classes: "d-none d-lg-table-cell",
           },
           {
                label:"Model", field:"model",
                classes: "d-none d-md-table-cell",
           },
           {label:"Function Name", field:"fname"},
           {
                label:"Channel", field:"channel",
                classes: "d-none d-lg-table-cell",
           },
           {label:"Created", field:"created|date"},
           {
                label:"Completed At", field:"completed_at|ago",
                classes: "d-none d-lg-table-cell",
           },
           {    
                label:"Reason", field:"reason",
                classes: "d-none d-lg-table-cell",
           }
        ],
        Collection: SWAM.Collections.Task,
        collection_params: {
            size: 10,
            sort: "-modified",
            state: "0"
        },
        group_filtering: false
    },

    on_init: function() {
        this.stats = [];
        this.dayLabels = [];
        this.daily_cmpltd = [];
        this.daily_fails = [];
        this.daily_lngst = [];
    
        this.on_init_bar();
        this.task_view = new PORTAL.Views.TaskTabs();
    },

    on_init_bar: function(){
        this.addChild("table_workers", new SWAM.Views.Table({
            collection: new SWAM.Collection({url:"/api/taskqueue/workers", params:{graph:"detailed"}}),
            remote_sort: false,
            add_classes: "swam-table-clickable",
            columns: [
                {label:"Host", sort_by: "hostname", template:"{{{model.hostname|tooltip(model.subscribed|list2str)}}}"},
                {label:"Up", field: "uptime|prettytimer"},
                {
                    label: "#", field: "workers",
                    classes: "d-none d-xl-table-cell",
                },
                {
                    label: "R", field: "running",
                    classes: "d-none d-xl-table-cell",
                },
                {
                    label:"P", field: "pending",
                    classes: "d-none d-xl-table-cell",
                },
                {
                    label:"S", field: "scheduled",
                    classes: "d-none d-xl-table-cell",
                }
            ],
            pagination: false,
        }));
        this.children.table_workers.on("item:clicked", this.on_worker_clicked, this);


        this.addChild("barchart_cmpltd",
            new PORTAL.Views.MetricsChart({
                title: "Task Metrics",
                slugs:["tq_task_completed", "tq_task_failed"],
                parse_slug: "_",
                colors:["rgba(150, 220, 150, 0.9)", "rgba(250, 50, 50, 0.9)"],
                chart_type: "bar",
                granularity: "hourly",
                chart_types: ["line", "bar"],
                line_width: 3,
                filters: true
            }));

        //this.collection = new SWAM.Collection({url:"/api/taskqueue/task"});
        SWAM.Pages.TablePage.prototype.on_init.call(this);
    },

    on_worker_clicked: function(item) {
        SWAM.Dialog.show({
            title: item.model.get("hostname"),
            json: item.model.attributes
        });
    },

    on_action_tq_chart: function() {
        let view = new PORTAL.Views.MetricsChart({
                title: "Tasks By Channel",
                category: "tq_chan_done",
                parse_slug: "_",
                chart_type: "bar",
                chart_types: ["line", "bar"],
                line_width: 3,
                filters: {
                    filters: [
                        {
                            type: "select",
                            name: "category",
                            size: "sm",
                            options: [{label:"Completed", value:"tq_chan_done"},{label:"Failed", value:"tq_chan_fail"}],
                            columns: 6,
                            columns_classes: "col-auto"
                        },
                    ]
                }
            });
        SWAM.Dialog.showView(view, {size:"xl"});
    },  

    on_action_refresh: function() {
        this.refresh();
    },

    refresh: function() {
        this.collection.fetch();
        this.getChild("table_workers").collection.fetch();
        SWAM.Rest.GET("/api/taskqueue/task/stats", null, function(resp, status) {
            if (resp.status) {
                this.stats = resp.data.stats;
                if (resp.data.status) {
                    this.$el.find("#tq_running_count").text(resp.data.status.running);
                    this.$el.find("#tq_backlog_count").text(resp.data.status.backlog);
                    this.$el.find("#tq_scheduled_count").text(resp.data.status.retry);
                    this.$el.find("#tq_failed_count").text(resp.data.status.failed);
                }
                this.on_stats();
            }
        }.bind(this));
    },

    on_stats: function(){
        this.dayLabels.length = 0;
        this.daily_cmpltd.length = 0;
        this.daily_fails.length = 0;
        this.daily_lngst.length = 0;
        this.stats.forEach(element => {
            console.log(element);
            this.dayLabels.push(SWAM.Localize.moment(element.day,"", null, "MM/DD"));
            this.daily_cmpltd.push(element.completed);
            this.daily_fails.push(element.failed);
        });
        this.renderChildren();
    },

    cancelTask: function(model) {
        app.showBusy();
    model.save({action:"cancel", reason:"canceled by user " + app.me.get("username")}, function(m, resp) {
            app.hideBusy();
            if (resp.status) {
                SWAM.toast(`Task #${model.id}`, "Task has been rescheduled!", "success");
            } else {
                SWAM.toast(`Task #${model.id} Error`, resp.error, "danger");
            }
        }.bind(this));
    },

    retryTask: function(model) {
        app.showBusy();
        model.save({action:"retry_now"}, function(m, resp) {
            app.hideBusy();
            if (resp.status) {
                SWAM.toast(`Task #${model.id}`, "Task has been rescheduled!", "success");
            } else {
                SWAM.toast(`Task #${model.id} Error`, resp.error, "danger");
            }
        }.bind(this));
    },

    on_item_clicked: function(item, evt) {
        this.task_view.setModel(item.model);
        var context_menu = [];
        if (item.model.canCancel()) {
            context_menu.push({
                    label: "Cancel Task",
                    icon: "x-octagon",
                    action: "cancel_task",
                    callback: function(dlg, menu) {
                        SWAM.Dialog.confirm({
                            title: `Cancel Task #${item.model.id}`,
                            message: "Are you sure you want to cancel this task?",
                            callback: function(dlg, choice) {
                                if (choice.lower() == "yes") {
                                    dlg.dismiss();
                                    this.cancelTask(item.model);
                                }
                            }.bind(this)
                        });
                    }.bind(this)
                });
        } else {
            context_menu.push({
                label: "Retry Task",
                icon: "recycle",
                action: "rerun_task",
                callback: function(dlg, menu) {
                    SWAM.Dialog.confirm({
                        title: `Retry Task #${item.model.id}`,
                        message: "Are you sure you want to reschedule this task?",
                        callback: function(dlg, choice) {
                            if (choice.lower() == "yes") {
                                dlg.dismiss();
                                this.retryTask(item.model);
                            }
                        }.bind(this)
                    });
                }.bind(this)
            });
        }

        context_menu.push({
                label: "Close",
                icon: "x-circle-fill",
                action: "close_item",
                callback: function(dlg, menu) {
                    dlg.dismiss();
                }
            });

        let mdlg = SWAM.Dialog.showView(this.task_view, {
            title: `Task #${item.model.id}`,
            kind: "primary",
            can_dismiss: true,
            padded: true,
            height: 'md',
            scrollable: true,
            "context_menu": context_menu
        });

        this.on_item_dlg(item, mdlg);
    },

    on_action_reload_stats: function() {
        this.refresh();
    },

    on_action_test_task: function() {
        if (!app.me.hasPerm(["manage_staff", "manager_users"])) return;

        SWAM.Dialog.yesno({
            title:"Run Test",
            message:"Are you sure you want to run a task test?", 
            lbl_yes:"Ok", lbl_no:"Cancel",
            callback: function(dlg, choice) {
                dlg.dismiss();
                SWAM.Rest.POST("/api/taskqueue/test", {"test_count":5, "sleep_time":20.0});
                SWAM.toast("Running Test", "running 5 tests");
            }
        });
    },

    on_action_restart_task: function() {
        if (!app.me.hasPerm(["manage_staff", "manager_users"])) return;

        SWAM.Dialog.yesno({
            title:"Restart Test Engine",
            message:"Are you sure you want to restart Task Engine?", 
            lbl_yes:"Ok", lbl_no:"Cancel",
            callback: function(dlg, choice) {
                dlg.dismiss();
                SWAM.Rest.POST("/api/taskqueue/restart", {key:"yesplease"});
                SWAM.toast("Running Test", "attempting to restart task engine");
            }
        });
    },

    on_pre_render: function() {
        if (this.isActivePage()) {
            this.refresh();
        }
    },

});