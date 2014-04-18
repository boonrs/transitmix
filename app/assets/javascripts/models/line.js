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
  addPoint: function(latlng) {
    latlng = _.values(latlng);
    var coordinates = _.clone(this.get('coordinates'));

    if (coordinates.length === 0) {
      coordinates.push([latlng]);
      this.save({ coordinates: coordinates });
      return;
    }

    app.utils.getRoute({
      from: _.last(this.getPoints()),
      to: latlng,
    }, function(route) {
      coordinates.push(route);
      this.save({ coordinates: coordinates });
    }, this);
  },

  updatePoint: function(latlng, index) {
    latlng = _.values(latlng);

    if (index === 0) {
      this._updateFirstPoint(latlng);
    } else if (index === this.get('coordinates').length - 1) {
      this._updateLastPoint(latlng);
    } else {
      this._updateMiddlePoint(latlng, index);
    }
  },

  _updateFirstPoint: function(latlng) {
    var coordinates = _.clone(this.get('coordinates'));
    var secondPoint = _.last(coordinates[1]);

    app.utils.getRoute({
      from: latlng,
      to: secondPoint,
    }, function(route) {
      coordinates[0] = [route[0]];
      coordinates[1] = route;
      this.save({ coordinates: coordinates });
    }, this);
  },

  _updateMiddlePoint: function(latlng, index) {
    var coordinates = _.clone(this.get('coordinates'));
    var prevPoint = _.last(coordinates[index - 1]);
    var nextPoint = _.last(coordinates[index + 1]);

    app.utils.getRoute({
      from: prevPoint,
      via: latlng,
      to: nextPoint,
    }, function(route) {
      var closest = app.utils.indexOfClosest(route, latlng);
      coordinates[index] = route.slice(0, closest + 1);
      coordinates[index + 1] = route.slice(closest);
      this.save({ coordinates: coordinates });
    }, this);
  },

  _updateLastPoint: function(latlng) {
    var coordinates = _.clone(this.get('coordinates'));
    var penultimatePoint = _.last(coordinates[coordinates.length - 2]);

    app.utils.getRoute({
      from: penultimatePoint,
      to: latlng
    }, function(route) {
      coordinates[coordinates.length - 1] = route;
      this.save({ coordinates: coordinates });
    }, this);
  },

  insertPoint: function(latlng, index) {
    var coordinates = _.clone(this.get('coordinates'));
    var prevPoint = _.last(coordinates[index - 1]);
    var newSegment = [prevPoint, latlng];

    coordinates.splice(index, 0, newSegment);
    this.set({ coordinates: coordinates }, { silent: true });
    this.updatePoint(latlng, index);
  },

  removePoint: function(index) {
    var coordinates = _.clone(this.get('coordinates'));

    // Drop the first segment, make the second segment just the last point
    if (index === 0) {
      var secondPoint = _.last(coordinates[1]);
      coordinates.splice(0, 2, [secondPoint]);
      this.save({ coordinates: coordinates });
      return;
    }

    // Just drop the last segment
    if (index === coordinates.length - 1) {
      coordinates.splice(index, 1);
      this.save({ coordinates: coordinates });
      return;
    }

    // For middle points, we drop the segment, then route 
    // the next point to it's existing location
    var nextPoint = _.last(coordinates[index + 1]);
    coordinates.splice(index, 1);
    this.set({ coordinates: coordinates }, { silent: true });
    this.updatePoint(nextPoint, index);
  },

  getPoints: function() {
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
