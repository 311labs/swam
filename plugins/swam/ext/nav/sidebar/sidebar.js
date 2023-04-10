SWAM.Views.SideBar = SWAM.View.extend(SWAM.Ext.BS).extend({
	classes: "main bg-dark",
	template: "swam.ext.nav.sidebar.sidebar",
	defaults: {
		title: "Menu",
		group_select: true,
		group_label: "Group",
		empty_label: "Select Group",
		replaces_el: false,
		only_one: true,
		menu: null,
		admin_menu: [
			{
				label: "Admin Dashboard",
				icon: "bi bi-speedometer2",
				page: "admin_dashboard"
			}
		],
		admin_menus: [
			{
				label: "Admin Menu",
				icon: "tools",
				id: "admin"
			}
		],
		menu_select: false,
		menu_select_items: []
	},

	on_init: function() {
		app.me.on("change", this.on_me_change, this);
		app.me.on("logged_in", this.on_logged_in, this);
		app.on("ready", this.on_app_ready, this);
		app.on("page:change", this.on_page_change, this);
		app.on("group:change", this.on_group_change, this);
		this.on("rendered", this.on_rendered, this); // this avoid conflicting with post render

		if (this.options.group_select) {
			this.addChild("groupselect", new SWAM.Views.SearchDown({
				btn_classes: "btn btn-link text-decoration-none",
				remote_search: true,
				auto_fetch: true,
				collection: app.groups, 
				empty_label: this.options.empty_label
			}));
		}

		if (this.options.menu_select) {
			this.addChild("menuselect", new SWAM.Views.DropDown({
				menu_items: this.options.menu_select_items
			}));
			this.children.menuselect.on("change", this.on_menu_change, this);
		}

		this.nav = new SWAM.Views.Nav({items:this.options.menu, only_one:this.options.only_one});
		this.addChild("main_nav", this.nav);
	},

	showMenu: function(name) {
		if (name == "admin") {
			this.template = "swam.ext.nav.sidebar.adminbar";
			this.$el.removeClass("bg-dark").addClass("bg-light");
			this.classes = "main bg-light";
			this.nav.options.items = this.options.admin_menu;
			this.render();
		} else {
			if (this.options.templates && this.options.templates[name]) {
				this.template = this.options.templates[name];
			} else {
				this.template = "swam.ext.nav.sidebar.sidebar";
			}

			this.options.active_menu = null;
			let menu = null;
			if (this.options.menus && this.options.menus[name]) {
				menu = this.options.menus[name];
			} else if (this.options.menu) {
				menu = this.options.menu;
			} else if (this.options.menus && this.options.menus["default"]) {
				menu = this.options.menus["default"];
			}

			if (menu.menu) {
				this.nav.options.items = menu.menu;
				if (menu.template) {
					this.template = menu.template;
				}
				this.options.active_menu = menu;
			} else {
				this.nav.options.items = menu;
			}
			
			if (menu.classes) {
				this.classes = "main " + menu.classes;
				this.$el.attr("class", this.classes);
			} else if (this.options.admin_menus && this.options.admin_menus[name]) {
				this.classes = "main bg-light";
				this.$el.attr("class", this.classes);
			} else {
				this.classes = "main bg-dark";
				this.$el.attr("class", this.classes);
			}
			
			this.render();
		}
	},

	showAdmin: function() {
		this.showMenu("admin");
	},

	hideAdmin: function() {
		this.showMenu("sidebar");
	},

	on_action_admin: function() {
		this.showMenu("admin");
	},

	setActivePage: function(name) {
		this.$el.find(".active").removeClass("active");
		var $active = this.$el.find('[data-showpage="' + name + '"]');
		if ($active) {
			$active.addClass("active");
			var $parent = $active.parents(".collapse");
			if ($parent) {
				$parent.addClass("show");
				var $toggle = this.$el.find('[data-bs-target="#' + $parent.attr("id") + '"]')
						.removeClass("collapsed")
						.attr("aria-expanded", "true");
			}
		}
	},

	on_menu_change: function(item) {
		this.showMenu(item.id);
	},

	on_logged_in: function() {
		this.render();
		if (this.children.groupselect) {
			this.children.groupselect.setActive(app.group);
			this.children.groupselect.setRecent(app.recent_groups);
			this.children.groupselect.collection.fetch();
		}
	},

	on_me_change: function() {
		this.render();
	},

	on_group_change: function() {
		if (this.children.groupselect) this.children.groupselect.setActive(app.group);
		if (!this.options.menu) this.on_app_ready();
		// this.children.groupselect.setRecent(app.recent_groups);
		this.render();
	},

	on_app_ready: function() {
		this.showMenu(app.getRootPath());
	},

	on_page_change: function(name) {
		if (name == "not_found") return;
		this.setActivePage(name);
		if (window.innerWidth < 720) {
			app.hideLeftPanel();
		}
	},

	on_action_show_menu: function(evt, id) {
		app.sidebar.showMenu(id);
	},

	on_action_about: function() {
		SWAM.Dialog.showForm([
				{
					label: "API URL",
					name: "api_url",
					type: "select",
					options: app.options.api_urls,
					default: app.options.api_url
				}
			], {
				title: "Select API Endpoint",
				callback: function(dlg) {
					var data = dlg.getData();
					dlg.dismiss();
					if (data.api_url != app.options.api_url) {
						app.setProperty("api_url", data.api_url);
					}
				}
			});
	},

	on_action_searchdown: function(evt) {
		app.setGroup(app.groups.get($(evt.currentTarget).data("id")));
	},

	on_rendered: function() {
		if (app.active_page) {
			this.setActivePage(app.active_page.page_name);
		}
	}

});