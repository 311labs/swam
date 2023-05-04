SWAM.Views.DropFiles = SWAM.View.extend({
	template: 'swam.ext.dialogs.dropfiles',
	className: "dropfiles",
	events: {
        "click .inputfile-wrapper" : "on_click_inputfile_wrapper",
		"change input": "on_files"
	},

	options: {
		label: "Upload File/s",
        light_bg: false,
	},

	on_files: function(evt) {
		this.dlg = null;
		var $input = $(evt.currentTarget);
		var files = $input[0].files;
		this.uploadFiles(files);
    },

    on_click_inputfile_wrapper : function() {
        $("#fileinput").click();
    },

	uploadFiles: function(files) {
		this.trigger("upload_started", files);
		var self = this;
		_.each(files, function(file){
			console.log(file.name);
			self.uploadFile(file);
		});
	},

	uploadFile: function(file) {
		if (!this.dlg) {
			this.dlg = window.app.dialog("Uploading Files", "<div id='upload-list'><h4>Files</h4></div>", {buttons:[]});
			this.files = [];
		}

		var fileProgress = new SWAM.Views.UploadProgress(this.options);
		fileProgress.Model = this.options.Model;
		fileProgress.content = this.options.model;
		fileProgress.parent = this;
		fileProgress.render();
		this.dlg.$el.find("#upload-list").append(fileProgress.$el);
		fileProgress.setFile(file);
		if (this.files.length == 0) {
			fileProgress.upload();
		}
		this.files.push(fileProgress);
	},

	on_error: function(file, error) {
		// this.on_done(file);
	},

	on_done: function(file) {

		this.files.remove(file);
		if (this.files.length) {
			this.files[0].upload();
		} else {
			this.dlg.remove();
		}
		this.trigger("upload_complete", file);
	},

	on_upload_ready: function(evt, files) {
		if (!_.isArray(files)) {
			files = [files];
		}
		this.uploadFiles(files);
	},

	on_post_render: function() {
		if (this.options.light_bg) {
			this.$el.addClass("light");
		}
		this.$droparea = this.$el;
		if (!this._bound_on_upload_ready){
			this._bound_on_upload_ready = _.bind(this.on_upload_ready, this);
			this.$droparea.DropZone().on("filedrop", this._bound_on_upload_ready);
		}
	}

});