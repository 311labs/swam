SWAM.Form.View = SWAM.View.extend({
    classes: "form-view",
    files: {},

    on_render: function() {
        this.$el.html(SWAM.Form.build(this.options.fields, this.options.default, this.options.model));
    },

    on_post_render: function() {
        this.on_init_widgets();
    },

    on_init_widgets: function() {
        if (window.loadImage && this.$el.find("input.thumbnail-picker").length) {
            this.files = {};
            this.$el.find("input.thumbnail-picker").InputImage().on("image", function(evt, image){
                var name = $(evt.currentTarget).attr("name");
                var editor = SWAM.Dialogs.ImageEditor.editImage(image, {
                    crop: true,
                    aspectRatio: 1.0,
                    on_done: function(editor, edited_image){
                        var dataurl = editor.getImageAsDataURL();
                        this.files[name] = dataurl.replace(/^data:.+;base64,/, '');
                        this.$el.find(".inputimage img").attr("src", dataurl);
                    }.bind(this),
                    on_cancel: function() {
                        
                    }
                });
            }.bind(this));
        } else {
            this.$el.find("input.thumbnail-picker").InputImage();
        }


    },

    getData: function() {
        var data = SWAM.Form.getData(this.$el.find("form"));
        _.each(this.files, function(f, k) {
            data[k] = f;
        });
        return data;
    }

});


// $form.find('input[value!=""]:file:enabled').each(function(k,field){
//     reader = new FileReader();
//     reader.onloadend = function () {
//       // Since it contains the Data URI, we should remove the prefix and keep only Base64 string
//       var b64 = reader.result.replace(/^data:.+;base64,/, '');
//       console.log(b64); //-> "R0lGODdhAQABAPAAAP8AAAAAACwAAAAAAQABAAACAkQBADs="
//     };

//     reader.readAsDataURL(file);
// });