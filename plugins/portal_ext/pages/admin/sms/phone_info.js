PORTAL.Pages.PhoneInfo = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "chat",
        title: "Outgoing Text Messages",
        list_options: {
            add_classes: "swam-table-clickable",
            batch_select: true,
            download_prefix: "emails",
            view_only: true, // don't show edit for on click
        },
        columns: [
            {label: "Modified", field:"modified|datetime"},
            {label: "Number", template: "{{{model.is_valid|yesno_icon}}} {{model.number}}"},
            {label: "Kind", field: "kind"},
            {label: "Owner", field: "owner_name"},
            {label: "Type", field: "owner_kind"},
            {label: "Carrier", field: "carrier_name"},
        ],
        Collection: SWAM.Collections.PhoneInfo,
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
        dlg_add_title: "Phone Number Lookup",
        show_on_add: true
    },

    // on_action_add: function(evt) {
    //     let model = PhoneInfo.Lookup()
    // },
});

