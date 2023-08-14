
PORTAL.Pages.WikiList = SWAM.Pages.TablePage.extend({
    classes: "page-view page-padded has-topbar",

    defaults: {
        icon: "currency-dollar",
        title: "Wiki Pages",
        table_options: {
            add_classes: "swam-table small table-sm swam-table-clickable",
            batch_select: true,
            download_prefix: "wikis"
        },
        columns: [
            {label: "Modified", field:"modified|datetime_tz"},
            {label: "Path", field:"path"},
            {label: "Title", field: "title"}
        ],
        Collection: SWAM.Collections.WikiPage,
        collection_params: {
            size: 20,
            graph: "default",
            sort: "-modified"
        },
        group_filtering: true
    },

    on_item_clicked: function(item, evt) {
        let self = this;
        SWAM.Dialog.show({
            title: item.model.get("title"),
            add_classes: "wiki-page",
            message: item.model.get("html.body"),
            size: "large",
            padded: true,
            context_menu: [
                {
                    label: "Edit",
                    icon: "pencil",
                    action: "edit_item",
                    callback: function(dlg, menu) {
                        self.on_item_edit(item, evt);
                    }
                },
            ]
        });
    },
});