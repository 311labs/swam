

SWAM.Models.MediaItem = SWAM.Model.extend({
    defaults: {
    	url:"/api/medialib/media/item/"
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
            label: "File",
            name: "media",
            type: "file"
        },
        {
            label: "Name (optional)",
            field: "name"
        },
        {
            label: "Description (optional)",
            field: "description"
        },
    ]
});

SWAM.Collections.MediaItem = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MediaItem
    }
});


SWAM.Models.MediaItemRef = SWAM.Model.extend({
    defaults: {
        url:"/api/medialib/media/ref/"
    },
});

SWAM.Collections.MediaItemRef = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MediaItemRef
    }
});

SWAM.Models.MediaLibrary = SWAM.Model.extend({
    defaults: {
        url:"/api/medialib/library/"
    },
});

SWAM.Collections.MediaLibrary = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MediaLibrary
    }
});