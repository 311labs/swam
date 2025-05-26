PORTAL.Pages.GeoIPs = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "globe",
        title: "Geolocated IPs",
        list_options: {
            add_classes: "swam-table-clickable",
            batch_select: true,
            download_prefix: "emails",
            view_only: true, // don't show edit for on click
        },
        columns: [
            {label: "IP", field:"ip"},
            {label: "Country", field: "country"},
            {label: "City", field: "city"},
            {label: "State", field: "state"},
            {label: "ISP", field: "isp"},
            {label: "Modified", field: "modified|ago"},
        ],
        Collection: SWAM.Collections.GeoIP,
        collection_params: {
            size: 10
        },
        group_filtering: false,
        view_only: true,
        add_button: {
            type: "button",
            action: "add",
            label: "<i class='bi bi-search'></i> Lookup",
            classes: "btn btn-primary",
            columns:3,
            columns_classes: "col-sm-12 col-md-3 col-lg-3",
        },
        dlg_add_title: "IP Lookup",
        show_on_add: true
    },

    on_item_clicked: function(item, evt) {
        if (app.me.hasPerm("manage_ips")) {
            this.options.view_only = false;
            this.options.edit_form = SWAM.Models.GeoIP.EDIT_FORM;
        }
        this.on_item_edit(item, evt);
    },
}, {
    Lookup: function(ip) {
        let model = new SWAM.Models.GeoIP();
        model.save({ ip: ip }, (m, res) => {
            if (res.status) {
                SWAM.Dialog.showModel(m)
            }
        });

    },
});
