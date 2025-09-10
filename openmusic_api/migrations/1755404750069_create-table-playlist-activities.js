exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: { type: 'VARCHAR(50)', notNull: true, references: 'playlists', onDelete: 'cascade' },
    song_id: { type: 'VARCHAR(50)', notNull: true, references: 'songs', onDelete: 'cascade' },
    user_id: { type: 'VARCHAR(50)', notNull: true, references: 'users', onDelete: 'cascade' },
    action: { type: 'TEXT', notNull: true }, // add / delete
    time: { type: 'TEXT', notNull: true },
  });
};
exports.down = (pgm) => pgm.dropTable('playlist_song_activities');
