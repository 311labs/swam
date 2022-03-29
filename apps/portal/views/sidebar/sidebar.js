PORTAL.Views.SideBar = SWAM.View.extend(SWAM.Ext.BS).extend({
	classes: "main bg-dark",
	template: ".views.sidebar",
	defaults: {
		replaces_el: false
	},

	on_init: function() {
		app.me.on("change", this.render, this);
		app.on("page:change", this.on_page_change, this);
	},

	on_page_change: function(name) {
		this.$el.find(".active").removeClass("active");
		var $active = this.$el.find('[data-showpage="' + name + '"]');
		if ($active) {
			$active.addClass("active");
			// var $parent = $active.parents(".collapse");
			// if ($parent) {
			// 	$parent.addClass("show");
			// 	var $toggle = this.$el.find('[data-bs-target="' + $parent.attr("id") + '"]')
			// 			.removeClass("collapsed")
			// 			.attr("aria-expanded", "true");
			// }
		}
		
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
	}

});