
PORTAL.Pages.ExampleTabs = SWAM.Page.extend({
    template: ".pages.swam.tabs",
    classes: "page-view page-padded has-topbar",
    tagName: "div",

    on_init: function() {
        var tabs = new SWAM.Views.Tabs();
        tabs.addTab("Docs", "tab_1", new SWAM.View({template:".pages.swam.tabs.tab1"}));
        tabs.addTab("Collapsed", "tab_2", new SWAM.View({template:".pages.swam.tabs.tab2"}));
        tabs.addTab("Code", "tab_3", new SWAM.View({template:".pages.swam.tabs.tab3"}));
        tabs.addTab("Denied", "denied", new SWAM.View({template:".pages.swam.tabs.tab1"}), {requires_perm:["superuser"]});
        tabs.setActiveTab("tab_1");
        this.appendChild("example_tabs", tabs);


        var dd = new SWAM.Views.Tabs({force_dropdown:true});
        dd.addTab("Info", "info", new SWAM.View({template:".pages.swam.tabs.tab4"}));
        for (var i = 1; i < 11; i++) {
            dd.addTab("t" + i, "tab_" + i, new SWAM.View({template:"<h1 class='m-4'>This is tab " + i + "</h1>"}));
        }
        tabs.getTab("tab_2").appendChild("example_dd", dd);
    },

});
