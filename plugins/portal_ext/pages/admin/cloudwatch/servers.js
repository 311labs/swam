
PORTAL.Pages.ServerInfo = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "servers",
        icon: "exclamation-diamond-fill",
        title: "Servers",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"Hostname", field:"hostname"},
            {label:"Project", field:"project"},
            {label:"RestIt", field:"restit"},
            {label:"Django", field:"django"},
            {label:"Python", field:"python"}
        ],
        Collection: SWAM.Collections.ServerInfo,
        add_button: false,
        group_filtering: false,
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        // this.view = new PORTAL.Views.Member();
    },

    on_item_clicked: function(item) {
        // this.view.setModel(item.model);
        SWAM.Dialog.showModel(item.model, null, {size:"lg", vsize:"lg", can_dismiss:true});
    },

});


