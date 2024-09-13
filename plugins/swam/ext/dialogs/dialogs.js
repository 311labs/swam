SWAM.Dialogs = {};


SWAM.Dialog = SWAM.View.extend({
    classes: "modal fade",
    template: "swam.ext.dialogs.base",
    data_attrs: {"action":"bg_close"},
    defaults: {
        scrollable: false,
        can_dismiss: false,
        show_close: true,
        btn_close: "btn-close",
        replaces_el: false,
        add_header_classes: "border-bottom-1 user-select-none",
        dark: false,
        stack: true,
        size: null, // null=normal, sm, lg, xl
        scrollable_class: "overflow-auto"
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

        if (!this.options.add_classes) {
            this.options.add_classes = app.options.dialog_theme;
        }

        if (this.options.color) {
            if (!this.options.add_classes) this.options.add_classes = "";
            let lst = this.options.add_classes.split(' ');
            lst.remove('modal-primary')
                .remove('modal-success')
                .remove('modal-brand')
                .remove('modal-danger')
                .remove('modal-warning')
                .remove('modal-info')
                .remove('modal-dark')
            lst.push('modal-' + this.options.color);
            this.options.add_classes = lst.join(' ');
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

        if (this.options.context_menu) {
            this.options.show_close = false;
            this.options.show_context_menu = true;
        }

        if (this.options.btn_label && this.options.buttons) {
            let btn = _.extend({}, this.options.buttons[0], {
                label: this.options.btn_label,
            });

            if (this.options.buttons.length == 1) {
                if (_.isFunction(this.options.callback)) {
                    btn.action = "choice";
                }
            }
            this.options.buttons[0] = btn;
        }

        if (this.options.title_view) {
            this.options.add_header_classes = "d-block border-bottom-1";
            this.addChild("title_view", this.options.title_view);
        }
        SWAM.Dialog.active_dialogs.push(this);
        this.addToDOM($("body"));
        this.$el.show();
    },
    dismiss: function() {
        SWAM.Dialog.active_dialogs.remove(this);
        this.$el.removeClass("show").find(".show").removeClass("show");
        window.sleep(300).then(function(){
            SWAM.active_dialog = this.prev_dialog;
            this.prev_dialog = null;
            this.removeFromDOM();
        }.bind(this));
        this.trigger("dialog:closed", this);
    },
    on_action_close: function(evt) {
        this.dismiss();
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
        }
    },
    on_action_context_menu: function(evt) {
        let id = $(evt.currentTarget).data("id");
        let menu = _.findWhere(this.options.context_menu, {action: id});
        if (menu && menu.callback) {
            menu.callback(this, menu);
        } else if (this.options.view) {
            let func_name = "on_action_" + id;
            let view = this.options.view;
            if (_.isFunction(view[func_name])) {
                return view[func_name](evt, view.model.id);
            }
            this.options.view.on_action_click(evt);
        }
    },
    on_model_change: function(model) {
        // do nothing to prevent weird rendering on saves
    },
    on_post_render: function() {
        if (this.options.size) this.$el.find(".modal-dialog").addClass("modal-"+this.dialog_sizes[this.options.size]);
        if (this.options.vsize) this.$el.find(".modal-dialog").addClass("modal-"+this.dialog_vsizes[this.options.vsize]);
        if (this.options.height) this.$el.find(".modal-dialog").addClass("modal-"+this.dialog_vsizes[this.options.height]);
        if (this.options.scrollable) this.$el.find(".modal-dialog").addClass("modal-dialog-scrollable");
        
        if (this.options.context_menu) {
            var cmenu = [];
            _.each(this.options.context_menu, function(menu){
                if (menu.divider) return cmenu.push({divider:true});
                if (menu.action == undefined) menu.action = _.uniqueId("context_menu");
                cmenu.push({icon:menu.icon, label:menu.label, action:"context_menu", id:menu.action});
            });
            var fc = {
                "$el": this.$el.find(".modal-context-menu"),
                id: "{{model.id}}",
                icon:"bi bi-three-dots-vertical",
                btn_classes: "btn btn-link py-0 px-2",
                classes: "text-end",
                items:cmenu};
            SWAM.Form.Builder.dropdown(fc);
        }

        window.sleep(500).then(function(){
            if (this.$el.find(".offcanvas").length) {
                this.$el.find(".offcanvas").addClass("show");
            }
            this.$el.addClass("show");
            
            this.$el.find("input:text, textarea, select").not(".swam-edit-select-input").first().focus();
        }.bind(this));
    },
    getFiles: function(raw_files) {
        if (!_.isEmpty(this.children)) {
            var form = this.children["dlg_view"];
            if (form && form.getFiles) {
                if ((this.options.changes_only != false) && SWAM.Form.changes_only) return form.getChanges();
                return form.getFiles(raw_files);
            }
        }
        if (this.options.view && this.options.view.getFiles) {
            return this.options.view.getFiles(raw_files);
        }
        return SWAM.Form.getFiles(this.$el.find("form"), raw_files);
    },
    getData: function(evt) {
        if (!_.isEmpty(this.children)) {
            var form = this.children["dlg_view"];
            if (form && form.getData) {
                if ((this.options.changes_only != false) && SWAM.Form.changes_only) return form.getChanges();
                return form.getData();
            }
        }
        if (this.options.view && this.options.view.getData) {
            return this.options.view.getData();
        }
        return SWAM.Form.getData(this.$el.find("form"));
    },
    hasRequiredData: function(highlight) {
        if (this.options.view && this.options.view.hasRequiredData) {
            return this.options.view.hasRequiredData(highlight);
        }
        return true;
    },
    getFormData: function() {
        return this.getData();
    },
    setFormData: function(data) {
        this.options.view.setData(data);
    },
    getModel: function() {
        if (this.model) return this.model;
        if (this.options.model) return this.options.model;
        if (this.options.view && this.options.view.model) return this.options.view.model;
        return null;
    }
},{
    active_dialogs:[],
    globals: {
        btn_primary: "btn btn-link",
        btn_secondary: "btn btn-link color-secondary",
        btn_close: "btn-close",
        buttons: [
            {
                action:"close",
                label:"OK",
                classes: "btn btn-link"
            }
        ],
    },
    show: function(opts) {
        return this.alert(opts);
    },
    alert: function(opts) {
        if (_.isString(opts)) opts = {"title": "Alert", "message":opts};
        opts = _.deepExtend({can_dismiss:true}, opts);
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    warning: function(opts, extra) {
        if (_.isString(opts)) {
            if (_.isString(extra)) {
                opts = {"title": opts, "message": extra};
            } else {
                opts = {"title": "Alert", "message":opts};
            }
        }
        opts = _.extend({add_classes: "modal-danger modal-text-lg modal-text-center", can_dismiss:true, icon: "lightning-charge-fill"}, opts);
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    yesno: function(opts) {
        opts = _.extend({}, opts);
        opts.lbl_no = opts.lbl_no || "NO";
        opts.lbl_yes = opts.lbl_yes || "YES";
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
                    classes: "btn btn-info"
                }
            }
            if (!obj.classes) obj.classes = "btn btn-info";
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
        view.options.dlg = dlg;
        dlg.show();
        return dlg;
    },
    showInput: function(opts) {
        opts = _.extend({lbl_save: "OK", title:"Input Value", type:"text"}, opts);
        return this.showForm([{type:opts.type, name:"input", rows:4, value:opts.default}], opts);
    },
    showForm: function(fields, opts) {
        if ((opts == undefined) && (!_.isArray(fields))) {
            opts = fields;
            fields = opts.fields;
        }
        if (opts == undefined) {
            opts = {};
        }
        var defaults = {
            title: "Edit",
            padded: true,
            buttons: [
                {
                    id: "cancel",
                    action:"choice",
                    label: opts.lbl_cancel || "Cancel"
                },
                {
                    id: "save",
                    action:"choice",
                    label: opts.lbl_save || "Save"
                }
            ]
        };

        if (opts.lbl_cancel === null) {
            defaults.buttons.shift();
        }
        
        if (fields) opts.fields = fields;
        opts = _.extend(defaults, opts);
        var view = new SWAM.Form.View({fields:opts.fields, defaults:opts.defaults, model:opts.model, config:opts.form_config});
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

    showMedia: function(opts) {
        // opts.url = $el.data("media");
        // opts.kind = $el.data("kind");
        // opts.title = $el.data("title");
        if (opts.renditions) {
            // this means this is a mediaitem
            opts = {
                kind: window.identifyMediaType(opts.renditions.original.content_type),
                url: opts.renditions.original.url,
                title: opts.name
            }
        }
        if (!opts.url || !opts.kind) return true;
        let view = null;
        if ((opts.kind == "image") || (opts.kind == "I")) {
            view = new SWAM.View({
                classes: "swam-lightbox",
                template:"<div>{{{options.src|image}}}</div>",
                src:opts.url});
        } else if ((opts.kind == "video")||(opts.kind == "V")) {
            view = new SWAM.Views.Video({src:opts.url});
        } else {
            window.open(opts.url, '_blank');
            return;
        }
        if (!opts.title) opts.title = "Lightbox";
        return SWAM.Dialog.show({
            add_classes: "bg-dark text-white",
            fullscreen: true,
            title: opts.title,
            view: view,
            buttons: []
        });
    },

    showMediaPicker: function(group, callback) {
        let mdlg;
        let view = new SWAM.Views.AdvancedTable({
            remote_sort: false,
            add_classes: "swam-table-clickable",
            Collection: SWAM.Collections.MediaItem,
            columns: [
                {label:"thumb", template:"{{{model.thumbnail|img}}}", no_sort:true},
                {label: "Name", field: "name"}
            ],
            on_item_clicked: function(item) {
                let item_view = new PORTAL.Views.MediaItem({
                    on_rendition_select: function(src) {
                        mdlg.dismiss();
                        if (callback) callback(src);
                    }
                });
                item_view.setModel(item.model);
                SWAM.Dialog.showView(item_view, {title: item.model.get("name")});
            }
        });

        view.collection.params.group = group.id;
        let buttons = [
            {
                label: "Upload New",
                action: "choice",
                id: "new"
            },
            {
                label: "Close",
                action: "close"
            },
        ]
        view.collection.fetch();

        mdlg = SWAM.Dialog.showView(view, {
            title:"Select Media",
            buttons: buttons,
            size: "lg",
            callback: function(dlg, choice) {
                if (choice == "new") {
                    let model = new SWAM.Models.MediaItem();
                    SWAM.Dialog.editModel(model, {
                        defaults: {group:group.id},
                        fields: SWAM.Models.MediaItem.ADD_FORM,
                        callback: function(model, resp, dlg) {
                            if (dlg) dlg.dismiss();
                            view.collection.fetch();
                        }
                    });
                }
            }
        });
    },

    dismissAll: function() {
        while (SWAM.Dialog.active_dialogs.length > 0) {
            SWAM.Dialog.active_dialogs[SWAM.Dialog.active_dialogs.length-1].dismiss();
        }
    }

});


