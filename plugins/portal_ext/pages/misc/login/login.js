

PORTAL.Pages.Login = SWAM.Page.extend({
    template: "portal_ext.pages.misc.login",
    classes: "page-view page-fullscreen",

    defaults: {
        show_api_url: true,
        terms_path: "/static/terms.html",
        privacy_path: "/static/privacy.html"
    },

    on_action_login: function(evt) {
        if (evt) evt.stopPropagation();
        let data = SWAM.Form.getData(this.$el.find("form"));
        if (data.signin_username && data.signin_password) {
            if (data.signin_totp && (data.signin_totp.length == 6)) {
                this.options.login_opts = {params:{totp_code:data.signin_totp}};
            }
            app.setProperty("username", data.signin_username);
            app.showBusy({icon:'<i class="bi bi-key"></i>'});
            app.me.login(data.signin_username.trim(), data.signin_password, function(model, resp){
                app.hideBusy();
                if (!resp.status) {
                    if (resp.error_code == 455) {
                        app.setProperty("requires_totp", true);
                        this.options.requires_totp = true;
                        SWAM.Dialog.showForm([{
                            name: "totp_code",
                            maxlength: 6,
                            minlength: 6
                        }], {
                            title: "Enter 6 Digit MFA Code",
                            add_classes: "modal-white",
                            size: "sm",
                            lbl_save: "Login",
                            callback: function(dlg) {
                                let params = dlg.getData();
                                if (params.totp_code.length != 6) {
                                    return;
                                }
                                dlg.dismiss();
                                this.options.login_opts = {params:params};
                                this.on_action_login();
                            }.bind(this)
                        })
                    } else {
                        this.render();
                        this.$el.find("#err_box").addClass("show");
                        this.$el.find("#err_msg").text(resp.error);
                    }

                } else {
                    if (app.me.isAuthenticated()) {
                        app.on_logged_in();
                        app.loadRoute(this.starting_url);
                    } else {
                        this.$el.find("#err_box").addClass("show");
                        this.$el.find("#err_msg").text("unknown error");
                    }
                }
            }.bind(this), this.options.login_opts);
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
                    SWAM.Rest.POST("/api/account/forgot", data, function(data, status){
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
                    SWAM.Rest.POST("/api/account/login", data, function(data, status){
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
        const redirectUri = '/api/account/oauth/google/login';
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
    },

    on_pre_render: function() {
        this.options.requires_totp = app.getProperty("requires_totp");
    },

    on_post_render: function() {
        let uname = app.getProperty("username");
        if (uname) {
            this.$el.find("#signin_username").val(uname);
        }

        if (!WebAuthnClient.options.require_username) {
            // removing the username allows any passkeys for this host to be used
            uname = null;
        }

        // Availability of `window.PublicKeyCredential` means WebAuthn is usable.  
        WebAuthnClient.isConditionalMediationAvailable(function(isCMA){
            if (isCMA) {
                WebAuthnClient.authenticate(function(resp, options){
                    if (resp.status) {
                        app.me.setJWT(resp.data);
                        if (app.me.isAuthenticated()) app.me.trigger("logged_in", app.me);
                    } else {
                        SWAM.Dialog.warning(resp.error);
                    }
                }, uname);
            }
        });
    }

});


