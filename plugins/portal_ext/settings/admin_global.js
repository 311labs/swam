SWAM.Models.AdminGlobal = SWAM.Model.extend({
    defaults: {
    	url:"/api/content/jdata"
    },
});

SWAM.Collections.AdminGlobal = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.AdminGlobal
    }
});

PORTAL.Pages.AdminGlobal = SWAM.Pages.TablePage.extend({
    classes: "page-view page-padded has-topbar",

    defaults: {
        title: "<h3>Global Settings</h3>",
        table_options: {
            add_classes: "swam-table-clickable small table-sm",
            view_only: false
        },
        add_button: {
	        type: "button",
	        action: "add_setting",
	        label: "<i class='bi bi-plus'></i> Add",
	        classes: "btn btn-primary",
	        columns:3,
	        columns_classes: "col-sm-12 col-md-3 col-lg-3",
	    },
        filter_bar: [
		    {
		        type: "group",
		        classes: "justify-content-sm-end",
		        columns: 9,
		        fields: [
		            {
		                name: "search",
		                columns: 6,
		                columns_classes: "col-sm-12 col-md-5 col-lg-6",
		                form_wrap: "search",
		                placeholder: "search",
		                button: {
		                    icon: "bi bi-search"
		                }
		            },
		            {
		                columns: 3,
		                columns_classes: "col-sm-3 col-md-3 col-lg-2",
		                type: "select",
		                name: "size",
		                options: [
		                    5, 10, 20, 50, 100
		                ]
		            },
		            {
		                columns: 3,
		                columns_classes: "col-auto",
		                type: "buttongroup",
		                buttons: [
		                    {
		                        classes: "btn btn-secondary",
		                        icon: "bi bi-arrow-repeat",
		                        action: "reload"
		                    }
		                ]
		            },
		        ]
		    }
		],
        columns: [
            {label: "Updated",field:"modified|datetime"},
            {label: "UID",field: "uid"},
            {label: "Data", field: "data|prettyjson"}
        ],
        collection_params: {
            kind: "setting",
            size: 25,
            modified_since: 1
        },
        group_filtering: false
    },

    on_init: function() {
        this.options.collection = new SWAM.Collections.AdminGlobal;
        SWAM.Pages.TablePage.prototype.on_init.call(this);
    },


	on_item_clicked: function(item, evt) {
        PORTAL.Views.ConfigDlg.showView(new PORTAL.Views.ConfigView({model: item.model}), 
        {
            title: "<h3>Edit Config</h3>", 
            size: "xl",
            buttons: [
                {
                    action:"save_config",
                    label:"Save"
                },
                {
                    action:"close",
                    label:"Close"
                }
            ]
        });
	},
    
    on_action_add_setting: function() {
        var fields = [
            {
                name: "uid",
                type: "search",
                label:"Config UID",
                columns: 12,
            }
        ];
        console.log(this)
        // SWAM.Dialog.showForm(fields, 
        //     {
        //         title:"Add Config", 
        //         model: this.model, 
        //         callback:function(dlg)
        //         {
        //             var data = dlg.getData();
        //             this.collection.add(new SWAM.Models.AdminGlobal({url:"/api/content/jdata", uid: data.uid}));
        //             console.log(this);
        //             // this.model.save(data, function(model, resp) {
        //             //     app.hideBusy();
        //             //     if (resp.status) {
        //             //         SWAM.toast("Edit Note", "Succesfully updated note");
        //             //     } else {
        //             //         SWAM.toast("Edit Note Failed", resp.error, "danger");
        //             //     }
        //             // }.bind(this));
        //             this.collection.fetch();
        //             dlg.dismiss();
        //         }.bind(this)
        //     });
        // var newModel = new this.collection.options.Model();
        // console.log(newModel);

        SWAM.Dialog.editModel(new this.collection.options.Model(), 
        {
            title:"Add Config",
            size: "md",
            fields: [
                {
                    name: "uid",
                    type: "search",
                    label:"Config UID",
                    columns: 12,
                } 
            ],
            callback:function(model, resp) {
                try {
                    SWAM.Dialog.yesno({
                        title:"WARNING",
                        message: "This config is used by active tasks. Incorrectly changing this may cause breakage. Are you sure you want to save?",
                        lbl_yes: "Yes", lbl_no: "No",
                        model: model,
                        collection: this.collection,
                        callback: function(dlg, value) {
                            dlg.dismiss();
                            console.log(this);
                            this.collection.add(model);
                            this.collection.fetch();
                            console.log(this.collection);
                        }
                    });
                }
                catch(err) {
                    SWAM.Dialog.warning({title:"ERROR: Model Not Saved", message: err.message});
                }
            }.bind(this)
        });
    }
});

PORTAL.Views.ConfigView = SWAM.View.extend(SWAM.Ext.BS).extend({
    template: "portal_ext.settings.edit_config",

    on_init: function() {
        console.log(this);
    },

    on_post_render: function() {
        if(!this.options.model || !this.$el.find("#cm_editor")) return;
        var value = this.options.model.get("data");
        if(!value) value = "[{\n\n}]";
        if(_.isObject(value)) {
            value = JSON.stringify(value, null, "\t");
        }
        this.codeMirror = CodeMirror.fromTextArea(document.getElementById("cm_editor"),{
            mode:  "javascript",
            json: true,
            lineNumbers: true
        });

        this.codeMirror.setValue(value);
        app.showBusy();
        setTimeout(function() {
            this.codeMirror.refresh();
            app.hideBusy();
        }.bind(this),250);
    }

});

PORTAL.Views.ConfigDlg = SWAM.Dialog.extend({
    on_init: function(){
        console.log(this);
    },  

    on_action_save_config: function(evt){
        try {
            SWAM.Dialog.yesno({
                title:"WARNING",
                message: "This config is used by active tasks. Incorrectly changing this may cause breakage. Are you sure you want to save?",
                lbl_yes: "Yes", lbl_no: "No",
                model: this.children.dlg_view.options.model,
                codeMirror: this.children.dlg_view.codeMirror,
                callback: function(dlg, value) {
                    dlg.dismiss();
                    var pData = JSON.parse(this.codeMirror.getValue());
                    console.log(this.model);
                    this.model.save({data: pData},function(model, resp){
                        if (resp.error) {
                            SWAM.Dialog.warning(resp.error);
                        } else {
                            SWAM.toast("Success", "Saved child");
                        }
                    }.bind(this));
                }
            });
        }
        catch(err) {
            SWAM.Dialog.warning({title:"ERROR: Model Not Saved", message: err.message});
        }
        this.dismiss();
        this.trigger("dialog:closed", this);
    }
});
