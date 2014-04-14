app.AppView = Backbone.View.extend({
  el: $('body'),

  initialize: function() {
    this.listenTo(this.collection, 'blur', this.renderHome);
    this.listenTo(this.collection, 'focus', this.renderDetail);

    var center = [37.778733, -122.421467];
    var defaultZoomLevel = 14;
    var options = { tileLayer: { detectRetina: true }, doubleClickZoom: false };

    var map = app.map = L.mapbox.map('map', 'codeforamerica.h6mlbj75', options)
      .setView(center, defaultZoomLevel);
  },

  renderHome: function() {
    if (this.view) this.view.remove();
    this.view = new app.HomeView({ collection: this.collection });
    this.$el.append(this.view.render().el);
  },

  renderDetail: function() {
    if (this.view) this.view.remove();
    this.view = new app.DetailView({ model: this.collection.getFocused() });
    this.$el.append(this.view.render().el);
  },
});