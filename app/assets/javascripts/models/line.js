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

  dropLastSegment: function() {
    var coordinates = _.clone(this.get('coordinates'));
    coordinates.pop();
    this.set({coordinates: coordinates});
  },

  rerouteLine: function(via, pointIndex) {
    // var coordinates = this.get('coordinates');

    // if (pointIndex === 0) {
    //   this.dropFirstLine(); //silent
    //   this.prependLine(via);
    //   return;
    // }

    // if (pointIndex === coordinates.length - 1) {
    //   this.dropLastSegment(); //silent
    //   this.extendLine(via);
    //   return;
    // }
    /*
    edge cases:
      first point
        route just from 
      last point
    */


    var coordinates = _.clone(this.get('coordinates'));
    var prev = _.last(coordinates[pointIndex - 1]);
    var next = _.last(coordinates[pointIndex + 1]);

    this.getRoute({
      from: prev,
      via: via,
      to: next,
    }, function(route) {
      var index = app.utils.indexOfClosest(route, via);
      coordinates[pointIndex] = route.slice(0, index + 1);
      coordinates[pointIndex + 1] = route.slice(index);
      this.save({coordinates: coordinates});
    })
  },


  // Returns a set of coordinates that connect between 'from' and 'to' points
  // If no from point is given, the line's last point is assumed.
  // E.g. getRoute({from: [20, 30], to: [23, 40]}, callback)
  // To and From are required, via is optional
  getRoute: function(points, callback) {
    console.log(points);
    var routingUrl = "http://router.project-osrm.org/viaroute?loc=" +
      points.from[0] + "," + points.from[1];
    if (points.via) routingUrl += "&loc=" + points.via[0] + "," + points.via[1];
    routingUrl += "&loc=" + points.to[0] + "," + points.to[1];
    

    // var routingUrl = "http://router.project-osrm.org/viaroute";
    // // Because index doesnt work.
    // var count = 0;
    // _.each(points, function(point) {
    //   if (!_.isEmpty(point)) {
    //     var qp = count === 0 ? '?loc=' : '&loc=';
    //     routingUrl += qp + point[0] + ',' +  point[1];
    //     count++;
    //   }
    // });

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
