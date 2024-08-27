

SWAM.Form.build = function(fields, defaults, model, options) {
	options = options || {};
	var form_info = {};
	form_info.defaults = defaults;
	form_info.model = model;
	form_info.columns = 0;
	form_info.$row = null;
	form_info.$form = options.$form || $('<form autocorrect="off" spellcheck="false" autocomplete="off" />');

	_.each(fields, function(field) {
		if (!field || field.form_ignore) return;
		if ((field == "")|| (field == " ")) field = {type:"line", columns:12};
		if (_.isString(field)) field = {label:field, type:"label"};
		var fc = _.extend({type:"text", columns:12, column_size:"sm"}, _.deepClone(field)); // copy the field so we can manipulate its info
		if (options.config && field.name && options.config[field.name]) {
			fc = _.extend(fc, options.config[field.name]);
		}

		if (fc.type == "group") {
			SWAM.Form.buildGroup(fc, form_info);
			return;
		}

		fc.$el = $("<div />").addClass("swam-form-input").addClass(fc.type + "-input-group");
		if (fc.floating_label) {
			fc.append_label = true;
			fc.$el.addClass("form-floating");
		}
		if (fc.nopad) fc.$el.addClass("p-0")
		if ((fc.requires_perm) && (!app.me || !app.me.hasPerm(fc.requires_perm))) return;
		SWAM.Form.buildField(fc, form_info);
		SWAM.Form.Builder.form_wrap(fc, form_info);
		SWAM.Form.Builder.row(fc, form_info);

	});

	return form_info.$form;
}

SWAM.Form.buildField = function(fc, form_info) {
	var func_name = fc.type;
	if (fc.field && !fc.name) fc.name = fc.field; // common type when building forms
	if (fc.name) {
		SWAM.Form.Builder.getValue(fc, form_info);
	}
	if (_.isFunction(SWAM.Form.Builder[func_name])) {
		SWAM.Form.Builder[func_name](fc, form_info);
	} else {
		SWAM.Form.Builder.text(fc);
	}
	
	if (fc.$input) {
		if (fc.field && !fc.name) fc.name = fc.field;
		if (fc.name) fc.$input.attr("name", fc.name);
		if (fc.required) fc.$input.prop("required", true);
		if (fc.disabled) fc.$input.attr("disabled", "disabled");
		if (fc.readonly) fc.$input.prop("readonly", true);
		if (fc.fixedlength) fc.$input.prop("fixedLength", fc.fixedlength);
		if (fc.minlength) fc.$input.prop("minLength", fc.minlength).addClass("watch-length");
		if (fc.maxlength) fc.$input.prop("maxLength", fc.maxlength).addClass("watch-length");
		if (fc.placeholder) fc.$input.attr("placeholder", fc.placeholder);
		if (fc.action) fc.$input.attr("data-action", fc.action);
		if (fc.validator) fc.$input.attr("data-validator", fc.validator);
		if (fc.transform) fc.$input.attr("data-transform", fc.transform);
		if (fc.monospace) fc.$input.addClass("font-monospace");
		if (fc.maxdays) fc.$input.attr("data-maxdays", fc.maxdays);
		if (fc.add_classes) fc.$input.addClass(fc.add_classes);
		if (_.isString(fc.monospace)) {
			fc.$input.addClass(`font-monospace-${fc.monospace}`);
		}
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

		if (fc.value != undefined) {
			SWAM.Form.Builder.value(fc, form_info);
		}
	}

	if (fc.optional && fc.$el) {
		fc.$el.addClass("optional");
	}

	if (fc.trim) {
		fc.$input.attr("data-format", "trim");
	}

	if (fc.help) {
		if (fc.$label) {
			fc.$label.after(SWAM.Form.Builder.help(fc, form_info));
		} else if (fc.$input) {
			fc.$input.before(SWAM.Form.Builder.help(fc, form_info));
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

SWAM.Form.Builder = {
	config:{
		btn_classes: "btn btn-primary",
		dropdown_btn_classes: "btn btn-secondary dropdown-toggle",
		input_group_btn_classes: "btn btn-default btn-outline-secondary"
	}
};

SWAM.Form.Builder.getValue = function(fc, form_info) {
	if (form_info.defaults && (form_info.defaults[fc.name] != undefined)) fc.default = form_info.defaults[fc.name];
	if ((fc.value == undefined) && (fc.default != undefined)) fc.value = fc.default;

	if (form_info.model) {
		if ((fc.type == "date") || (fc.type == "datetime")) {
			fc.value = form_info.model.get(fc.name, fc.value, fc.type);
		} else {
			fc.value = form_info.model.get(fc.name, fc.value, fc.localize);
		}
		if (_.isDict(fc.value)) {
			if (fc.value.id) {
				fc.value = fc.value.id;
			} else if (fc.type === "textarea") {
				fc.value = JSON.stringify(fc.value, undefined, 4);
			}
		}
	}
}

SWAM.Form.Builder.value = function(fc, form_info) {
	if (fc.type == "file") return;
	fc.$input.val(fc.value);
	if (fc.is_checkbox) {
		if (fc.value == undefined) fc.value = 0;
		if (!_.isBoolean(fc.value) && fc.value.isNumber()) fc.value = fc.value.toInt();
		if (_.isString(fc.value)) fc.value = 0;
		fc.$input.prop("checked", fc.value);
	} else if (fc.type == "select") {
		if (fc.value) {
			// add an option for the value if missing
			var exists = false;
			fc.$input.find("option").each(function(){
			    if (this.value == fc.value) {
			        exists = true;
			        return false;
			    }
			});
			if (!exists) {
				fc.$input.append($("<option />").text(fc.value).val(fc.value));
			}
			fc.$input.attr("data-value", fc.value);
			fc.$input.val(fc.value);
		}
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
		fc.$label = lbl;
		if (fc.type == "label") {
			fc.$el.append(fc.$label);
		}
		return lbl;
	}
	return null;
}

SWAM.Form.Builder.help = function(fc, form_info) {
	
	if (fc.help) {
		fc.help_title = fc.help_title || "Help";
		var el =$('<button tabindex="-1" type="button" data-bs-html="true" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-placement="top" data-bs-content="' + fc.help + '" />')
			.addClass("btn btn-help")
			.attr("title", fc.help_title)
			.text("?");
		return el;
	}
	return null;
}

SWAM.Form.Builder.file = function(fc, form_info) {
	fc = SWAM.Form.Builder.text(fc, form_info);
	if (fc.max_file_size) fc.$input.attr("data-filesize", fc.max_file_size.fileSizeToBytes());
	return fc;
}

SWAM.Form.Builder.mediapicker = function(fc, form_info) {
	fc = SWAM.Form.Builder.text(fc, form_info);
	if (!fc.$btn_wrap) fc.$btn_wrap = $("<div class='form-text-btngroup>");
	SWAM.Form.Builder.button({
		$el: fc.$btn_wrap,
		classes: "btn-media-picker",
		action: "mediapicker",
		icon: "file-earmark-image"
	});
	if (fc.$wrap) {
		fc.$wrap.append(fc.$btn_wrap);
	} else {
		fc.$el.append(fc.$btn_wrap);
	}

}

SWAM.Form.Builder.text = function(fc, form_info) {
	if (fc.button || fc.icon || fc.left_icon) {
		fc = SWAM.Form.Builder.input_group(fc, form_info);
	} else {
		SWAM.Form.Builder.label(fc);
		fc.$input = $("<input />").addClass("form-control form-control-" + fc.type).addClass("input-" + fc.type);
		fc.$input.prop("type", fc.type);
		SWAM.Form.Builder.orderLabel(fc, form_info);
	}

	if (fc.can_clear) {
		if (!fc.$btn_wrap) fc.$btn_wrap = $("<div class='form-text-btngroup'></div>");
		SWAM.Form.Builder.button({
			$el: fc.$btn_wrap,
			classes: "btn-clear",
			action: "clear_field",
			icon: "x-circle-fill"
		});
		if (fc.$wrap) {
			fc.$wrap.append(fc.$btn_wrap);
		} else {
			fc.$el.append(fc.$btn_wrap);
		}
	}
	return fc;
}

SWAM.Form.Builder.password = function(fc, form_info) {
	SWAM.Form.Builder.text(fc, form_info);
	fc.$input.attr("autocomplete", "new-password");
	if (fc.can_view) {
		SWAM.Form.Builder.button({
			$el: fc.$el,
			classes: "btn-icon",
			action: "show_password",
			icon: "eye-fill"
		});
	}
	if (fc.random && !fc.value) {
		let possible = null;
		if (fc.digits_only) {
			possible = "123567890";
		}
		fc.value = String.Random(fc.random, possible);
	}
	return fc;
}

SWAM.Form.Builder.color = function(fc, form_info) {
	SWAM.Form.Builder.label(fc);
	fc.$input = $("<input />").addClass("form-control form-control-" + fc.type).addClass("input-" + fc.type);
	fc.$input.prop("type", fc.type);
	fc.$el.append(fc.$label);
	if (fc.show_value) {
		let $wrapper = $("<div />")
			.append(fc.$input)
			.append($(`<div class='color-display' id='display_${fc.name}'>${fc.value}</div>`));
		fc.$el.append($wrapper);
		if (fc.can_clear) {
			SWAM.Form.Builder.button({
				$el: $wrapper,
				classes: "btn-clear btn btn-link",
				action: "clear_field",
				icon: "x-circle-fill"
			});
		}
	} else {
		SWAM.Form.Builder.orderLabel(fc, form_info);
	}
	return fc;
}

SWAM.Form.Builder.textarea = function(fc, form_info) {
	SWAM.Form.Builder.label(fc);
	fc.$input = $("<textarea />").addClass("form-control form-control-" + fc.type).addClass("input-" + fc.type);
	if (!fc.rows) fc.rows = 3;
	if (fc.autoheight) fc.$input.addClass("textarea-autoheight");
	fc.$input.attr("rows", fc.rows);
	if (fc.markdown) fc.$input.addClass("textarea-mde");
	SWAM.Form.Builder.orderLabel(fc, form_info);
	return fc;
}

SWAM.Form.Builder.line = function(fc, form_info) {
	fc.$el.removeClass("swam-field");
	fc.$el.append("<hr />");
}

SWAM.Form.Builder.empty = function(fc, form_info) {
	fc.$el.append("&nbsp;");
}

SWAM.Form.Builder.heading = function(fc, form_info) {
	if (!fc.size) fc.size = 3;
	var tag = "h" + fc.size;
	var el = document.createElement(tag);
	fc.$el = $(el).html(fc.value || fc.label);
	if (fc.classes) fc.$el.addClass(fc.classes);
}

SWAM.Form.Builder.html = function(fc, form_info) {
	fc.$el = $("<div />").html(fc.value || fc.label);
}

SWAM.Form.Builder.button = function(fc, form_info) {
	SWAM.Form.Builder.iconlabel(fc);
	fc.$button = $("<button type='button' />").html(fc.label);
	if (fc.disabled) fc.$button.attr("disabled", "disabled");
	if (fc.action) fc.$button.attr("data-action", fc.action);
	if (!fc.classes) fc.classes = SWAM.Form.Builder.config.btn_classes;
	if (fc.full_width) fc.$el.addClass("d-grid");
	fc.$button.attr("class", fc.classes);
	if (fc.fake_label) fc.$el.append("<div><label class='form-label'>&nbsp;</label></div>");
	if (fc.tooltip) {
		fc.$button
			.attr("data-bs-toggle", "tooltip")
			.attr("data-bs-placement", "bottom")
			.attr("title", fc.tooltip);
	}
	fc.$el.append(fc.$button);
}

SWAM.Form.Builder.checkbox = function(fc, form_info) {
	fc.$wrap = $("<div />").addClass("form-check");
	fc.$el.append(fc.$wrap);
	SWAM.Form.Builder.label(fc);
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
	if (fc.off_label) {
		if (!fc.on_label) fc.on_label = fc.label; 
		fc.$input.data("off-label", fc.off_label);
		fc.$input.data("on-label", fc.on_label);
		if (fc.value == undefined) fc.value = 0;
		if (!_.isBoolean(fc.value) && fc.value.isNumber()) fc.value = fc.value.toInt();
		if (_.isString(fc.value)) fc.value = 0;
		if (fc.value) {
			fc.$label.text(fc.on_label);
		} else {
			fc.$label.text(fc.off_label);
		}
	}

	return fc;
}

SWAM.Form.Builder.input_group = function(fc, form_info) {
	SWAM.Form.Builder.label(fc);
	fc.$el.append(fc.$label);
	fc.$wrap = $("<div />").addClass("input-group");
	if (fc.size) fc.$wrap.addClass("input-group-" + fc.size);
	fc.$el.append(fc.$wrap);
	if (fc.left_icon) {
		fc.$wrap.append("<div class='input-group-text'><i class='" + fc.left_icon + "'></i></div>");
	}
	fc.$input = $("<input />").addClass("form-control form-control-" + fc.type).addClass("input-" + fc.type);
	if (fc.type.startsWith("dddate")) {
		fc.$input.prop("type", "text");
	} else {
		fc.$input.prop("type", fc.type);
	}
	
	fc.$wrap.append(fc.$input);
	if (fc.button) {
		fc.button.classes = fc.button.classes || SWAM.Form.Builder.config.input_group_btn_classes;
		var $btn = $("<button class='" + fc.button.classes + "'>" + SWAM.Icons.getIcon(fc.button.icon) + "</button>");
		if (fc.button.action) $btn.attr("data-action", fc.button.action);
		fc.$wrap.append($btn);
	} else if (fc.icon) {
		fc.$wrap.append("<div class='input-group-text'>" + SWAM.Icons.getIcon(fc.icon) + "</div>");
	}
	return fc;
}

SWAM.Form.Builder.date = function(fc, form_info) {
	if (!fc.icon) fc.icon = "bi bi-calendar-month";
	SWAM.Form.Builder.input_group(fc, form_info);
	fc.$input[0].type = "text"; // bug with chrome date input?
	return fc;
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
	SWAM.Form.Builder.label(fc);
	fc.$input = $("<select />").addClass("form-select").addClass("input-" + fc.type);
	if (fc.size) fc.$input.addClass("form-select-" + fc.size);
	if (fc.multiple || fc.multi) {
		fc.$input.attr("multiple", "multiple");
	}
	if (fc.editable || fc.can_edit) {
		fc.$input.addClass("editable");
	} else {
		fc.$input.addClass("normal");
	}
	if (fc.force_top) fc.$input.addClass("force_top");
	SWAM.Form.Builder.options(fc, form_info);
	SWAM.Form.Builder.orderLabel(fc, form_info);
	return fc;
}

SWAM.Form.Builder.options = function(fc, form_info) {
	if (_.isFunction(fc.options)) {
		fc.options = fc.options(fc, form_info);
	}

	if (_.isString(fc.options)) {
		// data sets
		var dataset = SWAM.DataSets.get(fc.options + "_select");
		if (!dataset || _.isEmpty(dataset)) dataset = SWAM.DataSets.get(fc.options);
		if (dataset) fc.options = dataset;
	}

	if (fc.placeholder) {
		fc.$input.append($("<option />").text(fc.placeholder).val(""));
	}

	if (fc.collection && !fc.options) {
		fc.options = fc.collection;
	}

	if (fc.options != undefined) {
		if (_.isArray(fc.options)) {
			SWAM.Form.Builder.options_array(fc, form_info);
		} else if (_.isArray(fc.options.models)) {
			SWAM.Form.Builder.options_collection(fc, form_info);
		} else if (window.isDict(fc.options)) {
			SWAM.Form.Builder.options_dict(fc, form_info);
		}
	}

	if ((fc.start != undefined) && (fc.start.isNumber())) {
		SWAM.Form.Builder.options_range(fc, form_info);
	}

	return fc;
}

SWAM.Form.Builder.options_array = function(fc, form_info) {

	_.each(fc.options, function(value, index){
		if (_.isObject(value)) {
			if ((value.requires_perm) && (!app.me.hasPerm(value.requires_perm))) return;
			if (!fc.display_field) fc.display_field = "label";
			fc.$input.append($("<option />").text(value[fc.display_field]).val(value.value));
		} else if (fc.index_value) {
			fc.$input.append($("<option />").text(value).val(index));
		} else {
			fc.$input.append($("<option />").text(value).val(value));
		}
	});
}


SWAM.Form.Builder.options_collection = function(fc, form_info) {

	if (fc.label_field) fc.display_field = fc.label_field;
	if (!fc.value_field) fc.value_field = "id";
	if (!fc.display_field) fc.display_field = fc.value_field;
	_.each(fc.options.models, function(model){
		fc.$input.append($("<option />").text(model.get(fc.display_field)).val(model.get(fc.value_field)));
	});
}


SWAM.Form.Builder.options_dict = function(fc, form_info) {

	var keys = [], len = 0;
	_.each(fc.options, function(value, key){
		keys.push(key);
	});
	keys.sort();
	len = keys.length;
	for (i = 0; i < len; i++) {
		var value = fc.options[keys[i]];
		var key = keys[i]
		if (_.isDict(value)) {
			if (!fc.display_field) fc.display_field = "label";
			fc.$input.append($("<option />").text(value[fc.display_field]).val(key));
		} else {
			fc.$input.append($("<option />").text(value).val(key));
		}
	}
}

SWAM.Form.Builder.options_func = function(fc, form_info) {

	var items = fc.options(fc, form_info);
	_.each(items, function(value){
		if (_.isObject(value)) {
			if ((value.requires_perm) && (!app.me.hasPerm(value.requires_perm))) return;
			fc.$input.append($("<option />").text(value.label).val(value.value));
		} else {
			fc.$input.append($("<option />").text(value).val(value));
		}
	});
}

SWAM.Form.Builder.options_range = function(fc, form_info) {

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
	if (fc.icon) lbl = SWAM.Icons.getIcon(fc.icon) + ' ';
	if (fc.label) lbl = lbl + fc.label;
	fc.label = lbl;
}

SWAM.Form.Builder.searchdown = function(fc, form_info) {
	SWAM.Form.Builder.iconlabel(fc);
	fc.$el.append(SWAM.Form.Builder.label(fc, form_info));
	fc.$child = $("<div />").addClass("searchdown-input");
	if (fc.required) {
		if (!fc.options) fc.options = {};
		fc.options.required = true;
	}
	if (fc.options) fc.$child.data("options", fc.options);
	if (_.isFunction(fc.collection)) fc.collection = fc.collection(fc, form_info);
	fc.$child.data("collection", fc.collection);
	fc.$child.data("name", fc.name);
	fc.$el.append(fc.$child);

	return fc.$el;
}

SWAM.Form.Builder.dropdown = function(fc, form_info) {
	SWAM.Form.Builder.iconlabel(fc);
	fc.did = _.uniqueId("dropdown");
	fc.$child = $("<div />").addClass("dropdown");
	if (fc.classes) fc.$child.addClass(fc.classes);
	if (!fc.btn_classes && fc.dropup) {
		fc.btn_classes = SWAM.Form.Builder.config.dropdown_btn_classes + " dropup";
	}

	if (fc.value != undefined) {
		let item = _.findWhere(fc.items, {id:fc.value});
		if (item) {
			fc.label = item.label;
			if (item.icon) fc.icon = item.icon;
			SWAM.Form.Builder.iconlabel(fc);
		}
	}

	var $button = $("<button />")
		.prop("type", "button")
		.attr("id", fc.did)
		.attr("data-bs-toggle", "dropdown")
		.attr("aria-expanded", "false")
		.addClass(fc.btn_classes || SWAM.Form.Builder.config.dropdown_btn_classes)
		.html(fc.label);

	if (fc.className) {
		$button.addClass(fc.className);
	}
	if (fc.action) {
		// $input.data("action", fc.action);
		$button.attr("data-action", fc.action);
	}
	fc.$child.append($button);
	
	if (fc.items) {
		SWAM.Form.Builder._dropdownmenu(fc, form_info);
	} else if (fc.fields) {
		SWAM.Form.Builder._dropdownview(fc, form_info);
	}
	
	fc.$el.append(fc.$child);
	return fc.$el;
}

SWAM.Form.Builder._dropdownmenu = function(fc, form_info) {
	var $menu = $("<ul />").addClass("dropdown-menu dropdown-menu-end shadow")
		.attr("aria-labelledby", fc.did)
		.appendTo(fc.$child);

	_.each(fc.items, function(item) {
		var $li = $("<li />").appendTo($menu);
		if (item.divider) {
			$li.append($('<hr class="dropdown-divider">'));
			return;
		}

		if ((item.requires_perm) && (!app.me || !app.me.hasPerm(item.requires_perm))) return;
		var $item = $("<a href='#' />").addClass("dropdown-item").appendTo($li);
		if (item.action) $item.attr("data-action", item.action);
		if (item.id) {
			$item.attr("data-id", item.id);
		} else if (fc.id) {
			$item.attr("data-id", fc.id);
		}
		var ilbl = "";
		if (item.icon) ilbl = SWAM.Icons.getIcon(item.icon) + ' ';
		if (item.label) ilbl = ilbl + item.label;
		$item.html(ilbl);
	});
}

SWAM.Form.Builder._dropdownview = function(fc, form_info) {
	var $menu = $("<div />").addClass("dropdown-menu dropdown-menu-end shadow p-3")
		.attr("aria-labelledby", fc.did)
		.appendTo(fc.$child);

	var $form = $("<form style='min-width: 300px;' />").appendTo($menu);

	SWAM.Form.build(fc.fields, form_info.defaults, form_info.model, {"$form":$form});
}

SWAM.Form.Builder.buttongroup = function(fc, form_info) {
	fc.$wrap = $("<div />").addClass("btn-group").attr("role", "group");
	_.each(fc.buttons, function(btn){
		btn.$el = fc.$wrap;
		if (btn.type == "dropdown") {
			if (btn.name) {
				SWAM.Form.Builder.getValue(btn, form_info);
			}
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
	SWAM.Form.Builder.label(fc);
	fc.$input = $("<input />")
		.addClass("thumbnail-picker thumbnail-picker-md")
		.addClass("input-" + fc.type);
	fc.$input.prop("type", "file");
	fc.$input.data("label", fc.label);
	value = fc.value;
	if (value) {
		if (value.thumbnail) {
			value = value.thumbnail;
		}
		fc.$input.data("image", value);
	}
	fc.$el.append(fc.$input);
	fc.value = null;
	return fc;
};



