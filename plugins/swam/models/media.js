

SWAM.Models.MediaItem = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/medialib/media/item/"
    },
});

SWAM.Collections.MediaItem = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MediaItem
    }
});


SWAM.Models.MediaItemRef = SWAM.Model.extend({
    defaults: {
        url:"/rpc/medialib/media/ref/"
    },
});

SWAM.Collections.MediaItemRef = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MediaItemRef
    }
});

SWAM.Models.MediaLibrary = SWAM.Model.extend({
    defaults: {
        url:"/rpc/medialib/library/"
    },
});

SWAM.Collections.MediaLibrary = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MediaLibrary
    }
});