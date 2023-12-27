window.WebAuthnClient = {
    options: {
        authenticator: "platform",
        is_inited: false
    },

    init: function() {
        if (this.options.is_inited) return;
        this.options.is_inited = true;
        this.options.rp_id = location.host;
        this.options.rp_name = app.options.title;

        if (this.options.rp_id.startsWith("localhost")) {
            this.options.rp_id = "localhost";
            this.options.rp_name += " (Localhost)";
        }
    },

    register: function(callback) {
        this.init();
        let data = {
            rp_id: this.options.rp_id,
            rp_name: this.options.rp_name,
            authenticator: this.options.platform
        };
        SWAM.Rest.POST("/api/account/passkeys/register/begin", data, function(resp, state) {
            if (resp.status) {
                options = resp.publicKey;
                options.challenge = WebAuthnClient.base64ToArrayBuffer(options.challenge);
                options.user.id = WebAuthnClient.base64ToArrayBuffer(options.user.id);
                let create_args = {publicKey:options};
                if (resp.excludeCredentials) {
                    resp.excludeCredentials.forEach(cred => {
                        cred.id = WebAuthnClient.base64ToArrayBuffer(cred.id);
                    });
                    create_args.excludeCredentials = resp.excludeCredentials;
                }
                console.log(options);
                navigator.credentials
                    .create(create_args)
                    .then((newCredential) => {
                        console.log("----");
                        console.log(newCredential.response);
                        WebAuthnClient._registerEnd({
                            credentials: {
                                id: newCredential.id,
                                rawId: WebAuthnClient.arrayBufferToBase64(newCredential.rawId),
                                type: newCredential.type,
                                response: {
                                    attestationObject: WebAuthnClient.arrayBufferToBase64(newCredential.response.attestationObject),
                                    clientDataJSON: WebAuthnClient.arrayBufferToBase64(newCredential.response.clientDataJSON)
                                }
                            },
                        }, callback);
                    });
            }
            
        });
    },

    _registerEnd: function(credentials, callback) {
        console.log(credentials);
        SWAM.Rest.POST("/api/account/passkeys/register/end", credentials, callback); 
    },

    isConditionalMediationAvailable: function(callback) {
        this.init();
        if (window.PublicKeyCredential &&  
            PublicKeyCredential.isConditionalMediationAvailable) {  
          // Check if conditional mediation is available.  
          PublicKeyCredential.isConditionalMediationAvailable().then((isCMA) => {
             callback(isCMA);
          });  
        } else {
            callback(false);
        }
    },

    authenticate: function(callback, username) {
        this.init();
        WebAuthnClient.getPublicKeyRequestOptions(function(resp, options){
            if (resp.status) {
                console.log(options);
                navigator.credentials
                    .get({publicKey:options, mediation:"conditional"})
                    .then((assertion) => {
                        WebAuthnClient.sendSignedChallenge(assertion, callback);
                    });
            } else {
                callback(resp, false);
            }
        }, username)
    },

    getPublicKeyRequestOptions: function(callback, username) {
        this.init();
        let data = {
            rp_id: this.options.rp_id,
            rp_name: this.options.rp_name,
            authenticator: this.options.platform
        };
        if (username) data.username = username;
        SWAM.Rest.POST("/api/account/passkeys/auth/begin", data, function(resp, state) {
            if (resp.status) {
                options = resp.publicKey;
                options.challenge = WebAuthnClient.base64ToArrayBuffer(options.challenge);
                // Convert the credential IDs
                options.allowCredentials.forEach(cred => {
                    cred.id = WebAuthnClient.base64ToArrayBuffer(cred.id);
                });
                callback(resp, options);
            } else {
                callback(resp, {});
            }
        });
    },

    sendSignedChallenge: function(assertion, callback) {
        let auth_data = {
            id: assertion.id,
            rawId: WebAuthnClient.arrayBufferToBase64(assertion.rawId),
            type: assertion.type,
            response: {
                authenticatorData: WebAuthnClient.arrayBufferToBase64(assertion.response.authenticatorData),
                clientDataJSON: WebAuthnClient.arrayBufferToBase64(assertion.response.clientDataJSON),
                signature: WebAuthnClient.arrayBufferToBase64(assertion.response.signature),
                userHandler: WebAuthnClient.arrayBufferToBase64(assertion.response.userHandler)
            }
        }

        SWAM.Rest.POST("/api/account/passkeys/auth/confirm", {credential:auth_data}, callback);
    },

    base64ToArrayBuffer: function(base64) {
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        const binaryString = window.atob(base64);
        const length = binaryString.length;
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    },

    arrayBufferToBase64: function(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },

}