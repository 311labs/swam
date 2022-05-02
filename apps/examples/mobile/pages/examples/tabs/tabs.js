
PORTAL.Pages.ExampleTabs = SWAM.Page.extend({
    template: ".pages.examples.tabs",
    classes: "page-view page-padded has-topbar",
    tagName: "div",

    defaults: {
        title: "Examples: Tabs"
    },

    on_init: function() {
        var tabs = new SWAM.Views.Tabs();

        tabs.addTab("Tab 1", "tab_1", new SWAM.View({template:".pages.examples.tabs.tab1"}));
        tabs.addTab("Tab 2", "tab_2", new SWAM.View({template:".pages.examples.tabs.tab2"}));
        tabs.addTab("How", "tab_3", new SWAM.View({template:".pages.examples.tabs.tab3"}));
        tabs.addTab("Denied", "denied", new SWAM.View({template:".pages.examples.tabs.tab1"}), {requires_perm:["superuser"]});

        tabs.setActiveTab("tab_3");

        this.addChild("example_tabs", tabs);

    },

});


