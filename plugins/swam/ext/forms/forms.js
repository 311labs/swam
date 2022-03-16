SWAM.Form.View = SWAM.View.extend({
    classes: "form-view",
    
    on_render: function() {
        this.$el.html(SWAM.Form.build(this.options.fields, this.options.default, this.options.model));
    },

    on_post_render: function() {
        this.on_init_widgets();
    },

    on_init_widgets: function() {
        if (window.loadImage && this.$el.find("input.thumbnail-picker").length) {
            var self = this;
            this.$el.find("input.thumbnail-picker").InputImage().on("image", function(evt, image){
                var editor = SWAM.Dialogs.ImageEditor.editImage(image, {
                    crop: true,
                    aspectRatio: 1.0,
                    on_done: function(editor, edited_image){
                        self.image = edited_image;
                        self.$el.find(".inputimage img").attr("src", editor.getImageAsDataURL());
                    },
                    on_cancel: function() {
                        
                    }
                });
            });
        } else {
            this.$el.find("input.thumbnail-picker").InputImage();
        }
    }

});
