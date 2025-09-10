const routes = require('./routes');
const Handler = require('./handler');

module.exports = {
  name: 'exports',
  register: async (server, { playlistsService, validator, producer }) => {
    const handler = new Handler(playlistsService, validator, producer);
    server.route(routes(handler));
  },
};
