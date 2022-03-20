
PORTAL.Pages.Groups = SWAM.Page.extend({
    template: ".pages.groups",
    classes: "page-view page-fullscreen page-padded has-topbar",

    on_init: function() {
        this.collection = new SWAM.Collections.Group({size:5});
        this.addChild("list", new SWAM.Views.PaginatedList({collection: this.collection, item_template:"<div>{{model.name}}</div>"}));
    },

    on_pre_render: function() {
        this.children.list.collection.fetch();
    }

});

