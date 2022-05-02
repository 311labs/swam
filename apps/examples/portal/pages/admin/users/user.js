
PORTAL.Views.User = SWAM.View.extend({
    template: ".pages.admin.users.user",
    classes: "acs-member",
    tagName: "div",

    defaults: {
        title: ""
    },

    on_init: function() {
        this.tabs = new SWAM.Views.Tabs();
        this.tabs.addTab("Details", "details", new SWAM.Views.ModelView({inline:true, fields:[
                {
                    label:"Display Name",
                    field:"display_name",
                    columns: 12
                },
                {
                    label:"User Name",
                    field:"username",
                    columns: 12
                },
                {
                    label:"Email",
                    field:"email",
                    columns: 12
                },
                {
                    label:"Phone",
                    field:"phone|ifempty",
                    columns: 12
                },
                {
                    label:"Last Login",
                    field:"last_login|ago|ifempty('never')",
                    columns: 12
                },
                {
                    label:"Last Activity",
                    field:"last_activity|ago|ifempty('never')",
                    columns: 12
                },
                {
                    label:"Super User",
                    field:"is_superuser|yesno_icon",
                    columns: 12
                },
                {
                    label:"Two Factor Auth",
                    field:"has_topt|yesno_icon",
                    columns: 12
                },
            ]}));

        this.tabs.addTab("Permissions", "permissions", new SWAM.Form.View({
            fields: [
                {
                    label:"System Permissions",
                    type:"label",
                    columns: 12
                },
                {
                    name:"metadata.permissions.manage_users",
                    label:"Manage Users",
                    help: "Allow this user to manage other system users",
                    type:"toggle",
                    columns: 12
                },
                {
                    name:"metadata.permissions.view_all_groups",
                    label:"View Groups",
                    help: "Allow this user to view all groups",
                    type:"toggle",
                    columns: 12
                },
                {
                    name:"metadata.permissions.view_logs",
                    label:"View Logs",
                    help: "Allow this user to view all system logs",
                    type:"toggle",
                    columns: 12
                },
                {
                    label:"ACS Permissions",
                    type:"label",
                    columns: 12
                },
                {
                    name:"metadata.permissions.provision_locks",
                    label:"Provision ACS Locks",
                    help: "Allow this user provision/flash locks.",
                    type:"toggle",
                    columns: 12
                },
                {
                    name:"metadata.permissions.manage_lock_access",
                    label:"Manage Lock Access",
                    help: "Allow this user manage who has access to locks.",
                    type:"toggle",
                    columns: 12
                },
                {
                    name:"metadata.permissions.view_lock_access",
                    label:"View Lock Access",
                    help: "Allow this user to view who has access to locks.",
                    type:"toggle",
                    columns: 12
                },
            ],
        }));

        this.tabs.tab_views.permissions.on("input:change", this.on_perm_change, this);

        this.tabs.addTab("Logs", "logs", new PORTAL.Views.Logs());

        this.tabs.setActiveTab("details");

        this.addChild("example_tabs", this.tabs);

    },

    on_perm_change: function(ievt) {
        var data = {};
        data[ievt.name] = ievt.value;
        this.model.save(data);
    },

    on_action_edit: function(evt) {
        SWAM.Dialog.editModel(this.model, {
            callback: function(model, resp, dlg) {
                // nothing to do?
            },
            stack: true,
        })
    },

    on_action_enable: function(evt) {
        app.showBusy({icon:"shield-slash"});
        this.model.save({action:"enable"}, function(model, resp) {
            app.hideBusy();
            if (resp.status) {
                SWAM.toast("Account Enabled", "Succesfully enabled account");
            } else {
                SWAM.toast("Account Enable Failed", resp.error, "danger");
            }
        }.bind(this));
    },

    on_action_disable: function(evt) {
        app.showBusy({icon:"shield-slash"});
        this.model.save({action:"disable"}, function(model, resp) {
            app.hideBusy();
            if (resp.status) {
                SWAM.toast("Account Disabled", "Succesfully disabled account");
            } else {
                SWAM.toast("Account Disable Failed", resp.error, "danger");
            }
        }.bind(this));
    },

    on_action_unblock: function(evt) {
        app.showBusy({icon:"key"});
        this.model.save({action:"unblock"}, function(model, resp) {
            app.hideBusy();
            if (resp.status) {
                SWAM.toast("Account Unlocked", "Succesfully unlocked account");
            } else {
                SWAM.toast("Account Unlock Failed", resp.error, "danger");
            }
        }.bind(this));
    },
});