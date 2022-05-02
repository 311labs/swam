window.PORTAL = window.PORTAL || {}

PORTAL.App = SWAM.App.extend({
	defaults: {
		title: "EXAMPLES PORTAL",
		root: window.app_path + "/",
		api_url: "https://test.payauth.io",
		api_urls: [
			"https://test.payauth.io",
			"http://localhost:8000"
		],
		home_page: "examples"
	},

	on_init_pages: function() {
		// create me first so views and pages can use
		this.me = new SWAM.Models.Me();
		this.me.on("logged_out", this.on_logged_out, this);
		this.me.on("logged_in", this.on_logged_in, this);

		this.groups = new SWAM.Collections.Group({size:1000});

		this.addChild("title-bar", new PORTAL.Views.Header());
		this.sidebar = new PORTAL.Views.SideBar();
		this.addChild("panel-left", this.sidebar);

		this.addPage("not_found", new PORTAL.Pages.NotFound(), ["404"]);
		this.addPage("login", new PORTAL.Pages.Login(), ["login"]);

		// admin pages
		this.addPage("users", new PORTAL.Pages.Users(), ["admin/users", "users"]);
		this.addPage("groups", new PORTAL.Pages.Groups(), ["admin/groups", "groups"]);
		this.addPage("audit_logs", new PORTAL.Pages.AuditLogs(), ["admin/logs", "logs"]);

		this.on_init_examples();
	},

	on_init_examples: function() {
		this.addPage("examples_views", new PORTAL.Pages.ExampleViews(), ["examples/views"]);
		this.addPage("examples_tabs", new PORTAL.Pages.ExampleTabs(), ["examples/tabs"]);
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

	on_logged_out: function() {
		this.getChild("title-bar").render();
		this.hideLeftPanel();
	},

	on_logged_in: function() {
		app.me.fetchIfStale();
		this.groups.fetch();
		this.group = this.getPropertyModel(SWAM.Models.Group, "active_group");
		if (this.group) {
			this.trigger("group:change", {group:this.group});
			this.group.fetch();
		}
		this.getChild("title-bar").render();
		this.showLeftPanel();
	},

	setGroup: function(group) {
		this.group = group;
		this.setProperty("active_group", group);
		this.trigger("group:change", {group:group});
	},

	fetchUser: function() {
		this.me.fetch(function(model, resp) {
			if (resp.status) {
				this.on_logged_in();
				this.on_ready();
			} else {
				this.refreshUserToken();
			}
		}.bind(this));
	},

	refreshUserToken: function() {
		this.me.refreshJWT(function(model, resp){
			if (resp.status) {
				this.on_logged_in();
				this.on_ready();
			} else {
				this.trigger("auth_fail", this.me);
				this.showPage("login");
				this.trigger("ready");
			}
		}.bind(this));
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

		app.sidebar.showMenu("examples");
		this.showLeftPanel();
		this.showPage("examples_views");

		// if (this.me.isAuthenticated()) {
		// 	this.fetchUser();
		// } else if (this.me.isOrCanAuth()) { 
		// 	// refresh token
		// 	this.refreshUserToken();
		// } else {
		// 	this.showPage("login");
		// }
	},
});

window.MyApp = PORTAL.App;


