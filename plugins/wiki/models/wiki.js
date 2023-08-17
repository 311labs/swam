
SWAM.Models.WikiPage = SWAM.Model.extend({
    defaults: {
        url_path: "/rpc/wiki/page",
        url: function(model) {
            let url = model.options.url_path;
            if (model.id) {
                if (url.endsWith("/")) return url + model.id;
                return url + "/" + model.id;
            } else if (!model.attributes.path) {
                return url;
            }
            return `/rpc/wiki/path/${model.attributes.path}`
        }
    },



    fetchByPath: function(callback, opts) {
        if ((opts == undefined) && (window.isDict(callback))) {
            opts = callback;
            callback = undefined;
        }
        this.abort();
        if (opts && opts.if_stale) {
            if (!this.isStale()) {
                if (callback) callback(this, {status:true, cached:true});
                return;
            }
        }
        this.trigger("fetch:started", this);
        this._request = SWAM.Rest.GET(`/rpc/wiki/path/${this.attributes.path}`, this.params, function(response, status) {
            this._request = null;
            this._on_fetched(response, status);
            if (callback) callback(this, response);
        }.bind(this), opts);
    },
}, {
    EDIT_FORM: [
        {
            name:"title",
            label:"Title",
            columns: 6,
            placeholder: "Enter Page Title"
        },
        {
            name:"slug",
            label:"Slug",
            columns: 6,
            placeholder: "Enter Page Slug"
        },
        {
            name:"body",
            label:"Text",
            columns: 12,
            markdown: true,
            type: "textarea",
            placeholder: "Enter Markdown"
        }
    ],
});

SWAM.Collections.WikiPage = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.WikiPage
    }
});