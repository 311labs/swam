

PORTAL.Pages.Login = SWAM.Page.extend({
    template: "portal_ext.pages.misc.login",
    classes: "page-view page-fullscreen",

    on_action_login: function(evt) {
        evt.stopPropagation();
        var data = SWAM.Form.getData(this.$el.find("form"));
        if (data.signin_username && data.signin_password) {
            app.showBusy({icon:'<i class="bi bi-key"></i>'});
            app.me.login(data.signin_username.trim(), data.signin_password, function(model, resp){
                app.hideBusy();
                if (!resp.status) {
                    this.$el.find("#err_box").addClass("show");
                    this.$el.find("#err_msg").text(resp.error);
                } else {
                    if (app.me.isAuthenticated()) {
                        app.on_logged_in();
                        app.loadRoute(this.starting_url);
                    } else {
                        this.$el.find("#err_box").addClass("show");
                        this.$el.find("#err_msg").text("unknown error");
                    }
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

    on_action_forgot: function() {
        SWAM.Dialog.showForm(
            [
                {name:"username", label:"Username or Email", floating_label:true},
            ], {
                title: "Reset Password",
                message: "Enter a valid email or password and we will send you a reset token.",
                lbl_save: "Submit",
                callback: function(dlg) {
                    var data = dlg.getData();
                    if (!data.username) return;
                    dlg.dismiss();
                    this.options.username = data.username.trim();
                    SWAM.toast("Reset Password", "Request sent to reset password!");
                    app.showBusy({icon:"lock"});
                    data.use_code = 1; // use a 6 digit code vs a link
                    SWAM.Rest.POST("/rpc/account/forgot", data, function(data, status){
                        app.hideBusy();
                        if (data.error) {
                            SWAM.Dialog.warning(data.error);
                        } else {
                            this.showEnterCode();
                        }
                    }.bind(this), {timeout: 15});
                    
                }.bind(this)
            });
    },

    showEnterCode: function() {
        SWAM.Dialog.showForm(
            [
                {name:"code", label:"Enter Reset Code", floating_label:true},
                {name:"new_password", label:"Enter New Password", type:"password", floating_label:true},
            ], {
                title: "Enter Reset Password Code",
                message: "Check for an email or SMS with your reset code!",
                lbl_save: "Submit",
                callback: function(dlg) {
                    var data = dlg.getData();
                    if ((!data.code)||(!data.new_password)) return;
                    app.showBusy({icon:"lock"});
                    data.username = this.options.username;
                    SWAM.Rest.POST("/rpc/account/login", data, function(data, status){
                        app.hideBusy();
                        if (data.error) {
                            SWAM.toast("Error", data.error, "error");
                        } else {
                            dlg.dismiss();
                            if (app.me.options.auth_method == "jwt") {
                                app.me.setJWT(data.data);
                            }
                            if (app.me.isAuthenticated()) {
                                app.on_logged_in();
                                app.loadRoute(this.starting_url);
                            }
                        }
                    }.bind(this), {timeout: 15});
                }.bind(this)
            });
    },

    on_action_change_api: function() {
        SWAM.Dialog.showForm([
            {
                label: "Select API Endpoint",
                name: "api_url",
                type: "select",
                editable: true,
                options: app.options.api_urls,
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
    },

    on_action_tokeloginpage: function() {
        app.setActivePage("tokenlogin");
    },

    on_action_show_password: function(evt) {
        var $parent = $(evt.currentTarget).parent();
        var $input = $parent.find("input");
        if ($input.attr("type") == "password") {
            $input.attr("type", "text");
        } else {
            $input.attr("type", "password");
        }
    },

    on_action_google_login: function() {
        const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const redirectUri = '/rpc/account/oauth/google/login';
        let state_token = JSON.stringify({url:location.href, token:String.Random(16)}).toHex();

        const scope = [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ].join(' ');

        const params = {
          response_type: 'code',
          client_id: app.options.google_client_id,
          redirect_uri: `${app.options.api_url}${redirectUri}`,
          prompt: 'select_account',
          access_type: 'offline',
          scope: scope,
          state: state_token
        };

        const urlParams = new URLSearchParams(params).toString();
        // console.log(`${googleAuthUrl}?${urlParams}`)
        window.location = `${googleAuthUrl}?${urlParams}`;
    }

});


