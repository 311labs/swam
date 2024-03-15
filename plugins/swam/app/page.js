SWAM.Pages = {};

SWAM.Page = SWAM.View.extend({
	classes: "page-view",

	on_page_init: function() {
		// called todo delayed initializing of page if supported
	},

	startTimer: function() {
		this.stopTimer();
		if (!this._on_timer_bound) this._on_timer_bound = this._on_timer_.bind(this);
		if (!this.options.timer_ms) this.options.timer_ms = 30000;
		this._timer = setTimeout(this._on_timer_bound, this.options.timer_ms);
	},

	clearTimer: function() {
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}
	},

	_on_timer_: function(evt) {
		this._timer = null;
		if (this.on_timer_event) {
			this.on_timer_event(evt);
		} else {
			console.warn("missing on_timer_event callback");
		}
	},
	
	on_route: function(path, route) {
		// this is only called for an initial route loaded by the app
		console.log(`on_route: ${this.page_name}  route: ${route}   path: ${path}`);
		let params = {};
		if (route && route.indexOf(":")) {
			params = this.extractPathVariables(route, path);
		}
		
		params.url_params = app.getSearchParams();
		app.setActivePage(this.page_name, params);
	},

	on_page_pre_enter: function() {

	},

	on_page_enter: function() {

	},

	on_page_reenter: function() {

	},

	on_page_exit: function() {

	},

	isActivePage: function() {
		return app.active_page == this;
	},

	showPage: function(params, anchor) {
	    app.setActivePage(this.page_name, params, anchor);
	},

	extractPathVariables: function(template, str) {
	    const matches = [...template.matchAll(/:([a-zA-Z0-9_]+)(\/|\?|$)/g)];
	    const result = {};

	    if (matches.length === 0) return result;

	    // Create a regex pattern from the template.
	    let pattern = template;
	    matches.forEach(match => {
	        pattern = pattern.replace(match[0], '([^\/\?]+)'+match[2]);
	    });

	    const regex = new RegExp(pattern);
	    const inputMatch = str.match(regex);

	    if (!inputMatch) return result;

	    // Construct the result object using the matches.
	    matches.forEach((match, index) => {
	        result[match[1]] = inputMatch[index + 1];
	    });

	    return result;
	},

	updateURL: function(url_params) {
		if ((url_params === undefined)&&(this.params.url_params)) {
			url_params = this.params.url_params;
		}
		if (window.isDict(url_params)) {
			this.params = this.params || {};
			this.params.url_params = url_params;
		}
		var route = app.options.root + this.getRoute(this.params, url_params);
		app.navigate(route, false, this.options.title);
	},

	getRoute: function(params, url_params) {
		params = params || {};
		if (url_params != undefined) params.url_params = url_params;
		var best_route = null;
		var best_route_param_count = 0;
		_.each(this.routes, function(r){
		    // break any variables out of routes
		    if (!best_route) best_route = r;
		    if (r.indexOf(":") < 0) return;
		    var has_all_params = true;
		    var param_count = 0;
		    _.each(r.split('/'), function(key){
		        if (key[0] == ':') {
		            var rp = key.substr(1);
		            // check if route params is in our params
		            if (_.isUndefined(params[rp])) {
		                has_all_params = false;
		            }
		            param_count += 1;
		        }
		    });

		    if (has_all_params && (param_count > best_route_param_count)) {
		        best_route = r;
		        best_route_param_count = param_count;
		    }
		});
		if (best_route) {
			// console.log("best route");
			// console.log(params);
		    _.each(params, function(v, p){
		        best_route = best_route.replace(":" + p, v);
		    });
		}
		if (window.isDict(params.url_params) && (!_.isEmpty(params.url_params))) {
			best_route += "?" + $.param(params.url_params);
		}
		return best_route;
	}

});


SWAM.HalPage = SWAM.Page.extend(SWAM.HALExt);

