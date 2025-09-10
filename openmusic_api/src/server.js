const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

require('dotenv').config();

const createContainer = require('./container');
const errorHandler = require('./exceptions/errorHandler');
const config = require('./utils/config');

// routes
const albumsRoutes = require('./api/albums/routes');
const songsRoutes = require('./api/songs/routes');
const usersRoutes = require('./api/users/routes');
const authenticationsRoutes = require('./api/authentications/routes');
const playlistsRoutes = require('./api/playlists/routes');
const albumLikesRoutes = require('./api/albumlikes/routes');
const exportRoutes = require('./api/exports/routes');
const collaborationsRoutes = require('./api/collaborations/routes');
const uploadsRoutes = require('./api/uploads/routes');
const albumsPlugin = require('./api/albums');

const init = async () => {
  const container = createContainer({useMock: process.env.NODE_ENV === 'test'});
  const { handlers, services } = container;

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.route({
    method: 'GET',
    path: '/uploads/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../uploads'),
      },
    },
  });

  // Auth strategy JWT
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { id: artifacts.decoded.payload.userId },
    }),
  });

  // Routes
await server.register({
  plugin: albumsPlugin,
  options: {
    albumsService: services.albumsService,
    songsService: services.songsService,
    storageService: services.storageService,
  },
});
  server.route(songsRoutes(handlers.songsHandler));
  server.route(usersRoutes(handlers.usersHandler));
  server.route(authenticationsRoutes(handlers.authenticationsHandler));
  server.route(playlistsRoutes(handlers.playlistsHandler));
  server.route(albumLikesRoutes(handlers.albumLikesHandler));
  server.route(exportRoutes(handlers.exportsHandler));
  
  // Activities plugin
  await server.register({
    plugin: require('./api/activities'),
    options: {
      activitiesService: services.activitiesService,
      playlistsService: services.playlistsService,
    },
  });

  server.route(collaborationsRoutes(handlers.collaborationsHandler));

  server.ext('onPreResponse', errorHandler);

  await server.start();
  console.log(`🚀 Server running at: ${server.info.uri}`);
};

init();