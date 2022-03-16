
SWAM.Models.Me = SWAM.Models.User.extend({
    credentials: {

    },

    on_init: function() {
        // this is just a simple helper method to avoid having to call inheritance chains
        this.credentials = app.getObject("credentials", {});
        this.attributes = app.getObject("me", this.attributes);
        if (!_.isEmpty(this.credentials)) SWAM.Rest.credentials = this.credentials;
        if (!this.attributes.id) {
        	this.id = "me";
        } else {
        	this.id = this.attributes.id;
        }
    },

    isAuthed: function() {
    	return this.isAuthenticated();
    },

    isAuthenticated: function() {
    	return !_.isEmpty(this.credentials.access) || !_.isEmpty(this.credentials.token);
    },

    login: function(username, password, callback, opts) {
        SWAM.Rest.POST("/rpc/account/jwt/login", {username:username, password:password}, function(response, status) {
        	if (response.status) {
        		// credentials get stored in SWAM.Rest
        		this.credentials.kind = "JWT";
        		this.credentials.access = response.data.access;
        		this.credentials.refresh = response.data.refresh;
        		if (response.data.id) this.id = response.data.id;
        		if (this.credentials.access) {
        			app.setProperty("credentials", this.credentials);
        			SWAM.Rest.credentials = this.credentials;
        		}
        	}
            if (callback) callback(this, response);
        }.bind(this), opts);
    },

    logout: function() {
        this.credentials = {};
        SWAM.Rest.credentials = null;
        app.setProperty("credentials", null);
    },

    refreshJWT: function(callback, opts) {
        if (!this.credentials.refresh) {
            if (callback) callback(this, {status:false, error:"no refresh token"});
            return;
        }

        SWAM.Rest.POST("/rpc/account/jwt/refresh", {refresh_token:this.credentials.refresh}, function(response, status) {
            if (response.status) {
                // credentials get stored in SWAM.Rest
                this.credentials.kind = "JWT";
                this.credentials.access = response.data.access;
                this.credentials.refresh = response.data.refresh;
                if (response.data.id) this.id = response.data.id;
                if (this.credentials.access) {
                    app.setProperty("credentials", this.credentials);
                    SWAM.Rest.credentials = this.credentials;
                }
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


