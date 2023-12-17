
SWAM.Models.WikiPage = SWAM.Model.extend({
    defaults: {
        url: "/api/wiki/page",
    },

    getUrl: function() {
        var url = this.options.url;
        if (this.id) {
            if (url.endsWith("/")) return url + this.id;
            return url + "/" + this.id;
        } else if (!this.attributes.path) {
            return url;
        }
        return `/api/wiki/path/${this.attributes.path}`
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
        this._request = SWAM.Rest.GET(`/api/wiki/path/${this.attributes.path}`, this.params, function(response, status) {
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