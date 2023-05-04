SWAM.Views.UploadProgress = SWAM.View.extend({
	template: 'swam.ext.dialogs.uploadprogress',
	// Model: Models.Content,
	className: "uploader-item panel panel-default",

	setFile: function(file) {
		this.is_done = false;
		this.is_paused = false;
		this.completed = 0;
		this.file = file;
		this.render();

		if (!this.content) this.content = new this.Model();
		this.content.on("progress", this.on_progress, this);
		this.content.on("sync", this.on_uploaded, this);
		this.total = 0;

		this.$filename.text(this.file.name);
		this.$filesize.text(this.sizeToMB(this.file.size) + "MB");

		this.started = Date.now();
	},

	upload: function() {
		// var fd = new FormData();
		// fd.append("file", this.file);
		// data = {};
		// data.group = window.app.group.id;
		// data.__files = {
		//     formvals: {},
		//     files: [this.file]
		// };
		// data.__files.formdata = fd;
		var data = this.options.data || {};
		if (window.app.group) {
			data.group = window.app.group.id;
		}

		this.content.saveFile(this.file, data, {callback:this.on_response, context:this, timeout: 3600000});
	},

	on_response: function(model, resp) {
		if (resp.status) {

		} else {
			this.$el
				.removeClass("panel-default")
				.addClass("panel-danger");

			this.$el.find(".panel-footer").text(resp.error);
			this.parent.on_error(this, resp.error);
		}

	},

	on_progress: function(model, state, loaded, total) {
		console.log("progress called");
		var now = Date.now();
		if (total && (total != this.total)) {
			this.total = total;
		}

		if (total) {
			this.loaded = loaded;
			this.completed = (100*loaded/total);
			this.remaining = total - loaded;
			this.timer = now - this.started

			this.updateSpeed(now, loaded, total);
			this.updateDisplay();
		}

	},

	on_uploaded: function() {
		this.updateDisplay();
		this.is_done = true;
		this.parent.on_done(this);
	},

	updateSpeed: function(now, loaded, total) {
		if (!this.last_update) {
			this.last_update = now;
			this.sample_start = loaded;
			this.time_remaining = total / 10000;
			this.bytes_sec = 10000;
			this.last_bytes_sec = 0;
			this.avg_bytes_sec = 0;
		}
		var elapsed = now - this.last_update;
		if (elapsed >= 1000) {
			this.sample_size = loaded - this.sample_start;
			this.sample_start = loaded;

			this.bytes_sec = this.sample_size / (elapsed / 1000);
			if (this.last_bytes_sec > 0) {
			    this.avg_bytes_sec = (this.bytes_sec + this.last_bytes_sec) / 2;
			} else {
			    this.avg_bytes_sec = this.bytes_sec;
			}
			this.last_bytes_sec = this.avg_bytes_sec;

			this.last_update = now;
			// this.updateDisplay();
		}

		if ((this.remaining > 0)&&(this.avg_bytes_sec > 0)) {
			this.time_remaining = this.remaining / this.avg_bytes_sec;
		}
	},

	sizeToKB: function(bytes) {
	    if (bytes) {
	        return (bytes / 1024).toFixed(2);
	    }
	    return 0;
	},

	sizeToMB: function(bytes) {
	    return (bytes / 1048576).toFixed(2);
	},

	getTimeRemaining: function() {
	    // time remaining is bytes remaining / bytes sec
	    var d = {};
	    d.SS = Math.floor(this.time_remaining);
	    d.ss = d.SS % 60;
	    d.MM = Math.floor(d.SS / 60);
	    d.mm = d.MM % 60;
	    d.HH = Math.floor(d.MM / 60);
	    d.hh = d.HH % 60;
	    d.DD = Math.floor(d.HH / 24);
	    d.dd = d.DD;

	    _.each(['SS', 'ss', 'MM', 'mm', 'HH', 'hh', 'DD', 'dd'], function(v) {
	        if (d[v] < 10) {
	            d[v] = "0" + d[v];
	        }
	    });

	    return d.hh + ":" + d.mm + ":" + d.ss;
	},

	updateDisplay: function() {
		console.log("update display called!");
		this.$pbar.css("width", this.completed + "%");
		this.$pbar.text(this.completed.toFixed(0) + "%");
	    this.$remaining.text(this.getTimeRemaining());
	    this.$sent.text(this.sizeToMB(this.loaded));
	    this.$speed.text(this.sizeToKB(this.avg_bytes_sec) + " KB/s");
	},

	post_render: function() {
		this.$pbar = this.$el.find(".progress-bar");
		this.$filename = this.$el.find(".name");
		this.$filesize = this.$el.find(".size");
		this.$sent = this.$el.find(".sent");
		this.$remaining = this.$el.find(".time-remaining");
		this.$speed = this.$el.find(".speed");
	}
});