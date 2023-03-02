
PORTAL.PortalApp = SWAM.App.extend({

	init_portal_ext: function() {
		this.me = new SWAM.Models.Me();
		this.me.on("logged_out", this.on_logged_out, this);
		this.me.on("logged_in", this.on_logged_in, this);
		this.groups = new SWAM.Collections.Group({size:10});
	},

	on_started: function() {
		Toast.setTheme(TOAST_THEME.DARK);

		this.ws = new SWAM.PubSubClient();
		this.ws.on("connected", this.on_ws_connected, this);
		this.ws.on("disconnected", this.on_ws_disconnected, this);
		this.ws.on("message", this.on_ws_message, this);

		// get the api version
		SWAM.Rest.GET("/rpc/version", {}, function(resp, status) {
			if (resp.status) {
				app.api_version = resp.data;
				app.getChild("panel-left").render();
			}
		});

		if (this.me.isAuthenticated()) {
			this.fetchUser();
		} else if (this.me.isOrCanAuth()) { 
			this.refreshUserToken();
		} else if (this.starting_url.contains("auth_code=")) {
			app.showPage("register", window.decodeSearchParams(this.starting_url));
		} else {
			this.showPage("login");
		}
	},


	on_logged_in: function() {
		this.me.fetchIfStale();
		this.ws.connect();

		// check if there is a group is the url params?
		// check if we have an active group already stored
		var group = this.getPropertyModel(SWAM.Models.Group, "active_group");
		if (this.starting_params && this.starting_params.group) {
			if (group && (group.id == this.starting_params.group)) {
				this.setGroup(group);
			} else {
				this.setGroup(this.starting_params.group);
			}
		} else if (!group) {
			// no active group lets get the first in the list and default to that
			this.showBusy({icon:"download", color:"success", no_timeout_alert:true});
			this.groups.fetch(function(){
				this.hideBusy();
				if (this.groups.length) {
					// set the first one has active
					this.setGroup(this.groups.getAt(0));
				}
			}.bind(this));
		} else {
			// we have an active group lets refresh it
			this.setGroup(group);
		}

		this.getChild("title-bar").render();
		if (window.innerWidth > 720) {
			this.showLeftPanel();
		} else {
			this.hideLeftPanel();
		}
	},

	setGroup: function(group, no_) {
		var old_group = this.group;
		if (_.isString(group) || _.isNumber(group)) {
			var id = parseInt(group);
			group = this.groups.get(id);
			if (!group) {
				this.group = new SWAM.Models.Group({id:id});
				this.group.fetch(function(){
					this.fetchMS();
				}.bind(this));
				this.wsChangeGroup(old_group);
			} else {
				this.group = group;
				this.fetchMS();
			}
		} else if (!group) {
			this.group = null;
			this.setProperty("active_group", null);
			this.trigger("group:change", {group:null});
			if (old_group) this.ws.unsubscribe("group", old_group.id);
		} else {
			this.group = group;
			this.setProperty("active_group", group);
			// do not trigger until we fetch our membership
			this.fetchMS();
			this.wsChangeGroup(old_group);
		}

	},

	logout: function() {
		SWAM.Dialog.yesno({title:"Confirm Logout", "message": "Are you sure you want to logout?", callback: function(dlg, choice){
			dlg.dismiss();
			console.log(choice);
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

	wsChangeGroup: function(old_group) {
		if (this.ws.is_auth) {
			if (old_group) {
				this.ws.unsubscribe("group", old_group.id);
				_.delay(this.ws.subscribe.bind(this.ws), 500, "group", app.group.id);
			} else {
				this.ws.subscribe("group", app.group.id);
			}
		}
	},

	fetchMS: function() {
		app.group.fetchMembership(function(){
			app.trigger("group:change", {group:app.group});
		});
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

	on_sync: function(evt) {
		if (!app.me) return;
		if (app.isActivePage(["login", "register"])) return;
		if (app.me.isAuthExpiring()) {
			app.showBusy({icon:"lock"});
			app.me.stopAutoJwtRefresh();
			app.me.refreshJWT(function(model, resp) {
				app.hideBusy();
				if (!resp.status) {
					SWAM.toast("Logged Out", "The user is no longer authenticated", "warning", 20000);
					app.showPage("login");
				}
			});
		} else if (evt.age > 30000) {
			app.showBusy({icon:"lock"});
			app.me.fetch(function(model, resp) {
				if (!resp.status) {
					app.me.refreshJWT(function(model, resp) {
						app.hideBusy();
						if (!resp.status) {
							SWAM.toast("Logged Out", "The user is no longer authenticated", 20000);
							app.showPage("login");
						}
					});
				} else {
					app.hideBusy();
				}
			});
		}
	},


	on_ws_connected: function() {

	},

	on_ws_disconnected: function() {
		this.ws.is_auth = false;
	},

	on_ws_message: function(msg) {
		if (msg.name == "subscribed") {
			// this means we have authed
			this.on_ws_subscription(msg);
			return;
		} else if (msg.channel == "group") {
			this.on_ws_group_event(msg);
		} else if (msg.channel == "user") {
			if (msg.message.name == "message") {
				SWAM.toast(SWAM.renderString("Message from {{message.from.display_name}}", msg), msg.message.message, null, 20000);
			}
		}
	},

	on_ws_subscription: function(msg) {
		// successul subscription
		if (msg.channel == "user") {
			// this means we have authenticated
			this.on_ws_authenticated(msg);
		}
	},

	on_ws_authenticated: function() {
		// let us subscribe to the active group if one exists
		this.ws.is_auth = true;
		if (app.group) {
			this.ws.subscribe("group", app.group.id);
		}
	},

	on_ws_group_event: function(msg) {
		// successul subscription
		evt = msg.message;
		this.trigger("group_event", evt);
	},

});