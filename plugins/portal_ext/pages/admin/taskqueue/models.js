SWAM.Models.TaskModel = SWAM.Model.extend({
    defaults: {
        url:"/rpc/taskqueue/task"
    },
});

SWAM.Collections.TaskCollection = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.TaskModel
    }
});

