task default: :test

task test: :environment do
  require 'rspec/core/rake_task'
  RSpec::Core::RakeTask.new(:spec)
  Rake::Task[:spec].invoke
end
