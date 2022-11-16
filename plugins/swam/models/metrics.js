
SWAM.Metrics = {};

SWAM.Metrics.trackView = function(page_name, geolocate) {
	var app_name = window.template_root;
	if (app_name.startsWith("apps.")) {
		app_name = app_name.substr(5).replaceAll(".", "_");
	}
	var slug = "page__" + app_name + "__" + page_name;
	SWAM.Metrics.track(slug, geolocate);
}

SWAM.Metrics.track = function(slug, geolocate) {
	SWAM.Rest.POST("/rpc/metrics/metric", {
		"slug": slug,
		"geolocate": geolocate
	}, null, {no_auth:true});
}

