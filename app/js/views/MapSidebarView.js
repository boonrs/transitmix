// View that shows all the routes drawn, and lets you jump into any of them.
// TODO: This view is a mess. Need to clean up, seperate into files, redo CSS.
app.MapSidebarView = Backbone.View.extend({
  template: _.template($('#tmpl-map-sidebar-view').html()),

  emptyTemplate: _.template($('#tmpl-map-sidebar-empty-view').html()),

  lineTemplate: _.template($('#tmpl-map-sidebar-subview').html()),

  className: 'mapSidebarView',

  events: {
    'click .addLine': 'addLine',
    'click .share': 'share',
    'click .remix': 'remix',
  },

  render: function() {
    // Create fragments for each individual line and
    // calculate total costs for the summary
    var lines = this.model.get('lines');
    if (lines.length === 0) {
      this.$el.html(this.emptyTemplate(this.model.toJSON()));
      return this;
    }

    var totalDistance = 0;
    var totalCost = 0;

    var html = '';
    lines.forEach(function(line) {
      var calcs = line.getCalculations();
      var attrs = _.clone(line.toJSON());

      // TODO: Give the map model a function to compute it's summary statistics
      totalDistance += calcs.distance;
      totalCost += calcs.cost;

      _.extend(attrs, calcs);
      attrs.distance = attrs.distance.toFixed(2);
      html += this.lineTemplate(attrs);
    }, this);

    // Render the main view with the summary stats
    var attrs = _.clone(this.model.toJSON());
    _.extend(attrs, {
      lineCount: lines.length,
      distance: totalDistance.toFixed(2),
      cost: app.utils.addCommas(totalCost),
    });

    this.$el.html(this.template(attrs));
    this.$('.mapSidebarLines').html(html);

    return this;
  },

  addLine: function() {
    var line = new app.Line({
      mapId: this.model.get('id')
    });

    var viewLine = function(line) {
      this.model.get('lines').add(line);

      var fragment = 'map/' + this.model.id + '/line/' + line.id;
      app.router.navigate(fragment, { trigger: true });
    };

    line.save({}, { success: _.bind(viewLine, this) });
  },

  share: function() {

  },

  remix: function() {

  },

  remove: function() {
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});
