SWAM.Views.ChatItem = SWAM.Views.ListItem.extend({
    template: "swam.ext.chat.item",
    classes: "chat-item",

    defaults: {
        kind: "chat",
        message_field: "text",
        bubble_kinds: {
            "status": "status",
            "upload": "upload",
            "note": "chat",
            "chat": "chat"
        }
    },

    get_message: function() {
        return this.model.get(this.options.message_field);
    },

    on_pre_render: function() {
        let by = this.model.get("by");
        let kind = this.model.get("kind");
        if (this.options.kind) {
            this.options.kind = this.options.bubble_kinds[kind] || "status";
        }

        if (by.id == app.me.id) {
            this.options.add_classes = "sent";
        } else {
            this.options.add_classes = "received";
        }
        this.updateAttributes();
    }

});

SWAM.Views.ChatView = SWAM.View.extend({
    classes: "swam-chat d-flex flex-column h-100",
    template: "swam.ext.chat.notes",

    events: {
        "keydown textarea": "on_submit"
    },

    on_init: function() {
        this.addChild("chatlist", new SWAM.Views.List({
            tagName:"ol",
            classes: "swam-chat-list mt-auto",
            collection: this.options.collection,
            Collection: this.options.Collection,
            ItemView: SWAM.Views.ChatItem
        }));
        if (this.options.item_options) {
            this.getChild("chatlist").options.item_options = this.options.item_options;
        }
        this.collection = this.getChild("chatlist").collection;
        this.collection.params.size = 400;
        this.collection.params.sort = "id";
        this.collection.on("loading:end", this.scrollToEnd, this);
    },

    clearMessage: function() {
        this.$el.find("#message").val("");
    },

    showBusy: function() {
        this.busy_dlg = SWAM.Dialog.showLoading({
           parent:this.$el
        });
    },

    hideBusy: function() {
        if (this.busy_dlg) {
            this.busy_dlg.removeFromDOM();
            this.busy_dlg = null;
        }
    },

    on_submit: function(evt) {
        if (evt.keyCode == 13) {
            evt.stopPropagation();
            if (!evt.shiftKey) {
                let $input = this.$el.find("#message");
                let value = $input.val();
                var ievt = {
                    name:"message", 
                    value:value,
                    event:evt
                };
                this.trigger("new_msg", ievt);
                return false;
            }
            return true;
        }
    },

    scrollToEnd: function() {
        let $el = this.$el.find("#chatlist");
        if ($el.length > 0) {
            $el[0].scrollTop = $el[0].scrollHeight;
        }
    },

    on_post_render: function() {
        setTimeout(this.scrollToEnd.bind(this), 300);
    },

    on_action_send_msg: function(evt) {
        evt.stopPropagation();
        let $input = this.$el.find("#message");
        let value = $input.val();
        var ievt = {
            name:"message", 
            value:value,
            event:evt
        };
        this.trigger("new_msg", ievt);
    },

    on_action_reload: function() {
        this.collection.fetch();
    }
});
