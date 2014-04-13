TransitMix.Line = Backbone.Model.extend({
  _parse_class_name: "Item",

  defaults: {
    // geoJSON: "",
    // speed: "",
    // startTime: 600,
    // endTime: 2400,
    // frequency: 30,
    // name: "Untitled",
    name: 'New Transit Line',
    color: '#300',
    keyCoordinates: [], // user drawn
    allCoordinates: [], // OSRM generated
  },

  addPoint: function(point) {
    var allCoordinates = _.clone(this.get('allCoordinates'));
    if (allCoordinates.length === 0) {
      allCoordinates.push([point.lat, point.lng]);
      this.set('allCoordinates', allCoordinates);
      return;
    }

    var previous = allCoordinates[allCoordinates.length - 1];
    var requestUrl = "http://router.project-osrm.org/viaroute?loc=" + previous[0] + "," + previous[1] + "&loc=" + point.lat + "," + point.lng;

    var addGeometry = function(routeData) {
      var allPoints = TransitMix.utils.decodeGeometry(routeData.route_geometry, 6);
      allCoordinates = allCoordinates.concat(allPoints);           
      this.set('allCoordinates', allCoordinates);
      this.save();
    }

    $.getJSON(requestUrl, _.bind(addGeometry, this));
  }
});