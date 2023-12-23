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
		group_menu_name: "default",
		default_group_page: null,
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
		let has_changed = (this.options.active_menu_name != name)
		this.options.active_menu_name = name;
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

			if (_.isArray(menu.menu)) {
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
			this.trigger("menu:change", this);
		}
	},

	hasAdminMenus: function() {
		return (_.isArray(this.getAdminMenus()) && (this._admin_menus.length > 0));
	},

	getAdminMenus: function() {
		if (this.options.admin_menus && (this._admin_menus == undefined)) {
			let admin_menus = [];
			_.each(this.options.admin_menus, function(menu){
				if ((menu.requires_perm) && (!app.me.hasPerm(menu.requires_perm))) return;
				if (menu.action == undefined) menu.action = "show_menu";
				admin_menus.push(menu);
			})
			this._admin_menus = admin_menus;
		}
		return this._admin_menus;
	},

	setMenuItems: function(items) {
		this.nav.options.items = items;
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
		let $active;
		if (this.options.active_menu && this.options.active_menu.match_on_id) {
			$active = this.on_match_on_id(name);
		} else {
			$active = this.on_match_on_page(name);
		}

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

	on_match_on_page: function(name) {
		var $active = this.$el.find('[data-showpage="' + name + '"]');
		if ($active.length) {
			if ($active.length > 1) {
				$active = $active.first();
			}
		}
		return $active;
	},

	on_match_on_id: function(name) {
		let page = app.getPage(name);
		console.log("on_match_on_id");
		console.log(page.page_name);
		console.log(page.page_id);
		if (page && page.page_id) {
			return this.$el.find('[data-id="' + page.page_id + '"]');
		}
		return null;
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
		} else {
			if (this.options.menu_by_url) {
				// this will check to make sure we are in right menu
				let root = app.getRootPath();
				let is_root = ((root == "admin")&&(this.options.active_menu_name != root)) 
				if (is_root || (this.options.menus[root] && (this.options.active_menu_name != root))) {
					this.showMenu(root);
				}
			}
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
					editable: true,
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

	findMenu: function(page_name, menu) {
		return _.find(menu, function(item){
			if (item.page == page_name) return true;
			if (item.items) {
				let sub_menu = this.findMenu(page_name, item.items);
				if (sub_menu) return true;
			}
			return false;
		}.bind(this));
	},

	getPageMenu: function(page_name) {
		let menu_items = null; 
		if (this.options.menu) {
			menu_items = this.options.menu;
			if (menu_items.menu) menu_items = menu_items.menu;
			let menu = this.findMenu(page_name, menu_items);
			if (menu) return "default";
		}

		if (this.options.menus) {
			let name = null;
			let result = _.find(this.options.menus, function(menu, menu_name) {
				menu_items = menu;
				if (menu_items.menu) menu_items = menu_items.menu;
				let smenu = this.findMenu(page_name, menu_items);
				name = menu_name;
				return smenu != null;

			}.bind(this));
			if (result) return name;
		}

		if (this.options.admin_menu) {
			menu_items = this.options.admin_menu;
			if (menu_items.menu) menu_items = menu_items.menu;
			let menu = this.findMenu(page_name, menu_items);
			if (menu) return "admin";
		}
		return null;
	},

	on_action_searchdown: function(evt) {
		let group = app.groups.get($(evt.currentTarget).data("id"));
		if (!this.options.default_group_page) {
			app.setGroup(group);
			return;
		}

		let menu_name = this.getPageMenu(app.active_page.page_name);
		if (menu_name != this.options.group_menu_name) {
			// side bar hack for not double loading
			app.group = group;
			app.setActivePage(this.options.default_group_page);
			window.sleep(500).then(function() {
				app.group = null;
				app.setGroup(group);
			});
		} else {
			app.setGroup(group);
		}
	},

	showBusy: function() {
	    this.busy_dlg = SWAM.Dialog.showLoading({
	        parent:this.$el
	    });
	},

	hideBusy: function() {
	    if (this.busy_dlg) {
	        this.busy_dlg.removeFromDOM();
	        this.busy_dlg = null;
	    }
	},

	on_rendered: function() {
		if (app.active_page) {
			this.setActivePage(app.active_page.page_name);
		}
	}

});