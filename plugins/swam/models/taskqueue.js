SWAM.Models.Task= SWAM.Model.extend({
    defaults: {
        url:"/api/taskqueue/task"
    },

    isScheduled: function() {
        var state = this.get("state");
        return state == 0;
    },

    isStarted: function() {
        var state = this.get("state");
        return state == 1;
    },

    canCancel: function() {
        return this.isScheduled() || this.isStarted();
    }


});

SWAM.Collections.Task = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.Task
    }
});

