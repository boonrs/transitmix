app.Line = Backbone.Model.extend({
  _parse_class_name: 'Line',

  defaults: function() {
    // For now, just randomly assign each line a color.
    // Colors are: red, green, purple, blue
    var colors = ['AD0101', '0D7215', '4E0963', '0071CA'];
    var randomColor = _.sample(colors);

    return {
      name: 'Untitled Line',
      description: 'Click to add description.',
      frequency: 30,
      speed: 25,
      startTime: '8am',
      endTime: '8pm',
      color: randomColor,
      coordinates: [], // A GeoJSON MultiLineString
    };
  },

  // Extends the line to the given point, intelligently routing in between
  extendLine: function(toPoint) {
    var coordinates = _.clone(this.get('coordinates'));

    if (coordinates.length === 0) {
      coordinates.push([toPoint]);
      this.save({coordinates: coordinates});
      return;
    }

    this.getRoute({
      from: this.getLastPoint(),
      to: toPoint,
    }, function(route) {
      coordinates.push(route);
      this.save({coordinates: coordinates});
    });
  },

  rerouteLine: function(newLatLng, segmentIndex) {
    if (segmentIndex === 0) {
      this._rerouteLineStart(newLatLng);
    } else if (segmentIndex === this.get('coordinates').length - 1) {
      this._rerouteLineEnd(newLatLng);
    } else {
      this._rerouteLineMiddle(newLatLng, segmentIndex);
    }
  },

  _rerouteLineStart: function(newLatLng) {
    // If the first point is moved, need to:
    //     * Move the single point in the first segment
    //     * Reroute the second segment
    var coordinates = _.clone(this.get('coordinates'));
    var firstFullSegment = coordinates[1]; // since first segment only has first point

    this.getRoute({
      from: newLatLng,
      to: _.last(firstFullSegment)
    }, function(route) {
      // first segment is only the first point
      // second segment is path from first point to second point
      coordinates[0] = [route[0]];
      coordinates[1] = route;
      this.save({coordinates: coordinates});
    });
  },

  _rerouteLineMiddle: function(newLatLng, segmentIndex) {
    var coordinates = _.clone(this.get('coordinates'));

    var prev = _.last(coordinates[segmentIndex - 1]);
    var next = _.last(coordinates[segmentIndex + 1]);

    this.getRoute({
      from: prev,
      via: newLatLng,
      to: next,
    }, function(route) {
      var index = app.utils.indexOfClosest(route, newLatLng);
      coordinates[segmentIndex] = route.slice(0, index + 1);
      coordinates[segmentIndex + 1] = route.slice(index);
      this.save({coordinates: coordinates});
    });
  },

  _rerouteLineEnd: function(newLatLng) {
    var coordinates = _.clone(this.get('coordinates'));
    var lastSegment = _.last(coordinates);

    this.getRoute({
      from: lastSegment[0],
      to: newLatLng
    }, function(route) {
      var lastIndex = coordinates.length - 1;
      coordinates[lastIndex] = route;
      this.save({coordinates: coordinates});
    })
  },

  // Adds a new point in the middle of the line
  insertPoint: function(newPoint, segmentIndex) {
    var coordinates = _.clone(this.get('coordinates'));

    var startPoint = _.first(coordinates[segmentIndex]);

    var newSegment = [startPoint, newPoint];

    coordinates.splice(segmentIndex, 0, newSegment);
    
    this.set({coordinates: coordinates}, {silent: true});
    this.rerouteLine(newPoint, segmentIndex);

  },

  // Deletes a point
  removePoint: function(segmentIndex) {
    var coordinates = _.clone(this.get('coordinates'));

    if (segmentIndex === 0) {
      // Drop the first segment, make the second segment just the last point
      coordinates.splice(0, 1);
      var firstPoint = _.last(coordinates[0]);
      coordinates[0] = [firstPoint];

      this.save({coordinates: coordinates});
      return;
    }

    if (segmentIndex === coordinates.length - 1) {
      // Just drop the last segment
      coordinates.splice(segmentIndex, 1);
      this.save({coordinates: coordinates});
      return;
    }

    coordinates.splice(segmentIndex, 1);
    this.set({coordinates: coordinates}, {silent: true});

    var newLastPoint = _.last(coordinates[segmentIndex]);
    this.rerouteLine(newLastPoint, segmentIndex);
  },

  // Returns a set of coordinates that connect between 'from' and 'to' points
  // If no from point is given, the line's last point is assumed.
  // E.g. getRoute({from: [20, 30], to: [23, 40]}, callback)
  // To and From are required, via is optional
  getRoute: function(points, callback) {
    var routingUrl = 'http://router.project-osrm.org/viaroute?loc=' +
      points.from[0] + ',' + points.from[1];
    if (points.via) routingUrl += '&loc=' + points.via[0] + ',' + points.via[1];
    routingUrl += '&loc=' + points.to[0] + ',' + points.to[1];

    callback = _.bind(callback, this);
    $.getJSON(routingUrl, function(route) {
      var coordinates = app.utils.decodeGeometry(route.route_geometry);
      callback(coordinates);
    });
  },

  getPoint: function(index) {
    var coordinates = this.get('coordinates');
    return _.last(coordinates[index]);
  },

  getPoints: function() {
    var coordinates = this.get('coordinates');
    return _.map(coordinates, _.last);
  },

  getLastPoint: function() {
    var lastSegment = _.last(this.get('coordinates'));
    return _.last(lastSegment);
  },

  calculateDistance: function() {
    var coordinates = this.get('coordinates');
    var flat = _.flatten(coordinates, true);
    return app.utils.calculateDistance(flat);
  },

  calculateCost: function() {

  },
});
