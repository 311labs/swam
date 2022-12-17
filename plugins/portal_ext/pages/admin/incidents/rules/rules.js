
PORTAL.Pages.IncidentRules = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "incidents",
        icon: "exclamation-diamond-fill",
        title: "Rules",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"when", field:"created|datetime"},
            {label:"name", field:"name"},
            {label:"priority", field:"priority"},
            {label:"bundle", field:"bundle|mintosecs|prettytimer"},
        ],
        Collection: SWAM.Collections.IncidentRule,
        collection_params: {
            size: 10
        },
        group_filtering: true,
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        this.view = new PORTAL.Views.Rule();
    },

    on_item_clicked: function(item) {
        this.view.setModel(item.model);
        SWAM.Dialog.showView(this.view, {size:"md", vsize:"lg", can_dismiss:true});
    },

});

