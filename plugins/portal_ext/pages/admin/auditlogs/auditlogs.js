
PORTAL.Pages.AuditLogs = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "journal-text",
        title: "Audit Logs",
        list_options: {
            add_classes: "swam-table-clickable small table-sm",
        },
        add_button: null, 
        columns: [
            {label:"Created", field:"when|datetime"},
            {label:"Method", field:"request_method"},
            {label:"Path", field:"request_path"},
            {label:"IP", field:"session.ip", classes:"d-none d-lg-table-cell"},
            {label:"Action", field:"action", classes:"d-none d-xl-table-cell"},
            {label:"Component", field:"component", classes:"d-none d-lg-table-cell"},
            {label:"User", field:"user.username", classes:"d-none d-xl-table-cell"},
        ],
        Collection: SWAM.Collections.AuditLog,
        collection_params: {
            size: 10,
            level: "__gt:5"
        },
        default_dr_range: 3,
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
                name: "user__username",
                type: "text"
            },
            {
                label: "Path",
                name: "request_path",
                type: "text"
            },
            {
                label: "Component",
                name: "component",
                type: "text"
            },
            {
                label: "Component PK",
                name: "pkey",
                type: "text"
            },
            {
                label: "IP",
                name: "session__ip",
                type: "text"
            },
            {
                label: "Action",
                name: "action",
                type: "select",
                editable: true,
                options: [
                    "request", "response", "error", "removed_perm", "remove_perm", "add_perm",
                    "added_perm", "password_changed", "password_error",
                    "jwt_login", "basic_login", "login_failed", "login_blocked",
                    "code_login", "group_edit"]
            },
        ]
    },

    on_item_clicked: function(item) {
        var opts = {
            title: SWAM.renderString("Audit Log - {{when|datetime_tz}} - {{request_path}}", item.model),
            size: "xl"
        }
        var view = new PORTAL.Views.AuditLog();
        view.setModel(item.model);
        SWAM.Dialog.showView(view, opts);
    },

    on_group_change: function() {
        if (this.options.component) {
            if (app.group) this.collection.params.pkey = app.group.id;
        } else {
            if (app.group && this.options.group_filtering) {
                this.collection.params.group = app.group.id;
            } else if (this.collection.params.group) {
                delete this.collection.params.group;
            }
        }

        this.collection.params.start = 0; // reset the page to 0
        if (this.isActivePage()) {
            this.reload();
        }
    },

    on_page_pre_enter: function() {
        if (this.options.default_dr_range) {
            if (!this.params.url_params || !this.params.url_params.dr_start) {
                this.collection.params.dr_end = moment().add(4, "days").format('YYYY-MM-DD');
                this.collection.params.dr_start = moment().subtract(this.options.default_dr_range, 'days').format('YYYY-MM-DD');
                this.collection.params.dr_field = "when";
                
            }
        }
        if (this.options.component) {
            this.collection.params.component = this.options.component;
            if (app.group) this.collection.params.pkey = app.group.id;
        }
    }


});

PORTAL.Views.AuditLog = SWAM.View.extend({
    template: "<h4>raw log <button type='button' class='btn btn-link text-info' data-action='info'>{{{ICON('info-square-fill')}}}</button></h4><pre>{{{model.message|prettyjson}}}</pre>",
    classes: "auditlog m-3",
    on_action_info: function(evt) {
       var header = SWAM.Views.ModelView.build(this.model,
           [
               {label:"Level", field:"level", columns: 6},
               {label:"Created", field:"when|datetime", columns: 6},
               {label:"Method", field:"request_method", columns: 6},
               {label:"Path", field:"request_path", columns: 6},
               {label:"IP", field:"session.ip", columns: 6},
               {label:"Action", field:"action", columns: 6},
               {label:"Component", field:"component", columns: 6},
               {label:"PK", field:"pkey", columns: 6},
               {label:"User", field:"user.username", columns: 6},
               {label:"Group", field:"group.name", columns: 6},
               {label:"UserAgent", field:"session.user_agent", columns: 12},
           ], {inline:false});

       SWAM.Dialog.show({title:"Audit Log Details", message:header}); 
    }
});

