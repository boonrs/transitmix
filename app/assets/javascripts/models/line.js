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
    toPoint = app.utils.cleanPoint(toPoint);
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

  rerouteLine: function(viaPoint, pointIndex) {
    var coordinates = _.clone(this.get('coordinates'));
    var previousPoint = _.last(coordinates[pointIndex - 1]);

    this.getRoute({
      from: previousPoint,
      to: viaPoint,
    }, function(route) {
      coordinates[pointIndex] = route;
      this.save({coordinates: coordinates});
    })
  },

  // Returns a set of coordinates that connect between 'from' and 'to' points
  // If no from point is given, the line's last point is assumed.
  // E.g. getRoute({from: [20, 30], to: [23, 40]}, callback)
  getRoute: function(points, callback) {
    var fromPoint = app.utils.cleanPoint(points.from);
    var toPoint = app.utils.cleanPoint(points.to);
  
    var routingUrl = "http://router.project-osrm.org/viaroute?loc=" +
      fromPoint[0] + "," + fromPoint[1] + "&loc=" + toPoint[0] + "," + toPoint[1];

    callback = _.bind(callback, this);
    $.getJSON(routingUrl, function(route) {
      var geometry = route.route_geometry;
      var coordinates = app.utils.decodeGeometry(geometry);
      callback(coordinates);
    });
  },

  getLastPoint: function() {
    var lastSegment = _.last(this.get('coordinates'));
    var lastPoint = _.last(lastSegment);
    return lastPoint;
  },

  calculateDistance: function() {
    var coordinates = this.get('coordinates');
    var flat = _.flatten(coordinates, true);
    return app.utils.calculateDistance(flat);
  },

  calculateCost: function() {

  },
});