

PORTAL.Views.Rule = SWAM.View.extend({
    template: "portal_ext.pages.admin.incidents.rules.rule",
    classes: "momo-rule",
    tagName: "div",

    on_init: function() {

        this.addChild("details", new SWAM.Views.ModelView({inline:false, fields:[
            {
                label:"Match",
                field:"match_by_display",
                columns: 2
            },
            {
                label:"Priority",
                field:"priority",
                columns: 2
            },
            {
                label:"Category",
                field:"category",
                columns: 8
            },
            {
                label:"Bundle Time",
                field:"bundle_time_display",
                columns: 4
            },
            {
                label:"Bundle By",
                field:"bundle_by_display",
                columns: 8
            },
            {
                label:"Action After",
                field:"action_after",
                columns: 4
            },
            {
                label:"Action",
                field:"action",
                columns: 8
            },
            {
                label:"Title Template",
                field:"title_template",
                help: "Customize the incident title by event metadata. example {event.metadata.geoip.country}",
                columns: 12
            },
        ]}));

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
        SWAM.View.prototype.setModel.call(this, model);
        this.checks.params.parent = model.id;
        this.checks.fetch();
    },

    on_action_edit_rule: function(evt, id) {
        SWAM.Dialog.editModel(this.model, {
            callback: function(model, resp, dlg) {
                // nothing to do?
            },
            stack: true,
            title: "Edit Rule",
            context_menu: [
                {
                    label: "Edit Rule",
                    icon: "pencil"
                }
            ]
        });
    },

    on_action_remove: function(evt) {
        SWAM.Dialog.confirm({
            title: "Remove Rule",
            message: "Are you sure you want to remove this rule?",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    dlg.dismiss();
                    app.showBusy({icon:"trash"});
                    this.model.destroy(function(model, resp) {
                        app.hideBusy();
                        if (resp.status) {
                            SWAM.toast("Rule delete", "Succesfully removed rule", "success", 4000);
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

