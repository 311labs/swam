
SWAM.Models.Me = SWAM.Models.User.extend({
    credentials: {

    },

    defaults: {
        auto_refresh_jwt: true
    },

    on_init: function() {
        // this is just a simple helper method to avoid having to call inheritance chains
        var credentials = this.setJWT(app.getObject("credentials", {}));
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

    isOrCanAuth: function() {
        return this.isAuthenticated() || (this.authExpiresIn() > 60);
    },

    isAuthed: function() {
    	return this.isAuthenticated();
    },

    isAuthenticated: function() {
        if (_.isEmpty(this.credentials)) return false;
        if (this.credentials.kind == "JWT") {
            return this.authExpiresIn() > 0;
        }
    	return !_.isEmpty(this.credentials.token);
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
            stopTimeout(this._auto_jwt_timer);
            this._auto_jwt_timer = null;
        }
    },

    setJWT: function(data) {
        this.credentials.kind = "JWT";
        this.credentials.access = data.access;
        this.credentials.refresh = data.refresh;
        this.credentials.jwt = parseJWT(data.access);
        this.credentials.jwt_refresh = parseJWT(data.refresh);
        if (data.id) this.id = data.id;
        if (this.credentials.access) {
            app.setProperty("credentials", this.credentials);
            SWAM.Rest.credentials = this.credentials;
        }
        this.startAutoJwtRefresh();
    },

    login: function(username, password, callback, opts) {
        SWAM.Rest.POST("/rpc/account/jwt/login", {username:username, password:password}, function(response, status) {
        	if (response.status) {
        		// credentials get stored in SWAM.Rest
        		this.setJWT(response.data);
        	}
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    logout: function() {
        this.stopAutoJwtRefresh();
        this.credentials = {};
        SWAM.Rest.credentials = null;
        app.setProperty("credentials", null);
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
                this.logout();
            }
            if (callback) callback(this, response);
        }.bind(this), opts);
    }
}, {
    EDIT_FORM: [
        {
            type:"group",
            columns: 4,
            fields: [
                {
                    name:"picture",
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
                    name:"full_name",
                    label:"Full Name",
                    type:"text",
                    placeholder:"Enter Full Name",
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



