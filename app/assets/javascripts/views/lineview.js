app.LineView = Backbone.View.extend({

  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);
    this.throttledShowPredicts = _.throttle(this.showPredicts, 150);
    this.throttledReroute = _.throttle(this.reroute, 150);
    this.isDrawing = false;
    this.markers = [];
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

    this.redrawMarkers();

    // Marker for point to be added in the middle
    /*var markerIcon = L.divIcon({
      className: 'midpointIcon',
      html: '<div class="mapMarker" style="pointer-events: none; background:#' + color + '"></div>'
    });

    this.midpointMarker = L.marker([0,0], {
      opacity: 0,
      icon: markerIcon
    }).addTo(app.map);*/

    //var throttledHandler = _.throttle(this.updateMidpointMarker, 5);
    //this.line.on("mouseover mousemove mouseout", this.updateMidpointMarker, this);
    this.line.getLayers().forEach(function(layer) {
      layer.on("mousedown", this.addMidpoint, this);
    }, this);

    // Jump into drawing mode for newly created lines
    if (coordinates.length < 2) this.startDrawing();
  },

  updateCoordinates: function() {
    var coordinates = this.model.get('coordinates');
    this.line.setLatLngs(coordinates);

  },

  redrawMarkers: function() {
    // Markers at each user-added point. Used for editing.
    this.markers.forEach(function(marker) {
      app.map.removeLayer(marker);
    })

    var points = this.model.getPoints();
    points.forEach(function(point, segmentIndex) {
      this.addMarker(point, segmentIndex);
    }, this);
  },

  updateMidpointMarker: function(event) {
    if (event.type == "mouseover") {
      this.midpointMarker.setOpacity(0.6);
    }

    console.log(event, this.line);
    this.midpointMarker.setLatLng(event.latlng);
  },

  addMidpoint: function(event) {
    console.log(event);
    var newPoint = app.utils.cleanPoint(event.latlng);

    // Index of the segment that was clicked in
    var segmentIndex = this._getIndexOfLayerInLine(event.target, this.line);
    this.model.insertPoint(newPoint, segmentIndex);
    this.addMarker(newPoint, segmentIndex);
    
    this.redrawMarkers();
  },

  _getIndexOfLayerInLine: function(layer, line) {
    console.log(layer, line, line.getLayers());
    var lineLayers = line.getLayers();
    for (var i = 0; i < lineLayers.length; i++) {
      if (layer === lineLayers[i]) {
        return i;
      }
    }
  },

  startDrawing: function() {
    this.isDrawing = true;
    $(app.map._container).addClass('drawCursor');

    app.map.on('click', this.addPoint, this);
    app.map.on('mousemove', this.throttledShowPredicts, this);

    this.predictLine = L.polyline([], {
      color: '#' + this.model.get('color'),
      opacity: 1,
      weight: 10,
    }).addTo(app.map);
  },

  showPredicts: function(event) {
    var coordinates = this.model.get('coordinates');
    if (coordinates.length === 0) return;

    var mousePoint = app.utils.cleanPoint(event.latlng);
    var points = {
      from: this.model.getLastPoint(),
      to: mousePoint,
    };

    var predictLine = this.predictLine;
    this.model.getRoute(points, function(coordinates) {
      predictLine.setLatLngs(coordinates);
    });
  },

  addPoint: function(event) {
    var point = app.utils.cleanPoint(event.latlng);
    this.model.extendLine(point);
    var index = this.markers.length;
    this.addMarker(point, index);
  },

  stopDrawing: function() {
    this.isDrawing = false;
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
    marker.on('drag', _.bind(this.throttledReroute, this));
    marker.on('dragend', _.bind(this.adjustMarker, this));
    marker.on('mousedown', function() { console.log("mousedown on marker");});

    marker.index = index;
    this.markers.push(marker);
  },

  clickMarker: function(event) {
    console.log(event.target.index);
    var marker = event.target;
    var firstOrLastMarker = marker === _.first(this.markers) || marker === _.last(this.markers);
    if (this.isDrawing && firstOrLastMarker) {
      this.stopDrawing();
    } else {
      console.log('delete this point');
      this.model.removePoint(marker.index);
    }
  },

  reroute: function(event) {
    var marker = event.target;
    var point = app.utils.cleanPoint(marker._latlng);
    this.model.rerouteLine(point, marker.index);
  },

  adjustMarker: function(event) {
    var marker = event.target;
    var index = marker.index;
    var point = this.model.getPoint(index);

    setTimeout(function() {
      marker.setLatLng(point);
    }, 300);
  },

  remove: function() {
    this.stopDrawing();
    this.markers.forEach(function(m) { app.map.removeLayer(m) });
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});
