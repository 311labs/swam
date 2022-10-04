

PORTAL.Views.ExampleTableTOCView = SWAM.View.extend(SWAM.Ext.BS).extend({
    template: ".pages.swam.table_toc.table_toc_view",

});


PORTAL.Pages.ExampleTableTOC = SWAM.Page.extend({
    classes: "page-view page-padded has-topbar page-fullscreen",

    defaults: {
        title: "SWAM TOC",

        filters: [
            {
                label: "Search",
                name: "search"
            },
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
        ],

        action_bar_filters: [
            {
                columns: 12,
                columns_classes: "col-auto",
                type: "buttongroup",
                buttons: [
                    {
                        classes: "btn btn-secondary swam-toc-hide",
                        icon: "bi bi-code-slash",
                        action: "show_code"
                    },
                    {
                        classes: "btn btn-secondary",
                        icon: "bi bi-arrow-repeat",
                        action: "reload"
                    },
                    {
                        type: "dropdown",
                        icon: "bi bi-download",
                        items: [
                            {
                                icon: "bi bi-filetype-csv",
                                label: "Download CSV",
                                action: "download_csv"
                            },
                            {
                                icon: "bi bi-filetype-json",
                                label: "Download JSON",
                                action: "download_json"
                            },
                        ]
                    }

                ]
            },
        ]
    },

    on_init: function() {
        this.collection = new SWAM.Collection({url:"https://test.payauth.io/rpc/location/ips", size:20}),
        this.appendChild("table_toc", new SWAM.View.TableTOC({
            title: this.options.title,
            filters: this.options.filters,
            filter_bar_filters: this.options.filter_bar_filters,
            action_bar_filters: this.options.action_bar_filters,
            view: new PORTAL.Views.ExampleTableTOCView(),
            table_options: {
                collection: this.collection,
                pagination: true,
                batch_select: true,
                columns: [
                    {field:"ip"},
                    {field: "country"},
                    {field: "state", classes: "swam-toc-hide"},
                    {field: "isp", classes: "swam-toc-hide"}
                ]
            }
        }));
    },
    
    on_page_enter: function() {
        this.collection.fetch();
    },

    on_action_show_code: function(evt) {
        SWAM.Dialog.showView(new SWAM.View({template:".pages.swam.table_toc.code"}), {title:"Table TOC Code", size: "xl"});
    }
});




