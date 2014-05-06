app.Map = Backbone.Model.extend({
  urlRoot: '/api/maps',

  defaults: {
    name: '',
    center: [],
    lines: {},
    zoomLevel: 14,
  },

  parse: function(response) {
    return {
      id: response.id,
      name: response.name,
      center: response.center,
      zoomLevel: response.zoom_level,
      lines: new app.Lines(response.lines, { parse: true }),
    };
  },

  toJSON: function() {
    var attr = this.attributes;
    return {
      id: attr.id,
      name: attr.name,
      center: attr.center,
      zoom_level: attr.zoomLevel,
    };
  },

  // A specific model in the collection can be 'focused'. This lets
  // views quickly switch between showing overview and detail.
  focus: function(lineId) {
    if (this.focused && lineId === this.focused.id) return;

    var lines =  this.get('lines');
    this.focused = lines.get(lineId);
    this.trigger('focus');
  },

  blur: function() {
    if (!this.focused) return;

    this.focused = false;
    this.trigger('blur');
  },

  getFocused: function() {
    return this.focused;
  },
});