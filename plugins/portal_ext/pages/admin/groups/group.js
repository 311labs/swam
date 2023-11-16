
PORTAL.Views.AdminGroup = SWAM.View.extend(SWAM.Ext.BS).extend({
    // template: "<div id='tabs'></div>",
    classes: "swam-group py-1 px-4",

    defaults: {
        title: ""
    },

    on_init: function() {
        let tabs = new SWAM.Views.Tabs({
            tabs_classes: "my-3 pt-1"
        });

        this.appendChild("tabs", tabs);
        tabs.addTab("Details", "details", new SWAM.Views.ModelView({inline:false, fields:[
                {
                    label:"Name",
                    field:"name",
                    columns: 6
                },
                {
                    label:"Kind",
                    field:"kind",
                    columns: 6
                },
                {
                    label:"Short Name",
                    field:"short_name",
                    columns: 6
                },
                {
                    label:"ID",
                    field:"id",
                    columns: 6
                },
                {
                    label:"UUID",
                    field:"uuid",
                    columns: 6
                },
                {
                    label:"Parent",
                    field:"parent.name",
                    columns: 6
                },
                {
                    label:"Timezone",
                    field:"timezone",
                    columns: 6
                },
                {
                    label:"End of Day",
                    field:"metadata.eod",
                    columns: 6
                }
            ]}));

        tabs.addTab("Members", "members", new PORTAL.Views.Memberships({
            group_members:true}));

        tabs.addTab("Logs", "logs", new PORTAL.Views.Logs({
            component: "account.Group",
            param_field: null
        }));
        
        tabs.addTab("Activity", "activity", new PORTAL.Views.Logs({
            param_field: "group"
        }));
        
        tabs.setActiveTab("details");
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