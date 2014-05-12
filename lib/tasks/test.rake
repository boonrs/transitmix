desc 'Namespace for all tests'
namespace :test do
  desc 'Run the entire test suite'
  task :all => [:rb, :js]

  desc 'Run the entire ruby test suite'
  task :rb do
    require 'rspec/core/rake_task'
    RSpec::Core::RakeTask.new(:spec)
    Rake::Task[:spec].invoke
  end

  task :js do
    require 'jasmine'
    load 'jasmine/tasks/jasmine.rake'
    ENV['JASMINE_CONFIG_PATH'] = 'spec/js/support/jasmine.yml'
    Rake::Task['jasmine:ci'].invoke
  end
end