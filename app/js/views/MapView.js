app.MapView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, 'blur', this.renderBlur);
    this.listenTo(this.model, 'focus', this.renderFocus);
    this.listenTo(this.model.get('lines'), 'add', this.renderBlurredLine);

    app.leaflet.setView(this.model.get('center'), this.model.get('zoomLevel'));

    this.blurredLines = [];
  },

  render: function() {
    var lines = this.model.get('lines');
    lines.forEach(this.renderBlurredLine, this);

    if (this.model.getFocused()) {
      this.renderFocus();
    } else {
      this.renderBlur();
    }

    return this;
  },

  renderBlurredLine: function(line) {
    var view = new app.BlurredLineView({ model: line });
    view.render();
    this.blurredLines.push(view);
  },

  renderBlur: function() {
    if (this.sidebar) this.sidebar.remove();
    this.sidebar = new app.BlurredSidebarView({ model: this.model });
    this.$el.html(this.sidebar.render().el);

    if (this.focusedLine) this.focusedLine.remove();
  },

  renderFocus: function() {
    var line = this.model.getFocused();

    if (this.sidebar) this.sidebar.remove();
    this.sidebar = new app.FocusedSidebarView({ model: line });
    this.$el.html(this.sidebar.render().el);

    if (this.focusedLine) this.focusedLine.remove();
    this.focusedLine = new app.FocusedLineView({ model: line });
    this.focusedLine.render();
  },

  remove: function() {
    this.blurredLines.forEach(function(view) { view.remove(); });
    if (this.focusedLine) this.focusedLine.remove();
    if (this.sidebar) this.sidebar.remove();
    Backbone.View.prototype.remove.apply(this, arguments);
  }
});