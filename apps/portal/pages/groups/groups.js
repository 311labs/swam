
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
        filters: [
            {
                type: "button",
                action: "add",
                label: "<i class='bi bi-plus'></i> Add",
                classes: "btn btn-primary add-membership",
                columns:3
            },
            {
                type: "group",
                classes: "justify-content-sm-end",
                columns: 9,
                fields: [
                    {
                        name: "search",
                        columns: 4,
                        form_wrap: "search",
                        placeholder: "search",
                        button: {
                            icon: "bi bi-search"
                        }
                    },
                    {
                        columns: 2,
                        type: "select",
                        name: "size",
                        options: [
                            5, 10, 20, 50, 100
                        ]
                    },
                    {
                        columns: 3,
                        columns_classes: "col-sm-auto",
                        type: "buttongroup",
                        buttons: [
                            {
                                classes: "btn btn-secondary",
                                icon: "bi bi-arrow-repeat",
                                action: "reload"
                            },
                            {
                                type: "dropdown",
                                icon: "bi bi-download",
                                items: [
                                    {
                                        icon: "bi bi-download",
                                        label: "Download CSV",
                                        action: "download_csv"
                                    },
                                    {
                                        icon: "bi bi-upload",
                                        label: "Download JSON",
                                        action: "download_json"
                                    },
                                    {
                                        icon: "bi bi-lock",
                                        label: "Download PDF",
                                        action: "download_pdf"
                                    },
                                ]
                            }

                        ]
                    },
                ]
            }
        ],
        Collection: SWAM.Collections.Group,
        collection_params: {
            size: 5
        }
    },


});

