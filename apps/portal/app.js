
window.ACS = window.ACS || {}

ACS.App = SWAM.App.extend({

	defaults: {
		root: "/portal",
		api_url: "https://api.itf.io"
	},

	on_init_pages: function() {
		this.addPage("not_found", new ACS.Pages.NotFound(), ["404"]);
		this.addPage("login", new ACS.Pages.Login(), ["login"]);
	}
});


