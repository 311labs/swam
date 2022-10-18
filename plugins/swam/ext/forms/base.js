SWAM.Form = {};

SWAM.Form.getDataWithImage = function(img, $form, options) {
	options = _.extend({}, {"name":"thumbnail", "filename":"image.png", "content_type": "image/png"}, options);

	var formdata = new FormData($form[0]);
	var blobBin = null;
	if (img.toDataURL) {
	    blobBin = atob(img.toDataURL().split(',')[1]);
	} else {
	    blobBin = atob(img.src.split(',')[1]);
	}
	var array = [];
	for(var i = 0; i < blobBin.length; i++) {
	    array.push(blobBin.charCodeAt(i));
	}
	var file=new Blob([new Uint8Array(array)], {type: options.content_type});
	formdata.append(options.name, file, options.filename);


	var data = SWAM.Form.getData($form, options);
	data.__files = {
	    formvals: {},
	    files: [file]
	};
	data.__files.formdata = formdata;
	return data;
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


	var files = {};
	$form.find('input[value!=""]:file:enabled').each(function(k,field){
		var $field = $(field);
		var n = $field.attr('name');
		data[n] = $field.val();
		files[n] = $field;
	});
	if (_.keys(files).length) {
		data.__files = {
			form: $form,
			formvals: data,
			files: files
		};
		try {
			data.__files.formdata = new FormData($form[0]);
		} catch(e) {
		}
	}
	return data;
};