const routes = (handler) => ([
  { method: 'POST', path: '/users', handler: (r,h)=>handler.postUserHandler(r,h) },
]);
module.exports = routes;
