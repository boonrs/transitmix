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

    // Use the Google Maps Geocoding API
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    encodeURI(city) + '&sensor=false&key=AIzaSyCcgZLlBTM4GY0RhkUjy4MDD9RaZ0zIoiY';

    $.get(url, function(response) {
      if (response.results.length === 0) {
        console.log('Unable to geocode city. Womp Womp.');
        // TODO: Throw up an error in the UI
      }

      // Get the coordinates for the center of the city
      var latlng = response.results[0].geometry.location;
      var center = [latlng.lat, latlng.lng];

      // Get the city's name. In google maps this is called 'locality'
      var name = city;
      var components = response.results[0].address_components;
      for (var i = 0; i < components.length; i++) {
        if (_.contains(components[i].types, 'locality')) {
          name = components[i].long_name;
          break;
        }
      }

      var newMap = new app.Map({
        name: name,
        center: center,
        zoomLevel: 14,
      });

      var viewMap = function(model) {
        app.router.navigate('map/' + model.id, { trigger: true });
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
