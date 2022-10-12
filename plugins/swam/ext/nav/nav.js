SWAM.Views.Nav = SWAM.View.extend({
	tagName: "ul",
	classes: "nav nav-pills flex-column mb-auto",

	defaults: {
		auto_id: true,
	},

	events: {
		"click .nav-link-toggle": "on_submenu_expand"
	},

	on_submenu_expand: function(evt) {
		if (this.options.only_one) {
			this.$el.find("div.collapse.show").each(function(obj){
				if (evt.currentTarget != this) {
					$(this).collapse("hide");
				}
			});
		}
	},

	render_menu: function(menu) {
		if (this.options.type == "dropdown_menu") {
			menu.link_classes = "dropdown-item";
		}
		var view = new SWAM.Views.NavItem(menu);
		view.options.nav = this;
		this.appendChild(view);
	},

	on_render: function() {
		this.empty();
		_.each(this.options.items, function(menu){
			this.render_menu(menu);
		}.bind(this));
	}

});

SWAM.Views.NavItem = SWAM.View.extend({
	tagName: "li",
	classes: "nav-item",
	template: "swam.ext.nav.item",

	defaults: {
		link_classes: "nav-link",
	},

	get_tooltip: function() {
		// hack because mustache is having hard time parsing inside elements
		if (!this.options.tooltip) return null;
		return 'data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="' + this.options.tooltip + '"';
	},

	on_init: function() {
		if (this.options.type == "dropdown") {
			this.options.has_dropmenu = true;
			var classes = "dropdown-menu p-2";
			if (this.options.is_dark) classes += " dropdown-menu-dark";
			this.addClass("dropdown");
			this.addChild("dropmenu", new SWAM.Views.Nav({items:this.options.items, type:"dropdown_menu", classes:classes, replaces_el:true}));
		} else if (this.options.items) {
			this.options.has_submenu = true;
			this.addChild("submenu", new SWAM.Views.Nav({items:this.options.items, add_classes:"nav-submenu", replaces_el:true}));
		} else if (this.options.kind == "label") {
			this.template = "<label>{{#options.icon}}{{{ICON(options.icon)}}}{{/options.icon}} {{options.label}}</label>";
		} else if ((this.options.kind == "separator")||(this.options.kind == "spacer")) {
			this.template = "<hr />";
		}
	},

});







