SWAM.Views.ProgressBar = SWAM.View.extend({
	classes: "swam-progress-view",
	template: "swam.ext.misc.progress",

	setPercent: function(value) {
		if (value <= 1.0) value = parseInt(value * 100);
		let prog = `${value}%`;
		this.$progbar.css("width", prog);
		this.$progbar.text(prog);
		this.$progbar.attr("aria-valuenow", value);
	},

	setTitle: function(title) {
		this.options.title = title;
		if (title) {
			this.$progtitle.html(title);
			this.$progtitle.show();	
		} else {
			this.$progtitle.hide();	
		}

	},

	setProgress: function(value) {
		return this.setPercent(value);
	},

	on_post_render: function() {
		this.$progbar = this.$el.find("#progbar");
		this.$progtitle = this.$el.find("#progtitle");
		if (!this.options.title) this.$progtitle.hide();
	}
})