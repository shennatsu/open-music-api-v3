const Joi = require('joi');
const InvariantError = require('../../src/exceptions/InvariantError');

const ExportPlaylistsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email().required(),
});

const ExportsValidator = {
  validateExportPlaylistsPayload: (payload) => {
    const validationResult = ExportPlaylistsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
