
SWAM.Form.build = function(fields, defaults, $form, model, fake_fields, extra, no_hidden) {
	// hack for material theme
	var append_label = false;
	if (window.app && window.app.app_theme == "material") {
		append_label = true;
	}
	if ($form && $form.attributes) {
		model = $form;
		$form = $("<form />");
	} else if (!$form) {
		$form = $("<form />");
	}

	var col_total = 0;
	var grp_col_total = 0;
	var $prow = null;
	var $input;
	if (extra == undefined) {
		// console.log("new extras: ");
		extra = _.extend({}, defaults);
	}

	if (fake_fields) {
		$input = $("<input />")
				.css('display', 'none')
				.prop('name', 'fkuser')
				.prop('type', 'text')
				.appendTo($form);
		$input = $("<input />")
				.css('display', 'none')
				.prop('name', 'fkpassword')
				.prop('type', 'password')
				.appendTo($form);
			$form.attr("autocomplete", "off");
        $input = null;
	}


	_.each(fields, function(field) {
		if (!field) return;
		if (field.type == "group") {
			if (field.columns) {
				if (grp_col_total == 0) {
					$prow = $("<div />").addClass('row');
					$prow.appendTo($form);
				}
				var col_size = "sm";
				if (field.column_size) col_size = field.column_size;
				var $col = $("<div />").addClass('col-'+col_size+'-' + field.columns);
				if (field.columns_classes) $col.addClass(field.columns_classes);
				grp_col_total += field.columns;
				if (grp_col_total >= 12) grp_col_total = 0;
				$row = SWAM.Form.build(field.fields, defaults, $col, model, fake_fields, extra, true);
				// $col.append($row);
				$prow.append($col);
			} else {
				$row = SWAM.Form.build(field.fields, defaults, $form, model, fake_fields, extra, true);
				// $form.append($row);
			}
			return;
		}

		var $row = $("<div />").addClass("form-container");
		var $label;
		if (field.label) {
			$label = $("<label for='" + field.name + "' />").addClass("form-label").text(field.label);
		} else if (!field.type ||(field.type == "text")) {
			if ((window.app && window.app.app_theme == "material")||(field.help)) {
				$label = $("<label for='" + field.name + "' />").text(" ");
			}
		}

		if (field.help || field.search_terms) {
			if (!$label) $label = $("<label for='" + field.name + "' />");
			if (field.search_terms) {
				field.help = "search for keywords or a specific term&#10;&nbsp;&nbsp;term=1234&nbsp;&nbsp; term>1234 &nbsp;&nbsp;term>=1234&#10;&#10;List of supported terms:&#10;&nbsp;&nbsp;";
				field.help += field.search_terms.join("&#10;&nbsp;&nbsp;");
				field.help_pos = field.help_pos || "down";
			}
			field.help_pos = field.help_pos || "right";
			field.help_length = field.help_length || "medium";
			if ($label) $label.append('<a class="input-help"  data-balloon-pos="'+ field.help_pos + '" aria-label="' + field.help + '" data-balloon-length="' + field.help_length + '" href="#"><i class="fas fa-question-circle"></i></a>');
		}

		if (!field.type && !field.name) field.type = "spacer";
		if (!field.type) field.type = "text";

		if ((field.type == "date")||(field.type == "datemonth")) {
			field.icon = "fa fa-calendar";
		} else if (field.type == "datetime") {
            field.icon = "far fa-clock";
		}
		else if (field.type == "timepicker") {
            field.icon = "far fa-clock";
        }

		if (field.type == "textarea") {
			$input = $("<textarea required />")
				.addClass("form-control input-text")
				.prop('name', field.name);
			if (field.rows) {
				$input.attr("rows", field.rows);
			}
		} else if (field.type == "html") {
			// $form.append(field.value);
            $input = $(field.value);
            // return;
        } else if (field.type == "template") {
            // $form.append(field.value);
            $input = $(SWAM.renderTemplate(field.template, {"model":model, "data":field.data}));
            // return;
		} else if (field.type == "button") {
			$input = $("<button />")
				.prop("type", "button")
				.html(field.label);
			if (field.className) {
				$input.addClass(field.className);
			}
			if (field.action) {
				$input.data("action", field.action);
			}
			$label = null;
		} else if (field.type == "button_options") {
			$input = $("<button />")
				.prop("type", "button")
				.html(field.label);
			if (field.action) $input.data("action", field.action);
			if (field.value != undefined) $input.data("value", field.value);
			if (field.name) $input.data("name", field.value);
			$label = null;
		} else if (field.type == "image") {
			field.label = field.label || "upload";
			$label = null;
			$input = $("<input />")
				.prop('name', field.name)
				.prop('type', 'file')
				.prop('id', 'thumbnail')
				.addClass('thumbnail-picker thumbnail-picker-md')
				.data("label", field.label);
		}  else if (field.type == "media_item") {
			field.label = field.label || "select media";
			$input = $("<button />")
				.prop('name', field.name)
				.addClass('inputimage-wrapper thumbnail-media-picker thumbnail-picker-md')
				.data("label", field.label);
			if (field.media_kind) {
				$input.data("media-kind", field.media_kind);
			}
			var $span = $("<span class='inputimage'>");
			var $spanlabel = $("<div class='input-label'>");
			var $img = $("<img class='preview'>");
			$img.attr("src", "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjQ0LjQ2MDkzNzUiIHk9IjEwMCIgc3R5bGU9ImZpbGw6I0FBQUFBQTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB0O2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPnVwbG9hZCB0aHVtYm5haWw8L3RleHQ+PC9nPjwvc3ZnPg==");
			$spanlabel.html("Click to pick");
			$span.append($img);
			$span.append($spanlabel);
			$input.append($span);
		} else if (field.type == "daterange") {
			if (!field.placeholder) field.placeholder = "Select Date Range";
			if (!field.classes) field.classes = "daterange-input";
			if (field.name) {
				var $start_input = $("<input />")
					.prop('name', field.name + "start")
					.prop('type', 'hidden');
				var $end_input = $("<input />")
					.prop('name', field.name + "end")
					.prop('type', 'hidden');

				$row.append($start_input);
				$row.append($end_input);
			}

			$input = $("<div />")
				.data("name", field.name)
				.prop("id", field.name)
				.append($("<i />").addClass("fas fa-calendar"))
				.append("<span>" + field.placeholder + "</span>")
				.append($("<i />").addClass("fa fa-caret-down pull-right"));
			// $label = null;
        } else if (field.type == "datetime") {
            if (!field.placeholder) field.placeholder = "Select Date";
            if (!field.classes) field.classes = "datetime-input";
            $input = $("<div />")
                .append($("<i />").addClass("fas fa-calendar"))
                .append("<span>" + field.placeholder + "</span>")
                .append($("<i />").addClass("fa fa-caret-down pull-right"));
            // $label = null;
		} else if (field.type == "select") {
			$input = $("<select />")
				.addClass("form-select")
				.prop('name', field.name);

			if (field.disabled) {
				$input.attr('disabled', 'disabled');
			}
			if (field.editable) {
				$input.addClass("editable");
			} else {
				$input.addClass("normal");
			}

			if (field.multiple || field.multi) {
				$input.attr("multiple", "multiple");
			}

			if (_.isString(field.options)) {
				if (field.options == "groups") {
					app.groups.each(function(group){
						var $opt = $("<option />").text(group.get("name")).val(group.id);
						$input.append($opt);
					});
				} else {
					// we assume the data has been preloaded
					// first check for select version
					var dataset = SWAM.DataSets.get(field.options + "_select");
					if (!dataset || _.isEmpty(dataset)) dataset = SWAM.DataSets.get(field.options);

					if (_.isArray(dataset)) {
						_.each(dataset, function(value){
							var $opt;
							if (_.isObject(value)) {
								$opt = $("<option />").text(value.label).val(value.value);
								$input.append($opt);
							} else {
								$opt = $("<option />").text(value).val(value);
								$input.append($opt);
							}
						});
					} else {
						// console.log(dataset);
						var keys = [], len = 0;
						// console.log(Object.keys(dataset));
						_.each(dataset, function(value, key){
							console.log(key);
							keys.push(key);
						});
						keys.sort();
						len = keys.length;
						for (i = 0; i < len; i++) {
							var value = dataset[keys[i]];
							var key = keys[i]
							$opt = $("<option />").text(value).val(key);
							$input.append($opt);
						}
					}
				}
			} else if (_.isArray(field.options)) {
				_.each(field.options, function(value){
					var $opt;
					if (_.isObject(value)) {
						$opt = $("<option />").text(value.label).val(value.value);
						$input.append($opt);
					} else {
						$opt = $("<option />").text(value).val(value);
						$input.append($opt);
					}
				});
			} else if (field.start != undefined && field.start.isNumber()) {
				field.end = field.end || field.stop || 5;
				var i = field.start;
				var s = field.step || 5;
				var sstep = ("" + s);
				var is_dec = (sstep.indexOf('.') >= 0);
				var dec_size = 0;
				if (is_dec) {
					dec_size = sstep.substr(sstep.indexOf('.')+1).length;
				}
				for (; i <= field.end; i+=s) {
					var v = i;
					if (dec_size) v = v.toFixed(dec_size);
					var l = v;
					if (field.percent) l = (i * 100).toFixed(Math.max(dec_size - 2), 0) + "%";
					if (field.suffix) l = l + field.suffix;
					$opt = $("<option />").text(l).val(v);
					$input.append($opt);
				}
			} else if (field.options && field.options.fetch) {
				// we assume this is a collection
				$input = $("<div />")
					.addClass("collection-select")
					.data('field-name', field.name);
				if (model) {
					var sv = model.get(field.name);
					if (sv && sv.id) {
						sv = sv.id;
					}
					if (sv) {
						$input.data('selected-id', sv);
					}
				}
				if (field.cs_opts) $input.data("options", field.cs_opts);
				$input.data("collection", field.options)
				if (field.is_parent_model) $input.data("is_parent_model", 1);
			} else if (field.options && _.isFunction(field.options)) {
				var f_options = field.options();
				_.each(f_options, function(value){
					var $opt;
					if (_.isObject(value)) {
						if (value.requires_perm && !app.me.hasPerm(value.requires_perm)) {
							return;
						}
						$opt = $("<option />").text(value.label).val(value.value);
						$input.append($opt);
					} else {
						$opt = $("<option />").text(value).val(value);
						$input.append($opt);
					}
				});
			}

			if (field.default != undefined) {
				if (!defaults) defaults = {};
				defaults[field.name] = field.default;
			}
		} else if (field.type == "heading") {
			if (!field.value) field.value = field.label;
			$row.append($("<h4 />").addClass("heading").html(field.value));
			$form.append($row);
			return;
		} else if (field.type == "spacer") {
			$input = $("<p />");
			if (field.value) {
				$input.html(field.value);
			}
		} else if (field.type == "line") {
			$input = $("<hr />");
		} else if (field.type == "checkbox") {
			$row.addClass("form-check");
			$input = $("<input />")
				.prop('name', field.name);
			$input.prop('type', "checkbox");
		} else if (field.type == "toggle") {
			$input = $("<input />")
				.prop('name', field.name);
			$input.addClass("form-check-input");
			$label.addClass("form-check-label");
			$input.prop('type', "checkbox");
			$input.attr("role", "switch");
			// $input.attr("data-size", "mini");
			// $input.attr("data-on", "success");
			// $input.attr("data-off", "danger");
			if (_.isString(field.value)) $input.attr("data-value", field.value)
		} else if (field.type == "color") {
			$input = $("<input />")
				.addClass("input-" + field.type)
				.prop("type", "color")
				.prop('name', field.name);
		} else {
			$input = $("<input required />")
				.addClass("form-control")
				.addClass("input-" + field.type);


			if (field.autocomplete === false) {
				$input.attr("autocomplete", "new-" + field.name);
				$input.data("name", field.name);
				$input.on("focus", function(){$(this).prop("name", $(this).data("name"));})
			} else {
				$input.prop("name", field.name);
			}

			if ((field.type == "date")||(field.type == "datemonth")) {
				$input.prop('type', "text");
			} else if (field.type == 'tags') {
				$input.prop('type', "text");
				$input.addClass("fb-tags");
				if (field.tag_opts) $input.data("options", field.tag_opts);
			} else {
				$input.prop('type', field.type);
			}

			if (field.maxlength) $input.prop("maxlength", field.maxlength);
		}

		if (field.locked || field.readonly) {
			$row.addClass("locked");
			$input.addClass("locked");
			$input.attr("readonly", "readonly");
		}

		if (field.prompt_reason) {
			$input.attr("prompt_reason", "true");
		}

		if (field.classes) $input.addClass(field.classes);

		if (field.type == "checkbox") {
			$subrow = $("<div />").addClass("form-check").appendTo($row);
			$label = $("<label />").addClass("form-check-label").text("  " + field.label);
			$subrow.append($label);
			$label.prepend($input);
			if (_.isString(field.value)) $input.prop("value", field.value)
		} else if (field.type == "toggle") {
			$subrow = $("<div />").addClass("form-check form-switch").appendTo($row);
			$label = $("<label />").addClass("form-check-label").text("  " + field.label);
			$subrow.append($label);
			$label.prepend($input);
			if (_.isString(field.value)) $input.prop("value", field.value)
		} else {
			if (field.button) {
				var $fg = $("<div class='input-group' />");
				$fg.addClass("input-" + field.type);
				$input.removeClass("input-" + field.type);
				if ($label && !append_label) $row.append($label);
				if ((field.type == "date")||(field.type == "datemonth")) $fg.addClass("date");
				$fg.append($input);
				$fg.append("<div class='input-group-btn'><button class='btn btn-default'><i class='" + field.button.icon + "'></i></button></div>");
				$row.append($fg);
				if ($label && append_label) $row.append($label);
			} else if (field.icon) {
				var $fg = $("<div class='input-group' />");
				$fg.addClass("input-" + field.type);
				$input.removeClass("input-" + field.type);
				if ($label && !append_label) $row.append($label);
				if ((field.type == "date")||(field.type == "datemonth")) $fg.addClass("date");
				$fg.append($input);
				$fg.append("<div class='input-group-addon'><i class='" + field.icon + "'></i></div>");
				$row.append($fg);
				if ($label && append_label) $row.append($label);
			} else {
				if ($label && !append_label) $row.append($label);
				$row.append($input);
				if ($label && append_label) $row.append($label);
			}
		}

		if ($label && (!$label.text())) $label.addClass("empty");


		if (field.form_wrap) {
			var $wrap = $("<form />").addClass(field.form_wrap).addClass("inline-form");
			$wrap.append($row);
			$row = $wrap;
		}

		if (field.columns) {
			if (col_total == 0) {
				$prow = $("<div />").addClass('row');
				$prow.appendTo($form);
			}
			var col_size = "sm";
			if (field.column_size) col_size = field.column_size;
			var $col = $("<div />").addClass('col-'+col_size+'-' + field.columns);
			if (field.columns_classes) $col.addClass(field.columns_classes);
			col_total += field.columns;
			if (col_total >= 12) col_total = 0;
			$col.append($row);
			$prow.append($col);
		} else {
			$form.append($row);
		}

		if (field.placeholder) $input.attr("placeholder", field.placeholder);
		if ((field.type == "checkbox")||(field.type == "toggle")) {
			if (field.value) {
				if (!_.isBoolean(field.value) && field.value.isNumber()) field.value = field.value.toInt();
				if (_.isString(field.value)) {
					if (!model) $input.prop('checked', 0);
				} else {
					if (!model) $input.prop('checked', field.value);
				}
			}
			if (model) {
				var v = model.get(field.name, {default:undefined});
				if (_.isUndefined(v) && !_.isUndefined(field.default)) {
					v = field.default;
				}
				if (!_.isUndefined(v)) {
					var is_checked = false;
					if (_.isString(v)) {
						if (v && v.isNumber()) v = v.toInt();
						$input.prop('checked', v);
					} else if (_.isArray(v) && field.value) {
						// console.log("THIS IS A GROUP CHECKBOX");
						// console.log(v);
						// console.log(field.value);
						// console.log(v.indexOf(field.value));
						if (v.indexOf(field.value) >= 0) is_checked=true;
						$input.prop("checked", is_checked);
					} else {
						// console.log("THIS IS A PLAIN CHECKBOX");
						$input.prop('checked', v);
					}
				}
			}else{
				if (field.name && defaults && !_.isUndefined(defaults[field.name])) {
					var is_checked = false;
					var v = defaults[field.name];
					if (_.isString(v)) {
						if (v && v.isNumber()) v = v.toInt();
						$input.prop('checked', v);
					} else if (_.isArray(v) && field.value) {
						if (v.indexOf(field.value) >= 0) is_checked=true;
					} else {
						$input.prop('checked', v);
					}
					if (!_.isUndefined(extra[field.name])) {
						delete extra[field.name];
					}
				}
			}
		} else if (field.type == "image") {
			if (model) {
				var fkey = field.field;
				if (!fkey) fkey = field.name;
				var rawimg = model.get(field.name);
				if (rawimg) {
					if (rawimg.thumbnail) rawimg = rawimg.thumbnail;
					$input.data("image", rawimg);
				}
			}
		}  else if (field.type == "media_item") {
			var media_val;
			if (model && model.get(field.name)) {
				media_val = model.get(field.name);
			} else if (field.name && defaults && !_.isUndefined(defaults[field.name])) {
				if (!model || model.get(field.name, {default:undefined}) == undefined) {
					media_val = defaults[field.name];
					if (!_.isUndefined(extra[field.name])) {
						delete extra[field.name];
					}
				} else if (!_.isUndefined(extra[field.name])) {
					delete extra[field.name];
				}
			}
			var $img = $input.find("img");
			var $spanlabel = $input.find(".input-label");
			if (media_val) {
				$spanlabel.html("Change");
				if (app._parseQueryString) {
					//extract thumbnail from url
					var queryParams = app._parseQueryString(media_val);
					console.log(queryParams);
					if (queryParams.thumbnail) {
						//use thumbnail
						$img.attr('src', queryParams.thumbnail);
					}else{
						//use original as thumbnal
						$img.attr('src', media_val);
					}
				}else{
					//use original as thumbnal
					$img.attr('src', media_val);
				}
			}else{
				$spanlabel.html("Click to pick");
				$img.attr("src", "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjQ0LjQ2MDkzNzUiIHk9IjEwMCIgc3R5bGU9ImZpbGw6I0FBQUFBQTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB0O2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPnVwbG9hZCB0aHVtYm5haWw8L3RleHQ+PC9nPjwvc3ZnPg==");
			}
		} else if (field.name) {
			if (field.value) $input.val(field.value);
			if (model) {
				var v = model.get(field.name, {default:undefined});
				if (_.isUndefined(v) || _.isNull(v)) {
					if (field.default) $input.val(v);
				} else if (field.type == "date") {
					$input.val(model.get(field.name, "date"));
				} else if (field.type == "datetime") {
					$input.val(model.get(field.name, "datetime"));
				} else {
					$input.val(model.get(field.name));
					$input.attr("data-value", model.get(field.name))
				}
			} else if (!_.isUndefined(field.default)) {
				$input.val(field.default);
			}
		} else {
			if (field.value) $input.val(field.value);
		}

		if (field.attributes) {
			for (var attr in field.attributes) {
				$input.attr(attr, field.attributes[attr]);
			}
		}

		if (field.name && defaults && !_.isUndefined(defaults[field.name])) {
			if (!model || model.get(field.name, {default:undefined}) == undefined) {
				// console.log("setting default " + field.name + " = " + defaults[field.name]);
				// console.log($input);
				$input.val(defaults[field.name]);
				if (!_.isUndefined(extra[field.name])) {
					delete extra[field.name];
				}
			} else if (!_.isUndefined(extra[field.name])) {
				delete extra[field.name];
			}
		}
	});

	if (!no_hidden) {
		_.each(extra, function(value, key) {
			$input = $("<input />")
					.prop('type', "hidden")
					.prop('name', key)
					.val(value)
					.appendTo($form);
		});
	}

	return $form;
}
