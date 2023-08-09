

SWAM.Dialog.showModel = function(model, fields, options) {

    options = _.extend({
        view: SWAM.Views.ModelView.buildTable(model, {fields:fields}),
        scrollable: true
    }, options);

    var dlg = new this(options);
    return dlg.show();
};

SWAM.Dialog.showModelView = function(model, fields, options) {

    options = _.extend({
        view: new SWAM.Views.ModelView({fields:fields, model:model}),
        scrollable: true
    }, options);

    var dlg = new this(options);
    if (options.fetch_first) {
    	app.showBusy();
    	model.fetch(function(model, resp) {
    		app.hideBusy();
    		if (resp.error) {
    			SWAM.Dialog.warning({title:"Fetch Failed", message:resp.error})
    		} else {
    			dlg.show();
    		}
    	});
    } else {
    	return dlg.show();
    }
};


SWAM.Dialog.editModel = function(model, opts) {
	opts = opts || {};
	var defaults = {
	    title: "Edit",
	    padded: true,
	    form_config: {},
	    use_app_group: model.id == null, // only use app group on new models?
	    buttons: [
	        {
	            id: "cancel",
	            action:"choice",
	            label: opts.lbl_cancel || "Cancel"
	        },
	        {
	            id: "save",
	            action:"choice",
	            label: opts.lbl_save || "Save"
	        }
	    ],
	    model: model,
	    fields:model.constructor.EDIT_FORM
	};

	if (opts.lbl_cancel === null) {
		defaults.buttons.shift();
	}

	opts = _.extend(defaults, opts);

	if (!opts.fields) {
		var error = "editModel requires fields or model.EDIT_FORM";
		SWAM.Dialog.warning(error);
		if (opts.callback) opts.callback(model, {error:error});
		return;
	}

	if (opts.extra_fields) {
		opts.fields = _.clone(opts.fields).concat(opts.extra_fields);
	}

	if (!opts.callback) {
		opts.callback = function() {};
	}

	var callback = opts.callback;
	opts.callback = function(dlg, choice) {
		if (choice == "save") {
			var data = dlg.getData();
			if (_.isEmpty(data)) {
				console.warn("save called, but nothing to save");
				dlg.dismiss();
				if (callback) callback(model, {status:true});
				return;
			}
			app.showBusy({icon:"upload", timeout:false, color:"warning", no_timeout_alert:true});
			// FIXME: this is not good, and can cause issues when in admin pages, etc
			if (opts.use_app_group && app.group && (data.group == undefined)) data.group = app.group.id;
			model.save(data, function(model, resp) {
				app.hideBusy();
				if (resp.error) {
					if (!callback) SWAM.Dialog.warning(resp.error);
				} else {
					dlg.dismiss();
				}
				if (callback) callback(model, resp);
			});
		}
	};


	return this.showView(new SWAM.Form.View({fields:opts.fields, defaults:opts.defaults, model:opts.model, config:opts.form_config}), opts);
};

