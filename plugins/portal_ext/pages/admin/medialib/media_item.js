
PORTAL.Views.MediaItem = SWAM.View.extend(SWAM.Ext.BS).extend({
    template: "portal_ext.pages.admin.medialib.media_item",
    classes: "acs-member",
    tagName: "div",

    defaults: {
        show_copy: true
    },

    on_init: function() {

    },

    on_pre_render: function() {
        if (_.isFunction(this.options.on_rendition_select)) {
            this.options.show_copy = false;
        }
    },

    on_action_select_rendition: function(evt, id) {
        if (this.options.dlg) {
            this.options.dlg.dismiss();
            this.options.dlg = null;
        }
        if (this.options.on_rendition_select) this.options.on_rendition_select(id);
    },

});