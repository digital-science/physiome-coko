const { ServiceSendEmail, EmailTemplate } = require('component-workflow-send-email');
const config = require('config');

const { models } = require('component-workflow-model/model');
const { Submission } = models;

const BaseUrl = config.get('pubsweet-client.baseUrl');
const EmailSignature = config.get('workflow-send-email.signature');


class TaskSendEmail {

    constructor(emailTemplateName, logger) {

        this.emailTemplate = new EmailTemplate(emailTemplateName);
        this.logger = logger;
    }

    configure(client, externalTaskName) {
        client.subscribe(externalTaskName, async ({ task, taskService }) => {
            return this.processTask(task, taskService);
        });
    }

    skipTaskWithoutSendingEmail() {
        return false;
    }

    async resolveSubmission(submissionId) {

        return Submission.find(submissionId, ['submitter']);
    }

    async formatEmailSubject(submission) {

        return '-';
    }

    async submissionToRecipient(submission) {
        return submission.submitter;
    }

    async submissionToEmailData(submission) {

        const link = `${BaseUrl}/details/${encodeURI(submission.id)}`;
        const subject = await this.formatEmailSubject(submission);
        const recipient = await this.submissionToRecipient(submission);

        return {
            subject,
            recipientName: recipient.displayName,
            recipientEmail: recipient.email,
            data: {
                submission,
                user: recipient,
                link,
                signature:EmailSignature
            }
        };
    }

    sendEmail(subject, recipientName, recipientEmail, data, submission) {

        const text = this.emailTemplate.template(data);
        const to = `${recipientName} <${recipientEmail}>`;

        const opts = {
            subject,
            to,
            text
        };

        return ServiceSendEmail.sendEmail(opts);
    }

    async processTask(task, taskService) {

        const logger = this.logger;
        logger.debug(`process task is starting`);

        if(this.skipTaskWithoutSendingEmail()) {
            logger.debug(`process task has been skipped without sending email, completing external task`);
            return taskService.complete(task);
        }

        const submissionId = task.businessKey;
        if(!submissionId) {
            logger.error(`failed to process email for submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return;
        }

        const submission = await this.resolveSubmission(submissionId);
        if(!submission) {
            logger.warn(`unable to find submission instance for id (${submissionId})`);
            return;
        }

        const {subject, recipientName, recipientEmail, data} = await this.submissionToEmailData(submission);

        return this.sendEmail(subject, recipientName, recipientEmail, data, submission).then(result => {

            logger.debug(`process task has successfully finished, completing external task`);
            return taskService.complete(task);

        }).catch(err => {

            logger.error(`process task has failed due to: ${err.toString()}`);
        });
    }
}


module.exports = TaskSendEmail;