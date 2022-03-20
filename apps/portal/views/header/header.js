PORTAL.Views.Header = SWAM.View.extend({
	classes: "app-header bg-dark",
	template: ".views.header",
	defaults: {
		replaces_el: true
	},

	on_action_logout: function(evt) {
		app.logout();
	},

	on_action_edit_profile: function(evt) {
		SWAM.Dialog.showForm(SWAM.Models.Me.EDIT_FORM, {model:app.me, title:"Edit Profile", callback:function(dlg){
		    var data = dlg.getData();
		    dlg.dismiss();
		    app.showBusy('<i class="bi bi-cloud-arrow-up-fill"></i>')
		}.bind(this), model_save:true});
	}

});