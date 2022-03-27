window.PORTAL = window.PORTAL || {}

PORTAL.App = SWAM.App.extend({

	defaults: {
		title: "PORTAL DEMO",
		root: "/portal/",
		api_url: "https://api.itf.io",
		home_page: "examples"
	},

	on_init_pages: function() {
		// create me first so views and pages can use
		this.me = new SWAM.Models.Me();

		this.addChild("title-bar", new PORTAL.Views.Header());
		this.addChild("panel-left", new PORTAL.Views.SideBar());

		this.addPage("not_found", new PORTAL.Pages.NotFound(), ["404"]);
		this.addPage("login", new PORTAL.Pages.Login(), ["login"]);

		this.addPage("dashboard", new PORTAL.Pages.Dashboard(), ["dashboard", ":group/dashboard"]);
		this.addPage("members", new PORTAL.Pages.Members(), ["members", ":group/members"]);
		this.addPage("groups", new PORTAL.Pages.Groups(), ["groups", ":group/groups"]);

		this.on_init_examples();
	},

	on_init_examples: function() {
		this.addPage("examples_views", new PORTAL.Pages.ExampleViews(), ["examples/views"]);
		this.addPage("examples_pages", new PORTAL.Pages.ExamplePages(), ["examples/pages"]);
		this.addPage("examples_dialogs", new PORTAL.Pages.ExampleDialogs(), ["examples/dialogs"]);
		this.addPage("examples_forms", new PORTAL.Pages.ExampleForms(), ["examples/forms"]);
		this.addPage("examples_tables", new PORTAL.Pages.ExampleTables(), ["examples/tables"]);
		this.addPage("examples_misc", new PORTAL.Pages.ExampleMisc(), ["examples/misc"]);
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

		if (!this.me.isAuthenticated()) {
			this.showPage("login");
		} else {
			this.me.fetch(function(model, resp) {
				if (resp.status) {
					this.trigger("auth_success", this.me);
					this.on_loggedin();
					this.on_ready();
				} else {
					console.warn("user credentials no longer valid");
					if (this.me.credentials.kind == "JWT") {
						this.me.refreshJWT(function(model, resp){
							if (resp.status) {
								this.on_loggedin();
								this.on_ready();
							} else {
								this.trigger("auth_fail", this.me);
								this.showPage("login");
								this.trigger("ready");
							}
						}.bind(this));
					}
				}
			}.bind(this), {if_stale:true});
		}
	},
});


