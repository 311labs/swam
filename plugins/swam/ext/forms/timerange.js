SWAM.Form.Builder.timerange = function (fc, form_info) {
    // Create base time range input
    fc.icon = "bi bi-clock-history";
    SWAM.Form.Builder.text(fc, form_info);
    fc.$el.addClass("dropdown");
    fc.$input.attr("readonly", true).addClass("form-control form-control-daterange")

    // Add dropdown attributes to the wrapper
    fc.$wrap.attr("data-bs-toggle", "dropdown")
        .attr("aria-expanded", false)
        .attr("data-bs-auto-close", "outside");

    // Create dropdown menu
    var $menu = $("<div />").addClass("dropdown-menu dropdown-menu-end shadow p-3")
        .attr("aria-labelledby", fc.did)
        .appendTo(fc.$el);

    // Create form inside dropdown menu
    var $dropdownForm = $("<form style='min-width: 300px;' />").appendTo($menu);

    // Form dirty states to handle dropdown closing automatically
    let isStartDirty = false;
    let isEndDirty = false;

    // Handle dropdown closing, set input value to selected time range
    fc.$wrap.on('hidden.bs.dropdown', function (e) {
        const $form = $(e.target).siblings(".dropdown-menu").find("form");
        const data = SWAM.Form.getData($form);

        isStartDirty = false;
        isEndDirty = false;
        fc.$input.val(`${data.start} - ${data.end}`);
    });

    // Generate time array 00:00 - 23:45 in 15 minute intervals of option objects
    function generateTimeArray() {
      const intervals = [0, 15, 30, 45];

      return Array.from({ length: 24 }, (_, hour) => hour).flatMap(hour =>
        intervals.map(minute => {
          const formattedHour = String(hour).padStart(2, '0');
          const formattedMinute = String(minute).padStart(2, '0');
          const timeString = `${formattedHour}:${formattedMinute}`;

          return {
            value: timeString,
            label: timeString
          };
        })
      );
    }

    // Create form with start and end time dropdowns
    SWAM.Form.build([{
        type: "select",
        name: "start",
        label: "start",
        options: generateTimeArray()
    }, {
        type: "select",
        name: "end",
        label: "end",
        options: generateTimeArray()
    }], form_info.defaults, form_info.model, {$form: $dropdownForm});

    // Check if both inputs are dirty, if so, close the dropdown and reset dirty states
    function onInputsDirtyHandler() {
        if (isStartDirty && isEndDirty) {
            // toggle the dropdown to hide
            fc.$wrap.dropdown('toggle');

            isStartDirty = false;
            isEndDirty = false;
        }
    }

    // Set end time options to disabled if before start time
    function filterOptionsBeforeTime($select, time) {
        // make all times before the selected time disabled
        if (fc.multi_days) return;
        $select.find("option").each(function (i, option) {
            const $option = $(option);
            const optionTime = $option.val();
            const isBeforeTime = optionTime < time;
            $option.prop("disabled", isBeforeTime);
        });
    }

    // after each change, set dirty to true
    const $start = $dropdownForm.find("select[name=start]");
    const $end = $dropdownForm.find("select[name=end]");
    $end.options = filterOptionsBeforeTime($end, $start.val());

    // start change handler
    $start.on("change", function (e) {
        isStartDirty = true;

        // set end time options to disabled if before start time
        $end.options = filterOptionsBeforeTime($end, $start.val());

        // if current end time is before start time or option is disabled, set end time to start time
        const start_time = $start.val();
        if ($end.val() < start_time || $end.find("option:selected").prop("disabled")) {
            let times = start_time.split(":");
            let ehour = parseInt(times[0])+1;
            if (ehour >= 24) {
                if (fc.multi_days) {
                    ehour = ehour - 24;
                } else {
                    ehour -= 1;
                }
            }
            $end.val(`${ehour.toString().padStart(2,'0')}:${times[1]}`);            
            // set dirty to false so it doesn't close the dropdown, give user a chance to change it
            isEndDirty = false;
        }

        onInputsDirtyHandler();
    });

    $end.on("change", function (e) {
        isEndDirty = true;

        onInputsDirtyHandler();
    });

    return fc;
}

SWAM.Views.ListFilters = SWAM.Views.ListFilters.extend({

    on_fb_action_input_change: function(evt) {
        if (evt.start && evt.end) {
            this.on_daterange_picker(evt);
        } else if (evt.date) {
            this.on_datepicker(evt);
        } else {
           this.on_input_change(evt.name, evt.value, evt);
        }
    },

    toRangeString: function(dt) {
        // having issues with the picker and dates, doing manual
        return dt.toISOString().split('T')[0];
    },

    on_daterange_picker: function(evt) {
        this.options.list.collection.params["dr_field"] = evt.name;
        this.options.list.collection.params["dr_start"] = this.toRangeString(evt.start);
        this.options.list.collection.params["dr_end"] = this.toRangeString(evt.end);
        this.options.list.collection.params["dr_offset"] = new Date().getTimezoneOffset();
        this.options.list.collection.fetch();
    },

    on_datepicker: function(evt) {
        this.options.list.collection.params["dr_field"] = evt.name;
        this.options.list.collection.params["dr_start"] = this.toRangeString(evt.date);
        this.options.list.collection.params["dr_end"] = this.toRangeString(evt.date);
        this.options.list.collection.params["dr_offset"] = new Date().getTimezoneOffset();
        this.options.list.collection.fetch();
    },

    on_filter_daterange: function(filter, dlg) {
        if (dlg.options.view && dlg.options.view.date_fields) {
            this.on_daterange_picker(dlg.options.view.date_fields[filter.name]);
            dlg.dismiss();
        } else {
            SWAM.Dialog.warning("No Dates Selected!");
        }
    },

    on_timerange_picker: function(evt) {
        this.options.list.collection.params["tr_start"] = evt.start;
        this.options.list.collection.params["tr_end"] = evt.end;
        this.options.list.collection.fetch();
    },

    on_filter_timerange: function(filter, dlg, data) {
        if(data.start && data.end) {
            this.on_timerange_picker({
                start: data.start,
                end: data.end,
            });
            dlg.dismiss();
        } else {
            SWAM.Dialog.warning("No Times Selected!");
        }
    },

    on_prefilter_timerange: function(filter, defaults) {
        if (this.options.list.collection.params["tr_start"]) {
            defaults.timerange = `${this.options.list.collection.params["tr_start"]} - ${this.options.list.collection.params["tr_end"]}`;
            defaults.start = this.options.list.collection.params["tr_start"];
            defaults.end = this.options.list.collection.params["tr_end"];
        }
    },

    on_prefilter_daterange: function(filter, defaults) {
        if (this.options.list.collection.params["dr_start"]) {
            defaults[filter.name] = `${this.options.list.collection.params["dr_start"]} - ${this.options.list.collection.params["dr_end"]}`;
        }
    },

    on_remove_filter_timerange: function(filter, id) {
        this.removeParams(["tr_start", "tr_end"]);
    },

    on_remove_filter_daterange: function(filter, id) {
        this.removeParams(["dr_field", "dr_start", "dr_end", "dr_offset"]);
    },

    on_unknown_filter_tr_start: function(key, value) {
        var tr_filter = _.findWhere(this.options.filters, {type:"timerange"});
        if (tr_filter) {
            var val = value + " - " + this.options.list.collection.params.tr_end;
            this.addFilterTag(tr_filter.name, val, tr_filter);
        }
    },

    on_unknown_filter_dr_start: function(key, value) {
        var dr_filter = _.findWhere(this.options.filters, {type:"daterange"});
        if (dr_filter) {
            var val = value + " - " + this.options.list.collection.params.dr_end;
            this.addFilterTag(dr_filter.name, val, dr_filter);
        }
    },
});
