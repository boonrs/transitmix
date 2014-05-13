app.LineView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);
    this.listenTo(this.model, 'destroy', this.remove);
  },

  render: function() {
    var coordinates = this.model.get('coordinates');
    var color = this.model.get('color');

    this.line = L.multiPolyline(coordinates, {
      color: color,
      opacity: 0.5,
      weight: 5,
    }).addTo(app.leaflet);

    this.line.on('click', this.select, this);
  },

  updateCoordinates: function() {
    this.line.setLatLngs(this.model.get('coordinates'));
  },

  select: function() {
    var fragment = 'map/' + this.model.get('mapId') + '/line/' + this.model.id;
    app.router.navigate(fragment, { trigger: true });
  },

  remove: function() {
    this.line.off('click', this.select, this);
    app.leaflet.removeLayer(this.line);
    
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});
