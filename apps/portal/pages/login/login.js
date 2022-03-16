
PORTAL.Pages.Login = SWAM.Page.extend({
    template: ".pages.login",
    classes: "page-view page-fullscreen",

    on_action_login: function(evt) {
        evt.stopPropagation();
        var data = SWAM.Form.getData(this.$el.find("form"));
        if (data.signin_username && data.signin_password) {
            app.showBusy({icon:'<i class="bi bi-key"></i>'});
            app.me.login(data.signin_username, data.signin_password, function(model, status, data){
                app.hideBusy();
                app.on_loggedin();
                if (app.me.isAuthenticated()) {
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
    }

});


