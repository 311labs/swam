PORTAL.Views.SideBar = SWAM.View.extend({
	classes: "main bg-dark",
	template: ".views.sidebar",
	defaults: {
		replaces_el: false
	},

	on_init: function() {
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

	on_action_logout: function(evt) {
		app.logout();
	}

});