SWAM.Collections.EmailTemplate


PORTAL.Pages.EmailTemplate = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "mailbox",
        title: "Email Templates",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
	        {label: "created", field: "created|datetime"},
            {label: "kind", field:"kind"},
            {label: "name", field: "name"}
        ],
        Collection: SWAM.Collections.EmailTemplate,
        collection_params: {
            size: 10
        },
        group_filtering: false,
    },

});
