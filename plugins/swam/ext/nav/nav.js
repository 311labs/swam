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
		if (menu.group_kind) {
			if (!app.group || !app.group.isKind(menu.group_kind)) return;
		}
		if (menu.group_setting) {
			if (!app.group || !app.group.checkSetting(menu.group_setting)) return;
		}
		if (menu.requires_perm) {
			if (!app.me || !app.me.isAuthed()) return;
			if (!app.me.hasPerm(menu.requires_perm)) return;
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
	classes: "nav-item position-relative",
	template: "swam.ext.nav.item",

	defaults: {
		link_classes: "nav-link",
		dropdown_autoclose: "true"
	},

	events: {
		"show.bs.dropdown": "on_dropdown_show",
		"hide.bs.dropdown": "on_dropdown_hide"
	},

	on_dropdown_show: function(evt) {
		if (this.options.view && this.options.view.on_shown) {
			evt.nav_item = this;
			this.options.view.on_shown(evt);
		} 
	},

	on_dropdown_hide: function(evt) {
		if (this.options.view && this.options.view.on_dismiss) {
			evt.nav_item = this;
			this.options.view.on_dismiss(evt);
		} 
	},

	get_tooltip: function() {
		// hack because mustache is having hard time parsing inside elements
		if (!this.options.tooltip) return null;
		return 'data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="' + this.options.tooltip + '"';
	},

	on_init: function() {
		if (this.options.template) {
			
		} else if (this.options.type == "dropdown") {
			this.options.has_dropmenu = true;
			var classes = "dropdown-menu p-2 shadow";
			if (this.options.is_dark) classes += " dropdown-menu-dark";
			if (this.options.align && this.options.align != "center") {
				classes += " dropdown-menu-" + this.options.align;
				this.addClass("dropdown");
			} else if (this.options.align == "center") {
				this.addClass("dropdown");
				classes += " dropdown-menu-center";
			} else {
				this.addClass("dropdown");
			}

			if (this.options.dropdown_width) {
				classes += " dropdown-menu-width-" + this.options.dropdown_width;
			}
			
			if (this.options.items) {
				this.addChild("dropmenu", new SWAM.Views.Nav({items:this.options.items, type:"dropdown_menu", classes:classes, replaces_el:true}));
			} else {
				classes += " bg-muted";
				let subview = new SWAM.View({classes:classes, replaces_el:true});
				subview.appendChild("view", this.options.view);
				this.addChild("dropmenu", subview);
			}
			
		} else if (this.options.type == "view") {
			this.appendChild("view", this.options.view);
		} else if (this.options.items) {
			this.options.has_submenu = true;
			this.addChild("submenu", new SWAM.Views.Nav({items:this.options.items, add_classes:"nav-submenu", replaces_el:true}));
		} else if (this.options.kind == "label") {
			this.template = "<label>{{#options.icon}}{{{ICON(options.icon)}}}{{/options.icon}} {{options.label}}</label>";
		} else if ((this.options.kind == "separator")||(this.options.kind == "spacer")) {
			this.template = "<hr />";
		} else if (this.options.divider) {
			this.template = "<hr />";
		}
	},

	on_post_render: function() {
		if (this.options.params) {
			let $el = this.$el.find("a").first().data("params", this.options.params);
		}
	},

});







