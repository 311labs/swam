

SWAM.Views.TableItem = SWAM.Views.ListItem.extend(SWAM.Ext.BS).extend({
    tagName: "tr",
    classes: "swam-table-row",

    on_action_batch_select: function(evt) {
        evt.stopPropagation();
        if (this.$el.hasClass("swam-batch-selected")) {
            this.deselect();
        } else {
            this.select();
        }
    },

    select: function() {
        if (!this.options.list.selected.has(this)) this.options.list.selected.push(this);
        this.$el.addClass("swam-batch-selected");
        this.options.list.toggleBatchPanel();
    },

    deselect: function() {
        if (this.options.list.selected.has(this)) this.options.list.selected.remove(this);
        this.$el.removeClass("swam-batch-selected");
        this.options.list.toggleBatchPanel();
    },

    on_pre_render: function() {
    	this.template = "";
        if (this.options.list.options.batch_select) {
            this.template += "<td class='swam-batch-select' data-action='batch_select'><div class='swam-table-checkbox'></div></td>";
        }
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
                } else if (col.context_menu) {
                    this.template += " data-field='context_menu'>";
                    var fc = {
                        "$el":$("<div />"),
                        id: "{{model.id}}",
                        icon:"bi bi-three-dots-vertical",
                        btn_classes: "btn btn-link py-0 h-100",
                        classes: "text-end dropstart",
                        items:col.context_menu};
                    this.template += SWAM.Form.Builder.dropdown(fc).html();
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
        sort_down_icon: ' <i class="swam-icon swam-icon-sorted-down text-muted hover-primary"></i>',
        sort_up_icon: ' <i class="swam-icon swam-icon-sorted-up text-muted hover-primary"></i>',
        sort_icon: ' <i class="swam-icon swam-icon-sort text-muted hover-primary"></i>',
        filter_icon_active: ' <i class="bi bi-filter text-success" data-action="filter"></i>',
        filter_icon: ' <i class="bi bi-filter text-muted hover-primary" data-action="filter"></i>',
        batch_select: false,
        batch_select_label: 'Rows Selected',
        batch_actions: [
            {label:"Delete", icon:"trash", action:"delete"}
        ],
        pagination: false,
        empty_html: "<tr><td colspan='100' class='text-center p-3 text-muted'>No items returned</td>",
        fetch_on_tab: true
    },

    selectAll: function() {
        _.each(this.items, function(item){
            item.select();
        });
    },

    deselectAll: function() {
        _.each(this.items, function(item){
            item.deselect();
        });
    },

    showBatchPanel: function() {
        if (!this.batch_panel) {
            this.batch_panel = new SWAM.Views.TableBatchPanel({list:this});
        }
        if (!this.batch_panel.$parent) {
            this.batch_panel.addToDOM(this.$parent);
        } else {
            this.batch_panel.render();
        }
    },

    hideBatchPanel: function() {
        if (this.batch_panel) this.batch_panel.removeFromDOM();
    },

    toggleBatchPanel: function() {
        if (this.selected.length) {
            this.showBatchPanel();
        } else {
            this.hideBatchPanel();
        }
    },

    on_action_sort: function(evt) {
        var $column = $(evt.currentTarget);
    	var sort_field = $column.data("sort");
        if (!sort_field) {
            $column = $column.parent();
            sort_field = $column.data("sort");
        }
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
        if (!this.options.remote_sort) {
            this.sortBy(sort_field, this.collection.sort_descending);
        } else {
            this.collection.fetch();
        }
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

    on_action_batch_select_all: function(evt) {
        var $row = $(evt.currentTarget).parent();
        if ($row.hasClass("swam-batch-selected")) {
            $row.removeClass("swam-batch-selected");
            this.deselectAll();
        } else {
            $row.addClass("swam-batch-selected");
            this.selectAll();
        }
    },

    on_pre_render: function() {
    	this.$el.empty();
    	var $head = $("<thead />").appendTo(this.$el);
    	this.$header = $("<tr />").appendTo($head);
    	this.$body = $("<tbody />").appendTo(this.$el);
    	this.on_render_header();

        if (this.options.pagination) {

            if (!this.pagination) {
                var popts = _.extend({list:this}, this.options.pager_options);
                this.pagination = new SWAM.Views.TablePaginationPanel(popts);
            }
            this.pagination.addToDOM(this.$parent);
        }
    },

    on_render_header: function() {
        if (this.options.batch_select) {
            var $el = $("<th class='swam-batch-select' data-action='batch_select_all' />");
            var $input = $("<div />").addClass("swam-table-checkbox");
            $input.prop("type", "checkbox");
            this.$header.append($el.append($input));
        }
    	_.each(this.options.columns, this.on_render_column.bind(this));
    },

    on_render_column: function(column) {
    	if (_.isObject(column)) {
    		if (column.hideIf && column.hideIf()) return;
    		var $el = $("<th></th>");
            if (column.context_menu) {
                this.$header.append($el);
                return;
            }
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
    			$el.attr("data-action", "sort");
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
    },

    on_reset: function() {
        this.deselectAll();
        SWAM.Views.List.prototype.on_reset.call(this);
    },

    on_tab_focus: function() {
        if (this.options.fetch_on_tab) this.collection.fetchIfStale();
    }
});


SWAM.Views.TableBatchPanel = SWAM.View.extend({
    template: "swam.ext.lists.batch_panel",
    tagName: "div",
    classes: "swam-batch-select-panel rounded-start rounded-end",

    on_action_click: function(evt) {
        this.options.list.on_action_click(evt);
    },

    getActions: function() {
        if (!this.actions) {
            this.actions = [];
            _.each(this.options.list.options.batch_actions, function(item){
                var citem = _.clone(item);
                citem.is_last = false;
                this.actions.push(citem);
            }.bind(this));
        }
        if (this.actions.length) this.actions.last().is_last = true;
        return this.actions;
    }

});


SWAM.Views.TablePaginationPanel = SWAM.View.extend({
    template: "swam.ext.lists.pager_panel",
    tagName: "div",
    classes: "swam-pager-panel",

    events: {
        "change select": "on_input_handler",
    },

    on_input_handler: function(evt) {
        var $el = $(evt.currentTarget);
        var ievt = {name:$el.attr("name"), value:$el.val(), event:evt};
        evt.stopPropagation();
        if ((ievt.value == null)||(ievt.value == "")) {
            delete this.options.list.collection.params[ievt.name];
        } else {
            this.options.list.collection.params[ievt.name] = ievt.value;
        }
        this.options.list.collection.fetch();
    },

    on_init: function() {
        this.pager = new SWAM.Views.ListPagination(this.options);
        this.addChild("pager", this.pager);
        this.counter = new SWAM.Views.ListPaginationCount(this.options);
        this.addChild("counter", this.counter);
    },

    on_post_render: function() {
        this.$el.find("#size select").val(this.options.list.collection.params.size);
    }

});


