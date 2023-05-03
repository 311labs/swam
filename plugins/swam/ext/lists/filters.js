
SWAM.Views.ListFilters = SWAM.Form.View.extend({
    classes: "swam-list-filter",

    on_init: function() {
        this.appendChild("fb_actions", new SWAM.Form.View({fields:this.options.filter_bar, add_classes: "filter-action-bar"}));
        this.getChild("fb_actions").on("input:change", function(evt){
            if (evt.start && evt.end) {
                this.on_daterange_picker(evt);
            } else if (evt.date) {
                this.on_datepicker(evt);
            } else {
               this.on_input_change(evt.name, evt.value, evt); 
            }
            
        }.bind(this));
        this.appendChild("fb_filters", new SWAM.View({classes:"swam-list-filter-items d-flex flex-row-reverse"}));
    },

    on_input_change: function(name, val, evt) {
        evt.stopPropagation();
        let old_val = this.options.list.collection.params[name];
        if (old_val == val) return;
        if ((val == null)||(val == "")) {
            delete this.options.list.collection.params[name];
        } else {
            this.options.list.collection.params[name] = val;
        }
        this.options.list.collection.resetPager();
        this.options.list.collection.fetch();
    },

    toRangeString: function(dt) {
        // having issues with the picker and dates, doing manual
        return dt.toISOString().split('T')[0];
    },

    on_daterange_picker: function(evt) {
        this.options.list.collection.params["dr_field"] = evt.name;
        this.options.list.collection.params["dr_start"] = this.toRangeString(evt.start);
        this.options.list.collection.params["dr_end"] = this.toRangeString(evt.end);
        this.options.list.collection.params["dr_offset"] = new Date().getTimezoneOffset();
        this.options.list.collection.fetch();
    },

    on_datepicker: function(evt) {
        this.options.list.collection.params["dr_field"] = evt.name;
        this.options.list.collection.params["dr_start"] = this.toRangeString(evt.date);
        this.options.list.collection.params["dr_end"] = this.toRangeString(evt.date);
        this.options.list.collection.params["dr_offset"] = new Date().getTimezoneOffset();
        this.options.list.collection.fetch();
    },

    removeParams: function(params) {
        _.each(params, function(p){
            if (this.options.list.collection.params[p] != undefined) {
                delete this.options.list.collection.params[p];
            }
        }.bind(this));
        this.options.list.collection.resetPager();
        this.options.list.collection.fetch();
    },

    removeDateRangeFilter: function() {
        this.removeParams(["dr_field", "dr_start", "dr_end", "dr_offset"]);
    },

    addFilterTag: function(id, val, filter) {
        let operator = filter.operator || "contains";
        if (filter.type == "daterange") operator = "is";
        let value_lbl = val;
        let safe_id = id.replaceAll(".", "__");
        
        if (filter.options) {
            let option = _.findWhere(filter.options, {value:val});
            if (option) value_lbl = option.label || val;
        } else if (_.isString(value_lbl) && (value_lbl.contains(":"))) {
            // special operators
            let fields = value_lbl.split(":");
            if (fields[0] == "__gt") {
                operator = "is >";
            } else if (fields[0] == "__lt") {
                operator = "is <";
            }
            value_lbl = fields[1];
        }
        

        this.children.fb_filters.appendChild(safe_id, new SWAM.View(_.extend({
            id: safe_id,
            template: "swam.ext.lists.filter_item",
            classes: "swam-filter-item",
            operator: operator,
            value_label: value_lbl
        }, filter)));
    },

    editFilter: function(id, evt) {
        var filter = _.findWhere(this.options.filters, {name:id});
        let defaults = this.options.list.collection.params;
        SWAM.Dialog.showForm([filter], {
            title: "Add Filter",
            lbl_save: "Apply Filter",
            defaults: defaults,
            callback: function(dlg) {
                var val = dlg.getData()[id];
                this.addFilterTag(id, val, filter);
                if (filter.type == "daterange") {
                    this.on_daterange_picker(dlg.options.view.date_fields[id]);
                } else {
                    this.on_input_change(id, val, evt);
                }
                dlg.dismiss();
            }.bind(this)
        });
    },

    on_action_rest_summary: function(evt) {
        var model = new SWAM.Model({}, {url:this.options.list.collection.getRawUrl() + "&format=summary"});
        model.fetch(function(model, resp){
            if (resp.status) {
                if (this.options.list.options.summary_template) {
                    SWAM.Dialog.showView(
                        new SWAM.View({template:this.options.list.options.summary_template, model:model}),
                        {title:"Summary"});
                } else {
                    SWAM.Dialog.showModel(model, null, {title:"Summary"});
                }
            } else {
                SWAM.Dialog.warning(resp.error);
            }
        }.bind(this));
    },

    on_action_reload: function(evt) {
        // allow the event to bubble down to page
        this.options.list.collection.fetch();
    },

    on_action_add_filter: function(evt) {
        this.editFilter($(evt.currentTarget).data("id"), evt);
    },

    on_action_edit_filter: function(evt) {
        this.editFilter($(evt.currentTarget).data("id"), evt);
    },

    on_action_remove_filter: function(evt) {
        var id = $(evt.currentTarget).data("id");
        var safe_id = id.replaceAll(".", "__");
        this.children.fb_filters.removeChild(safe_id);
        var filter = _.findWhere(this.options.filters, {name:id});
        if (filter && (filter.type == "daterange")) {
            this.removeDateRangeFilter();
        } else {
            this.on_input_change(id, null, evt);
        }
    },

    on_action_download_csv: function(evt) {
        var filename = "";
        if (this.options.list.options.download_group_prefix && app.group) {
            filename += app.group.get("name").slugify() + "_";
        }
        if (this.options.list.options.download_prefix) {
            filename += this.options.list.options.download_prefix;
        } else {
            filename += "data";
        }
        filename + ".csv";
        SWAM.Rest.DOWNLOAD(this.options.list.collection.getRawUrl(
            {
                format_filename: filename,
                format:"csv",
            }), null,
            function(status, state){
                // do nothing?
            }.bind(this), {filename:filename});
        SWAM.toast("Download Started", "Your file is downloading: " + filename, "success");
    },

    on_action_download_json: function(evt) {
        var filename = "";
        var filename = this.options.list.options.download_prefix;
        if (this.options.list.options.download_group_prefix && app.group) {
            filename += app.group.get("name").slugify() + "_";
        }
        if (this.options.list.options.download_prefix) {
            filename += this.options.list.options.download_prefix;
        } else {
            filename += "data";
        }
        filename + ".json";
        SWAM.Rest.DOWNLOAD(this.options.list.collection.getRawUrl(
            {
                format_filename: filename,
                format:"json",
            }), null,
            function(status, state){
                // do nothing?
            }.bind(this), {filename:filename});
        SWAM.toast("Download Started", "Your file is downloading: " + filename, "success");
    },

    on_pre_render: function() {
        this.children.fb_actions.options.defaults = this.options.list.collection.params;
        this.children.fb_actions.options.model = this.options.model;
        this.children.fb_filters.children = {};
        _.each(this.options.list.collection.params, function(value, key){
            var filter = _.findWhere(this.options.filters, {name:key});
            if (filter) {
                this.addFilterTag(key, value, filter);
            } else if (key == "dr_start") {
                // lets add our date range filters
                // only support one daterange
                // TODO check the dr_field for more filters
                var dr_filter = _.findWhere(this.options.filters, {type:"daterange"});
                if (dr_filter) {
                    var val = value + " - " + this.options.list.collection.params.dr_end;
                    this.addFilterTag(dr_filter.name, val, dr_filter);
                }
            }
        }.bind(this));
    },

});