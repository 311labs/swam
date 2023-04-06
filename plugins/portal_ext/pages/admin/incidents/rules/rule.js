

PORTAL.Views.Rule = SWAM.View.extend({
    template: "portal_ext.pages.admin.incidents.rules.rule",
    classes: "momo-rule",
    tagName: "div",

    on_init: function() {
        this.checks = new SWAM.Collections.IncidentRuleCheck({params:{size:100, sort:"index"}});
        this.addChild("list", new SWAM.Views.Table({
            remote_sort: false,
            add_classes: "swam-table-clickable",
            columns: [
                {label:"order", field: "index"},
                {label:"name", field: "name"},
                {label:"field", field: "field_name"},
                {label:"op", field: "comparator"},
                {label:"value", field: "value"},
                {context_menu:[
                    {
                        label: "Edit",
                        icon: "pencil",
                        action: "edit_item"
                    },
                    {
                        label: "Delete",
                        icon: "trash",
                        action: "delete_item"
                    }

                ]}
            ],
            collection: this.checks
        }));

    },

    setModel: function(model) {
        this.model = model;
        this.checks.params.parent = model.id;
        this.checks.fetch();
    },

    on_action_edit: function(evt) {
        SWAM.Dialog.editModel(this.model, {
            callback: function(model, resp, dlg) {
                // nothing to do?
            },
            stack: true,
        });
    },

    on_action_remove: function(evt) {
        SWAM.Dialog.confirm({
            title: "Remove Rule",
            message: "Are you sure you want to remove this rule from the current group?",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    dlg.dismiss();
                    app.showBusy({icon:"trash"});
                    this.model.destroy(function(model, resp) {
                        app.hideBusy();
                        if (resp.status) {
                            SWAM.toast("Rule delete", "Succesfully removed reule from group", "success", 4000);
                            SWAM.Dialog.dismissAll();
                            app.active_page.reload();
                        } else {
                            SWAM.Dialog.warning("Request Failed", resp.error);
                        }
                    });
                }
            }.bind(this)
        });
    },

    on_action_add: function(evt) {
        var check_model = new SWAM.Models.IncidentRuleCheck();
        SWAM.Dialog.editModel(check_model, {
            callback: function(model, resp, dlg) {
                // nothing to do?
                this.checks.fetch();
            }.bind(this),
            use_app_group: false,
            stack: true,
            defaults: {
                parent: this.model.id
            }
        });
    },

    on_action_edit_item: function(evt) {
        var check_model = this.checks.get($(evt.currentTarget).data("id"));
        SWAM.Dialog.editModel(check_model, {
            use_app_group: false,
            callback: function(model, resp, dlg) {
                // nothing to do?
                this.checks.fetch();
            }.bind(this),
            stack: true,
        });
    },

    on_action_delete_item: function(evt) {
        var check_model = this.checks.get($(evt.currentTarget).data("id"));
        SWAM.Dialog.confirm({
            title: "Remove Check",
            message: "Are you sure you want to remove this check from the current rule?",
            stack: true,
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    dlg.dismiss();
                    app.showBusy({icon:"trash"});
                    check_model.destroy(function(model, resp) {
                        app.hideBusy();
                        if (resp.status) {
                            SWAM.toast("Rule delete", "Succesfully removed check from rule", "success", 4000);
                            this.checks.fetch();
                        } else {
                            SWAM.Dialog.warning("Request Failed", resp.error);
                        }
                    }.bind(this));
                }
            }.bind(this)
        });
    },
});

