app.LineView = Backbone.View.extend({

  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);

    _.bindAll(this, 'addPoint', 'updatePoint', 'removePoint', 'redrawMarkers',
      'delayedRedrawMarkers', 'showDrawingLine');
    this.throttledUpdatePoint = _.throttle(this.updatePoint, 150);
    this.throttledShowDrawingLine = _.throttle(this.showDrawingLine, 150);

    this.isDrawing = false;
    this.markers = [];
  },

  render: function() {
    var coordinates = this.model.get('coordinates');
    var color = this.model.get('color');

    this.line = L.multiPolyline(coordinates, {
      color: '#' + color,
      opacity: 1,
      weight: 10,
    }).addTo(app.map);

    this.redrawMarkers();
    if (coordinates.length < 2) this.startDrawing();
  },

  updateCoordinates: function() {
    this.line.setLatLngs(this.model.get('coordinates'));
  },

  // Markers are the small circles added on top of the line, letting users
  // drag and click to reroute the transit line. They each know their 
  // pointIndex, allowing them to interact with the underlying model.
  addMarker: function(latlng, pointIndex) {
    var color = this.model.get('color');
    var html = '<div class="mapMarker" style="background:#' + color + '"></div>';
    var icon = L.divIcon({ className: '',  html: html });

    var marker = L.marker(latlng, {
      icon: icon,
      draggable: true,
    }).addTo(app.map);

    marker.pointIndex = pointIndex;
    marker.on('click', _.bind(this.removePoint, this));
    marker.on('drag', this.throttledUpdatePoint);
    marker.on('dragend', this.delayedRedrawMarkers);

    this.markers.push(marker);
  },

  redrawMarkers: function() {
    this.markers.forEach(function(marker) {
      app.map.removeLayer(marker);
    });

    var points = this.model.getPoints();
    points.forEach(function(latlng, pointIndex) {
      this.addMarker(latlng, pointIndex);
    }, this);
  },

  delayedRedrawMarkers: function() {
    _.delay(this.redrawMarkers, 500);
  },

  // The functions below react to events on the markers to modify
  // the underlying model.
  addPoint: function(event) {
    this.model.addPoint(event.latlng);
    this.addMarker(event.latlng, this.markers.length);
  },

  updatePoint: function(event) {
    this.model.updatePoint(event.target._latlng, event.target.pointIndex);
  },

  insertPoint: function(event) {
    // ????
  },

  removePoint: function(event) {
    // Removes a point when clicked. There's an exception: in drawing mode
    // we instead allow the user to click the first or last marker to end drawing.
    var marker = event.target;
    var firstMarker = marker === _.first(this.markers);
    var lastMarker = marker === _.last(this.markers);

    if (this.isDrawing) {
      if (firstMarker || lastMarker) this.stopDrawing();
    } else {
      this.model.removePoint(marker.pointIndex);
      this.redrawMarkers();
    }
  },

  // When a transit line is first created, it is in drawing mode. Anywhere
  // a user clicks a point is added, and the connecting line is always shown
  startDrawing: function() {
    this.isDrawing = true;
    $(app.map._container).addClass('drawCursor');

    app.map.on('click', this.addPoint);
    app.map.on('mousemove', this.throttledShowDrawingLine);

    this.drawingLine = L.polyline([], {
      color: '#' + this.model.get('color'),
      opacity: 1,
      weight: 10,
    }).addTo(app.map);
  },

  showDrawingLine: function(event) {
    var coordinates = this.model.get('coordinates');
    if (coordinates.length === 0) return;

    app.utils.getRoute({
      from: _.last(this.model.getPoints()),
      to: _.values(event.latlng),
    }, function(coordinates) {
      this.drawingLine.setLatLngs(coordinates);
    }, this);
  },

  stopDrawing: function() {
    this.isDrawing = false;
    $(app.map._container).removeClass('drawCursor');

    app.map.off('click', this.addPoint, this);
    app.map.off('mousemove', this.throttledShowDrawingLine, this);
    if (this.drawingLine) app.map.removeLayer(this.drawingLine);
  },

  // Utility functions
  remove: function() {
    this.stopDrawing();
    this.markers.forEach(function(m) { app.map.removeLayer(m); });
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },

  // _getIndexOfLayerInLine: function(layer) {
  //   var lineLayers = this.line.getLayers();
  //   for (var i = 0; i < lineLayers.length; i++) {
  //     if (layer === lineLayers[i]) return i;
  //   }
  //   return -1;
  // },
});

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
