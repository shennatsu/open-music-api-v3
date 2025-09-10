const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor(pool, cacheService) {
    this._pool = pool;
    this._cache = cacheService;
  }

  async likeAlbum(userId, albumId) {
    // pastikan album exist
    const a = await this._pool.query({ text: 'SELECT id FROM albums WHERE id=$1', values: [albumId] });
    if (!a.rowCount) throw new NotFoundError('Album tidak ditemukan');

    const id = `ualike-${nanoid(16)}`;
    try {
      await this._pool.query({
        text: 'INSERT INTO user_album_likes(id, user_id, album_id) VALUES($1,$2,$3)',
        values: [id, userId, albumId],
      });
    } catch (e) {
      if (e.code === '23505') throw new InvariantError('Album sudah disukai');
      throw e;
    }
    await this._cache.delete(`album_likes:${albumId}`);
  }

  async unlikeAlbum(userId, albumId) {
    const res = await this._pool.query({
      text: 'DELETE FROM user_album_likes WHERE user_id=$1 AND album_id=$2 RETURNING id',
      values: [userId, albumId],
    });
    if (!res.rowCount) throw new NotFoundError('Like tidak ditemukan');
    await this._cache.delete(`album_likes:${albumId}`);
  }

  async getLikes(albumId) {
    try {
      const cached = await this._cache.get(`album_likes:${albumId}`);
      return { likes: Number(cached), fromCache: true };
    } catch (_) {
      const res = await this._pool.query({
        text: 'SELECT COUNT(*)::int AS likes FROM user_album_likes WHERE album_id=$1',
        values: [albumId],
      });
      const likes = res.rows[0].likes;
      await this._cache.set(`album_likes:${albumId}`, String(likes));
      return { likes, fromCache: false };
    }
  }
}

module.exports = UserAlbumLikesService;
