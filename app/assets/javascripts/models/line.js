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
      points: [], // [{lat: 12, lng: 12.3232}, ...]
      latlngs: [], // [[12.232323, 12.32323232], ...]
    };
  },

  // Adds a point to the model, then calculates the route that connects
  // it to the previous point and updates the latlngs accordingly.
  addPoint: function(point) {
    var points = _.clone(this.get('points'));
    var latlngs = _.clone(this.get('latlngs'));

    if (points.length === 0) {
      points.push(point);
      this.save({ points: points });
      return;
    }

    this.getRoute(point, function (route) {
      var closestPoint = app.utils.LatlngtoPoint(_.last(route));
      points.push(closestPoint);
      latlngs = latlngs.concat(route);

      this.save({
        points: points,
        latlngs: latlngs,
      });
    });
  },

  // Returns a set of latlngs that connect the last point to the give point
  getRoute: function(point, callback) {
    var last = _.last(this.get('points'));
    var routingUrl = "http://router.project-osrm.org/viaroute?loc=" +
      last.lat + "," + last.lng + "&loc=" + point.lat + "," + point.lng;

    callback = _.bind(callback, this);
    $.getJSON(routingUrl, function(route) {
      var geometry = route.route_geometry;
      var latlngs = app.utils.decodeGeometry(geometry);
      callback(latlngs);
    });
  },

  calculateDistance: function() {
    return app.utils.calculateDistance(this.get('latlngs'));
  },

  calculateCost: function() {

  },
});