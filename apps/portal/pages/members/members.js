
PORTAL.Pages.Members = SWAM.Page.extend({
    template: ".pages.members",
    classes: "page-view page-fullscreen page-padded has-topbar",

    on_init: function() {
        this.addChild("list", new SWAM.Views.List({collection:new SWAM.Collections.User()}));
    },

    on_pre_render: function() {
        this.children.list.collection.fetch();
    }

});

