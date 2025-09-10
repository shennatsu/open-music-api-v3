const routes = require('./routes');
const Handler = require('./handler');

module.exports = {
  name: 'playlists',
  register: async (server, { service, songsService, validator }) => {
    const handler = new Handler(service, songsService, validator);
    server.route(routes(handler));
  },
};
