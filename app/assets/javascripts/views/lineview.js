app.LineView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);
    this.throttledShowPredicts = _.throttle(this.showPredicts, 250);
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
    console.log(event);
    // if (this.model.get('coordinates').length === 0) return;
    // var point = app.utils.cleanPoint(event.latlng);
    // var predictLine = this.predictLine;

    /*
    the predictive lien varies based on what we're doing.
    if we're modifying
      first point
        from the cursor, to the next point
      middle point
        from the prev point, to the cursor, to the next point
      last point
        from prev point, to the cursor

    if we're drawing
      from the last point, to the cursor

    */

    var coordinates = this.model.get('coordinates');
    if (coordinates.length === 0) return;

    
    var points = {};

    if (event.type === 'drag') {
      var mousePoint = app.utils.cleanPoint(event.target._latlng);
      var index = event.target.index;
      var draggingFirst = (index === 0);
      var draggingLast = (index === coordinates.length);

      if (draggingFirst) {
        points = { from: mousePoint, to:this.model.getPoint(index + 1) };
      } else if (draggingLast) {
        points = { from: this.model.getPoint(index), to: mousePoint };
      } else {
        points = {
          from: this.model.getPoint(index - 1),
          via: mousePoint,
          to: this.model.getPoint(index + 1),
        };
      }
    } else {
      var mousePoint = app.utils.cleanPoint(event.latlng);
      points = {
        from: this.model.getLastPoint(),
        to: mousePoint,
      }
    }

    console.log(this.predictLine)
    var predictLine = this.predictLine;
    this.model.getRoute(points, function(coordinates) {
      predictLine.setLatLngs(coordinates)
    });
  },

  addPoint: function(event) {
    var point = app.utils.cleanPoint(event.latlng);
    this.model.extendLine(point);
    var index = this.model.get('coordinates').length - 1;
    console.log(index);
    this.addMarker(point, index);
  },

  stopDrawing: function() {
    $(app.map._container).removeClass('drawCursor');
    app.map.off('click', this.addPoint, this);
    app.map.off('mousemove', this.throttledShowPredicts, this);
    if (this.predictLine) app.map.removeLayer(this.predictLine);
  },

  // Markers are user-clicked locations, used for dragging and editing lines
  addMarker: function(point, index) {
    console.log('i at addmarker ' + index);
    var color = this.model.get('color');
    var icon = L.divIcon({
      className: '',
      html: '<div class="mapMarker" style="background:#' + color + '"></div>'
    });
    var marker = L.marker(point, { icon: icon, draggable: true, }).addTo(app.map);

    marker.on('click', _.bind(this.clickMarker, this));
    marker.on('dragstart', _.bind(this.startDrag, this));
    marker.on('drag', _.bind(this.throttledShowPredicts, this));
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

  startDrag: function() {
    this.predictLine = L.polyline([], {
      color: '#' + this.model.get('color'),
      opacity: 0.3,
      weight: 10,
    }).addTo(app.map);
  },

  dragMarker: function(event) {
    this.showPredicts(event);
  },

  finishDrag: function(event) {
    app.map.removeLayer(this.predictLine);
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
