app.HomeView = Backbone.View.extend({
  className: 'homeView',
  template: _.template($('#tmpl-home-view').html()),
  events: {
    'click .homeStartButton': 'createMap',
    'keydown': 'captureEnter',
  },

  render: function() {
    this.$el.html(this.template({}));    
    return this;
  },

  createMap: function() {
    var city = $('.homeCity').html();
    if (!city) return;

    var geocodeUrl = 'http://nominatim.openstreetmap.org/search?format=json&q=';
    geocodeUrl += encodeURI(city);

    // TODO: Add a progress bar, so you know we're waiting for a server
    // response from the geocoding service

    $.get(geocodeUrl, function(response) {

      // TODO: Check for empty responses, and throw up an error

      var best = response[0];
      var center = [best.lat, best.lon];

      var newMap = new app.Map({
        name: city,
        center: center,
        zoomLevel: 14,
      });

      var viewMap = function(model) {
        console.log(model);
        app.router.navigate('' + model.id, { trigger: true });
      };

      newMap.save({}, { success: viewMap });
    });
  },

  captureEnter: function (event) {
    if (event.which === 13) {
      event.stopPropagation();
      event.preventDefault();
      this.createMap();
    }
  }
});