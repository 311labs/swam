
(function($) {
	var imageholder = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjQ0LjQ2MDkzNzUiIHk9IjEwMCIgc3R5bGU9ImZpbGw6I0FBQUFBQTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB0O2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPnVwbG9hZCB0aHVtYm5haWw8L3RleHQ+PC9nPjwvc3ZnPg==";
	var file_to_img = function(file, $img) {
		var oFReader = new FileReader();
		oFReader.readAsDataURL(file);
		oFReader.onload = function (oFREvent) {
			$img[0].src = oFREvent.target.result;
		};
	};

	$.fn.DropZone = function() {
		var $zone = $(this);
		if (!window.FileReader) {
			$zone.html("Your browser does not support file drop");
			return this;
		}

		$zone.addClass("dropzone");

		$(document).off('drop dragover');
		$(document).on('drop dragover', function (e) {
		     e.preventDefault();
		});

		$zone.on('dragenter', function(evt){
			evt.stopPropagation();
			evt.preventDefault();
			$zone.addClass("dragover")
		});

		$zone.on('dragover', function(evt){
			evt.stopPropagation();
			evt.preventDefault();
		});

		$zone.on('dragleave', function(evt){
			evt.stopPropagation();
			evt.preventDefault();
			$zone.removeClass("dragover");
		});

		$zone.on('drop', function(evt){
			if(evt.originalEvent.dataTransfer){
			    if(evt.originalEvent.dataTransfer.files.length) {
			        evt.preventDefault();
			        evt.stopPropagation();
			        /*UPLOAD FILES HERE*/
			        $zone.trigger("filedrop", evt.originalEvent.dataTransfer.files);
			        // callback(evt.originalEvent.dataTransfer.files);
			    }   
			}
			$zone.removeClass("dragover");
		});
		return this;
	};

	$.fn.InputImage = function(options) {
		var opts = $.extend({}, options);

		var $file = $(this);
		// prevent binding to the wrong input type or the same input twice
		if (!$file.is('input[type=file]') || $file.parent('.inputimage-wrapper').length) {
			return;
		}
		$file.attr("accept", "image/*;capture=camera");

		var $wrapper = $file.wrap('<div class="inputimage-wrapper" />').parent();
		$wrapper.addClass($file.attr("class"));
		var $box = $('<span class="inputimage"  />')
			.prependTo($wrapper);

		var image_src = $file.data("image");
		var $preview = $("<img />").addClass("preview");
		$preview.appendTo($box);
		if (image_src) {
			$preview.attr("src", image_src);
		} else {
			$preview.attr("src", imageholder);
		}

		var label = $file.data("label");
		if (!label) {
			label = "choose image";
		}
		$box.append($("<div class='input-label' />").text(label));

		$file.change(function(evt){
			if (evt.target && evt.target.files) {
				if (evt.target.files.length) {
					var show_preview = $file.data("preview");
					$file.trigger("image", [evt.target.files[0]]);
					if (show_preview && (show_preview == "no")) {
						return true;
					}
					file_to_img(evt.target.files[0], $preview);
				}
			}
		});

		return this;
	};

	$.fn.InputFile = function(opts) {
		var options = $.extend({
			invisible: true
		}, opts);

		this.each(function() {
			// create 'custom' replacement and bind it to the element it replaces
			var $el = $(this);
			var $file = $el;
			var $wrapper = null;
			if (!$el.is('input')) {
				if ($el.hasClass("inputfile-wrapper")) {
					return;
				}
				$file = $("<input type='file' name='file'>");
				$el.append($file);
				$wrapper = $el;
				$wrapper.addClass("inputfile-wrapper");
			} else if (!$file.is('input[type=file]') || $file.parent('.inputfile-wrapper').length) {
				return;
			}
			$file.attr('size', '100').hide();
			$file.css({
				opacity: 0,
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				width: "100%",
				height: "100%",
				cursor: "pointer",
			});

			var do_preview = $file.data("role") === "preview";
			var $img = null;
			if (do_preview) {
				$img = $file.parent().find("img");
				if ($img.data("role") != "preview") {
					$img = null;
				}
			}
			if ($wrapper == null) {
				$wrapper = $file.wrap('<div class="inputfile-wrapper" />').parent();
			}
			$wrapper.css({
				"position": "relative",
				"overflow": "hidden"
			});

			var $box = $('<span class="inputfile"  />')
				.prependTo($wrapper);
			var placeholder = $file.attr("placeholder");
			if (_.isUndefined(placeholder)) {
				placeholder = $file.data("placeholder");
			}

			if (options.invisible) {
				$box.hide();
			}

			var icon = $file.data("icon");
			if (_.isUndefined(placeholder)) {
				placeholder = "No file selected...";
			}

			if (icon) {
				placeholder = "<i class='fa fa-" + icon + "'></i> " + placeholder;
			}
			var $feedback = $('<a href="#" class="inputfile-feedback" tabindex="9999" />')
				.html(placeholder)
				.appendTo($box);
			$feedback.click(function() {
				$file.click();
				return false;
			});

			var label = $file.data("label");
			if (label) {
				var $label = $('<span class="inputfile-label" />')
					.text(label)
					.click(function() {
						// IE lets you 'click' the file input directly
						// other browsers protect it more - hence the click-steal code further down
						$file.click();
						return false;
					})
					.appendTo($box);
			}

			var $button = $('<span class="inputfile-opener" />')
				.text("Browse")
				.click(function() {
					// IE lets you 'click' the file input directly
					// other browsers protect it more - hence the click-steal code further down
					$file.click();
					return false;
				})
				.appendTo($box);

			var nohover = function() {
				// includes misc fixes to prevent 'chasing' the mouse
				$feedback.removeClass("hovered");
				$file
					.hide()
					.css({'left': -1000, 'top': -1000});
				$wrapper.scrollLeft(0);
				$wrapper.scrollTop(0);
				$box.removeClass('hover');
			};

			$file.change(function(evt){
				var fileName;
				var fileExt;
				var name;
				if (evt.target && evt.target.files) {
					var files = evt.target.files;
					var i;
					for (i=0; i < files.length; i++) {
						var f = files[i];
						//get file extension
						fileExt = 'inputfile-ext-' + f.name.split('.').pop().toLowerCase();
						var megabytes = f.size / 1048576.0;
						//fancy file name
						name = f.name;
						fileName = f.name + ' <span class="inputfile-info">' + megabytes.toFixed(2) + 'MB</span>';
					}

					if (do_preview) {
						if (!$img) {
							$img = $("<img />");
							$img.appendTo($wrapper.parent());
						}
						var oFReader = new FileReader();
						oFReader.readAsDataURL(files[0]);

						oFReader.onload = function (oFREvent) {
							$img[0].src = oFREvent.target.result;
						};
					}
				} else {
					//simple file name
					name = $file.val().split(/\\/).pop();
					fileName = $file.val().split(/\\/).pop();
					//get file extension
					fileExt = 'inputfile-ext-' + fileName.split('.').pop().toLowerCase();
				}

				if (fileName) {
					$feedback
					.html(fileName)
					.removeClass($feedback.data('fileExt') || '')
					.addClass(fileExt)
					.data('fileExt', fileExt)
					.addClass('populated');

					if (name) {
						$file.data('name', name.split('.')[0]);
					}

					$button.text('Change');
				} else {
					$feedback
						.text(placeholder)
						.removeClass($feedback.data('fileExt') || '')
						.data('fileExt', null)
						.removeClass('populated');
					$button.text('Browse');
				}
				if ($el != $file) {
					$el.trigger("change", evt);
				}
				setTimeout(nohover, 1);
			}).click(function(){
				$feedback.focus();
			});

			// some browsers protect the file input
			// this code keeps it under the mouse to steal clicks
			$wrapper.mousemove(function(evt){
				$feedback.addClass("hovered");
				var box_offset = $box.parent().offset();
				var h = $box.parent().innerHeight();
				var w = $box.parent().innerWidth();

				var left = 0;
				var top = 0;
				if (evt.pageX >= box_offset.left && evt.pageX <= (box_offset.left+w)
				&& evt.pageY >= box_offset.top && evt.pageY <= (box_offset.top+h)) {
					var wrapper_offset = $wrapper.offset();
					$box.addClass('hover');
					left = evt.pageX - wrapper_offset.left - ($file.outerWidth()-20); //position right side 20px right of cursor X
					top = evt.pageY - wrapper_offset.top - ($file.outerHeight()/2);
				} else if (evt.pageX >= $button.offset().left + $button.width()) {
					nohover();
					return;
				}
				$file
					.show()
					.css({'left': left, 'top': top});
				$wrapper.scrollLeft(0);
				$wrapper.scrollTop(0);
			}).mouseleave(nohover);

			// catch return and spacebar presses when 'real' element is focused
			// via tabbing through a form
			var presskey = function(e){
				var i = e.keyCode;
				if (e.ctrlKey || e.altKey || e.metaKey) {
					return true;
				} else if (i === 13 || i === 32) {
					$button.click();
				} else {
					return true;
				}
				e.preventDefault();
				return false;
			};

			$feedback.focusin(function() {
				$(document).bind('keydown', presskey);
			}).focusout(function() {
				$(document).unbind('keydown', presskey);
			});
		});

		return this;
	};
})(jQuery);
