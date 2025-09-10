exports.up = (pgm) => {
  pgm.createTable('playlistsongs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: {
      type: 'VARCHAR(50)', notNull: true, references: 'playlists', onDelete: 'cascade',
    },
    song_id: {
      type: 'VARCHAR(50)', notNull: true, references: 'songs', onDelete: 'cascade',
    },
  });
  pgm.addConstraint('playlistsongs', 'unique_playlist_song', {
    unique: ['playlist_id', 'song_id'],
  });
};

exports.down = (pgm) => pgm.dropTable('playlistsongs');
