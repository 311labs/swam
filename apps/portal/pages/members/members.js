
PORTAL.Pages.Members = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "user",
        title: "Members",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"id", field:"id"},
            {label:"username", field:"username"},
            {label:"email", field:"email"},
            {label:"full_name", field:"full_name"},
        ],
        Collection: SWAM.Collections.User,
        collection_params: {
            size: 5
        }
    },

    on_action_add: function(evt) {
        // SWAM.Dialog.alert({title:"Not Implemented", message:"This form is not yet implemented"})
        SWAM.toast("Add Group", "Not implemented yet", "warning");
    },

    on_action_download_csv: function(evt) {
        SWAM.toast("Add Group", "This is a live change", "warning");
    },

    on_action_download_json: function(evt) {
        SWAM.toast("Add Group", "Not implemented yet", "warning");
    },

    on_action_download_pdf: function(evt) {
        SWAM.toast("Add Group", "Not implemented yet", "warning");
    },
});

