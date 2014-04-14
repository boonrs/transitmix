app.DetailView = Backbone.View.extend({
  className: 'detailSidebar',
  template: _.template($('#tmpl-detail-view').html()),

  bindings: {
    '.lineName': 'name',
    '.lineDescription': 'description',
    '.lineFrequency': 'frequency',
    '.lineSpeed': 'speed',
    '.lineStartTime': 'startTime',
    '.lineEndTime': 'endTime',
  },

  events: {
    'click .navHome': 'home',
    'click .navRemix': 'remix',
  },

  initialize: function() {
    var debouncedSave = _.debounce(this.save, 1500, { leading: false });
    this.listenTo(this.model, 'change', debouncedSave);
  },

  render: function() {
    this.lineView = new app.LineView({ model: this.model });
    this.lineView.render();

    // Compute several shades of color for the UI
    var color = this.model.get('color');
    var attrs = _.extend(this.model.attributes, {
      color2: app.utils.tweakColor(color, -22),
      color3: app.utils.tweakColor(color, -44),
    });

    this.$el.html(this.template(attrs));
    this.updateCalculations();
    this.stickit();

    return this;
  },

  updateCalculations: function() {
    var dist = this.model.calculateDistance();
    this.$('.lineDistance').html(dist.toFixed(2) + ' miles');
  },

  save: function(model, options) {
    if (options.stickitChange) {
      this.model.save();
    }
  },

  home: function() {
    app.router.navigate('', { trigger: true });
  },

  remix: function() {
    console.log('add remixing ability...');
  },

  remove: function() {
    this.model.save();
    this.lineView.remove();
    Backbone.View.prototype.remove.apply(this, arguments);
  },
})