SWAM.Views.TopBar = SWAM.View.extend({
	classes: "swam-topbar bg-dark",
	template: "swam.ext.nav.topbar",
	defaults: {
		replaces_el: true
	},

	on_init: function() {
		if (app.me) app.me.on("change", this.render, this);
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
	},

	on_action_toggle_sidebar: function() {
		app.toggleLeftPanel();
	}

});