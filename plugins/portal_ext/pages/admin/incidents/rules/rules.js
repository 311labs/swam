
PORTAL.Pages.IncidentRules = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "incidents",
        icon: "exclamation-diamond-fill",
        title: "Rules",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"p", field:"priority"},
            {label:"when", field:"created|datetime"},
            {label:"name", field:"name"},
            {label:"category", field:"category"},
            {label:"action", field:"action"},
            {label:"bundle", field:"bundle|mintosecs|prettytimer"},
        ],
        Collection: SWAM.Collections.IncidentRule,
        collection_params: {
            sort: "priority",
            size: 10
        },
        filters: [
            {
                label: "category",
                name: "category",
                type: "select",
                editable: true,
                placeholder: "Select category",
                options: SWAM.Models.Incident.COMPONENTS
            }
        ],
        group_filtering: false,
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        this.view = new PORTAL.Views.Rule();
    },

    on_item_clicked: function(item) {
        let view = this.view;
        let model = item.model;
        view.setModel(model);
        let dlg = SWAM.Dialog.showView(view, {
            title: SWAM.renderString("Rule #{{model.id}} - {{model.name}}", {model:model}),
            size:"lg", vsize:"lg",
            can_dismiss:true,
            context_menu: [
                {
                    label: "Edit",
                    icon: "pencil",
                    callback: function(d, menu) {
                        SWAM.Dialog.editModel(model, {});
                    }
                },
                {
                    label: "Delete",
                    icon: "trash2",
                    callback: function(d, menu) {
                        d.options.view.on_action_remove();
                    }
                },
            ]
        });
    },

    on_model_added: function(model, resp) {
        this.collection.fetch();
        this.on_item_clicked({model:model});
    },

    on_model_saved: function(model, resp) {

    }

});

