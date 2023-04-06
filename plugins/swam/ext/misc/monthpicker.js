SWAM.Views.MonthPicker = SWAM.View.extend({
    classes: "swam-month-picker card shadow-lg p-3 d-none",
    template: "swam.ext.misc.monthpicker",
    defaults: {
        btn_classes: "btn btn-link",
        menu_items: [],
        show_context_menu: false,
        context_menu_icon: "bi bi-three-dots-vertical",
        action: "dropdown_item",
        empty_label: "Select Item",
        has_changed: false
    },

    on_init: function() {
        if (this.options.value) {
            this.options.orig_value = this.options.value;
            this.val(this.options.value);
        }

    },

    val: function(value) {
        if (value == undefined) return this.options.input.val();
        this.options.value = value;
        this.options.input.val(value);
        this.options.date = moment(value);
        this.options.month = this.options.date.month() + 1;
        if (this.options.month < 10) this.options.month = `0${this.options.month}`;
        this.options.year = this.options.date.year();
        this.render();
        return this.options.value;
    },

    on_action_year_prev: function(evt) {
        this.options.year -= 1;
        this.val(`${this.options.year}-${this.options.month}`);
    },

    on_action_year_next: function(evt) {
        this.options.year += 1;
        this.val(`${this.options.year}-${this.options.month}`);
    },


    on_action_month: function(evt, month) {
        // this.options.input.val(id);
        this.options.month = month;
        if (this.options.month < 10) this.options.month = `0${month}`;
        this.val(`${this.options.year}-${this.options.month}`);
        this.on_focus_out();
    },

    on_post_render: function() {
        if (this.options.month) {
            let month = parseInt(this.options.month);
            this.$el.find(`[data-id='${month}']`).addClass("active");
        } 
    },

    on_focus_in: function(evt) {
        if (this.$el.hasClass("d-none")) {
            this.$el.removeClass("d-none");
        } else {
            this.$el.addClass("d-none");
        }

    },

    on_focus_out: function(evt) {
        this.$el.hide();
        if (this.options.orig_value != this.options.value) {
            this.options.input.change();
        }
    },

    on_dom_added: function() {
        this.render();
        if (!this._on_focus_in) this._on_focus_in = this.on_focus_in.bind(this);
        this.options.input.on("click", this._on_focus_in);
        // if (!this._on_focus_out) this._on_focus_out = this.on_focus_out.bind(this);
        // this.options.input.on("focusout", this._on_focus_out);
    },

    on_dom_removed: function() {
        this.options.input.off("focusin", this._on_focus_in);
        // this.options.input.off("focusout", this._on_focus_out);
        this.$el.empty();
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

