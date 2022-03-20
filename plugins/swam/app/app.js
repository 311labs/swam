

SWAM.App = SWAM.View.extend(SWAM.TouchExtension).extend(SWAM.StorageExtension).extend({
    template: "<div id='panel-left'></div><div id='panel-main'><header id='title-bar'></header><div id='pages' class='has-topbar'></div></div>",
    _pages: {},
    active_page: null,
    started: false,
    icons: SWAM.Icons,
    defaults: {
        title: "Put Title in app.defaults",
        root: "/",
        page_el_id: "#pages",
        catch_errors: true, // catch and show popup for uncaught errors
    },
    on_init: function() {
        this.on("property:change", this.on_prop_change, this);
    },
    on_prop_change: function(evt) {
        console.log("on_prop_change");
        console.log(evt);
        if (_.isFunction(this["on_prop_" + evt.key])) this["on_prop_" + evt.key](evt.value);
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
            view.on_route.apply(view, arguments);
        }.bind(this));
    },
    getPage: function(name) {
        return this._pages[name];
    },
    showPage: function(name, params) {
        this.setActivePage(name, params);
    },
    setActivePage: function(name, params) {
        var page = this._pages[name];
        var $parent = this.$el.find(this.options.page_el_id);
        if (page && $parent) {
            if (page == this.active_page) {
                page.setParams(params);
                if (!page.isInDOM()) {
                    $parent.empty();
                    page.addToDOM($parent);
                } else {
                    page.render();
                }
                return;
            }
            if (this.active_page) {
                page._prev_page = this.active_page;
                this.active_page.removeFromDOM();
            }
            // check for topbar
            if (page.classes && (page.classes.indexOf("has-topbar") >= 0)) {
                this.showTopBar();
            } else {
                this.hideTopBar();
            }
            console.log("active page now: " + page.page_name);
            this.active_page = page;
            $parent.empty();
            page.setParams(params);
            page.addToDOM($parent);
            page.updateURL();
            this.trigger("page:change");
            if (!this.started) {
                this.start();
            }
        } else {
            console.warn("invalid page: " + name);
            this.setActivePage("not_found", {invalid_page: name});
        }

    },
    isActivePage: function(name) {
        return this._pages[name] == this.active_page;
    },
    goBack: function() {
        if (this.active_page._prev_page) this.setActivePage(this.active_page._prev_page.page_name);
    },

    start: function() {
        if (this.options.catch_errors) this.enableErrorCatcher();
        this.loadSettings();
        this.version = window.app_version;
        this.$el = $("#app_body");
        this.started = true;
        this.location = window.location;
        this.history = window.history;
        this.root = this.options.root;
        window.addEventListener("popstate", this.on_pop_state);
        this.on_init_pages();
        this.render();
        this.starting_url = this.getPath();
        this.on_started();
    },

    loadSettings: function() {
        this.options.api_url = this.getProperty("api_url", this.options.api_url);
    },

    on_prop_api_url: function(value) {
        this.options.api_url = value;
    },

    showTopBar: function() { this.$el.find("#title-bar").show(); },
    hideTopBar: function() { this.$el.find("#title-bar").hide(); },

    showLeftPanel: function(partial) {
        if (partial) {
            this.$el.addClass("panel-animate").removeClass("panel-left-reveal").addClass("panel-left-reveal-partial");
        } else {
            this.$el.addClass("panel-animate").removeClass("panel-left-reveal-partial").addClass("panel-left-reveal");
        }

    },

    hideLeftPanel: function() {
        this.$el.addClass("panel-animate").removeClass("panel-left-reveal");
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
        // console.log("app| swipe left");
        this.hideLeftPanel();
    },

    // called when touchend and swipe right criteria met
    on_swipe_right: function(evt) {
        // console.log("app| swipe right");
        this.showLeftPanel();
    },

    on_init_pages: function() {
        
    },

    on_started: function() {
        this.loadRoute();
        if (!this.active_page) {
            console.warn("failed to load starting page: " + this.getPath());
            if (this._pages.not_found) {
                this.setActivePage("not_found", {"path":this.getPath()});
            }
        }
    },

    getPath: function() {
        var path = this.decodeFragment(
          this.location.pathname + this.getSearch()
        ).slice(this.root.length - 1);
        return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    getSearch: function() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
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
            if (!_.isRegExp(route)) route = this._routeToRegExp(route);
            this._routes.unshift({route:route, callback:handler});
        }.bind(this));
    },

    on_busy_timeout: function(opts) {
        if (!SWAM.active_dialog.options.no_timeout_alert) {
            SWAM.Dialog.alert("timed out");
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
        if (_.isNumber(options.timeout)) {
            this._busy_info = options;
            this._busy_dlg = SWAM.Dialog.showLoading(opts);
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
            this._busy_dlg = SWAM.Dialog.showLoading(opts);
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
        SWAM.Dialog.alert({title:"Uncaught App Error", message:"<pre class='text-left'>" + error.stack + "</pre>", classes:"modal-lg"});
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
        if (!path) path = this.getPath();
        if (path.startsWith(this.options.root)) path = path.substr(this.options.root.length);
        return _.some(this._routes, function(handler) {
            if (handler.route.test(path)) {
                console.log("loadRoute: " + path);
                handler.callback(path);
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

    navigate: function(path, trigger, title) {
        if (this._nav_path == path) return; 
        this._nav_path = path;
        if (title) document.title = title;
        window.history.pushState({"path":path}, "", path);
    }
});

SWAM.RE = SWAM.RE || {};

SWAM.RE.namedParam = /(\(\?)?:\w+/g;
SWAM.RE.optionalParam = /\((.*?)\)/g;
SWAM.RE.escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
SWAM.RE.splatParam  = /\*\w+/g;
