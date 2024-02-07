

SWAM.App = SWAM.View.extend(SWAM.TouchExtension).extend(SWAM.StorageExtension).extend({
    template: "<div id='panel-left'></div><div id='panel-main'><header id='title-bar'></header><div id='pages' class='has-topbar pages-absolute'></div></div>",
    _pages: {},
    active_page: null,
    started: false,
    icons: SWAM.Icons,
    defaults: {
        title: "Put Title in app.defaults",
        root: "/",
        page_el_id: "#pages",
        enable_swipe: false,
        navigation: true, // set this to false to not using an url based navigation (ie mobile apps)
        catch_errors: true, // catch and show popup for uncaught errors
        sync_debounce_ms: 5000,
        toast_placement: "top_right",
        track_page_views: false,
        toast_theme: "dark",
        dialog_theme: "modal-brand",
        allow_webauthn: false,
        allow_google_login: false,
        google_client_id: null,
        login_title: null,
        login_logo: "/plugins/media/logos/login_logo_purple.svg",
        send_buid: true // sends a __buid__ with every requires to the server, this is a browser id
    },
    on_init: function() {
        // turn on smart parameter parsing ('sss', 22, model.name) where model.name value is passed into localize
        if (window.Mustache) {
            window.Mustache.smart_params = 1;
            window.Mustache.smart_params_require_quotes = 0;
        }
        if (this.options.enable_swipe) this.enableTouch();
        this.on("property:change", this.on_prop_change, this);
        this.initWindowEvents();
        this.on_init_session_key();
        this.setToastGlobals({placement: this.options.toast_placement, theme: this.options.toast_theme});
    },

    on_init_session_key: function() {
        // these are only used for non secure session keys, no auth
        SWAM.Rest.session_key = this.getProperty("tmp_session_key");
        if (!SWAM.Rest.session_key) {
            if (window.crypto && window.crypto.randomUUID) {
                SWAM.Rest.session_key = crypto.randomUUID();
            } else {
                SWAM.Rest.session_key = String.Random(64);
            }
            this.setProperty("tmp_session_key", SWAM.Rest.session_key);
        }
    },

    on_prop_change: function(evt) {
        // console.log("on_prop_change");
        // console.log(evt);
        if (_.isFunction(this["on_prop_" + evt.key])) this["on_prop_" + evt.key](evt.value);
    },
    on_route: function(view, params) {
        // console.log(params);
        view.on_route.apply(view, params);
    },
    addPage: function(name, view, routes) {
        if (!view.getRoute) {
            alert("Unable to add page: " + name + "!   Most likely it is not have type SWAM.Page");
            return;
        }
        this._pages[name] = view;
        view.page_name = name;
        view.id = "page_" + name;
        view.updateAttributes();

        if (!routes) routes = [this.root + name];
        view.routes = routes;
        this.registerRouteHandler(routes, function() {
            this.on_route(view, arguments);
        }.bind(this));
    },
    hasPage: function(name) {
        return this._pages[name] != undefined;
    },
    getPage: function(name) {
        return this._pages[name];
    },
    showPage: function(name, params, anchor) {
        this.setActivePage(name, params, anchor);
    },
    setActivePage: function(name, params, anchor) {
        var page = this._pages[name];
        var $parent = this.$el.find(this.options.page_el_id);
        if ($parent.length == 0) {
            // the page container could not be found
            console.log("page container could not be found!");
            return;
        }

        if (page) {
            if (page == this.active_page) {
                page.setParams(params);
                if (!page.isInDOM()) {
                    $parent.empty();
                    page.addToDOM($parent);
                } else {
                    // page.render();
                    if (anchor) page.scrollToAnchor(anchor);
                    page.on_page_reenter();
                    page.updateURL();
                }
                return;
            }
            if (page.options.requires_perm) {
                if (!app.me || !app.me.hasPerm(page.options.requires_perm)) {
                    this.setActivePage("denied", {denied_page: page}); 
                    return;
                }
            }
            if (this.active_page) {
                page._prev_page = this.active_page;
                this.active_page.removeFromDOM();
                this.active_page.on_page_exit();
            }
            // check for topbar
            if (page.classes && (page.classes.indexOf("-topbar") >= 0)) {
                this.showTopBar();
            } else {
                this.hideTopBar();
            }
            console.log("active page now: " + page.page_name);
            this.active_page = page;
            if (this.options.track_page_views) SWAM.Metrics.trackView(page.page_name, true)
            $parent.empty();
            page.setParams(params);
            page.on_page_pre_enter();
            page.addToDOM($parent);
            page.updateURL();
            if (window.scrollY > 0) {
                setTimeout(function(){ window.scrollTo(0, 0); }, 100);
            }
            $parent[0].scrollTop = 0; // force the new page to show from top scroll
            page.on_page_enter();
            if (anchor) page.scrollToAnchor(anchor);
            this.trigger("page:change", name);
            if (!this.started) {
                this.start();
            }
        } else {
            console.warn("invalid page: " + name);
            if (this.hasPage("not_found")) {
                this.setActivePage("not_found", {invalid_page: name}); 
            } else if (this.options.not_found && (this.options.not_found != name)) {
                this.setActivePage(this.options.not_found, {invalid_page: name}); 
            } else {
                SWAM.Dialog.show({title:"Page Not Found", message:"Oops, the page " + name + " could not be found!"});
            }
        }

    },
    isActivePage: function(name) {
        if (_.isArray(name)) {
            if (!this.active_page) return false;
            return name.has(this.active_page.page_name);
        }
        return this._pages[name] == this.active_page;
    },
    goBack: function() {
        if (this.active_page._prev_page) this.setActivePage(this.active_page._prev_page.page_name);
    },

    start: function() {
        if (this.options.catch_errors) this.enableErrorCatcher();
        this.loadSettings();
        this.version = window.app_version;
        this.$el = $("#app_body").attr("class", this.classes);
        this.started = true;
        this.location = window.location;
        this.history = window.history;
        this.root = this.options.root;
        window.addEventListener("popstate", this.on_pop_state);
        window.addEventListener("online", this.on_network_online.bind(this));
        window.addEventListener("offline", this.on_network_offline.bind(this));
        this.starting_url = this.getPath();
        this.starting_params = this.getSearchParams();
        if (_.isFunction(this.on_init_settings)) {
            this.on_init_settings();
        } else {
            this.initViews();
            this.on_started();
        }
    },

    loadSettings: function() {
        this.app_uuid = this.getProperty("app_uuid");
        if (!this.app_uuid) {
            // generate a unique app uuid to track this app
            if (app.device_id) {
                this.app_uuid = app.device_id;
            } else {
                this.app_uuid = String.Random(32);
            }
            this.setProperty("app_uuid", this.app_uuid);
        }
        this.options.api_url = this.getProperty("api_url", this.options.api_url);
    },

    on_prop_api_url: function(value) {
        this.options.api_url = value;
        SWAM.toast("API URL Changed", "You should probably reload!");
    },

    setToastGlobals: function(globals) {
        if (globals.placement) {
            this.options.toast_placement = globals.placement;
            Toast.setPlacement(TOAST_PLACEMENT[globals.placement.upper()]);
        }
        if (globals.theme) {
            this.options.toast_theme = globals.theme;
            Toast.setTheme(TOAST_THEME[globals.theme.upper()]);
        }
    },

    showTopBar: function() { this.$el.find("#title-bar").show(); },
    hideTopBar: function() { this.$el.find("#title-bar").hide(); },

    showLeftPanel: function(partial) {
        // to make it slide over vs shrink add class slide to body
        if (this.options.slide) this.$el.addClass("slide");
        if (partial) {
            this.$el.addClass("panel-animate").removeClass("panel-left-reveal").addClass("panel-left-reveal-partial");
        } else {
            this.$el.addClass("panel-animate").removeClass("panel-left-reveal-partial").addClass("panel-left-reveal");
        }
    },

    hideLeftPanel: function() {
        this.$el.addClass("panel-animate").removeClass("panel-left-reveal");
    },

    toggleLeftPanel: function() {
        if (this.isLeftPanelOpen()) {
            this.hideLeftPanel();
        } else {
            this.showLeftPanel();
        }

    },

    isLeftPanelOpen: function() {
        return this.$el.hasClass("panel-left-reveal");
    },

    on_swipe_begin: function(evt) {
        $("body").removeClass("panel-animate");
        this.panel_x = 0;
        if ($("body").hasClass("panel-left-reveal-partial")) {
            this.panel_x = this.panel_left_width;
        }
    },

    // called when touchend and swipe left criteria met
    on_swipe_left: function(evt) {
        console.log("app| swipe left");
        this.hideLeftPanel();
    },

    // called when touchend and swipe right criteria met
    on_swipe_right: function(evt) {
        console.log("app| swipe right");
        this.showLeftPanel();
    },

    on_init_views: function() {
        this.on_init_pages();
    },

    on_init_pages: function() {
        
    },

    initViews: function() {
        this.on_init_views();
        this.render();
    },

    on_started: function() {
        this.on_ready();
    },

    on_route_homepage: function() {
        this.setActivePage(this.options.home_page);
    },

    on_ready: function(path) {
        this.options.is_ready = true;
        this.loadRoute(path);
        if (!this.active_page) {
            let path = this.getPath();
            console.warn("failed to load starting page: " + path);
            if ((path === "") && this.options.home_page && this.hasPage(this.options.home_page)) {
                this.on_route_homepage();
            } else if (this._pages.not_found) {
                this.setActivePage("not_found", {"path":path});
            } else if (this.options.not_found) {
                this.setActivePage(this.options.not_found, {"path":path});
            }
        }
        this.triggerReady();  
        this.delegateEvents();      
    },

    triggerReady: function() {
        if (!this.options.ready_triggered) {
            this.options.ready_triggered = true;
            this.trigger("ready", this); 
        }
    },

    getPath: function(ignore_search) {
        var path = this.location.pathname;
        if (!ignore_search) {
            path = this.decodeFragment(
              this.location.pathname + this.getSearch()
            );
        }
        path = path.slice(this.root.length - 1);
        return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    getRootPath: function() {
        var path = this.getPath(true);
        return path.split('/')[0];
    },

    getSearch: function() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
    },

    getSearchParams: function() {
        var url = document.location.href;
        return window.decodeSearchParams(url);
    },

    decodeFragment: function(fragment) {
      return decodeURI(fragment.replace(/%25/g, '%2525'));
    },

    _routeToRegExp: function(route) {
      route = route.replace(SWAM.RE.escapeRegExp, '\\$&')
        .replace(SWAM.RE.optionalParam, '(?:$1)?')
        .replace(SWAM.RE.namedParam, function(match, optional) {
        return optional ? match : '([^/?]+)';
      }).replace(SWAM.RE.splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    _routes: [],

    registerRouteHandler: function(routes, handler) {

        if (!_.isArray(routes)) {
            routes = [ routes ];
        }

        _.each(routes, function(route) {
            if (!_.isRegExp(route)) re_route = this._routeToRegExp(route);
            this._routes.unshift({route:re_route, callback:handler, orig_route:route});
        }.bind(this));
    },

    on_busy_timeout: function(opts) {
        if (SWAM.active_dialog && !SWAM.active_dialog.options.no_timeout_alert) {
            SWAM.toast("Warning", "The busy indicator timed out!", "danger", 10000, true);
        }
        this.cancelBusy();
    },

    cancelBusy: function(canceled) {
        if (this._busy_info) {
            if (this._wait_timer) {
                clearTimeout(this._wait_timer);
                this._wait_timer = undefined;
                if (canceled && this._busy_info.cancel_callback) this._busy_info.cancel_callback(this._busy_info);
            }
            if (this._wait_interval) {
                clearInterval(this._wait_interval);
                this._wait_interval = undefined;
                if (canceled && this._busy_info.cancel_callback) this._busy_info.cancel_callback(this._busy_info);
            }
            this._busy_info = null;
            this.hideBusy();
        }
    },

    showBusy: function(opts) {
        options = _.extend({timeout:12000}, opts);
        this.cancelBusy();
        if (_.isNumber(options.timeout) && (options.timeout > 0)) {
            this._busy_info = options;
            this._busy_dlg = SWAM.Dialog.showLoading(options);
            this._wait_timer = setTimeout(function(evt){
                this.cancelBusy(false);
                if (options.callback) {
                    this.cancelBusy(false);
                    this.hideBusy();
                    options.callback(options);
                } else {
                    this.on_busy_timeout(options);
                }
            }.bind(this), options.timeout);
        } else if (_.isNumber(options.count_down)) {
            // this.waiting.show(options.count_down);
            // options._counter = options.count_down;
            // options.step = options.step || 1;
            // this._wait_interval = setInterval(function(){
            //     options._counter -= options.step;
            //     if (options._counter <= 0) {
            //         this.cancelBusy(false);
            //         if(this.waiting) this.waiting.hide();
            //         if (options.callback) options.callback(options);
            //     } else if (this.waiting) {
            //          this.waiting.setMessage(options._counter);
            //     } else {
            //         clearInterval(this._wait_interval);
            //     }
            // }.bind(this), 999);
        } else {
            this._busy_dlg = SWAM.Dialog.showLoading(options);
        }
    },

    hideBusy: function() {
        if (this._busy_dlg) {
            this._busy_dlg.dismiss();
            this._busy_dlg = null;
            this.cancelBusy();
        }
    },

    on_uncaught_error: function(message, url, line, col, error, evt) {
        this.hideBusy();
        if (window.isDevToolsOpen()) {
            if ((evt.lineno == 1) || (evt.lineno == 0)) return; // chrome dev console bugs?
        }
        SWAM.Dialog.warning({title:"Uncaught App Error", message:"<pre class='text-left'>" + error.stack + "</pre>", size:"large"});
        return false;
    },

    enableErrorCatcher: function() {
        if (!this._on_error_event) {
            this._on_error_event = function(e) {
                console.log("error event fired");
                console.log(e);
                if (e.error) {
                    // only handle if an error is included with event
                    return app.on_uncaught_error(e.message, e.filename, e.lineno, e.colno, e.error, e);
                }else if(e.reason) {
                    return app.on_uncaught_error(e.reason.message, e.type, 0, 0, e.reason, e);
                }
            };
        } else {
            window.removeEventListener("unhandledrejection",  this._on_error_event);
            window.removeEventListener("error", this._on_error_event);
        }
        window.addEventListener("unhandledrejection",  this._on_error_event);
        window.addEventListener("error", this._on_error_event);
    },

    loadRoute: function(path) {
        if (!this.options.navigation) return;
        if (!path) path = this.getPath();
        var parts = path.split("?");
        var route = parts[0];
        if (route.startsWith(this.options.root)) route = route.substr(this.options.root.length);
        return _.some(this._routes, function(handler) {
            if (handler.route.test(route)) {
                console.log("loadRoute: " + route);
                handler.callback(path, handler.orig_route);
                return;
            }
        })
    },

    loadPageFromURL: function() {
        this.loadRoute();
        if (!this.active_page) {
            console.warn("failed to load starting page: " + this.getPath());
            if (this._pages.not_found) {
                this.setActivePage("not_found", {"path":this.getPath()});
            }
        }
    },

    on_pop_state: function(evt) {
        if (evt.state) {
            console.log("NAV CHANGE: " + evt.state.path);
            app.loadRoute(evt.state.path);
        }
    },



    on_network_online: function(evt) {
        // javascript code the detects if the browser if online
        SWAM.toast("NETWORK ONLINE", "Network is back!", "success");
    },

    on_network_offline: function(evt) {
        SWAM.toast("NETWORK OFFLINE", "Check your network!", "danger", 8000);
    },

    hasNetwork: function() {return navigator.onLine; },

    isOnline: function() {
        return navigator.onLine;
    },

    navigate: function(path, trigger, title) {
        if (!this.options.navigation) return;
        if (this._nav_path == path) return; 
        this._nav_path = path;
        if (title) document.title = title;
        window.history.pushState({"path":path}, "", path);
    },

    on_window_focus: function(evt) {
        this.has_focus = true;
        this.trigger("foreground");
        this.syncNow();
    },

    on_window_blur: function(evt) {
        this.has_focus = false;
        this.trigger("background");
    },

    syncNow: function() {
        if (!this.options.last_sync) this.options.last_sync = Date.now() - (this.options.sync_debounce_ms+1000);
        var delta = Date.now() - this.options.last_sync;
        if (delta > this.options.sync_debounce_ms) {
            this.options.last_sync = Date.now();
            var evt = {age: delta};
            this.on_sync(evt);
            this.trigger("sync", evt);
        }
    },

    on_sync: function(evt) {
        
    },

    initWindowEvents: function() {
        this.has_focus = document.hasFocus();
        if (_.isUndefined(document.onfocusin)) {
            window.onfocus = _.bind(this.on_window_focus, this);
            window.onblur = _.bind(this.on_window_blur, this);
        } else {
            window.onfocusin = _.bind(this.on_window_focus, this);
            window.onfocusout = _.bind(this.on_window_blur, this);
        }
    }
});

SWAM.RE = SWAM.RE || {};

SWAM.RE.namedParam = /(\(\?)?:\w+/g;
SWAM.RE.optionalParam = /\((.*?)\)/g;
SWAM.RE.escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
SWAM.RE.splatParam  = /\*\w+/g;


