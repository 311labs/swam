
PORTAL.Pages.FirewallEvents = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "firewall",
        icon: "exclamation-diamond-fill",
        title: "Firewall",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"When", field:"created|datetime"},
            {label:"IP", field:"reporter_ip"},
            {label:"ISP", field:"metadata.isp"},
            {label:"City", field:"metadata.city"},
            {label:"State", field:"metadata.province"},
            {label:"Country", field:"metadata.country"},
            {label:"Server", field:"hostname"},
            {label:"Action", field:"metadata.action"},
        ],
        Collection: SWAM.Collections.IncidentEvent,
        collection_params: {
            category: "firewall",
            size: 10
        },
        add_button: false,
        search_field: "reporter_ip__icontains",
        group_filtering: false,
        filters: [
            {
                label: "Created",
                name: "created",
                type: "daterange"
            }
        ]
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


