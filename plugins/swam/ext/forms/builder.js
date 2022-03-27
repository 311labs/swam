

SWAM.Form.build = function(fields, defaults, model, options) {
	options = options || {};
	var form_info = {};
	form_info.defaults = defaults;
	form_info.model = model;
	form_info.columns = 0;
	form_info.$row = null;
	form_info.$form = options.$form || $("<form />");

	_.each(fields, function(field) {
		if (!field) return;
		if ((field == "")|| (field == " ")) field = {type:"line", columns:12};
		var fc = _.extend({type:"text", columns:12, column_size:"sm"}, _.deepClone(field)); // copy the field so we can manipulate its info


		if (fc.type == "group") {
			SWAM.Form.buildGroup(fc, form_info);
			return;
		}

		fc.$el = $("<div />").addClass("swam-form-input").addClass(fc.type + "-input-group");
		if (fc.floating_label) {
			fc.append_label = true;
			fc.$el.addClass("form-floating");
		}
		SWAM.Form.buildField(fc, form_info);
		SWAM.Form.Builder.form_wrap(fc, form_info);
		SWAM.Form.Builder.row(fc, form_info);

	});

	return form_info.$form;
}

SWAM.Form.buildField = function(fc, form_info) {
	var func_name = fc.type;
	if (fc.name) {
		SWAM.Form.Builder.getValue(fc, form_info);
	}
	if (_.isFunction(SWAM.Form.Builder[func_name])) {
		SWAM.Form.Builder[func_name](fc);
	} else {
		SWAM.Form.Builder.text(fc);
	}
	
	if (fc.$input) {
		if (fc.name) fc.$input.attr("name", fc.name);
		if (fc.required) fc.$input.prop("required", true);
		if (fc.disabled) fc.$input.attr("disabled", "disabled");
		if (fc.placeholder) fc.$input.attr("placeholder", fc.placeholder);
		if (fc.action) fc.$input.attr("data-action", fc.action);
		if (fc.attributes) {
			for (var attr in fc.attributes) {
				fc.$input.attr(attr, fc.attributes[attr]);
			}
		}
		if (fc.data) {
			for (var attr in fc.data) {
				fc.$input.attr("data-" + attr, fc.data[attr]);
			}
		}

		if (fc.value) {
			SWAM.Form.Builder.value(fc, form_info);
		}
		
	}
} 

SWAM.Form.buildGroup = function(fc, form_info) {
	fc.$el = $("<div />");
	SWAM.Form.build(fc.fields, form_info.defaults, form_info.model, {"$form":fc.$el});
	fc.$el= fc.$el.find(".row").first(); // get back to the row element
	if (fc.classes) fc.$el.addClass(fc.classes);
	SWAM.Form.Builder.row(fc, form_info);
}

SWAM.Form.Builder = {};

SWAM.Form.Builder.getValue = function(fc, form_info) {
	if (form_info.defaults && (form_info.defaults[fc.name] != undefined)) fc.default = form_info.defaults[fc.name];
	if ((fc.value == undefined) && (fc.default != undefined)) fc.value = fc.default;

	if (form_info.model) {
		if ((fc.type == "date") || (fc.type == "datetime")) {
			fc.value = form_info.model.get(fc.name, fc.value, fc.type);
		} else {
			fc.value = form_info.model.get(fc.name, fc.value, fc.localize);
		}
	}
}

SWAM.Form.Builder.value = function(fc, form_info) {
	fc.$input.val(fc.value);
	if (fc.is_checkbox) {
		if (fc.value == undefined) fc.value = 0;
		if (!_.isBoolean(fc.value) && fc.value.isNumber()) fc.value = fc.value.toInt();
		if (_.isString(fc.value)) fc.value = 0;
		fc.$input.prop("checked", fc.value);
	} else {
		fc.$input.attr("data-value", fc.value);
	}
}

SWAM.Form.Builder.row = function(fc, form_info) {
	if (form_info.columns == 0) {
		form_info.$row = $("<div />").addClass("row");
		form_info.$form.append(form_info.$row);
	}
	SWAM.Form.Builder.column(fc, form_info);
	form_info.$row.append(fc.$column);
	form_info.columns += fc.columns;
}

SWAM.Form.Builder.column = function(fc, form_info) {
	if (!fc.columns_classes) fc.columns_classes = "col-" + fc.column_size + "-" + fc.columns;
	fc.$column = $("<div />").addClass(fc.columns_classes);
	fc.$column.append(fc.$el);
}

SWAM.Form.Builder.form_wrap = function(fc, form_info) {
	if (fc.form_wrap) {
		var $wrap = $("<form />").addClass(fc.form_wrap).addClass("inline-form");
		fc.$el = $wrap.append(fc.$el);
	}
}

SWAM.Form.Builder.orderLabel = function(fc, form_info) {
	if (!fc.label) {
		fc.$el.append(fc.$input);
	} else {
		if (fc.name) {
			fc.$input.attr("id", fc.name);
			fc.$label.prop("for", fc.name);
		}
		if (!fc.append_label) {
			fc.$el.append(fc.$label);
			fc.$el.append(fc.$input);
		} else {
			fc.$el.append(fc.$input);
			fc.$el.append(fc.$label);
		}
	}
}

SWAM.Form.Builder.label = function(fc, form_info) {
	
	if (fc.label) {
		var lbl =$("<label for='" + fc.name + "' />").addClass("form-label");
		lbl.text(fc.label);
		return lbl;
	}
	return null;
}

SWAM.Form.Builder.text = function(fc, form_info) {
	if (fc.button || fc.icon) return SWAM.Form.Builder.input_group(fc, form_info);
	fc.$label = SWAM.Form.Builder.label(fc);
	fc.$input = $("<input />").addClass("form-control form-control-" + fc.type).addClass("input-" + fc.type);
	fc.$input.prop("type", fc.type);
	SWAM.Form.Builder.orderLabel(fc, form_info);
	return fc;
}

SWAM.Form.Builder.textarea = function(fc, form_info) {
	fc.$label = SWAM.Form.Builder.label(fc);
	fc.$input = $("<textarea />").addClass("form-control form-control-" + fc.type).addClass("input-" + fc.type);
	if (!fc.rows) fc.rows = 3;
	fc.$input.attr("rows", fc.rows);
	SWAM.Form.Builder.orderLabel(fc, form_info);
	return fc;
}

SWAM.Form.Builder.line = function(fc, form_info) {
	fc.$el.append("<hr />");
}

SWAM.Form.Builder.button = function(fc, form_info) {
	SWAM.Form.Builder.iconlabel(fc);
	fc.$button = $("<button type='button' />").html(fc.label);
	if (fc.disabled) fc.$button.attr("disabled", "disabled");
	if (fc.action) fc.$button.attr("data-action", fc.action);
	if (!fc.classes) fc.classes = "btn btn-primary";
	if (fc.full_width) fc.$el.addClass("d-grid");
	fc.$button.attr("class", fc.classes);
	fc.$el.append(fc.$button);
}

SWAM.Form.Builder.checkbox = function(fc, form_info) {
	fc.$wrap = $("<div />").addClass("form-check");
	fc.$el.append(fc.$wrap);
	fc.$label = SWAM.Form.Builder.label(fc);
	fc.$label.attr("class", "form-check-label");
	fc.$input = $("<input />").addClass("form-check-input").addClass("input-" + fc.type);
	fc.$input.prop("type", "checkbox");
	if (fc.name) {
		fc.$input.attr("id", fc.name);
		fc.$label.prop("for", fc.name);
	}
	fc.$wrap.append(fc.$input);
	fc.$wrap.append(fc.$label);
	fc.is_checkbox = true;
	return fc;
}

SWAM.Form.Builder.toggle = function(fc, form_info) {
	SWAM.Form.Builder.checkbox(fc, form_info);
	fc.$wrap.addClass("form-switch");
	fc.$input.attr("role", "switch");
	return fc;
}

SWAM.Form.Builder.input_group = function(fc, form_info) {
	fc.$label = SWAM.Form.Builder.label(fc);
	fc.$el.append(fc.$label);
	fc.$wrap = $("<div />").addClass("input-group");
	fc.$el.append(fc.$wrap);
	fc.$input = $("<input />").addClass("form-control form-control-" + fc.type).addClass("input-" + fc.type);
	fc.$wrap.append(fc.$input);
	if (fc.button) {
		var $btn = $("<button class='btn btn-default btn btn-outline-secondary'><i class='" + fc.button.icon + "'></i></button>");
		if (fc.button.action) $btn.attr("data-action", fc.button.action);
		fc.$wrap.append($btn);
	} else if (fc.icon) {
		fc.$wrap.append("<div class='input-group-text'><i class='" + fc.icon + "'></i></div>");
	}
	return fc;
}

SWAM.Form.Builder.date = function(fc, form_info) {
	if (!fc.icon) fc.icon = "bi bi-calendar-month";
	return SWAM.Form.Builder.input_group(fc, form_info);
}

SWAM.Form.Builder.datetime = function(fc, form_info) {
	if (!fc.icon) fc.icon = "bi bi-clock";
	return SWAM.Form.Builder.input_group(fc, form_info);
}

SWAM.Form.Builder.timepicker = function(fc, form_info) {
	if (!fc.icon) fc.icon = "bi bi-clock";
	return SWAM.Form.Builder.input_group(fc, form_info);
}

SWAM.Form.Builder.daterange = function(fc, form_info) {
	if (!fc.icon) fc.icon = "bi bi-calendar-range-fill";
	return SWAM.Form.Builder.input_group(fc, form_info);
}

SWAM.Form.Builder.select = function(fc, form_info) {
	fc.$label = SWAM.Form.Builder.label(fc);
	fc.$input = $("<select />").addClass("form-select").addClass("input-" + fc.type);
	if (fc.multiple || fc.multi) {
		fc.$input.attr("multiple", "multiple");
	}
	if (fc.editable) {
		fc.$input.addClass("editable");
	} else {
		fc.$input.addClass("normal");
	}
	SWAM.Form.Builder.options(fc, form_info);
	SWAM.Form.Builder.orderLabel(fc, form_info);
	return fc;
}

SWAM.Form.Builder.options = function(fc, form_info) {
	if (_.isString(fc.options)) {
		if (_.isFunction(fc.options)) {
			fc.options = fc.options();
		} else {
			// data sets
			var dataset = SWAM.DataSets.get(fc.options + "_select");
			if (!dataset || _.isEmpty(dataset)) dataset = SWAM.DataSets.get(fc.options);
			if (dataset) fc.options = dataset;
		}
	}

	if (_.isArray(fc.options)) {
		SWAM.Form.Builder.options_array(fc, form_info);
	} else if (window.isDict(fc.options)) {
		SWAM.Form.Builder.options_dict(fc, form_info);
	} else if ((fc.start != undefined) && (fc.start.isNumber())) {
		SWAM.Form.Builder.options_range(fc, form_info);
	}


	return fc;
}

SWAM.Form.Builder.options_array = function(fc, form_info) {
	if (fc.placeholder) {
		fc.$input.append($("<option />").text(fc.placeholder).val(""));
	}
	_.each(fc.options, function(value){
		if (_.isObject(value)) {
			if ((value.requires_perm) && (!app.me.hasPerm(value.requires_perm))) return;
			fc.$input.append($("<option />").text(value.label).val(value.value));
		} else {
			fc.$input.append($("<option />").text(value).val(value));
		}
	});
}


SWAM.Form.Builder.options_dict = function(fc, form_info) {
	if (fc.placeholder) {
		fc.$input.append($("<option />").text(fc.placeholder).val(""));
	}
	var keys = [], len = 0;
	_.each(fc.options, function(value, key){
		keys.push(key);
	});
	keys.sort();
	len = keys.length;
	for (i = 0; i < len; i++) {
		var value = dataset[keys[i]];
		var key = keys[i]
		fc.$input.append($("<option />").text(value).val(key));
	}
}

SWAM.Form.Builder.options_range = function(fc, form_info) {
	if (fc.placeholder) {
		fc.$input.append($("<option />").text(fc.placeholder).val(""));
	}
	fc.end = fc.end || fc.stop || 5;
	var i = fc.start;
	var s = fc.step || 5;
	var sstep = ("" + s);
	var is_dec = (sstep.indexOf('.') >= 0);
	var dec_size = 0;
	if (is_dec) {
		dec_size = sstep.substr(sstep.indexOf('.')+1).length;
	}
	for (; i <= fc.end; i+=s) {
		var v = i;
		if (dec_size) v = v.toFixed(dec_size);
		var l = v;
		if (fc.percent) l = (i * 100).toFixed(Math.max(dec_size - 2), 0) + "%";
		if (fc.suffix) l = l + fc.suffix;
		fc.$input.append($("<option />").text(l).val(v));
	}
}

SWAM.Form.Builder.iconlabel = function(fc, form_info) {
	var lbl = "";
	if (fc.icon) lbl = '<i class="' + fc.icon + '"></i> ';
	if (fc.label) lbl = lbl + fc.label;
	fc.label = lbl;
}

SWAM.Form.Builder.dropdown = function(fc, form_info) {
	SWAM.Form.Builder.iconlabel(fc);
	fc.did = _.uniqueId("dropdown");
	fc.$child = $("<div />").addClass("dropdown");

	var $button = $("<button />")
		.prop("type", "button")
		.attr("id", fc.did)
		.attr("data-bs-toggle", "dropdown")
		.attr("aria-expanded", "false")
		.addClass("btn btn-secondary dropdown-toggle")
		.html(fc.label);

	if (fc.className) {
		$button.addClass(fc.className);
	}
	if (fc.action) {
		// $input.data("action", fc.action);
		$button.attr("data-action", fc.action);
	}
	fc.$child.append($button);
	
	SWAM.Form.Builder._dropdownmenu(fc, form_info);

	fc.$el.append(fc.$child);
}

SWAM.Form.Builder._dropdownmenu = function(fc, form_info) {
	var $menu = $("<ul />").addClass("dropdown-menu dropdown-menu-end")
		.attr("aria-labelledby", fc.did)
		.appendTo(fc.$child);

	_.each(fc.items, function(item) {
		var $li = $("<li />").appendTo($menu);
		var $item = $("<a href='#' />").addClass("dropdown-item").appendTo($li);
		if (item.action) $item.attr("data-action", item.action);
		var ilbl = "";
		if (item.icon) ilbl = '<i class="' + item.icon + '"></i> ';
		if (item.label) ilbl = ilbl + item.label;
		$item.html(ilbl);
	});
}

SWAM.Form.Builder.buttongroup = function(fc, form_info) {
	fc.$wrap = $("<div />").addClass("btn-group").attr("role", "group");
	_.each(fc.buttons, function(btn){
		btn.$el = fc.$wrap;
		if (btn.type == "dropdown") {
			SWAM.Form.Builder.dropdown(btn, form_info);
			btn.$child.attr("class", "btn-group").attr("role", "group");
		} else {
			SWAM.Form.Builder.button(btn, form_info);
		}
	});
	fc.$el.append(fc.$wrap);
}

SWAM.Form.Builder.image = function(fc, form_info) {
	if (!fc.label) fc.label = "upload";
	fc.$label = SWAM.Form.Builder.label(fc);
	fc.$input = $("<input />")
		.addClass("thumbnail-picker thumbnail-picker-md")
		.addClass("input-" + fc.type);
	fc.$input.prop("type", "file");
	fc.$input.data("label", fc.label);

	if (fc.value) {
		fc.$input.data("image", fc.value);
	}
	fc.$el.append(fc.$input);
	fc.value = null;
	return fc;
}

