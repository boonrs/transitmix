// Use mustache-style syntax for underscore templates
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

window.TransitMix = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    var lines = new TransitMix.Lines;
    this.view = new TransitMix.AppView({ collection: lines });
    this.router = new TransitMix.Router({ collection: lines });

    // Start the Backbone router
    Backbone.history.start();
  }
};

$(document).ready(function(){
  TransitMix.initialize();
});
