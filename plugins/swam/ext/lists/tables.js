

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
        SWAM.Views.ListItem.prototype.on_pre_render.call(this);
    	this.template = "";
        if (this.options.list.options.batch_select) {
            this.template += "<td class='swam-batch-select' data-action='batch_select'><div class='swam-table-checkbox'></div></td>";
        }
    	_.each(this.options.list.options.columns, _.bind(function(col){
    		if (_.isObject(col)) {
                if (col.is_hidden) return;
    			if (col.hideIf && col.hideIf()) return;
                if (col.requires_perm) {
                    if (!app.me) return;
                    if (!app.me.hasPerm(col.requires_perm)) return;
                }
                if (col.requires_group_setting) {
                    if (!app.group) return;
                    if (!app.group.hasSetting(col.requires_group_setting)) return;
                }
    			this.template += "<td";
                if (col.td_classes) {
                    let classes = col.td_classes;
                    if (col.classes) classes = col.classes + " " + classes;
                    this.template += " class='" + classes + "'";
                } else if (col.classes) {
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
                    let template = SWAM.getTemplate(col.template);
    				this.template += ">" + template;
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
        batch_select_label: 'Selected',
        batch_actions: [
            {label:"Delete", icon:"trash", action:"batch_delete"}
        ],
        pagination: false,
        empty_html: "<tr><td colspan='100' class='text-center p-3 text-muted'>No items returned</td>",
        fetch_on_tab: true,
        show_totals_label: "totals",
        show_totals: null,
        menu_sort: true
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

   	getBatchSelected: function() {
		return this.selected;
	},

	clearBatchSelected: function() {
		this.deselectAll();
	},

    on_action_sort: function(evt) {
        var $column = $(evt.currentTarget);
    	var sort_field = $column.data("sort");
        if (!sort_field) {
            $column = $column.parent();
            sort_field = $column.data("sort");
        }
    	if (!sort_field) return;
        if (this.options.menu_sort) {
            this.showSortMenu(evt, $column, sort_field);
        } else {
            // do toggle sort
            if (!this.collection.sort_descending && this.collection.sort_field) {
                this.clearSorting();
            } else {
                this.sortByField(sort_field, !this.collection.sort_descending);
            }
        }

    },

    showSortMenu: function(evt, $column, sort_field) {
        if (this.popover) this.popover.dispose();

        let is_sort_field = this.collection.sort_field == sort_field;
        let is_decending = this.collection.sort_descending;
        ctxt = {is_sort_field:is_sort_field, is_decending:is_decending};
        ctxt.show_no_sort = is_sort_field;
        ctxt.show_ascending = !is_sort_field || is_decending;
        ctxt.show_descending = !is_sort_field || !is_decending;
        this.popover = new bootstrap.Popover($column, {
          // title: 'Sort', // Title of the popover
          html: true,
          customClass: "shadow popover-sm-padding",
          content: SWAM.renderTemplate("swam.ext.lists.sort_menu", ctxt),
          trigger: 'click', // Manual triggering
          placement: 'right' // Adjust the placement as needed
        });
        this.popover.show();
        // $("body").one("click", function(evt){
        //     evt.stopPropagation();
        //     this.popover.dispose();
        //     this.popover = null;
        // }.bind(this));

        $("#sort_popover_menu").find("a").one("click", function(evt) {
            let action = $(evt.currentTarget).attr("id");
            if (action == "sort_ascending") {
                this.sortByField(sort_field, false);
            } else if (action == "sort_descending") {
                this.sortByField(sort_field, true);
            } else {
                this.clearSorting();
            }
            this.popover.dispose();
            this.popover = null;
        }.bind(this));

        evt.stopPropagation();

        $("body").one("click", function(evt){
            if (this.popover) {
                this.popover.dispose();
                this.popover = null;
                evt.stopPropagation();
            }
        }.bind(this));

    },

    clearSorting: function() {
        if (this.collection.params.sort) {
            delete this.collection.params.sort;
            this.collection.sort_field = undefined;
            this.collection.sort_descending = false;
            this.trigger("sort", this, "");
            if (!this.options.remote_sort) {
                this.collection.clearFilter();
            } else {
                this.collection.fetch();
            }
        }
    },

    sortByField: function(sort_field, sort_descending) {
    	this.collection.sort_field = sort_field;
    	this.collection.sort_descending = sort_descending;
        if (sort_descending) {
            this.collection.params.sort = "-" + sort_field;
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
        this.on_render_footer();

        if (this.options.pagination) {

            if (!this.pagination) {
                var popts = _.extend({list:this}, this.options.pager_options);
                this.pagination = new SWAM.Views.TablePaginationPanel(popts);
            }
            this.pagination.addToDOM(this.$parent);
        }
    },

    on_render_header: function() {
        if (this.collection.params.sort) {
            this.collection.sort_field = this.collection.params.sort;
            if (this.collection.sort_field[0] == "-") this.collection.sort_field = this.collection.sort_field.substr(1);
        }
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
            if (column.is_hidden) return;
    		if (column.hideIf && column.hideIf()) return;
            if (column.requires_perm) {
                if (!app.me) return;
                if (!app.me.hasPerm(column.requires_perm)) return;
            }
            if (column.requires_group_setting) {
                if (!app.group) return;
                if (!app.group.hasSetting(column.requires_group_setting)) return;
            }
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
                    $el.addClass("sorted");
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

    on_render_footer: function() {
        if (this.options.show_totals) {
            this.$footer = $("<tfoot />").appendTo(this.$el);
            this.refreshTotals();
            if (!_.isEmpty(this.totals)) {
                var $tr = $("<tr />").appendTo(this.$footer);
                var columns = [];
                var col_span = 0;
                _.each(this.options.columns, function(col, i) {
                    if (col.is_hidden) return;
                    if (col.hideIf && col.hideIf()) return;
                    if (col.requires_perm) {
                        if (!app.me) return;
                        if (!app.me.hasPerm(col.requires_perm)) return;
                    }
                    if (col.requires_group_setting) {
                        if (!app.group) return;
                        if (!app.group.hasSetting(col.requires_group_setting)) return;
                    }
                    let field_name, localize;
                    let td_classes = null;
                    if (_.isObject(col)) {
                        field_name = col.field;
                        td_classes = col.classes;
                    } else {
                        field_name = col;
                    }
                    var $el = $("<td />");
                    if (this.totals[field_name] != undefined) {
                        if (col_span > 0) {
                            if (this.options.show_totals_label) {
                                $el.html(this.options.show_totals_label);
                            } else {
                                $el.html("&nbsp;");
                            }
                            $tr.append($el.attr("colspan", col_span).addClass("totals-spacer"));
                            $el = $("<td />");
                        }
                        if (this.localize_totals[field_name] != undefined) {
                            // require support for complex localize
                            $el.html(SWAM.Localize.render(field_name  + "|" + this.localize_totals[field_name], this.totals));
                        } else {
                            $el.text(this.totals[field_name])
                        }
                        $el.addClass("td-totals");
                        if (td_classes) $el.addClass(td_classes);
                        $tr.append($el);
                        col_span = -1;
                    }
                    col_span += 1;
                }.bind(this));
            }
        }
    },

    refreshTotals: function() {
        var totals = {};
        var fields_to_filters = {};
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.model) {
                var prev_col = null;
                _.each(this.options.show_totals, _.bind(function(col_name){
                    if (_.isFunction(col_name)) {
                        col_name(item, totals);
                        return;
                    }
                    let field = col_name;
                    if (field.contains("|")) {
                        let filters = col_name.split("|");
                        field = filters.shift();
                        if (fields_to_filters[field] === undefined) fields_to_filters[field] = filters.join("|");
                    }
                    let col = this.getColumn(col_name);
                    if (col && col.is_hidden) return;
                    if (_.isUndefined(totals[field])) {
                        totals[field] = 0;
                    }
                    let v = item.model.get(field);
                    if (v != undefined) {
                        totals[field] += v;
                    }

                }, this));
            }
        }
        this.localize_totals = fields_to_filters;
        this.totals = totals;
        this.trigger("totals", this);
    },

    getColumn: function(field_name) {
        for (let column of this.options.columns) {
            let field = column.field.split('|')[0];
            if (field === field_name) {
                return column;
            }
        }
        return null;
    },

    hideColumn: function(field) {
        let col = this.getColumn(field);
        if (col) col.is_hidden = true;
    },

    showColumn: function(field) {
        let col = this.getColumn(field);
        if (col) col.is_hidden = false;
    },

    on_reset: function() {
        this.deselectAll();
        SWAM.Views.List.prototype.on_reset.call(this);
    },

    on_tab_focus: function() {
        if (this.isInDOM() && this.options.fetch_on_tab) this.collection.fetchIfStale();
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
                if (item.requires_perm) {
                    if (!app.me) return;
                    if (!app.me.hasPerm(item.requires_perm)) return;
                }
                if (item.requires_group_setting) {
                    if (!app.group) return;
                    if (!app.group.hasSetting(item.requires_group_setting)) return;
                }
                if (window.innerWidth <= item.hide_width) return;
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
