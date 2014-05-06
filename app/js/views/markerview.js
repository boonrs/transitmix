app.MarkerView = Backbone.View.extend({

  className: 'mapMarker',

  initialize: function(options) {
    options || (options = {});
    _.extend(this, _.pick(options, ['line', 'classNames', 'isNew']));

    _.bindAll(this, 'findPoint', 'rotate');
  },

  render: function() {
    this.point = this.findPoint();
    if (this.isNew || this.point.isFirst || this.point.isLast) {
      this.$el.hide();
    } else {
      this.rotate();
      this.$el.css('border-left-color', this.line.get('color'));
    }

    var icon = L.divIcon({ className: this.classNames, html: this.el.outerHTML });
    this.model.setIcon(icon);
    this.model.addTo(app.map);
    $('.mapMarkerWrapper').css('border-color', this.line.get('color'));

    return this;
  },

  findPoint: function() {
    var coordinates = this.line.get('coordinates');
    var points = _.flatten(coordinates, true);
    var latlng = this.model.getLatLng();
    var index = app.utils.indexOfClosest(points, [latlng.lat, latlng.lng]);
    var isFirst = index === 0;
    var isLast = index === points.length - 1;

    // TODO - Figure out the reason for this hack.
    //
    // First and second points seem to be almost equal and therefore the bearing
    // using the point at index 0 is no good. Also, it appears waypoints are repeated (?)
    // therefore always skip ahead 1.
    index++;

    return {
      current: points[index],
      next: (!isLast) ? points[index + 1] : null,
      isFirst: isFirst,
      isLast: isLast
    }
  },

  rotate: function() {
    var degrees = app.utils.calculateBearing(this.point.current, this.point.next);
    this.$el.css('transform', 'rotate('+ degrees + 'deg)')
    this.$el.css('-webkit-transform', 'rotate('+ degrees + 'deg)')
    this.$el.css('-ms-transform', 'rotate('+ degrees + 'deg)')
  },
});
