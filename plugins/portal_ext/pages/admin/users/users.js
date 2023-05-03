
PORTAL.Pages.Users = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "user",
        title: "Users",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"info", no_sort:true, classes:"page-toc-hide td-wrapped", template:function (model) {
                var icons = "";
                if (model.get("avatar")) icons += "<img src='" + model.get("avatar")+ "' class='image-xs rounded-circle lightbox-clickable'>";
                if (model.get('is_online')) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='user is online'><i class='bi bi-globe text-success'></i></span>";
                if (model.get('is_blocked')) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='user is blocked'><i class='bi bi-slash-circle-fill text-danger'></i></span>";
                if (!model.canNotify()) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='notifications disabled'><i class='bi bi-bell-slash-fill text-secondary'></i></span>";
                if (model.is_disabled()) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='user is disabled'><i class='bi bi-slash-circle-fill text-danger'></i></span>";
                if (model.get('is_superuser')) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='super user'><i class='bi bi-person-badge text-warning'></i></span>";
                if (model.hasPerm('manage_users')) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='user is admin'><i class='bi bi-people-fill text-info'></i></span>";
                return icons;
            }},
            {label:"User Name", field:"username"},
            {label:"Display Name", field:"display_name"},
            {label:"Last Activity", field:"last_activity|ago"},
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

