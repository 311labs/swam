PORTAL.Views.Header = SWAM.View.extend({
	classes: "app-header bg-dark",
	template: ".views.header",
	defaults: {
		replaces_el: true
	},

	on_init: function() {
		app.me.on("change", this.render, this);
	},

	on_action_logout: function(evt) {
		app.logout();
	},

	on_action_admin: function(evt) {
		app.sidebar.showMenu("adminbar");
	},

	on_action_edit_profile: function(evt) {
        SWAM.Dialog.editModel(app.me, {title:"Edit Profile", callback:function(model, resp){
            if (resp.status) {
                SWAM.toast("Profile Saved", "Your profile succesfully updated");
            }
        }.bind(this)});
	}

});