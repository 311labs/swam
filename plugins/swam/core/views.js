SWAM.Views = SWAM.Views || {};
SWAM.Ext = SWAM.Ext || {};

SWAM.View = SWAM.Object.extend({
    defaults: {
        replaces_el: false
    },
    _events: {
        "click [data-action]": "on_action_click",
        "click [data-showpage]": "on_showpage_click",
        "click [data-showurl]": "on_showurl_click"
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
        if (!this.id && this.options.auto_id) this.id = this.vid;
        this.setElement(document.createElement(this.tagName));
        if (this.options.parent) this.options.$parent = $(this.options.parent);
        this.on_init();
        if (this.options.model) this.setModel(this.options.model);
        if (this.options.$parent) {
            let $el = this.options.$parent;
            this.options.$parent = null;
            this.addToDOM($el);
        }
    },
    on_init: function() {

    },
    setParams: function(params) {
        this.params = params || {};
        this.on_params();
    },
    on_params: function() {

    },
    scrollToAnchor: function(anchor) {
        if (!anchor) return;
        // var parent = window.getScrollParent(this.el);
        var anchor_el = this.$el.find("#" + anchor);
        if (anchor_el.length) {
            $("html, body").animate({
                scrollTop: anchor_el.offset().top - 60
            });
        }
    },
    normalizeElSel: function(el_sel) {
        if (!el_sel.startsWith("#") && !el_sel.startsWith(".")) el_sel = "#" + el_sel;
        return el_sel;
    },
    addChild: function(el_sel, view, append) {
        if (this.children[el_sel]) this.removeChild(el_sel);
        this.children[el_sel] = view;
        if (!el_sel.startsWith("#") && !el_sel.startsWith(".")) el_sel = "#" + el_sel;
        var $parent = this.$el.find(this.normalizeElSel(el_sel));
        if (this.isInDOM()) {
            if ($parent.length) {
                view.addToDOM($parent);
            } else if (append) {
                view.addToDOM(this.$el);
            }
        }
    },
    removeChild: function(el_sel) {
        if (this.children[el_sel]) {
            this.$el.find(this.normalizeElSel(el_sel)).empty();
            delete this.children[el_sel];
        }
        if (this.appended_children && this.appended_children[el_sel]) {
            delete this.appended_children[el_sel];
            this.$el.find(this.normalizeElSel(el_sel)).remove()
        }
    },
    appendChild: function(el_sel, view) {
        if (view == undefined) {
            view = el_sel;
            el_sel = view.vid;
        }
        if (!this.appended_children) this.appended_children = {};
        this.appended_children[el_sel] = view;
        this.addChild(el_sel, view, true);
    },
    getChild: function(el_sel) {
        var child = this.children[el_sel];
        if ((child === undefined)&&(this.appended_children)) {
            child = this.appended_children[el_sel];
        }
        return child;
    },
    setElement: function(el) {
        this.undelegateEvents();
        this.$el = $(el);
        this.el = this.$el[0];
        this.updateAttributes();
        this.delegateEvents();
    },
    addClass: function(name) {
        var lst = this.classes.split(' ');
        if (lst.has(name)) return;
        lst.push(name);
        this.classes = lst.join(" ");
        if (this.$el) {
            this.$el.attr("class", this.classes);
            if (this.options.add_classes) this.$el.addClass(this.options.add_classes);
        }
    },
    removeClass: function(name) {
        var lst = this.classes.split(' ');
        if (lst.has(name)) {
            lst.remove(name);
            this.classes = lst.join(" ");
        }
        if (this.$el) this.$el.attr("class", this.classes);
    },
    hasClass: function(name) {
        var lst = this.classes.split(' ');
        return lst.has(name);
    },
    updateAttributes: function() {
        if (this.options.classes) this.classes = this.options.classes;
        var attrs = {};
        if (this.attrs) attrs = _.extend(attrs, this.attrs);
        if (this.classes) attrs.class = this.classes;
        if (this.id) attrs.id = this.id;
        if (this.tagName == "a") attrs.href = this.options.href || "#";
        if (this.data_attrs) _.each(this.data_attrs, function(val, key){this.$el.data(key, val);}.bind(this));
        this.$el.attr(attrs);
        if (this.options.add_classes) this.$el.addClass(this.options.add_classes);
    },
    addToDOM: function($el) {
        if (this.$parent) this.removeFromDOM();
        if (!$el) {
            console.warn("cannot add to empty null parent");
            return;
        }
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
        if (this.options.hide_noperms) this.hideNoPerms();
        this.on_post_render();
        this.trigger("rendered", this);
        return this;
    },
    renderChildren: function(empty_parent) {
        if (!this.children) return;
        _.each(this.children, function(view, el_sel) {
            var $parent = this.$el.find(this.normalizeElSel(el_sel)).first();
            if ($parent.length) {
                if (empty_parent) $parent.empty();
                view.addToDOM($parent);
            } else if (this.appended_children && this.appended_children[el_sel]) {
                view.addToDOM(this.$el);
            }
        }.bind(this));
        return this;
    },
    delegateEvents: function(events) {
      if (!this.isInDOM()) return;
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
        var action = $el.data("action");
        if (!action) return true;
        var func_name = "on_action_" + action;
        if (_.isFunction(this[func_name])) {
            // evt.stopPropagation();
            return this[func_name](evt, $el.data("id"));
        } else if (this.options.action_context && _.isFunction(this.options.action_context[func_name])) {
            // evt.stopPropagation();
            return this.options.action_context[func_name](evt, $el.data("id"));
        }
        return true;
    },

    on_action_lightbox: function(evt) {
        evt.stopPropagation();
        let $el = $(evt.currentTarget);
        let opts = {};
        opts.url = $el.data("media");
        opts.kind = $el.data("kind");
        opts.content_type = $el.data("content_type");
        opts.title = $el.data("title");
        opts.name = $el.data("name") || opts.title;
        SWAM.Dialog.showMedia(opts);
        return;
        // if (!opts.url || !opts.kind) return true;
        // let view = null;
        // if (opts.kind == "image") {
        //     view = new SWAM.View({
        //         classes: "swam-lightbox",
        //         template:"<div>{{{options.src|image}}}</div>",
        //         src:opts.url});
        // } else if (opts.kind == "video") {
        //     view = new SWAM.Views.Video({src:opts.url});
        // } else {
        //     window.open(opts.url, '_blank');
        //     return;
        // }
        // if (!opts.title) opts.title = "Lightbox";
        // SWAM.Dialog.show({
        //     add_classes: "bg-dark text-white",
        //     fullscreen: true,
        //     title: opts.title,
        //     view: view,
        //     buttons: []
        // });
        // return false;
    },

    setModel: function(model) {
        if (this.options.ignore_set_model) return;
        if (this.model) {
            if (this.model == model) {
                _.each(this.children, function(child){
                    child.setModel(model);
                });
                return;
            }
            this.model.off("change", this.on_model_change, this);
        }
        let has_changed = this.model == model;
        this.model = model;
        this.options.model = model;
        if (this.model) {
            this.model.on("change", this.on_model_change, this);
        }
        _.each(this.children, function(child){
            child.setModel(model);
        });
        if (this.options && this.options.on_set_model) this.options.on_set_model(model);
        if (has_changed) this.trigger("set_model", model);
    },

    on_model_change: function(model) {
        this.render();
    },

    on_showpage_click: function(evt) {
        var $el = $(evt.currentTarget);
        var page_name = $el.data("showpage");
        var params = $el.data("params");
        var anchor = $el.data("anchor");
        if (_.isString(params)) {
            if (params.startsWith("?")) params = {url_params:window.decodeSearchParams(params)};
        }
        if (!page_name) return;
        var func_name = "on_showpage_" + page_name;
        if (_.isFunction(this[func_name])) {
            return this[func_name](evt, params, anchor);
        } else {
            app.setActivePage(page_name, params, anchor);
        }

        if ($el.hasClass("dropdown-item")) {
            var dropdown = $el.parent().parent().parent().find(".dropdown-toggle");
            if (dropdown.length) {
                dropdown.dropdown("hide");
            }
        }

        var propagate = $el.data("propagate");
        if (!propagate) {
            evt.stopPropagation();
            return false;
        }

        return true;
    },

    on_showurl_click: function(evt) {
        evt.stopPropagation();
        var $el = $(evt.currentTarget);
        var url = $el.data("showurl");
        window.open(url, "_blank");
        return false;
    },

    isInDOM: function() {
        return $.contains(document.documentElement, this.$el[0]);
    },

    isVisible: function() {
        return this.$el.is(':visible');
    },

    isInViewport: function() {
        if (!this.isVisible()) return false;

        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = this.$el.offset().top;
        var elemBottom = elemTop + this.$el.height();

        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom) && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
    },

    html: function() {
        return this.$el.outerHTML;
    },

    empty: function() {
        this.$el.html();
        _.each(this.appended_children, function(obj, key){
            if (this.children[key]) delete this.children[key];
        }.bind(this));
        this.appended_children = {};
    },

    hideNoPerms: function() {
        if (!app.me) return;
        // Iterate through all elements with the 'data-hasperms' attribute
        this.el.querySelectorAll('[data-hasperm]').forEach(element => {
            const hasPermission = app.me.hasPerm(element.getAttribute('data-hasperm').split(','));
            // If the function returns false, hide the element
            if (!hasPermission) {
                element.style.display = 'none'; // Hide the element
            }
        });
    },

    on_dom_adding: function() {},
    on_dom_added: function() { this.render(); },
    on_dom_removing: function() {},
    on_dom_removed: function() { this.$el.empty(); },
    on_pre_render: function() {},
    on_render: function() {  if (this.template) this.$el.html(SWAM.renderTemplate(this.template, this));},
    on_post_render: function() {},
});
