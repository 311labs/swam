PORTAL.Pages.TextMessages = SWAM.Pages.TablePage.extend({
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
            {label: "Sent", field:"created|datetime"},
            {label: "To", field: "endpoint"},
            {label: "From", field: "srcpoint"},
            {label: "Status", field: "status"},
            {label: "Message", field: "message"},
        ],
        Collection: SWAM.Collections.TextMessage,
        collection_params: {
            size: 10
        },
        group_filtering: false,
        view_only: true,
        add_button: false
    },
});

