SWAM.Views.MonthPicker = SWAM.View.extend({
    classes: "swam-month-picker card shadow-lg p-3",
    template: "swam.ext.misc.monthpicker",
    defaults: {
        btn_classes: "btn btn-link",
        menu_items: [],
        show_context_menu: false,
        context_menu_icon: "bi bi-three-dots-vertical",
        action: "dropdown_item",
        empty_label: "Select Item"
    },

    on_init: function() {

    },
});

SWAM.Form.Builder.month = function(fc, form_info) {
    if (!fc.icon) fc.icon = "bi bi-calendar-month";
    fc.type = "text";
    return SWAM.Form.Builder.input_group(fc, form_info);
}

SWAM.Form.View.prototype.on_init__month_picker = function() {
    var self = this;
    this.$el.find("div.month-input-group").each(function(){
        var $el = $(this);
        var $input = $el.find("input");
        var options = _.extend({
            input: $input,
            value: $input.val()
        }, $el.data("options"));
        options.input_name = $input.data("name");
        var view = new SWAM.Views.MonthPicker(options);
        view.addToDOM($el);
    });
}

