$(document).ready(function() {
    window.app = new SWAM.App({title:"SWAM Test App", $parent:$("body"), id:"app", enable_swipe:true});
    app.addChild("#panel-left", new MyApp.Views.LeftMenu());
    app.addChild("header", new MyApp.Views.TopBar());

    window.app.addPage("home", new MyApp.Pages.Home());
    window.app.addPage("about", new MyApp.Pages.About());

    window.app.render();
    window.app.setActivePage("home");
});

window.MyApp = {Pages:{}, Views:{}};

// BEGIN PAGES
MyApp.Pages.Home = SWAM.View.extend({
    templateName: "home",
    classes: "wap-page has-topbar page-padded",
    test_buttons: [
        {
            label: "Test Alert Dialog",
            action: "show_alert"
        },
        {
            label: "Test Choices Dialog",
            action: "show_choices"
        },
        {
            label: "Test Choices Dialog 2",
            action: "show_choices2"
        },
        {
            label: "Test Yes/No Dialog",
            action: "show_yesno"
        },
        {
            label: "Crash The App (Crashlytics Test)",
            action: "crash_the_app",
            btn_class: "btn-danger"
        },
        {
            label: "Show About Page",
            showpage: "about",
            btn_class: "btn-success"
        },
    ],
    on_action_show_alert: function(evt) {
        // SWAM.HAL.send("dialog", "alert", {"title":"Test Title", "message":"This is a test alert!"});
        SWAM.Dialog.alert({"title":"Test Title", "message":"This is a test alert!"});
    },
    on_action_show_choices: function(evt) {
        SWAM.Dialog.choices({
            "title":"Select Fruit",
            // "message":"This is a test alert!",
            "choices":["Apples", "Bananas", "Oranges"],
            "callback": function(dlg, val) { SWAM.Dialog.alert(val); }
        });
    },
    on_action_show_choices2: function(evt) {
        SWAM.Dialog.choices({
            "title":"Select Color",
            // "message":"This is a test alert!",
            "choices":[{id:"blue", label:" Blue"}, {id:"green", label:"Green"}, {id:"red", label:"Red"}],
            "callback": function(dlg, val) { SWAM.Dialog.alert(val); }
        });
    },
    on_action_show_yesno: function(evt) {
        // SWAM.HAL.send("dialog", "yesno", {"title":"Test Title", "message":"This is a test Yes/No!"});
        SWAM.Dialog.yesno({
            "title":"Test Title",
            "message":"This is a test Yes/No!",
            "callback": function(dlg, val) { SWAM.Dialog.alert(val); }
        })
    },
    on_action_show_home: function(evt) {
        app.setActivePage("home");
    },
    on_action_crash_the_app: function(evt) {
        SWAM.HAL.send("hal", "crash_the_app");
    }
});

MyApp.Pages.About = SWAM.View.extend({
    templateName: "about",
    classes: "wap-page has-topbar page-padded",
});

MyApp.Pages.Test = SWAM.View.extend({
    templateName: "test",
    classes: "wap-page has-topbar page-padded",
});
// END PAGES

// BEGIN VIEWS
MyApp.Views.LeftMenu = SWAM.View.extend({
    templateName: "left_menu",
    classes: "wap-view user-select-none",
    on_dom_added: function() {
        app.on("page:change", app.hideLeftPanel, app);
        this.render();
    },
    on_dom_removed: function() {
        app.off("page:change", app.hideLeftPanel);
        this.render();
    },

});

MyApp.Views.TopBar = SWAM.View.extend({
    templateName: "topbar",
});
// END VIEWS
