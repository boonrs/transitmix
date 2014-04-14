app.LineView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, 'change:latlngs', this.updateLatlngs);
  },

  render: function() {
    var points = this.model.get('points');
    if (points.length < 2) this.startDrawing();

    // draw the coordinates as a line, and the key coordinates as circles above it
    var latlngs = this.model.get('latlngs');
    this.markers = [];
    var color = this.model.get('color');

    this.line = L.polyline(latlngs, options = {
      color: '#' + color,
      opacity: 1,
      weight: 10,
    }).addTo(app.map);

    this.model.get('points').forEach(function(p) {
      this.addMarker(p);
    }, this);
  },

  updateLatlngs: function() {
    this.line.setLatLngs(this.model.get('latlngs'));
  },

  startDrawing: function() {
    $(app.map._container).addClass('drawCursor');
    app.map.on('click', this.addPoint, this);
    this.throttledShowPredicts =  _.throttle(this.showPredicts, 100);
    app.map.on('dblclick', this.stopDrawing, this);
    app.map.on('mousemove', this.throttledShowPredicts, this);

    this.predictLine = L.polyline([], {
      color: '#' + this.model.get('color'),
      opacity: 0.5,
      weight: 10,
    }).addTo(app.map);

    //$('body').append('<div class="drawBall"></div>');
  },

  showPredicts: function(event) {
    if (this.model.get('points').length === 0) return;
    
    var predictLine = this.predictLine;
    this.model.getRoute(event.latlng, function(latlngs) {
      predictLine.setLatLngs(latlngs)
    });
  },

  addPoint: function(event) {
    this.model.addPoint(event.latlng);
  },

  addMarker: function(point) {
    var icon = L.divIcon({ className: "line-point-icon", html: '<div class="point-icon-inner" style="background:#' + this.model.get('color')+ '"></div>' })
    var marker = L.marker(point, { icon: icon }).addTo(app.map);
    this.markers.push(marker);
    marker.on('click', _.bind(this.clickMarker, this));
  },

  stopDrawing: function() {
    $(app.map._container).removeClass('drawCursor');
    app.map.off('click', this.addPoint, this);
    app.map.off('mousemove', this.throttledShowPredicts, this);
    if (this.predictLine) app.map.removeLayer(this.predictLine);
  },

  clickMarker: function(event) {
    var marker = event.target;
    if (marker === _.first(this.markers) || marker === _.last(this.markers)) {
      this.stopDrawing();
    }
  },

  remove: function() {
    this.stopDrawing();
    
    this.line.off('click');
    app.map.removeLayer(this.line);

    Backbone.View.prototype.remove.apply(this, arguments);
  },
});