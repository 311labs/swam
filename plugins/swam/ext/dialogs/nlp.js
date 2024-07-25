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
    let textaddr = [];
    if (options.defaults && options.defaults.line1) {
        textaddr.push(options.defaults.line1.trim());
        if (options.defaults.line2) textaddr.push(options.defaults.line2.trim());
        let line3 = []
        if (options.defaults.city) line3.push(options.defaults.city.trim());
        if (options.defaults.state) line3.push(options.defaults.state.trim());
        if (options.defaults.postalcode) line3.push(options.defaults.postalcode.trim());
        line3 = line3.join(" ");
        textaddr.push(line3);
        textaddr = textaddr.join("\n");
    }

    SWAM.Dialog.showInput({
        title: "Address Parser - (Natural Language Processor}",
        type: "textarea",
        defaults: {input:textaddr},
        callback: function(dlg) {
            let text = dlg.getData().input;
            if (text.length < 10) return;
            app.showBusy();
            SWAM.NLP.address(text, function(data){
                app.hideBusy();
                if (!data.address_line1) {
                    SWAM.Dialog.show({title:"Error", message:data.content||data.error});
                    return;
                }
                dlg.dismiss();
                SWAM.Dialog.showForm(SWAM.Dialog.NLP.Forms.address, {
                    callback: options.callback,
                    defaults: data
                });
            });
        }
    });
};


SWAM.NLP.address = function(text, callback) {
    SWAM.Rest.POST("/api/restai/parse/address", {text:text}, function(data, resp){
        callback(data.data);
    });
};
