const BaseModel = require('./src/BaseModel');
const {
    UniqueViolationError,
    NotNullViolationError,
    ForeignKeyViolationError,
    ConstraintViolationError,
    CheckViolationError,
    DataError
} = require('objection-db-errors');


module.exports = {
    BaseModel,

    UniqueViolationError,
    NotNullViolationError,
    ForeignKeyViolationError,
    ConstraintViolationError,
    CheckViolationError,
    DataError
};
