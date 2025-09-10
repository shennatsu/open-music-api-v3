const routes = require('./routes');
const Handler = require('./handler');

module.exports = {
  name: 'playlistActivities',
  register: async (server, { playlistsService, activitiesService }) => {
    const handler = new Handler(playlistsService, activitiesService);
    server.route(routes(handler));
  },
};
