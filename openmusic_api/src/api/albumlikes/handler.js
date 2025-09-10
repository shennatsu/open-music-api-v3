const autoBind = require('auto-bind');

class AlbumLikesHandler {
  constructor(albumsService, likesService) {
    this._albumsService = albumsService;
    this._likesService = likesService;
    autoBind(this);
  }

  async postLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._albumsService.getAlbumById(albumId); // validasi album exist
    await this._likesService.likeAlbum(userId, albumId);
    return h.response({ status: 'success', message: 'Album berhasil disukai' }).code(201);
  }

  async deleteLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._likesService.unlikeAlbum(userId, albumId);
    return { status: 'success', message: 'Batal menyukai album' };
  }

  async getLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, fromCache } = await this._likesService.getLikes(albumId);
    const res = h.response({ status: 'success', data: { likes } });
    if (fromCache) res.header('X-Data-Source', 'cache');
    return res;
  }
}

module.exports = AlbumLikesHandler;
