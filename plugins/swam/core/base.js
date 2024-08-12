window.SWAM = {
    renderTemplate: function(template, context) {
        return this.renderString(SWAM.getTemplate(template, true), context);
    },
    renderString: function(text, context) {
        if (!text) return "";
        var defaults = {};
        if (window.app) defaults.app = window.app;
        if (window.app) defaults.APP = window.app;
        if (SWAM.HAL) defaults.HAL = SWAM.HAL;
        context = _.extend({}, context, defaults);
        return Mustache.render(text, context);
    },
    hasTemplate: function(tpath) {
        let t = SWAM.getTemplate(tpath);
        return t && (t != tpath);
    },
    getTemplate: function(tpath, strip_comments) {
        var t;
        if (tpath[0] == '<' || tpath.call || (tpath.indexOf("{{") >= 0)) {
            t = tpath;
        } else if (tpath[0] == '.') {
            var troot = window.template_cache;
            var root_path = window.template_root.replaceAll('/', '.');
            t = window.getNestedValue(troot, root_path + tpath);
            if (t == undefined) {
                // lets try and search for it
                troot = window.getNestedValue(troot, root_path);
                if (troot == undefined) {

                    console.warn("[SWAM.getTemplate] template root not found: " + tpath);
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
            return tpath;
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

        if (!this._event_listeners[event]) this._event_listeners[event] = [];
        var listeners = this._event_listeners[event];
        var hc = {handler:handler, context:context};
        // verify this does not already exist
        var lhc = _.findWhere(listeners, hc);
        if (lhc == undefined) this._event_listeners[event].push(hc);
    },
    off: function(event, handler, context) {
        if (!_.isObject(this._event_listeners)) this._event_listeners = {};
        if (!this._event_listeners[event]) return;
        var hc = {handler:handler};
        if (context != undefined) hc.context = context;
        var lhc = _.findWhere(this._event_listeners[event], hc);
        if (lhc != undefined) this._event_listeners[event].remove(lhc);
    },
    trigger: function(event, data, extra) {
        if (!_.isObject(this._event_listeners)) this._event_listeners = {};
        if (!this._event_listeners[event]) return;
        for (var i = 0; i < this._event_listeners[event].length; i++) {
            try {
                var cb = this._event_listeners[event][i];
                var context = this;
                if (cb.context) context = cb.context;
                cb.handler.call(context, data, extra);
            } catch (err) {
                console.error(err);
            }
        }
    },

    triggerAsync: function(event, data, extra) {
        setTimeout(function(){
            this.trigger(event, data, extra);
        }.bind(this), 100);
    }
}

// Global Ids make it easier to identify components
window.__swam_global_index = 1;
window.getNextSwamIndex = function() { return window.__swam_global_index++; };


// Very simple and clean non es6 js class/objects
// Needed to support old android and other legacy devices
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

_.extend(SWAM.Object.prototype, {
        defaults: {},
        initialize: function(opts) { this.init_options(opts); }, 
        init_options: function(opts) {
            var super_defaults = this.constructor.__super__.defaults || {};
            super_defaults = _.deepClone(super_defaults);
            if (this.constructor.globals) super_defaults = _.deepExtend({}, super_defaults, _.deepClone(this.constructor.globals));
            this.options = _.extend({}, super_defaults, _.deepClone(this.defaults), opts);
            this._id_ = window.getNextSwamIndex();
        }
    },
    SWAM.EventSupport);

var delegateEventSplitter = /^(\S+)\s*(.*)$/;
try {
    navigator.supports_touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) || navigator.userAgent.indexOf('IEMobile') != -1;
} catch (e) {

}

