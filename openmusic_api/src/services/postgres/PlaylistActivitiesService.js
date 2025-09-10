const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class PlaylistActivitiesService {
  constructor() { this._pool = new Pool(); }

  async add(playlistId, songId, userId, action) {
    const id = `act-${nanoid(16)}`;
    const time = new Date().toISOString();
    await this._pool.query({
      text: 'INSERT INTO playlist_song_activities VALUES($1,$2,$3,$4,$5,$6)',
      values: [id, playlistId, songId, userId, action, time],
    });
  }

  async get(playlistId) {
    const res = await this._pool.query({
      text: `SELECT u.username, s.title, a.action, a.time
             FROM playlist_song_activities a
             JOIN users u ON u.id=a.user_id
             JOIN songs s ON s.id=a.song_id
             WHERE a.playlist_id=$1
             ORDER BY a.time`,
      values: [playlistId],
    });
    return res.rows;
  }
}
module.exports = PlaylistActivitiesService;
