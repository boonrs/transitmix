// View that shows all the routes drawn, and lets you jump into any of them.
// TODO: This view is a mess. Need to clean up, seperate into files, redo CSS.
app.HomeView = Backbone.View.extend({
  template: _.template($('#tmpl-home-view').html()),
  className: 'homeSidebar',
  events: {
    'click .newLine': 'newLine',
  },

  render: function() {
    this.$el.html(this.template({}));

    this.subviews = [];
    this.collection.forEach(function(line) {
      var homeLineView = new app.HomeLineView({ model: line });
      var homeBlockView = new app.HomeBlockView({ model: line });

      homeLineView.render();
      this.$el.append(homeBlockView.render().el);

      this.subviews.push(homeLineView);
      this.subviews.push(homeBlockView);
    }, this);

    this.$el.append('<div class="newLine">Or create a <span>new transit line...</span></div>');
    return this;
  },

  newLine: function() {
    app.router.navigate('new', {trigger: true});
  },

  remove: function() {
    this.subviews.forEach(function(subview) { subview.remove(); });
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});

app.HomeLineView = Backbone.View.extend({
  render: function() {
    var coordinates = this.model.get('coordinates');
    var color = this.model.get('color');

    this.line = L.multiPolyline(coordinates, {
      color: color,
      opacity: 0.5,
      weight: 5,
    }).addTo(app.map);

    this.line.on('click', this.jump, this);
  },

  jump: function() {
    app.router.navigate('lines/' + this.model.id, { trigger: true });
  },

  remove: function() {
    this.line.off('click', this.jump, this);
    app.map.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});

app.HomeBlockView = Backbone.View.extend({
  template: _.template($('#tmpl-home-block-view').html()),
  className: 'lineHeader',

  events: {
    'click': 'jump',
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    this.$el.css('background', this.model.get('color'));
    return this;
  },

  jump: function() {
    app.router.navigate('lines/' + this.model.id, { trigger: true });
  },
});
