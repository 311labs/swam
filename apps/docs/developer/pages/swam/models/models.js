
PORTAL.Pages.ExampleModels = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.swam.models",
    classes: "page-view has-topbar p-4",

    busy_examples: _.keys(SWAM.Icons),

    on_init: function() {

    },

});


