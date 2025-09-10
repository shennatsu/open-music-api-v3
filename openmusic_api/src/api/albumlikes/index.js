const routes = require('./routes');
const Handler = require('./handler');

module.exports = {
  name: 'albumLikes',
  register: async (server, { albumsService, likesService }) => {
    const handler = new Handler(albumsService, likesService);
    server.route(routes(handler));
  },
};
