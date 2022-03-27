
PORTAL.Pages.ExampleMisc = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.examples.misc",
    classes: "page-view page-padded has-topbar",

    busy_examples: _.keys(SWAM.Icons),

    on_init: function() {

    },

    on_action_test_uncaught_error: function(evt) {
        // this should show the uncaught error
        var fields = null;
        fields.blah = "joe";
    },

    on_action_busy: function(evt) {
        var kind = $(evt.currentTarget).data("kind");
        var color = "warning";
        if (["download", "secure", "payment", "user"].indexOf(kind) >= 0) {
            color = "success";
        }
        if (kind) {
            app.showBusy({icon:kind, color:color, timeout:4000, no_timeout_alert:true});
        }
    },

    on_action_toast: function(evt) {
        var kind = $(evt.currentTarget).data("kind");
        console.log(kind);
        var toast = {
            title: "Toast " + kind,
            message: "This works pretty well.",
            status: TOAST_STATUS[kind.lower()],
            timeout: 10000,
            // close_on_click: true,
            on_click: function(evt, t, data) {
                t.hide();
                SWAM.Dialog.alert(data);
            }
        }
        Toast.create(toast);
    }
});


