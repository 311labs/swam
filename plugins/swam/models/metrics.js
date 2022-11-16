
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
	SWAM.Rest.POST("/rpc/metrics/metric", {
		"slug": slug,
		"category": category,
		"geolocate": geolocate
	}, null, {no_auth:true});
}

SWAM.Metrics.getChart = function(slugs, category, geolocate) {
	SWAM.Rest.GET("/rpc/metrics/metrics", {
		"slugs": slugs,
		"category": category
	}, null, {no_auth:true});
}


SWAM.Metrics.getPageViews = function() {
	SWAM.Rest.GET("/rpc/metrics/metrics", {
		"category": "page_views"
	}, null, {no_auth:true});
}

SWAM.Metrics.getRestMetrics = function() {
	SWAM.Rest.GET("/rpc/metrics/metrics", {
		"category": "rest_calls"
	}, null, {no_auth:true});
}
