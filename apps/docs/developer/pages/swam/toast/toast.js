
PORTAL.Pages.ExampleToast = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.swam.toast",
    classes: "page-view page-padded has-topbar",
    tagName: "div",

    on_init: function() {
        this.addChild("toast_placement", new SWAM.Views.Dropdown({
            menu_items: [
                "top_left", "top_center", "top_right",
                "bottom_left", "bottom_center", "bottom_right"
            ]
        }));
        this.children.toast_placement.on("change", this.on_toast_placement, this);

        this.addChild("toast_theme", new SWAM.Views.Dropdown({
            menu_items: [
                "light", "dark", "solid"
            ]
        }));
        this.children.toast_theme.on("change", this.on_toast_theme, this);
    },

    on_toast_placement: function(item) {
        app.setToastGlobals({placement:item.id});
        SWAM.toast("Toast Global Changed", item.id, null, 3000);
    },

    on_toast_theme: function(item) {
        app.setToastGlobals({theme:item.id});
        SWAM.toast("Toast Global Changed", item.id, null, 3000);
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




