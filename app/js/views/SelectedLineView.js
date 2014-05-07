app.SelectedLineView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCoordinates);

    _.bindAll(this, 'unselect', 'updateWaypoint', 'removeWaypoint',
      'redrawMarkers', 'delayedRedrawMarkers', 'draw', 'showDrawingLine',
      'stopDrawing', 'showInsert', 'beginInsert', 'updateInsert','finishInsert',
      'removeInsert');

    this.throttledUpdateWaypoint = _.throttle(this.updateWaypoint, 150);
    this.throttledShowDrawingLine = _.throttle(this.showDrawingLine, 150);
    this.throttledUpdateInsert = _.throttle(this.updateInsert, 150);

    this.markers = [];
    this.isDrawing = false;
    this.isInserting = false;

    // Click anywhere on the map to unselect
    app.leaflet.on('click', this.unselect);
  },

  render: function() {
    var coordinates = this.model.get('coordinates');

    this.line = L.multiPolyline(coordinates, {
      color: this.model.get('color'),
      opacity: 1,
      weight: 9,
    }).addTo(app.leaflet);

    this.hookupInsert();
    this.redrawMarkers();

    if (coordinates.length < 1) this.startDrawing();
  },

  updateCoordinates: function() {
    this.line.setLatLngs(this.model.get('coordinates'));
  },

  unselect: function() {
    if (this.isDrawing) return;
    app.router.navigate('map/' + this.model.get('mapId'), { trigger: true });
  },

  // Markers & Marker Events
  // -----------------------
  // Markers are the small circles added on top of the line, letting users
  // drag and click to reroute the transit line. They each know their 
  // waypointIndex, allowing them to interact with the underlying model.

  addMarker: function(latlng, waypointIndex) {
    var color = app.utils.tweakColor(this.model.get('color'), -30);
    var html = '<div class="mapMarker" style="border-color:' + color + '"></div>';
    var icon = L.divIcon({ className: 'mapMarkerWrapper showMarkerTooltip',  html: html });

    var marker = L.marker(latlng, {
      icon: icon,
      draggable: true,
    }).addTo(app.leaflet);

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
      app.leaflet.removeLayer(marker);
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
    $(app.leaflet._container).addClass('showDrawingCursor');
    $('body').append('<div class="drawingInstructions">' +
      'Click the map to start drawing a transit line.</div>');
    app.leaflet.on('click', function() {
      $('.drawingInstructions').remove();
    });

    app.leaflet.on('click', this.draw);
    app.leaflet.on('mousemove', this.throttledShowDrawingLine);

    this.drawingLine = L.polyline([], {
      color: this.model.get('color'),
      opacity: 1,
      weight: 9,
    }).addTo(app.leaflet);
  },

  // Update the model with the click, and draw a dummy marker with different
  // interactions. When we're done drawing, draw in the real markers.
  draw: function(event) {
    this.model.addWaypoint(event.latlng);

    // Show the click-to-finish tooltip only on the last drawn marker,
    // and only if we've drawn at least two points.
    var prev = _.last(this.markers);
    if (prev) L.DomUtil.removeClass(prev._icon, 'showDrawingTooltip');

    var color = app.utils.tweakColor(this.model.get('color'), -30);
    var html = '<div class="mapMarker" style="border-color:' + color + '"></div>';
    var classNames = 'mapMarkerWrapper';
    if (this.markers.length > 0) classNames += ' showDrawingTooltip';
    var icon = L.divIcon({ className: classNames,  html: html });
    var marker = L.marker(event.latlng, { icon: icon }).addTo(app.leaflet);

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
    $(app.leaflet._container).removeClass('showDrawingCursor');
    $('.drawingInstructions').remove();
    app.leaflet.off('click', this.draw);
    app.leaflet.off('mousemove', this.throttledShowDrawingLine);
    if (this.drawingLine) app.leaflet.removeLayer(this.drawingLine);
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

    var html = '<div class="mapMarker"></div>';
    var icon = L.divIcon({ className: 'mapMarkerWrapper',  html: html });

    var insertMarker = this.insertMarker = L.marker(event.latlng, {
      icon: icon,
      draggable: true,
    }).addTo(app.leaflet);

    insertMarker.waypointIndex = this._findWaypointIndex(event.layer);
    insertMarker.on('dragstart', this.beginInsert);
    insertMarker.on('drag', this.throttledUpdateInsert);
    insertMarker.on('dragend', this.finishInsert);

    // Prevent mousemove from propagating to the map, but re-enable it on
    // mousedown for drag support. See hookupInsert for full description.
    app.leaflet.on('mousemove', this.removeInsert);
    L.DomEvent.addListener(insertMarker._icon, 'mousemove', L.DomEvent.stop);
    L.DomEvent.addListener(insertMarker._icon, 'mousedown', function() {
      app.leaflet.off('mousemove', this.removeInsert);
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
      app.leaflet.removeLayer(this.insertMarker);
      this.insertMarker = false;
      app.leaflet.off('mousemove', this.removeInsert);
    }
  },

  // Utility functions
  // -----------------
  
  remove: function() {
    this.removeDrawing();
    this.markers.forEach(function(m) { app.leaflet.removeLayer(m); });
    app.leaflet.removeLayer(this.line);
    app.leaflet.off('click', this.unselect);
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
