
SWAM.PubSubClient = SWAM.Object.extend({
    defaults: {
        url: "/ws/events?",
        subscriptions: ["user", "group", "broadcast", "terminal"],
        heartbeat_msg: "--heartbeat--",
        heartbeat_freq: 60000,
        heartbeat_allowed_missed: 3,
        retry_max_interval: 30000,
        retry_interval: 2000,
        retry_decay: 1.1,
        ignore_errors: true,
        use_app_credentials: true
    },

    initialize: function(opts){
        // this variable tells us to keep open the connection
        this.init_options(opts);
        this.keep_open = false;
        this.last_beat = null;
        this.timer = null;
        this.session_key = null;
        this.attempts = 1;
        this.missed_heartbeats = 0;
        this.heartbeat_interval = null;
        this.subscriptions = [];
        this._bound_send_hb = this.send_heartbeat.bind(this);
        this._bound_retry = this.on_retry.bind(this);
    },

    auth: function(credentials) {
        if (!credentials) {
            console.warn("PubSubClient.auth called with no credentials!");
            return;
        }
        if (credentials.kind.lower() == "jwt") {
            this.auth_msg = {action:"auth", kind:"jwt", token:credentials.access};
        } else {
            this.auth_msg = {action:"auth", kind:credentials.kind, token:credentials.token};
        }
        this.sendMessage(this.auth_msg);
    },

    resubscribe: function() {
        var msg = {action:"resubscribe", channels:[]};
        _.each(this.subscriptions, function(ssub){
            msg.channels.push($.parseJSON(evt.ssub))
        })
        this.sendMessage(msg);
    },

    subscribe: function(channel, pk) {
        var msg = {action:"subscribe", channel:channel};
        if (pk != undefined) msg.pk = pk;
        this.subscriptions.push(JSON.stringify(msg));
        this.sendMessage(msg);
    },

    unsubscribe: function(channel, pk) {
        var msg = {action:"unsubscribe", channel:channel};
        if (pk != undefined) msg.pk = pk;
        var raw = JSON.stringify(msg);
        if (this.subscriptions.indexOf(raw) >=0) this.subscriptions.remove();
        this.sendMessage(msg);
    },

    publish: function(msg, channel, pk) {
        this.sendMessage({channel:channel, pk:pk, message:msg, action:"publish"});
    },

    save: function(data, echo) {
        var msg = {action:"save", id:String.Random(8), data:data};
        if (echo) msg.echo = true;
        this.sendMessage(msg);
        return msg.id;
    },

    log: function(msg) {
        if (this.options.debug) {
            console.log(msg);
        }
    },

    error: function(err) {
        console.warn(err);
    },

    warn: function(err) {
        console.warn(err);
    },

    normalizeURL: function(url) {
        if (!url.startsWith("ws")) {
            // assume no host or anything
            proto = (window.location.protocol == "https:") ? "wss://" : "ws://";
            path = url.startsWith('/') ? url : "/" + url;
            var host = window.location.host;
            if (window.app && window.app.options.api_url) {
                var api_url = app.options.api_url;
                proto = (api_url.slice(0, api_url.indexOf(":"))  == "https") ? "wss://" : "ws://";
                host = api_url.slice(api_url.indexOf(":")+3);
                if (host.indexOf("/") > 0) {
                    host = host.slice(0, host.indexOf("/"));
                }
            }
            return proto + host + path;
        }
        return url;
    },

    buildParams: function(obj) {
      var str = [];
      for(var p in obj) {
        if (obj.hasOwnProperty(p) && obj[p]) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      }
      return str.join("&");
    },


    connect: function() {
        if (!this.ws_url) this.ws_url = this.normalizeURL(this.options.url);
        try {
            this.log("WS Connecting to " + this.ws_url + " ...");
            this.timer = null;
            this.ws = new WebSocket(this.ws_url);
            this.keep_open = true;
            this.ws.onopen = this.on_open.bind(this);
            this.ws.onmessage = this.on_message.bind(this);
            this.ws.onerror = this.on_error.bind(this);
            this.ws.onclose = this.on_close.bind(this);
        } catch (err) {
            this.error(err);
        }
    },

    close: function() {
        if (this.ws) {
            this.keep_open = false;
            try {
                this.ws.close();
            } catch (err) {
                this.error(err);
            }
        }
    },

    restart: function() {
        if (this.ws) {
            try {
                this.ws.close();
            } catch (err) {
                this.error(err);
            }
        }
    },

    send: function(message) {
        if (!this.options.ignore_errors) {
            this.ws.send(message);
        } else {
            try {
                this.ws.send(message);
            } catch(err) {
                this.error(err);
            }
        }
    },

    sendMessage: function(data) {
        this.send(JSON.stringify(data));
    },


    on_open: function() {
        this.log('WS Connected!');
        // new connection, reset attemps counter
        if (this.closed_at) {
            this.dead_time = Date.now() - this.closed_at;
        } else {
            this.dead_time = 0;
        }
        // check last beat time
        if (this.last_beat) {
            this.dead_time = Date.now() - this.last_beat;
        }

        this.connected_at = Date.now();

        if (this.options.use_app_credentials) {
            setTimeout(function(){
                this.auth(SWAM.Rest.credentials);
            }.bind(this), 500);
        } else if (this.options.credentials) {
            setTimeout(function(){
                this.auth(this.options.credentials);
            }.bind(this), 500);
        }

        this.attempts = 1;
        this.is_connected = true;

        this.trigger("connected", this.dead_time);

        // this.deferred.resolve();
        if (this.options.heartbeat_msg && this.heartbeat_interval === null) {
            this.missed_heartbeats = 0;
            this.heartbeat_interval = setInterval(this.send_heartbeat.bind(this), this.options.heartbeat_freq);
        }
    },

    on_message: function(evt) {
        this.last_beat = Date.now();
        if (this.options.heartbeat_msg && evt.data === this.options.heartbeat_msg) {
            // reset the counter for missed heartbeats
            this.log("WS heartbeat");
            this.missed_heartbeats = 0;
        } else {
            if (evt.data.startsWith("{")) {
                var res = $.parseJSON(evt.data);
                this.trigger("message", res);
                console.log("WS server event: " + evt.data);
            } else {
                this.trigger("notice", evt.data);
                this.log("WS server notice: " + evt.data);
            }
        }
    },

    on_close: function() {
        try {
            this.ws.close()
        } catch (err) {
            console.warn(err);
        }

        this.log("WS Connection closed!");
        this.trigger("disconnected");
        this.closed_at = Date.now();
        this.is_connected = false;
        if (!this.timer && this.keep_open) {
            // try to reconnect
            var interval = this.generateInteval(this.attempts);
            this.timer = setTimeout(this._bound_retry, interval);
        }
    },

    on_error: function(evt) {
        this.error("Websocket connection is broken!");
        // this.deferred.reject(new Error(evt));
    },

    on_retry: function() {
        console.log("on_retry");
        if (this.keep_open) {
            this.attempts++;
            this.connect();
        }
    },

    generateInteval: function(k) {
        var timeout = this.options.retry_interval * Math.pow(this.options.retry_decay, k);
        if (timeout > this.options.retry_max_interval) return this.options.retry_max_interval;
        return timeout;
    },

    send_heartbeat: function() {
        try {
            this.missed_heartbeats++;
            if (this.missed_heartbeats > this.options.heartbeat_allowed_missed)
                throw new Error("Too many missed heartbeats.");
            this.ws.send(this.options.heartbeat_msg);
        } catch(e) {
            clearInterval(this.heartbeat_interval);
            this.heartbeat_interval = null;
            this.warn("Closing connection. Reason: " + e.message);
            this.ws.close();
        }
    },
});

