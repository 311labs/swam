SWAM.Dialogs = {};


SWAM.Dialog = SWAM.View.extend({
    classes: "modal fade",
    template: "swam.ext.dialogs.base",
    data_attrs: {"action":"bg_close"},
    defaults: {
        scrollable: false,
        can_dismiss: false,
        show_close: true,
        replaces_el: false,
        stack: true,
        size: null, // null=normal, sm, lg, xl
    },
    events: {
        "click": "on_dlg_click",
        "keypress input": "on_input_keypress",
    },
    dialog_sizes: {
        "medium": "lg",
        "small": "sm",
        "large": "xl",
        "lg": "lg",
        "sm": "sm",
        "xl": "xl",
    },
    // vertical sizes are fixed sizes to keep dialogs from jumping around during content changes
    dialog_vsizes: {
        "medium": "vmd",
        "small": "vsm",
        "large": "vlg",
        "lg": "vlg",
        "md": "vmd",
        "sm": "vsm",
        "xl": "vlg",
    },
    on_dlg_click: function(evt) {
        if ($(evt.target).hasClass("modal")) {
            this.on_action_bg_close(evt);
        }
    },
    on_input_keypress: function(evt) {
        // BUG FIX FOR JQUERY NOT HANDLING SUBMISSIONS SOMETIMES ON ENTER PRESS
        if (evt.which === 13) {
            this.choice = "save";
            this.trigger("dialog:choice", this, this.choice);
            if (this.options.callback) this.options.callback(this, this.choice);
            evt.stopPropagation();
            return false;
        }
    },
    show: function() {
        if (this.options.fullscreen) {
            this.options.add_classes = "modal-fullscreen";
        }
        if (!this.options.stack && SWAM.active_dialog) {
            SWAM.active_dialog.dismiss();
        } else if (this.options.stack) {
            this.prev_dialog = SWAM.active_dialog;
        }
        SWAM.active_dialog = this;
        if (this.options.json) {
            this.options.pre = SWAM.Localize.prettyjson(this.options.json);
        } else if (this.options.xml) {
            this.options.pre = SWAM.Localize.prettyxml(this.options.xml);
        }
        if (this.options.view) {
            this.addChild("dlg_view", this.options.view);
        }
        this.addToDOM($("body"));
        this.$el.show();
    },
    dismiss: function() {
        this.$el.removeClass("show").find(".show").removeClass("show");
        window.sleep(300).then(function(){
            SWAM.active_dialog = this.prev_dialog;
            this.prev_dialog = null;
            this.removeFromDOM();
        }.bind(this));

    },
    on_action_close: function(evt) {
        this.dismiss();
        this.trigger("dialog:closed", this);
    },
    on_action_choice: function(evt) {
        this.choice = $(evt.currentTarget).data("id");
        if (["no", "cancel"].indexOf(this.choice.lower()) > 0) return this.dismiss();
        this.trigger("dialog:choice", this, this.choice);
        if (this.options.callback) this.options.callback(this, this.choice);
    },
    on_action_bg_close: function(evt) {
        if (this.options.can_dismiss) {
            this.dismiss();
            this.trigger("dialog:closed", this);
        }
    },
    on_post_render: function() {
        if (this.options.size) this.$el.find(".modal-dialog").addClass("modal-"+this.dialog_sizes[this.options.size]);
        if (this.options.vsize) this.$el.find(".modal-dialog").addClass("modal-"+this.dialog_vsizes[this.options.vsize]);
        if (this.options.scrollable) this.$el.find(".modal-dialog").addClass("modal-dialog-scrollable");
        window.sleep(500).then(function(){
            if (this.$el.find(".offcanvas").length) {
                this.$el.find(".offcanvas").addClass("show");
            }
            this.$el.addClass("show");
            
            this.$el.find("input:text, textarea").first().focus();
        }.bind(this));
    },
    getData: function(evt) {
        if (!_.isEmpty(this.children)) {
            var form = this.children["dlg_view"];
            if (form && form.getData) return form.getData();
        }
        return SWAM.Form.getData(this.$el.find("form"));
    },
    getFormData: function() {
        return this.getData();
    }
},{
    globals: {
        btn_primary: "btn btn-link",
        btn_secondary: "btn btn-link color-secondary",
        buttons: [
            {
                action:"close",
                label:"Ok",
                classes: "btn btn-link"
            }
        ],
    },
    show: function(opts) {
        return this.alert(opts);
    },
    alert: function(opts) {
        if (_.isString(opts)) opts = {"title": "Alert", "message":opts};
        opts = _.extend({can_dismiss:true}, opts);
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    warning: function(opts) {
        if (_.isString(opts)) opts = {"title": "Alert", "message":opts};
        opts = _.extend({add_classes: "modal-danger", can_dismiss:true, icon: "exclamation-triangle-fill"}, opts);
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    yesno: function(opts) {
        opts = _.extend({}, opts);
        opts.lbl_no = opts.lbl_no || "no";
        opts.lbl_yes = opts.lbl_yes || "yes";
        opts.buttons = [
            {
                id: opts.lbl_no.lower(),
                action:"choice",
                label:opts.lbl_no,
                classes: SWAM.Dialog.prototype.defaults.btn_secondary
            },
            {
                id: opts.lbl_yes.lower(),
                action:"choice",
                label:opts.lbl_yes,
                classes: SWAM.Dialog.prototype.defaults.btn_primary
            }
        ];
        return this.alert(opts);
    },
    confirm: function(opts) {
        return this.yesno(opts);
    },
    choices: function(opts) {
        var norm_choices = [];
        var count = 0;
        _.each(opts.choices, function(obj, index){
            if (_.isString(obj)) {
                obj = {
                    id:obj,
                    label: obj,
                }
            }
            count += 1;
            norm_choices.push(obj);
        });
        opts.choices = norm_choices;
        if (!opts.buttons) opts.buttons = [
            {
                action:"close",
                label:"Cancel",
                classes: SWAM.Dialog.prototype.defaults.btn_secondary
            }
        ];
        return this.alert(opts);
    },
    showLoading: function(opts) {
        if (opts.icon) {
            if (!opts.icon.startsWith("<")) {
                opts.icon = SWAM.Icons.getIcon(opts.icon);
            }
        }
        opts = _.extend({template:"swam.ext.dialogs.loader", color:"warning", stack:true}, opts);
        if (opts.parent) {
            opts.template = "swam.ext.dialogs.inline_loader";
            opts.classes = "swam-view inline-modal";
            var dlg = new SWAM.View(opts);
            dlg.addToDOM(opts.parent);
            return dlg;
        }
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    showView: function(view, opts) {
        var defaults = {
            title: null,
            buttons: [
                {
                    action:"close",
                    label:"Close"
                }
            ],
            view: view
        };
        opts = _.extend(defaults, opts);
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    showForm: function(fields, opts) {
        if ((opts == undefined) && (!_.isArray(fields))) {
            opts = fields;
            fields = opts.fields;
        }
        var defaults = {
            title: "Edit",
            buttons: [
                {
                    id: "cancel",
                    action:"choice",
                    label: "Cancel"
                },
                {
                    id: "save",
                    action:"choice",
                    label: opts.lbl_save || "Save"
                }
            ]
        };
        if (fields) opts.fields = fields;
        opts = _.extend(defaults, opts);
        var view = new SWAM.Form.View({fields:opts.fields, defaults:opts.defaults, model:opts.model});
        var dlg = new this(opts);
        dlg.addChild(".modal-body", view);
        dlg.show();
        dlg.options.view = view;
        return dlg;
    },
    offcanvas: function(opts) {
        var defaults = {
            can_dismiss: true,
            stack: true,
            template: "swam.ext.dialogs.offcanvas",
            direction: "start",
            buttons: [
                {
                    action:"close",
                    label:"Cancel"
                }
            ]
        };
        opts = _.extend({}, defaults, opts);
        if (opts.direction == "right") opts.direction = "end";
        if (opts.direction == "left") opts.direction = "start";
        if (opts.form) {
            opts.view = new SWAM.Form.View({fields:fields, defaults:opts.defaults, model:opts.model});
        }
        var dlg = new this(opts);
        if (opts.view) {
            dlg.addChild(".offcanvas-body", opts.view);
        }
        dlg.show();
        return dlg;
    },

    dismissAll: function() {
        var dlg = SWAM.active_dialog;
        while (dlg) {
            dlg.removeFromDOM();
            dlg = dlg.prev_dialog;
        }
        SWAM.active_dialog = null;
    }

});


