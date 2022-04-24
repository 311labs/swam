SWAM.Pages = {};

SWAM.Page = SWAM.View.extend({
	classes: "page-view",
	
	on_route: function(path) {
		console.log("on_route: " + this.page_name);
		app.setActivePage(this.page_name, {url_params:app.getSearchParams()});
	},

	isActivePage: function() {
		return app.active_page == this;
	},

	updateURL: function(url_params) {
		if (window.isDict(url_params)) {
			this.params = this.params || {};
			this.params.url_params = url_params;
		}
		var route = app.options.root + this.getRoute(this.params, url_params);
		app.navigate(route, false);
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
		    _.each(params, function(v, p){
		        best_route = best_route.replace(":" + p, v);
		    });
		}
		if (window.isDict(params.url_params)) {
			best_route += "?" + $.param(params.url_params);
		}
		return best_route;
	}

});
