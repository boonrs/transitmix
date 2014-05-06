app.MarkerView = Backbone.View.extend({

  className: 'mapMarker',

  initialize: function(options) {
    options || (options = {});
    _.extend(this, _.pick(options, ['line', 'classNames', 'isNew']));

    _.bindAll(this, 'addToMap', 'rotate');
  },

  render: function() {
    if (!this.isNew && !this.isLast()) this.rotate();
    if (this.isLast()) this.$el.hide();
    this.addToMap();
    return this;
  },

  addToMap: function () {
    var icon = L.divIcon({ className: this.classNames, html: this.el.outerHTML });
    this.model.setIcon(icon);
    this.model.addTo(app.map);
  },

  rotate: function () {
    var degrees = this.calculateBearing();
    this.$el.css('transform', 'rotate('+ degrees + 'deg)')
    this.$el.css('-webkit-transform', 'rotate('+ degrees + 'deg)')
    this.$el.css('-ms-transform', 'rotate('+ degrees + 'deg)')
  },

  calculateBearing: function () {
    var coordinates = this.line.get('coordinates');
    var points = _.flatten(coordinates, true);
    var latlng = this.model.getLatLng();
    var index = app.utils.indexOfClosest(points, [latlng.lat, latlng.lng]);
    // TODO - First and second points seem to be almost equal and therefore the bearing
    // of index 0 is no good. Also, it appears waypoints are repeated therefore always
    // skip ahead 1.
    index++;
    return app.utils.calculateBearing(points[index], points[index + 1]);
  },

  isLast: function () {
    var coordinates = this.line.get('coordinates');
    var points = _.flatten(coordinates, true);
    var latlng = this.model.getLatLng();
    var index = app.utils.indexOfClosest(points, [latlng.lat, latlng.lng]);
    return index === points.length - 1;
  },
});
