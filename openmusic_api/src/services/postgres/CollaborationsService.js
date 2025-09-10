// src/services/postgres/CollaborationsService.js
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor(pool) {
    this._pool = pool;
  }

  async addCollaboration(playlistId, userId) {
    // Validate user exists first
    const userCheck = await this._pool.query({
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    });
    
    if (!userCheck.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    // Validate playlist exists
    const playlistCheck = await this._pool.query({
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    });
    
    if (!playlistCheck.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const id = `collab-${nanoid(16)}`;
    
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Kolaborasi tidak ditemukan');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi tidak valid');
    }
  }
}

module.exports = CollaborationsService;