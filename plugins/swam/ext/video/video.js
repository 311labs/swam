

SWAM.Views.Video = SWAM.View.extend({
	tagName: "video",
    classes: "swam-video-view mw-100 mh-80",
    defaults: {
    	type: "video/mp4",
    	show_controls: true,
    	autoplay: true
    },

    events: {
    	"play": "on_playing",
    	"playing": "on_playing",
    	"pause": "on_paused",
    	"ended": "on_ended",
        "stalled": "on_stalled",
    	"waiting": "on_waiting",
    	"error": "on_error",
        "emtpy": "on_error",
        "abort": "on_error"
    },

    on_playing: function(evt) {
    	this.is_playing = true;
    },

    on_pause: function(evt) {
    	this.is_playing = false;
    },

    on_ended: function(evt) {
    	this.is_playing = false;
    },

    on_stalled: function(evt) {
        this.is_playing = false;
        SWAM.toast("player error", "video failed to load", "danger", 5000);
    },

    on_waiting: function(evt) {
    	this.is_playing = false;
    },

    on_error: function(evt) {
    	SWAM.toast("player error", "video failed to load", "danger", 15000);
    },

    setSource: function(src, type) {
    	this.options.src = src;
    	this.options.type = type;
    },

    play: function() {
    	this.el.play();
    },

    pause: function() {
    	this.el.pause();
    },

    on_action_toggle_play: function() {

    },

    on_post_render: function() {
    	this.$el.data("action", "toggle_play");
    	this.el.controls = this.options.show_controls;
    	this.el.autoplay = this.options.autoplay;
    	if (this.options.src) {
    		this.source = document.createElement("source");
            this.source.setAttribute("src", this.options.src);
            this.source.setAttribute("type", this.options.type);
    		this.el.appendChild(this.source);
            $(this.source).on("error", this.on_error.bind(this));
    		this.el.load();
    		if (this.options.autoplay) {
    			this.el.play();
    		}
    	}
    }

});
