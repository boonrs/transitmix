app.Lines = Backbone.Collection.extend({
  model: app.Line,
  url: '/api/lines',
});