const WorkflowUpdatableModel = require('./workflow-updatable-model');
const { processInstanceService, processDefinitionService, taskService } = require('camunda-workflow-service');
const AclRule = require('client-workflow-model/AclRule');
const _ = require("lodash");

const { AuthorizationError, NotFoundError } = require('@pubsweet/errors');
const { UserInputError } = require('apollo-server-express');

const GraphQLHelper = require('./graphql-helper');
const _Tab = GraphQLHelper.Tab;
const AclActions = AclRule.Actions;


const CompleteTaskOutcome = {
    Success: 'Success',
    ValidatedEmailRequired: 'ValidatedEmailRequired',
    ValidationFailed: 'ValidationFailed'
};



class WorkflowInstance extends WorkflowUpdatableModel {


    static get instanceDefinition() {
        return null;
    }

    static get urlMapping() {
        return this.instanceDefinition.urlPath;
    }

    static get fileStorageKey() {
        return this.tableName;
    }



    static graphQLResolvers() {

        const resolvers = super.graphQLResolvers();
        const { Mutation } = resolvers;
        const ModelClass = this;

        const completeTaskMutationName = `completeTaskFor${this.implementationName}`;
        Mutation[completeTaskMutationName] = async function(ctxt, input, context, info) {
            return ModelClass.completeTaskMutationResolver(ctxt, input, context, info);
        };

        const implementationName = this.implementationName;
        const fieldResolvers = resolvers[implementationName] || {};

        fieldResolvers.tasks = async function(ctxt, input, context, info) {
            return ModelClass.tasksForInstanceResolver(ctxt, input, context, info);
        };

        return resolvers;
    }



    static async createMutationResolver(ctxt, input, context, info) {

        // Create a new instance and assign default values to it.
        const currentDateTime = new Date().toISOString();

        const newInstance = new this({
            created: currentDateTime,
            updated: currentDateTime,
        });


        // We need to check that the current user is allowed to create an instance of the defined type.
        const user = await this.resolveUserForContext(context);
        if(this.aclSet) {

            const [aclTargets, _] = this.userToAclTargets(user, newInstance);

            const match = this.aclSet.applyRules(aclTargets, AclActions.Create, newInstance);
            this._debugAclMatching(user, aclTargets, null, AclActions.Create, match, `mutation-create`);

            if(!match.allow) {
                throw new AuthorizationError("You do not have rights to create a new instance.");
            }
        }


        // If there is a current user, and the instance has an owner field(s), then we can connect those to the
        // identity that is creating the instance.

        const modelDef = this.modelDefinition;
        const ownerFields = modelDef.ownerFields();

        if(user && user.id && ownerFields && ownerFields.length) {
            ownerFields.forEach(e => {
                newInstance[e.joinField] = user.id;
            });
        }


        // If the model definition has any default values that need to be applied (including enums), then we
        // can go through and apply these now to the new instance.

        const workflowDescription = this.workflowDescription;
        const fields = modelDef.fields;

        if(workflowDescription && fields && fields.length) {

            fields.forEach(e => {

                if(e.defaultEnum && e.defaultEnumKey) {

                    const enumDef = workflowDescription.enums[e.defaultEnum];
                    if(enumDef) {
                        const v = enumDef.lookup(e.defaultEnumKey);
                        if(v) {
                            newInstance[e.field] = v;
                        }
                    }

                } else if(e.defaultValue) {

                    newInstance[e.field] = e.defaultValue;
                }
            });
        }

        await newInstance.save();

        const { processKey } = this.instanceDefinition.options;
        const createProcessOpts = {
            key: processKey,
            businessKey: newInstance.id
        };

        return processDefinitionService.start(createProcessOpts).then(async data => {

            await this.publishWasCreated(newInstance);
            return newInstance;
        });
    }


    static async destroyMutationEndpoint(ctxt, input, context, info) {

        const [object, user] = await Promise.all([
            this.find(input.id),
            this.resolveUserForContext(context)
        ]);

        if(!object) {
            throw new NotFoundError("Workflow instance with identifier not found.");
        }

        // Destroy acl processing is applied before the state changes get applied.
        if(this.aclSet) {

            const [aclTargets, isOwner] = this.userToAclTargets(user, object);

            const accessMatch = this.aclSet.applyRules(aclTargets, AclActions.Access, object);
            this._debugAclMatching(user, aclTargets, isOwner, AclActions.Access, accessMatch, `mutation-destroy`);
            if(!accessMatch.allow) {
                throw new AuthorizationError("You do not have access to this workflow instance.");
            }

            if(!this.restrictionsApplyToUser(accessMatch.allowedRestrictions, isOwner)) {
                throw new AuthorizationError("You do not have access to this workflow instance.");
            }

            const destroyAclMatch = this.aclSet.applyRules(aclTargets, AclActions.Destroy, object);
            this._debugAclMatching(user, aclTargets, isOwner, AclActions.Destroy, destroyAclMatch, `mutation-destroy`);
            if(!destroyAclMatch.allow) {
                throw new AuthorizationError("You do not have the rights allowed to destroy this workflow instance.");
            }
        }

        // Process any state changes that need to be applied to the instance before destruction. This is
        // normally just changing the phase/state enum to "destroyed" or something of that nature.
        // State fields are allowed to be changed during a destruction request (write-acl is not applied to
        // state fields).

        const { state } = input;
        const allowedKeys = (this.modelDefinition ? this.modelDefinition.stateFields() : []).map(e => e.field);
        const filteredState = (state && allowedKeys && allowedKeys.length) ? _.pick(state, allowedKeys) : null;

        // If we have a state update to apply then we can do this here and now to the object in question.
        if(filteredState && Object.keys(filteredState).length) {

            let didModify = false;

            Object.keys(filteredState).forEach(key => {

                const value = filteredState[key];
                if(object[key] !== value) {
                    object[key] = value;
                    didModify = true;
                }
            });

            if(didModify) {
                await object.save();
            }
        }

        // Fetch a listing of process instances (should be only one) that has the business key set to the instance id.

        const { processKey } = this.instanceDefinition.options;
        const listOpts = {
            businessKey: input.id,
            processDefinitionKey: processKey
        };

        return processInstanceService.list(listOpts).then((data) => {

            if(data && data.length) {

                const processInstance = data[0];

                if(processInstance && processInstance.id && processInstance.businessKey && processInstance.businessKey.toLowerCase() === input.id.toLowerCase()) {

                    this.logger.debug(`deleting workflow instance process [${processInstance.id}] from business process engine.`);

                    return new Promise((resolve, reject) => {

                        processInstanceService.http.del(processInstanceService.path +'/' + processInstance.id, {
                            done: function(err, result) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve(true);
                            }
                        });
                    });
                }
            }

            return false;

        }).then(async r => {

            await this.publishWasModified(object);
            return r;

        }).catch((err) => {

            logger.error(`[InstanceResolver/Destroy] BPM engine request failed due to: ${err.toString()}`);
            return Promise.reject(new Error("Unable to destroy instance due to business engine error."));
        });
    }


    static async completeTaskMutationResolver(ctxt, {id, taskId, form, outcome, state}, context, info) {

        if(!id || !taskId || !form || !outcome) {
            throw new UserInputError("Complete Task requires an instance id, task id, form and outcome to be supplied");
        }

        const formDefinition = this.instanceDefinition.formDefinitionForFormName(form);
        if(!formDefinition) {
            throw new Error("Form is not defined for this workflow instance type.");
        }

        const outcomeDefinition = formDefinition.findMatchingOutcome(outcome);
        if(!outcomeDefinition) {
            throw new Error("Outcome is not defined within form definition for this workflow instance type.");
        }

        if(outcomeDefinition.result !== 'Complete') {
            throw new Error('Form outcome result type is not a complete task type.');
        }

        const validationSet = formDefinition.validations;
        const taskOpts = {processInstanceBusinessKey:id};
        let eagerResolves = [];
        let tasksAclMatch = null;


        // If there are relation fields and the validation set has bindings to apply checks against a relation
        // (like the number of files etc) then we need to perform an eager resolve on those when finding the
        // instance.

        if(this.relationFieldNames && this.relationFieldNames.length && validationSet) {
            const validationSetBindings = _bindingsForValidationConditionSet(validationSet);
            eagerResolves = this.relationFieldNames.filter(f => validationSetBindings.indexOf(f) !== -1);
        }

        const [instance, user, tasks] = await Promise.all([
            this.find(id, eagerResolves),
            this.resolveUserForContext(context),
            taskService.list(taskOpts).then((data) => {
                const tasks = data._embedded.tasks || data._embedded.task;
                return (tasks || []).filter(t => t.id === taskId);
            })
        ]);

        if(!instance) {
            throw new Error("Workflow instance with identifier not found.");
        }

        if(!tasks || !tasks.length) {
            throw new Error("Specific task not found for workflow instance.");
        }


        // Apply ACL matching against this specific operation (access and then task completion) for the user.
        // Task filtering is also applied potentially based on the task ACL (i.e. a submitter can only complete a
        // submit task on the submission).

        if(this.aclSet) {

            const [aclTargets, isOwner] = this.userToAclTargets(user, instance);

            const accessMatch = this.aclSet.applyRules(aclTargets, AclActions.Access, instance);
            this._debugAclMatching(user, aclTargets, isOwner, AclActions.Access, accessMatch, `mutation-complete-task`);
            if(!accessMatch.allow) {
                throw new AuthorizationError("You do not have access to this object.");
            }

            if(!this.restrictionsApplyToUser(accessMatch.allowedRestrictions, isOwner)) {
                throw new AuthorizationError("You do not have access to this object.");
            }

            tasksAclMatch = this.aclSet.applyRules(aclTargets, AclActions.Task, instance);
            this._debugAclMatching(user, aclTargets, isOwner, AclActions.Task, tasksAclMatch, `mutation-complete-task`);
            if(!tasksAclMatch.allow) {
                throw new AuthorizationError("You do not have the rights allowed to destroy this object.");
            }
        }


        // If the outcome requires a validated submitter (i.e. identity with a validated email address)
        // then we enforce that here. A valid user is required by virtue of this condition.

        if(outcomeDefinition.requiresValidatedSubmitter === true) {

            if(!user) {
                throw new AuthorizationError("Task completion requires a validated submitter, no user authenticated.");
            }

            if(user.isValidatedEmail !== true) {
                logger.debug(`unable to complete task as identity didn't have validated email address (instanceId = ${id}, taskId = ${id}, userId = ${user.id})`);
                return CompleteTaskOutcome.ValidatedEmailRequired;
            }
        }


        // Check that the user has access to the requested task by applying ACL match filtering to task set.

        const filteredTasks = (tasksAclMatch && tasksAclMatch.allowedTasks) ? tasks.filter(t => tasksAclMatch.allowedTasks.indexOf(t.taskDefinitionKey) !== -1) : tasks;
        if(!filteredTasks.length) {
            throw new AuthorizationError("You do not have access to the task associated with the instance.");
        }


        // If the task has associated validations applied to it, then we need to apply those as well.
        // If the outcome skips validations, then they aren't applied on the server either.

        if(validationSet && outcomeDefinition.skipValidations !== true && _validationConditionSetEvaluate(validationSet, instance) !== true) {
            return CompleteTaskOutcome.ValidationFailed;
        }


        // We can now overlay the forced state changes that maybe present within the outcome definition.
        // Any state changes that are mandated in the workflow definitions are applied over top of the front-end
        // supplied state changes (which have already been filtered based on what they are allowed access to via ACLs).
        const modelDefinition = this.modelDefinition;

        const allowedKeys = (modelDefinition.stateFields() || []).map(e => e.field);
        const filteredState = (state && allowedKeys && allowedKeys.length) ? _.pick(state, allowedKeys) : {};
        const completeTaskOpts = {id: taskId};

        if(outcomeDefinition.state) {

            const overriddenValues = {};

            Object.keys(outcomeDefinition.state).forEach(key => {

                const v = outcomeDefinition.state[key];
                if(!v) {
                    return;
                }

                if(v.type === 'enum') {
                    const enumParts = v.value.split('.');
                    if(enumParts.length === 2) {
                        const resolvedEnumValue = this.resolveEnum(enumParts[0], enumParts[1]);
                        if(resolvedEnumValue) {
                            overriddenValues[key] = resolvedEnumValue;
                        }
                    }
                } else if(v.type === 'simple' && v.hasOwnProperty('value')) {

                    overriddenValues[key] = v.value;
                }
            });

            Object.assign(filteredState, overriddenValues);
        }


        // If the outcome definition includes id sequence applications, then we apply those now as well. We iterate all id sequence fields
        // and find matching fields associated with the outcome. For each we determine if the instance is missing a value for field, and
        // of they are, we perform a raw SQL statement to generate a new ID from a defined sequence,

        let didModify = false;
        const idSequenceFields = modelDefinition.idSequenceFields();

        if(idSequenceFields && idSequenceFields.length && outcomeDefinition.sequenceAssignment && outcomeDefinition.sequenceAssignment.length) {

            const idSequencesToAssign = idSequenceFields.filter(f => {
                return outcomeDefinition.sequenceAssignment.indexOf(f.field) !== -1 && !instance[f.field];
            });

            if(idSequencesToAssign.length) {

                const allSequences = idSequencesToAssign.map(assignment => {

                    return instance.$knex().raw(`SELECT TO_CHAR(nextval('${assignment.idSequence}'::regclass),'"S"fm000000') as id;`).then(resp => {
                        return {field:assignment.field, value:resp.rows[0].id};
                    });
                });

                const r = await Promise.all(allSequences);

                r.forEach(a => {
                    instance[a.field] = a.value;
                    didModify = true;
                });
            }
        }


        // Iterate any date time fields that need to be assigned an updated value based on the completion of this task. Currently,
        // only "current" type updates are supported.
        const dateTimeFields = modelDefinition.dateTimeFields();

        if(dateTimeFields && dateTimeFields.length && outcomeDefinition.dateAssignments && outcomeDefinition.dateAssignments.length) {

            const dtFields = dateTimeFields.map(f => f.field);

            const dateFieldsToAssign = outcomeDefinition.dateAssignments.filter(f => {
                return dtFields.indexOf(f.field) !== -1;
            });

            dateFieldsToAssign.forEach(dateField => {
                instance[dateField.field] = new Date();
                didModify = true;
            });
        }


        // If we have a state update to apply to the instance, then we can do this here and now.
        // The final state changes here are the user supplied states changes filtered down to fields which are marked
        // as state, which the user has access to and then any forced state changes applied over top.

        if(filteredState && Object.keys(filteredState).length) {

            const newVars = {};

            Object.keys(filteredState).forEach(key => {

                const value = filteredState[key];

                if(instance[key] !== value) {
                    instance[key] = value;
                    didModify = true;
                }

                if(typeof(value) === "string" || typeof(value) === "number" || value === null) {
                    newVars[key] = {value: value};
                }
            });

            completeTaskOpts.variables = newVars;
        }


        // Save any changes to the instance itself from the above processes (client state changes, overlaid forced
        // state changes and id sequence application).

        if(didModify) {
            await instance.save();
        }

        return taskService.complete(completeTaskOpts).then(data => {

            return this.publishWasModified(instance);

        }).then(data => {

            return CompleteTaskOutcome.Success;

        }).catch((err) => {

            this.logger.error(`Unable to complete business process engine task due to error: ${err.toString()}`);
            throw new Error("Unable to complete task for instance due to business engine error.");
        });
    }


    static async tasksForInstanceResolver(ctxt, input, context, info) {

        if(!ctxt) {
            this.logger.warn(`tasksForInstanceResolver, workflow instance context for task resolution not present`);
            throw new Error("Workflow Instance required for task resolution.");
        }

        if(!ctxt.id) {
            this.logger.warn(`tasksForInstanceResolver, id input parameter not supplied`);
            throw new Error("Workflow instance ID required for task resolution.");
        }

        const [object, user] = await Promise.all([
            this.find(ctxt.id),
            this.resolveUserForContext(context)
        ]);

        if(!object) {
            this.logger.debug(`tasksForInstanceResolver - unable to find workflow instance (id = ${id})`);
            throw new NotFoundError("Workflow Instance for identifier not found.");
        }


        let tasksAclMatch = null;

        // Task acl processing is applied before the state changes get applied.
        if(this.aclSet) {

            const [aclTargets, isOwner] = this.userToAclTargets(user, object);

            tasksAclMatch = this.aclSet.applyRules(aclTargets, AclActions.Task, object);
            this._debugAclMatching(user, aclTargets, isOwner, AclActions.Task, tasksAclMatch, `query-tasks`);
            if(!tasksAclMatch.allow) {
                throw new AuthorizationError("You do not have the rights allowed to destroy this object.");
            }
        }

        // Fetch the listing of tasks associated with the instance.
        const taskOpts = {processInstanceBusinessKey:ctxt.id};

        return taskService.list(taskOpts).then((data) => {

            const tasks = data._embedded.tasks || data._embedded.task;

            tasks.forEach(task => {
                delete task._links;
                delete task._embedded;
            });

            // Filter tasks if required down to allowed task types.
            if(tasksAclMatch && tasksAclMatch.allowedTasks) {
                return tasks.filter(t => tasksAclMatch.allowedTasks.indexOf(t.taskDefinitionKey) !== -1);
            }

            return tasks;

        }).catch((err) => {

            this.logger.error(`tasksForInstanceResolver - BPM engine request failed due to: ${err.toString()}`);
            return Promise.reject(new Error("Unable to fetch tasks for workflow instance due to business engine error."));
        });
    }


    // Business Process Helpers
    // ---

    async getTasks() {

        const taskOpts = {processInstanceBusinessKey: this.id};

        return taskService.list(taskOpts).then((data) => {

            return data._embedded.tasks || data._embedded.task;

        }).catch((err) => {

            this.logger.error(`getTasks - BPM engine request failed due to: ${err.toString()}`);
            return Promise.reject(new Error("Unable to fetch tasks for workflow instance due to business engine error."));
        });
    }

    async completeTask(taskId, stateChanges) {

        // Note: this complete task method is not hooked to a form definition, therefore any enforced state changes
        // or submission ID assignment will not occur.

        const completeTaskOpts = {id: taskId};
        let didModify = false;
        const newVars = {};

        Object.keys(stateChanges).forEach(key => {

            const value = stateChanges[key];

            if(typeof(value) === "string" || typeof(value) === "number" || value === null) {
                newVars[key] = {value: value};
            }
        });

        completeTaskOpts.variables = newVars;
        if(didModify) {
            await this.save();
        }

        return taskService.complete(completeTaskOpts).then(() => {

            return this.publishWasModified();

        }).catch((err) => {

            this.logger.error(`completeTask - unable to complete business process engine task due to error: ${err.toString()}`);
            throw new Error("Unable to complete task for workflow instance due to business engine error.");
        });
    }

    async restartWorkflow(startAfterActivityId) {

        const ModelClass = this.constructor;
        const { processKey } = ModelClass.instanceDefinition.options;
        const createProcessOpts = {
            key: processKey,
            businessKey: this.id,
            startInstructions:[
                {
                    type: "startAfterActivity",
                    activityId: startAfterActivityId
                }
            ]
        };

        const stateFields = ModelClass.modelDefinition ? ModelClass.modelDefinition.stateFields() : null;
        if(stateFields && stateFields.length) {

            const variables = {};
            let hasVariables = false;

            stateFields.forEach(f => {

                const value = this[f.field];

                if(typeof(value) === "string" || typeof(value) === "number" || value === null) {
                    variables[f.field] = {value: value};
                    hasVariables = true;
                }
            });

            if(hasVariables) {
                createProcessOpts.variables = variables;
            }
        }

        return processDefinitionService.start(createProcessOpts).then(async data => {

            await this.publishWasModified();
            return data;

        }).catch((err) => {

            this.logger.error(`restartWorkflow - BPM engine request failed due to: ${err.toString()}`);
            return Promise.reject(new Error("Unable to restart instance due to business engine error."));
        });

    }




    // GraphQL TypeDef generation
    // ---

    static get graphQLModelImplements() {
        return ['Object', 'WorkflowObject'];
    }

    static get graphQLModelBaseTypes() {
        return [...super.graphQLModelBaseTypes, `tasks: [Task]`];
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

        return baseTypeDef + (mutationStatements.length ?  `\nextend type Mutation {\n${_Tab + mutationStatements.join('\n' + _Tab)}\n}` + '\n\n' : "");
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



function _validationConditionSetEvaluate(validations, data) {

    for(let i = 0; i < validations.length; i++) {
        if(!validations[i].evaluateCondition(data, 'server')) {
            return false;
        }
    }

    return true;
}

function _bindingsForValidationConditionSet(validations) {

    const allBindings = {};
    validations.forEach(validationEntry => {
        const b = validationEntry.bindings;
        b.forEach(b => allBindings[b.split('.')[0]] = true);
    });

    return Object.keys(allBindings);
}



module.exports = WorkflowInstance;