SWAM.Dialog.NLP = SWAM.Dialog.NLP || {Forms:{}};
SWAM.NLP = SWAM.NLP || {};

SWAM.Dialog.NLP.Forms.address = [
    {
        label: "Line1",
        name: "address_line1",
        columns: 12
    },
    {
        label: "Line2",
        name: "address_line2",
        columns: 12
    },
    {
        label: "City",
        name: "city",
        columns: 6
    },
    {
        label: "State, Province, or Region",
        name: "state",
        columns: 6
    },
    {
        label: "Postal Code",
        name: "zipcode",
        columns: 6
    },
    {
        label: "Country",
        name: "country",
        columns: 6,
        default: "USA"
    }
];

SWAM.Dialog.NLP.address = function(options) {
    let textaddr = "";
    if (options.defaults && options.defaults.line1) {
        textaddr = `${options.defaults.line1}\n${options.defaults.line2}\n${options.defaults.city}, ${options.defaults.state} ${options.defaults.zip}`;
    }

    SWAM.Dialog.showInput({
        title: "Address Parser - (Natural Language Processor}",
        type: "textarea",
        defaults: {input:textaddr},
        callback: function(dlg) {
            let text = dlg.getData().input;
            if (text.length < 10) return;
            dlg.dismiss();
            app.showBusy();
            SWAM.NLP.address(text, function(data){
                app.hideBusy();
                SWAM.Dialog.showForm(SWAM.Dialog.NLP.Forms.address, {
                    callback: options.callback,
                    defaults: data
                });
            });
        }
    });
};


SWAM.NLP.address = function(text, callback) {
    SWAM.Rest.POST("/rpc/restai/parse/address", {text:text}, function(data, resp){
        callback(data.data);
    });
};
