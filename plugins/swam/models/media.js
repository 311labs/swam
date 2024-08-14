

SWAM.Models.MediaItem = SWAM.Model.extend({
    defaults: {
    	url:"/api/medialib/media/item/"
    },

    requestUploadUrl: function(data, callback) {
        let file = data.__mpf.get("media");
        if (!data.name) data.name = file.name;
        let payload = {
            filename: data.name,
            filesize: file.size,
            filetype: file.type
        };
        if (data.group) payload.group = data.group;
        if (data.description) payload.description = data.description;
        SWAM.Rest.POST(
            "/api/medialib/media/item/s3", 
            payload, 
            function(resp, status) {
                this.id = resp.data.id;
                this.attributes.id = this.id;
                let fsize = SWAM.Localize.bytes(file.size);
                let prog_view = new SWAM.Views.ProgressBar({title:`${data.name} (${fsize})`});
                prog_view.render();
                let toast_view = Toast.create({
                    title:"Uploading",
                    message:prog_view,
                    status: TOAST_STATUS.warning
                });
                SWAM.Rest.UPLOAD(resp.data.url, file, function(status){
                    setTimeout(function(){
                        Toast.removeToast(toast_view, true);
                        SWAM.toast("Upload Complete", data.name, "success", 4000);
                    }, 1000);
                    callback(status);
                }.bind(this), function(){
                    if (event.lengthComputable) {
                        let prog = event.loaded / event.total;
                        console.log(prog);
                        prog_view.setProgress(prog);
                    }
                }.bind(this))
            }.bind(this));
    },

    save: function(data, callback, opts) {
        // lets make sure our file isn't extra large, if so lets break this up
        if (data.__mpf) {
            let file = data.__mpf.get("media");
            if (file.size > SWAM.Models.MediaItem.LARGE_UPLOAD_BYTES) {
                this.requestUploadUrl(data, function(status){
                    SWAM.Model.prototype.save.call(this, {state:200, rendernow:1}, callback);
                }.bind(this));
                return;
            }
        }
        SWAM.Model.prototype.save.call(this, data, callback);
    }
}, {
    LARGE_UPLOAD_BYTES: 20, // 20MB
    // LARGE_UPLOAD_BYTES: 20000000, // 20MB
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