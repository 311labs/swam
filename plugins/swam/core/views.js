SWAM.Views = SWAM.Views || {};
SWAM.Ext = SWAM.Ext || {};

SWAM.View = SWAM.Object.extend({
    defaults: {
        replaces_el: false
    },
    _events: {
        "click [data-action]": "on_action_click",
        "click [data-showpage]": "on_showpage_click"
    },
    hal_events: {},
    tagName: "div",
    classes: "wap-view",
    $el: null,
    el: null,
    $parent: null,
    template: null,
    templateName: null,
    children: null,
    initialize: function(opts) {
        if (opts) {
            if (opts.templateName) this.templateName = opts.templateName;
            if (opts.template) this.template = opts.template;
            if (opts.id) this.id = opts.id;
            if (opts.tagName) this.tagName = opts.tagName;
        }
        this._event_listeners = {};
        this.init_options(opts);
        this.events = _.extend({}, this._events, this.events, this.options.events);
        this.hal_events = _.extend({}, this.hal_events, this.options.hal_events);
        this.children = {};
        if (this.options.enable_swipe) this.enableTouch();
        this.vid = _.uniqueId("SWAMView");
        this.setElement(document.createElement(this.tagName));
        if (this.options.$parent) {
            delete this.options.$parent;
            this.addToDOM(opts.$parent);
        }
        this.on_init();
    },
    on_init: function() {

    },
    setParams: function(params) {
        this.params = params;
    },
    normalizeElSel: function(el_sel) {
        if (!el_sel.startsWith("#") && !el_sel.startsWith(".")) el_sel = "#" + el_sel;
        return el_sel;
    },
    addChild: function(el_sel, view) {
        this.children[el_sel] = view;
        if (!el_sel.startsWith("#") && !el_sel.startsWith(".")) el_sel = "#" + el_sel;
        var $parent = this.$el.find(this.normalizeElSel(el_sel));
        if ($parent) {
            view.addToDOM($parent);
        }
    },
    removeChild: function(el_sel) {
        if (this.children[el_sel]) {
            this.$el.find(this.normalizeElSel(el_sel)).empty();
            delete this.children[el_sel];
        }
    },
    getChild: function(el_sel) {
        return this.children[el_sel];
    },
    setElement: function(el) {
        this.undelegateEvents();
        this.$el = $(el);
        this.el = this.$el[0];
        this.updateAttributes();
        this.delegateEvents();
    },
    updateAttributes: function() {
        if (this.options.classes) this.classes = this.options.classes;
        var attrs = {};
        if (this.attrs) attrs = _.extend(attrs, this.attrs);
        if (this.classes) attrs.class = this.classes;
        if (this.id) attrs.id = this.id;
        if (this.data_attrs) _.each(this.data_attrs, function(val, key){this.$el.data(key, val);}.bind(this));
        this.$el.attr(attrs);
        if (this.options.add_classes) this.$el.addClass(this.options.add_classes);
    },
    isInDOM: function() {
        if (!this.$el) return false;
        return this.$el.closest(document.documentElement).length;
    },
    addToDOM: function($el) {
        if (this.$parent) this.removeFromDOM();
        this.$parent = $el;
        this.on_dom_adding();
        if (this.options.replaces_el) {
            this.setElement(this.$parent);
        } else {
            this.$parent.append(this.$el);
            this.delegateEvents();
        }
        this.on_dom_added();
    },
    removeFromDOM: function() {
        if (!this.$parent) return;
        this.on_dom_removing();
        this.undelegateEvents();
        var $par = this.$parent;
        this.$parent = null;
        this.$el.remove();
        this.on_dom_removed($par);
    },
    render: function() {
        this._last_render = Date.now();
        this.on_pre_render();
        // console.log("rendering: " + this.vid);
        this.on_render();
        this.renderChildren();
        this.on_post_render();
    },
    renderChildren: function(empty_parent) {
        if (!this.children) return;
        _.each(this.children, function(view, el_sel) {
            var $parent = this.$el.find(this.normalizeElSel(el_sel));
            if ($parent) {
                if (empty_parent) $parent.empty();
                view.addToDOM($parent);
            }
        }.bind(this));
    },
    delegateEvents: function(events) {
      if (this.el && !$.contains(document.documentElement, this.el)) return;
      events || (events = _.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], method.bind(this));
      }
      return this;
    },
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.vid, selector, listener);
      return this;
    },
    undelegateEvents: function() {
      if (!this.$el)  return;
      this.$el.off('.delegateEvents' + this.vid);
      return this;
    },
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.vid, selector, listener);
      return this;
    },
    on_action_click: function(evt) {
        var $el = $(evt.currentTarget);
        var action = $el .data("action");
        if (!action) return true;
        var func_name = "on_action_" + action;
        if (_.isFunction(this[func_name])) {
            return this[func_name](evt, $el.data("id"));
        }
        return true;
    },

    on_showpage_click: function(evt) {
        evt.stopPropagation();
        var page_name = $(evt.currentTarget).data("showpage");
        if (!page_name) return;
        var func_name = "on_showpage_" + page_name;
        if (_.isFunction(this[func_name])) {
            this[func_name](evt);
        } else {
            app.setActivePage(page_name);
        }
        return false;
    },

    on_dom_adding: function() {},
    on_dom_added: function() { this.render(); },
    on_dom_removing: function() {},
    on_dom_removed: function() { this.$el.empty(); },
    on_pre_render: function() {},
    on_render: function() {  if (this.template) this.$el.html(SWAM.renderTemplate(this.template, this));},
    on_post_render: function() {},
});