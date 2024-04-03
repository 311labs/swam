PORTAL.Pages.EmailBounced = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "mailbox",
        title: "Email Bounces",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"created", field:"created|datetime"},
            {label:"User Name", field:"user.username"},
            {label:"Address", field:"address|escape"},
            {label:"Source", field:"source"}
        ],
        Collection: SWAM.Collections.EmailBounced,
        collection_params: {
            size: 10
        },
        group_filtering: false,
        add_button: false
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
    }
});
