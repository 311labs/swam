
SWAM.Views.ListFilters = SWAM.Form.View.extend({
    classes: "swam-list-filter",

    on_init: function() {
        this.appendChild("fb_actions", new SWAM.Form.View({fields:this.options.filter_bar, add_classes: "filter-action-bar"}));
        this.getChild("fb_actions").on("input:change", this.on_fb_action_input_change.bind(this));
        this.appendChild("fb_filters", new SWAM.View({classes:"swam-list-filter-items d-flex flex-row-reverse"}));
    },

    on_fb_action_input_change: function(evt) {
        this.on_input_change(evt.name, evt.value, evt);
    },

    unlocalizer: function(evt, val) {
        if (!evt.localize) return val;
        if (evt.localize == "cents") {
            return parseInt(val * 100);
        }
        return val;
    },

    localizer: function(evt, val) {
        if (!evt.localize) return val;
        if (evt.localize == "cents") {
            if (!val) return "";
            return parseFloat(val / 100);
        }
        return val;
    },

    on_input_change: function(name, val, evt) {
        evt.stopPropagation();
        let param_name = name;
        if (evt.operator) {
            param_name = this.getParamFromOperator(name, evt.operator);
        }
        this.removeParam(name);
        if ((val != undefined)&&(val != null)&&(val != "")) {
            this.options.list.collection.params[param_name] = this.unlocalizer(evt, val);
        }
        this.options.list.collection.resetPager();
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

    addFilterTag: function(id, val, filter, operator) {
        // if (filter.type == "daterange" || filter.type == "timerange") operator = "is";
        let value_lbl = val;
        let safe_id = this.convertParamToKey(id.replaceAll(".", "__"));
        if (operator === undefined) {
            operator = this.getOperatorFromParam(id);
        }

        if (filter.localize) {
            value_lbl = this.localizer(filter, val);
        }

        if (filter.options) {
            let option = _.findWhere(filter.options, {value:val});
            if (option) value_lbl = option.label || val;
        } else if (_.isString(value_lbl) && (value_lbl.contains(":"))) {
            // special operators
            if (filter.type !== 'time' && filter.type !== 'timerange') {
                let fields = value_lbl.split(":");
                if (fields[0] == "__gt") {
                    operator = "is >";
                } else if (fields[0] == "__lt") {
                    operator = "is <";
                }
                value_lbl = fields[1];
            }
        }

        let view = this.children.fb_filters.getChild(safe_id);
        if (view) {
            view.options.operator = operator;
            view.options.value_label = value_lbl;
            _.extend(view.options, filter);
            view.render();
        } else {
            this.children.fb_filters.appendChild(safe_id, new SWAM.View(_.extend({
                id: safe_id,
                template: "swam.ext.lists.filter_item",
                classes: "swam-filter-item",
                operator: operator,
                value_label: value_lbl
            }, filter)));
        }
    },

    getOperatorFromParam: function(key) {
        if (!key) return "is";
        if (key.indexOf("__gt") >= 0) {
            operator = "is >";
        } else if (key.indexOf("__gte") >= 0) {
            operator = "is >=";
        } else if (key.indexOf("__lt") >= 0) {
            operator = "is <";
        } else if (key.indexOf("__lte") >= 0) {
            operator = "is <=";
        } else if (key.indexOf("__icontains") >= 0) {
            operator = "contains";
        } else {
            operator = "is";
        }
        return operator;
    },

    getParamFromOperator: function(key, operator) {
        let pkey = key;
        if (operator == "is") {
            return key;
        } else if (operator.contains(">=")) {
            pkey = `${key}__gte`;
        } else if (operator.contains(">")) {
            pkey = `${key}__gt`;
        } else if (operator.contains("<=")) {
            pkey = `${key}__lte`;
        } else if (operator.contains("<")) {
            pkey = `${key}__lt`;
        } else if (operator.contains("contains")) {
            pkey = `${key}__icontains`;
        }
        return pkey;
    },

    getDefaultFor: function(key) {
        let params = this.options.list.collection.params;
        let value = _.find(params, function(v, k){
            if (key == k) return true;
            let rk = this.convertParamToKey(k);
            if (key == rk) return true;
        }.bind(this));
        return value;
    },

    getFilterFor: function(key) {
        let rkey = key;
        if (key.contains("__")) rkey = this.convertParamToKey(key);
        return _.find(this.options.filters, function(f) {
            return ((f.name == key) || (f.name == rkey));
        });
    },

    removeParam: function(key) {
        let params = this.options.list.collection.params;
        _.each(params, function(v, k){
            if (key == k) {
                delete params[k];
                return true
            }
            let rk = this.convertParamToKey(k);
            if (key == rk) {
                delete params[k];
                return true
            }
            return true;
        }.bind(this));
    },

    OPERATORS: ["gt", "lt", "gte", "lte", "icontains"],

    convertParamToKey: function(param) {
        let key_array = param.split("__");
        if (key_array.length > 0) {
            let oper = key_array.pop();
            if (this.OPERATORS.indexOf(oper) >= 0) {
                return key_array.join("__");
            }
        }
        return param;
    },

    getParamKey: function(key) {
        let params = this.options.list.collection.params;
        let root_key = key;
        let value = _.find(params, function(v, k){
            if (key == k) return true;
            let rk = this.convertParamToKey(k);
            if (key == rk) return true;
        }.bind(this));
        return root_key;
    },


    editFilter: function(id, evt) {
        if (id === undefined) return;
        let filter = _.findWhere(this.options.filters, {name:id});
        let dv = this.getDefaultFor(id);

        if (filter.localize) dv = this.localizer(filter, dv);
        let defaults = {};

        let fname_post_filter = `on_prefilter_${filter.type}`;
        if (_.isFunction(this[fname_post_filter])) {
            this[fname_post_filter](filter, defaults);
        }

        if ((dv != undefined)&&(defaults[id] == undefined)) {
            defaults[id] = dv;
        }
        let filters = [];
        if (filter.operators) {
            if (dv != undefined) {
                defaults.operator = this.getOperatorFromParam(this.getParamKey(id));
            }
            filters.push({
                label: "Operator",
                name: "operator",
                type: "select",
                options: ["is", "contains", "is >", "is >=", "is <", "is <="],
                columns: 4
            });
            filters.push(_.extend({columns:8}, filter));
        } else {
            filters.push(filter);
        }

        if ((filter.type == "select")&&(filter.editable)) {
            filter.force_top = true;
        }

        SWAM.Dialog.showForm(filters, {
            title: "Add Filter",
            lbl_save: "Apply Filter",
            defaults: defaults,
            callback: function(dlg) {
                let data = dlg.getData();
                let val = this.unlocalizer(filter, data[id]);
                this.addFilterTag(id, val, filter, data.operator);
                let fname_post_filter = `on_filter_${filter.type}`;
                if (_.isFunction(this[fname_post_filter])) {
                    this[fname_post_filter](filter, dlg, data);
                } else {
                    evt.operator = data.operator || filter.operator;
                    if (filter.localize) evt.localize = filter.localize;
                    this.on_input_change(id, data[id], evt);
                    dlg.dismiss();
                }
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
        this.options.list.collection.params.start = 0;
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
        var filter = _.findWhere(this.options.filters, {name:id});
        if (filter && filter.required) return;
        let fname_remove_filter = `on_remove_filter_${filter.type}`;
        if (_.isFunction(this[fname_remove_filter])) {
            this[fname_remove_filter](filter, safe_id);
        } else {
            this.removeParam(id);
            this.on_input_change(id, null, evt);
        }
        this.children.fb_filters.removeChild(safe_id);
    },

    guess_filename: function(evt) {
        let filename = "";
        if (this.options.list.options.download_group_prefix && app.group) {
            filename += app.group.get("name").slugify() + "_";
        }
        if (this.options.list.options.download_prefix) {
            filename += this.options.list.options.download_prefix;
        } else {
            filename += "data";
        }
        return filename;
    },

    on_action_download_local_csv: function(evt) {
        if (!this.options.list.options.download_local_fields) {
            this.options.list.options.download_local_fields = this.options.list.options.columns;
        }
        let filename = this.guess_filename(evt);
        filename += ".csv";
        this.options.list.collection.downloadLocal(filename, this.options.list.options.download_local_fields);
    },

    on_action_download_csv: function(evt) {
        if (this.options.list.options.download_local) {
            this.on_action_download_local_csv(evt);
            return;
        }
        let filename = this.guess_filename(evt);
        filename += ".csv";
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
        if (this.options.list.options.download_group_prefix && app.group) {
            filename += app.group.get("name").slugify() + "_";
        }
        if (this.options.list.options.download_prefix) {
            filename += this.options.list.options.download_prefix;
        } else {
            filename += "data";
        }
        filename += ".json";
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

    on_unknown_filter: function(key, value) {
        let fname_unknown_filter = `on_unknown_filter_${key}`;
        if (_.isFunction(this[fname_unknown_filter])) {
            this[fname_unknown_filter](key, value);
        }
    },

    on_pre_render: function() {
        this.children.fb_actions.options.defaults = this.options.list.collection.params;
        this.children.fb_actions.options.model = this.options.model;
        _.each(this.options.list.collection.params, function(value, key){
            var filter = this.getFilterFor(this.convertParamToKey(key));
            if (filter) {
                this.addFilterTag(key, value, filter);
            } else {
                this.on_unknown_filter(key, value);
            }
        }.bind(this));
    },

});
