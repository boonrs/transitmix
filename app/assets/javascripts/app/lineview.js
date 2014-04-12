app.LineView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, 'change:allCoordinates', this.updateCoordinates);
  },

  render: function() {
    var keyCoordinates = this.model.get('keyCoordinates');
    if (keyCoordinates.length < 2) this.startDrawing();

    // draw the coordinates as a line, and the key coordinates as circles above it
    var latlngs = this.model.get('allCoordinates');

    var options = {
      color: 'red',
      opacity: 1,
      weight: 10,
    };

    this.line = L.polyline(latlngs, options).addTo(app.map);
  },

  updateCoordinates: function() {
    this.line.setLatLngs(this.model.get('allCoordinates'));
  },

  startDrawing: function() {
    app.map.on('click', this.addPoint, this);
    app.map.on('mousemove', this.showPredicts, this);
    $('body').append('<div class="drawBall"></div>');
  },

  showPredicts: function(event) {
    console.log(event);
  },

  addPoint: function(event) {
    this.model.addPoint(event.latlng);
  },

  stopDrawing: function() {
    app.map.off('click', this.addPoint, this);
    app.map.off('mousemove', this.showPredicts, this);
  },

  remove: function() {
    this.stopDrawing();
    
    this.line.off('click');
    app.map.removeLayer(this.line);

    Backbone.View.prototype.remove.apply(this, arguments);
  },
});


