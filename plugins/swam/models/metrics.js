
SWAM.Metrics = {};

SWAM.Metrics.trackView = function(page_name, geolocate) {
	var app_name = window.template_root;
	if (app_name.startsWith("apps.")) {
		app_name = app_name.substr(5).replaceAll(".", "_");
	}
	var slug = "page__" + app_name + "__" + page_name;
	SWAM.Metrics.track(slug, "page_views", geolocate);
}

SWAM.Metrics.track = function(slug, category, geolocate) {
	SWAM.Rest.POST("/api/metrics/metric", {
		"slug": slug,
		"category": category,
		"geolocate": geolocate
	}, null, {no_auth:true});
}

SWAM.Metrics.getChartFor = function(slugs, callback) {
	SWAM.Rest.GET("/api/metrics/metrics", {
		"slugs": slugs
	}, callback, {no_auth:true});
}

SWAM.Metrics.getCategoryChart = function(category, callback) {
	SWAM.Rest.GET("/api/metrics/metrics", {
		"category": category
	}, callback, {no_auth:true});
}


SWAM.Metrics.getPageViews = function(callback) {
	SWAM.Metrics.getCategoryChart("page_views", callback);
}

SWAM.Metrics.getRestMetrics = function(callback) {
	SWAM.Metrics.getCategoryChart("rest_calls", callback);
}




SWAM.Models.Metrics = SWAM.Model.extend({
    defaults: {
    	url:"/api/metrics/db/metrics/objects"
    },

    getMetrics: function() {
    	var output = {
    		slug:this.get("slug"),
    		uuid:this.get("uuid"),
    		start:this.get("start|datetime"),
    		expires:this.get("expires|date")
    	};
    	for (var i = 1; i < 15; i++) {
    		let key = this.get(`k${i}`);
    		output[key] = this.get(`v${i}`);
    	}
    	return output;
    }
});

SWAM.Collections.Metrics = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.Metrics
    }
});