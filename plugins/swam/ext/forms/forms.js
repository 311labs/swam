SWAM.Form.View = SWAM.View.extend({
    classes: "form-view mb-4",
    files: {},

    events: {
        "click :checkbox": "on_checkbox_handler",
        "change input": "on_input_handler",
        "change select": "on_input_handler",
        "click form.search button": "on_submit"
    },

    on_render: function() {
        this.$el.html(SWAM.Form.build(this.options.fields, this.options.default, this.options.model));
    },

    on_submit: function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        return true;
    },

    on_post_render: function() {
        this.$el.on("submit", this.on_submit, this);
        this.on_init_widgets();
    },

    on_init_widgets: function() {
        this.on_init_image_editor();
        this.on_init_datepicker();
        this.on_init_daterangepicker();
        this.enablePops();
    },

    getData: function() {
        var data = SWAM.Form.getData(this.$el.find("form"));
        _.each(this.files, function(f, k) {
            data[k] = f;
        });
        return data;
    },

    on_init_image_editor: function() {
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

    on_init_datepicker: function() {
        if (!window.easepick) return;

        var list = [].slice.call(this.$el[0].querySelectorAll('input.input-date '))
        this._date_pickers = list.map(function (sel) {
          return new easepick.create({element:sel,
                css: [
                  '/plugins/datepicker.css',
                ],
          });
        });
    },

    on_init_daterangepicker: function($root) {
        if (!window.easepick) return;

        var list = [].slice.call(this.$el[0].querySelectorAll('input.input-daterange'))
        this._daterange_pickers = list.map(function (sel) {
          return new easepick.create({element:sel,
                plugins: ['RangePlugin'],
                css: [
                  '/plugins/datepicker.css',
                ],
          });
        });
    },

    on_dom_removed: function() { 
        this.$el.empty();

        _.each(this._date_pickers, function(comp){
            comp.hide();
        });
        this._date_pickers = [];
        this.off("submit", this.on_submit, this);

        _.each(this._bs_popovers, function(item){
            item.dispose();
        });
    },

    on_checkbox_handler: function(evt) {
        var $el = $(evt.currentTarget);
        var name = $el.attr("name");
        if (!name) name = $el.attr("id");
        if (!name) return;
        var is_checked = $el.is(":checked");
        var lbl = $el.data("off-label");
        if (lbl) {
            if (is_checked) {
                lbl = $el.data("on-label");
            }
            $el.parent().find('label').text(lbl);
        }
        var func_name = "on_checkbox_" + name;
        if (_.isFunction(this[func_name])) {
            this[func_name](evt, is_checked);
        } else if (_.isFunction(this["on_checkbox_change"])) {
            this.on_checkbox_change(name, $el.is(":checked"));
        }
    },

    on_input_handler: function(evt) {
        var $el = $(evt.currentTarget);
        var name = $el.attr("name");
        if (!name) name = $el.attr("id");
        if (!name) return;

        var func_name = "on_input_" + name;
        if (_.isFunction(this[func_name])) this[func_name](evt, $el.val());
        if (_.isFunction(this[func_name])) {
            this[func_name](evt, $el.val());
        } else if (_.isFunction(this["on_input_change"])) {
            this.on_input_change(name, $el.val(), evt);
        }
    },

    enablePops: function() {
        var list = [].slice.call(this.$el[0].querySelectorAll('[data-bs-toggle="popover"]'))
        this._bs_popovers = list.map(function (sel) {
          return new bootstrap.Popover(sel, {html:true});
        });
    },

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