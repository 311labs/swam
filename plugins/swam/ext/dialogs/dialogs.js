SWAM.Dialogs = {};


SWAM.Dialog = SWAM.View.extend({
    classes: "modal fade",
    template: "plugins.swam.ext.dialogs.base",
    data_attrs: {"action":"bg_close"},
    defaults: {
        can_dismiss: false,
        show_close: true,
        replaces_el: false,
        size: null, // null=normal, sm, lg, xl
        buttons: [
            {
                action:"close",
                label:"Ok"
            }
        ]
    },
    events: {
        "click": "on_dlg_click"
    },
    dialog_sizes: {
        "medium": "lg",
        "small": "sm",
        "large": "xl"
    },
    on_dlg_click: function(evt) {
        if ($(evt.target).hasClass("modal")) {
            this.on_action_bg_close(evt);
        }
    },
    show: function() {
        if (!this.options.stack && SWAM.active_dialog) {
            SWAM.active_dialog.dismiss();
        } else if (this.options.stack) {
            SWAM.prev_dialog = SWAM.active_dialog;
        }
        SWAM.active_dialog = this;
        if (this.options.json) {
            this.options.pre = SWAM.Localize.prettyjson(this.options.json);
        } else if (this.options.xml) {
            this.options.pre = SWAM.Localize.prettyxml(this.options.xml);
        }
        this.addToDOM($("body"));
        this.$el.show();
    },
    dismiss: function() {
        this.$el.removeClass("show");
        window.sleep(200).then(function(){
            SWAM.active_dialog = SWAM.prev_dialog;
            SWAM.prev_dialog = null;
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
        this.trigger("dialog:choice", this);
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
        window.sleep(200).then(function(){
            this.$el.addClass("show");
        }.bind(this));
    },
    getData: function(evt) {
        if (!_.isEmpty(this.children)) {
            var form = this.children[".modal-body"];
            if (form && form.getData) return form.getData();
        }
        return SWAM.Form.getData(this.$el.find("form"));
    },
},{
    alert: function(opts) {
        if (_.isString(opts)) opts = {"title": "Alert", "message":opts};
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    yesno: function(opts) {
        opts = _.extend({template:"plugins.swam.ext.dialogs.yesno"}, opts);
        opts.no_lbl = opts.no_lbl || "no";
        opts.yes_lbl = opts.yes_lbl || "yes";
        opts.buttons = [
            {
                id: opts.no_lbl,
                action:"choice",
                label:opts.no_lbl
            },
            {
                id: opts.yes_lbl,
                action:"choice",
                label:opts.yes_lbl
            }
        ];
        return this.alert(opts);
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
                label:"Cancel"
            }
        ];
        return this.alert(opts);
    },
    showLoading: function(opts) {
        if (opts.icon) {
            if (!opts.icon.startsWith("<")) {
                opts.icon = SWAM.Icons[opts.icon];
            }
        }
        opts = _.extend({template:"plugins.swam.ext.dialogs.loader", color:"warning"}, opts);
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    showView: function(view, opts) {
        var defaults = {
            title: "View",
            buttons: [
                {
                    action:"close",
                    label:"Cancel"
                }
            ]
        };
        opts = _.extend(defaults, opts);
        var dlg = new this(opts);
        dlg.addChild(".modal-body", view);
        dlg.show();
        return dlg;
    },
    showForm: function(fields, opts) {
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
                    label: "Save"
                }
            ]
        };
        opts = _.extend(defaults, opts);
        return this.showView(new SWAM.Form.View({fields:fields, defaults:opts.defaults, model:opts.model}), opts);
    },
    showModel: function(model, fields, options) {
        var $container = $("<div />").addClass("model-fields row");

        _.each(fields, function(obj){
            if (_.isString(obj)) {
                obj = {field:obj};
            }
            if (!obj.label) obj.label = obj.field;
            if (!obj.field) obj.field = obj.label;
            if (!obj.columns) obj.columns = 6;
            var $fieldbox = $("<div />")
                .addClass("col-sm-" + obj.columns)
                .appendTo($container);
            var $wrapper = $("<div />").addClass("model-field mb-3").appendTo($fieldbox);
            $wrapper.append($("<div />").addClass("field-label h6 mb-1").text(obj.label));
            var value = model.get(obj.field, obj.localize);
            if ((obj.localize == "prettyjson")||(obj.tag == "pre")) $wrapper = $("<pre />").appendTo($wrapper);
            $wrapper.append($("<div />").addClass("field-value").text(value));
        });

        options = _.extend({
            message: $container.wrap('<p/>').parent().html(),
        }, options);

        var dlg = new this(options);
        return dlg.show();
    }
});


