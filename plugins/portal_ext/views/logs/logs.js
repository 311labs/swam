
PORTAL.Views.Logs = SWAM.Views.AdvancedTable.extend({
    classes: "swam-paginated-table swam-table-clickable swam-table-tiny",
    defaults: {
        param_field: "user",
        model_field: "id",
        columns: [
            {label:"Created", field:"when|datetime"},
            {label:"Who", field:"who", classes:"d-none d-xl-table-cell"},
            {label:"Action", field:"action", classes:"d-none d-xl-table-cell"},
            {label:"Path", template:"<div>{{model.request_method}}:{{model.request_path}}</div>"},
            {label:"Component", field:"component", classes:"d-none d-lg-table-cell"},
         ],
        Collection: SWAM.Collections.AuditLog,
        collection_params: {
            size: 15
        },
        filter_bar: [
            {
                type: "group",
                classes: "justify-content-sm-end",
                columns: 9,
                fields: [
                    {
                        columns: 3,
                        columns_classes: "col-sm-auto",
                        type: "buttongroup",
                        buttons: [
                            {
                                classes: "btn btn-secondary",
                                icon: "bi bi-arrow-repeat",
                                action: "reload"
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
                name: "when",
                type: "daterange"
            },
            {
                label: "Level",
                name: "level",
                type: "select",
                options: [
                    {
                        label: "All Levels",
                        value: ""
                    },
                    {
                        label: "Info",
                        value: "__gt:30"
                    },
                    {
                        label: "Warning",
                        value: "__gt:20"
                    },
                    {
                        label: "Critical",
                        value: "__gt:5"
                    },
                ]
            },
            {
                label: "Username",
                name: "user.username",
                type: "text"
            },
            {
                label: "Path",
                name: "path",
                type: "text"
            },
            {
                label: "Component",
                name: "component",
                type: "text"
            },
            {
                label: "IP",
                name: "ip",
                type: "text"
            },
            {
                label: "Action",
                name: "action",
                type: "select",
                editable: true,
                options: ["request", "response", "error"]
            },
        ]
    },

    on_item_clicked: function(item) {
        // var opts = {
        //     title: SWAM.renderString("Audit Log - {{when|datetime_tz}} - {{request_path}}", item.model),
        //     size: "xl"
        // }
        // var header = SWAM.Views.ModelView.build(item.model,
        //     [
        //         {label:"Created", field:"when|datetime", columns: 3},
        //         {label:"Method", field:"request_method", columns: 3},
        //         {label:"Level", field:"level", columns: 3},
        //         {label:"Path", field:"request_path", columns: 3},
        //         {label:"IP", field:"session.ip", columns: 3},
        //         {label:"Action", field:"action", columns: 3},
        //         {label:"Component", field:"component", columns: 3},
        //         {label:"User", field:"user.username", columns: 3},
        //         {label:"UserAgent", field:"session.user_agent", columns: 12},
        //     ]);
        // if (item.model.get("action") == "error") {
        //     opts.message = header + item.model.get("message", "", "prettystacktrace|wrap('pre')");
        // } else {
        //     opts.message = header;
        //     opts.json = item.model.get("message");
        // }

        // SWAM.Dialog.show(opts);

        var opts = {
            title: SWAM.renderString("Audit Log - {{when|datetime_tz}} - {{request_path}}", item.model),
            size: "xl"
        }
        var view = new PORTAL.Views.AuditLog();
        view.setModel(item.model);
        SWAM.Dialog.showView(view, opts);
    },

    setModel: function(model) {
        this.model = model;
        if (this.options.model_field && this.options.param_field) {
            this.collection.params[this.options.param_field] = model.get(this.options.model_field);
        } else if (this.options.param_field == "user") {
            if (model.get("member")) {
                this.collection.params.user = model.get("member.id");
            } else {
                this.collection.params.user = model.id;
            }
        } else if (this.options.param_field == "terminal") {
            this.collection.params.tid = model.get("tid");
        } else if (this.options.param_field) {
            this.collection.params[this.options.param_field] = model.id;
        }

        if (this.options.component) {
            this.collection.params.component = this.options.component;
            if (this.options.component_field) {
                this.collection.params.pkey = model.get(this.options.model_field);
            } else {
                this.collection.params.pkey = model.id;
            }
            
        }

        if (this.options.date_range && this.options.date_range.dr_start_field) {
            this.collection.params.dr_start = model.get(this.options.date_range.dr_start_field || "created");
            this.collection.params.dr_end = model.get(this.options.date_range.dr_end || "modified");
            if (this.options.date_range.padding) {
                this.collection.params.dr_start -= this.options.date_range.padding;
                this.collection.params.dr_end += this.options.date_range.padding;
            }
        }

        if (app.group) {
            this.collection.params.group = app.group.id;
        } else if (this.collection.params.group) {
            delete this.collection.params.group;
        }
        if (this.isInViewport()) {
            this.collection.fetch();
        } else {
            this.collection.reset();
        }
        
    },

    on_tab_focus: function() {
        this.collection.fetchIfStale();
    }


});

