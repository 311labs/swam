
PORTAL.Pages.Groups = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "group",
        title: "Groups",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"id", field:"id"},
            {label:"Created", field:"created|date"},
            {label:"name", field:"name"},
            {
                label:"kind",
                filter: {
                    label: "Group Kind",
                    field: "kind",
                    type: "select",
                    options: ["no filter", "test_group", "lock_test_merchant", "org"]
                }
            },
            {label:"city", field:"location.city", no_sort:true},
            {label:"state", field:"location.state", no_sort:true},
        ],
        Collection: SWAM.Collections.Group,
        collection_params: {
            size: 10
        },
    },


});

