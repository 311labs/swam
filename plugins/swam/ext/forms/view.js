SWAM.Form.View = SWAM.View.extend({
    classes: "form-view",
    files: {},

    defaults: {
        fields: []
    },

    events: {
        // "click :checkbox": "on_checkbox_handler",
        "change input": "on_input_handler",
        "change select": "on_input_handler",
        "click form.search button": "on_submit"
    },

    on_render: function() {
        var html = SWAM.Form.build(this.options.fields, this.options.defaults, this.options.model);
        if (this.options.title) {
            this.$el.empty();
            this.$el.append($("<div class='card-header'>" + this.options.title + "</div>"));
            this.$el.append($("<div class='card-body'></div>").html(html));
        } else {
            this.$el.html(html);
        }
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
        this.on_init_es();
        this.enablePops();
        this.enableClear();
    },

    getData: function() {
        var $form = this.$el.find("form");
        var data = SWAM.Form.getData($form);
        var files = SWAM.Form.getFiles($form);
        if (files) {
            // this has files
            // lets check if these are form files or base64
            var has_real_files = _.difference(_.keys(files), _.keys(this.files)).length > 0;
            if (has_real_files) {
                data.__mpf = SWAM.Form.convertToFormData($form, data);
            }
        }
        // local base64 files
        _.each(this.files, function(f, k) {
            data[k] = f;
            if (data.__mpf) {
                data.__mpf.delete(k);
                data.__mpf.set(k, f);
            }
        });
        return data;
    },

    on_init_es: function() {
        var self = this;
        this.$el.find("select.editable").each(function(){
            var $el = $(this);
            var view = new SWAM.Views.EditSelect();
            view.replaceSelect($el);
        });
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
          var picker = new easepick.create({
                element:sel,
                css: [
                  // 'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.0/dist/index.css',
                  '/swamcore/plugins/datepicker.css?v=1.2.0',
                ],
                plugins: ['AmpPlugin'],
                AmpPlugin: {
                    resetButton: true,
                    dropdown: {
                        months: true,
                        years: true
                    }
                }
          });
          picker.on("select", function(evt) { 
                evt.picker= picker;
                evt.inputElement = sel;
                this.on_handle_date_picker(evt); 
            }.bind(this), this);
          picker.on("clear", function(evt) {
                evt.picker= picker;
                evt.inputElement = sel;
                var $el = $(evt.inputElement);
                var ievt = {name:$el.attr("name"), value:"", event:evt};
                ievt.currentTarget = $el[0];
                picker.hide();
                this.on_datepicker(ievt); 
          }.bind(this), this);
          return picker;
        }.bind(this));
    },

    on_init_daterangepicker: function($root) {
        if (!window.easepick) return;

        var list = [].slice.call(this.$el[0].querySelectorAll('input.input-daterange'))
        this._daterange_pickers = list.map(function (sel) {
          var picker = new easepick.create({
                element:sel,
                plugins: ['RangePlugin', 'AmpPlugin'],
                css: [
                  '/swamcore/plugins/datepicker.css?v=1.2.0',
                ],
                AmpPlugin: {
                    resetButton: true,
                    dropdown: {
                        months: true,
                        years: true
                    }
                }
          });
          picker.on("select", function(evt) { 
                evt.picker= picker;
                evt.inputElement = sel;
                this.on_handle_date_picker(evt); 
            }.bind(this), this);
          picker.on("clear", function(evt) {
                evt.picker= picker;
                evt.inputElement = sel;
                var $el = $(evt.inputElement);
                var ievt = {name:$el.attr("name"), value: "", start:"", end: "", event:evt};
                ievt.currentTarget = $el[0];
                picker.hide();
                this.on_daterange_picker(ievt); 
          }.bind(this), this);
          return picker;
        }.bind(this));
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

    on_daterange_picker: function(evt) {
        if (!this.date_fields) this.date_fields = {};
        this.date_fields[evt.name] = {name:evt.name, start:evt.start, end:evt.end};
        this._handle_input_change(evt);
    },

    on_datepicker: function(evt) {
        if (!this.date_fields) this.date_fields = {};
        this.date_fields[evt.name] = evt.date;
        this._handle_input_change(evt);
    },

    on_handle_date_picker: function(evt) {
        var $el = $(evt.inputElement);
        var ievt = {name:$el.attr("name"), value:$el.val(), event:evt};
        ievt.currentTarget = $el[0];
        if (evt.detail) {
            if (evt.detail.date) {
                ievt.date = evt.detail.date;
                this.on_datepicker(ievt);
            } else if (evt.detail.start) {
                ievt.start = evt.detail.start;
                ievt.end = evt.detail.end;
                this.on_daterange_picker(ievt);
            }
        } else {
            this._handle_input_change(ievt);
        }
    },

    on_input_handler: function(evt) {
        var $el = $(evt.currentTarget);
        var ievt = {name:$el.attr("name"), value:$el.val(), event:evt, type:$el.attr("type")};
        ievt.$el = $el;
        ievt.currentTarget = $el[0];
        if (!ievt.name) ievt.name = $el.attr("id");
        if (!ievt.name) return;
        if (ievt.currentTarget && ievt.currentTarget.type == "checkbox") {
            ievt.value = $el.is(":checked");
        }
        this._handle_input_change(ievt);
    },

    _handle_input_change(ievt) {
        var func_name = "on_input_" + ievt.name;
        ievt.stopPropagation = function() {
            if (ievt.event) {
                if (_.isFunction(ievt.event.stopPropagation)) {
                    ievt.event.stopPropagation();
                } else if (ievt.event.bubbles != undefined) {
                    ievt.event.bubbles = false;
                    ievt.event.cancelBubble = true;
                    ievt.event.cancelable = true;
                }
            }
        }.bind(ievt);

        if (ievt.type == "text") {
            if (ievt.value == "") {
                ievt.$el.parent().removeClass("input-clearable");
            } else {
                ievt.$el.parent().addClass("input-clearable");
            }
        }
        this.trigger("input:change", ievt);
        if (_.isFunction(this[func_name])) {
            this[func_name](evt, ievt.value, ievt);
        } else if (_.isFunction(this["on_input_change"])) {
            this.on_input_change(ievt.name, ievt.value, ievt);
        }
    },

    enablePops: function() {
        var list = [].slice.call(this.$el[0].querySelectorAll('[data-bs-toggle="popover"]'))
        this._bs_popovers = list.map(function (sel) {
          return new bootstrap.Popover(sel, {html:true});
        });
    },

    enableClear: function() {
        this.$el.find("button.btn-clear").each(function(index){
            var $parent = $(this).parent();
            var $input = $parent.find("input");
            if ($input.val()) {
                $parent.addClass("input-clearable");
            }
        });
    },

    on_action_show_password: function(evt) {
        var $parent = $(evt.currentTarget).parent();
        var $input = $parent.find("input");
        if ($input.attr("type") == "password") {
            $input.attr("type", "text");
        } else {
            $input.attr("type", "password");
        }
    },

    on_action_clear_field: function(evt) {
        var $parent = $(evt.currentTarget).parent();
        var $input = $parent.find("input");
        $input.val("").change();
        // $parent.removeClass("input-clearable");
        // var ievt = {name:$input.attr("name"), value:"", event:evt, type:$input.attr("type")};
        // ievt.$el = $input;
        // ievt.currentTarget = $input[0];
        // if (!ievt.name) ievt.name = $input.attr("id");
        // this._handle_input_change(ievt);
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