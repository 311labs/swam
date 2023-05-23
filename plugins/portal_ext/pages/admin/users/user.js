
PORTAL.Views.User = SWAM.View.extend(SWAM.Ext.BS).extend({
    template: "portal_ext.pages.admin.users.user",
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
                    field:"email|clipboard",
                    columns: 12
                },
                {
                    label:"Phone",
                    field:"phone|ifempty",
                    columns: 12
                },
                {
                    label:"ID",
                    field:"id",
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
                    label:"Last IP",
                    field:"metadata.last_ip",
                    columns: 12
                },
                {
                    label:"Last Location",
                    field:"metadata.location|location",
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
                {
                    label:"Auth Token",
                    field:"auth_token|ifempty|clipboard",
                    columns: 12
                },
            ]}));


        // if (app.options.user_permissions) {
        //     _.each(app.options.user_permissions, function(info){
        //         let view = new SWAM.Form.View({
        //             fields:info.fields
        //         });
        //         this.tabs.addTab(info.title, info.slugify(), view);
        //         view.on("input:change", this.on_perm_change, this);
        //     }.bind(this));
        // }

        this.tabs.addTab("Permissions", "permissions", new SWAM.Form.View({
            fields: SWAM.Models.User.PERMISSIONS_FORM,
        }));

        this.tabs.tab_views.permissions.on("input:change", this.on_perm_change, this);

        this.tabs.addTab("Groups", "groups", new PORTAL.Views.Memberships());

        this.tabs.addTab("Logs", "logs", new PORTAL.Views.Logs({
            component: "account.Member",
            param_field: null
        }));
        
        this.tabs.addTab("Acitivity", "activity", new PORTAL.Views.Logs());

        this.tabs.addTab("Devices", "devices", new PORTAL.Views.MemberDevices());

        this.tabs.setActiveTab("details");

        this.addChild("tabs", this.tabs);

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

    on_action_authtoken: function(evt) {
        if (this.model.get("auth_token")) {
            this.confirmNewToken();
        } else {
            this.generateAuthToken();
        }
    },

    generateAuthToken: function() {
        app.showBusy({icon:"key"});
        this.model.save({action:"auth_token"}, function(model, resp) {
            app.hideBusy();
            if (resp.status) {
                SWAM.toast("Auth Token", "Succesfully Generated");
            } else {
                SWAM.toast("Auth Token", resp.error, "danger");
            }
        }.bind(this));
    },

    confirmNewToken: function() {
        SWAM.Dialog.confirm({
            title: "Generate New Auth Token",
            message: "The current token will not longer be valid, are you sure?",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    this.generateAuthToken();
                }
            }.bind(this)
        });
    }
});