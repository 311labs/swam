
SWAM.Views.SearchDownItem = SWAM.Views.ListItem.extend({
    tagName: "div",
    classes: "hover-primary",
    template: "<a href='#' class='dropdown-item'>{{display_label}}</a>",

});

SWAM.Views.SearchDown = SWAM.View.extend({
    tagName: "div",
    classes: "swam-search-down dropdown",
    template: "plugins.swam.ext.lists.searchdown",

    defaults: {
        List: SWAM.Views.List,
        ItemView: SWAM.Views.SearchDownItem,
        btn_classes: "btn btn-link text-decoration-none",
        search_field: "name",
        display_field: "name",
        empty_label: "Select Item",
        placeholder: "Search...",
        max_size: 10
    },

    events: {
        "keyup input": "on_input_keypress",
        "click button#searchdown": "on_toggle_dropdown"
    },

    on_init: function() {
        this.collection = this.options.collection;
        this.list = new this.options.List(_.extend({tagName:"div"}, this.options));
        this.list.on("item:clicked", this.on_item_clicked, this);
        this.addChild("searchdown-list", this.list);
        ;
    },

    active_label: function() {
        if (this.active_model) return this.active_model.get(this.options.display_field);
        return this.options.empty_label;
    },

    on_toggle_dropdown: function(evt) {
        window.sleep(200).then(function(){
            this.$input.focus();
        }.bind(this));
    },

    on_item_clicked: function(item) {
        this.active_model = item.model;
        this.$button.text(item.model.get(this.options.display_field));
    },

    on_filter: function(keyword) {
        if (!keyword) {
            // nothing?
            this.collection.clearFilter();
        } else {
            var models = this.collection.search(this.options.search_field, keyword);
            this.collection.sortBy(this.options.search_field, false, models);
        }
    },

    _on_keyup: function(evt) {
        this.on_filter(this.$input.val());
    },

    on_input_keypress: function(evt) {
        if (!this._debounce_keyup) {
            this._debounce_keyup = window.debounce(this._on_keyup.bind(this), 100, false);
        }
        this._debounce_keyup(evt);
    },

    on_post_render: function() {
        this.$button = this.$el.find("button#searchdown");
        this.$input = this.$el.find("input#search");
    }
});

