PORTAL.Pages.EmailOutgoing = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "mailbox",
        title: "Email Outgoing",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label: "Date", field:"created|datetime"},
            {label: "State", field: "state_display"},
            {label: "To", field: "to_emails"},
            {label: "From", field: "from_addr"},
            {label: "Subject", field: "subject"},
            {label: "Reason", field: "reason"}
        ],
        Collection: SWAM.Collections.EmailOutgoing,
        collection_params: {
            size: 10,
            sort: "-last_activity"
        },
        group_filtering: false
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
    },

    on_item_clicked: function(item_view, evt) {

    }
});
