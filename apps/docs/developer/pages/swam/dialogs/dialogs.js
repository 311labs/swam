
PORTAL.Pages.ExampleDialogs = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.swam.dialogs",
    classes: "page-view page-padded has-topbar",

    busy_examples: _.keys(SWAM.Icons),

    on_init: function() {
        this.addChild("test_form", new SWAM.Form.View({fields:SWAM.Form.TestFields}));
    },

    on_action_show_alert_dialog: function(evt) {
        SWAM.Dialog.show({title:"Alert Dialog", message:"This is a simple alert", icon:"info-circle-fill"});
    },

    on_action_alert_fullscreen: function(evt) {
        SWAM.Dialog.show({title:"Fullscreen Dialog", message:"This is a fullscreen dialog", fullscreen:true});
    },

    on_action_warning_dialog: function(evt) {
        SWAM.Dialog.warning({title:"Warning Dialog", message:"This is a warning alert!"});
    },

    on_action_choices_dialog: function(evt) {
        SWAM.Dialog.choices({
            title:"Which do you like the best?",
            choices: [
                "Dog",
                "Cat",
                "Dolphin",
                "Monkey",
                "Panda"
            ],
            callback: function(dlg, choice) {
                dlg.dismiss();
                SWAM.Dialog.show("Your choice was: " + choice);
            }
        });
    },

    on_action_yesno_dialog: function(evt) {
        SWAM.Dialog.yesno({
            title:"Yes/No",
            message:"Do you want to close this dialog?", 
            lbl_yes:"I guess so", lbl_no:"Never!",
            callback: function(dlg, choice) {
                dlg.dismiss();
                SWAM.Dialog.show("Your choice was: " + choice);
            }
        });
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
        SWAM.Dialog.editModel(app.me, {title:"Edit Profile", callback:function(model, resp){
            if (resp.status) {
                SWAM.toast("Profile Saved", "Your profile succesfully updated");
            }
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

    on_action_offcanvas_left: function(evt) {
        SWAM.Dialog.offcanvas({title:"Hello Left"});
    },

    on_action_offcanvas_right: function(evt) {
        SWAM.Dialog.offcanvas({title:"Hello Right", direction:"right"});
    },

    on_post_render: function() {
        this.enableBS();
    },

    on_dom_removed: function() {
        SWAM.Page.prototype.on_dom_removed.call(this);
        this.destroyBS();
    }
});


