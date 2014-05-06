app.Maps = Backbone.Collection.extend({
  model: app.Map,
  url: '/api/maps',
});