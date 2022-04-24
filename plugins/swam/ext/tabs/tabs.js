
SWAM.Views.Tabs = SWAM.View.extend({
    template: "plugins.swam.ext.tabs",
    classes: "swam-tabs-view",
    defaults: {

    },

    on_init: function(evt) {
        this.tab_views = {};
        this.options.tabs = [];
    },

    on_action_tab: function(evt, tab_id) {
        this.setActiveTab(tab_id);
    },

    getTabLabel: function(tab_id) {
        var tab_info = _.findWhere(this.options.tabs, {id: tab_id});
        if (tab_info) return tab_info.label;
        return null;
    },

    setActiveTab: function(tab_id) {
        this.options.active_tab = tab_id;
        var view = this.getTab(tab_id);
        if (!view) {
            SWAM.Dialog.warning("No view for tab: " + tab_id);
            return;
        }
        this.children["#active_tab_view"] = view;
        this.$el.find(".active").removeClass("active");
        this.$el.find('li[data-id="' + tab_id + '"]').addClass("active");
        this.$el.find("#tabs_dropdown").html(this.getTabLabel(tab_id));
        this.renderChildren(true);
        if (_.isFunction(view.on_tab_focus)) view.on_tab_focus();
    },

    setModel: function(model) {
        SWAM.View.prototype.setModel.call(this, model);
        _.each(this.tab_views, function(child){
            child.setModel(model);
        });
    },

    addTab: function(label, tab_id, view, opts) {
        this.options.tabs.push(_.extend({label:label, id:tab_id}, opts));
        this.tab_views[tab_id] = view;
    },

    removeTab: function(tab_id) {
        if (this.tab_views[tab_id]) {
            delete this.tab_views[tab_id];
        }
    },
    getTab: function(tab_id) {
        return this.tab_views[tab_id];
    },

    get_tabs: function() {
        var allowed_tabs = [];
        _.each(this.options.tabs, function(tab){
            if (tab.requires_perm) {
                if (!app.me) return;
                if (!app.me.hasPerm(tab.requires_perm)) return;
            }
            if (app.group && tab.requires_group_setting) {
                if (!app.group.hasSetting(tab.requires_group_setting)) return;
            }
            allowed_tabs.push(tab);
        });
        return allowed_tabs;
    },

    on_post_render: function() {
        if (this.options.active_tab) {
            this.setActiveTab(this.options.active_tab);
        }
    }

});