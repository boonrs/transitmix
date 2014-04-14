app.LineView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, 'change:latlngs', this.updateLatlngs);
    this.throttledShowPredicts = _.throttle(this.showPredicts, 100);
  },

  render: function() {
    var points = this.model.get('points');
    var latlngs = this.model.get('latlngs');
    var color = this.model.get('color');

    // A line showing the main proposed transit route .
    this.line = L.polyline(latlngs, options = {
      color: '#' + color,
      opacity: 1,
      weight: 10,
    }).addTo(app.map);

    // Markers at each user-added point. Used for editing.
    this.markers = [];
    points.forEach(function(p) {
      this.addMarker(p);
    }, this);

    // Jump into drawing mode for newly created lines
    if (points.length < 2) this.startDrawing();
  },

  updateLatlngs: function() {
    var latlngs = this.model.get('latlngs');
    this.line.setLatLngs(latlngs);
  },

  startDrawing: function() {
    $(app.map._container).addClass('drawCursor');
    
    app.map.on('click', this.addPoint, this);
    app.map.on('dblclick', this.stopDrawing, this);
    app.map.on('mousemove', this.throttledShowPredicts, this);

    this.predictLine = L.polyline([], {
      color: '#' + this.model.get('color'),
      opacity: 0.5,
      weight: 10,
    }).addTo(app.map);
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
    this.addMarker(event.latlng);
  },

  stopDrawing: function() {
    $(app.map._container).removeClass('drawCursor');
    app.map.off('click', this.addPoint, this);
    app.map.off('mousemove', this.throttledShowPredicts, this);
    if (this.predictLine) app.map.removeLayer(this.predictLine);
  },

  // Markers are user-clicked locations, used for dragging and editing lines
  addMarker: function(point) {
    var color = this.model.get('color');
    var icon = L.divIcon({
      className: '',
      html: '<div class="mapMarker" style="background:#' + color + '"></div>'
    });
    var marker = L.marker(point, { icon: icon, draggable: true, }).addTo(app.map);
    marker.on('click', _.bind(this.clickMarker, this));
    this.markers.push(marker);    
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
    this.markers.forEach(function(m) { app.map.removeLayer(m) });
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});