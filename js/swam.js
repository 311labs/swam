// SUPER LIGHTWEIGHT WEB APP FRAMEWORK - MVC

window.SWAM = {
    _template_path: "views/",
    _template_cache: {}, // cache loaded page templates
    fetchTemplate: function(name, callback) {
        $.get(this._template_path + name + ".html", {"_": $.now()}, function(template) {
            this._template_cache[name] = template;
            if (callback) callback(name, template);
        }.bind(this));
    },
    renderTemplate: function(template, context) {
        var defaults = {};
        if (window.app) defaults.APP = window.app;
        if (SWAM.HAL) defaults.HAL = SWAM.HAL;
        context = _.extend({}, context, defaults);
        return Mustache.render(template, context);
    }
};

SWAM.EventSupport = {
    _event_listeners: {},
    on: function(event, handler, context) {
        if (context) handler.__context__ = context;
        if (!this._event_listeners[event]) this._event_listeners[event] = [];
        if (this._event_listeners[event].indexOf(handler) < 0) this._event_listeners[event].push(handler);
    },
    off: function(event, handler) {
        if (!this._event_listeners[event]) return;
        if (this._event_listeners[event].indexOf(handler) >= 0) this._event_listeners[event].remove(handler);
    },
    trigger: function(event, data) {
        if (!this._event_listeners[event]) return;
        for (var i = 0; i < this._event_listeners[event].length; i++) {
            try {
                var cb = this._event_listeners[event][i];
                var context = this;
                if (cb.__context__) context = cb.__context__;
                cb.call(context, data);
            } catch (err) {
                console.trace();
            }
        }
    },
}

SWAM.SendWaitSupport = {
    // stores wait timers by "event:name", you can only have one per wait type
    _wait_timers: {},
    _wait_callbacks: {},
    setWaitTimer: function(wid, callback, context, timeout) {
        if (!timeout) {
            timeout = context;
            context = null;
        }
        if (context) callback = _.bind(callback, context);
        this.clearWaitTimer(wid);
        this._wait_callbacks[wid] = callback;
        this._wait_timers[wid] = setTimeout(function(){
            this._wait_timers[wid] = null;
            this._wait_callbacks[wid] = null;
            callback();
        }.bind(this), timeout);
    },

    waitForEvent: function(wait_for, callback, timeout) {
        this.sendAndWait(null, null, null, wait_for, callback, timeout);
    },

    clearAllWaits: function(){
        _.each(this._wait_timers, function(timer, wid){
            this.clearWaitTimer(wid);
        }.bind(this));
    },

    clearWaitTimer: function(wid, no_callback) {
        if (this._wait_timers[wid]) {
            clearTimeout(this._wait_timers[wid]);
            delete this._wait_timers[wid]; // use del?
            var callback = this._wait_callbacks[wid];
            delete this._wait_callbacks[wid];  // use del?
            if (!no_callback && callback) callback();
        }
    },

    sendAndWait: function(name, event, data, wait_for, callback, timeout) {
        var triggered = false;
        var wid = name + ":" + event;
        this.clearWaitTimer(wid);
        var callback_map = {};

        var clearCallbacks = function() {
            this.clearWaitTimer(wid, false);
            _.each(callback_map, function(evt_name){
                if (callback_map[evt_name]) SWAM.HAL.off(evt_name, callback_map[evt_name]);
            });
        }.bind(this);

        if (_.isArray(wait_for)) {
            _.each(wait_for, function(evt_name){
                callback_map[evt_name] = function(cb_data) {
                    if (triggered) return;
                    triggered = true;
                    clearCallbacks();
                    var fs = evt_name.split(':');
                    callback(fs[0], fs[1], cb_data);
                }
                SWAM.HAL.on(evt_name, callback_map[evt_name]);
            });
        } else {
            callback_map[wait_for] = function(cb_data) {
                    if (triggered) return;
                    triggered = true;
                    clearCallbacks();
                    var fs = wait_for.split(':');
                    callback(fs[0], fs[1], cb_data);
                }
            SWAM.HAL.on(wait_for, callback_map[wait_for]);
        }
        timeout = timeout || 5000;
        this.setWaitTimer(wid, function(){
            if (triggered) return;
            triggered = true;
            clearCallbacks();
            callback("hal", "timeout", null);
        }, this, timeout);
        if (_.isString(name)) {
            this.send(name, event, data);
        }
    },
}

// Hardware Abstraction Layer Singleton
SWAM.HAL = _.extend({
    send: function(service, event, data) {
        console.log("hal request: " + service + ":" + event);
        if (window.hal && window.hal.sendToHal) {
            if (_.isObject(data)) data = JSON.stringify(data);
            hal.sendToHal(service, event, data);
        }
    },
    on_event: function(service, event, data) {
        window.sleep(10).then(function(){
            SWAM.HAL.triggerEvent(service, event, data);
        });
    },
    triggerEvent: function(service, event, data) {
        SWAM.HAL.trigger(service + ":" + event, data);
    },
    toast: function(msg) {this.send("hal", "toast", msg)}
}, SWAM.EventSupport, SWAM.SendWaitSupport);

// expose to native
window.onHalEvent = SWAM.HAL.on_event;


// Very simple and clean non es6 js class/objects
SWAM.Object = function(attributes, options) {
    this.initialize.apply(this, arguments);
}

SWAM.Object.extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    _.extend(child, parent, staticProps);

    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    child.__super__ = parent.prototype;
    return child;
}

_.extend(SWAM.Object.prototype, {initialize: function() {}}, SWAM.EventSupport);

var delegateEventSplitter = /^(\S+)\s*(.*)$/;
try {
    navigator.supports_touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) || navigator.userAgent.indexOf('IEMobile') != -1;
} catch (e) {

}

SWAM.View = SWAM.Object.extend({
    options: {},
    _events: {
        "click [data-action], .action": "on_action_click",
        "click [data-showpage], .action": "on_showpage_click",
        "click :checkbox": "on_checkbox_handler",
        "change input": "on_input_handler"
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
        this.options = _.extend({}, this.options, opts);
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
    },
    addChild: function(el_sel, view) {
        this.children[el_sel] = view;
        var $parent = this.$el.find(el_sel);
        if ($parent) {
            view.addToDOM($parent);
        }
    },
    removeChild: function(el_sel) {
        if (this.children[el_sel]) {
            this.$el.find(el_sel).empty();
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
        var attrs = {};
        if (this.attrs) attrs = _.extend(attrs, this.attrs);
        if (this.classes) attrs.class = this.classes;
        if (this.id) attrs.id = this.id;
        if (this.data_attrs) _.each(this.data_attrs, function(val, key){this.$el.data(key, val);}.bind(this));
        this.$el.attr(attrs);
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
        this.$el.remove();
        var $par = this.$parent;
        this.$parent = null;
        this.on_dom_removed($par);
    },
    render: function() {
        if (!this.template && this.templateName) {
            SWAM.fetchTemplate(this.templateName, function(name, template){
                this.template = template;
                this.render();
            }.bind(this));
            return false;
        }
        if (!this.template) return console.warn("cannot render, missing template");
        this.on_pre_render();
        this.$el.html(SWAM.renderTemplate(this.template, this));
        this.renderChildren();
        this.on_post_render();
    },
    renderChildren: function() {
        if (!this.children) return;
        _.each(this.children, function(view, el_sel) {
            console.log("renderChild");
            var $parent = this.$el.find(el_sel);
            if ($parent) {
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
      this.bindHalEvents();
      return this;
    },
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.vid, selector, listener);
      return this;
    },
    undelegateEvents: function() {
      if (this.$el) this.$el.off('.delegateEvents' + this.vid);
      this.unbindHalEvents();
      return this;
    },
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.vid, selector, listener);
      return this;
    },

    bindHalEvents: function() {
        if (this.hal_events) {
            this.unbindHalEvents();
            this._bound_hal_evts = {};
            _.each(this.hal_events, function(func_name, evt_name){
                if (_.isFunction(this[func_name])) {
                    if (!this._bound_hal_evts[evt_name]) {
                        var func = _.bind(this[func_name], this);
                        this._bound_hal_evts[evt_name] = func;
                        SWAM.HAL.on(evt_name, func);
                    } else {
                        console.warn("hal event already bound: " + evt_name)
                    }
                } else {
                    console.warn("hal event bind fail: no function " + func_name);
                }

            }, this);
        }
        return this;
    },

    unbindHalEvents: function() {
        if (SWAM.HAL && this._bound_hal_evts) {
            _.each(this._bound_hal_evts, function(func, evt_name){
                SWAM.HAL.off(evt_name, func);
            }, this);
            this._bound_hal_evts = null;
        }
        return this;
    },

    rebindHalEvents: function() {
        this.unbindHalEvents();
        this.bindHalEvents();
        return this;
    },

    on_action_click: function(evt) {
        var action = $(evt.currentTarget).data("action");
        if (!action) return;
        var func_name = "on_action_" + action;
        if (_.isFunction(this[func_name])) this[func_name](evt);
    },

    on_showpage_click: function(evt) {
        var page_name = $(evt.currentTarget).data("showpage");
        if (!page_name) return;
        var func_name = "on_showpage_" + page_name;
        if (_.isFunction(this[func_name])) {
            this[func_name](evt);
        } else {
            app.setActivePage(page_name);
        }
    },

    on_checkbox_handler: function(evt) {
        var $el = $(evt.currentTarget);
        var name = $el.attr("name");
        if (!name) name = $el.attr("id");
        if (!name) return;
        var func_name = "on_checkbox_" + name;
        if (_.isFunction(this[func_name])) {
            this[func_name](evt, $el.is(":checked"));
        } else if (_.isFunction(this["on_checkbox_change"])) {
            this.on_checkbox_change(name, $el.is(":checked"));
        }
    },

    on_input_handler: function(evt) {
        var $el = $(evt.currentTarget);
        var name = $el.attr("name");
        if (!name) name = $el.attr("id");
        if (!name) return;
        var func_name = "on_input_" + name;
        if (_.isFunction(this[func_name])) this[func_name](evt, $el.val());
        if (_.isFunction(this[func_name])) {
            this[func_name](evt, $el.val());
        } else if (_.isFunction(this["on_input_change"])) {
            this.on_input_change(name, $el.val());
        }
    },

    on_dom_adding: function() {},
    on_dom_added: function() { this.render(); },
    on_dom_removing: function() {},
    on_dom_removed: function() { this.$el.empty(); },
    on_pre_render: function() {},
    on_post_render: function() {},
});

SWAM.Dialog = SWAM.View.extend({
    classes: "modal fade show",
    templateName: "dialog",
    data_attrs: {"action":"bg_close"},
    options: {
        can_dismiss: true,
        show_close: false,
        buttons: [
            {
                action:"close",
                label:"Ok"
            }
        ]
    },
    show: function() {
        if (SWAM.active_dialog) {
            SWAM.active_dialog.dismiss();
        }
        this.addToDOM($("body"));
        this.$el.show();
    },
    dismiss: function() {
        SWAM.active_dialog = null;
        this.removeFromDOM();
    },
    on_action_close: function(evt) {
        this.dismiss();
        this.trigger("dialog:closed", this);
    },
    on_action_choice: function(evt) {
        this.dismiss();
        this.choice = $(evt.currentTarget).data("id");
        this.trigger("dialog:choice", this);
        if (this.options.callback) this.options.callback(this, this.choice);
    },
},{
    alert: function(opts) {
        if (_.isString(opts)) opts = {"message":opts};
        var dlg = new this(opts);
        dlg.show();
        return dlg;
    },
    yesno: function(opts) {
        opts.buttons = [
            {
                id: "no",
                action:"choice",
                label:"no"
            },
            {
                id: "yes",
                action:"choice",
                label:"yes"
            }
        ];
        return this.alert(opts);
    },
    choices: function(opts) {
        var norm_choices = [];
        var count = 0;
        _.each(opts.choices, function(obj, index){
            if (_.isString(obj)) {
                obj = {
                    id:obj,
                    label: obj,
                }
            }
            count += 1;
            norm_choices.push(obj);
        });
        opts.choices = norm_choices;
        if (!opts.buttons) opts.buttons = [
            {
                action:"close",
                label:"Cancel"
            }
        ];
        return this.alert(opts);
    }
});

SWAM.TouchExtension = {
    touch_options: {
        swipe_velocity: 0.5,
        swipe_left_trigger: -100,
        swipe_right_trigger: 100,
        swipe_up_trigger: -120,
        swipe_down_trigger: 120,
        intent_threshold: 40,
        tap_threshold: 10,
        tap_timeout: 250,
        fastTap: false, // this does not work if looking for double_tap event
    },

    last_tap_time: null,
    touch_dir_intent: 0,
    touch_delta_y: 0,
    touch_delta_x: 0,
    touch_start_y: 0,
    touch_start_x: 0,

    setTouchOptions: function(options) {
        this.options = _.extend({}, this.options, this.touch_options, options);
        if (_.isUndefined(this.options.intent_left_threshold)) {
            this.options.intent_left_threshold = this.options.intent_threshold * -1;
        }
        if (_.isUndefined(this.options.intent_right_threshold)) {
            this.options.intent_right_threshold = this.options.intent_threshold;
        }
        if (_.isUndefined(this.options.intent_up_threshold)) {
            this.options.intent_up_threshold = this.options.intent_threshold * -1;
        }
        if (_.isUndefined(this.options.intent_down_threshold)) {
            this.options.intent_down_threshold = this.options.intent_threshold;
        }
    },

    enableTouch: function(selector, options) {
        touch_events = {};
        selector = selector || "";
        if (navigator.supports_touch) {
            touch_events["touchstart " + selector] = "on_touch_start";
            touch_events["touchmove " + selector] = "on_touch_move";
            touch_events["touchend " + selector] = "on_touch_end";
        } else {
            touch_events["mousedown " + selector] = "on_touch_start_mouse";
        }
        this.events = this.events || {};
        this.events = _.extend({}, this.events, touch_events);
    },

    // LEFT RIGHT
    isIntentLeft: function() {
        return this.touch_delta_x < this.options.intent_left_threshold;
    },
    isIntentRight: function() {
        return this.touch_delta_x > this.options.intent_right_threshold;
    },
    isIntentLeftRight: function() {
        return this.isIntentLeft() || this.isIntentRight();
    },
    // UP DOWN
    isIntentUp: function() {
        return this.touch_delta_y < this.options.intent_up_threshold;
    },
    isIntentDown: function() {
        return this.touch_delta_y > this.options.intent_down_threshold;
    },
    isIntentUpDown: function() {
        return this.isIntentUp() || this.isIntentDown();
    },

    on_touch_intent: function() {
        // intents
        // 0 = none
        // 1 = up
        // 2 = down
        // 3 = left
        // 4 = right
        if ((this.touch_dir_intent == 1) && (!this.isIntentUp())) {
            // we are no longer going up.. clear intent
            this.touch_last_intent = 1;
            this.touch_dir_intent = 0;
        } else if ((this.touch_dir_intent == 2) && (!this.isIntentDown())) {
            this.touch_last_intent = 2;
            this.touch_dir_intent = 0;
        } else if ((this.touch_dir_intent == 3) && (!this.isIntentLeft())) {
            this.touch_last_intent = 3;
            this.touch_dir_intent = 0;
        } else if ((this.touch_dir_intent == 4) && (!this.isIntentRight())) {
            this.touch_last_intent = 4;
            this.touch_dir_intent = 0;
        } else if (this.touch_dir_intent != 0) {
            // do nothing because our intent is still true
            return;
        }

        // discover intent
        // TODO this is flawed by not taking in intent_thresholds
        if (Math.abs(this.touch_delta_x) > Math.abs(this.touch_delta_y)) {
            // potential intent is left/right
            if (this.isIntentLeft()) {
                this.touch_dir_intent = 3;
            } else if (this.isIntentRight()) {
                this.touch_dir_intent = 4;
            }
        } else {
            if (this.isIntentUp()) {
                this.touch_dir_intent = 1;
            } else if (this.isIntentDown()) {
                this.touch_dir_intent = 2;
            }
        }
        if (this.touch_last_intent && this.touch_dir_intent) {
            this.on_swipe_invalidate();
        }
    },

    getTouch: function(evt, touches) {
        if (!touches) {
            if (!evt.originalEvent) { return null;}
            touches = evt.originalEvent.touches;
        }

        if (touches && touches.length) {
            touches = touches[0];

        } else {
            touches = evt.originalEvent;
        }
        return touches;
    },

    on_touch_start_mouse: function(evt) {
        if (!this._bind_end_mouse) {
            this._bind_end_mouse = _.bind(this.on_touch_end_mouse, this);
            this._bind_move_mouse = _.bind(this.on_touch_move, this)
        }

        $(window).on("mouseup", this._bind_end_mouse);
        this.on_touch_start(evt);
        $(window).on("mousemove", this._bind_move_mouse);
    },

    on_touch_end_mouse: function(evt) {
        $(window).off("mouseup", this._bind_end_mouse);
        $(window).off("mousemove", this._bind_move_mouse);
        console.log("mouse off");
        this.on_touch_end(evt);
    },

    on_touch_start: function(evt, touches) {
        touches = this.getTouch(evt, touches);
        if (!touches) {
            return;
        }

        if (!this.options || !this.options.tap_timeout) {
            this.setTouchOptions();
        }
        this.on_swipe_begin(evt, touches);

        this.touch_start_y = touches.screenY;
        this.touch_start_x = touches.screenX;

        this.touch_dir_intent = 0;
        this.touch_last_intent = 0;
        this.touch_delta_y = 0;
        this.touch_delta_x = 0;
        this.touch_start_time = Date.now();

        if (this.last_tap_time && ((this.touch_start_time - this.last_tap_time) > this.options.tap_timeout)) {
            this.last_tap_time = 0;
        }
    },

    on_touch_move: function(evt, touches) {
        touches = this.getTouch(evt, touches);
        if (!touches) {
            return;
        }

        this.touch_delta_y = touches.screenY - this.touch_start_y;
        this.touch_delta_x = touches.screenX - this.touch_start_x;

        this.on_touch_intent();

        if (this.touch_dir_intent) {
            if (this.touch_dir_intent > 2) {
                this.on_swiping_lr(evt);
            } else {
                this.on_swiping_ud(evt);
            }
        } else if (this.touch_last_intent) {
            if (this.touch_last_intent > 2) {
                this.on_swiping_lr(evt);
            } else {
                this.on_swiping_ud(evt);
            }
        }
    },

    isInTapThreshold: function() {
        return (Math.abs(this.touch_delta_y < this.options.tap_threshold) && (Math.abs(this.touch_delta_x) < this.options.tap_threshold));
    },

    isSwipeUpTrigger: function() {
        return ((this.touch_dir_intent == 1)&&(this.touch_delta_y <= this.options.swipe_up_trigger));
    },

    isSwipeDownTrigger: function() {
        return ((this.touch_dir_intent == 2)&&(this.touch_delta_y >= this.options.swipe_down_trigger));
    },

    isSwipeLeftTrigger: function() {
        return ((this.touch_dir_intent == 3)&&(this.touch_delta_x <= this.options.swipe_left_trigger));
    },

    isSwipeRightTrigger: function() {
        return ((this.touch_dir_intent == 4)&&(this.touch_delta_x >= this.options.swipe_right_trigger));
    },

    on_touch_end: function(evt, touches) {
        this.touch_end_time = Date.now();
        this.touch_delta_time = this.touch_end_time - this.touch_start_time;

        if (!touches && evt.originalEvent) {
            touches = evt.originalEvent.changedTouches;
            if (touches && touches.length) {
                touches = touches[0];
            } else {
                touches = evt.originalEvent;
            }
        } else if (touches && touches.length) {
            touches = touches[0];
        }

        this.touch_delta_y = touches.screenY - this.touch_start_y;
        this.touch_delta_x = touches.screenX - this.touch_start_x;
        this.on_touch_intent();

        this.touch_x_velocity = (this.touch_delta_x/this.touch_delta_time);
        this.touch_y_velocity = (this.touch_delta_y/this.touch_delta_time);
        // console.log("velocity x: " + this.touch_x_velocity + " y: " + this.touch_y_velocity);

        if (Math.abs(this.touch_x_velocity) > this.options.swipe_velocity) {
            if (this.touch_x_velocity > 0) {
                this.on_swipe_right();
            } else {
                this.on_swipe_left();
            }
        } else if (Math.abs(this.touch_y_velocity) > this.options.swipe_velocity) {
            if (this.touch_y_velocity > 0) {
                this.on_swipe_down();
            } else {
                this.on_swipe_up();
            }
        } else if (this.touch_dir_intent) {
            if (this.isSwipeUpTrigger()) {
                this.on_swipe_up()
            } else if (this.isSwipeDownTrigger()) {
                this.on_swipe_down()
            } else if (this.isSwipeLeftTrigger()) {
                this.on_swipe_left()
            } else if (this.isSwipeRightTrigger()) {
                this.on_swipe_right()
            } else {
                this.on_swipe_none();
            }
        } else if ((this.touch_delta_time < this.options.tap_timeout)&&(this.isInTapThreshold())) {
            // console.log("tap time: " + this.touch_delta_time);
            // this is a tap
            if (this.last_tap_time) {
                this.last_tap_time = 0;
                this.on_double_tap();
            } else {
                this.last_tap_time = this.touch_end_time;
                this.on_tap_validate(evt);
            }
        }
    },

    on_tap_validate: function(evt) {
        var tap_time = this.last_tap_time;
        // console.log("tap: " + tap_time);
        var self = this;

        if (this.options.fastTap) {
            this.on_tap(evt);
        } else {
            setTimeout(function() {
                if (tap_time == self.last_tap_time) {
                    self.on_tap(evt);
                }
            }, 250);
        }
    },

    // called when tap fired
    on_tap: function(evt) {

    },

    // called on a double tap
    on_double_tap: function(evt) {

    },

    on_swipe_begin: function(evt) {

    },

    // similar to touchmove but only on up/down direction
    on_swiping_ud: function(evt) {

    },

    // similar to touchmove but only on left/right direction
    on_swiping_lr: function(evt) {

    },

    // called when touchend and swipe left criteria met
    on_swipe_up: function(evt) {

    },

    // called when touchend and swipe left criteria met
    on_swipe_down: function(evt) {

    },

    // called when touchend and swipe left criteria met
    on_swipe_left: function(evt) {

    },

    // called when touchend and swipe right criteria met
    on_swipe_right: function(evt) {

    },

    on_swipe_none: function(evt) {

    },


    // called when the swipe direction is no longer valid by a new direction
    on_swipe_invalidate: function(evt) {

    }
};

SWAM.App = SWAM.View.extend(SWAM.TouchExtension).extend({
    template: "<div id='panel-left'>&nbsp;</div><div id='panel-main'><header id='title-bar'></header><div id='page'></div></div><div id='panel-right'>&nbsp;</div>",
    _page_el_id: "#page",
    _pages: {},
    active_page: null,
    started: false,
    addPage: function(name, view) {
        this._pages[name] = view;
        view.page_name = name;
        view.id = "page_" + name;
        view.updateAttributes();
    },
    getPage: function(name) {
        return this._pages[name];
    },
    setActivePage: function(name) {
        var page = this._pages[name];
        var $parent = this.$el.find(this._page_el_id);
        if (page && $parent) {
            if (this.active_page) {
                page._prev_page = this.active_dialog;
                this.active_page.removeFromDOM();
            }
            // check for topbar
            if (page.classes && (page.classes.indexOf("has-topbar") >= 0)) {
                this.showTopBar();
            } else {
                this.hideTopBar();
            }
            this.active_page = page;
            $parent.empty();
            page.addToDOM($parent);
            this.trigger("page:change");
            if (!this.started) {
                this.start();
            }
        } else {
            console.warn("invalid page: " + name);
        }

    },
    isActivePage: function(name) {
        return this._pages[name] == this.active_page;
    },
    goBack: function() {
        if (this.active_dialog._prev_page) this.setActivePage(this.active_dialog._prev_page.page_name);
    },
    start: function() {
        this.started = true;
        if (SWAM.HAL) {
            SWAM.HAL.send("hal", "client_ready");
        }
    },

    showTopBar: function() { this.$el.find("#title-bar").show(); },
    hideTopBar: function() { this.$el.find("#title-bar").hide(); },

    showLeftPanel: function(evt) {
        $("body").addClass("panel-animate panel-left-reveal-partial");
    },

    hideLeftPanel: function(evt) {
        $("body").removeClass("panel-left-reveal-partial").addClass("panel-animate");
    },

    on_swipe_begin: function(evt) {
        $("body").removeClass("panel-animate");
        this.panel_x = 0;
        if ($("body").hasClass("panel-left-reveal-partial")) {
            this.panel_x = this.panel_left_width;
        }
    },

    // called when touchend and swipe left criteria met
    on_swipe_left: function(evt) {
        // console.log("app| swipe left");
        this.hideLeftPanel();
    },

    // called when touchend and swipe right criteria met
    on_swipe_right: function(evt) {
        // console.log("app| swipe right");
        this.showLeftPanel();
    },
});

SWAM.Localize = {
    'lang': function(lang_key, lang) {
        if (!app.lang) app.lang = "eng";
        if (!lang) lang = app.lang;
        if (!window.language_packs) return "no lang packs";
        var eng_pack = window.language_packs["eng"];
        if (!eng_pack) return "no lang packs";
        var pack = window.language_packs[lang];
        if (!pack) pack = eng_pack;
        var value = pack[lang_key];
        if (value == undefined) {
            value = eng_pack[lang_key];
            if (value == undefined) {
                return "lang key not defined: '" + lang_key + "'";
            }
        }
        return value;
    },
    'sectoms': function(value) {
        // to support legacy calls we change this into a date
        return new Date(value * 1000);
    },
    'iter': function(value, attr, fmt) {
        if (_.isObject(value)) {
            var res = [];
            _.each(value, function(value, key){
                if ((fmt == "no_objects")&& _.isObject(value)) return;
                res.push({key:key, value:value});
            });
            return res;
        }
        return null;
    },
    'bytes': function(value, attr, fmt) {
        if (value > 0 ){
            if (value < 1024)             { return value + " Bytes"}
            if (value < 1048576)          { return (value/1024).toFixed(0) + " KB"}
            if (value < 1073741824)       { return (value/1024/1024).toFixed(0) + " MB" }
            if (value < 1099511600000)    { return (value/1024/1024/1024).toFixed(1) + " GB"}
            return (value/1024/1024/1024/1024).toFixed(2) + " TB";
        }
        return value;
    },
    'ifemptyornull': function(value, attr, fmt) {
        var arg1, arg2 = null;
        if (_.isArray(fmt)) {
            arg1 = fmt[0];
            arg2 = fmt[1];
        } else {
            arg1 = fmt;
            arg2 = value;
        }
        if (_.isUndefined(value) || _.isNull(value)|| _.isEmpty(value)) {
            return arg1;
        }
        return arg2;
    },
    'yesno': function(value, attr, fmt) {
        var v = this.bool(value);
        if (v) {
            return "yes";
        }
        return "no";
    },

    'yesno_color': function(value, attr, fmt) {
        var v = this.bool(value);
        var color = 'color-green';
        if (!v) color = 'color-red';

        if (fmt == "invert_color") {
            if (!v) color = 'color-green';
            if (v) color = 'color-red';
        }
        return "<div class='"+color+"'>"+(v?"YES":"NO")+"</div>";
    },

    'yesno_icon': function(value, attr, fmt) {
        var v = this.bool(value);
        var yes_icon = "bi bi-toggle-on";
        var no_icon = "bi bi-toggle-off";
        var action = null;
        if (_.isArray(fmt)) {
            yes_icon = fmt[0];
            no_icon = fmt[0];
        } else {
            action = fmt;
        }
        if (action == "invert_color") {
            yes_icon = yes_icon + " color-red";
            no_icon = no_icon + " color-green";
        } else if (action == "no_color") {

        } else {
            yes_icon = yes_icon + " color-green";
            no_icon = no_icon + " color-red";
        }
        if (v) {
            return '<i class="' + yes_icon + '"></i>';
        }
        return '<i class="' + no_icon + '"></i>';
    },

    'iftruefalse': function(value, attr, fmt) {
        var values;
        if (_.isString(fmt)) {
            fmt = fmt.removeAll("'");
            values = fmt.split(',');
        } else {
            values = fmt;
        }
        if (this.bool(value)) {
            return values[0].trim();
        }
        return values[1].trim();
    },

    'bool': function(value, attr, fmt) {
        if (!value) return false;
        if (value) {
            if (_.isBoolean(value)) {
                return value;
            } else if (_.isString(value)) {
                if (value.isNumber()) return value.toInt();
                if (value == '') return false;
                // return (["on", "true", "True", "y", "yes", "Yes"].indexOf(value) >= 0);
                return (["off", "false", "False", "n", "no", "No", "0"].indexOf(value) < 0);
            } else if (_.isNumber(value)) {
                return true;
            }
        }
        return value;
    },

    'timerSince': function(value, attr, fmt) {
        return SWAM.Localize.timer((Date.now() - value)/1000);
    },

    'timer': function(value, attr, fmt) {
        var d = {};
        d.SS = Math.floor(parseInt(value, 10));
        d.ss = d.SS % 60;
        d.MM = Math.floor(d.SS / 60);
        d.mm = d.MM % 60;
        d.HH = Math.floor(d.MM / 60);
        d.hh = d.HH % 60;
        d.DD = Math.floor(d.HH / 24);
        d.dd = d.DD;

        _.each(['SS', 'ss', 'MM', 'mm', 'HH', 'hh', 'DD', 'dd'], function(v) {
            if(d[v] < 10) {
                d[v] = "0" + d[v];
            }
        });
        return _parseDateString(d, fmt || 'MM:ss');
    },
    'prettytimer': function(seconds, attr, fmt) {
        var interval = Math.floor(seconds / 31536000);

        if(interval > 1) {
            return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if(interval > 1) {
            return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if(interval > 1) {
            return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if(interval > 1) {
            return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if(interval > 1) {
            return interval + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    },

    'timesince': function(value, attr, fmt) {
        value = this.safe_datetime(value, attr, fmt);
        value = Math.floor((new Date() - value) / 1000);
        var d = {};
        d.SS = Math.floor(parseInt(value, 10));
        d.ss = d.SS % 60;
        d.MM = Math.floor(d.SS / 60);
        d.mm = d.MM % 60;
        d.HH = Math.floor(d.MM / 60);
        d.hh = d.HH % 60;
        d.DD = Math.floor(d.HH / 24);
        d.dd = d.DD;

        _.each(['SS', 'ss', 'MM', 'mm', 'HH', 'hh', 'DD', 'dd'], function(v) {
            if(d[v] < 10) {
                d[v] = "0" + d[v];
            }
        });
        return _parseDateString(d, fmt || 'MM:ss');
    },
    'safe_datetime': function(value, attr, fmt) {
        if(_.isUndefined(value)||(value === null)||(value == 0)) {
            return 0;
        }

        if (_.isNumber(value)) {
            // we will assume then this is secs
            value = value * 1000;
        } else if (_.isString(value)) {
            // assume is date string
            dt = Date.parse(value);
            if (dt) value = dt.getTime();
        } else if (_.isFunction(value.getMonth)) {
            value = value.getTime();
        }
        return value;
    },
    'default': function(value, attr, fmt) {
        console.log("default called");
        console.log(value);
        var arg1, arg2 = null;
        if (_.isArray(fmt)) {
            arg1 = fmt[0];
            arg2 = fmt[1];
        } else {
            arg1 = fmt;
            arg2 = value;
        }
        if (_.isUndefined(value) || _.isNull(value)) {
            return arg1;
        }
        return value;
    },
}

window._parseDateString = function(obj, fmt) {
    var tok = '';
    var ret = '';
    _.each(fmt.split('').concat(['_']), function(c) {
        if((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
            tok += c;
        } else {
            if(tok && obj.hasOwnProperty(tok)) {
                ret += obj[tok];
            } else {
                ret += tok;
            }
            tok = '';
            if(c != '_') {
                ret += c;
            }
        }
    });
    return ret;
}

window.sleep = function(time) {
    // sleep(500).then(() => {
    // Do something after the sleep!
    // });
    time = time || 0;
    return new Promise(function(resolve) {
      setTimeout(resolve, time);
    });
}

window.debounce = function (func, context, threshold, execAsap) {
    // Example usage:
    // on_keyup: function(evt) {
    //     if (!this._debounce) {
    //         this._debounce = window.debounce(
    //                 _.bind(this.on_amount_update, this),
    //                 400
    //             );
    //     }
    //     this._debounce(evt);
    // },
    var timeout;
    if (_.isObject(context)) {
        func = _.bind(func, context);
    } else {
        execAsap = threshold;
        threshold = context;
    }

    return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null;
        };

        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);

        timeout = setTimeout(delayed, threshold || 100);
    };
};

Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    if ((L == 1) && (_.isArray(a[0]))) {
        count = this.removeList(a[0]);
    } else {
        count = this.removeList(a);
    }
    return this;
};

Array.prototype.removeList = function(lst) {
    var what, a = lst,
        L = a.length,
        ax;
    var count = 0;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            count += 1;
            this.splice(ax, 1);
        }
    }
    return count;
};

Array.prototype.has = function() {
    if ((arguments.length == 1) && (_.isArray(arguments[0]))) {
        var lst = arguments[0];
        var i = lst.length;
        var c = 0;
        while (i--) {
            var item = lst[i];
            if (this.indexOf(item) >= 0) c += 1;
        }
        return c;
    } else if (arguments.length > 0) {
        return this.has(Array.from(arguments).sort(function (a, b) { return a - b; }));
    }
    return false;
};

String.prototype.replaceAll = function(oldVal, newVal) {
    if (typeof oldVal !== "string" || typeof newVal !== "string" || oldVal === "") {
        return this;
    }
    if (oldVal == newVal) {
        return this;
    }
    try {
        var returnVal = this;
        try {
            var replaceAllRegex = function(str) {
                return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }
            oldvalue = oldvalue.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            // var replaceAllRegex = new RegExp(eval("/" + RegExp.escape(oldVal) + "/gm"));
            return this.replace(oldvalue, newVal);
        } catch (invalidRegExp) {}
        var loopCount = 0; /* hit a RegExp exception, do it the old fashioned way */
        while (returnVal.contains(oldVal) && loopCount < 1000) {
            returnVal = returnVal.replace(oldVal, newVal);
            loopCount++;
        }
        return returnVal;
    } catch (exc) {}
    return this;
};

String.prototype.removeAll = function(str) {
    return this.replaceAll(str, "");
};

String.prototype.slugify = function() {
    // remove non-words and replace consecutive spaces with a hyphen
    return this.toLowerCase().replace(/[^\w ]+/g, '').replace(/[ ]+/g, '-');
};

String.prototype.removeAll = function(str) {
    return this.replaceAll(str, "");
};

String.prototype.toInt = function() {
    return parseInt(this.removeAll(',').removeAll('$').removeAll("%"), 10);
};

String.prototype.toNumberString = function() {
    return this.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
};

String.prototype.toNumber = function() {
    return Number(this);
};

String.prototype.toFloat = function() {
    return parseFloat(this.removeAll(',').removeAll('$').removeAll("%"));
};

String.prototype.upper = String.prototype.toUpperCase;
String.prototype.lower = String.prototype.toLowerCase;

// Gracias STACKOVERFLOW Crescent Fresh & Niaz
String.prototype.urlify = function(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    // var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return this.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
};

String.prototype.format = function() {
  // "This is {0} {1} {0}".format("another", "test")
  var arg1 = arguments[0];
  if (_.isObject(arg1)) return this.formatWithDict(arg1);
  var formatted = this;
  for (arg in arguments) {
    formatted = formatted.replaceAll("{" + arg + "}", String(arguments[arg]));
  }
  return formatted;
};

String.prototype.formatWithDict = function(dict) {
  // "This is {name} {place} {name}".formatWithDict("another", "test")
  var formatted = this;
  for (key in dict) {
    formatted = formatted.replaceAll("{" + key + "}", String(dict[key]));
  }
  return formatted;
};

String.Random = function(length, possible) {
    var text = "";
    possible = possible || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

String.prototype.toHex = function(){
    // var hex, i;

    // var result = "";
    // for (i=0; i<this.length; i++) {
    //     hex = this.charCodeAt(i).toString(16);
    //     result += ("000"+hex).slice(-4);
    // }

    // return result

    // utf8 to latin1
    var s = unescape(encodeURIComponent(this))
    var h = ''
    for (var i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16)
    }
    return h
}

String.prototype.fromHex = function(){
    var s = ''
    for (var i = 0; i < this.length; i+=2) {
        s += String.fromCharCode(parseInt(this.substr(i, 2), 16))
    }
    return decodeURIComponent(escape(s))
}

String.prototype.contains = function(str, caseSensitive) {
    if (typeof caseSensitive != "boolean") {
        caseSensitive = true;
    }
    try {
        if (typeof str == "undefined") {
            return false;
        }
        if (typeof str != "string") {
            str = String(str);
        }
        if (typeof str != "string" || str === "") {
            return false;
        }
        if (!caseSensitive) {
            return (this.toLowerCase().indexOf(str.toLowerCase()) != -1);
        }
        return (this.indexOf(str) != -1);
    } catch (exc) {}
    return false;
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}


