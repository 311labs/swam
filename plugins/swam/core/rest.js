
SWAM.Rest = {
    defaults: {
        timeout: 120000,
        contentType: "application/json",
        dataType: "json",
        cache: false,
    },

    // credentials: {
    //     kind: "JWT",
    //     access: null,
    //     refresh: null
    // },

    GET: function(url, data, callback, opts) {
        return SWAM.Rest.makeRequest("GET", url, data, callback, opts);
    },

    POST: function(url, data, callback, opts) {
        return SWAM.Rest.makeRequest("POST", url, data, callback, opts);
    },

    makeRequest: function(method, url, data, callback, opts) {
        opts = opts || {};
        var request = _.extend({"method":method}, SWAM.Rest.defaults, opts.request_options);
        if (opts.params) {
            data = _.extend({}, opts.params, data);
        }
        if (data != null) {
            if (method == "POST") {
                request.data = JSON.stringify(data);
            } else {
                request.data = $.param(data);
            }
            
        }

        if (SWAM.Rest.credentials && !opts.no_auth) {
            if (SWAM.Rest.credentials.kind == "JWT") {
                // TODO check expires field of JWT
                if (!request.headers) request.headers = {};
                request.headers['Authorization'] = "Bearer " + SWAM.Rest.credentials.access;
            } else if (SWAM.Rest.credentials.kind == "authtoken") {
                request.headers['Authorization'] = "authtoken " + SWAM.Rest.credentials.token;
            }
        }
        
        if (!url.startsWith("http")) {
            if (window.app && window.app.options.api_url) {
                url = window.app.options.api_url + url;
            } else if (window.api_url) {
                url = window.api_url + url;
            }
        }
        request.url = url;
        request.complete = function(xhr, status) {
            if (callback) callback(xhr.responseJSON, status);
        };

        $.ajax(request);
    }
}




