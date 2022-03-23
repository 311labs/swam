
PORTAL.Pages.ExampleDialogs = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.examples.dialogs",
    classes: "page-view page-padded has-topbar",

    busy_examples: _.keys(SWAM.Icons),

    on_init: function() {
        this.addChild("test_form", new SWAM.Form.View({fields:SWAM.Form.TestFields}));
    },

    on_action_test_form: function(evt) {
        var fields = [
            {
                label: "plain input (default value)",
                name: "plain5",
                columns: 6,
            },
            {
                label: "a select",
                name: "select1",
                columns: 6,
                type: "select",
                options: ["blue", "green", "yellow", "red", "purple", "orange", "pink"]
            },
            {
                label: "a check box",
                name: "checkbox1",
                columns: 6,
                type: "checkbox"
            },
            {
                label: "a toggle",
                name: "toggle1",
                columns: 6,
                type: "toggle",
                help: "this is a simple toggle"
            },

        ];

        SWAM.Dialog.showForm(fields, {title:"Test Form", callback:function(dlg){
            var data = dlg.getData();
            SWAM.Dialog.alert({title:"Form Data", json:data});
            console.log(data);
        }.bind(this)});
    },

    on_action_test_show_model: function(evt) {
        var fields = ["username", "display_name", "first_name", "last_name", "email"];

        SWAM.Dialog.showModel(app.me, fields, {title:"Show Profile", callback:function(dlg){
            var data = dlg.getData();
            console.log(data);
        }.bind(this)});
    },

    on_action_test_edit_model: function(evt) {
        SWAM.Dialog.showForm(SWAM.Models.Me.EDIT_FORM, {model:app.me, title:"Show Profile", callback:function(dlg){
            var data = dlg.getData();
            console.log(data);
        }.bind(this)});
    },

    on_action_test_uncaught_error: function(evt) {
        // this should show the uncaught error
        var fields = null;
        fields.blah = "joe";
    },

    on_action_busy: function(evt) {
        var kind = $(evt.currentTarget).data("kind");
        if (kind) {
            app.showBusy({icon:kind, timeout:4000, no_timeout_alert:true});
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
    },

    on_action_form_json: function(evt) {
        SWAM.Dialog.alert({title:"Form Data", json:SWAM.Form.TestFields});
    },

    on_post_render: function() {
        this.enableBS();
    },

    on_dom_removed: function() {
        SWAM.Page.prototype.on_dom_removed.call(this);
        this.destroyBS();
    }
});


