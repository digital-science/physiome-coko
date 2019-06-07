const BaseModel = require('@pubsweet/base-model');
const { NotFoundError } = require('@pubsweet/errors');

const parseEagerRelations = relations =>
    Array.isArray(relations) ? `[${relations.join(', ')}]` : relations;

const { DBErrors } = require('objection-db-errors');


class WorkflowBaseModel extends DBErrors(BaseModel) {

    static async find(id, eagerLoadRelations) {
        const object = await this.query()
            .findById(id)
            .skipUndefined()
            .eager(parseEagerRelations(eagerLoadRelations));

        if (!object) {
            throw new NotFoundError(
                `Object not found: ${this.name} with 'id' ${id}`,
            );
        }

        return object;
    }

    static async findOneByField(field, value, eagerLoadRelations) {
        const object = await this.query()
            .where(field, value)
            .limit(1)
            .eager(parseEagerRelations(eagerLoadRelations));

        if (!object.length) {
            return null;
        }

        return object[0];
    }

    static parseEagerRelations(eagerLoadRelations) {
        return parseEagerRelations(eagerLoadRelations);
    }
}

module.exports = WorkflowBaseModel;
