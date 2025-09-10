const ClientError = require('../../exceptions/ClientError');

class ActivitiesHandler {
  constructor(activitiesService, playlistsService) {
    this._activitiesService = activitiesService;
    this._playlistsService = playlistsService;

      console.log('DEBUG ActivitiesService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(activitiesService)));

  }

  async getActivitiesHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      // Verify playlist access
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

      const activities = await this._activitiesService.getActivitiesByPlaylistId(playlistId);

      return h.response({
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

 

}

module.exports = ActivitiesHandler;