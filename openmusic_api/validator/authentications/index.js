const InvariantError = require('../../src/exceptions/InvariantError');
const Joi = require('joi');



const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./schema');

const AuthenticationsValidator = {
  validatePostAuthPayload: (payload) => {
    const result = PostAuthenticationPayloadSchema.validate(payload);
    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
  validatePutAuthPayload: (payload) => {
    const result = PutAuthenticationPayloadSchema.validate(payload);
    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
  validateDeleteAuthPayload: (payload) => {
    const result = DeleteAuthenticationPayloadSchema.validate(payload);
    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
};

module.exports = AuthenticationsValidator;
