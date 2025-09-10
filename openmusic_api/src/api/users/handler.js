const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postUserHandler(request, h) {
    try {
      this._validator.validateUserPayload(request.payload);
    } catch (error) {
      throw new ClientError(error.message);
    }
    
    const { username, password, fullname } = request.payload;
    const userId = await this._service.addUser({ username, password, fullname });
    const response = h.response({ status: 'success', data: { userId } });
    
    response.code(201);
    return response;
  }
}
module.exports = UsersHandler;