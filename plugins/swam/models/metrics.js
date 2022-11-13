
SWAM.Metrics = {};

SWAM.Metrics.trackView = function(page_name) {
	var app_name = window.template_root;
	if (app_name.startsWith("apps.")) {
		app_name = app_name.substr(5).replaceAll(".", "_");
	}
	var slug = "page__" + app_name + "__" + page_name;
	SWAM.Metrics.track(slug);
}

SWAM.Metrics.track = function(slug) {
	SWAM.Rest.POST("/rpc/metrics/metric", {
		"slug": slug
	}, null, {no_auth:true});
}

