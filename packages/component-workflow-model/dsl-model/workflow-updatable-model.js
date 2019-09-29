const WorkflowModel = require('./workflow-model');

const GraphQLHelper = require('./graphql-helper');
const _Tab = GraphQLHelper.Tab;




class WorkflowUpdatableModel extends WorkflowModel {

    static get allowsCreate() {
        return !(this.modelDefinition.noCreate === true);
    }

    static get allowsUpdate() {
        return !!this.modelDefinition.input;
    }



    // Return the GraphQL resolvers.
    static graphQLResolvers() {

        const resolvers = super.graphQLResolvers();
        const { Mutation } = resolvers;

        const implementationName = this.implementationName;
        const model = this.modelDefinition;
        const ModelClass = this;


        // Mutations
        // ---
        const mutations = {};

        if(this.allowsCreate) {
            Mutation[`create${implementationName}`] = async function(ctxt, input, context, info) {
                return ModelClass.createMutationResolver(ctxt, input, context, info);
            };
        }

        Mutation[`destroy${implementationName}`] =  async function(ctxt, input, context, info) {
            return ModelClass.destroyMutationEndpoint(ctxt, input, context, info);
        };

        if(this.allowsUpdate) {
            Mutation[`update${implementationName}`] = async function(ctxt, input, context, info) {
                return ModelClass.updateMutationEndpoint(ctxt, input, context, info);
            };
        }


        // Field resolvers
        // ---
        const fieldResolvers = resolvers[implementationName] || {};
        const relationFieldsWithAccessors = model.relationFieldsWithAccessors(this.workflowDescription);

        if(relationFieldsWithAccessors && relationFieldsWithAccessors.length) {

            relationFieldsWithAccessors.filter(e => e.accessors.indexOf("set") !== -1).forEach(e => {

                let niceFieldName = e.field.charAt(0).toUpperCase() + e.field.slice(1);
                const mutationName = `set${implementationName}${niceFieldName}`;

                mutations[mutationName] = async function(ctxt, input, context, info) {
                    return ModelClass.relationAccessorSetMutationEndpoint(ctxt, input, context, info, e);
                };
            });
        }

        resolvers[implementationName] = fieldResolvers;


        return resolvers;
    }


    static async createMutationResolver(ctxt, input, context, info) {


    }

    static async destroyMutationEndpoint(ctxt, input, context, info) {


    }

    static async updateMutationEndpoint(ctxt, input, context, info) {


    }


    static async relationAccessorSetMutationEndpoint(ctxt, input, context, info, element) {

        const {id, linked} = input;
        if(!id) {
            return false;
        }

        const object = await this.find(id);
        if(!object) {
            return false;
        }

        // FIXME: implement ACL checking to ensure this is allowed !!!!

        await object.$relatedQuery(element.field).unrelate();

        if(linked && ((element.array === true && linked.length) || element.array === false)) {

            if(e.type === "File") {

                const linkedWithMetaDataFields = linked.map((l, index) => {
                    const r = {id:l.id, order:index, removed:false};

                    if(l.metaData && l.metaData.removed === true) {
                        r.removed = true;
                    }

                    if (element.fileLabels === true) {
                        if(l.metaData) {
                            r.label = l.metaData.label || null;
                        } else {
                            r.label = null;
                        }
                    }

                    if (element.fileTypes === true) {
                        if(l.metaData) {
                            r.type = l.metaData.type || null;
                        } else {
                            r.type = null;
                        }
                    }

                    return r;
                });

                await object.$relatedQuery(element.field).relate(linkedWithMetaDataFields);

            } else {

                await object.$relatedQuery(element.field).relate(linked);
            }
        }

        return true;
    }




    static graphQLTypeDefinition() {

        const baseTypeDef = super.graphQLTypeDefinition();

        const implementationName = this.implementationName;
        const modelName = this.graphQLModelName;
        const model = this.modelDefinition;

        const stateFields = model.stateFields();
        const relationAccessorFields = model.relationFieldsWithAccessors(this.workflowDescription);

        const modelInputTypeName = `${modelName}Input`;
        const stateInputTypeName = `${modelName}StateInput`;

        const mutationStatements = [];
        const typeStatements = [];


        if(this.allowsCreate) {
            mutationStatements.push(`create${implementationName}: ${modelName}`);
        }

        if(this.allowsUpdate) {
            mutationStatements.push(`update${implementationName}(input:${modelInputTypeName}) : Boolean`);
        }

        if(stateFields && stateFields.length) {

            mutationStatements.push(`completeTaskFor${implementationName}(id:ID!, taskId:ID!, form:String!, outcome:String!, state:${stateInputTypeName}) : CompleteTaskOutcome`);
            mutationStatements.push(`destroy${implementationName}(id:ID, state:${stateInputTypeName}) : Boolean`);

            typeStatements.push(this.graphQLStateInputDefinition());

        } else {

            mutationStatements.push(`completeTaskFor${implementationName}(id:ID!, taskId:ID!, form:String!, outcome:String!) : CompleteTaskOutcome`);
            mutationStatements.push(`destroy${implementationName}(id:ID) : Boolean`);
        }

        if(relationAccessorFields && relationAccessorFields.length) {

            const accessorMutations = relationAccessorFields.map(e => {

                let niceFieldName = e.field.charAt(0).toUpperCase() + e.field.slice(1);

                if(e.accessors.indexOf("set") !== -1) {

                    const linkingType = (e.type === "File") ? "LinkedFileInput" : "ID";

                    if(e.array === true) {
                        return `set${implementationName}${niceFieldName}(id:ID, linked:[${linkingType}]) : Boolean`;
                    }

                    return `set${implementationName}${niceFieldName}(id:ID, linked:${linkingType}) : Boolean`;
                }

                return null;

            }).filter(v => !!v);

            mutationStatements.push.apply(mutationStatements, accessorMutations);
        }

        return baseTypeDef
            + (this.allowsUpdate ? this.graphQLModelInputDefinition() + '\n\n' : "")
            + (mutationStatements.length ?  `\nextend type Mutation {\n\t${mutationStatements.join('\n\t')}\n}` + '\n\n' : "")
            + (typeStatements.length ? typeStatements.join('\n') + '\n\n' : "");
    }


    static graphQLModelInputDefinition() {

        const model = this.modelDefinition;
        const modelInputTypeName = `${this.graphQLModelName}Input`;

        const typeListings = [
            ...(this.graphQLModelInputBaseTypes || []),
            ...GraphQLHelper.gqlTypeListingForFields(model.fields, this.workflowDescription, GraphQLHelper.TypeListingRestriction.Input)
        ];

        return `type ${modelInputTypeName} {\n${typeListings.map(v => '\t' + v).join("\n")}\n}`;
    }


    static graphQLStateInputDefinition() {

        const model = this.modelDefinition;
        const stateInputTypeName = `${this.graphQLModelName}Input`;

        const typeListings = GraphQLHelper.gqlTypeListingForFields(model.fields, this.workflowDescription, GraphQLHelper.TypeListingRestriction.State);

        return `type ${stateInputTypeName} {\n${typeListings.map(v => '\t' + v).join("\n")}\n}`;
    }

}


module.exports = WorkflowUpdatableModel;