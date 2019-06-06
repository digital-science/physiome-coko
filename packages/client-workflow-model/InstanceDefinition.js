import Model from './Model';
import FormDefinition from './FormDefinition';
import ViewDefinition from './ViewDefinition';

import pick from 'lodash/pick';


function uppercaseCamelToLowercaseDashed(name) {

    return name.replace(/^(.)/g, (a) => a.toLowerCase()).replace(/([A-Z])/g, (a) => '-' + a.toLowerCase());
}


class InstanceDefinition {

    constructor(taskDef, defaultName, enumResolver) {

        this.name = taskDef.name || defaultName;
        this.model = taskDef.model;
        this.options = taskDef.options || {};

        if(taskDef.model) {
            this.model = new Model(taskDef.model, enumResolver);
        }

        const forms = {};
        if(taskDef.forms) {
            taskDef.forms.forEach(f => {
                forms[f.form.toLowerCase()] = new FormDefinition(f, enumResolver);
            });
        }

        const views = {};
        if(taskDef.views) {
            taskDef.views.forEach(v => {
                views[v.view.toLowerCase()] = new ViewDefinition(v, enumResolver);
            });
        }

        this.forms = forms;
        this.views = views;
    }

    get urlPath() {
        if(this.options.urlPath) {
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

}

export default InstanceDefinition;