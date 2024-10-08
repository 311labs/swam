
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

    UPLOAD: function(url, file, callback, onprogress) {
        // onprogress = function(event) {
        //     if (event.lengthComputable) {
        //         const percentComplete = (event.loaded / event.total) * 100;
        //         $('#progress-bar').val(percentComplete);
        //         $('#status').text(`Upload progress: ${percentComplete.toFixed(2)}%`);
        //     }
        // }
        $.ajax({
            url: url,
            type: 'PUT',
            data: file,
            processData: false,
            contentType: file.type,
            xhr: function() {
                const xhr = new XMLHttpRequest();
                if (onprogress) {
                    xhr.upload.onprogress = onprogress;
                }
                return xhr;
            },
            success: function(xhr, status) {
                callback(true, xhr, status);
            },
            error: function(xhr, status) {
                callback(false, xhr, status);
            }
        });
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
            } else {
                request.setRequestHeader('Authorization', SWAM.Rest.credentials.kind + " " + SWAM.Rest.credentials.token);
            }
        } else if (SWAM.Rest.session_key) {
            request.setRequestHeader('Authorization', SWAM.Rest.session_key);
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
        if (window.app && window.app.options.send_buid) {
            if (data == null) data = {};
            data.__buid__ = window.getBrowserUID();
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
            if (!request.headers) request.headers = {};
            if (SWAM.Rest.credentials.kind == "JWT") {
                // TODO check expires field of JWT
                request.headers['Authorization'] = "Bearer " + SWAM.Rest.credentials.access;
            } else if (SWAM.Rest.credentials.kind == "authtoken") {
                request.headers['Authorization'] = "authtoken " + SWAM.Rest.credentials.token;
            } else {
                request.headers['Authorization'] = SWAM.Rest.credentials.kind + " " + SWAM.Rest.credentials.token;
            }
        } else if (SWAM.Rest.session_key) {
            if (!request.headers) request.headers = {};
            request.headers['Authorization'] = `session ${SWAM.Rest.session_key}`;
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
            if (this.emulator && this.emulator.enabled && this.emulator.recv) {
                this.on_emulate_recv(callback, xhr, status);
            } else if (xhr.status == 200) {
                if (callback) this.on_success(callback, xhr, status);
            } else {
                if (callback) this.on_error(callback, xhr, status);
            }
        }.bind(this);

        if (this.debug_delay_ms) {
            console.warn("DEBUG MODE: delaying rest request by " + this.debug_delay_ms + " ms");
            setTimeout(function() {
                $.ajax(request);
            }, this.debug_delay_ms);
            return;
        }

        return $.ajax(request);
    },

    on_success: function(callback, xhr, status) {
        var j = xhr.responseJSON;
        if (!j) {
            j = {error:"nothing returned"}; // avoid empty responses
            j.content_type = xhr.getResponseHeader("content-type") || "";
            j.content = xhr.responseText;
        }
        callback(j, xhr.status, xhr);
    },

    on_error: function(callback, xhr, status) {
        var resp = xhr.responseJSON;
        if (resp && resp.error) {
            callback(resp, xhr.status, xhr);
            return;
        } else if (!resp) {
            resp = {status:false, error_code: xhr.status, error: status, when:Date.now()};
        }
        
        if (status === 'timeout') {
            resp.error = 'Request timed-out';
            resp.error_code = 522;
            resp.network_error = true;
        } else if (status === 'abort') {
            resp.error = 'Request aborted';
            resp.error_code = 420;
        } else if (status === 'parsererror') {
            resp.error = 'Request got jumbled-up';
            resp.network_error = true;
        } else if (xhr.status == 0) {
            resp.error = "could not connect to host, (verify network)";
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
        callback(resp, xhr.status, xhr);
    },

    on_emulate_recv: function(callback, xhr, status) {
        this.emulator.counter -= 1;
        if (this.emulator.counter > 0) {
            if (this.emulator.recv == 1) {
                setTimeout(function(){
                    var resp = {status:false};
                    resp.error = "request timed-out";
                    resp.error_code = 522;
                    resp.network_error = true;
                    if (callback) callback(resp, "timeout");
                }.bind(this), 5000);
                
            } else {
                setTimeout(function(){
                    if (xhr.status == 200) {
                        if (callback) this.on_success(callback, xhr, status);
                    } else {
                        if (callback) this.on_error(callback, xhr, status);
                    }
                }.bind(this), this.emulator.recv);
            }
            return;
        } else if (this.emulator.counter == 0) {
            this.disableEmulator();
        }

        if (xhr.status == 200) {
            if (callback) this.on_success(callback, xhr, status);
        } else {
            if (callback) this.on_error(callback, xhr, status);
        }
    },

    emulateDelay: function(opts) {
        // send: ms delaying sending 
        // recv: ms delaying recv
        this.emulator = _.extend(this.emulator || {}, {send:0, recv:5000, enabled:true, counter:1000}, opts);
        app.setProperty("rest_emulator", this.emulator);
        SWAM.toast("Network Emulator", `delay send: ${this.emulator.send} ms<br>recv:${this.emulator.recv}<br>counter: ${this.emulator.counter}`, "success", 5000);
    },

    emulateTimeout: function(opts) {
        // send: ms delaying sending 
        // recv: ms delaying recv
        let counter = 1;
        if (this.emulator.counter) counter += this.emulator.counter;
        this.emulator = _.extend(this.emulator || {}, {send:0, recv:1, enabled:true, counter:counter}, opts);
        app.setProperty("rest_emulator", this.emulator);
        SWAM.toast("Network Emulator", `network timeout counter: ${this.emulator.counter}`, "success", 2000);
    },

    disableEmulator: function() {
        if (this.emulator && this.emulator.enabled) {
            this.emulator = {send:0, recv:0, enabled:false, counter:0};
            app.setProperty("rest_emulator", this.emulator);
            SWAM.toast("Network Emulator", "disabled", "danger", 2000);
        }
    },

    loadEmulator: function() {
        if (!this.emulator) {
            this.emulator = app.getObject("rest_emulator", {});
            SWAM.toast("Network Emulator", "loaded", "success", 2000);
        }
    }
}




