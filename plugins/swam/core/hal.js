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
        console.log("hal.send: " + service + ":" + event);
        if (window.hal && window.hal.sendToHal) {
            if (_.isObject(data)) data = JSON.stringify(data);
            hal.sendToHal(service, event, data);
        }
    },
    on_event: function(service, event, data) {
        console.log("hal.receive: " + service + ":" + event);
        window.sleep(10).then(function(){
            SWAM.HAL.triggerEvent(service, event, data);
        });
    },

    triggerEvent: function(service, event, data) {
        SWAM.HAL.trigger(service + ":" + event, data);
    },
    getSetting: function(key, defaultValue) {
        if (!this.config) return  defaultValue;
        if (_.isUndefined(this.config[key])) return defaultValue;
        return this.config[key];
    },
    toast: function(msg) {this.send("hal", "toast", msg)}
}, SWAM.EventSupport, SWAM.SendWaitSupport);


SWAM.HALExt = {
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

    delegateEvents: function(events) {
        if (!this.isInDOM()) return;
        SWAM.View.prototype.delegateEvents.call(this, events);
        this.bindHalEvents()
        return this;
    },
    undelegateEvents: function() {
        if (!this.$el)  return;
        this.$el.off('.delegateEvents' + this.vid);
        this.unbindHalEvents();
        return this;
    },
};


// expose to native
window.onHalEvent = SWAM.HAL.on_event;
window.HAL = SWAM.HAL;

