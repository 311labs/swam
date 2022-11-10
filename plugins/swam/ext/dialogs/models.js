

SWAM.Dialog.showModel = function(model, fields, options) {

    options = _.extend({
        view: SWAM.Views.ModelView.buildTable(model, {fields:fields}),
        scrollable: true
    }, options);

    var dlg = new this(options);
    return dlg.show();
};


SWAM.Dialog.editModel = function(model, opts) {
	var defaults = {
	    title: "Edit",
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
		opts.callback(model, {error:error});
		return;
	}

	if (opts.extra_fields) {
		opts.fields = _.clone(opts.fields).concat(opts.extra_fields);
	}

	var callback = opts.callback;
	opts.callback = function(dlg, choice) {
		if (choice == "save") {
			app.showBusy({icon:"upload", timeout:4000, color:"warning", no_timeout_alert:false});
			var data = _.extend({}, opts.defaults, dlg.getData());
			if (app.group && (data.group == undefined)) data.group = app.group.id;
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


	return this.showView(new SWAM.Form.View({fields:opts.fields, defaults:opts.defaults, model:opts.model}), opts);
};

