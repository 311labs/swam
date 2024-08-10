

SWAM.Ext.DropZone = {
	events: {
	    "dragover": "on_dragover",
	    "dragleave": "on_dragleave",
	    "drop": "on_drop"
	},

	on_dragover: function(evt) {
	    evt.preventDefault();
	    this.el.classList.add('dragover');
	    if (!this.$dropzone) {
	    	this.createDropZoneOverlay();
	    }
	    this.__show_dropzone = true;
	    this.$dropzone.show();
	},

	on_dragleave: function(evt) {
	    this.el.classList.remove('dragover');
	    
	    this.hideDropZone();
	},

	on_drop: function(evt) {
	    evt.preventDefault();
	    this.hideDropZone();
	    this.el.classList.remove('dragover');
	    this.on_drop_files(evt.originalEvent.dataTransfer.files);
	},

	on_drop_files: function(files) {
		for (let i = 0; i < files.length; i++) {
		    this.on_drop_file(files[i]);
		}
	},

	on_drop_file: function(file) {
		SWAM.toast("File Dropped", `${file.name} (${SWAM.Localize.bytes(file.size)})`, "info", 5000);
	},

	hideDropZone: function() {
		this.__show_dropzone = false;
		if (!this.__dz_timeout) {
			this.__dz_timeout = setTimeout((evt) => {
				this.__dz_timeout = null;
				if (!this.__show_dropzone) this.$dropzone.hide();
			}, 500);
		}
	},

	createDropZoneOverlay: function() {
		this.$dropzone = $("<div id='swam_dropzone'></div>");
		this.$dropzone.html("<div class='swam-drop-overlay-text'><div><i class='bi bi-cloud-upload-fill'></i></div><div>UPLOAD FILE/S</div></div>");
		this.$el.append(this.$dropzone);
		this.$dropzone.on("drop", this.on_drop.bind(this));
	}
};

