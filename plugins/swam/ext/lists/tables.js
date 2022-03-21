

SWAM.Views.TableItem = SWAM.Views.ListItem.extend({
    tagName: "tr",
    classes: "swam-table-row",

    on_pre_render: function() {
    	this.template = "";
    	_.each(this.options.list.options.columns, _.bind(function(col){
    		if (_.isObject(col)) {
    			if (col.hideIf && col.hideIf()) return;

    			this.template += "<td";

    			if (col.on_click) {
    				var oc_key = "on_click_" + String.Random(16);
    				this.__proto__[oc_key] = function() {
    					return col.on_click(this.model);
    				};

    				if (!col.classes || (col.classes.indexOf('clickable') < 0)) {
    					if (!col.classes) col.classes = "";
    					col.classes += " clickable";
    				}

    				this.template += " data-onclick='" + oc_key + "'";
    			}

    			if (col.classes) {
    				this.template += " class='" + col.classes + "'";
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
    				this.template += "}}}";
    			}
    			this.template += "</td>";
    		} else {
    			this.template += "<td data-field='" + col + "'>{{model." + col + "}}</td>";
    		}
    	}, this));
    }
});


SWAM.Views.Table = SWAM.Views.List.extend({
    classes: "swam-table table table-striped",
    tagName: "table",

    defaults: {
        ItemView: SWAM.Views.TableItem,
        sort_down_icon: '<i class="bi bi-caret-down-fill"></i>',
        sort_up_icon: '<i class="bi bi-caret-up-fill"></i>'
    },

    on_action_sort: function(evt) {
    	var sort_field = $(evt.currentTarget).data("sort");
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
    		if (column.label && !column.field) column.field = column.label;
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
    			}
    		}

    		if (column.classes) {
    			$el.addClass(column.classes);
    		}
    		$el.html(lbl);
    		this.$header.append($el);
    		$el.data("sort", column.sort_field);
    		$el.on("click", this._bound_click_sort);
    	} else {
    		this.$header.append("<th>" + column + "</th>");
    	}
    }
});


SWAM.Views.PaginatedTable = SWAM.Views.PaginatedList.extend({
	defaults: {
		List: SWAM.Views.Table,
	}

});

