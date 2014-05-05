app.LineView = Backbone.View.extend({

  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);

    _.bindAll(this, 'updateWaypoint', 'removeWaypoint','redrawMarkers', 
      'delayedRedrawMarkers', 'draw', 'showDrawingLine', 'stopDrawing',
      'showInsert', 'beginInsert', 'updateInsert','finishInsert', 'removeInsert');
    this.throttledUpdateWaypoint = _.throttle(this.updateWaypoint, 150);
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
      weight: 9,
    }).addTo(app.map);

    this.hookupInsert();
    this.redrawMarkers();
    if (coordinates.length < 1) this.startDrawing();
  },

  updateCoordinates: function() {
    this.line.setLatLngs(this.model.get('coordinates'));
  },

  // Markers & Marker Events
  // -----------------------
  // Markers are the small circles added on top of the line, letting users
  // drag and click to reroute the transit line. They each know their 
  // waypointIndex, allowing them to interact with the underlying model.

  addMarker: function(latlng, waypointIndex) {
    var markerView = new app.MarkerView({
      color: this.model.get('color'),
      latlng: latlng,
      classNames: 'mapMarkerWrapper showMarkerTooltip',
      draggable: true,
      bordered: true,
      arrow: true
    })
    markerView.render();
    var marker = markerView.model;

    marker.waypointIndex = waypointIndex;
    marker.on('mousedown', function() {
      L.DomUtil.removeClass(marker._icon, 'showMarkerTooltip');
    });
    marker.on('click', _.bind(this.removeWaypoint, this));
    marker.on('drag', this.throttledUpdateWaypoint);
    marker.on('dragend', this.delayedRedrawMarkers);

    this.markers.push(marker);
  },

  redrawMarkers: function() {
    this.markers.forEach(function(marker) {
      app.map.removeLayer(marker);
    });
    this.markers = [];

    var waypoints = this.model.getWaypoints();
    waypoints.forEach(function(latlng, waypointIndex) {
      this.addMarker(latlng, waypointIndex);
    }, this);
  },

  delayedRedrawMarkers: function() {
    _.delay(this.redrawMarkers, 500);
  },

  updateWaypoint: function(event) {
    this.model.updateWaypoint(event.target._latlng, event.target.waypointIndex);
  },

  removeWaypoint: function(event) {
    var twoOrFewer = this.model.get('coordinates').length <= 2;

    if (twoOrFewer) {
      // If we're removing the secont-to-last waypoint, remove all
      // of them and re-enable drawing. One waypoint's no good at all.
      this.model.clearWaypoints();
      this.redrawMarkers();
      this.startDrawing();
    } else {
      this.model.removeWaypoint(event.target.waypointIndex);
      this.redrawMarkers();
    }

    // Edge case where you hover to insert, then click a nearby
    // marker to delete, leaving the insertMarker stranded
    this.removeInsert();
  },

  // Drawing
  // -------
  // When a transit line is first created, it is in drawing mode. Anywhere
  // a user clicks a waypoint is added, and the connecting line is always shown

  startDrawing: function() {
    this.isDrawing = true;

    // Simple UI for drawing mode. 
    $(app.map._container).addClass('showDrawingCursor');
    $('body').append('<div class="drawingInstructions">' +
      'Click the map to start drawing a transit line.</div>');
    app.map.on('click', function() {
      $('.drawingInstructions').remove();
    });

    app.map.on('click', this.draw);
    app.map.on('mousemove', this.throttledShowDrawingLine);

    this.drawingLine = L.polyline([], {
      color: this.model.get('color'),
      opacity: 1,
      weight: 9,
    }).addTo(app.map);
  },

  // Update the model with the click, and draw a dummy marker with different
  // interactions. When we're done drawing, draw in the real markers.
  draw: function(event) {
    this.model.addWaypoint(event.latlng);

    // Show the click-to-finish tooltip only on the last drawn marker,
    // and only if we've drawn at least two points.
    var prev = _.last(this.markers);
    if (prev) L.DomUtil.removeClass(prev._icon, 'showDrawingTooltip');

    var classNames = 'mapMarkerWrapper';
    if (this.markers.length > 0) classNames += ' showDrawingTooltip';
    var markerView = new app.MarkerView({
      color: this.model.get('color'),
      latlng: event.latlng,
      classNames: classNames,
      draggable: false,
      bordered: true,
      arrow: true
    })
    markerView.render();
    var marker = markerView.model;

    // Click any marker, but preferably the last one, to finish drawing.
    marker.on('click', this.stopDrawing);
    this.markers.push(marker);
  },

  showDrawingLine: function(event) {
    var coordinates = this.model.get('coordinates');
    if (coordinates.length === 0) return;

    app.utils.getRoute({
      from: _.last(this.model.getWaypoints()),
      to: _.values(event.latlng),
    }, function(coordinates) {
      this.drawingLine.setLatLngs(coordinates);
    }, this);
  },

  stopDrawing: function() {
    this.isDrawing = false;
    this.delayedRedrawMarkers();
    this.removeDrawing();
  },

  removeDrawing: function() {
    $(app.map._container).removeClass('showDrawingCursor');
    $('.drawingInstructions').remove();
    app.map.off('click', this.addWaypoint, this);
    app.map.off('mousemove', this.throttledShowDrawingLine, this);
    if (this.drawingLine) app.map.removeLayer(this.drawingLine);
  },

  // Inserting Waypoints
  // -------------------
  // When a user hovers over the line, we show a new marker, and allow
  // them to drag it to insert a new waypoint. The following functions 
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
      this.insertMarker.waypointIndex = this._findWaypointIndex(event.layer);
      return;
    }

    var markerView = new app.MarkerView({
      color: this.model.get('color'),
      latlng: event.latlng,
      classNames: 'mapMarkerWrapper',
      draggable: true,
      bordered: false,
      arrow: false
    })
    markerView.render();
    var insertMarker = this.insertMarker = markerView.model;

    insertMarker.waypointIndex = this._findWaypointIndex(event.layer);
    insertMarker.on('dragstart', this.beginInsert);
    insertMarker.on('drag', this.throttledUpdateInsert);
    insertMarker.on('dragend', this.finishInsert);

    // Prevent mousemove from propagating to the map, but re-enable it on
    // mousedown for drag support. See hookupInsert for full description.
    app.map.on('mousemove', this.removeInsert);
    L.DomEvent.addListener(insertMarker._icon, 'mousemove', L.DomEvent.stop);
    L.DomEvent.addListener(insertMarker._icon, 'mousedown', function() {
      app.map.off('mousemove', this.removeInsert);
      L.DomEvent.removeListener(insertMarker._icon, 'mousemove', L.DomEvent.stop);
    });

    // Edge case: click & don't drag. We only want to count click-and-drags,
    // so let's just hide the insertMarker when this happens.
    insertMarker.on('click', this.removeInsert);
  },

  beginInsert: function(event) {
    this.isInserting = true;
    this.model.insertWaypoint(event.target._latlng, event.target.waypointIndex);
  },

  updateInsert: function(event) {
    this.model.updateWaypoint(event.target._latlng, event.target.waypointIndex);
  },

  finishInsert: function(event) {
    this.isInserting = false;
    this.model.updateWaypoint(event.target._latlng, event.target.waypointIndex);
    this.delayedRedrawMarkers();
    this.removeInsert();
  },

  removeInsert: function() {
    if (this.insertMarker) {
      app.map.removeLayer(this.insertMarker);
      this.insertMarker = false;
      app.map.off('mousemove', this.removeInsert);
    }
  },

  // Utility functions
  // -----------------
  
  remove: function() {
    this.removeDrawing();
    this.markers.forEach(function(m) { app.map.removeLayer(m); });
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },

  _findWaypointIndex: function(layer) {
    var lineLayers = this.line.getLayers();
    for (var i = 0; i < lineLayers.length; i++) {
      if (layer === lineLayers[i]) return i;
    }
    return -1;
  },
});
