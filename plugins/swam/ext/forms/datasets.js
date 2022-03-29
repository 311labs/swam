
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
		"m": "Male",
		"f": "Female"
	},
	hours: {
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
		{value:"0", label:"12:00 AM (Midnight)"},
		{value:"1", label:"1:00 AM"},
		{value:"2", label:"2:00 AM"},
		{value:"3", label:"3:00 AM"},
		{value:"4", label:"4:00 AM"},
		{value:"5", label:"5:00 AM"},
		{value:"6", label:"6:00 AM"},
		{value:"7", label:"7:00 AM"},
		{value:"8", label:"8:00 AM"},
		{value:"9", label:"9:00 AM"},
		{value:"10", label:"10:00 AM"},
		{value:"11", label:"11:00 AM"},
		{value:"12", label:"12:00 PM (Noon)"},
		{value:"13", label:"1:00 PM"},
		{value:"14", label:"2:00 PM"},
		{value:"15", label:"3:00 PM"},
		{value:"16", label:"4:00 PM"},
		{value:"17", label:"5:00 PM"},
		{value:"18", label:"6:00 PM"},
		{value:"19", label:"7:00 PM"},
		{value:"20", label:"8:00 PM"},
		{value:"21", label:"9:00 PM"},
		{value:"22", label:"10:00 PM"},
		{value:"23", label:"11:00 PM"}
	],

	months: ["January","February","March","April","May","June","July",
	            "August","September","October","November","December"],
	months_select: [
		{label: "January", value: 1 },
		{label: "February", value: 2 },
		{label: "March", value: 3 },
		{label: "April", value: 4 },
		{label: "May", value: 5 },
		{label: "June", value: 6 },
		{label: "July", value: 7 },
		{label: "August", value: 8 },
		{label: "September", value: 9 },
		{label: "October", value: 10 },
		{label: "November", value: 11 },
		{label: "December", value: 12 },
	],
	months_abv: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"],

	days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	days_select: [
		{label: "Sunday", value: 0 },
		{label: "Monday", value: 1 },
		{label: "Tuesday", value: 2 },
		{label: "Wednesday", value: 3 },
		{label: "Thursday", value: 4 },
		{label: "Friday", value: 5 },
		{label: "Saturday", value: 6 }
	],

	timezones_select: [
		{
			value: "America/Los_Angeles",
			label: "(UTC-08:00) Pacific Time"
		},
		{
			value: "US/Arizona",
			label: "(UTC-07:00) Arizona"
		},
		{
			value: "US/Mountain",
			label: "(UTC-07:00) Mountain Time"
		},
		{
			value: "US/Central",
			label: "(UTC-06:00) Central Time"
		},
		{
			value: "US/Eastern",
			label: "(UTC-05:00) Eastern Time"
		},
		{
			value: "Europe/London",
			label: "(UTC-0) GMT London"
		},
		{
			value: "Europe/Dublin",
			label: "(UTC+01:00) Dublin"
		},
		{
			value: "Europe/Amsterdam",
			label: "(UTC+1:00) Amsterdam"
		},
		{
			value: "Europe/Brussels",
			label: "(UTC+01:00) Brussels"
		},
		{
			value: "Europe/Belgrade",
			label: "(UTC+01:00) Belgrade"
		},
		{
			value: "Europe/Kiev",
			label: "(UTC+02:00) Kiev"
		},
		{
			value: "Africa/Cairo",
			label: "(UTC+02:00) Cairo"
		},
		{
			value: "Europe/Moscow",
			label: "(UTC+03:00) Moscow"
		},
		{
			value: "Asia/Calcutta",
			label: "(UTC+05:30) Kolkata, Mumbai, New Delhi"
		},
		{
			value: "Asia/Almaty",
			label: "(UTC+06:00) Centrial Asia (Almaty)"
		},
		{
			value: "Asia/Bangkok",
			label: "(UTC+07:00) Bangkok"
		},
		{
			value: "Asia/Shanghai",
			label: "(UTC+08:00) Beijing"
		},
		{
			value: "Asia/Singapore",
			label: "(UTC+08:00) Singapore, Manila"
		},
		{
			value: "Asia/Taipei",
			label: "(UTC+08:00) Taipei"
		},
		{
			value: "Australia/Perth",
			label: "(UTC+08:00) Perth"
		},
		{
			value: "Asia/Tokyo",
			label: "(UTC+09:00) Tokyo"
		},
		{
			value: "Asia/Seoul",
			label: "(UTC+09:00) Seoul"
		},
		{
			value: "Australia/Sydney",
			label: "(UTC+10:00) Sydney"
		},
		{
			value: "Pacific/Auckland",
			label: "(UTC+12:00) Auckland"
		},
		{
			value: "Pacific/Honolulu",
			label: "(UTC-10:00) Hawaii"
		},
		{
			value: "America/Anchorage",
			label: "(UTC-09:00) Anchorage"
		},
		{
			value: "US/East-Indiana",
			label: "(UTC-05:00) Indiana (East)"
		},
	]
};
