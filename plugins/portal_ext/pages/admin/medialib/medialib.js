
PORTAL.Pages.MediaItems = SWAM.Pages.TablePage.extend(SWAM.Ext.DropZone).extend({

    defaults: {
        icon: "image",
        title: "Media Items",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
	        {label:"thumb", template:"{{{model|lightbox}}}", no_sort:true},
            {label:"id", field:"id"},
            {label:"Created", field:"created|date"},
            {label:"name", field:"name"},
            {label:"description", field:"description"},
            {label:"kind", field:"kind"},
            {label:"state", field:"state_display"},
        ],
        Collection: SWAM.Collections.MediaItem,
        collection_params: {
            size: 10
        },
        group_filtering: false,
        filters: [
            {
                label: "Name",
                name: "name",
                type: "text"
            },
            {
                label: "Kind",
                name: "kind",
                type: "select",
                options: [
                	{label:"Image", value:"I"},
                	{label:"Video", value:"V"},
                	{label:"Audio", value:"D"},
                	{label:"External Link", value:"E"},
                	{label:"Text", value:"T"},
                	{label:"Unknown", value:"*"},
                ]
            },
            {
                label: "Created",
                name: "created",
                type: "daterange"
            },
            {
                label: "State",
                name: "state",
                type: "select",
                options: [
                	{label:"In-Active", value:0},
                	{label:"Deleted", value:1},
                	{label:"Archived", value:50},
                	{label:"initial pending", value:100},
                	{label:"Render Pending", value:101},
                	{label:"Render Failed", value:111},
                	{label:"Render Ending", value:120},
                	{label:"Active", value:200},
                ]
            }
        ]
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        this.options.view = new PORTAL.Views.MediaItem();
    },

    on_drop_file: function(file) {
        let model = new SWAM.Models.MediaItem();

        let dd = {
            media:  file
        };
        if (this.options.group_filtering && app.group) dd.group = app.group.id;
        model.save(
            SWAM.Form.filesToData(file, dd), 
            function(m, resp){
                this.collection.fetch();
            }.bind(this));
    },
});

