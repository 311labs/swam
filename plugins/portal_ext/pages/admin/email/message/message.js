PORTAL.Pages.EmailMessage = SWAM.Pages.TablePage.extend({
    defaults: {
        icon: "mailbox",
        title: "Email Incoming Messages",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label: "Sent", field:"sent_at|datetime"},
            {label: "To", field: "to_email"},
            {label: "From", template: "{{model.from_name}} {{model.from_email}}"},
            {label: "Subject", field: "subject"}
        ],
        Collection: SWAM.Collections.EmailMessage,
        collection_params: {
            size: 10
        },
        group_filtering: false,
        add_button: false
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        this.view = new PORTAL.Views.EmailMessage();
    },

    on_item_clicked: function(item, evt) {
        this.view.setModel(item.model);
        var title = item.model.get("from_email") + " - " + item.model.get("subject"); 
        SWAM.Dialog.showView(this.view, {
            title: title,
            kind: "primary",
            can_dismiss: true,
            padded: true,
            scrollable: true,
            size: 'lg',
            height: 'md',
            // "context_menu": context_menu
        });
    }
});


// swamcore.plugins.portal_ext.pages.admin.dashboard

PORTAL.Views.EmailMessage = SWAM.Views.Tabs.extend({
    on_init: function() {
        SWAM.Views.Tabs.prototype.on_init.call(this)

        this.addTab("Message", "message", 
            new SWAM.View({template:"swamcore.plugins.portal_ext.pages.admin.email.message"}));
        

        let collection = new SWAM.Collections.EmailAttachment();
        collection.params.message = -1;
        this.addTab("Attachments", "attachments", new SWAM.Views.Table({
            collection: collection,
            remote_sort: false,
            add_classes: "swam-table",
            columns: [
                {label:"when", field:"created|datetime"},
                {label:"name", field:"name"},
                {label:"content_type", field:"content_type"},
                {label:" ", template:"<button data-action='download' data-id='{{model.id}}' class='btn btn-primary'>{{{ICON('download')}}}</button>"}
            ],
            pagination: true,
        }));

        this.setActiveTab("message");
    },

    setModel: function(model) {
        // filter the collection models to pertain only to the views model id
        SWAM.Views.Tabs.prototype.setModel.call(this, model);
        this.options.model = model;
        this.getTab("attachments").collection.params.message = this.options.model.get("id");
    },

    on_action_download: function(evt) {
        let id = $(evt.currentTarget).data("id");
        let model = this.getTab("attachments").collection.get(id);
        SWAM.Rest.DOWNLOAD(model.get("media.renditions.original.secure_url"),
            null, function() {
                SWAM.toast("downloaded", model.get("name"), "success");
            },{
                no_auth: true,
                filename: model.get("name"),
            });
    }
});