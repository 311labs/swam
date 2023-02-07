

PORTAL.Pages.RegisterUser = SWAM.Page.extend({
    template: ".pages.misc.register",
    classes: "page-view page-fullscreen",

    showInvalid: function() {
    	SWAM.Dialog.warning("Your invite token is not valid!");
    	app.showPage("login");
    },

    on_page_enter: function() {
    	console.log(this.params);
    	if (!this.params.auth_code) return this.showInvalid();
    
	    try {
		    this.params.token = b64ToDict(this.params.auth_code);
	    } catch(error) {
	    	console.error(error);
	    	return this.showInvalid();
	    }
	    this.render();
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
    	SWAM.Rest.POST("/rpc/account/login", data, function(data, status){
    	    app.hideBusy();
    	    if (data.error) {
    	        SWAM.Dialog.warning(data.error);
    	        if (data.error_code == 123) return; // validation error try again
    	        app.showPage("login");
    	    } else {
    	        app.me.setJWT(data.data);
    	        app.me.fetchIfStale();
    	        app.showBusy({icon:"download", color:"success", no_timeout_alert:true});
    	        app.groups.fetch(function(){
    	        	app.hideBusy();
    	        	if (app.groups.length) {
    	        		// set the first one has active
    	        		app.getChild("title-bar").render();
    	        		app.showLeftPanel();
    	        		app.setGroup(app.groups.getAt(0));
    	        		app.showPage("dashboard", {group:this.params.group});
    	        	}
    	        }.bind(this));
    	    }
    	}.bind(this), {timeout: 15});
    	return false;
    }
});
