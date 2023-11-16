
PORTAL.Views.MemberGroups = SWAM.Views.AdvancedTable.extend({
    classes: "swam-paginated-table swam-table-clickable swam-table-tiny",
    defaults: {
        columns: [
            {label:"Name", field:"group.name"},
            {label:"Kind", field:"group.kind"},
            {label:"Added", field:"created|datetime_tz"},
            {label:"Role", field:"role"}
        ],
        Collection: SWAM.Collections.Member,
        collection_params: {
            size: 15,
            sort: "-created"
        },
        group_members: false,
        filter_bar: null
    },

    setModel: function(model) {
      this.model = model;
      if (this.options.group_members) {
        this.collection.params.group = model.id;
    } else {
        this.collection.params.member = model.id;
    }
      
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
 
    }

});
