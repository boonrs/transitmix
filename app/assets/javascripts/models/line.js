// A line is an always-routed set of latlngs, stored in a 'coordinates'
// field, using a GeoJSON multilinestring represntation. Just give it a set
// of waypoints to navigate through, and it'll handle the rest.

app.Line = Backbone.Model.extend({
  _parse_class_name: 'Line',

  defaults: function() {
    // For now, just randomly assign each line a color.
    // Colors are: red, green, purple, blue
    var colors = ['#AD0101', '#0D7215', '#4E0963', '#0071CA'];
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

  // Extends the line to the given latlng, routing in-between
  addWaypoint: function(latlng) {
    latlng = _.values(latlng);
    var coordinates = _.clone(this.get('coordinates'));

    if (coordinates.length === 0) {
      coordinates.push([latlng]);
      this.save({ coordinates: coordinates });
      return;
    }

    app.utils.getRoute({
      from: _.last(this.getWaypoints()),
      to: latlng,
    }, function(route) {
      coordinates.push(route);
      this.save({ coordinates: coordinates });
    }, this);
  },

  updateWaypoint: function(latlng, index) {
    latlng = _.values(latlng);

    if (index === 0) {
      this._updateFirstWaypoint(latlng);
    } else if (index === this.get('coordinates').length - 1) {
      this._updateLastWaypoint(latlng);
    } else {
      this._updateMiddleWaypoint(latlng, index);
    }
  },

  _updateFirstWaypoint: function(latlng) {
    var coordinates = _.clone(this.get('coordinates'));
    var secondWaypoint = _.last(coordinates[1]);

    app.utils.getRoute({
      from: latlng,
      to: secondWaypoint,
    }, function(route) {
      coordinates[0] = [route[0]];
      coordinates[1] = route;
      this.save({ coordinates: coordinates });
    }, this);
  },

  _updateMiddleWaypoint: function(latlng, index) {
    var coordinates = _.clone(this.get('coordinates'));
    var prevWaypoint = _.last(coordinates[index - 1]);
    var nextWaypoint = _.last(coordinates[index + 1]);

    app.utils.getRoute({
      from: prevWaypoint,
      via: latlng,
      to: nextWaypoint,
    }, function(route) {
      var closest = app.utils.indexOfClosest(route, latlng);
      coordinates[index] = route.slice(0, closest + 1);
      coordinates[index + 1] = route.slice(closest);
      this.save({ coordinates: coordinates });
    }, this);
  },

  _updateLastWaypoint: function(latlng) {
    var coordinates = _.clone(this.get('coordinates'));
    var penultimateWaypoint = _.last(coordinates[coordinates.length - 2]);

    app.utils.getRoute({
      from: penultimateWaypoint,
      to: latlng
    }, function(route) {
      coordinates[coordinates.length - 1] = route;
      this.save({ coordinates: coordinates });
    }, this);
  },

  insertWaypoint: function(latlng, index) {
    var coordinates = _.clone(this.get('coordinates'));
    var prevWaypoint = _.last(coordinates[index - 1]);
    var newSegment = [prevWaypoint, latlng];

    coordinates.splice(index, 0, newSegment);
    this.set({ coordinates: coordinates }, { silent: true });
    this.updateWaypoint(latlng, index);
  },

  removeWaypoint: function(index) {
    var coordinates = _.clone(this.get('coordinates'));

    // Drop the first segment, make the second segment just the last waypoint
    if (index === 0) {
      var secondWaypoint = _.last(coordinates[1]);
      coordinates.splice(0, 2, [secondWaypoint]);
      this.save({ coordinates: coordinates });
      return;
    }

    // Just drop the last segment
    if (index === coordinates.length - 1) {
      coordinates.splice(index, 1);
      this.save({ coordinates: coordinates });
      return;
    }

    // For middle waypoints, we drop the segment, then route 
    // the next waypoint, keep it's current location. 
    var nextWaypoint = _.last(coordinates[index + 1]);
    coordinates.splice(index, 1);
    this.set({ coordinates: coordinates }, { silent: true });
    this.updateWaypoint(nextWaypoint, index);
  },

  getWaypoints: function() {
    var coordinates = this.get('coordinates');
    return _.map(coordinates, _.last);
  },

  calculateDistance: function() {
    var coordinates = this.get('coordinates');
    var flat = _.flatten(coordinates, true);
    return app.utils.calculateDistance(flat);
  },

  calculateCost: function() {

  },
});
