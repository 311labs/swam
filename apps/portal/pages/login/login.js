
PORTAL.Pages.Login = SWAM.Page.extend({
    template: ".pages.login",
    classes: "page-view page-fullscreen",

    on_action_login: function(evt) {
        evt.stopPropagation();
        var data = SWAM.Form.getData(this.$el.find("form"));
        if (data.signin_username && data.signin_password) {
            app.showBusy({icon:'<i class="bi bi-key"></i>'});
            app.me.login(data.signin_username, data.signin_password, function(model, data){
                app.hideBusy();
                if (app.me.isAuthenticated()) {
                    app.on_logged_in();
                    app.loadRoute(this.starting_url);
                } else {
                    SWAM.Dialog.alert({"title":"Login Failed", "message": data.error});
                }
            }.bind(this));
        }
        return false;
    },

    on_route: function() {
        if (app.me.isAuthenticated()) {
            app.setActivePage(app.options.home_page);
        } else {
            app.hideLeftPanel();
            app.setActivePage(this.page_name);
        }
    },

    on_action_change_api: function() {
        SWAM.Dialog.showForm([
            {
                label: "Select API Endpoint",
                name: "api_url",
                type: "select",
                options: [
                    "http://localhost:8000",
                    "https://api.itf.io"
                ],
                default: app.options.api_url
            }
        ], {
            title: "Change API Enpoint",
            callback: function(dlg, choice) {
                console.log(dlg.getData());
                app.setProperty("api_url", dlg.getData().api_url);
                dlg.dismiss();
                this.render();
            }.bind(this)
        })
    }

});


