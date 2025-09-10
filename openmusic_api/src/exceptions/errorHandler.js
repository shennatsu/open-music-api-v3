const ClientError = require('./ClientError');
const DomainErrorTranslator = require('./DomainErrorTranslator');

const errorHandler = (request, h) => {
  const { response } = request;

  if (response instanceof Error) {
    
    // kalau langsung ClientError, tangkap di sini
    if (response instanceof ClientError) {

      return h.response({
        status: 'fail',
        message: response.message,
      }).code(response.statusCode);
    }

    const translated = DomainErrorTranslator.translate(response);

    if (translated instanceof ClientError) {

      return h.response({
        status: 'fail',
        message: translated.message,
      }).code(translated.statusCode);
    }

    if (!translated.isServer) {

      return h.response({
        status: 'fail',
        message: translated.message,
      }).code(translated.output.statusCode);
    }

    

    console.error(translated);
    return h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    }).code(500);
  }

  return h.continue;
};


module.exports = errorHandler;
