
PORTAL.Views.MemberSessions = SWAM.Views.AdvancedTable.extend({
    classes: "swam-paginated-table swam-table-clickable swam-table-tiny",
    defaults: {
        columns: [
            {label:"Created", field:"created|date"},
            {label:"Last Seen", field:"last_activity|ago"},
            {label:"IP", field:"ip"},
            {label:"Location", template:"{{model.location.city}}, {{model.location.state}}"},
            {label:"Browser", field:"browser"},
            {label:"OS", field:"os"},
            {label:"Device", field:"device"}
        ],
        Collection: SWAM.Collections.MemberSession,
        collection_params: {
            size: 15,
            sort: "-last_activity"
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
        SWAM.Dialog.show({
            title: "Session Info",
            json: item.model.attributes
        });

    }

});
