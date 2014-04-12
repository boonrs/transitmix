app.AppView = Backbone.View.extend({
  el: $('body'),

  events: {
    'click .new': 'createNew',
  },

  initialize: function() {
    this.listenTo(this.collection, 'blur', this.renderHome);
    this.listenTo(this.collection, 'focus', this.renderDetail);

    var center = [37.778733, -122.421467];
    var defaultZoomLevel = 14;
    var options = { tileLayer: { detectRetina: true }};

    var map = app.map = L.mapbox.map('map', 'codeforamerica.h6mlbj75', options)
      .setView(center, defaultZoomLevel);
  },

  renderHome: function() {
    if (this.view) this.view.remove();
    this.view = new app.HomeView({ collection: this.collection });
    this.view.render();
  },

  renderDetail: function() {
    if (this.view) this.view.remove();
    this.view = new app.LineView({ model: this.collection.getFocused() });
    this.view.render();
  },

  createNew: function() {
    app.router.navigate('new', {trigger: true});
  },
});