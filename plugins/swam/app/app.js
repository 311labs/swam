

SWAM.App = SWAM.View.extend(SWAM.TouchExtension).extend({
    template: "<div id='panel-left'>&nbsp;</div><div id='panel-main'><header id='title-bar'></header><div id='pages' class='has-topbar'></div></div>",
    _pages: {},
    active_page: null,
    started: false,
    defaults: {
        root: "/",
        page_el_id: "#pages"
    },
    addPage: function(name, view, routes) {
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
    setActivePage: function(name, params) {
        var page = this._pages[name];
        var $parent = this.$el.find(this.options.page_el_id);
        if (page && $parent) {
            if (page == this.active_page) {
                page.setParams(params);
                return this.render();
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
            this.trigger("page:change");
            if (!this.started) {
                this.start();
            }
        } else {
            console.warn("invalid page: " + name);
        }

    },
    isActivePage: function(name) {
        return this._pages[name] == this.active_page;
    },
    goBack: function() {
        if (this.active_page._prev_page) this.setActivePage(this.active_page._prev_page.page_name);
    },
    start: function() {
        console.log("app.start");
        console.log("yup");
        this.$el = $("body");
        this.started = true;
        this.location = window.location;
        this.history = window.history;
        this.root = this.options.root;
        this.on_init_pages();
        this.render();
        this.starting_url = this.getPath();
        this.on_initial_route();
    },

    showTopBar: function() { this.$el.find("#title-bar").show(); },
    hideTopBar: function() { this.$el.find("#title-bar").hide(); },

    showLeftPanel: function(evt) {
        $("body").addClass("panel-animate panel-left-reveal-partial");
    },

    hideLeftPanel: function(evt) {
        $("body").removeClass("panel-left-reveal-partial").addClass("panel-animate");
    },

    toggleLeftPanel: function(evt) {
        if (this.isLeftPanelVisible()) {
            this.hideLeftPanel();
        } else {
            this.showLeftPanel();
        }
    },

    isLeftPanelVisible: function() {
        return $("body").hasClass("panel-left-reveal-partial");
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

    on_initial_route: function() {
        this.loadUrl();
        if (!this.active_page) {
            console.warn("failed to load starting page");
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

    loadUrl: function(path) {
        return _.some(this._routes, function(handler) {
            if (handler.route.test(path)) {
                handler.callback(path);
                return;
            }
        })
    }

});

SWAM.RE = SWAM.RE || {};

SWAM.RE.namedParam = /(\(\?)?:\w+/g;
SWAM.RE.optionalParam = /\((.*?)\)/g;
SWAM.RE.escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
SWAM.RE.splatParam  = /\*\w+/g;
