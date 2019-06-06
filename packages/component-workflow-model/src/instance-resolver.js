const { Identity } = require('./../shared-model/identity');
const {filterModelElementsForRelations, filterModelElementsForOwnerFields } = require('./utils');

const { ForbiddenError } = require('apollo-server-express');
const GraphQLFields = require('graphql-fields');

const _ = require("lodash");


const AclActions = {
    Access: "access",
    Write: "write",
    Read: "read"
};

const AdditionalAllowedGetFields = ['id', 'created', 'updated', 'tasks', 'restrictedFields'];


function InstanceResolver(modelClass, taskDefinition, enums) {

    this.modelClass = modelClass;
    this.acl = modelClass.acl;

    this.taskDef = taskDefinition;
    this.modelDef = taskDefinition.model;

    const relations = filterModelElementsForRelations(this.modelDef.elements, enums);
    this.relationFields = (relations || []).map(e => e.field);

    this.ownerFields = filterModelElementsForOwnerFields(this.modelDef.elements);
    this.allowedInputFields = _allowedInputKeysForInstanceInput(this.modelDef);
}


InstanceResolver.prototype.get = async function(input, info, userId) {

    const fieldsWithoutTypeName = GraphQLFields(info, {}, { excludedFields: ['__typename'] });
    const topLevelFields = fieldsWithoutTypeName ? Object.keys(fieldsWithoutTypeName) : [];
    let eagerResolves = null;

    if(this.relationFields && this.relationFields.length && fieldsWithoutTypeName) {
        eagerResolves = this.relationFields.filter(f => topLevelFields.indexOf(f) !== -1);
    }

    const [object, user] = await Promise.all([
        this.modelClass.find(input.id, eagerResolves),
        this.resolveUser(userId)
    ]);


    let aclReadMatch = null;

    if(this.acl) {

        const [aclTargets, isOwner] = this.userToAclTargets(user, object);

        const accessMatch = this.acl.applyRules(aclTargets, AclActions.Access, object);
        if(!accessMatch.allow) {
            throw new ForbiddenError("You do not have access to this object.");
        }

        if(!_restrictionsApplyToUser(accessMatch.allowedRestrictions, isOwner)) {
            throw new ForbiddenError("You do not have access to this object.");
        }

        aclReadMatch = this.acl.applyRules(aclTargets, AclActions.Read, object);
        if(!aclReadMatch.allow) {
            throw new ForbiddenError("You do not have read access to this object.");
        }
    }


    const allowedFields = (aclReadMatch && aclReadMatch.allowedFields) ? _.pick(this.allowedInputFields, aclReadMatch.allowedFields) : Object.assign({},this.allowedInputFields);
    AdditionalAllowedGetFields.forEach(f => allowedFields[f] = true);

    const filteredRequestedAllowedFields = topLevelFields.filter(f => allowedFields.hasOwnProperty(f));
    const r = {};

    filteredRequestedAllowedFields.forEach(f => {
        if(object[f] !== undefined) {
            r[f] = object[f];
        }
    });

    r.restrictedFields = topLevelFields.filter(f => !allowedFields.hasOwnProperty(f));
    if(!r.restrictedFields.length) {
        delete r.restrictedFields;
    }

    return r;
};



InstanceResolver.prototype.update = async function _update(input, userId) {

    if(this.modelDef.input !== true) {
        throw new Error("Model is not defined as an allowing updates.");
    }

    const [object, user] = await Promise.all([
        this.modelClass.find(input.id),
        this.resolveUser(userId)
    ]);


    let aclWriteMatch = null;

    if(this.acl) {

        const [aclTargets, isOwner] = this.userToAclTargets(user, object);

        const accessMatch = this.acl.applyRules(aclTargets, AclActions.Access, object);
        if(!accessMatch.allow) {
            throw new ForbiddenError("You do not have access to this object.");
        }

        if(!_restrictionsApplyToUser(accessMatch.allowedRestrictions, isOwner)) {
            throw new ForbiddenError("You do not have access to this object.");
        }

        aclWriteMatch = this.acl.applyRules(aclTargets, AclActions.Write, object);
        if(!aclWriteMatch.allow) {
            throw new ForbiddenError("You do not have write access to this object.");
        }
    }

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
        throw new ForbiddenError(`You do not have write access on the following fields: ${restrictedFields.join(", ")}`);
    }

    await object.save();
    return true;
};



InstanceResolver.prototype.resolveUser = async function resolveUser(userId) {

    if(!userId) {
        return null;
    }
    return Identity.find(userId);
};


InstanceResolver.prototype.userToAclTargets = function(user, object) {

    // By default, everyone gets the "anonymous" role applied.

    const targets = ["anonymous", "administrator"];  // FIXME: need to resolve this into the correct listing of roles
    let isOwner = false;

    if(user && user.id) {

        this.ownerFields.forEach(field => {
            const ownerId = object[field.joinField];
            if(ownerId === user.id) {
                isOwner = true;
            }
        });

        if(isOwner) {
            targets.push("owner");
        }
    }

    return [targets, isOwner];
};




function _restrictionsApplyToUser(restrictions, isOwner) {

    if(!restrictions || !restrictions.length) {
        return true;
    }

    if(restrictions.indexOf("all") !== -1) {
        return true;
    }

    return (isOwner && restrictions.indexOf("owner") !== -1);
}


function _allowedInputKeysForInstanceInput(model) {

    // For the model definition we want to determine the allowed input fields.

    const allowedInputFields = {};

    model.elements.forEach(e => {
        if(e.field && e.input !== false) {
            allowedInputFields[e.field] = e;
        }
    });

    return allowedInputFields;
}



module.exports = InstanceResolver;