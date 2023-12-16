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
        "keydown input": "on_stop_submit",
        "keydown textarea": "on_stop_submit",
        "keyup input.watch-length": "on_input_length",
        "click form.search button": "on_submit"
    },

    set: function(key, value) {
        let field = this.getField(key);
        if (field) field.value = value;
    },

    get: function(key, default_value) {
        let field = this.getField(key);
        if (field && (field.value != undefined)) return field.value;
        return default_value;
    },

    getField: function(key) {
        return _.findWhere(this.options.fields, {name:key});
    },

    on_render: function() {
        var html = SWAM.Form.build(this.options.fields, this.options.defaults, this.options.model, {config:this.options.config});
        if (this.options.title) {
            this.$el.empty();
            this.$el.append($("<div class='card-header'>" + this.options.title + "</div>"));
            this.$el.append($("<div class='card-body'></div>").html(html));
        } else {
            this.$el.html(html);
        }
    },

    on_stop_submit: function(evt) {
        if (evt.keyCode == 13) {
            let $el = $(evt.currentTarget);
            if (evt.currentTarget.tagName.lower() == "textarea") {
                if (!evt.shiftKey) {
                    let action = $el.data("action");
                    if (action) {
                        var ievt = {name:$el.attr("name"), value:$el.val(), event:evt, action:action};
                        this.trigger("input:submit", ievt);
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }
            evt.stopPropagation();
            evt.preventDefault();
            $el.change();
            return false;
        }
        return true;
    },

    on_input_length: function(evt) {
        let $el = $(evt.currentTarget);
        let ml = $el.prop("maxLength");
        if (!ml || (ml < 0)) ml = $el.prop("minLength");
        if (ml) {
            let val = $el.val();
            let $cc = $el.parent().find("span.char-count");
            if ($cc.length == 0) {
                $cc = $(`<span class='char-count'>${val.length} of ${ml}</span>`);
                $cc.insertAfter($el);
            } else {
                $cc.text(`${val.length} of ${ml}`);
            }
        }
        return true;
    },

    on_input_autoheight: function(evt) {
        let $el = $(evt.currentTarget);
        return true;
    },

    on_autoresize_textarea: function(evt) {
        let $textarea = $(evt.currentTarget);
        let text = $textarea.val();
        evt.currentTarget.height = evt.currentTarget.scrollHeight;
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
        // this allows us to easily create extensions
        let keys = Object.getOwnPropertyNames(this.constructor.prototype);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].startsWith("on_init__")) {
                this[keys[i]]();
            }
        }
            
        this.enablePops();
        this.enableClear();
        this.enableTooltips();
    },

    enableTooltips: function() {
        var tooltipTriggerList = [].slice.call(this.$el[0].querySelectorAll('[data-bs-toggle="tooltip"]'))
        this._bs_tips = tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },

    on_validate_email: function($field, value) {
        return value.isEmail();
    },

    on_validate_length: function($field, value) {
        if ($field.attr("fixed_length") != undefined) {
            let fl = parseInt($field.attr("fixed_length"));
            if (value.length != fl) return false;
        }
        
        if ($field.attr("min_length") != undefined) {
            let minLen = parseInt($field.attr("min_length"));
            if (value.length < minLen) return false;
        }

        if ($field.attr("max_length") != undefined) {
            let maxLen = parseInt($field.attr("max_length"));
            if (value.length > maxLen) return false;
        }
        return true;
    },

    on_validate_range: function($field, value) {
        if (!value || !_.isNumeric(value)) return false;
        value = parseInt(value);
        if ($field.attr("min_value") != undefined) {
            let min_value = parseInt($field.attr("min_value"));
            if (value < min_value) return false;
        }
        if ($field.attr("max_value") != undefined) {
            let max_value = parseInt($field.attr("max_value"));
            if (value > max_value) return false;
        }
        return true;
    },

    validateField: function($field, highlight) {
        $field.removeClass("is-valid").removeClass("is-invalid");
        let is_valid = true;
        let v = $field[0].value.trim();
        let validator = $field.data("validator");
        if (validator != undefined) {
            let k = `on_validate_${validator}`
            if (_.isFunction(this[k]) && !this[k]($field, v)) {
                v = "";
            }
        }

        if (!v) {
            is_valid = false;
            if (highlight) {
                $field.addClass("is-invalid");
            }
        } else if (highlight) {
            $field.addClass("is-valid");
        }
        return is_valid;
    },

    hasRequiredData: function(highlight) {
        let is_valid = true;
        let self = this;
        this.$el.find(':input[required]').each(function() {
            if (!self.validateField($(this), highlight)) {
                is_valid = false;
            }
        });
        return is_valid;
    },

    highlightRequired: function() {
        let self = this;
        this.$el.find(':input[required]').each(function() {
            self.validateField($(this), highlight);
        });
    },

    highlightField: function(name, is_valid) {
        let $el = this.$el.find(`input#${name}`);
        $el.removeClass("is-valid").removeClass("is-invalid");
        if (is_valid) {
            $el.addClass("is-valid");
        } else {
            $el.addClass("is-invalid");
        }
    },

    getData: function() {
        var $form = this.$el.find("form");
        $form.find("input").each(function(){
            let format = $(this).data("format");
            if (format == "trim") {
               this.value = $(this).val().trim(); 
            }
        });
        var data = expandObject(SWAM.Form.getData($form, {defaults:this.options.defaults}));
        var files = SWAM.Form.getFiles($form);
        if (files) {
            var has_real_files = false;
            _.each(files, function(f){
                if (f[0].files.length) {
                    has_real_files = true;
                }
            })
            if (has_real_files) {
                // convert form data to multi-part form
                data.__mpf = SWAM.Form.convertToFormData($form, data);
            }
        }
        // delete local base64 files
        _.each(this.files, function(f, k) {
            data[k] = f;
            if (data.__mpf) {
                data.__mpf.delete(k);
                data.__mpf.set(k, f);
            }
        });
        return data;
    },

    getChanges: function() {
        var data = this.getData();
        if (this.options.model) {
            return deepDiff(this.options.model.attributes, data);
        }
        return data;
    },

    on_init__es: function() {
        var self = this;
        this.$el.find("select.editable").each(function(){
            var $el = $(this);
            var view = new SWAM.Views.EditSelect();
            view.replaceSelect($el);
        });
    },

    on_init__searchdown: function() {
        var self = this;
        this.$el.find("div.searchdown-input").each(function(){
            var $el = $(this);
            var options = _.extend({
                btn_classes: "btn text-decoration-none",
                remote_search: true,
            }, $el.data("options"));
            options.collection = $el.data("collection");
            options.input_name = $el.data("name") || "searchdown";
            var view = new SWAM.Views.SearchDown(options);
            if (options.collection.active_model) {
                view.active_model = options.collection.active_model;
            }
            view.addToDOM($el);
        });
    },

    on_init__image_editor: function() {
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

    on_init__mde: function() {
        var self = this;
        this.$el.find("textarea.textarea-mde").each(function(){
            const easyMDE = new EasyMDE({
                element: this,
                forceSync: true,
                toolbar: [
                    "bold", "italic", "heading", "|", 
                    "quote", "unordered-list", "ordered-list", "|",
                    "code", "link", 
                    {
                        name: "custom",
                        action: self.on_mde_insert_image.bind(self),
                        className: "fa fa-image",
                        title: "Custom Button",
                    },
                    "|", "table", "preview", "size-by-side", "fullscreen"]
            });
        });
    },

    on_mde_insert_image: function(editor) {
        this.trigger("mde:insert_image", editor);
    },

    on_init__textarea_autoheight: function() {
        var self = this;
        this.$el.find("textarea.textarea-autoheight").each(function(){
            var $textarea = $(this).css({
                    'overflow-y': 'auto',
                    'resize': 'none'
                }),

                maxHeight = $(document).height() / 3;
                minHeight = $textarea.height(),
                previousHeight = minHeight,

                $slave = (function() {
                    var $clone = $textarea.clone()
                        .attr('tabindex', -1)
                        .removeAttr('id')
                        .removeAttr('name')
                        .css({
                            'position': 'absolute',
                            'top': 0,
                            'left': -9999
                        });

                    return $clone.insertBefore($textarea);
                })(),

                adjustHeightIfNeeded = function () {
                    var text = $textarea.val(),
                        height;

                    $slave
                        .width($textarea.width())
                        .height(0)
                        .val(text)
                        .scrollTop(9999);

                    height = Math.max(minHeight, $slave.scrollTop() + 15);
                    height = Math.min(maxHeight, height);
                    if (height === previousHeight) {
                        return;
                    }

                    previousHeight = height;
                    $textarea.height(height);
                };

            $textarea.unbind('.resize');

            if (supportsInputEvent()) {
                $textarea.bind('input.resize', adjustHeightIfNeeded);
            }
            else if (supportsPropertyChangeEvent()) {
                $textarea.bind('propertychange.resize', adjustHeightIfNeeded);
            }
            else {
                $textarea.bind('keypress.resize', adjustHeightIfNeeded);
            }

            adjustHeightIfNeeded();
        });
    },

    on_init__datepicker: function() {
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

    on_init__daterangepicker: function($root) {
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
        } else if (ievt.currentTarget.type == "color") {
            if (ievt.value.upper() == "#D3C5C5") ievt.value = "";
        }
        this._handle_input_change(ievt);
    },

    _handle_textarea_autoheight: function(evt, el) {

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
            this[func_name](ievt.name, ievt.value, ievt);
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
        if ($input.hasClass("form-control-color")) {
            $input.val("#D3C5C5").change();
        } else {
            $input.val("").change();
        }
        
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