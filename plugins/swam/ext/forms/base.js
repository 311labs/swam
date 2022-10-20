SWAM.Form = {};

SWAM.Form.getFiles = function($form) {
	var files = {};
	$form.find('input[value!=""]:file:enabled').each(function(k,field){
		var $field = $(field);
		var n = $field.attr('name');
		if (n) files[n] = $field;
	});
	return files;
}

SWAM.Form.convertToFormData = function($form, data) {
	var fdat = new FormData($form[0]);
	// update the form data with any translations etc
	_.each(data, function(f, k) {
		fdat.set(k, f);
	});
	return fdat;
}

SWAM.Form.getData = function($form, options) {
	var data = {};
	var opts = _.extend({}, {checkbox_truefalse:true}, options);
	if (!$form.is("form")) {
		throw "must be a form";
	}

	_.each($form.serializeArray(), function(f) {
		var n = f.name;
		var v = f.value;
		var c = data[n];
		if (c === undefined) {
			data[n] = v;
			return;
		} else if (!_.isArray(c)) {
			data[n] = [c, v];
		} else {
			data[n].push(v);
		}
	});

	var cboxes = {};
	var checkfields = [];
	if (opts.checkbox_truefalse) {

		$form.find('input[type="checkbox"]:not(:checked):not(:disabled)').each(function(k,v) {
			console.log(v.name + " removing " + v.value);
			if (v.value && (v.value != "off")) {

				if (!cboxes[v.name]) cboxes[v.name] = [];
			}
			if (v.name) {
				if (checkfields.indexOf(v.name) == -1) checkfields.push(v.name);
				// var c = data[v.name];
				data[v.name] = 0;
				// console.log(data);
			}
		});
		// console.log(cboxes);

		$form.find('input[type="checkbox"]:checked').each(function(k,v) {
			console.log(v.name + "adding " + v.value);
			if (v.value && (v.value != "on")) {

				if (!cboxes[v.name]) cboxes[v.name] = [];
				if ($(v).data("value")) {
					cboxes[v.name].push($(v).data("value"));
				}else{
					cboxes[v.name].push(v.value);
				}
			}

			if (v.name) {
				if (checkfields.indexOf(v.name) == -1) checkfields.push(v.name);
				data[v.name] = 1;
			}
		});
	} else {
		$form.find('input[type="checkbox"]:not(:checked):not(:disabled)').each(function(k,v) {
			// console.log(v.name + " removing " + v.value);
			if (v.value && (v.value != "off")) {
				console.log(v.name + " removing " + v.value);
				if (!cboxes[v.name]) cboxes[v.name] = [];
			}
		});

		$form.find('input[type="checkbox"]:checked').each(function(k,v) {
			// console.log(v.name + "adding " + v.value);
			if (v.value && (v.value != "on")) {
				console.log(v.name + "adding " + v.value);
				if (!cboxes[v.name]) cboxes[v.name] = [];
				cboxes[v.name].push(v.value);
			}
		});
	}

	_.each(checkfields, function(f){
		if (cboxes[f] && cboxes[f].length) {
			if (cboxes[f].length == 1) {
				data[f] = cboxes[f][0];
				if (["true", "on", "yes", "1", "enabled"].indexOf(data[f]) >= 0) data[f] = 1;
				if (["false", "no", "off", "1", "disabled"].indexOf(data[f]) >= 0) data[f] = 0;
			} else {
				data[f] = cboxes[f];
			}
		}
	});

	$form.find('input[data-role="tagsinput"]').each(function(k, v){
		console.log(k, v);
		var $field = $(v);
		data[v.name] = $field.tagsinput('items_mapped');
	});

	$form.find('button.thumbnail-media-picker').each(function(k, v){
		var $field = $(v);
		data[v.name] = $field.data('image-data');
	});

	$form.find('input[data-localize]').each(function(k, v){
		var $field = $(v);
		var localize = $field.data("localize");
		if (SWAM.Form.unlocalize[localize]) {
			data[v.name] = SWAM.Form.unlocalize[localize](data[v.name]);
		}
	});

	if (data.fkuser != undefined) delete data.fkuser;
	if (data.fkpassword != undefined) delete data.fkpassword;

	return data;
};

