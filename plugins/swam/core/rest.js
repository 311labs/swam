
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

    DOWNLOAD: function(url, params, callback, opts) {
        opts = _.extend({filename:"download.csv"}, opts);

        if (!url.startsWith("http")) {
            if (window.app && window.app.options.api_url) {
                url = window.app.options.api_url + url;
            } else if (window.api_url) {
                url = window.api_url + url;
            }
        }

        if (params) {
            url = encodeSearchParams(url, params);
        }

        var request = new XMLHttpRequest();
        request.responseType = "blob";
        request.open("get", url, true);

        if (SWAM.Rest.credentials && !opts.no_auth) {
            if (SWAM.Rest.credentials.kind == "JWT") {
                // TODO check expires field of JWT
                if (!request.headers) request.headers = {};
                request.setRequestHeader('Authorization',  "Bearer " + SWAM.Rest.credentials.access);
            } else if (SWAM.Rest.credentials.kind == "authtoken") {
                request.setRequestHeader('Authorization', "authtoken " + SWAM.Rest.credentials.token);
            }
        }

        request.send();

        request.onreadystatechange = function() {
            if ((this.readyState == 4) && (this.status == 200)) {
                const objURL = window.URL.createObjectURL(this.response);
                const anchor = document.createElement("a");
                anchor.href = objURL;
                anchor.download = opts.filename;
                document.body.appendChild(anchor);
                anchor.click();
                setTimeout(function(){
                    // lets remove the anchor from DOM
                    anchor.remove();
                }, 5000);
                if (callback) callback(true, this.status);
            } else if (this.readstate == 4) {
                if (callback) callback(false, this.status);
            }
        };


    },

    makeRequest: function(method, url, data, callback, opts) {
        opts = _.extend({}, opts);
        var request = _.extend({
            "method":method,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        }, SWAM.Rest.defaults, opts.request_options);
        if (opts.params) {
            data = _.extend({}, opts.params, data);
        }
        if (data != null) {
            if (method == "POST") {
                if (data.__mpf) {
                    // this is formdata
                    // request.contentType = "multipart/form-data";
                    request.processData = false;
                    request.contentType = false;
                    request.data = data.__mpf;
                } else {
                    request.data = JSON.stringify(data);
                }
            } else {
                request.data = $.param(data);
            }
            
        }

        // if (opts.no_cache) {
        //     request.headers = request.headers || {};
        //     request.headers['X-No-Cache'] = (Math.random() + "").slice(2, 100) + Date.now();
        //     request.headers['Cache-Control'] = 'no-cache';
        //     request.headers.Pragma = 'no-cache';
        // }

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
                        resp.network_error = true;
                    } else if (status === 'abort') {
                        resp.error = 'Request aborted';
                        resp.error_code = 420;
                        resp.network_error = true;
                    } else if (status === 'parsererror') {
                        resp.error = 'Request got jumbled-up';
                        resp.network_error = true;
                    } else if (xhr.status == 400) {
                        resp.error = "bad request";
                        resp.network_error = true;
                    } else if (xhr.status == 401) {
                        resp.error = "Unauthorized";
                    } else if (xhr.status == 403) {
                        resp.error = "Forbidden";
                    } else if (xhr.status == 404) {
                        resp.error = "page not found";
                        resp.network_error = true;
                    } else if (xhr.status == 408) {
                        resp.error = "request timed out";
                        resp.network_error = true;
                    } else if (xhr.status == 429) {
                        resp.error = "server busy";
                        resp.network_error = true;
                    } else if (xhr.status == 500) {
                        resp.error = "Internal Server Error";
                        resp.network_error = true;
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




