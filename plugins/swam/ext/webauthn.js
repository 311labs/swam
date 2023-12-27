window.WEBAUTHN = {
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

    register: function(callback) {
        let data = {
            rp_id: "localhost",
            rp_name: app.options.title + " Local",
            authenticator: "platform"
        };
        SWAM.Rest.POST("/api/account/passkeys/register/begin", data, function(resp, state) {
            if (resp.status) {
                options = resp.publicKey;
                options.challenge = WEBAUTHN.base64ToArrayBuffer(options.challenge);
                options.user.id = WEBAUTHN.base64ToArrayBuffer(options.user.id);
                console.log(options);
                navigator.credentials
                    .create({publicKey:options})
                    .then((newCredential) => {
                        console.log("----");
                        console.log(newCredential.response);
                        WEBAUTHN._registerEnd({
                            credentials: {
                                id: newCredential.id,
                                rawId: WEBAUTHN.arrayBufferToBase64(newCredential.rawId),
                                type: newCredential.type,
                                response: {
                                    attestationObject: WEBAUTHN.arrayBufferToBase64(newCredential.response.attestationObject),
                                    clientDataJSON: WEBAUTHN.arrayBufferToBase64(newCredential.response.clientDataJSON)
                                }
                            }
                        }, callback);
                    });
            }
            
        });
    },

    _registerEnd: function(credentials, callback) {
        console.log(credentials);
        SWAM.Rest.POST("/api/account/passkeys/register/end", credentials, callback); 
    }

}