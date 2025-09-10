const AlbumsValidator = require('../../../validator/albums');

class AlbumsHandler {
  constructor(albumsService, songsService, storageService) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._storageService = storageService;
  }

  postAlbumHandler = async (request, h) => {
    AlbumsValidator.validateAlbumPayload(request.payload);
    const albumId = await this._albumsService.addAlbum(request.payload);

    return h.response({
      status: 'success',
      data: { albumId },
    }).code(201);
  };

  getAlbumsHandler = async () => {
    const albums = await this._albumsService.getAlbums();
    return {
      status: 'success',
      data: { albums: albums || [] },
    };
  };

  getAlbumByIdHandler = async (request) => {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._songsService.getSongsByAlbumId(id);

    console.log('=== GET ALBUM DEBUG ===');
    console.log('Raw album from service:', album);
    console.log('coverUrl from service:', album.coverUrl);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          coverUrl: album.coverUrl || null, 
          songs: songs || [],
        },
      },
    };
  };

  putAlbumByIdHandler = async (request) => {
    AlbumsValidator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._albumsService.editAlbumById(id, request.payload);
    return { status: 'success', message: 'Album updated' };
  };

  deleteAlbumByIdHandler = async (request) => {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);
    return { status: 'success', message: 'Album deleted' };
  };

  postUploadCoverHandler = async (request, h) => {
    try {
      console.log('=== DEBUG UPLOAD ===');
      const { id } = request.params;
      console.log('Album ID:', id);
      console.log('Payload keys:', Object.keys(request.payload));
      console.log('Cover exists:', !!request.payload.cover);

      // Pastikan album ada
      console.log('Checking album exists...');
      await this._albumsService.getAlbumById(id);
      console.log('Album found');

      const { cover } = request.payload;
      if (!cover) {
        console.log('RETURNING 400: No cover');
        return h.response({
          status: 'fail',
          message: 'Sampul diperlukan',
        }).code(400);
      }

      // Validasi content-type
      const contentType = cover.hapi.headers['content-type'];
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(contentType)) {
        console.log('RETURNING 400: Invalid content type:', contentType);
        return h.response({
          status: 'fail',
          message: 'Format gambar tidak sesuai',
        }).code(400);
      }

      console.log('Content type valid:', contentType);
      
      const contentLength = cover.hapi.headers['content-length'];
      console.log('Content-Length header:', contentLength);
      
      if (contentLength && parseInt(contentLength) > 512000) {
        console.log('File too large based on Content-Length:', contentLength);
        return h.response({
          status: 'fail',
          message: 'File terlalu besar (maksimal 512KB)',
        }).code(413);
      }

      console.log('About to write file...');

      const filename = await this._storageService.writeFile(cover, cover.hapi);
const fileUrl = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5000}/uploads/${filename}`;

      console.log('File saved, about to update database...');
console.log('Update params - ID:', id, 'URL:', fileUrl);


      await this._service.updateAlbumCover(id, fileUrl);
console.log('Database updated successfully');

      console.log('File saved, about to update database...');
      console.log('Update params - ID:', id, 'URL:', fileUrl);
      
      // Update DB dengan URL cover
      await this._albumsService.updateAlbumCover(id, fileUrl);
      console.log('Database updated successfully');
      
      // Verify update berhasil
      const updatedAlbum = await this._albumsService.getAlbumById(id);
      console.log('Verification - Album after update:', updatedAlbum);
      console.log('Cover saved successfully:', fileUrl);

      return h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      }).code(201);
    } catch (error) {
      console.log('ERROR in postUploadCoverHandler:', error);
      
      if (error.name === 'NotFoundError') {
        return h.response({
          status: 'fail',
          message: 'Album tidak ditemukan',
        }).code(404);
      }
      
      // ✅ Handle file too large error dari StorageService
      if (error.message === 'File too large') {
        return h.response({
          status: 'fail',
          message: 'File terlalu besar (maksimal 512KB)',
        }).code(413);
      }
      
      console.error('Upload error:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      }).code(500);
    }
  };
}

module.exports = AlbumsHandler;