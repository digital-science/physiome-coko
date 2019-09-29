const WorkflowUpdatableModel = require('./workflow-updatable-model');



class WorkflowInstance extends WorkflowUpdatableModel {


    static get instanceDefinition() {
        return null;
    }


    static get graphQLModelImplements() {
        return ['Object', 'WorkflowObject'];
    }

    static get graphQLModelBaseTypes() {
        return [...super.graphQLModelBaseTypes(), `tasks: [Task]`];
    }


    static graphQLTypeDefinition() {

        // Include the complete task endpoints for workflow instances.

        const baseTypeDef = super.graphQLTypeDefinition();

        const implementationName = this.implementationName;
        const modelName = this.graphQLModelName;
        const model = this.modelDefinition;

        const stateFields = model.stateFields();
        const stateInputTypeName = `${modelName}StateInput`;

        const mutationStatements = [];


        if(stateFields && stateFields.length) {
            mutationStatements.push(`completeTaskFor${implementationName}(id:ID!, taskId:ID!, form:String!, outcome:String!, state:${stateInputTypeName}) : CompleteTaskOutcome`);
        } else {
            mutationStatements.push(`completeTaskFor${implementationName}(id:ID!, taskId:ID!, form:String!, outcome:String!) : CompleteTaskOutcome`);
        }

        return baseTypeDef + (mutationStatements.length ?  `\nextend type Mutation {\n\t${mutationStatements.join('\n\t')}\n}` + '\n\n' : "");
    }

    static graphQLListingFilterParameters(listingFilterFields, listingFilterInputTypeName, listingSortableFields, listingSortingInputTypeName) {

        const { parameters, additionalStatements = [] } = super.graphQLListingFilterParameters(listingFilterFields, listingFilterInputTypeName, listingSortableFields, listingSortingInputTypeName);


        // Include any additional requests to modify the listing parameters implemented via model extensions.

        const workflowDescription = this.workflowDescription;
        const instanceDefinition = this.instanceDefinition;
        const extensions = this.modelExtensions;

        if(extensions && extensions.length) {
            extensions.forEach(ext => {
                if(ext.modifyListingParameters) {
                    const statement = ext.modifyListingParameters(parameters, instanceDefinition, workflowDescription);
                    if(statement && statement.length) {
                        additionalStatements.push(statement);
                    }
                }
            });
        }

        return {
            parameters,
            additionalStatements
        };
    }


}

module.exports = WorkflowInstance;