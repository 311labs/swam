SWAM.Dialogs = {};


SWAM.Dialog = SWAM.View.extend({
    classes: "modal fade",
    template: "plugins.swam.ext.dialogs.base",
    data_attrs: {"action":"bg_close"},
    defaults: {
        can_dismiss: true,
        show_close: true,
        replaces_el: false,
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
        this.dismiss();
    },
    on_action_bg_close: function(evt) {
        this.dismiss();
        this.trigger("dialog:closed", this);
    },
    on_post_render: function() {
        window.sleep(200).then(function(){
            this.$el.addClass("show");
        }.bind(this));
    },
    getData: function(evt) {
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
        opts = _.extend({template:"plugins.swam.ext.dialogs.loader"}, opts);
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    showView: function(view, opts) {
        opts = opts || {"title": "Info"};
        opts.buttons = [
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
        ];
        var dlg = new this(opts);
        dlg.addChild(".modal-body", view);
        dlg.show();
        return dlg;
    },
    showForm: function(fields, opts) {
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
    },
});


