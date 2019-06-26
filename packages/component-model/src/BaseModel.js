const BaseModel = require('@pubsweet/base-model');
const { transaction } = require('objection');

const { NotFoundError } = require('@pubsweet/errors');
const logger = require('@pubsweet/logger');

const { DBErrors } = require('objection-db-errors');
const _ = require("lodash");

const parseEagerRelations = relations =>
    Array.isArray(relations) ? `[${relations.join(', ')}]` : relations;


class WorkflowBaseModel extends DBErrors(BaseModel) {

    static async find(id, eagerLoadRelations) {
        const object = await this.query()
            .findById(id)
            .skipUndefined()
            .eager(parseEagerRelations(eagerLoadRelations));

        if (!object) {
            throw new NotFoundError(
                `Object not found: ${this.name} with 'id' ${id}`
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


    async patchRestrictingOnFields(fieldList, where = null, providedTrx = null) {

        const data = _.pick(this, fieldList);
        data.updated = new Date().toISOString();

        const trx = providedTrx || (await transaction.start(this.constructor.knex()));
        let saved;

        try {
            saved = await (where ? this.constructor.query(trx).patchAndFetchById(this.id, data).where(where) : this.constructor.query(trx).patchAndFetchById(this.id, data));

            if(!providedTrx) {
                await trx.commit();
            }

        } catch(err) {
            logger.error(err);
            if(!providedTrx) {
                await trx.rollback();
            }
            throw err;
        }

        return saved;
    }

}

module.exports = WorkflowBaseModel;
