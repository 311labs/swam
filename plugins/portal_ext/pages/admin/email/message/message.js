PORTAL.Pages.EmailMessage = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "mailbox",
        title: "Email Incoming Messages",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label: "Sent", field:"sent_at|datetime"},
            {label: "To", field: "to_email"},
            {label: "From", template: "{{model.from_name}} {{model.from_email}}"},
            {label: "Subject", field: "subject"}
        ],
        Collection: SWAM.Collections.EmailMessage,
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
