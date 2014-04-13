TransitMix.HomeLineView = Backbone.View.extend({
  render: function() {
    var coordinates = this.model.get('allCoordinates');

    var options = {
      color: 'red',
      opacity: 0.5,
      weight: 5,
    };

    this.line = L.polyline(coordinates, options).addTo(TransitMix.map);
    this.line.on('click', this.jump, this);
  },

  jump: function() {
    app.router.navigate('-/' + this.model.id, { trigger: true });
  },

  remove: function() {
    this.line.off('click', this.jump, this);
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});