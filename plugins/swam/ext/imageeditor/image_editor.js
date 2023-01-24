SWAM.Dialogs.ImageEditor = SWAM.View.extend({
    className: "image-editor",
    id: "image-editor",

    events: {
        "click .close-dialog": "cancel",
        "click .crop": "on_crop",
        "change #filter": "on_filter",
        "click .tool": "on_tool",
        "click .tools .tab": "on_tab_click",
        "click button.save": "on_save"
    },

    tools: {
        brightness:{
            min: -100,
            max: 100,
            step: 1
        },
        contrast:{
            min: -100,
            max: 100,
            step: 1
        },
        saturation:{
            min: -100,
            max: 100,
            step: 1
        },
        vibrance:{
            min: -100,
            max: 100,
            step: 1
        },
        exposure:{
            min: -100,
            max: 100,
            step: 1
        },
        hue:{
            min: 1,
            max: 100,
            step: 1
        },
        sepia:{
            min: 1,
            max: 100,
            step: 1
        },
        gamma:{
            min: 0,
            max: 10,
            step: 0.1
        },
        noise:{
            min: 0,
            max: 100,
            step: 1
        },
        clip:{
            min: 0,
            max: 100,
            step: 1
        },
        sharpen:{
            min: 0,
            max: 100,
            step: 1
        },
        stackBlur:{
            min: 0,
            max: 20,
            step: 1
        },
    },

    toolList: function() {
        var lst = [];
        _.each(this.tools, function(item, key){
            item.name = key;
            lst.push(item);
        });
        return lst;
    },

    filters: [
        "none",
        "vintage",
        "lomo",
        // "clarity",
        "sinCity",
        "sunrise",
        // "crossProcess",
        // "orangePeel",
        // "love",
        "grungy",
        // "jarques",
        "pinhole",
        "oldBoot",
        "glowingSun",
        // "hazyDays",
        // "herMajesty",
        "nostalgia",
        // "hemingway",
        // "concentrate"
    ],

    filtering: false,

    on_tool: function(evt) {
        var $el = $(evt.currentTarget);
        var filter = $el.data("filter");
        if (!filter) {
            return;
        }

        if (this.filtering) {
            return false;
        }
    },

    on_filter: function(evt) {
        var $el = $(evt.currentTarget);
        var filter = $el.val(); //this.$filter.val();
        // alert(filter);
        if (!filter) {
            return;
        }

        if (this.filtering) {
            return false;
        }

        // this.$el.find(".filters .filter.active").removeClass("active");

        if (filter == "none") {
            if (this.presetCaman) {
                this.presetCaman.revert(true);
                // $el.addClass("active");
                return;
            }
        }

        window.app.showBusy();
        this.filtering = true;

        var $img = this.$el.find(".image-cropped img, .image-cropped canvas");
        var self = this;
        var width = $img.width();
        var height = $img.height();

        if (this.presetCaman) {
            this.presetCaman.revert(false);
            this.presetCaman[filter]().render();
            // $el.addClass("active");
        } else {
            this.presetCaman = Caman($img[0], function () {
              this[filter]().render();

              // $el.addClass("active");
          });

            Caman.Event.listen("renderFinished", function (job) {
              self.filtering = false;
              window.app.hideBusy();
            });
        }

        // var img = Filters.filterImage(Filters.grayscale, $img[0]);
        // this.dataURL = img.toDataURL();
        // $img.attr("src", this.dataURL);
    },

    on_crop: function(evt) {
        this.$el.find("button.crop").hide();
        this.$el.find("button.save").show();
        var c = this.jcrop.tellSelect();
        var $canvas = $("canvas");
        var $img = this.$el.find(".image-preview img, .image-preview canvas");
        var canvas = $canvas[0];
        var context = canvas.getContext('2d');
        var imageObj = $img[0];

        var img = loadImage.scale(imageObj, {
                        canvas: true,
                        left: c.x,
                        top: c.y,
                        sourceWidth: c.w,
                        sourceHeight: c.h,
                        minWidth: $img.width()
                    });
        this.dataURL = img.toDataURL();

        this.jcrop.destroy();
        $(".jcrop-holder").remove();

        var $img = $("<img />");
        var $con = $("<div />").addClass("image-cropped").append($img);
        var maxHeight = $(window).height()/2;
        $img.css({"max-height":maxHeight});
        $con.insertBefore($canvas);

        $img.attr("src", this.dataURL);
        this.$el.find("a.post").show();
        this.$el.find("div.filters").show();
        this.$el.find(".footer").hide();
        this.$el.find(".header").show();
    },

    showFilter: function($img) {
       // var canvas = $canvas[0];
        // var context = canvas.getContext('2d');
        // var imageObj = $img[0];

        // this.dataURL = img.toDataURL();
        $(".jcrop-holder").remove();
        $img.parent().attr("class", "image-cropped");

        var maxHeight = $(window).height()/2;
        $img.css({"max-height":maxHeight});

        this.$el.find("button.crop").hide();
        this.$el.find("button.save").show();
        // $img.attr("src", this.dataURL);
        this.$el.find("a.post").show();
        this.$el.find("div.filters").show();
        this.$el.find(".footer").hide();
        this.$el.find(".header").show();
    },

    on_crop_old: function(evt) {
        this.$el.find("a.crop").hide();
        var c = this.jcrop.tellSelect();
        var $canvas = $("canvas");
        var $img = this.$el.find(".image-preview img");
        var canvas = $canvas[0];
        var context = canvas.getContext('2d');
        var imageObj = $img[0];

        $canvas.attr("width", c.w).attr("height", c.h);
        // $canvas.show();

        context.drawImage(imageObj, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
        this.dataURL = canvas.toDataURL();
        this.jcrop.destroy();
        $(".jcrop-holder").remove();

        var $img = $("<img />");
        var $con = $("<div />").addClass("image-cropped").append($img);
        $con.insertBefore($canvas);

        $img.attr("src", this.dataURL);
        this.$el.find("a.post").show();
    },

    on_tab_click: function(evt) {
        return;
        var $el = $(evt.currentTarget);
        var tab = $el.data("id");
        this.$el.find(".toolbox").hide();
        this.$el.find("#tab-"+tab).show();
        this.$el.find(".tools .tab.active").removeClass("active");
        $el.addClass("active");

    },

    on_slide: function(evt) {
        // this.cropbox.zoom(evt.currentTarget.value);
    },

    cancel: function(evt) {
        this.close();
        if (this.on_cancel) {
            this.on_cancel();
        }
    },

    close: function() {
        if (this.dlg) this.dlg.dismiss();
    },

    getImageAsBlob: function() {
        var $img = this.$el.find(".image-cropped img, .image-cropped canvas");
        var blobBin = null;
        if (edited_image.toDataURL) {
            blobBin = atob(edited_image.toDataURL().split(',')[1]);
        } else {
            blobBin = atob(edited_image.src.split(',')[1]);
        }
        return blobBin;
    },

    getImageAsDataURL: function() {
        var $img = this.$el.find(".image-cropped img, .image-cropped canvas");
        var img = $img[0];
        if (img.toDataURL) {
            return img.toDataURL();
        }
        return img.src;
    },

    on_save: function(evt) {
        var $img = this.$el.find(".image-cropped img, .image-cropped canvas");
        var img = $img[0];
        if (this.on_done) {
            this.on_done(this, img);
        }
        this.close();
    },

    on_post: function(evt) {
        var $img = this.$el.find(".image-cropped img, .image-cropped canvas");
        var img = $img[0];

        var formdata = new FormData();
        var blobBin = null;
        if (img.toDataURL) {
            blobBin = atob(img.toDataURL().split(',')[1]);
        } else {
            blobBin = atob(img.src.split(',')[1]);
        }
        var array = [];
        for(var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        var file=new Blob([new Uint8Array(array)], {type: 'image/png'});
        formdata.append("image", file, "image.png");



        data = {};
        data.__mpf = formdata;

        var image = new Models.Selfie();
        var self = this;

        window.app.showBusy();
        image.save(data, {success:function(){
            window.app.hideBusy();
            $("form#camera input.camera").show();
            self.close();
            // window.app.showSelfie(image);
        }, error:function(){
            window.app.hideBusy();
            $("form#camera input.camera").show();
            self.close();
            SWAM.Dialog.alert("We are sorry, but something went wrong.", "Info");
        }});
    },

    on_delete: function(evt) {
        SWAM.Dialog.confirm('Are you sure?', _.bind(this.do_delete, this));
    },

    do_delete: function(evt) {
        this.model.archive(_.bind(function(){
            $("form#camera input.camera").show();
            this.close();
        }, this));
    },

    on_crop_release: function() {
        $("a.crop").hide();
    },

    on_crop_select: function(c) {
        if ((c.w > 50)&&(c.h > 50)) {
            $("a.crop").show();
        }
    },

    showCropping: function($img) {
        // var $prv = this.$el.find(".image-preview canvas");

        var swidth =  $img.width();
        var sheight = $img.height();

        var selectbox = null;
        var offset = 0;
        if (swidth == sheight) {
            selectbox = [0,0,swidth,sheight];
        } else if (swidth > sheight) {
            offset = sheight * 0.2;
            selectbox = [0,0,swidth,sheight];
        } else if (sheight > swidth) {
            offset = swidth * 0.2;
        }
        console.log("showCropping");
        console.log(swidth);
        console.log(sheight);
        console.log(offset);
        selectbox = [0,0,swidth-offset,sheight-offset];

        var self = this;
        $img.Jcrop({
            bgColor: 'black',
            aspectRatio: this.options.aspectRatio == 0? undefined:this.options.aspectRatio,
            boxWidth: swidth, boxHeight: sheight,
            onRelease: _.bind(this.on_crop_release, this),
            onSelect: _.bind(this.on_crop_select, this),
            setSelect: selectbox
        },function(){
            self.jcrop = this;
            // this.jcrop.setSelect([ x2, y2, x1, y1 ]);
        });
        // this.cropbox.zoom(0.8);
    },

    showImage: function(file, cropping) {
        var ph = $(window).height() ;
        var pw = $(window).width();
        if (pw > 600) {
            pw = pw*0.7;
            ph = ph*0.7;
        } else {
            pw = pw*0.80;
            ph = ph*0.95;
        }

        ph -= 200;


        loadImage(file,
            _.bind(function(img){
                if (img.type === "error") {
                    SWAM.Dialog.alert("Could not render image.", "Image Error");
                    this.close();
                } else {
                    this.$el.find(".image-preview img").replaceWith(img);

                    window.app.hideBusy();
                    if (this.options.crop) {
                        this.showCropping($(img));
                    } else {
                        this.showFilter($(img));
                    }

                    // this.$imginput.remove();
                }
            }, this),
            {
                maxWidth: pw,//this.$el.width(),
                maxHeight: ph,//($(window).height()*0.70),
                canvas: true,
                orientation: this.orientation
            }
        );
    },

    showImageOld: function(file, cropping) {
        var self = this;
        if (/^image/.test( file.type)){
            var reader = new FileReader();
            reader.onloadend = function(){
                var $img = self.$el.find(".image-preview img");
                $img.attr('src', this.result);

                if (cropping) {
                    self.showCropping($img);
                }

                window.app.hideBusy();
            };
            reader.readAsDataURL(file);
        }
    },

    setImageFile: function(file) {
        var self = this;
        loadImage.parseMetaData(file, function (data) {
            if (data.exif) {
                self.orientation = data.exif.get("Orientation");
            }
            self.showImage(file, true);
        });
    },

    setImage: function(img) {
        if (typeof img == 'string') {
            // assume uri
            // console.log("loading image: '" + img + '"');
            this.img_file = new Image();
            this.img_file.onerror = function() {
                console.log("failed to load image");
            }
            this.img_file.src = img;

            // this.img_uri = img;
        } else {
            // assume file
            // add our view to the page content area
            this.$imginput = $("form#camera input.camera");

            window.app.showBusy();
            var files = this.$imginput[0].files;
            this.img_file = files[0];
            // this.img_uri = null;
        }
        this.render();
    },

    render_crop: function() {
        '<div class="image-preview"><img src="{{model.url}}" /></div> \
        <canvas id="preview" style="display:none"></canvas>'


    },

    render_filter: function() {

    },

    buttons: [
        {
            className: "btn btn-primary ms-3 crop",
            label: "Crop"
        },
        {
            className: "btn btn-primary ms-3 save",
            label: "Save"
        },
        {
            className: "btn btn-default ms-3 close-dialog",
            label: "Close"
        },
    ],

    on_render: function() {
        this.undelegateEvents();
        this.$el.empty();
        var $prev = $("<div />").addClass("image-preview").appendTo(this.$el);
        var $img = $("<img />").appendTo($prev);
        var $canvas = $("<canvas />").attr('id', 'preview').css("display", "none").appendTo(this.$el);

        var $filters = $("<div />").addClass("filters").css("display", "none").appendTo(this.$el);
        var $select = $("<select />").attr("name", "filters").attr("id", "filter").appendTo($filters);
        _.each(this.filters, function(filter){
            $select.append($("<option />").attr('value',filter).text(filter));
        });
        this.$filter = $filters;

        var $footer = $("<div />").addClass("modal-footer").appendTo(this.$el);
        var $buttons = $("<div />").addClass('modal-buttons').appendTo($footer);
        _.each(this.buttons, function(btn){
            $buttons.append($("<button />").addClass(btn.className).text(btn.label));
        });
        this.delegateEvents();
        this.post_render();

   },

    post_render: function() {
        this.$el.find("button.save").hide();
        var h = this.$el.height();
        var w = this.$el.width();
        var ph = $(window).height();
        var pw = $(window).width();
        w = Math.min(pw-20, 1024);

        var top = (h && ph) ? Math.floor((ph - h) / 2) : 100;
        var left = (w && pw) ? Math.floor((pw - w) / 2) : 100;

        this.$el.css({
            "max-width": w,
        });
    }
}, {
    edit_options: {
        crop: true,
        filters: true,
        aspectRatio: 1.0
    },
    editImage: function(img, options) {
        options = _.extend({}, this.edit_options, options);
        var editor = new this({
            title: "Edit Image",
        });

        editor.render();
        editor.on_done = options.on_done;
        editor.on_cancel = options.on_cancel;
        editor.options = options;
        editor.setImageFile(img);
        var dlg = SWAM.Dialog.showView(editor, {
            stack: true,
            no_buttons: true,
            title:"Edit Image"
        });
        editor.dlg = dlg;
    },

});