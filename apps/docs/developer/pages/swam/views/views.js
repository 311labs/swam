
PORTAL.Pages.ExampleViews = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.swam.views",
    classes: "page-view p-4 has-topbar",

    on_init: function() {
        var tabs = new SWAM.Views.Tabs();
        tabs.addTab("HTML", "tab_1", new SWAM.View({template:".pages.swam.views.html"}));
        tabs.addTab("Javascript", "tab_2", new SWAM.View({template:".pages.swam.views.js"}));
        tabs.setActiveTab("tab_1");
        this.addChild("tabs", tabs);
    },

});


