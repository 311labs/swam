PORTAL.Pages.EmailComplaint = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "mailbox",
        title: "Email Complaints",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"User Name", field:"username"},
            {label:"Display Name", field:"display_name"},
            {label:"Last Activity", field:"last_activity|ago"},
        ],
        Collection: SWAM.Collections.EmailComplaint,
        collection_params: {
            size: 10
        },
        group_filtering: false,
        add_button: false
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
    },

    on_item_clicked: function(item_view, evt) {

    }
});
