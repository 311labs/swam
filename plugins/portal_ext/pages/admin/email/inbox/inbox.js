PORTAL.Pages.EmailInbox = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "mailbox",
        title: "Email Inboxes",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"Email", field:"email"},
            {label:"App", field:"tq_app"},
            {label:"Handler", field:"tq_handler"},
            {label:"Channel", field:"tq_channel"},
        ],
        Collection: SWAM.Collections.EmailInbox,
        collection_params: {
            size: 10
        },
        group_filtering: false,
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
    }
});
