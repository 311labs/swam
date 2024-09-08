_.extend(TOAST_STATUS, {success:1, danger:2, warning:3, info:4});


SWAM.toast = function(title, message, status, timeout, close_on_click) {
	if (timeout === undefined) timeout = 2000;
	setTimeout(function(){
		Toast.create({title:title, message:message, status: TOAST_STATUS[status], timeout:timeout, close_on_click:close_on_click==true})
	}, 100);
}

SWAM.Ext.BS = {
	enableBS: function() {
		this.enableClipboard();
		this.enablePops();
		this.enableTips();
	},

	enableTips: function() {
		this.clearVisibleToolTips();
		var tooltipTriggerList = [].slice.call(this.$el[0].querySelectorAll('[data-bs-toggle="tooltip"]'))
		this._bs_tips = tooltipTriggerList.map(function (tooltipTriggerEl) {
			console.log("NEW TOOLTIP??");
		  return new bootstrap.Tooltip(tooltipTriggerEl);
		});
	},

	on_dom_removing: function() {
		this.clearVisibleToolTips();
	},

	clearVisibleToolTips: function() {
		console.log("clearVisibleToolTips");
		$('[role="tooltip"]').remove(); // hack to remvoe lingering tooltips
		if (!this._bs_tips) return;
		_.each(this._bs_tips, function(tip){
			tip.dispose();
		});
	},

	enableClipboard: function() {
		var list = [].slice.call(this.$el[0].querySelectorAll('button.btn-clipboard'))
		this._bs_popovers = list.map(function (sel) {
			if (!sel.attributes["data-clipboard-target"]) {
				var clipb = new ClipboardJS(sel, {
				    target: function(trigger) {
				        // get first element with text?
				        var el = trigger.nextElementSibling;
				        while (el) {
				            if (el.textContent) return el;
				            el = el.nextElementSibling;
				        }
				        return trigger;
				    }
				});
			} else {
				var clipb = new ClipboardJS(sel);
			}

			clipb.on("success", this.on_clipboard_success.bind(this));
		  return clipb;
		}.bind(this));

	},

	on_clipboard_success: function(evt) {
		let has = evt.trigger.getAttribute("data-bs-toggle");
		if (has == "tooltip") {
			evt.trigger.setAttribute("data-bs-original-title", "Copied!");
			var tooltip = bootstrap.Tooltip.getInstance(evt.trigger);
			if (tooltip) tooltip.show();
			$(evt.trigger).one("mouseout", function(){
				evt.trigger.setAttribute("data-bs-original-title", "Copy to clipboard");
			});
			setTimeout(function(){ if (tooltip) tooltip.hide(); }, 2000);
		} else {
			let old_text = evt.trigger.innerText;
			evt.trigger.innerText = "COPIED";
			setTimeout(function(){ evt.trigger.innerText = old_text }, 2000);
		}
	},

	enablePops: function() {
		var list = [].slice.call(this.$el[0].querySelectorAll('[data-bs-toggle="popover"]'))
		this._bs_popovers = list.map(function (sel) {
		  return new bootstrap.Popover(sel);
		});
	},

	destroyBS: function() {
		if (this._bs_clipboard) {
			this._bs_clipboard.destroy();
			this._bs_clipboard = null;
		}
		_.each(this._bs_tips, function(tip){
			tip.dispose();
		});

		_.each(this._bs_popovers, function(item){
			item.dispose();
		});
	},

	on_post_render: function() {
	    this.enableBS();
	},

	on_dom_removed: function() {
	    SWAM.View.prototype.on_dom_removed.call(this);
	    this.destroyBS();
	}

}