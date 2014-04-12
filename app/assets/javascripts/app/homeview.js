// View that shows all the routes drawn,
// and lets you jump into any of them.

app.HomeView = Backbone.View.extend({
  render: function() {
    this.subviews = [];
    this.collection.forEach(function(line) {
      var homeLineView = new app.HomeLineView({ model: line });
      var homeBlockView = new app.HomeBlockView({ model: line });

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

app.HomeLineView = Backbone.View.extend({
  render: function() {
    var coordinates = this.model.get('allCoordinates');

    var options = {
      color: 'red',
      opacity: 0.5,
      weight: 5,
    };

    this.line = L.polyline(coordinates, options).addTo(app.map);
    this.line.on('click', this.jump, this);
  },

  jump: function() {
    app.router.navigate('-/' + this.model.id, { trigger: true });
  },

  remove: function() {
    this.line.off('click', this.jump, this);
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});

app.HomeBlockView = Backbone.View.extend({
  template: _.template($('#tmpl-home-block-view').html()),
  className: 'route block redroute',
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },
})