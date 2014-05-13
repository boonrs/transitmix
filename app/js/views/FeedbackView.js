app.FeedbackView = Backbone.View.extend({
  className: 'feedbackView',

  template: _.template($('#tmpl-feedback-view').html()),

  events: {
    'click': 'expandFeedback',
    'mouseleave': 'hideFeedback',
  },

  render: function() {
    this.$el.html(this.template({}));
    return this;
  },

  expandFeedback: function() {
    this.$('.feedbackExpansion').show();
    this.$el.addClass('expanded');
  },

  hideFeedback: function() {
    this.$('.feedbackExpansion').hide();
    this.$el.removeClass('expanded');
  },
});