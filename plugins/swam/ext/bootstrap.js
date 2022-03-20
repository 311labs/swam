_.extend(TOAST_STATUS, {success:1, danger:2, warning:3, info:4});

SWAM.Ext.BS = {
	enableBS: function() {
		this.enableClipboard();
		this.enablePops();
		this.enableTips();
	},

	enableTips: function() {
		var tooltipTriggerList = [].slice.call(this.$el[0].querySelectorAll('[data-bs-toggle="tooltip"]'))
		this._bs_tips = tooltipTriggerList.map(function (tooltipTriggerEl) {
		  return new bootstrap.Tooltip(tooltipTriggerEl);
		});
	},

	enableClipboard: function() {
		this._bs_clipboard = new ClipboardJS("#" + this.id + " .btn-clipboard", {
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
		this._bs_clipboard.on("success", function(evt){
	    	console.log("success");
	    	console.log(evt);
	    	evt.trigger.setAttribute("data-bs-original-title", "Copied!");
	    	var tooltip = bootstrap.Tooltip.getInstance(evt.trigger);
	    	if (tooltip) tooltip.show();
	    	$(evt.trigger).one("mouseout", function(){
	    		evt.trigger.setAttribute("data-bs-original-title", "Copy to clipboard");
	    	});
	    	setTimeout(function(){ tooltip.hide(); }, 2000);

		}.bind(this));
	},

	enablePops: function() {
		var list = [].slice.call(this.$el[0].querySelectorAll('[data-bs-toggle="popover"]'))
		this._bs_popovers = list.map(function (sel) {
		  return new bootstrap.Popover(sel);
		});
	},

	destroyBS: function() {
		this._bs_clipboard.destroy();

		_.each(this._bs_tips, function(tip){
			tip.dispose();
		});

		_.each(this._bs_popovers, function(item){
			item.dispose();
		});
	},



}