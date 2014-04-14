app.Lines = Backbone.Collection.extend({
  _parse_class_name: 'Line',
  model: app.Line,

  // A specific model in the collection can be 'focused'. This lets
  // views quickly switch between showing overview and detail.
  focus: function(model) {
    this.focused = model;
    this.trigger('focus');
  },

  blur: function() {
    this.trigger('blur');
  },

  getFocused: function() {
    return this.focused;
  },
});