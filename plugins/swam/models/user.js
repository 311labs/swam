

SWAM.Models.User = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/member"
    },

    credentials: {

    },

    login: function(username, password, callback, opts) {
        SWAM.Rest.POST("/rpc/account/jwt/login", {username:username, password:password}, function(data, status) {
        	if (data.status) {
        		// credentials get stored in SWAM.Rest
        		this.credentials.kind = "JWT";
        		this.credentials.access = data.data.access;
        		this.credentials.refresh = data.data.refresh;
        		if (data.data.id) this.id = data.data.id;
        		if (this.credentials.access) {
        			SWAM.Rest.credentials = this.credentials;
        		}
        	}
            if (callback) callback(this, status, data);
        }.bind(this), opts);
    },

});