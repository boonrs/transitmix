app.BlurredLineView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);
  },

  render: function() {
    var coordinates = this.model.get('coordinates');
    var color = this.model.get('color');

    this.line = L.multiPolyline(coordinates, {
      color: color,
      opacity: 0.5,
      weight: 5,
    }).addTo(app.leaflet);

    this.line.on('click', this.jump, this);
  },

  updateCoordinates: function() {
    this.line.setLatLngs(this.model.get('coordinates'));
  },

  jump: function() {
    app.router.navigate(this.model.get('mapId') + '/' + this.model.id, { trigger: true });
  },

  remove: function() {
    this.line.off('click', this.jump, this);
    app.leaflet.removeLayer(this.line);
    
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});