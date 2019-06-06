const Handlebars = require("handlebars");
const config = require('config');
const fs = require('fs');
const path = require('path');

const emailTemplateDirectory = config.get('workflow-send-email.templateDirectory');


class EmailTemplate {

    constructor(templateName) {

        // Load in the named template and compile it.
        const src = fs.readFileSync(path.join(emailTemplateDirectory, `${templateName}.hbs`), 'utf8');

        if(!src) {
            throw new Error(`Unable to find email template named '${templateName}'`);
        }

        this._template = Handlebars.compile(src);
    }

    template(locals) {
        return this._template(locals);
    }
}

module.exports = EmailTemplate;