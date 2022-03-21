
PORTAL.Pages.Members = SWAM.Page.extend({
    template: ".pages.members",
    classes: "page-view page-padded has-topbar",

    defaults: {
        columns: [
            {label:"id", field:"id"},
            {label:"username", field:"username"},
            {label:"email", field:"email"},
            {label:"full_name", field:"full_name"},
        ],
    },

    on_init: function() {
        this.collection = new SWAM.Collections.User({size:5});
        this.addChild("list", new SWAM.Views.PaginatedTable({
            collection: this.collection, 
            columns: this.options.columns
        }));
    },

    on_pre_render: function() {
        this.children.list.collection.fetch();
    }

});

