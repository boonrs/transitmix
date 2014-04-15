app.LineView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);
    this.throttledShowPredicts = _.throttle(this.showPredicts, 100);
  },

  render: function() {
    var coordinates = this.model.get('coordinates');
    var color = this.model.get('color');

    // A line showing the main proposed transit route .
    this.line = L.multiPolyline(coordinates, options = {
      color: '#' + color,
      opacity: 1,
      weight: 10,
    }).addTo(app.map);

    // Markers at each user-added point. Used for editing.
    this.markers = [];
    coordinates.forEach(function(segment, index) {
      this.addMarker(_.last(segment), index);
    }, this);

    // Jump into drawing mode for newly created lines
    if (coordinates.length < 2) this.startDrawing();
  },

  updateCoordinates: function() {
    var coordinates = this.model.get('coordinates');
    this.line.setLatLngs(coordinates);
  },

  startDrawing: function() {
    $(app.map._container).addClass('drawCursor');

    app.map.on('click', this.addPoint, this);
    app.map.on('mousemove', this.throttledShowPredicts, this);

    this.predictLine = L.polyline([], {
      color: '#' + this.model.get('color'),
      opacity: 0.5,
      weight: 10,
    }).addTo(app.map);
  },

  showPredicts: function(event) {
    if (this.model.get('coordinates').length === 0) return;
    var point = app.utils.cleanPoint(event.latlng);
    var predictLine = this.predictLine;

    this.model.getRoute({
      from: this.model.getLastPoint(),
      to: point,
    }, function(coordinates) {
      predictLine.setLatLngs(coordinates)
    });
  },

  addPoint: function(event) {
    var point = app.utils.cleanPoint(event.latlng);
    this.model.extendLine(point);
    this.addMarker(point);
  },

  stopDrawing: function() {
    $(app.map._container).removeClass('drawCursor');
    app.map.off('click', this.addPoint, this);
    app.map.off('mousemove', this.throttledShowPredicts, this);
    if (this.predictLine) app.map.removeLayer(this.predictLine);
  },

  // Markers are user-clicked locations, used for dragging and editing lines
  addMarker: function(point, index) {
    var color = this.model.get('color');
    var icon = L.divIcon({
      className: '',
      html: '<div class="mapMarker" style="background:#' + color + '"></div>'
    });
    var marker = L.marker(point, { icon: icon, draggable: true, }).addTo(app.map);

    marker.on('click', _.bind(this.clickMarker, this));
    marker.on('drag', _.bind(this.dragMarker, this));
    marker.on('dragend', _.bind(this.finishDrag, this));

    marker.index = index;
    this.markers.push(marker);
  },

  clickMarker: function(event) {
    var marker = event.target;
    if (marker === _.first(this.markers) || marker === _.last(this.markers)) {
      this.stopDrawing();
    }
  },

  dragMarker: function() {
  
  },

  finishDrag: function(event) {
    var point = app.utils.cleanPoint(event.target._latlng);
    this.model.rerouteLine(point, event.target.index);
  },

  remove: function() {
    this.stopDrawing();
    this.line.off('click');
    this.markers.forEach(function(m) { app.map.removeLayer(m) });
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});