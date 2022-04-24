

SWAM.Views.TableItem = SWAM.Views.ListItem.extend(SWAM.Ext.BS).extend({
    tagName: "tr",
    classes: "swam-table-row",

    on_pre_render: function() {
    	this.template = "";
    	_.each(this.options.list.options.columns, _.bind(function(col){
    		if (_.isObject(col)) {
    			if (col.hideIf && col.hideIf()) return;

    			this.template += "<td";

    			if (col.classes) {
    				this.template += " class='" + col.classes + "'";
    			}

                if (col.action) {
                    this.template += " data-action='" + col.action + "'";
                }

    			if (col.custom) {
    				this.template += ">" + col.custom;
    			} else if (_.isFunction(col.template)) {
    				if (!col.template_name) col.template_name = String.Random(16);
    				var key = "column_renderer_" + col.template_name;
    				this.__proto__[key] = function() {
    					return col.template(this.model);
    				};
    				this.template += ">" + "{{{" + key + "}}}";
    			} else if (_.isString(col.template)) {
    				this.template += ">" + col.template;
    			} else if (this["get_column_" + col.field]) {
    				this.template += " data-field='" + col.field + "'>";
    				this.template += this["get_column_" + col.field](col);
    			} else if (col.is_image) {
    				this.template += " data-field='" + col.field + "'>";
    				this.template += "{{#model." + col.field + "}}";
    				this.template += "<img src='{{model." + col.field + "}}' class='image-xs lightbox-clickable'>";
    				this.template += "{{/model." + col.field + "}}";
    			} else {
    				this.template += " data-field='" + col.field + "'>";
    				this.template += "{{{model." + col.field;
    				if (col.localize) {
    					this.template += "|" + col.localize;
    				}
    				this.template += "}}}&nbsp;"; // hack to always make the cell have data
    			}
    			this.template += "</td>";
    		} else {
    			this.template += "<td data-field='" + col + "'>{{model." + col + "}}</td>";
    		}
    	}, this));
    }
});


SWAM.Views.Table = SWAM.Views.List.extend({
    classes: "swam-table swam-table-bs table table-striped",
    tagName: "table",

    defaults: {
        ItemView: SWAM.Views.TableItem,
        // sort_down_icon: ' <i class="bi bi-arrow-down text-success" data-action="sort"></i>',
        // sort_up_icon: ' <i class="bi bi-arrow-up text-success" data-action="sort"></i>',
        // sort_icon: ' <i class="bi bi-arrow-down-up text-muted hover-primary" data-action="sort"></i>',
        sort_down_icon: ' <i class="swam-icon swam-icon-sorted-down text-muted hover-primary" data-action="sort"></i>',
        sort_up_icon: ' <i class="swam-icon swam-icon-sorted-up text-muted hover-primary" data-action="sort"></i>',
        sort_icon: ' <i class="swam-icon swam-icon-sort text-muted hover-primary" data-action="sort"></i>',
        filter_icon_active: ' <i class="bi bi-filter text-success" data-action="filter"></i>',
        filter_icon: ' <i class="bi bi-filter text-muted hover-primary" data-action="filter"></i>'
    },

    on_action_sort: function(evt) {
        var $column = $(evt.currentTarget).parent();
    	var sort_field = $column.data("sort");
    	if (!sort_field) return;
    	this.collection.sort_field = sort_field;
    	this.collection.sort_descending = !this.collection.sort_descending;
    	if (this.collection.params.sort == sort_field) {
    		this.collection.params.sort = "-" + sort_field;
    	} else if (this.collection.params.sort == "-" + sort_field) {
    		delete this.collection.params.sort;
    		this.collection.sort_field = undefined;
    	} else {
    		this.collection.params.sort = sort_field;
    	}
    	this.trigger("sort", this, sort_field);
    	this.collection.fetch();
    },

    on_action_filter: function(evt) {
        evt.stopPropagation();
        var $column = $(evt.currentTarget).parent();
        var filter = $column.data("filter");
        var label = $column.data("label");
        if (!_.isArray(filter)) {
            if (!filter.name) filter.name = $column.data("field");
            filter = [filter];
        }
        SWAM.Dialog.showForm(filter, {"title":"Filter " + label, callback: function(dlg, choice){
            var data = dlg.getData();
            console.log(data);
            SWAM.Dialog.alert({title:"Debug", json:data});
            dlg.dismiss();
        }});
    },

    on_pre_render: function() {
    	this.$el.empty();
    	var $head = $("<thead />").appendTo(this.$el);
    	this.$header = $("<tr />").appendTo($head);
    	this.$body = $("<tbody />").appendTo(this.$el);
    	this.on_render_header();
    },

    on_render_header: function() {
    	_.each(this.options.columns, this.on_render_column.bind(this));
    },

    on_render_column: function(column) {
    	if (_.isObject(column)) {
    		if (column.hideIf && column.hideIf()) return;
    		var $el = $("<th></th>");
    		if (column.label && !column.field) {
                column.field = column.label;
                column.no_sort = column.sort == undefined;
            }
    		if (column.field && !column.label) column.label = column.field;
    		if (!column.label) column.label = '';
    		var lbl = column.label;
    		if (column.field && column.field.indexOf('|') > 0) {
    			column.localize = column.field.split('|').splice(1).join('|');
    			column.field = column.field.split('|')[0];
    		}
    		if (!column.no_sort) {
    			if (!column.sort_field) column.sort_field = column.field;
    			if (column.sort) column.sort_field = column.sort;
    			$el.addClass("sortable");
    			// $el.attr("data-action", "sort");
    			$el.data("sort", column.sort_field);
    			if (this.collection.sort_field == column.sort_field) {
    				if (this.collection.sort_descending) {
    					lbl = lbl + " " + this.options.sort_down_icon;
    				} else {
    					lbl = lbl + " " + this.options.sort_up_icon;
    				}
    			} else if (this.options.sort_icon) {
                    lbl = lbl + " " + this.options.sort_icon;
                }
    		}

            if (column.filter) {
                lbl = lbl + " " + this.options.filter_icon;
                $el.data("filter", column.filter);
            }

    		if (column.classes) {
    			$el.addClass(column.classes);
    		}

            $el.data("label", column.label);
            $el.data("field", column.field);
    		$el.html(lbl);
    		this.$header.append($el);
    	} else {
    		this.$header.append("<th>" + column + "</th>");
    	}
    }
});


SWAM.Views.PaginatedTable = SWAM.Views.PaginatedList.extend({
	defaults: {
		List: SWAM.Views.Table,
	},
    classes: "swam-paginated-table swam-paginated-table-bs",

    on_init: function() {
        if (!this.options.list_options || !this.options.list_options.columns) {
            this.options.list_options = _.extend({columns:this.options.columns}, this.options.list_options);
        }
        SWAM.Views.PaginatedList.prototype.on_init.apply(this, arguments);
    },

});


SWAM.Views.AdvancedTable = SWAM.Views.PaginatedTable.extend({
    classes: "swam-paginated-table swam-table-clickable",
    defaults: {
        List: SWAM.Views.Table,
        collection_params: {
            size: 10
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
                        form_wrap: "search",
                        placeholder: "search",
                        button: {
                            icon: "bi bi-search"
                        }
                    },
                    {
                        columns: 2,
                        type: "select",
                        name: "size",
                        options: [
                            5, 10, 20, 50, 100
                        ]
                    },
                    {
                        columns: 3,
                        columns_classes: "col-sm-auto",
                        type: "buttongroup",
                        buttons: [
                            {
                                classes: "btn btn-secondary",
                                icon: "bi bi-arrow-repeat",
                                action: "reload"
                            },
                            {
                                type: "dropdown",
                                icon: "bi bi-download",
                                items: [
                                    {
                                        icon: "bi bi-filetype-csv",
                                        label: "Download CSV",
                                        action: "download_csv"
                                    },
                                    {
                                        icon: "bi bi-filetype-json",
                                        label: "Download JSON",
                                        action: "download_json"
                                    },
                                ]
                            }

                        ]
                    },
                ]
            }
        ],
    },

    on_init: function() {
        if (this.options.Collection) {
            this.options.collection = new this.options.Collection(this.options.collection_params);
        }

        if (this.options.filter_bar) {
            if (this.options.filters) {
                var field = _.find(this.options.filter_bar[this.options.filter_bar.length-1].fields, function(field){
                    return field.type == "buttongroup";
                });
                if (field) {
                    field.buttons.push({
                        type: "dropdown",
                        icon: "bi bi-filter",
                        fields: this.options.filters
                    });
                }
            }
            if (this.options.add_button) {
                this.options.filter_bar.unshift(this.options.add_button);
            } else {
                this.options.filter_bar.unshift({columns:3, type:"hidden"}); // need this to make view look clean
            }
        }

        if (!this.options.list_options || !this.options.list_options.columns) {
            this.options.list_options = _.extend({columns:this.options.columns}, this.options.list_options);
        }
        SWAM.Views.PaginatedList.prototype.on_init.apply(this, arguments);

        this.list.on("item:clicked", this.on_item_clicked, this);
    },

    setParams: function(params) {
        this.params = params || {};
        if (this.params.url_params) {
            this.collection.params = _.extend({}, this.collection.params, this.params.url_params);
        }
    },

    reload: function() {
        this.collection.fetch();
    },

    on_action_download_csv: function(evt) {
        var filename = "download.csv";
        window.location.assign(this.collection.getRawUrl({
            format_filename: filename,
            format:"csv",
        }));
        SWAM.toast("Download Started", "Your file is downloading: " + filename, "success");
    },

    on_action_download_json: function(evt) {
        var filename = "download.json";
        window.location.assign(this.collection.getRawUrl({
            format_filename: filename,
            format:"json",
        }));
        SWAM.toast("Download Started", "Your file is downloading: " + filename, "success");
    },

    on_item_clicked: function(item) {
        SWAM.toast("oops", "nope");
    }

});
