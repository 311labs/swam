
PORTAL.PortalApp = SWAM.App.extend({
	template: "<div id='panel-left'></div><div id='panel-main'><header id='title-bar'></header><div id='pages' class='has-topbar pages-absolute'></div></div><div id='panel-right'></div>",

	init_portal_ext: function() {
		this.me = new SWAM.Models.Me();
		this.me.on("logged_out", this.on_logged_out, this);
		this.me.on("logged_in", this.on_logged_in, this);
		this.groups = new SWAM.Collections.Group({size:10});
	},

	on_init_settings: function() {
		this.initViews();
		this.on_portal_ext_started();
	},

	on_portal_ext_started: function() {
		setTimeout(this.detectDevTools, 2000);

		this.options.is_ready = false;
		if (!this.options.disable_ws) {
			this.ws = new SWAM.PubSubClient();
			this.ws.on("connected", this.on_ws_connected, this);
			this.ws.on("disconnected", this.on_ws_disconnected, this);
			this.ws.on("message", this.on_ws_message, this);
		}

		// get the api version
		SWAM.Rest.GET("/api/version", {}, function(resp, status) {
			if (resp.status) {
				app.api_version = resp.data;
				if (resp.ip) app.options.public_ip = resp.ip;
				// app.getChild("panel-left").render();
			}
		});

		if (this.me.isAuthenticated()) {
			this.fetchUser();
		} else if (this.me.isOrCanAuth()) { 
			this.refreshUserToken();
		} else if (app.starting_params && app.starting_params.oauth_code) {
			// login with oauth 
			let data = {
				auth_code: app.starting_params.oauth_code,
				username: app.starting_params.username
			};

			if (app.starting_params.oauth_code) delete app.starting_params.oauth_code;
			if (app.starting_params.username) delete app.starting_params.username;

			app.starting_url = app.getPath(true) + '?' + $.param(app.starting_params);
			app.navigate(app.starting_url);

			SWAM.Rest.POST("/api/account/login", data, function(data, status){
			    app.hideBusy();
			    if (data.error) {
			        SWAM.toast("Error", data.error, "error");
			    } else {
			        app.me.setJWT(data.data);
			        if (app.me.isAuthenticated()) {
			            app.on_logged_in();
			            // app.loadRoute(this.starting_url);
			        }
			    }
			}.bind(this), {timeout: 15});
		} else if (this.starting_params.auth_code) {
			app.showPage("register", this.starting_params);
		} else {
			this.showPage("login");
		}
	},


	on_logged_in: function() {
		this.me.fetch(this.on_logged_in_ready.bind(this));
	},

	on_ms_ready: function() {
		this.active_page = null;
		if (this.starting_url == "login") this.starting_url = null;
		this.on_ready(this.starting_url);
	},

	on_logged_in_ready: function() {
		if (!this.options.disable_ws) {
			this.ws.connect();
		}
		
		// check if there is a group is the url params?
		// check if we have an active group already stored
		var username = this.me.get("username");
		var active_username = this.getProperty("active_username");
		var group = null;
		app.recent_groups = [];
		if (username == active_username) {
			group = this.getPropertyModel(SWAM.Models.Group, "active_group");
			app.recent_groups = this.getObject("recent_groups", []);
		} else {
			this.setProperty("active_username", username);
		}
		
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
				} else {
					this.on_ms_ready();
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

		if (app.me.requires_totp() && !app.me.totp_ready()) {
			this.configureTOTP();
		}
	},

	configureTOTP: function() {
		SWAM.Rest.GET(
			"/api/account/totp/qrcode", 
			{
				format:"base64",
				force_reset:true
			}, 
			function(data, status, xhr){
				this.on_configureTOTP(data.content);
			}.bind(this));
	},

	on_configureTOTP: function(totp_image) {
		SWAM.Dialog.show({
			title: "Setup MFA", 
			view: new SWAM.View({
				template:"portal_ext.pages.admin.users.totp",
				totp_image: totp_image
			}),
			can_dismiss: false,
			buttons: [
				{
					label: "Verify",
					action: "choice"
				}
			],
			callback: function(dlg, choice){
				let data = dlg.getData();
				if (data.totp_value.length != 6) {
					SWAM.toast("MFA Error", "Invalid Length", "danger", 3000, true);
					return;
				}
				app.showBusy();
				app.me.verifyTOTP(data.totp_value, function(resp, status, xhr) {
					app.hideBusy();
					if (resp.status) {
						dlg.dismiss()
						SWAM.toast("MFA Ready", "Thank You!", "success", 3000, true);
					} else {
						SWAM.toast("MFA Error", resp.error, "danger", 3000, true);
					}
					console.log(resp);
				});
			}.bind(this)
		});
	},

	setGroup: function(group, no_) {
		var old_group = this.group;
		if (_.isString(group) || _.isNumber(group)) {
			var id = parseInt(group);
			group = this.groups.get(id);
			if (!group) {
				this.group = new SWAM.Models.Group({id:id});
				this.group.fetch(function(model, resp){
					if (resp.status) {
						this.fetchMS();
					} else {
						// SWAM.Dialog.warning("Permission Denied", "You do not have access to this group.  Please check with your administrator.");
						app.showPage("denied", {denied_group: id});
					}
				}.bind(this));
				this.wsChangeGroup(old_group);
			} else {
				this.group = group;
				if (this.options.fetch_detailed_group) {
					group.params.graph = "detailed";
					group.fetch();
				}
				this.fetchMS();
			}
		} else if (!group) {
			this.group = null;
			this.setProperty("active_group", null);
			this.trigger("group:change", {group:null});
			if (!this.options.is_ready) this.on_ready();
			if (old_group && this.ws) this.ws.unsubscribe("group", old_group.id);
		} else {
			if (this.group != group) {
				this.group = group;
				this.setProperty("active_group", group);
				// do not trigger until we fetch our membership
				if (this.options.fetch_detailed_group) {
					this.group.params.graph = "detailed";
					this.group.fetch();
				} else {
					this.group.fetchIfStale();
				}
				this.fetchMS();
				this.wsChangeGroup(old_group);
			}
		}

		if (group) {
			if (!app.recent_groups) app.recent_groups = [];
			if (app.recent_groups.indexOf(group.id) < 0) app.recent_groups.insertAt(group.id, 0);
			if (app.recent_groups.length > 10) app.recent_groups.pop();
			app.setProperty("recent_groups", app.recent_groups);
		}

	},

	logout: function() {
		SWAM.Dialog.yesno({title:"Confirm Logout", "message": "Are you sure you want to logout?", callback: function(dlg, choice){
			dlg.dismiss();
			console.log(choice);
			if (choice == "yes") {
				this.me.logout();
				this.me.clear();
				this.options.is_ready = false;
				if (app.group) {
					app.group.clear();
					app.group = null;
				}
				if (app.groups) {
					app.groups.reset();
				}
				if (this.ws) {
					this.ws.close();
				}
				this.showPage("login");
			}
		}.bind(this)})
	},

	on_logged_out: function() {
		this.getChild("title-bar").render();
		this.hideLeftPanel();
	},

	wsChangeGroup: function(old_group) {
		if (this.ws && this.ws.is_auth) {
			if (old_group) {
				this.ws.unsubscribe("group", old_group.id);
				_.delay(this.ws.subscribe.bind(this.ws), 500, "group", app.group.id);
			} else {
				this.ws.subscribe("group", app.group.id);
			}
		}
	},

	fetchMS: function() {
		app.group.fetchMembership(function(model, resp){
			if (!app.options.is_ready) app.on_ms_ready();
			if (resp.status) {
				app.trigger("group:change", {group:app.group});
			} else {
				if (app.me.hasPerm(["sys.manage_users", "sys.view_all_groups", "sys.manage_groups"])) {
					app.trigger("group:change", {group:app.group});
				} else {
					app.showPage("denied", {denied_group:app.group.id});
				}
			}
		});
	},

	fetchUser: function() {
		this.me.fetch(function(model, resp) {
			if (resp.status) {
				this.on_logged_in();
				// this.on_ready();
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
				SWAM.toast("AUTH FAILURE", resp.error, "danager", 10000);
				if (!resp.network_error && !app.me.isAuthenticated()) {
					this.trigger("auth_fail", this.me);
					this.showPage("login");
				} else if (app.me.isAuthenticated()) {
					this.on_ready();
				}
			}
		}.bind(this));
	},

	refreshIncidentBadge: function() {
		SWAM.Rest.GET(
			"/api/incident/incident",
			{format:"summary", state:0},
			function(data, status){
				if (data.data && data.data.count) {
					app.getChild("title-bar").setBadge("incidents", data.data.count);
				}
			});
	},

	showLegalDisclaimer: function() {

	},

	on_window_blur: function(evt) {
	    this.has_focus = false;
	    this.trigger("background");
	    setTimeout(this.detectDevTools, 1500);
	},

	detectDevTools: function() {
		let dt_detected = window.isDevToolsOpen();
		if (dt_detected) {
			if (!app.dev_tools_detected) {
				app.dev_tools_detected = true;
				app.showLegalDisclaimer();
				if (app.me && app.me.get("username")) {
					let username = app.me.get("username");
					app.reportIncident(
						"devtools",
						`${username} is using Browser DevTools`,
						`${username} is using Browser DevTools\n${navigator.userAgent}`,
						3,
						true);
				} else {
					app.reportIncident(
						"devtools",
						"Browser DevTools Usage Detected",
						`Browser DevTools Usage Detected\n${navigator.userAgent}`,
						3,
						true);
				}
			}
		} else {
			app.dev_tools_detected = false;
		}
	},

	on_sync: function(evt) {
		this.detectDevTools();
		if (!app.me) return;
		if (app.isActivePage(["login", "register"])) return;
		if (app.me.isAuthExpiring()) {
			app.showBusy({icon:"lock"});
			app.me.stopAutoJwtRefresh();
			app.me.refreshJWT(function(model, resp) {
				app.hideBusy();
				if (!resp.status) {
					if (!resp.network_error) {
						SWAM.toast("Logged Out", "The user is no longer authenticated", "warning", 20000);
						app.showPage("login");
					} else {
						SWAM.toast("Network Issue", "Problems connecting to server!", "warning", 0);
					}

				}
			});
		} else if (this.options.fetch_on_focus && (evt.age > this.options.fetch_on_focus)) {
			app.showBusy({icon:"lock"});
			app.me.fetch(function(model, resp) {
				if (!resp.status) {
					app.me.refreshJWT(function(model, resp) {
						app.hideBusy();
						if (!resp.status) {
							if (!resp.network_error) {
								SWAM.toast("Logged Out", "The user is no longer authenticated", "warning", 20000);
								app.showPage("login");
							} else {
								SWAM.toast("Network Issue", "Problems connecting to server!", "warning", 0);
							}
						}
					});
				} else {
					app.hideBusy();
				}
			});
		}
	},

	setActiveMenu: function(name) {
		app.getChild("panel-left").showMenu(name);
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
		} else if (msg.name == "unsubscribed") {
			console.log("unsubscribed");
		} else if (msg.channel == "group") {
			this.on_ws_group_event(msg);
		} else if (msg.channel == "user") {
			if (msg.message.name == "message") {
				SWAM.toast(SWAM.renderString("Message from {{message.from.display_name}}", msg), msg.message.message, null, 20000);
			}
		} else {
			let fname = `on_ws_channel_${msg.channel}`;
			if (_.isFunction(this[fname])) {
				this[fname](msg);
			}
		}
	},

	on_ws_subscription: function(msg) {
		// successul subscription
		if (msg.channel == "user") {
			// this means we have authenticated
			this.on_ws_authenticated(msg);
		} else if (msg.channel == "incident") {
			this.refreshIncidentBadge();
		}
	},

	on_ws_authenticated: function() {
		// let us subscribe to the active group if one exists
		this.ws.is_auth = true;
		if (app.group) {
			this.ws.subscribe("group", app.group.id);
		}

		if (app.me.hasSetting("notify.incident_alerts")) {
			this.ws.subscribe("incident", "all");
		}
	},

	on_ws_group_event: function(msg) {
		// successul subscription
		evt = msg.message;
		this.trigger("group_event", evt);
		if (app.active_page.on_ws_group_event) app.active_page.on_ws_group_event(evt);
	},

	on_ws_channel_incident: function(msg) {
		let title = `New Incident #${msg.message.pk}`;
		let body = SWAM.renderTemplate(
			"portal_ext.views.incident.toast",
			{message:msg.message});
		setTimeout(function(){
			Toast.create({
				title: title, 
				message: body,
				status: TOAST_STATUS["danger"],
				timeout: 10000,
				on_click: function(evt, t, opts) {
					app.showPage("incidents", {url_params:{incident:msg.message.pk}});
				}
			});
		}, 100);
		this.refreshIncidentBadge();
	},

	on_uncaught_error: function(message, url, line, col, error, evt) {
		this.hideBusy();
		if (window.isDevToolsOpen()) {
			if ((evt.lineno == 1) || (evt.lineno == 0)) return; // chrome dev console bugs?
		}
		SWAM.Dialog.warning({title:"Uncaught Error", message:"<pre class='text-left'>" + error.stack + "</pre>", size:"large"});
		if (location.host.contains("localhost")) return;
		let event = new SWAM.Models.IncidentEvent();
		let stack = stackToMethods(error.stack);
		let data = {
			level: 3,
			category: "uncaught_error",
			description:`Uncaught Error: '${error.message}'`,
			details: `Uncaught error:\n${error.message}\n${stack}\n`,
			metadata: {
				version: app.version,
				name: app.options.title,
				app_url: location.href,
				api_url: app.options.api_url,
				browser_id: window.getBrowserUID(),
				stack: error.stack,
				error: error.message,
				col: col,
				line: line,
				user_agent: navigator.userAgent,
				error_url: url
			}
		};
		if (app.me && app.me.get("username")) {
			data.metadata.username = app.me.get("username");
			data.component = "account.Member";
			data.component_id = app.me.id;
		}
		if (app.active_page && app.active_page.page_name) data.metadata.page = app.active_page.page_name;
		event.save(data);
		return false;
	},

	reportIncident: function(category, description, details, level, ip_lookup, extra, group, callback) {
		// if (app.options.api_url.contains("localhost")) return;
		let event = new SWAM.Models.IncidentEvent();
		let buid = window.getBrowserUID();
		let data = {
			level: level,
			category: category,
			description: description,
			details: details,
			ip_lookup: ip_lookup,
			group: group,
			metadata: {
				version: app.version,
				name: app.options.title,
				app_url: location.href,
				api_url: app.options.api_url,
				user_agent: navigator.userAgent,
				browser_id: buid
			}
		};
		if (extra) _.extend(data.metadata, extra);
		if (app.me && app.me.id) {
			data.metadata.username = app.me.get("username");
			data.component = "account.Member";
			data.component_id = app.me.id;
		}
		if (!data.metadata.page && app.active_page && app.active_page.page_name) data.metadata.page = app.active_page.page_name;
		event.save(data, callback);
	},

	on_action_change_password: function(evt) {
        SWAM.Dialog.editModel(app.me, {
        	title:"Change Password",
        	fields: [
	        	{
	        		label: "Old Password",
	        		name: "oldpassword",
	        		type: "password",
	        		can_view: true
	        	},
	        	{
	        		label: "New Password",
	        		name: "newpassword",
	        		type: "password",
	        		can_view: true
	        	},
        	],
        	callback:function(model, resp){
	            if (resp.status) {
	                SWAM.toast("Profile Saved", "Your profile succesfully updated");
	            } else {
	            	SWAM.Dialog.warning(resp.error);
	            }
        	}.bind(this)}
        );
	},

});