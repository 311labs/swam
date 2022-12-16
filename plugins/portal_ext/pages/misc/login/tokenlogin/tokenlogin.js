PORTAL.Pages.TokenLogin = SWAM.Page.extend({
    template: "portal_ext.pages.misc.login.tokenlogin",
    classes: "page-view page-fullscreen",

    on_action_submitemail: function(evt) {
        evt.stopPropagation();
        var data = SWAM.Form.getData(this.$el.find("form"));

        if (data.username){
            this.options.username = data.username;
            SWAM.toast("Email sent", "Login token has been sent to given email address.");
            app.showBusy({icon:"lock"});
            data.use_code = 1;          
            SWAM.Rest.POST("/rpc/account/forgot", data, function(data, status){
                app.hideBusy();
                if (data.error) {
                    SWAM.Dialog.warning(data.error);
                } else {
                    this.tokenSent();
                }
            }.bind(this), {timeout: 15});
        }return false;
    },

    tokenSent: function() {
        this.template = "portal_ext.pages.misc.login.tokenlogin.tokenenter";
        this.render();
    },

    on_action_tokensubmit: function() {
        var data = SWAM.Form.getData(this.$el.find("form"));
        if (data.validToken) {
            app.showBusy({icon:"lock"});
            //data.username = this.options.username;
            data.invite_token = data.validToken;
            SWAM.Rest.POST("/rpc/account/login", data, function(data, status){
                app.hideBusy();
                if (data.error) {
                    SWAM.toast("Error", data.error, "error");
                } else {
                    app.me.setJWT(data.data);
                    if (app.me.isAuthenticated()) {
                        app.on_logged_in();
                        app.loadRoute(this.starting_url);
                    }
                }
            }.bind(this), {timeout: 15});
        }
        return false;
    },

    on_input_change: function(evt) {
        SWAM.toast(evt.name, evt.value);
    }

});


