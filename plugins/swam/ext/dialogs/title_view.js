SWAM.Dialog.ModelStateTitleView = SWAM.View.extend({
    template: 'swam.ext.dialogs.title_view',
    classes: "swam-dialog-title-view",
    defaults: {
        context_menu: null,
        state_menu: null,
        action_context: null,
        action_buttons: null,
        description_field: "description"
    },

    on_init() {
        let fields = [];
        if (this.options.fields) fields = [...this.options.fields];
        let action_bar = {
            type: "buttongroup",
            buttons: []
        };

        if (this.options.state_menu) {
            action_bar.buttons.push({
                type: "dropdown",
                name: "state",
                columns_classes: "col-auto",
                btn_classes: "btn btn-primary",
                items: this.options.state_menu,
            });
        }

        if (this.options.action_buttons) {
            action_bar = action_bar.concat(this.options.action_buttons);
        }

        if (this.options.context_menu) {
            action_bar.buttons.push({
                type: "dropdown",
                icon: "bi bi-three-dots-vertical",
                btn_classes: "btn btn-primary dropdown-toggle dropdown-toggle-hide-caret",
                columns_classes: "col-auto",
                items: this.options.context_menu,
            });
        }

        if (action_bar.buttons.length > 0) fields.push(action_bar);

        this.addChild("action_bar", new SWAM.Form.View({
            model: this.model,
            fields: fields
        }));
    },

    description: function() {
        return this.model.get(this.options.description_field);
    },
});
