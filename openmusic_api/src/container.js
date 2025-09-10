const { Pool } = require('pg');

// services
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');
const CacheService = require('./services/redis/CacheService');
const StorageService = require('./services/storage/StorageService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ActivitiesService = require('./services/postgres/ActivitiesService');

// handlers
const AlbumsHandler = require('./api/albums/handler');
const SongsHandler = require('./api/songs/handler');
const UsersHandler = require('./api/users/handler');
const AuthenticationsHandler = require('./api/authentications/handler');
const PlaylistsHandler = require('./api/playlists/handler');
const AlbumLikesHandler = require('./api/albumlikes/handler');
const ExportsHandler = require('./api/exports/handler');
const ActivitiesHandler = require('./api/activities/handler');
const CollaborationsHandler = require('./api/collaborations/handler');
const UploadsHandler = require('./api/uploads/handler');

// utils & validators
const TokenManager = require('./tokenize/JwtTokenManager');
const UsersValidator = require('../validator/users');
const AuthenticationsValidator = require('../validator/authentications');
const PlaylistsValidator = require('../validator/playlists');
const AlbumsValidator = require('../validator/albums');
const SongsValidator = require('../validator/songs');
const ExportsValidator = require('../validator/exports');
const CollaborationsValidator = require('../validator/collaborations');
const UploadsValidator = require('../validator/uploads');

const config = require('./utils/config');

function createContainer() {
  const pool = new Pool();
  const cacheService = new CacheService();

  // services
  const albumsService = new AlbumsService(pool);
  const songsService = new SongsService(pool);
  const usersService = new UsersService(pool);
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService(pool);
  const activitiesService = new ActivitiesService(pool);
  const playlistsService = new PlaylistsService(pool, collaborationsService, activitiesService);
  const likesService = new UserAlbumLikesService(pool, cacheService);
  const storageService = new StorageService(config.storage.uploadsDir);
  
  
  const albumsHandler = new AlbumsHandler(albumsService, songsService, storageService);
  const songsHandler = new SongsHandler(songsService, SongsValidator);
  const usersHandler = new UsersHandler(usersService, UsersValidator);
  const authenticationsHandler = new AuthenticationsHandler(
    authenticationsService,
    usersService,
    TokenManager,
    AuthenticationsValidator
  );
  const playlistsHandler = new PlaylistsHandler(
    playlistsService,
    songsService,
    collaborationsService,
    PlaylistsValidator
  );
  const albumLikesHandler = new AlbumLikesHandler(albumsService, likesService);
  const exportsHandler = new ExportsHandler(playlistsService, ExportsValidator, ProducerService);
  
  const activitiesHandler = new ActivitiesHandler(
    activitiesService,
    playlistsService
  );
  
  const collaborationsHandler = new CollaborationsHandler(
    collaborationsService,
    playlistsService,
    CollaborationsValidator
  );
  
  const uploadsHandler = new UploadsHandler(
    storageService,
    UploadsValidator,
    albumsService,
  );

  return {
    services: {
      albumsService,
      songsService,
      usersService,
      authenticationsService,
      playlistsService,
      collaborationsService,
      likesService,
      cacheService,
      storageService,
      activitiesService,
    },
    handlers: {
      albumsHandler,
      songsHandler,
      usersHandler,
      authenticationsHandler,
      playlistsHandler,
      albumLikesHandler,
      exportsHandler,
      activitiesHandler,
      collaborationsHandler, 
    },
  };
}

module.exports = createContainer;