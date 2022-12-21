

PORTAL.Views.Logs = SWAM.Views.AdvancedTable.extend({
    classes: "swam-paginated-table swam-table-clickable swam-table-tiny",
    defaults: {
        columns: [
            {label:"Created", field:"when|datetime"},
            {label:"Path", template:"<div>{{model.request_path}}</div>{{model.action}}", sort_field:"request_path"},
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
        var opts = {
            title: SWAM.renderString("Audit Log - {{when|datetime_tz}} - {{request_path}}", item.model),
            size: "xl"
        }
        var header = SWAM.Views.ModelView.build(item.model,
            [
                {label:"Created", field:"when|datetime", columns: 3},
                {label:"Method", field:"request_method", columns: 3},
                {label:"Level", field:"level", columns: 3},
                {label:"Path", field:"request_path", columns: 3},
                {label:"IP", field:"session.ip", columns: 3},
                {label:"Action", field:"action", columns: 3},
                {label:"Component", field:"component", columns: 3},
                {label:"User", field:"user.username", columns: 3},
                {label:"UserAgent", field:"session.user_agent", columns: 12},
            ]);
        if (item.model.get("action") == "error") {
            opts.message = header + item.model.get("message", "", "prettystacktrace|wrap('pre')");
        } else {
            opts.message = header;
            opts.json = item.model.get("message");
        }

        SWAM.Dialog.show(opts);
    },

    setModel: function(model) {
        this.model = model;
        if (model.get("member")) {
            this.collection.params.user = model.get("member.id");
        } else {
            this.collection.params.user = model.id;
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
