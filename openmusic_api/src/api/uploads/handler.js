const path = require('path');
const fs = require('fs');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });
    return h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: { albumId },
    }).code(201);
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: { album },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbumById(id, { name, year });
    return { status: 'success', message: 'Album berhasil diperbarui' };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return { status: 'success', message: 'Album berhasil dihapus' };
  }

  // ✅ Upload Cover
  async postUploadCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    if (!cover || !cover.hapi) {
      return h.response({
        status: 'fail',
        message: 'Tidak ada file yang diupload',
      }).code(400);
    }

    const mime = cover.hapi.headers['content-type'];
    if (!['image/jpeg', 'image/png'].includes(mime)) {
      return h.response({
        status: 'fail',
        message: 'Format file tidak valid. Hanya JPEG/PNG',
      }).code(400);
    }

    const filename = `${id}-${Date.now()}${path.extname(cover.hapi.filename)}`;
    const filepath = path.join(__dirname, '../../../uploads', filename);

    const fileStream = fs.createWriteStream(filepath);
    cover.pipe(fileStream);

    await new Promise((resolve, reject) => {
      cover.on('end', resolve);
      cover.on('error', reject);
    });

  const fileUrl = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5000}/uploads/${filename}`;
    await this._service.updateAlbumCover(id, fileUrl);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }
}

module.exports = AlbumsHandler;
