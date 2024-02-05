

PORTAL.Pages.RegisterUser = SWAM.Page.extend({
	template: "portal_ext.pages.misc.register",
    classes: "page-view page-fullscreen",

    showInvalid: function() {
    	SWAM.toast("Register Error", "Your invite token is no longer valid!", "danger", 4000);
    	app.showPage("login");
    	app.navigate("login");
    },

    updateURL: function() {

    },

    on_page_enter: function() {
    	if (!this.params.auth_code) {
    		app.showPage("login");
    		app.navigate("login");
    		return;
    	}
    
	    try {
		    this.params.token = b64ToDict(this.params.auth_code);
	    } catch(error) {
	    	console.error(error);
	    	return this.showInvalid();
	    }

	    app.showBusy();
	    SWAM.Rest.POST("/api/account/invite/validate", this.params.token, function(data, status) {
	    	app.hideBusy();
	    	if (!data.status) {
	    		this.showInvalid();
	    	} else {
	    		this.render();
	    	}
	    }.bind(this));
    },

    on_action_register: function(evt) {
    	evt.stopPropagation();
    	var data = SWAM.Form.getData(this.$el.find("form"));
    	if (!data.new_password || (data.new_password.length < 7)) {
    		SWAM.toast("invalid password", "try stronger password");
    		return;
    	}
    	app.showBusy({icon:"lock"});
    	data.username = this.params.token.username;
    	data.auth_code = this.params.token.auth_token;
    	SWAM.Rest.POST("/api/account/login", data, function(data, status){
    	    app.hideBusy();
    	    if (data.error) {
    	        SWAM.Dialog.warning(data.error);
    	        if (data.error_code == 123) return; // validation error try again
    	        app.showPage("login");
    	        app.navigate("login");
    	    } else {
    	        app.me.setJWT(data.data);
    	        // app.me.fetchIfStale();
    	        app.showBusy({icon:"download", color:"success", no_timeout_alert:true});
    	        app.me.trigger("logged_in", app.me);
    	    }
    	}.bind(this), {timeout: 15});
    	return false;
    }
});
