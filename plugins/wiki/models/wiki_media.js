
SWAM.Models.WikiMedia = SWAM.Model.extend({
    defaults: {
        url:"/api/wiki/media/"
    },

    isMedia: function() {
        return (this.get("media.kind") == "I")||(this.get("media.kind") == "V");
    },

    getMediaURL: function() {
    	let url = this.get("media.renditions.large.url");
    	if (!url) url = this.get("media.renditions.original.url");
    	return url;
    },

    getLinkURL: function() {
        return this.get("media.renditions.original.url");
    },

    save: function(data, callback, opts) {
        let media = new SWAM.Models.MediaItem();
        let payload = {};
        media.save(
            data,
            function(m, resp){
                payload.media = m.id;
                payload.entry = data.entry;
                SWAM.Model.prototype.save.call(this, payload, callback, opts);
            }.bind(this));
    }
}, {
    EDIT_FORM: [
    	{
    	    label: "File",
    	    name: "media",
    	    type: "file"
    	}
    ],
});

SWAM.Collections.WikiMedia = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.WikiMedia
    }
});
