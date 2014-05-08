app.Map = Backbone.Model.extend({
  urlRoot: '/api/maps',

  defaults: {
    name: '',
    center: [],
    lines: {},
    zoomLevel: 14,
  },

  // TODO: Drop the parse and toJSON when we switch to camelcase
  parse: function(response) {
    response.lines = new app.Lines(response.lines);
    return response;
  },

  // A specific model in the collection can be selected. This lets
  // views quickly switch between the map the details of a single line.
  select: function(lineId) {
    if (this.selected && lineId === this.selected.id) return;

    var lines =  this.get('lines');
    this.selected = lines.get(lineId);
    this.trigger('select');
  },

  unselect: function() {
    if (!this.selected) return;

    this.selected = false;
    this.trigger('unselect');
  },

  getSelected: function() {
    return this.selected;
  }
});
