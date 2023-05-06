window.PORTAL = window.PORTAL || {}

PORTAL.App = SWAM.App.extend({

	defaults: {
		title: "EXAMPLES PORTAL HELLO WORLD",
		root: window.app_path + "/",
		api_urls: [
			"http://localhost:8000"
		],
		home_page: "home"
	},

	on_init_pages: function() {
		SWAM.DataSets.load(["us_states", "countries"]);

		// create me first so views and pages can use
		this.me = new SWAM.Models.Me();
		this.me.on("logged_out", this.on_logged_out, this);
		this.me.on("logged_in", this.on_logged_in, this);

		this.groups = new SWAM.Collections.Group({size:1000});

		this.addChild("title-bar", new SWAM.Views.TopBar({title:"Developer Portal"}));
		this.sidebar = new SWAM.Views.SideBar({
			title: "Docs",
			group_select: false,
			menu: PORTAL.Menus.Default
		});
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
		this.addPage("swam_views", new PORTAL.Pages.ExampleViews(), ["swam/views"]);
		this.addPage("swam_rest", new PORTAL.Pages.ExampleRest(), ["swam/rest"]);
		this.addPage("swam_templates", new PORTAL.Pages.ExampleTemplates(), ["swam/templates"]);
		this.addPage("swam_tabs", new PORTAL.Pages.ExampleTabs(), ["swam/tabs"]);
		this.addPage("swam_pages", new PORTAL.Pages.ExamplePages(), ["swam/pages"]);
		this.addPage("swam_dialogs", new PORTAL.Pages.ExampleDialogs(), ["swam/dialogs"]);
		this.addPage("swam_forms", new PORTAL.Pages.ExampleForms(), ["swam/forms"]);
		this.addPage("swam_form_builder", new PORTAL.Pages.ExampleFormBuilder(), ["swam/form_builder"]);
		this.addPage("swam_tables", new PORTAL.Pages.ExampleTables(), ["swam/tables"]);
		this.addPage("swam_table_toc", new PORTAL.Pages.ExampleTableTOC(), ["swam/table_toc"])
		this.addPage("swam_misc", new PORTAL.Pages.ExampleMisc(), ["swam/misc"]);
		this.addPage("swam_charts", new PORTAL.Pages.ExampleCharts(), ["swam/charts"]);
		this.addPage("swam_models", new PORTAL.Pages.ExampleModels(), ["swam/models"]);
		this.addPage("swam_localize", new PORTAL.Pages.ExampleLocalize(), ["swam/localize"]);
		this.addPage("swam_searchdown", new PORTAL.Pages.ExampleSearchDown(), ["swam/searchdown"]);
		this.addPage("swam_busy", new PORTAL.Pages.ExampleBusy(), ["swam/busy"]);
		this.addPage("swam_toast", new PORTAL.Pages.ExampleToast(), ["swam/toast"]);
		this.addPage("swam_table_grid_page", new PORTAL.Pages.ExampleTableGridPages(), ["swam/table_grid_page"]);
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
		this.me.options.auth_method = "basic";
		this.me.fetch(function(){
			app.showLeftPanel();
			app.on_ready();
		});
	},
});

window.MyApp = PORTAL.App;


