
PORTAL.Pages.Members = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "user",
        title: "Members",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"User Name", field:"username"},
            {label:"Display Name", field:"display_name"},
            {label:"Permissions", field:"metadata.permissions|badges"},
        ],
        Collection: SWAM.Collections.User,
        collection_params: {
            size: 5
        }
    },

});

