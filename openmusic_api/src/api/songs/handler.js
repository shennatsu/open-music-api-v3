const SongsValidator = require('../../../validator/songs');
const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  constructor(service) {
    this._service = service;
  }

  postSongHandler = async (request, h) => {
    try {
      SongsValidator.validateSongPayload(request.payload);

      const songId = await this._service.addSong(request.payload);
      return h
        .response({
          status: 'success',
          message: 'Lagu berhasil ditambahkan',
          data: { songId },
        })
        .code(201);
    } catch (error) {
      return this._handleError(error, h);
    }
  };

  getSongsHandler = async (request, h) => {
    try {
      const songs = await this._service.getSongs(request.query);
      return {
        status: 'success',
        data: { songs: songs || [] },
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  };

  getSongByIdHandler = async (request, h) => {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);
      return { status: 'success', data: { song } };
    } catch (error) {
      return this._handleError(error, h);
    }
  };

  putSongByIdHandler = async (request, h) => {
    try {
      SongsValidator.validateSongPayload(request.payload);

      const { id } = request.params;
      await this._service.editSongById(id, request.payload);
      return { status: 'success', message: 'Lagu berhasil diperbarui' };
    } catch (error) {
      return this._handleError(error, h);
    }
  };

  deleteSongByIdHandler = async (request, h) => {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);
      return { status: 'success', message: 'Lagu berhasil dihapus' };
    } catch (error) {
      return this._handleError(error, h);
    }
  };

  // helper buat konsisten error handling
  _handleError(error, h) {
    if (error instanceof ClientError) {
      return h
        .response({
          status: 'fail',
          message: error.message,
        })
        .code(error.statusCode);
    }

    console.error(error);
    return h
      .response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      })
      .code(500);
  }
}

module.exports = SongsHandler;
