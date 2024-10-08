SWAM.Views.TopBar = SWAM.View.extend({
	classes: "swam-topbar",
	template: "swam.ext.nav.topbar",
	tagName: "header",
	defaults: {
		replaces_el: true,
		show_usermenu: true,
		watch_scroll_anchor: true,
		auto_sick: true,
		has_sidebar: false,
		nav_menu: [],
		logo_height: 24,
		container_class: "container-fluid",
		navbar_classes: "navbar-dark",
		user_menu_template: "swam.ext.nav.topbar.usermenu",
		user_menu: [
			{
				icon: "key",
				label: "Change Password",
				action: "change_password"
			},
			{
				icon: "pencil",
				label: "Edit Profile",
				action: "edit_profile"
			}
		]
	},

	on_init: function() {
		if (app.me) app.me.on("change", this.render, this);
		if (this.options.nav_menu) {
			this.addChild(
				"nav_menu",
				 new SWAM.Views.Nav({
				 	classes: "navbar-nav me-auto",
				 	replaces_el:true, 
				 	items:this.options.nav_menu}));
		}

		if (this.options.show_usermenu) {
			this.user_dropdown = new SWAM.View({
				classes: "dropdown ms-3 h-100",
				user_menu: this.filterUserMenu(),
				template: this.options.user_menu_template});
			if (!this.options.right_nav) this.options.right_nav = [];
			this.options.right_nav.push({
				type: "view",
				view: this.user_dropdown
			})
		}
		if (_.isArray(this.options.right_nav)) {
			this.addChild(
				"right_nav",
				new SWAM.Views.Nav({
					classes: "navbar-nav ms-auto",
					replaces_el:true, 
					items:this.options.right_nav})
			);
		}
	},

	setBadge: function(id, value, no_render) {
		let item = _.findWhere(this.options.right_nav, {"id":id});
		if (item) {
			item.badge = value;
			let $b = this.$el.find(`#badge_${id}`);
			if ($b.length) {
				$b.text(value);
			} else {
				if (!no_render) this.render();
			}
		}
	},

	on_action_logout: function(evt) {
		app.logout();
	},

	on_action_admin: function(evt) {
		app.sidebar.showMenu("adminbar");
	},

	on_action_edit_profile: function(evt) {
        SWAM.Dialog.editModel(app.me, {title:"Edit Profile", callback:function(model, resp){
            if (resp.status) {
                SWAM.toast("Profile Saved", "Your profile succesfully updated");
            }
        }.bind(this)});
	},

	on_action_toggle_sidebar: function() {
		app.toggleLeftPanel();
	},

	on_page_change: function(name) {
		var show_details = (name == "home");
		if (this.options.show_details != show_details) {
			this.options.show_details = show_details;
			this.render();
		}
	},

	on_watch_scroll_stick: function(evt) {
		if (!this.options.sticked && (window.scrollY > 0)) {
			app.$el.addClass("sticked");
			this.options.sticked = true;
		} else if (this.options.sticked) {
			if (window.scrollY <= 2) {
				this.options.sticked = false;
				app.$el.removeClass("sticked");
			}
		} 
	},

	on_watch_scroll_anchor: function(evt) {
		var active_id = this.options.active_id;
		var last_offset = null;
		var scroll_pos = window.document.documentElement.scrollTop;
		// scroll spy
		this.$el.find("ul.scrollspy a").each(function(){
			var anchor = $(this).data("anchor");
			if (!anchor) {
				anchor = $(this).data("href");
				if (!anchor || (anchor[0] != "#")) return;
				anchor = anchor.substr(1);
			}
			var el = document.getElementById(anchor);
			if (el) {
				var delta = el.offsetTop - scroll_pos;
				if (delta < 200) {
					delta = Math.abs(delta);
					if (last_offset == null) {
						last_offset = delta;
					}
					if (delta <= last_offset) {
						last_offset = delta;
						active_id = anchor;
					}
				}
			}
		});
		if (active_id && (this.options.active_id != active_id)) {
			this.setActive(active_id);
		}
	},

	on_scroll_spy: function(evt) {
		if (this.options.auto_sick) this.on_watch_scroll_stick(evt);
		if (this.options.watch_scroll_anchor) this.on_watch_scroll_anchor(evt);
		if (this.on_scroll) this.on_scroll(evt);
	},

	enableScrollSpy: function() {
		if (!this.bound_scroll_spy) this.bound_scroll_spy = this.on_scroll_spy.bind(this);
		window.addEventListener("scroll", this.bound_scroll_spy);
		this.on_scroll_spy();
	},

	disableScrollSpy: function() {
		if (this.bound_scroll_spy) {
			window.removeEventListener("scroll", this.bound_scroll_spy);
		}
	},

	filterUserMenu: function() {
		let user_menu = [];
		_.each(this.options.user_menu, function(value, index){
			if ((value.requires_perm) && (!app.me.hasPerm(value.requires_perm))) return;
			user_menu.push(value);
		});
		return user_menu;
	},

	setActive: function(id) {
		console.log("active menu: " + id);
		this.options.active_id = id;
		this.$el.find("a.nav-link.active").removeClass("active");
		this.$el.find("a[data-anchor='" + id + "']").addClass("active");
	},

	on_pre_render: function() {
		if (this.user_dropdown) {
			this.user_dropdown.options.user_menu = this.filterUserMenu();
		}
	}
});

