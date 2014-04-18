app.LineView = Backbone.View.extend({

  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);

    _.bindAll(this, 'addPoint', 'updatePoint', 'removePoint', 'redrawMarkers',
      'delayedRedrawMarkers', 'showDrawingLine', 'showInsert', 'beginInsert',
      'updateInsert','finishInsert', 'hideInsert');
    this.throttledUpdatePoint = _.throttle(this.updatePoint, 150);
    this.throttledShowDrawingLine = _.throttle(this.showDrawingLine, 150);
    this.throttledUpdateInsert = _.throttle(this.updateInsert, 150);

    this.markers = [];
    this.isDrawing = false;
    this.isInserting = false;
  },

  render: function() {
    var coordinates = this.model.get('coordinates');

    this.line = L.multiPolyline(coordinates, {
      color: this.model.get('color'),
      opacity: 1,
      weight: 10,
    }).addTo(app.map);

    this.hookupInsert();
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
    var html = '<div class="mapMarker" style="background:' + color + '"></div>';
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

  removePoint: function(event) {
    // Removes a point when clicked. There's an exception: in drawing mode
    // we  allow the user to click the first or last marker to end drawing.
    var marker = event.target;
    var firstMarker = marker === _.first(this.markers);
    var lastMarker = marker === _.last(this.markers);

    if (this.isDrawing) {
      if (firstMarker || lastMarker) this.stopDrawing();
    } else {
      this.model.removePoint(marker.pointIndex);
      this.redrawMarkers();
    }

    // Edge case where you hover to insert, then click a nearby
    // marker to delete, leaving the insertMarker stranded
    this.hideInsert();
  },

  // When a transit line is first created, it is in drawing mode. Anywhere
  // a user clicks a point is added, and the connecting line is always shown
  startDrawing: function() {
    this.isDrawing = true;
    $(app.map._container).addClass('drawCursor');

    app.map.on('click', this.addPoint);
    app.map.on('mousemove', this.throttledShowDrawingLine);

    this.drawingLine = L.polyline([], {
      color: this.model.get('color'),
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

  // When a user hovers over the line, we show a new marker, and allow
  // them to drag it to insert a new point. The following functions 
  // support this.
  hookupInsert: function() {
    // Insert requires a careful dance of DOM events. On mouseover, 
    // we show the UI. We hide it when the mouse moves over the map, so
    // we have to silence mousemove on the line, and the insertMarker itself.
    // BUT, we need mousemove to understand drag, so we re-enable it as 
    // soon as we hear a mousedown. See showInsert for the full set of events.
    this.line.on('mouseover', this.showInsert);
    this.line.on('mousemove', function(event) {
      L.DomEvent.stop(event.originalEvent);
    });
  },

  showInsert: function(event) {
    if (this.isDrawing) return;
    if (this.isInserting) return;

    if (this.insertMarker) {
      this.insertMarker.setLatLng(event.latlng);
      this.insertMarker.pointIndex = this._findPointIndex(event.layer);
      return;
    }

    var color = this.model.get('color');
    var html = '<div class="mapMarker" style="background:' + color + '"></div>';
    var icon = L.divIcon({ className: '',  html: html });

    var insertMarker = this.insertMarker = L.marker(event.latlng, {
      icon: icon,
      draggable: true,
    }).addTo(app.map);

    insertMarker.pointIndex = this._findPointIndex(event.layer);
    insertMarker.on('dragstart', this.beginInsert);
    insertMarker.on('drag', this.throttledUpdateInsert);
    insertMarker.on('dragend', this.finishInsert);

    // Prevent mousemove from propagating to the map, but re-enable it on
    // mousedown for drag support. See hookupInsert for full description.
    app.map.on('mousemove', this.hideInsert);
    L.DomEvent.addListener(insertMarker._icon, 'mousemove', L.DomEvent.stop);
    L.DomEvent.addListener(insertMarker._icon, 'mousedown', function() {
      app.map.off('mousemove', this.removeInsert);
      L.DomEvent.removeListener(insertMarker._icon, 'mousemove', L.DomEvent.stop);
    });
  },

  beginInsert: function(event) {
    this.isInserting = true;
    this.model.insertPoint(event.target._latlng, event.target.pointIndex);
  },

  updateInsert: function(event) {
    this.model.updatePoint(event.target._latlng, event.target.pointIndex);
  },

  finishInsert: function(event) {
    this.isInserting = false;
    this.model.updatePoint(event.target._latlng, event.target.pointIndex);
    this.delayedRedrawMarkers();
    this.hideInsert();
  },

  hideInsert: function() {
    if (this.insertMarker) {
      app.map.removeLayer(this.insertMarker);
      this.insertMarker = false;
      app.map.off('mousemove', this.removeInsert);
    }
  },

  // Utility functions
  remove: function() {
    this.stopDrawing();
    this.markers.forEach(function(m) { app.map.removeLayer(m); });
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },

  _findPointIndex: function(layer) {
    var lineLayers = this.line.getLayers();
    for (var i = 0; i < lineLayers.length; i++) {
      if (layer === lineLayers[i]) return i;
    }
    return -1;
  },
});