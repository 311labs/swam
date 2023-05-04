

SWAM.Models.MediaItem = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/medialib/media/item/"
    },
}, {
    EDIT_FORM: [
        {
            label: "Name",
            field: "name"
        },
        {
            label: "Description",
            field: "description"
        },
    ],
    ADD_FORM: [
        {
            label: "Name",
            field: "name"
        },
        {
            label: "Description",
            field: "description"
        },
        {
            label: "File",
            name: "media",
            type: "file"
        }
    ]
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