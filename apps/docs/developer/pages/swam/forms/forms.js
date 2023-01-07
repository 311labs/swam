
PORTAL.Pages.ExampleForms = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.swam.forms",
    classes: "page-view page-padded has-topbar",

    busy_examples: _.keys(SWAM.Icons),

    on_init: function() {

        this.addChild("form_builder", new SWAM.Form.View({
            fields:[
                {
                    label: "Full Name",
                    name: "full_name",
                    placeholder: "Enter Your Full Name"
                },
                {
                    label: "Bio",
                    name: "bio",
                    type: "textarea",
                    placeholder: "Tell us something about yourself"
                },
                {
                    label: "Gender",
                    name: "gender",
                    type: "select",
                    options: [
                        {
                            label:"Select Gender",
                            value: ""
                        },
                        "male",
                        "female",
                        "other"
                    ]
                }
            ]
        }));

        this.addChild("test_form_basic", new SWAM.Form.View({fields:SWAM.Form.Test.Basic}));
        this.addChild("test_form_datetime", new SWAM.Form.View({fields:SWAM.Form.Test.Datetime}));
        this.addChild("test_form_misc", new SWAM.Form.View({fields:SWAM.Form.Test.Misc}));
        this.addChild("test_form_buttons", new SWAM.Form.View({fields:SWAM.Form.Test.Buttons}));
        _.each(this.children, function(obj){
            obj.on("input:change", this.on_input_change, this);
        }.bind(this));
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

    on_input_change: function(evt) {
        SWAM.toast(evt.name, evt.value);
    }

});

