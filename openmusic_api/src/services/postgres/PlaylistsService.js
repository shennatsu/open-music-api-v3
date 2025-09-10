const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(pool, collaborationsService = null, activitiesService = null) {
    this._pool = pool;
    this._collabService = collaborationsService;
    this._activities = activitiesService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const res = await this._pool.query({
      text: 'INSERT INTO playlists(id, name, owner) VALUES($1,$2,$3) RETURNING id',
      values: [id, name, owner],
    });

    if (!res.rowCount) throw new InvariantError('Playlist gagal ditambahkan');
    return res.rows[0].id;
  }

  async getPlaylists(owner) {
    const res = await this._pool.query({
      text: `
        SELECT p.id, p.name, u.username
        FROM playlists p
        LEFT JOIN users u ON u.id = p.owner
        LEFT JOIN collaborations c ON c.playlist_id = p.id
        WHERE p.owner=$1 OR c.user_id=$1
        GROUP BY p.id, u.username
        ORDER BY p.id
      `,
      values: [owner],
    });
    return res.rows;
  }

  async deletePlaylistById(id, owner) {
    await this.verifyPlaylistOwner(id, owner);
    const res = await this._pool.query({
      text: 'DELETE FROM playlists WHERE id=$1 RETURNING id',
      values: [id],
    });
    if (!res.rowCount) throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    await this.verifyPlaylistAccess(playlistId, userId);

    // cek apakah lagu sudah ada
    const check = await this._pool.query({
      text: 'SELECT id FROM playlistsongs WHERE playlist_id=$1 AND song_id=$2',
      values: [playlistId, songId],
    });
    if (check.rowCount) throw new InvariantError('Lagu sudah ada di playlist');

    const id = `plsong-${nanoid(16)}`;
    const res = await this._pool.query({
      text: 'INSERT INTO playlistsongs(id, playlist_id, song_id) VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    });
    if (!res.rowCount) throw new InvariantError('Lagu gagal ditambahkan ke playlist');

    if (this._activities) await this._activities.addActivity(playlistId, songId, userId, 'add');
  }

  async getSongsInPlaylist(playlistId, userId) {
    await this.verifyPlaylistAccess(playlistId, userId);

    const playlistQ = await this._pool.query({
      text: `
        SELECT p.id, p.name, u.username
        FROM playlists p JOIN users u ON u.id = p.owner
        WHERE p.id=$1
      `,
      values: [playlistId],
    });
    if (!playlistQ.rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    const songsQ = await this._pool.query({
      text: `
        SELECT s.id, s.title, s.performer
        FROM playlistsongs ps JOIN songs s ON s.id = ps.song_id
        WHERE ps.playlist_id=$1
      `,
      values: [playlistId],
    });

    return { ...playlistQ.rows[0], songs: songsQ.rows };
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    await this.verifyPlaylistAccess(playlistId, userId);

    const res = await this._pool.query({
      text: 'DELETE FROM playlistsongs WHERE playlist_id=$1 AND song_id=$2 RETURNING id',
      values: [playlistId, songId],
    });
    if (!res.rowCount) throw new NotFoundError('Lagu gagal dihapus dari playlist');

    if (this._activities) await this._activities.addActivity(playlistId, songId, userId, 'delete');
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const res = await this._pool.query({
      text: 'SELECT owner FROM playlists WHERE id=$1',
      values: [playlistId],
    });
    if (!res.rowCount) throw new NotFoundError('Playlist tidak ditemukan');
    if (res.rows[0].owner !== owner)
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;

      // kalau bukan owner, cek apakah collaborator
      if (this._collabService) {
        try {
          await this._collabService.verifyCollaborator(playlistId, userId);
          return;
        } catch {
          throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
      } else {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
    }
  }

  async getPlaylistActivities(playlistId) {
  const query = {
       text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
           FROM playlist_song_activities
           LEFT JOIN users ON users.id = playlist_song_activities.user_id
           LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
           WHERE playlist_song_activities.playlist_id = $1
           ORDER BY playlist_song_activities.time`,
    values: [playlistId],
  };

  const result = await this._pool.query(query);
  return result.rows;
}


}

module.exports = PlaylistsService;
