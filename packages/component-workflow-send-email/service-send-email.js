const nodemailer = require('nodemailer');
const logger = require('@pubsweet/logger');
const config = require('config');
const AWS = require('aws-sdk');


class EmailSendService {

    constructor() {
        const sesConfig = config.get('SES');
        if(!sesConfig) {
            logger.error(`Configuration does not have SES defined, this is required for sending emails.`);
        }

        const ses = new AWS.SES({
            apiVersion: '2010-12-01',
            accessKeyId: sesConfig.accessKey,
            secretAccessKey: sesConfig.secretKey,
            region: sesConfig.region
        });

        this.transporter = nodemailer.createTransport({SES:ses});

        const emailDefaults = config.get('workflow-send-email');
        if(emailDefaults) {
            this.defaultFrom = emailDefaults.from;
            this.defaultPrefix = emailDefaults.prefix || "";
            this.restrictedSendToAddress = emailDefaults.restrictedEmailAddresses || null;
        } else {
            this.defaultPrefix = "";
            this.restrictedSendToAddress = null;
        }
    }

    sendEmail(opts) {
        const newOpts = Object.assign({}, opts);

        if(!newOpts.from && this.defaultFrom) {
            newOpts.from = this.defaultFrom;
        }

        if(newOpts.subject) {
            newOpts.subject = this.defaultPrefix + newOpts.subject;
        }

        if(newOpts.to && this.restrictedSendToAddress) {

            if(typeof(newOpts.to) === "string") {
                newOpts.to = [newOpts.to];
            }

            const restrictedTo = this.restrictedSendToAddress;
            const isUnrestrictedEmail = function(email) {
                const e = email.toLowerCase();
                for(let i = 0; i < restrictedTo.length; i++) {

                    const restriction = restrictedTo[i];
                    const emailParts = e.trim().match(/^.+\<(.*)\>$/);

                    if(restriction instanceof RegExp) {

                        return emailParts ? emailParts[1].match(restriction) : !!e.match(restriction);

                    } else if(typeof restriction === "string") {

                        return emailParts ? emailParts[1] === restriction : e === restriction;
                    }
                }
                return false;
            };

            newOpts.to = newOpts.to.filter(email => isUnrestrictedEmail(email));
            if(!newOpts.to.length) {
                return Promise.reject(new Error("Unable to send email, as all addresses being sent to are not allowed."));
            }
        }

        return this.transporter.sendMail(newOpts);
    }
}

module.exports = EmailSendService;
