const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(playlistsService, validator, producer) {
    this._playlistsService = playlistsService;
    this._validator = validator;
    this._producer = producer;
    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    try {
      this._validator.validateExportPlaylistsPayload(request.payload);
      const { targetEmail } = request.payload;
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      // hanya owner boleh export
      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

      // kirim ke RabbitMQ dengan queue name konsisten
      await this._producer.sendMessage(
        'openmusic:export:playlists',
        JSON.stringify({ playlistId, targetEmail }),
      );

      return h
        .response({ status: 'success', message: 'Permintaan Anda sedang kami proses' })
        .code(201);
    } catch (err) {
      console.error('EXPORT ERROR:', err);
      throw err;
    }
  }
}

module.exports = ExportsHandler;
