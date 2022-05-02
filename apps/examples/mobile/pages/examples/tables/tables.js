
PORTAL.Pages.ExampleTables = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.examples.tables",
    classes: "page-view page-padded has-topbar",

    busy_examples: _.keys(SWAM.Icons),

    on_init: function() {
        
    },

    on_post_render: function() {
        this.enableBS();
    },

    on_dom_removed: function() {
        SWAM.Page.prototype.on_dom_removed.call(this);
        this.destroyBS();
    }
});

