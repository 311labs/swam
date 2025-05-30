
SWAM.Views.SearchDownItem = SWAM.Views.ListItem.extend({
    tagName: "div",
    classes: "hover-primary",
    template: "<a href='#' class='dropdown-item' data-action='{{options.list.options.action}}' data-id='{{model.id}}'>{{display_label}}</a>",

});

SWAM.Views.SearchDown = SWAM.View.extend({
    tagName: "div",
    classes: "swam-search-down dropdown",
    template: "swam.ext.misc.searchdown",

    defaults: {
        List: SWAM.Views.List,
        ItemView: SWAM.Views.SearchDownItem,
        btn_classes: "btn btn-default text-decoration-none",
        search_field: "search",
        display_field: "name",
        empty_label: "Select Item",
        placeholder: "Search...",
        action: "searchdown",
        input_name: null, // used in forms
        input_value_field: "id", // used in forms to set value
        remote_search: false,
        auto_fetch: true,
        show_loading: true,
        inline: true,
        on_top: false
    },

    events: {
        "keyup input": "on_input_keypress",
        "click button#searchdown": "on_toggle_dropdown"
    },

    on_init: function() {
        this.collection = this.options.collection;
        this.collection.params.size = 10;
        this.list = new this.options.List(_.extend({tagName:"div"}, this.options));
        this.list.on("item:clicked", this.on_item_clicked, this);
        this.addChild("searchdown-list", this.list);
        this.collection.on("loading:begin", this.on_loading_begin, this);
        this.collection.on("loading:end", this.on_loading_end, this);
    },

    on_loading_begin: function(evt) {

    },

    on_loading_end: function(evt) {

    },

    setActive: function(model) {
        this.active_model = model;
        if (model) {
            if (this.$button) this.$button.text(model.get(this.options.display_field));
            if (this.options.input_name) {
                this.$el.find("#hidden_input").val(this.active_model.get(this.options.input_value_field));
            }
        } else {
            if (this.$button) this.$button.text(this.options.empty_label);
            if (this.options.input_name) {
                this.$el.find("#hidden_input").val("");
            }
        }
    },

    setRecent: function(recent_ids) {
        this.options.recent_ids = recent_ids;
    },

    active_label: function() {
        if (this.active_model) return this.active_model.get(this.options.display_field);
        return this.options.empty_label;
    },

    on_toggle_dropdown: function(evt) {
        window.sleep(200).then(function(){
            this.$input.focus();
        }.bind(this));
        if (this.options.on_top) {
           this.$el.find("div.dropdown-menu").first().css("transform", "translate3d(0, 0, 0)");
        }
    },

    on_item_clicked: function(item) {
        this.setActive(item.model);
    },

    on_action_close: function(evt, id) {
        if (this.options.no_close_clear) return;
        this.setActive(null);
        this.trigger("searchdown:clear", this);
    },

    on_filter: function(keyword) {
        if (this.collection.params.pk__in) delete this.collection.params.pk__in;
        if (!keyword) {
            // nothing?
            this.collection.clearFilter();
            // if (this.options.recent_ids) this.collection.params.pk__in = this.options.recent_ids;
            this.collection.fetch();
        } else if (this.options.remote_search) {
            this.collection.params[this.options.search_field] = keyword;
            this.collection.fetch();
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
        if (!app.me || !app.me.isAuthed()) return;
        if (this.options.inline) {
            this.options.on_top = false;
            this.$el.addClass("searchdown-on-top");
        }
        if (this.options.auto_fetch && !this.collection.length) {
            // if (this.options.recent_ids) this.collection.params.pk__in = this.options.recent_ids;
            this.collection.fetchIfStale();
        }
        if (this.active_model) {
            this.setActive(this.active_model);
        }
    }
});
