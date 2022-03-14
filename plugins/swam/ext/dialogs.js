

SWAM.Dialog = SWAM.View.extend({
    classes: "modal fade show",
    templateName: "dialog",
    data_attrs: {"action":"bg_close"},
    options: {
        can_dismiss: true,
        show_close: false,
        buttons: [
            {
                action:"close",
                label:"Ok"
            }
        ]
    },
    show: function() {
        if (SWAM.active_dialog) {
            SWAM.active_dialog.dismiss();
        }
        this.addToDOM($("body"));
        this.$el.show();
    },
    dismiss: function() {
        SWAM.active_dialog = null;
        this.removeFromDOM();
    },
    on_action_close: function(evt) {
        this.dismiss();
        this.trigger("dialog:closed", this);
    },
    on_action_choice: function(evt) {
        this.dismiss();
        this.choice = $(evt.currentTarget).data("id");
        this.trigger("dialog:choice", this);
        if (this.options.callback) this.options.callback(this, this.choice);
    },
},{
    alert: function(opts) {
        if (_.isString(opts)) opts = {"message":opts};
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    yesno: function(opts) {
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
    }
});
