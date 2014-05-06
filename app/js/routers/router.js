app.Router = Backbone.Router.extend({
  routes: {
    'map/:mapid/line/:lineid(/)': 'line',
    'map/:mapid(/)': 'map',
    '': 'home',
    '*default': 'error'
  },

  initialize: function(options) {
    this.bind('all', this._trackPageview);
    Backbone.history.start({ pushState: true, root: '/' });
  },

  _trackPageview: function() {
    if (typeof ga !== "undefined") {
      var url = Backbone.history.getFragment();
      ga('send', 'pageview', {'page': "/" + url});
    }
  },

  home: function() {
    if (this.view) this.view.remove();
    this.view = new app.HomeView();
    $('body').append(this.view.render().el);
  },

  map: function(mapId) {
    this._loadMap(mapId, function(model) {
      model.unselect();
    });
  },

  line: function(mapId, lineId) {
    this._loadMap(mapId, function(model) {
      model.select(lineId);
    });
  },

  _loadMap: function(mapId, callback) {
    // If we already have a view with the apropriate model, we just need
    // to handle the select/unselect events, and skip data load / view rendering
    if (this.view && this.view.model && this.view.model.id.toString() === mapId) {
      callback(this.view.model);
      return;
    }

    var renderMap = function(model) {
      if (this.view) this.view.remove();
      this.view = new app.MapView({ model: model });
      $('body').append(this.view.render().el);
      callback(model);
    };

    var map = new app.Map({ id: mapId });
    map.fetch({ success: _.bind(renderMap, this)});
  },

  error: function() {
    console.log('Route not found. Mild moment of panic.');
    this.navigate('', { trigger: true });
  },
});
