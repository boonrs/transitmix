// View that shows all the routes drawn, and lets you jump into any of them.
// TODO: This view is a mess. Need to clean up, seperate into files, redo CSS.
app.MapSidebarView = Backbone.View.extend({
  template: _.template($('#tmpl-map-sidebar-view').html()),
  lineTemplate: _.template($('#tmpl-map-sidebar-subview').html()),
  className: 'blurredSidebarView',
  events: {
    'click .blurredSidebarNew': 'newLine',
  },

  render: function() {
    var lines = this.model.get('lines');
    this.$el.html(this.template(this.model.toJSON()));

    var html = '';
    lines.forEach(function(line) {
      html += this.lineTemplate(line.toJSON());
    }, this);
    this.$('.blurredSidebarLines').html(html);

    return this;
  },

  newLine: function() {
    // create an actual new line here
    var line = new app.Line({
      mapId: this.model.get('id')
    });

    var viewLine = function(line) {
      this.model.get('lines').add(line);
      app.router.navigate(this.model.id + '/' + line.id, { trigger: true });
    };

    line.save({}, { success: _.bind(viewLine, this) });
  },

  remove: function() {
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});