const autoBind = require('auto-bind');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsHandler {
  constructor(playlistsService, songsService, collaborationsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      console.log('=== POST PLAYLIST DEBUG ===');
      console.log('Payload:', request.payload);
      console.log('User credentials:', request.auth.credentials);

      this._validator.validatePostPlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: owner } = request.auth.credentials;

      console.log('About to call addPlaylist with:', { name, owner });

      const playlistId = await this._playlistsService.addPlaylist(name, owner);

      console.log('Playlist created with ID:', playlistId);

      return h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: { playlistId },
      }).code(201);
    } catch (error) {
      console.error('ERROR in postPlaylistHandler:', error);
      if (error instanceof InvariantError) {
        return h.response({ status: 'fail', message: error.message }).code(400);
      }
      return h.response({ status: 'error', message: 'Server error' }).code(500);
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { id: owner } = request.auth.credentials;
      const playlists = await this._playlistsService.getPlaylists(owner);

      return h.response({ status: 'success', data: { playlists } }).code(200);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h.response({ status: 'fail', message: error.message }).code(404);
      }
      return h.response({ status: 'error', message: 'Server error' }).code(500);
    }
  }

  async deletePlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: owner } = request.auth.credentials;

      await this._playlistsService.deletePlaylistById(id, owner);

      return h.response({ status: 'success', message: 'Playlist berhasil dihapus' }).code(200);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h.response({ status: 'fail', message: error.message }).code(404);
      }
      if (error instanceof AuthorizationError) {
        return h.response({ status: 'fail', message: error.message }).code(403);
      }
      return h.response({ status: 'error', message: 'Server error' }).code(500);
    }
  }

  async postSongToPlaylistHandler(request, h) {
    try {
      console.log('=== POST SONG TO PLAYLIST DEBUG ===');
      console.log('Params:', request.params);
      console.log('Payload:', request.payload);
      console.log('User:', request.auth.credentials);

      this._validator.validatePostPlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: userId } = request.auth.credentials;

      await this._songsService.getSongById(songId);
      await this._playlistsService.addSongToPlaylist(playlistId, songId, userId);

      return h.response({ status: 'success', message: 'Lagu berhasil ditambahkan ke playlist' }).code(201);
    } catch (error) {
      console.error('ERROR in postSongToPlaylistHandler:', error);
      if (error instanceof InvariantError) {
        return h.response({ status: 'fail', message: error.message }).code(400);
      }
      if (error instanceof NotFoundError) {
        return h.response({ status: 'fail', message: error.message }).code(404);
      }
      if (error instanceof AuthorizationError) {
        return h.response({ status: 'fail', message: error.message }).code(403);
      }
      return h.response({ status: 'error', message: 'Server error' }).code(500);
    }
  }

  async getSongsFromPlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: userId } = request.auth.credentials;

      const playlist = await this._playlistsService.getSongsInPlaylist(id, userId);

      return h.response({ status: 'success', data: { playlist } }).code(200);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h.response({ status: 'fail', message: error.message }).code(404);
      }
      if (error instanceof AuthorizationError) {
        return h.response({ status: 'fail', message: error.message }).code(403);
      }
      return h.response({ status: 'error', message: 'Server error' }).code(500);
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      console.log('=== DELETE SONG FROM PLAYLIST DEBUG ===');
      console.log('Params:', request.params);
      console.log('Payload:', request.payload);
      console.log('User:', request.auth.credentials);

      this._validator.validateDeletePlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: userId } = request.auth.credentials;

      await this._playlistsService.deleteSongFromPlaylist(playlistId, songId, userId);

      return h.response({ status: 'success', message: 'Lagu berhasil dihapus dari playlist' }).code(200);
    } catch (error) {
      console.error('ERROR in deleteSongFromPlaylistHandler:', error);
      if (error instanceof InvariantError) {
        return h.response({ status: 'fail', message: error.message }).code(400);
      }
      if (error instanceof NotFoundError) {
        return h.response({ status: 'fail', message: error.message }).code(404);
      }
      if (error instanceof AuthorizationError) {
        return h.response({ status: 'fail', message: error.message }).code(403);
      }
      return h.response({ status: 'error', message: 'Server error' }).code(500);
    }
  }

async getPlaylistActivitiesHandler(request, h) {
  try {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    // verify access
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    // ambil activities dari service
    const activities = await this._playlistsService.getPlaylistActivities(playlistId);

    return h.response({
      status: 'success',
      data: { playlistId, activities },
    }).code(200);
  } catch (error) {
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



module.exports = PlaylistsHandler;
