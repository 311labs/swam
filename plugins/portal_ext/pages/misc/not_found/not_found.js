
PORTAL.Pages.NotFound = SWAM.Page.extend({
    template: "portal_ext.pages.misc.not_found",
    classes: "has-topbar page-view page-fullscreen",

    updateURL: function() {
        
    }

});

PORTAL.Pages.Denied = SWAM.Page.extend({
    template: "portal_ext.pages.misc.not_found.denied",
    classes: "has-topbar page-view page-fullscreen bg-white",

    updateURL: function() {

    }
});