SWAM.Chat = {
    BUBBLE_KINDS: {
        "status": "status",
        "history": "status",
        "upload": "upload",
        "shipping": "status",
        "note": "chat",
        "email": "chat",
        "chat": "chat",
        "message": "chat",
        "private": "private"
    },
    BUBBLE_ICONS: {
        "upload": "upload",
        "accessed": "unlock-fill",
        "history": "info-circle",
        "status": "info-circle",
        "shipping": "box2-fill",
        "task": "check-square"
    },

    EDITABLE: {
        "private":true,
        "note":true,
        "message":true,
        "chat":true
    }
}


SWAM.Views.ChatItem = SWAM.Views.ListItem.extend({
    template: "swam.ext.chat.item",
    classes: "chat-item",

    defaults: {
        kind: "chat",
        message_field: "text",
        by_field: "by",
        bubble_kinds: SWAM.Chat.BUBBLE_KINDS,
        bubble_icons: SWAM.Chat.BUBBLE_ICONS,
        by_display_field: "by.username",
        by_initials_field: "by.initials",
        by_avatar_field: "by.avatar",
        action_id_field: "media.id",
        media_item_field: "media",
        kind_field: "kind",
        default_avatar: "/plugins/media/empty_avatar.jpg",
        system_avatar: "/plugins/media/logos/logo_sm.png"
    },

    icon: function() {
        return this.options.bubble_icons[this.model.get(this.options.kind_field)];
    },

    get_message: function() {
        return this.model.get(this.options.message_field);
    },

    get_media: function() {
        if (this.get_kind() == "upload") {
            return this.model.get(this.options.media_item_field);
        }
        return null;
    },

    get_action_id: function() {
        return this.model.get(this.options.action_id_field);
    },

    get_kind: function() {
        let kind = this.model.get(this.options.kind_field);
        return this.options.bubble_kinds[kind] || kind;
    },

    get_avatar: function() {
        let src = this.model.get(this.options.by_avatar_field);
        if (!src) {
            if (this.get_by_displayname() == "system") {
                src = this.options.system_avatar;
            } else {
                src = this.options.default_avatar;
            }
        }
        return src;
    },

    get_by_displayname: function() {
        let name = this.model.get(this.options.by_display_field);
        if (!name) return "system";
        return name;
    },

    get_by_initials: function() {
        let name = this.model.get(this.options.by_initials_field);
        if (!name) {
            name = this.get_by_displayname();
            if (name) name = name.initials();
        }
        return name;
    },

    on_action_edit: function(evt, id) {
        SWAM.Dialog.editModel(this.model, {
            title: "Edit Message",
            fields: [
                {
                    name: this.options.message_field,
                    type: "textarea"
                }
            ]
        });
    },

    on_action_delete: function(evt, id) {
        SWAM.Dialog.confirm({
            title: "Delete Message",
            message: "Are you sure you want to delete this message?",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.lower() == "yes") {
                    this.model.destroy(function(model, resp){
                        if (resp.status) {
                            this.options.list.reload();
                        }
                    }.bind(this));
                }
            }.bind(this)
        });
    },

    can_edit: function() {
        if (!this.options.chat.options.allow_editing) return false;
        if ((this._can_edit === undefined) && (SWAM.Chat.EDITABLE[this.model.get("kind")])) {
            this._can_edit = (this.model.get("by.id") == app.me.id);
        }
        return this._can_edit;
    },

    on_pre_render: function() {
        let by = this.model.get(this.options.by_field);
        let kind = this.model.get(this.options.kind_field);
        if (kind) {
            if (this.options.bubble_kinds) {
                this.options.kind = this.options.bubble_kinds[kind] || "status";
            }
        }

        if (by && (by.id == app.me.id)) {
            this.options.add_classes = `sent chat-kind-${kind}`;
        } else {
            this.options.add_classes = `received chat-kind-${kind}`;
        }
        this.options.data_attrs = {chatid: this.model.id};
        this.updateAttributes();
    }
});

SWAM.Views.ChatView = SWAM.View.extend({
    classes: "swam-chat d-flex flex-column h-100 position-relative",
    template: "swam.ext.chat.chat",

    defaults: {
        title: "Chat",
        buttons: [
            {
                icon: "reload",
                action: "reload"
            }
        ],
        add_classes: "swam-chat-theme-slack",
        allow_editing: false,
        allow_private: false,
        private_perm: "sys.view_private_group_chat",
        ItemView: SWAM.Views.ChatItem
    },

    events: {
        "keydown textarea": "on_submit"
    },

    on_init: function() {
        if (this.options.add_classes == "swam-chat-theme-slack") {
            this.options.item_template = "swam.ext.chat.slack";
        }
        this.addChild("chatlist", new SWAM.Views.List({
            tagName:"ol",
            classes: "swam-chat-list mt-auto",
            collection: this.options.collection,
            Collection: this.options.Collection,
            item_template: this.options.item_template,
            empty_html: "<div class='text-center p-3 text-muted'>No Messages</div>",
            ItemView: this.options.ItemView
        }));

        this.options.item_options = _.extend({chat: this}, this.options.item_options);
        this.getChild("chatlist").options.item_options = this.options.item_options;
        this.collection = this.getChild("chatlist").collection;
        this.collection.params.size = 400;
        this.collection.params.sort = "id";
        this.collection.on("loading:begin", this.on_loading_start, this);
        this.collection.on("loading:end", this.on_loading_end, this);
    },

    on_loading_start: function() {
        this.showBusy();
    },

    on_loading_end: function() {
        this.hideBusy();
        this.scrollToEnd();
    },

    clearMessage: function() {
        this.$el.find("#message").val("");
    },

    showBusy: function() {
        if (this.busy_dlg) return;
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

    getChatItem: function(id) {
        return this.getChild("chatlist").get(id);
    },

    canSendPrivate: function() {
        if (!this.options.allow_private) return false;
        return app.me.hasPerm(this.options.private_perm);
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
            private: false,
            event:evt
        };
        this.trigger("new_msg", ievt);
    },

    on_action_send_private: function(evt) {
        evt.stopPropagation();
        let $input = this.$el.find("#message");
        let value = $input.val();
        var ievt = {
            name:"message", 
            value:value,
            private: true,
            event:evt
        };
        this.trigger("new_msg", ievt);
    },

    on_action_reload: function() {
        this.collection.fetch();
    },

    on_tab_focus: function() {
        this.collection.fetchIfStale();
    }
});
