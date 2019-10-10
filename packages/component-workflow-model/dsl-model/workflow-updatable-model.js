const WorkflowModel = require('./workflow-model');
const AclRule = require('client-workflow-model/AclRule');
const _ = require("lodash");

const { AuthorizationError } = require('@pubsweet/errors');

const GraphQLHelper = require('./graphql-helper');
const _Tab = GraphQLHelper.Tab;
const AclActions = AclRule.Actions;



class WorkflowUpdatableModel extends WorkflowModel {

    static get allowsCreate() {
        return !(this.modelDefinition.noCreate === true);
    }

    static get allowsUpdate() {
        return !!this.modelDefinition.input;
    }

    static get allowsSubscriptions() {
        return true;
    }


    static get allowedInputFields() {

        if(this._cachedAllowedInputFields) {
            return this._cachedAllowedInputFields;
        }

        const allowedInputFields = {};

        this.modelDefinition.fields.forEach(e => {
            if(e.field && e.input !== false) {
                allowedInputFields[e.field] = e;
            }
        });

        return (this._cachedAllowedInputFields = allowedInputFields);
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

                Mutation[mutationName] = async function(ctxt, input, context, info) {
                    return ModelClass.relationAccessorSetMutationEndpoint(ctxt, input, context, info, e);
                };
            });
        }

        resolvers[implementationName] = fieldResolvers;

        return resolvers;
    }


    static async createMutationResolver(ctxt, input, context, info) {

        this.logger.error(`createMutationResolver - not yet implemented`);
    }

    static async destroyMutationEndpoint(ctxt, input, context, info) {

        this.logger.error(`createMutationResolver - not yet implemented`);
    }

    static async updateMutationEndpoint(ctxt, {input}, context, info) {

        if(!this.allowsUpdate) {
            throw new Error("Model is not defined as an allowing updates.");
        }

        const [object, user] = await Promise.all([
            this.find(input.id),
            this.resolveUserForContext(context)
        ]);


        let aclWriteMatch = null;

        if(this.aclSet) {

            const [aclTargets, isOwner] = this.userToAclTargets(user, object);

            const accessMatch = this.aclSet.applyRules(aclTargets, AclActions.Access, object);
            //_debugAclMatching(user, aclTargets, isOwner, AclActions.Access, accessMatch);

            if(!accessMatch.allow) {
                throw new AuthorizationError("You do not have access to this object.");
            }

            if(!this.restrictionsApplyToUser(accessMatch.allowedRestrictions, isOwner)) {
                throw new AuthorizationError("You do not have access to this object.");
            }

            aclWriteMatch = this.aclSet.applyRules(aclTargets, AclActions.Write, object);
            //_debugAclMatching(user, aclTargets, isOwner, AclActions.Write, aclWriteMatch);

            if(!aclWriteMatch.allow) {
                throw new AuthorizationError("You do not have write access to this object.");
            }
        }

        const instanceId = input.id;
        delete input.id;


        // Create a listing of fields that can be updated, then we apply the update to the model object
        // provided that it is within the list of allowed fields.

        const allowedFields = (aclWriteMatch && aclWriteMatch.allowedFields) ? _.pick(this.allowedInputFields, aclWriteMatch.allowedFields) : this.allowedInputFields;
        const restrictedFields = [];

        Object.keys(input).forEach(key => {
            if(allowedFields.hasOwnProperty(key)) {
                object[key] = input[key];
            } else {
                restrictedFields.push(key);
            }
        });

        if(restrictedFields.length) {
            throw new AuthorizationError(`You do not have write access on the following fields: ${restrictedFields.join(", ")}`);
        }

        await object.save();
        await this.publishWasModified(instanceId);
        return true;
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

            if(element.type === "File") {

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



    // GraphQL TypeDef generation
    // ---

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
            mutationStatements.push(`destroy${implementationName}(id:ID, state:${stateInputTypeName}) : Boolean`);
            typeStatements.push(this.graphQLStateInputDefinition());
        } else {
            mutationStatements.push(`completeTaskFor${implementationName}(id:ID!, taskId:ID!, form:String!, outcome:String!) : CompleteTaskOutcome`);
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
            + (typeStatements.length ? typeStatements.join('\n') + '\n\n' : "")
            + (mutationStatements.length ?  `\nextend type Mutation {\n${_Tab + mutationStatements.join('\n' + _Tab)}\n}` + '\n\n' : "");
    }


    static graphQLModelInputDefinition() {

        const model = this.modelDefinition;
        const modelInputTypeName = `${this.graphQLModelName}Input`;

        const typeListings = [
            ...(this.graphQLModelInputBaseTypes || []),
            ...GraphQLHelper.gqlTypeListingForFields(model.fields, this.workflowDescription, GraphQLHelper.TypeListingRestriction.Input)
        ];

        return `input ${modelInputTypeName} {\n${typeListings.map(v => _Tab + v).join("\n")}\n}`;
    }


    static graphQLStateInputDefinition() {

        const model = this.modelDefinition;
        const stateInputTypeName = `${this.graphQLModelName}StateInput`;

        const typeListings = GraphQLHelper.gqlTypeListingForFields(model.fields, this.workflowDescription, GraphQLHelper.TypeListingRestriction.State);

        return `input ${stateInputTypeName} {\n${typeListings.map(v => _Tab + v).join("\n")}\n}`;
    }

}


module.exports = WorkflowUpdatableModel;