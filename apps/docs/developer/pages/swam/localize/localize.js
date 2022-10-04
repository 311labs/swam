
PORTAL.Pages.ExampleLocalize = SWAM.Page.extend(SWAM.Ext.BS).extend({
    template: ".pages.swam.localize",
    classes: "page-view page-padded has-topbar",

    on_init: function() {
        var fields = _.keys(SWAM.Localize);

        this.addChild("test_localize", new SWAM.Form.View({
            fields:[
                {
                    label: "Value",
                    name: "value",
                    value: 1660573584,
                    columns: 6
                },
                {
                    label: "Function",
                    name: "localizer",
                    type: "select",
                    options: fields,
                    columns: 6,
                    default: "datetime"
                }
            ]
        }));

        var example = {
            title: "Hello WORLD",
            created: 1660573584,
            enabled: true,
            mynumber: 45,
            balance: 1231.45,
            metadata: {
                first_name: "Jim",
                last_name: "Bob",
                age: 74,
                phone: "5553121234"
            }
        };


        this.addChild("test_form", new SWAM.Form.View({
            fields:[
                {
                    label: "Value To Localize",
                    name: "value",
                    type: "textarea",
                    rows: 10,
                    value: JSON.stringify(example, null, '   ')
                },
                {
                    label: "Template",
                    name: "template",
                    type: "textarea",
                    rows: 10,
                    value: SWAM.getTemplate(".pages.swam.localize.example")
                }
            ]
        }));
    },

    on_action_localize: function(evt) {
        var data = this.children.test_localize.getData();
        try {
            data.value = JSON.parse(data.value);
        } catch(error) {

        }
        this.$el.find("#localize_output").html(SWAM.Localize[data.localizer](data.value));
    },

    on_action_test_form: function(evt) {
        var data = this.children.test_form.getData();
        try {
            data.value = JSON.parse(data.value);
        } catch(error) {

        }
        this.$el.find("#test_output").html(SWAM.renderString(data.template, data.value));
    }

});




