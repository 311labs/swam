
SWAM.Rest = {
    defaults: {
        timeout: 120000,
        contentType: "application/json",
        dataType: "json",
        cache: false,
    },

    debug_delay_ms: 0, // optional delay sending request by n ms

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

    DELETE: function(url, data, callback, opts) {
        return SWAM.Rest.makeRequest("DELETE", url, data, callback, opts);
    },

    PUT: function(url, data, callback, opts) {
        return SWAM.Rest.makeRequest("PUT", url, data, callback, opts);
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
            if (xhr.status == 200) {
                var j = xhr.responseJSON;
                if (!j) j = {error:"nothing returned"}; // avoid empty responses
                if (callback) callback(j, xhr.status);
            } else {
                if (callback) {
                    var resp = {status:false, error_code: xhr.status, error: status};
                    if (status === 'timeout') {
                        resp.error = 'Request timed-out';
                        resp.error_code = 522;
                    } else if (status === 'abort') {
                        resp.error = 'Request aborted';
                        resp.error_code = 420;
                    } else if (status === 'parsererror') {
                        resp.error = 'Request got jumbled-up';
                    } else if (xhr.status == 400) {
                        resp.error = "bad request";
                    } else if (xhr.status == 401) {
                        resp.error = "Unauthorized";
                    } else if (xhr.status == 403) {
                        resp.error = "Forbidden";
                    } else if (xhr.status == 404) {
                        resp.error = "page not found";
                    } else if (xhr.status == 408) {
                        resp.error = "request timed out";
                    } else if (xhr.status == 429) {
                        resp.error = "server busy";
                    } else if (xhr.status == 500) {
                        resp.error = "Internal Server Error";
                    }
                    callback(resp, xhr.status);
                }
            }
            
        };

        if (this.debug_delay_ms) {
            console.warn("DEBUG MODE: delaying rest request by " + this.debug_delay_ms + " ms");
            setTimeout(function() {
                $.ajax(request);
            }, this.debug_delay_ms);
            return;
        }

        $.ajax(request);
    }
}




