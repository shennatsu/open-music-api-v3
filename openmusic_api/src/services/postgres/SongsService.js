const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(pool) {
    this._pool = pool;
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    if (!title || !year || !performer) {
      throw new InvariantError('Title, year, dan performer wajib diisi');
    }

    const id = `song-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO songs 
            (id, title, year, performer, genre, duration, album_id) 
            VALUES($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id`,
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menambahkan lagu');
    }

    return result.rows[0].id;
  }

async getSongs({ title, performer } = {}) {
  let query = {
    text: 'SELECT id, title, performer FROM songs',
    values: [],
  };

  const conditions = [];

  if (title) {
    conditions.push(`LOWER(title) LIKE LOWER('%' || $${conditions.length + 1} || '%')`);
    query.values.push(title);
  }

  if (performer) {
    conditions.push(`LOWER(performer) LIKE LOWER('%' || $${conditions.length + 1} || '%')`);
    query.values.push(performer);
  }

  if (conditions.length > 0) {
    query.text += ` WHERE ${conditions.join(' AND ')}`;
  }

  const result = await this._pool.query(query);
  return result.rows; 
}


  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async getSongsByAlbumId(albumId) {
  const query = {
    text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
    values: [albumId],
  };
  const result = await this._pool.query(query);
  return result.rows;
}



  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const query = {
      text: `UPDATE songs 
             SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 
             WHERE id = $7 
             RETURNING id`,
      values: [title, year, performer, genre, duration, albumId, id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }
  }
}


module.exports = SongsService;
