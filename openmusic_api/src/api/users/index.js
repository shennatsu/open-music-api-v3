const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'users',
  register: async (server, { service, validator }) => {
    const handler = new UsersHandler(service, validator);
    server.route(routes(handler));
  },
};
