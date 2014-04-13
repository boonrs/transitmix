// View that shows all the routes drawn,
// and lets you jump into any of them.
TransitMix.HomeView = Backbone.View.extend({
  render: function() {
    this.subviews = [];
    this.collection.forEach(function(line) {
      var homeLineView = new TransitMix.HomeLineView({ model: line });
      var homeBlockView = new TransitMix.HomeBlockView({ model: line });

      homeLineView.render();
      $('#routes').append(homeBlockView.render().el);

      this.subviews.push(homeLineView);
      this.subviews.push(homeBlockView);
    }, this);
  },

  remove: function() {
    this.subviews.forEach(function(line) { line.remove(); });
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});