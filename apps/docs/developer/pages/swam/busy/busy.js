
PORTAL.Pages.ExampleBusy = SWAM.Page.extend({
    template: ".pages.swam.busy",
    classes: "page-view page-padded has-topbar",
    tagName: "div",

    on_init: function() {
        this.busy_examples = [];
        _.each(SWAM.Icons, function(value, key){
            if (_.isString(value)) this.busy_examples.push(key);
        }.bind(this));
    },

    on_action_app_busy: function(evt) {
        app.showBusy({timeout:4000, no_timeout_alert:true});
    },

    on_action_inline_busy: function(evt) {
        if (this.idlg) {
            this.idlg.removeFromDOM();
            this.idlg = null;
        } else {
            this.idlg = SWAM.Dialog.showLoading({
                parent:this.$el.find("#test_busy")
            });
        }

    },

    on_action_busy: function(evt) {
        var kind = $(evt.currentTarget).data("kind");
        var color = "warning";
        if (["download", "secure", "payment", "user"].indexOf(kind) >= 0) {
            color = "success";
        }
        if (kind) {
            app.showBusy({icon:kind, color:color, timeout:4000, no_timeout_alert:true});
        }
    },

});


