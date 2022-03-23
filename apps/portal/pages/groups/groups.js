
PORTAL.Pages.Groups = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "group",
        title: "Groups",
        columns: [
            {label:"id", field:"id"},
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
                label: "<i class='bi bi-plus'></i> Add membership",
                classes: "btn btn-primary add-membership",
                columns:4
            },
            {
                name: "search",
                columns: 4,
                form_wrap: "search",
                placeholder: "search",
                columns_classes: "nopadding",
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
                columns: 2,
                classes: "d-md-flex justify-content-md-end",
                type: "dropdown",
                icon: "bi bi-download",
                items: [
                    {
                        icon: "bi bi-filetype-csv",
                        label: "Download CSV",
                        action: "download_csv"
                    },
                    {
                        icon: "bi bi-filetype-json",
                        label: "Download JSON",
                        action: "download_json"
                    },
                    {
                        icon: "bi bi-file-pdf-fill",
                        label: "Download PDF",
                        action: "download_pdf"
                    },
                ]
            },
        ],
        Collection: SWAM.Collections.Group,
        collection_params: {
            size: 5
        }
    },

    on_action_add: function(evt) {
        // SWAM.Dialog.alert({title:"Not Implemented", message:"This form is not yet implemented"})
        SWAM.toast("Add Group", "Not implemented yet", "warning");
    },

    on_action_download_csv: function(evt) {
        SWAM.toast("Add Group", "Not implemented yet", "warning");
    },

    on_action_download_json: function(evt) {
        SWAM.toast("Add Group", "Not implemented yet", "warning");
    },

    on_action_download_pdf: function(evt) {
        SWAM.toast("Add Group", "Not implemented yet", "warning");
    },
});

