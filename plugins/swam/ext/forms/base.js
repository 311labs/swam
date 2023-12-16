SWAM.Form = {
	changes_only: true, // only return changes on a form from existing data
};

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

	$form.find('input[type="checkbox"]').each(function(k, v){
		let $field = $(v);
		data[v.name] = $field.is(":checked");
	});

	$form.find('input[data-role="tagsinput"]').each(function(k, v){
		let $field = $(v);
		data[v.name] = $field.tagsinput('items_mapped');
	});

	$form.find('button.thumbnail-media-picker').each(function(k, v){
		let $field = $(v);
		data[v.name] = $field.data('image-data');
	});

	$form.find('input.form-control-color').each(function(k, v){
		let $field = $(v);
		let val = $field.val();
		if (val.upper() == "#D3C5C5") {
			val = ""
		}
		data[v.name] = val;
	});

	$form.find('input[data-localize]').each(function(k, v){
		let $field = $(v);
		let localize = $field.data("localize");
		if (SWAM.Form.unlocalize[localize]) {
			data[v.name] = SWAM.Form.unlocalize[localize](data[v.name]);
		}
	});

	if (data.fkuser != undefined) delete data.fkuser;
	if (data.fkpassword != undefined) delete data.fkpassword;
	if (opts.defaults) data = _.extend(opts.defaults, data);
	return data;
};

