app.MarkerView = Backbone.View.extend({

  className: 'mapMarker',

  initialize: function(options) {
    options || (options = {});
    _.extend(this, _.pick(options, ['draggable', 'classNames']));

    _.bindAll(this, 'addToMap', 'rotate');
  },

  render: function() {
    if (!this.isNew) this.rotate();
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
    return 90;
  }
});
