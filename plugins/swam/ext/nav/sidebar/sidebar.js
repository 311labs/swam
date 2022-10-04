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
		menu: [
			{
				label: "Dashboard",
				icon: "bi bi-speedometer2",
				page: "dashboard"
			}
		],
		admin_menu: [
			{
				label: "Admin Dashboard",
				icon: "bi bi-speedometer2",
				page: "admin_dashboard"
			}
		],
		menu_select: false,
		menu_select_items: [],
	},

	on_init: function() {
		app.me.on("change", this.on_me_change, this);
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
			this.template = "swam.ext.nav.sidebar.sidebar";;
			this.$el.removeClass("bg-light").addClass("bg-dark");
			this.classes = "main bg-dark";
			if (this.options.menus && this.options.menus[name]) {
				this.nav.options.items = this.options.menus[name];
			} else {
				this.nav.options.items = this.options.menu;
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
				var $toggle = this.$el.find('[data-bs-target="' + $parent.attr("id") + '"]')
						.removeClass("collapsed")
						.attr("aria-expanded", "true");
			}
		}
	},

	on_menu_change: function(item) {
		this.showMenu(item.id);
	},

	on_me_change: function() {
		this.render();
	},

	on_group_change: function() {
		this.children.groupselect.setActive(app.group);
		this.render();
	},

	on_page_change: function(name) {
		if (name == "not_found") return;
		if (app.active_page.getRoute().contains("admin") ) {
			this.showAdmin();
		} else {
			this.hideAdmin();
		}
		this.setActivePage(name);
	},

	on_action_merchant_menu: function() {
		app.sidebar.showMenu("sidebar");
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