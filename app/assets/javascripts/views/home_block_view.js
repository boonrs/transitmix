TransitMix.HomeBlockView = Backbone.View.extend({
  template: _.template($('#tmpl-home-block-view').html()),
  className: 'route block redroute',
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },
});