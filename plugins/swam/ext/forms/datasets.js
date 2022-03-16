
SWAM.DataSets = {

	loadText: function(name, callback, context) {
		if (context) callback = _.bind(callback, context);
		if (_.isArray(name)) {
			var ready = _.extend([], name);
			var handler = function(name, data) {
				ready.remove(name);
				if (ready.length==0) {
					if (callback) callback(name);
				}
			};
			_.each(name, function(n){
				SWAM.DataSets.loadText(n, handler);
			});
		} else {
			if (!SWAM.DataSets[name]) {
				var data_url = name;
				if (!data_url.startsWith("http")) data_url = "/static/data/" + name + ".txt";
				$.ajax({
					url : data_url,
					dataType: "text",
					success : function(result) {
						SWAM.DataSets[name] = result;
						if (callback) callback(name, result);
					}});
			} else {
				if (callback) callback(name, SWAM.DataSets[name]);
			}
		}
	},

	load: function(name, callback, context) {
		if (context) callback = _.bind(callback, context);

		if (_.isArray(name)) {
			var ready = _.extend([], name);
			var handler = function(name, data) {
				ready.remove(name);
				if (ready.length==0) {
					if (callback) callback(name, data);
				}
			};
			_.each(name, function(n){
				SWAM.DataSets.load(n, handler);
			});
		} else {
			if (_.isUndefined(SWAM.DataSets[name])) {
				SWAM.DataSets[name] = {}; // so we don't reload;
				$.getJSON("/static/data/" + name + ".json", function(result) {
					SWAM.DataSets[name] = result;
					if (callback) callback(name, result);
				});
			} else {
				if (callback) callback(name, SWAM.DataSets[name]);
			}
		}
	},
	get: function(name, default_value) {
		if (_.isUndefined(default_value)) default_value = {};
		if (this[name]) return this[name];
		return default_value;
	},

	getDataValue: function(set, key, default_value) {
		var data = this.get(set);
		if (_.isUndefined(data[key])) return default_value;
		return data[key];
	},

	genders: {
		"": "Select Gender",
		"m": "Male",
		"f": "Female"
	},
	hours: {
        "": "Select Time",
		"0": "12AM (Midnight)",
		"1": "1AM",
		"2": "2AM",
		"3": "3AM",
		"4": "4AM",
		"5": "5AM",
		"6": "6AM",
		"7": "7AM",
		"8": "8AM",
		"9": "9AM",
		"10": "10AM",
		"11": "11AM",
		"12": "12PM (Noon)",
		"13": "1PM",
		"14": "2PM",
		"15": "3PM",
		"16": "4PM",
		"17": "5PM",
		"18": "6PM",
		"19": "7PM",
		"20": "8PM",
		"21": "9PM",
		"22": "10PM",
		"23": "11PM"
	},

	hours_select: [
        {value:"", label:"Select Time"},
		{value:"0", label:"12AM (Midnight)"},
		{value:"1", label:"1AM"},
		{value:"2", label:"2AM"},
		{value:"3", label:"3AM"},
		{value:"4", label:"4AM"},
		{value:"5", label:"5AM"},
		{value:"6", label:"6AM"},
		{value:"7", label:"7AM"},
		{value:"8", label:"8AM"},
		{value:"9", label:"9AM"},
		{value:"10", label:"10AM"},
		{value:"11", label:"11AM"},
		{value:"12", label:"12PM (Noon)"},
		{value:"13", label:"1PM"},
		{value:"14", label:"2PM"},
		{value:"15", label:"3PM"},
		{value:"16", label:"4PM"},
		{value:"17", label:"5PM"},
		{value:"18", label:"6PM"},
		{value:"19", label:"7PM"},
		{value:"20", label:"8PM"},
		{value:"21", label:"9PM"},
		{value:"22", label:"10PM"},
		{value:"23", label:"11PM"}
	]
};
