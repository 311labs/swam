PORTAL.Pages.CloudCredntials = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "cloud",
        title: "Cloud Credentials",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label: "Created", field:"created|datetime"},
            {label: "Group", field: "group.name"},
            {label: "Name", field: "name"},
            {label: "UUID", field: "uuid"},
        ],
        Collection: SWAM.Collections.CloudCredentials,
        collection_params: {
            size: 10
        },
        group_filtering: false,
    },
});

