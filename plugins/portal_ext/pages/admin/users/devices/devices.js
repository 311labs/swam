
PORTAL.Views.MemberDevices = SWAM.Views.AdvancedTable.extend({
    classes: "swam-paginated-table swam-table-clickable swam-table-tiny",
    defaults: {
        columns: [
            {label:"Created", field:"created|date"},
            {label:"Last Seen", field:"modified|ago"},
            {label:"IP", field:"ip"},
            {label:"Name", field:"name"},
            {label:"Kind", field:"kind"},
            {label:"CM", field:"cm_provider"}
        ],
        Collection: SWAM.Collections.MemberDevice,
        collection_params: {
            size: 15,
            sort: "-modified"
        },
        filter_bar: null
    },

    setModel: function(model) {
      this.model = model;
      this.collection.params.member = model.id;
      if (this.isInViewport()) {
          this.collection.fetch();
      } else {
          this.collection.reset();
      }
      
    },

    on_tab_focus: function() {
        this.collection.fetchIfStale();
    },

    on_item_clicked: function(item) {
        SWAM.toast("Device Token", item.model.get("cm_token"), "info", 10000);
        SWAM.Dialog.showForm([
            {
                label: "Kind",
                name: "kind",
                type: "select",
                options: ["event", "notification", "data_change"]
            },
            {
                label: "Title",
                name: "title"
            },
            {
                label: "Body",
                name: "body"
            },
            {
                label: "Sound",
                name: "sound"
            }

        ], {size:"sm", title: "Send Cloud Message", lbl_save:"Send", callback: function(dlg){
            app.showBusy();
            var data = dlg.getData();
            SWAM.Rest.POST("/rpc/account/member/device/notify", {payload:data, device_id:item.model.get("uuid")}, function(resp) {
                if (resp.status) {
                    dlg.dismiss();
                } else {
                    SWAM.toast("Send Failed", resp.error, "danger", 5000);
                }
                app.hideBusy();
            });
        }.bind(this)});
    }

});
