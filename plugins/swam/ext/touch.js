
SWAM.TouchExtension = {
    touch_options: {
        swipe_velocity: 0.5,
        swipe_left_trigger: -100,
        swipe_right_trigger: 100,
        swipe_up_trigger: -120,
        swipe_down_trigger: 120,
        intent_threshold: 40,
        tap_threshold: 10,
        tap_timeout: 250,
        fastTap: false, // this does not work if looking for double_tap event
    },

    last_tap_time: null,
    touch_dir_intent: 0,
    touch_delta_y: 0,
    touch_delta_x: 0,
    touch_start_y: 0,
    touch_start_x: 0,

    setTouchOptions: function(options) {
        this.options = _.extend({}, this.options, this.touch_options, options);
        if (_.isUndefined(this.options.intent_left_threshold)) {
            this.options.intent_left_threshold = this.options.intent_threshold * -1;
        }
        if (_.isUndefined(this.options.intent_right_threshold)) {
            this.options.intent_right_threshold = this.options.intent_threshold;
        }
        if (_.isUndefined(this.options.intent_up_threshold)) {
            this.options.intent_up_threshold = this.options.intent_threshold * -1;
        }
        if (_.isUndefined(this.options.intent_down_threshold)) {
            this.options.intent_down_threshold = this.options.intent_threshold;
        }
    },

    enableTouch: function(selector, options) {
        touch_events = {};
        selector = selector || "";
        if (navigator.supports_touch) {
            touch_events["touchstart " + selector] = "on_touch_start";
            touch_events["touchmove " + selector] = "on_touch_move";
            touch_events["touchend " + selector] = "on_touch_end";
        } else {
            touch_events["mousedown " + selector] = "on_touch_start_mouse";
        }
        this.events = this.events || {};
        this.events = _.extend({}, this.events, touch_events);
    },

    // LEFT RIGHT
    isIntentLeft: function() {
        return this.touch_delta_x < this.options.intent_left_threshold;
    },
    isIntentRight: function() {
        return this.touch_delta_x > this.options.intent_right_threshold;
    },
    isIntentLeftRight: function() {
        return this.isIntentLeft() || this.isIntentRight();
    },
    // UP DOWN
    isIntentUp: function() {
        return this.touch_delta_y < this.options.intent_up_threshold;
    },
    isIntentDown: function() {
        return this.touch_delta_y > this.options.intent_down_threshold;
    },
    isIntentUpDown: function() {
        return this.isIntentUp() || this.isIntentDown();
    },

    on_touch_intent: function() {
        // intents
        // 0 = none
        // 1 = up
        // 2 = down
        // 3 = left
        // 4 = right
        if ((this.touch_dir_intent == 1) && (!this.isIntentUp())) {
            // we are no longer going up.. clear intent
            this.touch_last_intent = 1;
            this.touch_dir_intent = 0;
        } else if ((this.touch_dir_intent == 2) && (!this.isIntentDown())) {
            this.touch_last_intent = 2;
            this.touch_dir_intent = 0;
        } else if ((this.touch_dir_intent == 3) && (!this.isIntentLeft())) {
            this.touch_last_intent = 3;
            this.touch_dir_intent = 0;
        } else if ((this.touch_dir_intent == 4) && (!this.isIntentRight())) {
            this.touch_last_intent = 4;
            this.touch_dir_intent = 0;
        } else if (this.touch_dir_intent != 0) {
            // do nothing because our intent is still true
            return;
        }

        // discover intent
        // TODO this is flawed by not taking in intent_thresholds
        if (Math.abs(this.touch_delta_x) > Math.abs(this.touch_delta_y)) {
            // potential intent is left/right
            if (this.isIntentLeft()) {
                this.touch_dir_intent = 3;
            } else if (this.isIntentRight()) {
                this.touch_dir_intent = 4;
            }
        } else {
            if (this.isIntentUp()) {
                this.touch_dir_intent = 1;
            } else if (this.isIntentDown()) {
                this.touch_dir_intent = 2;
            }
        }
        if (this.touch_last_intent && this.touch_dir_intent) {
            this.on_swipe_invalidate();
        }
    },

    getTouch: function(evt, touches) {
        if (!touches) {
            if (!evt.originalEvent) { return null;}
            touches = evt.originalEvent.touches;
        }

        if (touches && touches.length) {
            touches = touches[0];

        } else {
            touches = evt.originalEvent;
        }
        return touches;
    },

    on_touch_start_mouse: function(evt) {
        if (!this._bind_end_mouse) {
            this._bind_end_mouse = _.bind(this.on_touch_end_mouse, this);
            this._bind_move_mouse = _.bind(this.on_touch_move, this)
        }

        $(window).on("mouseup", this._bind_end_mouse);
        this.on_touch_start(evt);
        $(window).on("mousemove", this._bind_move_mouse);
    },

    on_touch_end_mouse: function(evt) {
        $(window).off("mouseup", this._bind_end_mouse);
        $(window).off("mousemove", this._bind_move_mouse);
        this.on_touch_end(evt);
    },

    on_touch_start: function(evt, touches) {
        touches = this.getTouch(evt, touches);
        if (!touches) {
            return;
        }

        if (!this.options || !this.options.tap_timeout) {
            this.setTouchOptions();
        }
        this.on_swipe_begin(evt, touches);

        this.touch_start_y = touches.screenY;
        this.touch_start_x = touches.screenX;

        this.touch_dir_intent = 0;
        this.touch_last_intent = 0;
        this.touch_delta_y = 0;
        this.touch_delta_x = 0;
        this.touch_start_time = Date.now();

        if (this.last_tap_time && ((this.touch_start_time - this.last_tap_time) > this.options.tap_timeout)) {
            this.last_tap_time = 0;
        }
    },

    on_touch_move: function(evt, touches) {
        touches = this.getTouch(evt, touches);
        if (!touches) {
            return;
        }

        this.touch_delta_y = touches.screenY - this.touch_start_y;
        this.touch_delta_x = touches.screenX - this.touch_start_x;

        this.on_touch_intent();

        if (this.touch_dir_intent) {
            if (this.touch_dir_intent > 2) {
                this.on_swiping_lr(evt);
            } else {
                this.on_swiping_ud(evt);
            }
        } else if (this.touch_last_intent) {
            if (this.touch_last_intent > 2) {
                this.on_swiping_lr(evt);
            } else {
                this.on_swiping_ud(evt);
            }
        }
    },

    isInTapThreshold: function() {
        return (Math.abs(this.touch_delta_y < this.options.tap_threshold) && (Math.abs(this.touch_delta_x) < this.options.tap_threshold));
    },

    isSwipeUpTrigger: function() {
        return ((this.touch_dir_intent == 1)&&(this.touch_delta_y <= this.options.swipe_up_trigger));
    },

    isSwipeDownTrigger: function() {
        return ((this.touch_dir_intent == 2)&&(this.touch_delta_y >= this.options.swipe_down_trigger));
    },

    isSwipeLeftTrigger: function() {
        return ((this.touch_dir_intent == 3)&&(this.touch_delta_x <= this.options.swipe_left_trigger));
    },

    isSwipeRightTrigger: function() {
        return ((this.touch_dir_intent == 4)&&(this.touch_delta_x >= this.options.swipe_right_trigger));
    },

    on_touch_end: function(evt, touches) {
        this.touch_end_time = Date.now();
        this.touch_delta_time = this.touch_end_time - this.touch_start_time;

        if (!touches && evt.originalEvent) {
            touches = evt.originalEvent.changedTouches;
            if (touches && touches.length) {
                touches = touches[0];
            } else {
                touches = evt.originalEvent;
            }
        } else if (touches && touches.length) {
            touches = touches[0];
        }

        this.touch_delta_y = touches.screenY - this.touch_start_y;
        this.touch_delta_x = touches.screenX - this.touch_start_x;
        this.on_touch_intent();

        this.touch_x_velocity = (this.touch_delta_x/this.touch_delta_time);
        this.touch_y_velocity = (this.touch_delta_y/this.touch_delta_time);
        // console.log("velocity x: " + this.touch_x_velocity + " y: " + this.touch_y_velocity);

        if (Math.abs(this.touch_x_velocity) > this.options.swipe_velocity) {
            if (this.touch_x_velocity > 0) {
                this.on_swipe_right();
            } else {
                this.on_swipe_left();
            }
        } else if (Math.abs(this.touch_y_velocity) > this.options.swipe_velocity) {
            if (this.touch_y_velocity > 0) {
                this.on_swipe_down();
            } else {
                this.on_swipe_up();
            }
        } else if (this.touch_dir_intent) {
            if (this.isSwipeUpTrigger()) {
                this.on_swipe_up()
            } else if (this.isSwipeDownTrigger()) {
                this.on_swipe_down()
            } else if (this.isSwipeLeftTrigger()) {
                this.on_swipe_left()
            } else if (this.isSwipeRightTrigger()) {
                this.on_swipe_right()
            } else {
                this.on_swipe_none();
            }
        } else if ((this.touch_delta_time < this.options.tap_timeout)&&(this.isInTapThreshold())) {
            // console.log("tap time: " + this.touch_delta_time);
            // this is a tap
            if (this.last_tap_time) {
                this.last_tap_time = 0;
                this.on_double_tap();
            } else {
                this.last_tap_time = this.touch_end_time;
                this.on_tap_validate(evt);
            }
        }
    },

    on_tap_validate: function(evt) {
        var tap_time = this.last_tap_time;
        // console.log("tap: " + tap_time);
        var self = this;

        if (this.options.fastTap) {
            this.on_tap(evt);
        } else {
            setTimeout(function() {
                if (tap_time == self.last_tap_time) {
                    self.on_tap(evt);
                }
            }, 250);
        }
    },

    // called when tap fired
    on_tap: function(evt) {

    },

    // called on a double tap
    on_double_tap: function(evt) {

    },

    on_swipe_begin: function(evt) {

    },

    // similar to touchmove but only on up/down direction
    on_swiping_ud: function(evt) {

    },

    // similar to touchmove but only on left/right direction
    on_swiping_lr: function(evt) {

    },

    // called when touchend and swipe left criteria met
    on_swipe_up: function(evt) {

    },

    // called when touchend and swipe left criteria met
    on_swipe_down: function(evt) {

    },

    // called when touchend and swipe left criteria met
    on_swipe_left: function(evt) {

    },

    // called when touchend and swipe right criteria met
    on_swipe_right: function(evt) {

    },

    on_swipe_none: function(evt) {

    },


    // called when the swipe direction is no longer valid by a new direction
    on_swipe_invalidate: function(evt) {

    }
};

