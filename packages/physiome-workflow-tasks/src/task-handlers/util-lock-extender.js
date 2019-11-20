const logger = require("workflow-utils/logger-with-prefix")('PhysiomeWorkflowTasks/TaskLockExtender');


class TaskLockExtender {

    constructor(taskService, task, interval=20, extension=30) {

        this.taskService = taskService;
        this.task = task;
        this.interval = interval * 1000;
        this.extension = extension * 1000;
        this.extendPromise = null;
    }

    start() {

        if(this.timer) {
            clearTimeout(this.timer);
        }

        this._startTimer();
    }

    async stop() {
        if(this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = null;

        if(this.extendPromise) {
            await this.extendPromise;
        }
    }

    async extend(time) {
        return this.taskService.extendLock(this.task, time * 1000);
    }

    async _extend() {

        const extendTime = this.extension;

        const p = this.taskService.extendLock(this.task, extendTime).then(() => {
            logger.debug(`did successfully extendLock for ${extendTime}ms`);
        }).catch(e => {
            logger.error(`taskService extendLock failed with error: ${e.toString()}`);
        }).finally(() => {

            this.extendPromise = null;
        });

        this.extendPromise = p;
        return p;
    }

    _startTimer() {

        this.timer = setTimeout(async () => {

            await this._extend();

            this.timer = null;
            this._startTimer();

        }, this.interval);
    }

}


module.exports = TaskLockExtender;