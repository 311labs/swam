SWAM.Views.EditSelect = SWAM.View.extend({
    classes: "swam-editselect",
    template: "swam.ext.misc.editselect",
    defaults: {
        tagName: "div",
        replaces_el: false,
        btn_classes: "btn btn-link dropdown-toggle",
        menu_items: [],
        action: "dropdown_item",
        empty_label: "Select Item"
    },

    on_init: function() {
        var normalized = [];
        _.each(this.options.menu_items, function(item){
            if (_.isString(item)) {
                normalized.push({id:item, label:item});
            } else {
                if (_.isUndefined(item.id)) item.id = item.label;
                normalized.push(item);
            }
        });
        this.options.menu_items = normalized;
    },

    replaceSelect: function($el) {
        this.options.name = $el.attr("name");
        this.options.value = $el.val();
        this.options.placeholder = $el.attr("placeholder");
        var self = this;
        $el.find("option").each(function(){
            self.options.menu_items.push({label:this.innerHTML, value:this.value})
        });
        if ($el.hasClass("force_top")) this.options.force_top = true;
        this.addToDOM($el.parent());
        $el.remove();
    },

    events: {
        "focus input": "on_focus",
        "blur input": "on_blur"
    },

    on_focus: function(evt) {
        this.$dropdown.css("width", this.$el.outerWidth());
        this.$dropdown.addClass("show");
        if (this.options.force_top) {
            $('body').append(this.$dropdown.css({
              position: 'absolute',
              "z-index": "10001",
              left: this.$dropdown.offset().left,
              top: this.$dropdown.offset().top
            }).detach());

            if (!this._on_selected) {
                this._on_selected = this.on_action_es_selected.bind(this);
                this.$dropdown.find("a").on("click", this._on_selected);
            }
        }
    },

    on_blur: function(evt) {
        setTimeout(this.on_input_blur.bind(this), 200);
    },

    on_input_blur: function(evt) {
        this.$dropdown.removeClass("show");
        if (this.options.force_top) {
          this.$el.append(this.$dropdown.css({
            position: "absolute",
            left: "inherit",
            top: "inherit"
          }).detach());
        }
    },

    on_action_es_selected: function(evt) {
        var $el = $(evt.currentTarget);
        var $input = this.$el.find("input");
        $input.val($el.data("id")).trigger("change");
    },

    active_label: function() {
        if (this.options.active_item) {
            var item = this.options.active_item;
            if (item.icon) {
                return SWAM.Icons.getIcon(item.icon) + " " + item.label;
            }
            return item.label;
        }
        return this.options.empty_label;
    },

    on_post_render: function() {
        this.$dropdown = this.$el.find(".dropdown-menu");
    }
});