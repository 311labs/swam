window.SWAM = {
    renderTemplate: function(template, context) {
        var defaults = {};
        if (window.app) defaults.app = window.app;
        if (window.app) defaults.APP = window.app;
        if (SWAM.HAL) defaults.HAL = SWAM.HAL;
        context = _.extend({}, context, defaults);
        return Mustache.render(SWAM.getTemplate(template, true), context);
    },
    getTemplate: function(tpath, strip_comments) {
        var t;
        if (tpath[0] == '<' || tpath.call || tpath[0] == "{") {
            t = tpath;
        } else if (tpath[0] == '.') {
            var troot = window.template_cache;
            var root_path = window.template_root.replaceAll('/', '.');
            t = window.getNestedValue(troot, root_path + tpath);
            if (t == undefined) {
                // lets try and search for it
                troot = window.getNestedValue(troot, root_path);
                if (troot == undefined) {

                    console.warn("[Backbone.render] template root not found: " + tpath);
                    return t;
                }
                t = window.findNestedValue(troot, tpath);
            }
        } else {
            t = window.getNestedValue(window.template_cache, tpath);
        }

        if (_.isObject(t)) {
            // most likely the last object node
            var last_key = tpath;
            if (tpath.indexOf('.') >= 0) {
                last_key = tpath.split('.');
                last_key = last_key[last_key.length-1];
                t = t[last_key];
            }
        }

        if (t == undefined) {
            console.warn("[SWAM.render] template not found: " + tpath);
            return t;
        }

        if (tpath.indexOf('.') > 0) {
            window.last_template_path = tpath.substr(0, tpath.lastIndexOf('.'));
        } else {
            window.last_template_path = "";
        }

        if (strip_comments) {
            t = t.replace(/<!--(.*?)-->/g, "");
        }
        return t;
    }
};


SWAM.EventSupport = {
    on: function(event, handler, context) {
        if (!_.isObject(this._event_listeners)) this._event_listeners = {};
        if (!_.isFunction(handler)) {
            console.warn("event: " + event + " passed an invalid or undefined handler");
            return;
        }
        if (context) handler.__context__ = context;
        if (!this._event_listeners[event]) this._event_listeners[event] = [];
        if (this._event_listeners[event].indexOf(handler) < 0) this._event_listeners[event].push(handler);
    },
    off: function(event, handler) {
        if (!_.isObject(this._event_listeners)) this._event_listeners = {};
        if (!this._event_listeners[event]) return;
        if (this._event_listeners[event].indexOf(handler) >= 0) this._event_listeners[event].remove(handler);
    },
    trigger: function(event, data) {
        if (!_.isObject(this._event_listeners)) this._event_listeners = {};
        if (!this._event_listeners[event]) return;
        for (var i = 0; i < this._event_listeners[event].length; i++) {
            try {
                var cb = this._event_listeners[event][i];
                var context = this;
                if (cb.__context__) context = cb.__context__;
                cb.call(context, data);
            } catch (err) {
                console.error(err);
            }
        }
    },
}


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

