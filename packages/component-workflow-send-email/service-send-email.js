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
            const isRestrictedEmail = function(email) {
                const e = email.toLowerCase();
                for(let i = 0; i < restrictedTo.length; i++) {
                    if(e.indexOf(restrictedTo[i]) !== -1) {
                        return true;
                    }
                }
                return false;
            };

            newOpts.to = newOpts.to.filter(email => isRestrictedEmail(email));
            if(!newOpts.to.length) {
                return Promise.reject(new Error("Unable to send email, as all addresses being sent to are not allowed."));
            }
        }

        return this.transporter.sendMail(newOpts);
    }
}

module.exports = EmailSendService;
