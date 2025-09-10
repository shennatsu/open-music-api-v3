const routes = (handler) => [
  { method: 'POST', path: '/albums/{id}/likes', handler: (r, h) => handler.postLikeHandler(r, h), options: { auth: 'openmusic_jwt' } },
  { method: 'DELETE', path: '/albums/{id}/likes', handler: (r, h) => handler.deleteLikeHandler(r, h), options: { auth: 'openmusic_jwt' } },
  { method: 'GET', path: '/albums/{id}/likes', handler: (r, h) => handler.getLikesHandler(r, h) },
];
module.exports = routes;
