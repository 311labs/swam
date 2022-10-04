
PORTAL.Pages.ExampleMisc = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.swam.misc",
    classes: "page-view page-padded has-topbar",

    on_init: function() {
        this.addChild("simple_dropdown", new SWAM.Views.Dropdown({
            menu_items: [
                "Blue", "Green", "Yellow",
                "Red", "Purple", "Black", 
                {id:"light", label:"White"}
            ]
        }));
        this.children.simple_dropdown.on("change", this.on_dropdown_change, this);

    },

    on_dropdown_change: function(item) {
        SWAM.toast("dropdown event", item.id, "info", 3000);
    },

    on_action_test_uncaught_error: function(evt) {
        // this should show the uncaught error
        var fields = null;
        fields.blah = "joe";
    },
});


