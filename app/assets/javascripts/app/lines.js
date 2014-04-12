app.Lines = Backbone.Collection.extend({
  _parse_class_name: "Item",
  model: app.Line,

  // Add a model to the collection, and set focus to true
  focus: function(model) {
    this.isFocused = true;
    this.focusLine = model;
    this.trigger('focus');
  },

  blur: function() {
    this.trigger('blur');
  },

  getFocused: function() {
    return this.focusLine;
  },
});