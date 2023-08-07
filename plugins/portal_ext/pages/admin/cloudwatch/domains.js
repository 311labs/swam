
PORTAL.Pages.DomainWatch = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "domains",
        icon: "exclamation-diamond-fill",
        title: "Domains",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"Domain", field:"domain"},
            {label:"Cert Expires", field:"expires|datetime_tz"},
        ],
        Collection: SWAM.Collections.DomainWatch,
        add_button: false,
        no_search: true,
        search_field: "domain__icontains",
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


