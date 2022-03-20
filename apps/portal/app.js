window.PORTAL = window.PORTAL || {}

PORTAL.App = SWAM.App.extend({

	defaults: {
		title: "PORTAL DEMO",
		root: "/portal/",
		api_url: "https://api.itf.io",
		home_page: "examples"
	},

	on_init_pages: function() {
		this.addChild("title-bar", new PORTAL.Views.Header());
		this.addChild("panel-left", new PORTAL.Views.SideBar());

		this.addPage("not_found", new PORTAL.Pages.NotFound(), ["404"]);
		this.addPage("login", new PORTAL.Pages.Login(), ["login"]);

		this.addPage("examples", new PORTAL.Pages.Examples(), ["examples", ":group/examples"]);
		this.addPage("dashboard", new PORTAL.Pages.Dashboard(), ["dashboard", ":group/dashboard"]);
		this.addPage("members", new PORTAL.Pages.Members(), ["members", ":group/members"]);
		this.addPage("groups", new PORTAL.Pages.Groups(), ["groups", ":group/groups"]);
	},

	logout: function() {
		SWAM.Dialog.yesno({title:"Confirm Logout", "message": "Are you sure you want to logout?", callback: function(dlg, choice){
			dlg.dismiss();
			if (choice == "yes") {
				this.me.logout();
				this.showPage("login");
			}
		}.bind(this)})
	},

	on_loggedin: function() {
		this.getChild("title-bar").render();
		this.showLeftPanel();
	},

	on_started: function() {
		Toast.setTheme(TOAST_THEME.DARK);
		// get the api version
		SWAM.Rest.GET("/rpc/version", {}, function(resp, status) {
			if (resp.status) {
				app.api_version = resp.data;
				app.getChild("panel-left").render();
			}
		});
		// first we get the active user
		// next we make sure we are authenticated or try and refresh our access or show login
		this.me = new SWAM.Models.Me();
		if (!this.me.isAuthenticated()) {
			this.showPage("login");
		} else {
			this.me.fetch(function(model, resp) {
				if (resp.status) {
					this.on_loggedin();
					this.loadPageFromURL();
				} else {
					console.warn("user credentials no longer valid");
					if (this.me.credentials.kind == "JWT") {
						this.me.refreshJWT(function(model, resp){
							if (resp.status) {
								this.on_loggedin();
								this.loadPageFromURL();
							} else {
								this.showPage("login");
							}
						}.bind(this));
					}
				}
			}.bind(this), {if_stale:true});
		}
	},
});


