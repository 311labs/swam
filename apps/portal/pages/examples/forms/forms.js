
PORTAL.Pages.ExampleForms = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.examples.forms",
    classes: "page-view page-padded has-topbar",

    busy_examples: _.keys(SWAM.Icons),

    on_init: function() {
        this.addChild("test_form_basic", new SWAM.Form.View({fields:SWAM.Form.Test.Basic}));
        this.addChild("test_form_datetime", new SWAM.Form.View({fields:SWAM.Form.Test.Datetime}));
        this.addChild("test_form_misc", new SWAM.Form.View({fields:SWAM.Form.Test.Misc}));
        this.addChild("test_form_buttons", new SWAM.Form.View({fields:SWAM.Form.Test.Buttons}));
    },

    on_action_form_json_basic: function(evt) {
        SWAM.Dialog.alert({title:"Form Data", json:SWAM.Form.Test.Basic});
    },

    on_action_form_json_datetime: function(evt) {
        SWAM.Dialog.alert({title:"Form Data", json:SWAM.Form.Test.Datetime});
    },

    on_action_form_json_misc: function(evt) {
        SWAM.Dialog.alert({title:"Form Data", json:SWAM.Form.Test.Misc});
    },

    on_action_form_json_buttons: function(evt) {
        SWAM.Dialog.alert({title:"Form Data", json:SWAM.Form.Test.Buttons});
    },

});


