// Namespace for the application
var app = app || {};

// Use mustache-style syntax for underscore templates
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// The app is based largely around 'lines', aka transit lines
// and related information like name and frequency. A shared collection
// is created here that all views and the router use to render the app.
$(document).ready(function() {
  var lines = new app.Lines();

  app.view = new app.AppView({ collection: lines });
  app.router = new app.Router({ collection: lines });

  Backbone.history.start();
});
