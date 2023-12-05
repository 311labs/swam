
SWAM.Models.Me = SWAM.Models.User.extend({
    credentials: {

    },

    defaults: {
        auth_method: "jwt",
        auto_refresh_jwt: true
    },

    on_init: function() {
        // this is just a simple helper method to avoid having to call inheritance chains
        if (this.options.auth_method == "jwt") this.setJWT(app.getObject("credentials", {}));
        this.attributes = app.getObject("me", this.attributes);
        if (!_.isEmpty(this.credentials)) {
            SWAM.Rest.credentials = this.credentials;
            if ((this.credentials.kind == "JWT") && (this.isOrCanAuth())) this.startAutoJwtRefresh();
        }
        if (!this.attributes.id) {
        	this.id = "me";
        } else {
        	this.id = this.attributes.id;
        }
    },

    hasPerm: function(perm) {
        if (_.isArray(perm)) {
            var i=0;
            for (; i < perm.length; i++) {
                if (this.hasPerm(perm[i])) return true;
            }
            return false;
        }
        if (this.get("is_superuser")) return true;
        if ((perm == "staff")&&(this.isStaff())) return true;
        if (this.get("metadata.permissions." + perm)) return true;
        if (app.group && app.group.membership) return app.group.membership.hasPerm(perm);
        return false;
    },

    checkAuth: function(callback) {
        // this method is safer when supporting multiple auth types
        var auth_method = this.options.auth_method.upper();
        if (auth_method == "JWT") {
            return callback(this.isAuthenticated());
        }

        // all other types we just hit the server for now
        this.fetch(function(model, resp) {
            callback(resp.status);
        });
    },


    isOrCanAuth: function() {
        return this.isAuthenticated() || (this.refreshExpiresIn() > 60);
    },

    isAuthed: function() {
    	return this.isAuthenticated();
    },

    isAuthenticated: function() {
        return this["isAuthenticated" + this.options.auth_method.upper()]();
    },

    isAuthenticatedJWT: function() {
        if (_.isEmpty(this.credentials)) return false;
        if (this.credentials.kind == "JWT") {
            return this.authExpiresIn() > 0;
        }
    	return !_.isEmpty(this.credentials.token);
    },

    isAuthenticatedBASIC: function() {
        return !this.isStale();
    },

    startAutoJwtRefresh: function() {
        if (!this._auto_jwt_timer) {
            var timeout = (this.authExpiresIn() - 300) * 1000; // refresh 5 min before expires
            if (!this.isAuthed()) {
                timeout = 100;
            } else if (timeout < 4000) {
                timeout = 5000;
            }
            this._auto_jwt_timer = setTimeout(function(){
                this._auto_jwt_timer = null;
                this.refreshJWT();
            }.bind(this), timeout);
        }
    },

    stopAutoJwtRefresh: function() {
        if (this._auto_jwt_timer) {
            clearTimeout(this._auto_jwt_timer);
            this._auto_jwt_timer = null;
        }
    },

    setBASIC: function(data) {
        if (!_.isEmpty(data)) {
            this.credentials.kind = "BASIC";
            this.set(data);
            if (data.id) this.id = data.id;
            if (this.credentials.access) {
                if (window.app) app.setProperty("credentials", this.credentials);
                SWAM.Rest.credentials = this.credentials;
            }
        } else {
            this.credentials = {};
        }   
    },

    setJWT: function(data) {
        if (!_.isEmpty(data)) {
            this.credentials.kind = "JWT";
            this.credentials.access = data.access;
            this.credentials.refresh = data.refresh;
            this.credentials.jwt = parseJWT(data.access);
            this.credentials.jwt_refresh = parseJWT(data.refresh);
            if (data.id) this.id = data.id;
            if (this.credentials.access) {
                if (window.app) app.setProperty("credentials", this.credentials);
                SWAM.Rest.credentials = this.credentials;
            }
            this.startAutoJwtRefresh();
        } else {
            this.credentials = {};
        }

    },

    login: function(username, password, callback, opts) {
        this["login" + this.options.auth_method.upper()](username, password, callback, opts);
    },

    loginWithCode: function(username, code, callback, opts) {
        SWAM.Rest.POST("/rpc/account/login", {username:username, auth_code:code}, function(response, status){
            if (response.status) {
                // credentials get stored in SWAM.Rest
                this.setJWT(response.data);
                if (this.isAuthenticated()) this.trigger("logged_in", this);
            }
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    logout: function() {
        this["logout" + this.options.auth_method.upper()]();
        this.attributes = {};
    },

    loginJWT: function(username, password, callback, opts) {
        var data = {username:username, password:password};
        if (window.app && window.app.app_uuid) data.device_id = app.app_uuid;
        this.options.auth_method = "jwt";
        SWAM.Rest.POST("/rpc/account/jwt/login", data, function(response, status) {
        	if (response.status) {
        		// credentials get stored in SWAM.Rest
        		this.setJWT(response.data);
                if (this.isAuthenticated()) this.trigger("logged_in", this);
        	}
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    logoutJWT: function() {
        this.stopAutoJwtRefresh();
        this.credentials = {};
        SWAM.Rest.credentials = null;
        app.setProperty("credentials", null);
        this.trigger("logged_out", this);
    },

    loginBASIC: function(username, password, callback, opts) {
        var data = {username:username, password:password};
        if (window.app && window.app.app_uuid) data.device_id = app.app_uuid;
        SWAM.Rest.POST("/rpc/account/login", data, function(response, status) {
            if (response.status) {
                // credentials get stored in SWAM.Rest
                this.setBASIC(response.data);
                if (this.isAuthenticated()) this.trigger("logged_in", this);
            }
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    logoutBASIC: function(callback, opts) {
        SWAM.Rest.POST("/rpc/account/logout", {}, function(response, status) {
            if (response.status) {
                // credentials get stored in SWAM.Rest
                this.attributes = {};
                this.trigger("change", this);
            }
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    authExpiresIn: function() {
        if ((_.isEmpty(this.credentials)) || (_.isEmpty(this.credentials.jwt))) return 0;
        return this.credentials.jwt.exp - parseInt(Date.now() / 1000);
    },

    refreshExpiresIn: function() {
        if ((_.isEmpty(this.credentials)) || (_.isEmpty(this.credentials.refresh)) || (_.isEmpty(this.credentials.jwt))) return 0;
        return this.credentials.jwt_refresh.exp - parseInt(Date.now() / 1000);
    },

    isAuthExpiring: function() {
        return (this.authExpiresIn() - 300) < 0;
    },

    refreshJWT: function(callback, opts) {
        if (!this.credentials.refresh) {
            if (callback) callback(this, {status:false, error:"no refresh token"});
            return;
        }

        SWAM.Rest.POST("/rpc/account/jwt/refresh", {refresh_token:this.credentials.refresh}, function(response, status) {
            if (response.status) {
                // credentials get stored in SWAM.Rest
                this.setJWT(response.data);
            } else {
                // check for network errors
                if (!response.network_error) {
                    this.logout();
                }
            }
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    requires_totp: function() {
        return this.attributes.requires_totp;
    },

    verifyTOTP: function(code, callback) {
        SWAM.Rest.POST("/rpc/account/totp/verify", {code:code}, callback);
    },

    requiresTerms: function() {
        // FIXME: somereason not fetch clean user everytime
        if (!_.isDict(this.attributes.metadata)) return false;
        let when = this.get("metadata.agreed_on");
        if (when == undefined) return true;
        let now = new Date();
        when = new Date(when*1000)
        return (now.getTime() - when.getTime()) > 31536000;
    },
    requiresLegal: function() {
        // return true;
        let when = this.get("metadata.agreed_legal_on");
        if (when == undefined) return true;
        let now = new Date();
        when = new Date(when*1000)
        return (now.getTime() - when.getTime()) > 31536000;
    },
}, {
    EDIT_FORM: [
        {
            type:"group",
            columns: 4,
            fields: [
                {
                    name:"avatar",
                    label:"Avatar",
                    type:"image",
                    columns: 12
                },
            ]
        },
        {
            type:"group",
            columns: 8,
            fields: [
                {
                    name:"display_name",
                    label:"Display Name",
                    type:"text",
                    placeholder:"Enter Display Name",
                    columns: 12
                },
                {
                    name:"email",
                    label:"Email",
                    type:"email",
                    placeholder:"Enter Email",
                    columns: 12
                },
                {
                    name:"metadata.phone",
                    label:"Phone",
                    type:"tel",
                    placeholder:"Enter Phone Number",
                    columns: 12
                },
            ]
        }
    ]
});



