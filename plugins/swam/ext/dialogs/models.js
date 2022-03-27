


SWAM.Dialog.showModel = function(model, fields, options) {
    var $container = $("<div />").addClass("model-fields row");

    _.each(fields, function(obj){
        if (_.isString(obj)) {
            obj = {field:obj};
        }
        if (!obj.label) obj.label = obj.field;
        if (!obj.field) obj.field = obj.label;
        if (!obj.columns) obj.columns = 6;
        var $fieldbox = $("<div />")
            .addClass("col-sm-" + obj.columns)
            .appendTo($container);
        var $wrapper = $("<div />").addClass("model-field mb-3").appendTo($fieldbox);
        $wrapper.append($("<div />").addClass("field-label h6 mb-1").text(obj.label));
        var value = model.get(obj.field, obj.localize);
        if ((obj.localize == "prettyjson")||(obj.tag == "pre")) $wrapper = $("<pre />").appendTo($wrapper);
        $wrapper.append($("<div />").addClass("field-value").text(value));
    });

    options = _.extend({
        message: $container.wrap('<p/>').parent().html(),
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
	            label: "Cancel"
	        },
	        {
	            id: "save",
	            action:"choice",
	            label: "Save"
	        }
	    ],
	    model: model,
	    fields:model.constructor.EDIT_FORM
	};

	opts = _.extend(defaults, opts);

	if (!opts.fields) {
		var error = "editModel requires fields or model.EDIT_FORM";
		SWAM.Dialog.warning(error);
		opts.callback(model, {error:error});
	}

	var callback = opts.callback;
	opts.callback = function(dlg, choice) {
		if (choice == "save") {
			app.showBusy({icon:"upload", timeout:4000, color:"warning", no_timeout_alert:false});
			model.save(dlg.getData(), function(model, resp) {
				app.hideBusy();
				if (resp.error) {
					SWAM.Dialog.warning(resp.error);
				} else {
					dlg.dismiss();
				}
				callback(model, resp);
			});
		}
	};


	return this.showView(new SWAM.Form.View({fields:opts.fields, defaults:opts.defaults, model:opts.model}), opts);
};

