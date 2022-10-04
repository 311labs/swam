SWAM.Models.Task= SWAM.Model.extend({
    defaults: {
        url:"/rpc/taskqueue/task"
    },
});

SWAM.Collections.Task = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.Task
    }
});

