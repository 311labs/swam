
SWAM.Models.WikiMedia = SWAM.Model.extend({
    defaults: {
        url:"/api/wiki/media/"
    },

    getMediaURL: function() {
    	let url = this.get("media.renditions.large.url");
    	if (!url) url = this.get("media.renditions.original.url");
    	return url;
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
