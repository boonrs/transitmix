// View that shows all the routes drawn, and lets you jump into any of them.
// TODO: This view is a mess. Need to clean up, seperate into files, redo CSS.
app.MapSidebarView = Backbone.View.extend({
  template: _.template($('#tmpl-map-sidebar-view').html()),

  emptyTemplate: _.template($('#tmpl-map-sidebar-empty-view').html()),

  className: 'mapSidebarView',

  events: {
    'click .addLine': 'addLine',
    'click .share': 'share',
    'click .remix': 'remix',
  },

  initialize: function() {
    this.subviews = [];
  },

  render: function() {
    // Create fragments for each individual line and
    // calculate total costs for the summary
    var lines = this.model.get('lines');
    if (lines.length === 0) {
      this.$el.html(this.emptyTemplate(this.model.toJSON()));
      return this;
    }

    var frag = document.createDocumentFragment();
    var totalDistance = 0;
    var totalCost = 0;

    lines.forEach(function(line) {
      var calcs = line.getCalculations();

      // TODO: Give the map model a function to compute it's summary statistics
      totalDistance += calcs.distance;
      totalCost += calcs.cost;

      var subview = new app.mapSidebarSubview({ model: line });
      this.subviews.push(subview);
      frag.appendChild(subview.render().el);
    }, this);

    var attrs = this.model.toJSON();
    _.extend(attrs, { 
      lineCount: lines.length,
      cost: app.utils.addCommas(totalCost),
      distance: totalDistance.toFixed(2),
    });
    this.$el.html(this.template(attrs));
    this.$('.mapSidebarLines').append(frag);

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
    this.subviews.map(function(subview) { subview.remove(); });
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});


app.mapSidebarSubview = Backbone.View.extend({
  template: _.template($('#tmpl-map-sidebar-subview').html()),

  events: {
    'click': 'select',
  },

  render: function() {
    var attrs = _.clone(this.model.toJSON());
    var calcs = this.model.getCalculations();

    calcs.distance = calcs.distance.toFixed(2);
    _.extend(attrs, calcs);

    this.$el.html(this.template(attrs));
    return this;
  },

  select: function() {
    var fragment = 'map/' + this.model.get('mapId') + '/line/' + this.model.id;
    app.router.navigate(fragment, { trigger: true });
  }
});
