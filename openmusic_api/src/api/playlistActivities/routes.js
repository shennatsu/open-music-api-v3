const routes = (h) => ([
  { method:'GET', path:'/playlists/{id}/activities', handler:(r,rs)=>h.getActivitiesHandler(r,rs), options:{ auth:'openmusic_jwt' } },
]);
module.exports = routes;
