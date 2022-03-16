
PORTAL.Pages.Dashboard = SWAM.Page.extend({
    template: ".pages.dashboard",
    classes: "page-view page-fullscreen page-padded has-topbar",

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

});


