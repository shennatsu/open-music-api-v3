const autoBind = require('auto-bind');
const bcrypt = require('bcrypt');
const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
  constructor(authService, usersService, tokenManager, validator) {
    this._authService = authService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    
    try {
      
      this._validator.validatePostAuthPayload(request.payload);
    } catch (error) {
      throw new ClientError(error.message);
    }
    
    const { username, password } = request.payload;

    const { id, password: hashed } = await this._usersService.getUserByUsername(username);
    const match = await bcrypt.compare(password, hashed);
    if (!match) throw new (require('../../exceptions/AuthenticationError'))('Kredensial salah');

    const accessToken = this._tokenManager.generateAccessToken({ userId: id });
    const refreshToken = this._tokenManager.generateRefreshToken({ userId: id });

    await this._authService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      data: { accessToken, refreshToken },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    try {
      this._validator.validatePutAuthPayload(request.payload);
    } catch (error) {
      throw new ClientError(error.message);
    }
    
    const { refreshToken } = request.payload;

    await this._authService.verifyRefreshToken(refreshToken);
    const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ userId });
    
    const response = h.response({
      status: 'success',
      data: { accessToken }
    });
    response.code(200);
    return response;
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this._validator.validateDeleteAuthPayload(request.payload);
    } catch (error) {
      throw new ClientError(error.message);
    }
    
    const { refreshToken } = request.payload;
    await this._authService.verifyRefreshToken(refreshToken);
    await this._authService.deleteRefreshToken(refreshToken);
    
    const response = h.response({
      status: 'success',
      message: 'Refresh token berhasil dihapus'
    });
    response.code(200);
    return response;
  }
}

module.exports = AuthenticationsHandler;