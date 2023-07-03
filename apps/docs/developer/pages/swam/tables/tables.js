
PORTAL.Pages.ExampleTables = SWAM.Page.extend({
    template: ".pages.swam.tables",
    classes: "page-view page-padded has-topbar",

    on_init: function() {
        this.addChild("mytable", new SWAM.Views.Table({
            remote_sort: false,
            add_classes: "swam-table-clickable",
            columns: [
                {field:"id"},
                {field: "name"},
                {label:"when", field:"created|datetime"}
            ]
        }));
        this.collection = new SWAM.Collection();
        for (var i = 1; i < 10; i++) {
            this.collection.add(new SWAM.Model({id:i, name:String.Random(6), created:(Date.now()-(i * 5000))/1000}));
        }
        this.children.mytable.setCollection(this.collection);
        this.children.mytable.on("item:clicked", this.on_item_clicked, this);

        this.addChild("batch_table", new SWAM.Views.Table({
            remote_sort: false,
            add_classes: "swam-table-clickable",
            batch_select: true,
            pagination: true,
            show_loading: true,
            batch_actions: [
                {label:"Delete", icon:"trash", action:"delete"},
                {label:"Refresh", icon:"recycle", action:"refresh"}
            ],
            columns: [
                {field:"ip"},
                {field: "country"},
                {field: "state"},
                {field: "isp"},
                {context_menu:[
                    {
                        label: "Edit",
                        icon: "pencil",
                        action: "edit_item"
                    },
                    {
                        label: "Delete",
                        icon: "trash",
                        action: "delete_item"
                    }

                ]}
            ]
        }));

        this.batch_coll = new SWAM.Collection({url:"https://example-api.311labs.com/rpc/location/ips", size:10});
        this.children.batch_table.setCollection(this.batch_coll);
        // this.children.batch_table.on("item:clicked", this.on_item_clicked, this);

    },

    on_item_clicked: function(item_view, evt) {
        SWAM.toast("Table Item Clicked", SWAM.renderString("Item:{{model.id}} - {{model.name}}", item_view), 5000);
    },

    on_action_delete: function(evt) {
        SWAM.toast("Table Action", "delete", null, 5000);
    },

    on_action_refresh: function(evt) {
        SWAM.toast("Table Action", "refresh", null, 5000);
    },

    on_action_edit_item: function(evt) {
        var id = $(evt.currentTarget).data("id");
        var model = this.batch_coll.get(id);
        SWAM.toast("Table Action", "edit_item: " + model.get("ip"), null, 5000);
    },

    on_action_delete_item: function(evt) {
        var id = $(evt.currentTarget).data("id");
        var model = this.batch_coll.get(id);
        SWAM.toast("Table Action", "delete_item: " + model.get("ip"), null, 5000);
    },

    on_page_enter: function() {
        this.batch_coll.fetch();
    }
});






