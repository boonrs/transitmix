desc 'Namespace for all tests'
namespace :test do
  desc 'Run the entire test suite'
  task :all => [:rb]

  desc 'Run the entire ruby test suite'
  task :rb do
    require 'rspec/core/rake_task'
    RSpec::Core::RakeTask.new(:spec)
    Rake::Task[:spec].invoke
  end
end