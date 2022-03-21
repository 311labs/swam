
PORTAL.Pages.Groups = SWAM.Page.extend({
    template: ".pages.groups",
    classes: "page-view page-padded has-topbar",

    defaults: {
        columns: [
            {label:"id", field:"id"},
            {label:"name", field:"name"},
            {label:"kind", field:"kind"},
            {label:"city", field:"location.city", no_sort:true},
            {label:"state", field:"location.state", no_sort:true},
        ],
    },

    on_init: function() {
        this.collection = new SWAM.Collections.Group({size:5});
        this.addChild("list", new SWAM.Views.PaginatedTable({
            collection: this.collection, 
            columns: this.options.columns
        }));
    },

    on_pre_render: function() {
        this.children.list.collection.fetch();
    }

});

