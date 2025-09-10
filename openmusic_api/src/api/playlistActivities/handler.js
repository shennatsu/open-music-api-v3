const autoBind = require('auto-bind');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistActivitiesHandler {
  constructor(playlistsService, activitiesService) {
    this._playlistsService = playlistsService;
    this._activitiesService = activitiesService;
    autoBind(this);
  }

  async getActivitiesHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      console.log('=== GET PLAYLIST ACTIVITIES DEBUG ===');
      console.log('Playlist ID:', playlistId);
      console.log('User ID:', userId);

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

      const activities = await this._activitiesService.get(playlistId) || [];

      return h.response({ status: 'success', data: { playlistId, activities } }).code(200);
    } catch (error) {
      console.error('ERROR in getActivitiesHandler:', error);
      if (error instanceof NotFoundError) {
        return h.response({ status: 'fail', message: error.message }).code(404);
      }
      if (error instanceof AuthorizationError) {
        return h.response({ status: 'fail', message: error.message }).code(403);
      }
      return h.response({ status: 'error', message: 'Server error' }).code(500);
    }
  }
}

module.exports = PlaylistActivitiesHandler;
