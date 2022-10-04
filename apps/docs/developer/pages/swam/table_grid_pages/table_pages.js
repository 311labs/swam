
PORTAL.Pages.ExampleTableGridPages = SWAM.Pages.TablePage.extend({
    classes: "page-view page-padded has-topbar",

    defaults: {
        icon: "user",
        title: "Table Page Example",
        table_options: {
            add_classes: "swam-table-clickable small table-sm",
            batch_select: true,
            view_only: true // don't show edit for on click
        },
        add_button: null,
        columns: [
           {label:"Modified", field:"modified|date", classes:"d-none d-md-table-cell"},
           {label:"IP", field:"ip"},
           {label:"ISP", field:"isp", classes:"d-none d-md-table-cell"},
           {label:"Country", field:"country"},
           {label:"State", field:"state"},
           {label:"City", field:"city", classes:"d-none d-lg-table-cell"},
           {label:"lat/lng", template:"{{model.lat}}/{{model.lng}}", classes:"d-none d-xl-table-cell"},
        ],
        collection_params: {
            size: 10,
            sort: "-modified"
        },
        group_filtering: false,
        filters: [
            {
                label: "Date Range",
                name: "created",
                type: "daterange",
                operator: "is"
            },
            {
                label: "Country",
                name: "country",
                type: "select",
                editable: true,
                options: "countries"
            },
            {
                label: "State",
                name: "state",
                type: "select",
                editable: true,
                options: "us_states"
            },
            {
                label: "City",
                name: "city",
                type: "text",
            },
            {
                label: "IP",
                name: "ip",
                type: "text",
            },
            {
                label: "ISP",
                name: "isp",
                type: "select",
                editable: true,
                options: [
                    "Cox", "Verizon", "AT&T", "VMWare", "DigitalOcean", "Microsoft", "Alibaba"
                ]
            },
        ]
    },

    on_init: function() {
        this.options.collection = new SWAM.Collection({url:"https://test.payauth.io/rpc/location/ips"});
        this.appendChild("code", new SWAM.View({template:".pages.swam.table_grid_pages.table_pages"}));
        SWAM.Pages.TablePage.prototype.on_init.call(this);
    },
    
});
