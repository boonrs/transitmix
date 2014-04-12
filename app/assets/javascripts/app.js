// Namespace for the application
var app = app || {};

// Use mustache-style syntax for underscore templates
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

$(document).ready(function() {
  // Initialize the Backbone models, views, and router
  var lines = new app.Lines;
  app.view = new app.AppView({ collection: lines });
  app.router = new app.Router({ collection: lines });

  // Start the Backbone router
  Backbone.history.start();
});