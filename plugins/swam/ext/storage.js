
SWAM.StorageExtension = {
    setProperty: function(key, value) {
        console.log("setting property: " + key + "=" + value);
        // check for propery change handler, call it before the change?
        var func_name = "on_propery_" + key;
        if (_.isFunction(this[func_name])) this[func_name](value);

        if (value === null || value == undefined) {
            window.localStorage.removeItem(key);
        } else if (_.isObject(value) || _.isArray(value)) {
            window.localStorage.setObject(key, value);
        } else {
            window.localStorage.setItem(key, value);
        }
        this.trigger("property:change", {key:key, value:value});
    },

    getProperty: function(key, dvalue) {
        value = window.localStorage.getItem(key);
        if (value === null || value == undefined) return dvalue;
        return value;
    },

    getObject: function(key, dvalue) {
        value = window.localStorage.getObject(key);
        if (value === null || value == undefined) return dvalue;
        return value;
    },

    getIntProperty: function(key, dvalue) {
        value = window.localStorage.getItem(key);
        if (value === null || value == undefined) return dvalue;
        return parseInt(value, 10);
    },

    getBoolProperty: function(key, dvalue) {
        value = window.localStorage.getItem(key);
        if (value === null || value == undefined) return dvalue;
        if (value == "false" || value == "0") return false;
        if (value == "true" || value == "1") return true;
        return parseInt(value, 10);
    }
};
