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

  rerouteLine: function(newLatLng, segmentIndex) {
    // newLatLng = new lat/lng of point
    // pointIndex = index of line segment w/in cordinates of moved points

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
    var rerouteLineStart = function(newLatLng) {
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

    };

    rerouteLineStart = _.bind(rerouteLineStart, this);

    var rerouteLineEnd = function(newLatLng) {
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
    };

    rerouteLineEnd = _.bind(rerouteLineEnd, this);

    var rerouteLineMiddle = function(newLatLng, segmentIndex) {
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
    };

    rerouteLineMiddle = _.bind(rerouteLineMiddle, this);


    if (segmentIndex === 0) {
      rerouteLineStart(newLatLng);
    } else if (segmentIndex === this.get("coordinates").length - 1) {
      rerouteLineEnd(newLatLng);
    } else {
      rerouteLineMiddle(newLatLng, segmentIndex);
    }
    
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
