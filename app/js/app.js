// Namespace for the application
var app = app || {};

// Use mustache-style syntax for underscore templates
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

$(document).ready(function() {
  var options = { tileLayer: { detectRetina: true } };
  app.leaflet = L.mapbox.map('map', 'codeforamerica.h6mlbj75', options);
  
  app.router = new app.Router();
});
