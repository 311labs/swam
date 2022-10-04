
PORTAL.Pages.ExampleSearchDown = SWAM.Page.extend({
    template: ".pages.swam.searchdown",
    classes: "page-view page-padded has-topbar",
    tagName: "div",

    on_init: function() {
        this.collection = new SWAM.Collection({
            debounce_time: 1000,
            url:"https://test.payauth.io/rpc/location/ips",
            size:20}),

        this.addChild("mysearchdown", new SWAM.Views.SearchDown({
            btn_classes: "btn btn-default text-decoration-none",
            search_field: "search",
            display_field: "ip",
            empty_label: "Select Item",
            placeholder: "Search...",
            action: "searchdown",
            remote_search: true,
            auto_fetch: true,
            show_loading: true,
            max_size: 10,
            inline: true,
            on_top: false,
            collection: this.collection, 
        }));
    },

    on_action_searchdown: function(evt) {
        // get the model straight from the component
        var model = this.children.mysearchdown.active_model;
        // or get the model id from the event
        var myid = $(evt.currentTarget).data("id");
        SWAM.toast("Searchdown Event",
            SWAM.renderString("{{id}} - {{model.ip}} - {{model.isp}}", {id:myid, model:model}),
            "info",
            3000);
    },

});


