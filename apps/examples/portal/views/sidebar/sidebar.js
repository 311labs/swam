PORTAL.Views.SideBar = SWAM.View.extend(SWAM.Ext.BS).extend({
	classes: "main bg-dark",
	template: ".views.examples",
	defaults: {
		replaces_el: false
	},

	on_init: function() {
		app.me.on("change", this.on_me_change, this);
		app.on("page:change", this.on_page_change, this);
		app.on("group:change", this.on_group_change, this);
		this.on("rendered", this.on_rendered, this); // this avoid conflicting with post render

		this.addChild("groupselect", new SWAM.Views.SearchDown({
			collection: app.groups, 
			title:"Select Merchant",
			empty_label: "Select Merchant"
		}));
	},

	showMenu: function(name) {
		if (name == "sidebar") {
			this.template = ".views.sidebar";
			this.$el.removeClass("bg-light").addClass("bg-dark");
			this.classes = "main bg-dark";
			this.render();
		} else {
			this.template = ".views.sidebar." + name;
			this.$el.removeClass("bg-dark").addClass("bg-light");
			this.classes = "main bg-light";
			this.render();
		}

	},

	showAdmin: function() {
		this.showMenu("adminbar");
	},

	hideAdmin: function() {
		this.showMenu("sidebar");
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

	on_me_change: function() {
		this.render();
	},

	on_group_change: function() {
		this.children.groupselect.setActive(app.group);
		this.render();
	},

	on_page_change: function(name) {
		if (app.active_page.getRoute().contains("admin") ) {
			this.showAdmin();
		} else if (app.active_page.getRoute().contains("examples")) {
			this.showMenu("examples");
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