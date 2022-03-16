PORTAL.Views.SideBar = SWAM.View.extend({
	classes: "main bg-dark",
	template: ".views.sidebar",
	defaults: {
		replaces_el: false
	},

	on_action_logout: function(evt) {
		app.logout();
	}

});