
PORTAL.Views.IncidentList = SWAM.Views.AdvancedTable.extend({
    classes: "swam-paginated-table swam-table-clickable swam-table-tiny",
    defaults: {
        columns: [
            {label:"when", field:"created|datetime"},
            {label:"cat", field:"category"},
            {label:"description", field:"description", classes:"d-none d-lg-table-cell"},
        ],
        Collection: SWAM.Collections.IncidentEvent,
        collection_params: {
            size: 5,
        },
        component: "account.Member",
        filters: [
            {
                label: "Created",
                name: "created",
                type: "daterange"
            },
            {
                label: "IP",
                name: "reporter_ip",
                type: "text"
            },
            {
                label: "Category",
                name: "category",
                type: "select",
                editable: true,
                options: ["ossec", "account"]
            },
            {
                label: "Level",
                name: "level",
                type: "select",
                options: [
                    {
                        label: "All Levels",
                        value: ""
                    },
                    {
                        label: "Caution",
                        value: "__lt:9"
                    },
                    {
                        label: "Warning",
                        value: "__lt:6"
                    },
                    {
                        label: "Critical",
                        value: "__lt:3"
                    }
                ]
            },
        ]
    },

    setModel: function(model) {
      this.model = model;
      this.collection.params.component = this.options.component;
      this.collection.params.component_id = model.id;
      if (this.options.group_filtering) {
          let group = model.get("group");
          if (group && group.id) {
            this.collection.params.group = group.id;
          } else if (group) {
            this.collection.params.group = group;
          }
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
        SWAM.Dialog.show({
            title: "Session Info",
            json: item.model.attributes
        });

    }

});
