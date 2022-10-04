
PORTAL.Pages.ExamplePages = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.swam.pages",
    classes: "page-view p-4 has-topbar",

    on_init: function() {
        var tabs = new SWAM.Views.Tabs();
        tabs.addTab("HTML", "tab_1", new SWAM.View({template:".pages.swam.pages.html"}));
        tabs.addTab("Javascript", "tab_2", new SWAM.View({template:".pages.swam.pages.js"}));
        tabs.setActiveTab("tab_2");
        this.addChild("tabs", tabs);
    },

});


