const Joi = require('joi');

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/jpeg', 'image/png').required(),
}).unknown();

module.exports = { ImageHeadersSchema };
