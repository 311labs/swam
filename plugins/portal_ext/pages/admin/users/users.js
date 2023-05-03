
PORTAL.Pages.Users = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "user",
        title: "Users",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {
                label: "Avatar",
                no_sort:true,
                field: "avatar|image('/plugins/media/empty_avatar.jpg', 'rounded image-md')",
                classes:"d-table-cell d-sm-none tc-min"
            },
            {
                label: "User",
                sort: "username",
                template: "<div>{{model.display_name}} {{{model.icons}}}</div><div class='text-muted'>{{model.username}}</div><div class='text-muted'>{{model.last_activity|ago}}</div>",
                classes:"d-table-cell d-sm-none"
            },
            {
                label:"info", no_sort:true, 
                classes:"page-toc-hide td-wrapped", 
                field: "icons",
                classes:"d-none d-sm-table-cell"
            },
            {
                label:"User Name", field:"username",
                classes:"d-none d-sm-table-cell"
            },
            {
                label:"Display Name", field:"display_name",
                classes:"d-none d-sm-table-cell"
            },
            {
                label:"Last Activity", field:"last_activity|ago",
                classes:"d-none d-sm-table-cell"
            },
        ],
        Collection: SWAM.Collections.User,
        collection_params: {
            size: 10,
            sort: "-last_activity"
        },
        filters: [
            {
                label: "User",
                name: "filter",
                type: "select",
                options: [
                    {label:"Active", value:""},
                    {label: "Disabled", value: "is_active:0"},
                    {label: "Staff", value: "is_staff:1"},
                    {label: "Non Staff", value: "is_staff:0"},
                    {label: "Online", value: "is_online:1"},
                    {label: "Blocked", value: "is_blocked:1"},
                ],
                operator: "is"
            }
        ],
        group_filtering: false
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        this.view = new PORTAL.Views.User();
    },

    on_item_clicked: function(item) {
        this.view.setModel(item.model);
        SWAM.Dialog.showView(this.view, {size:"lg", vsize:"lg", can_dismiss:true, scrollable:true});
    },

});

