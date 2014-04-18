app.LineView = Backbone.View.extend({

  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);
    //this.throttledShowPredicts = _.throttle(this.showPredicts, 150);
    this.throttledReroute = _.throttle(this.reroute, 150);
    this.isDrawing = false;
    this.markers = [];
  },

  render: function() {
    var color = this.model.get('color');

    // A line showing the main proposed transit route .
    this.line = L.multiPolyline({}, {
      color: '#' + color,
      opacity: 1,
      weight: 10,
    }).addTo(app.map);

    this.updateCoordinates();
    this.redrawMarkers();

    // this.line.on('mouseover', this.showInsertionMarker, this);

    var coordinates = this.model.get('coordinates');
    if (coordinates.length < 2) this.startDrawing();
  },

  // showInsertionMarker: function(event) {
  //   if (this.insertionMarker) return;
  //   var segmentIndex = this._getIndexOfLayerInLine(event.layer);

  //    var icon = L.divIcon({
  //     className: '',
  //     html: '<div class="mapMarker" style="background:#' + this.model.get('color') + '"></div>'
  //   });

  //   var a = this.model.getPoint(segmentIndex - 1);
  //   var b = this.model.getPoint(segmentIndex);
  //   var onLine = this.closestOnSegment(app.map, app.utils.cleanPoint(event.latlng), a, b);
  //   console.log(event);

  //   this.insertionMarker = L.marker(onLine, {
  //     opacity: 0.5,
  //     icon: icon,
  //     draggable: true,
  //   }).addTo(app.map);

  //   this.insertionMarker.index = segmentIndex;
  //   var throttled = _.throttle(_.bind(this.model.updatePoint, this.model), 100);
  //   // this.insertionMarker.on('mouseout', this.removeInsertionMarker, this);
  //   this.insertionMarker.on('dragstart', _.bind(function(event) {
  //     console.log()
  //     var point = app.utils.cleanPoint(event.target._latlng);
  //     this.model.insertPoint(point, segmentIndex)
  //   }, this));
  //   this.insertionMarker.on('drag', _.bind(function(event) {
  //     var point = app.utils.cleanPoint(event.target._latlng);
  //     // this.model.updatePoint(point, segmentIndex);
  //     throttled(point, segmentIndex);
  //   }, this));

  //   this.insertionMarker.on('dragend', _.bind(function() {
  //     this.redrawMarkers();
  //   }, this));
  // },

  // updateInsertionMarker: function(event) {
  //   if (!this.insertionMarker) return;
  //   this.insertionMarker.setLatLng(event.latlng);
  // },

  // removeInsertionMarker: function(event) {
  //   if (!this.insertionMarker) return;
  //   app.map.removeLayer(this.insertionMarker);
  // },

  updateCoordinates: function() {
    this.line.setLatLngs(this.model.get('coordinates'));
  },

  redrawMarkers: function() {
    this.markers.forEach(function(marker) {
      app.map.removeLayer(marker);
    });

    var points = this.model.getPoints();
    points.forEach(function(point, pointIndex) {
      this.addMarker(point, pointIndex);
    }, this);
  },

  _getIndexOfLayerInLine: function(layer) {
    var lineLayers = this.line.getLayers();
    for (var i = 0; i < lineLayers.length; i++) {
      if (layer === lineLayers[i]) return i;
    }
    return -1;
  },

  startDrawing: function() {
    this.isDrawing = true;
    $(app.map._container).addClass('drawCursor');

    app.map.on('click', this.addPoint, this);
    //app.map.on('mousemove', this.throttledShowPredicts, this);

    this.predictLine = L.polyline([], {
      color: '#' + this.model.get('color'),
      opacity: 1,
      weight: 10,
    }).addTo(app.map);
  },

  // showPredicts: function(event) {
  //   // var coordinates = this.model.get('coordinates');
  //   // if (coordinates.length === 0) return;

  //   // var mousePoint = app.utils.cleanPoint(event.latlng);
  //   // var points = {
  //   //   from: this.model.getLastPoint(),
  //   //   to: mousePoint,
  //   // };

  //   // var predictLine = this.predictLine;
  //   // this.model.getRoute(points, function(coordinates) {
  //   //   predictLine.setLatLngs(coordinates);
  //   // });
  // },

  addPoint: function(event) {
    var point = app.utils.cleanPoint(event.latlng);
    this.model.addPoint(point);
    var index = this.markers.length;
    this.addMarker(point, index);
  },

  stopDrawing: function() {
    this.isDrawing = false;
    $(app.map._container).removeClass('drawCursor');
    app.map.off('click', this.addPoint, this);
    //app.map.off('mousemove', this.throttledShowPredicts, this);
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
    marker.on('dragend', _.bind(this.redrawMarkers, this)); // TODO: add a delay, so the server response can come back first

    marker.index = index;
    this.markers.push(marker);
  },

  clickMarker: function(event) {
    var marker = event.target;
    var firstOrLastMarker = marker === _.first(this.markers) || marker === _.last(this.markers);

    if (this.isDrawing && firstOrLastMarker) {
      this.stopDrawing();
    } else {
      this.model.removePoint(marker.index);
      this.redrawMarkers();
    }
  },

  reroute: function(event) {
    var marker = event.target;
    var point = app.utils.cleanPoint(marker._latlng);
    this.model.updatePoint(point, marker.index);
  },

  remove: function() {
    this.stopDrawing();
    this.markers.forEach(function(m) { app.map.removeLayer(m); });
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});
