const Model = require('./Model');
const FormDefinition = require('./FormDefinition');
const ViewDefinition = require('./ViewDefinition');
const LayoutDefinition = require('./LayoutDefinition');
const ValidationDefinition = require('./ValidationDefinition');

const pick = require('lodash/pick');


function uppercaseCamelToLowercaseDashed(name) {

    return name.replace(/^(.)/g, (a) => a.toLowerCase()).replace(/([A-Z])/g, (a) => '-' + a.toLowerCase());
}


function lowerCaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function nameToListingAccessor(name) {
    return `${lowerCaseFirstLetter(name)}s`;
}


class InstanceDefinition {

    constructor(taskDef, defaultName, enumResolver, mappingResolver) {

        this.name = taskDef.name || defaultName;
        this.model = taskDef.model;
        this.options = taskDef.options || {};

        if(taskDef.model) {
            this.model = new Model(taskDef.model, enumResolver);
        }

        const forms = {};
        if(taskDef.forms) {
            taskDef.forms.forEach(f => {
                forms[f.form.toLowerCase()] = new FormDefinition(f, enumResolver, mappingResolver);
            });
        }

        const views = {};
        if(taskDef.views) {
            taskDef.views.forEach(v => {
                views[v.view.toLowerCase()] = new ViewDefinition(v, enumResolver, mappingResolver);
            });
        }

        const layouts = {};
        if(taskDef.layouts) {
            taskDef.layouts.forEach(l => {
                layouts[l.layout.toLowerCase()] = new LayoutDefinition(l.layout, l, enumResolver, mappingResolver);
            });
        }

        const validations = {};
        if(taskDef.validations) {
            taskDef.validations.forEach(v => {
                validations[v.name.toLowerCase()] = new ValidationDefinition(v, enumResolver, mappingResolver);
            });
        }

        this.forms = forms;
        this.views = views;
        this.layouts = layouts;
        this.validations = validations;

        Object.values(forms).forEach(form => form._resolveValidations(validations));

        this.urlName = uppercaseCamelToLowercaseDashed(this.name);
    }

    get urlPath() {
        if(this.options && this.options.urlPath) {
            return this.options.urlPath;
        }
        if(this._cachedUrlPath) {
            return this._cachedUrlPath;
        }
        this._cachedUrlPath = uppercaseCamelToLowercaseDashed(this.name);
        return this._cachedUrlPath;
    }

    primaryTasksFromTaskList(taskList) {

        if(!taskList || !taskList.length) {
            return null;
        }

        // Filter all the tasks which have a formKey associated with them.
        const filteredTaskList = taskList.filter(t => !!t.formKey);
        if(!filteredTaskList.length) {
            return null;
        }

        return filteredTaskList.filter(t => {
            return this.formDefinitionForTask(t) !== null;
        });
    }

    formDefinitionForTask(task) {
        return task.formKey ? this.formDefinitionForFormName(task.formKey.replace(/^custom:/i, "").toLowerCase()) : null;
    }

    formDefinitionForFormName(formName) {
        return formName ? this.forms[formName] : null;
    }

    filterObjectToStateVariables(object) {
        return pick(object, this.model.stateFields().map(f => f.field));
    }


    viewDefinitionForViewName(viewName) {
        return viewName ? this.views[viewName] : null;
    }

    layoutDefinitionForLayoutName(layoutName) {
        return layoutName ? this.layouts[layoutName] : null;
    }


    validationListForValidationNameSet(validationNames) {

        if(!validationNames || !validationNames.length) {
            return null;
        }

        const allEntries = [];

        validationNames.map(v => this.validations[v]).forEach(set => {

            if(!set || !set.entries) {
                return;
            }

            set.entries.forEach(entry => {
                if(allEntries.indexOf(entry) === -1) {
                    allEntries.push(entry);
                }
            });
        });

        return allEntries;
    }

    get listingAccessor() {
        if(this.options && this.options.listingAccessor) {
            return this.options.listingAccessor;
        }

        if(this._cachedListingAccessor) {
            return this._cachedListingAccessor;
        }
        this._cachedListingAccessor = nameToListingAccessor(this.name);
        return this._cachedListingAccessor;

    }

}

module.exports = InstanceDefinition;