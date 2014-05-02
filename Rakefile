require './db/tasks.rb'

task :test do
  require 'rspec/core/rake_task'
  RSpec::Core::RakeTask.new(:spec)
  Rake::Task[:spec].invoke
end

task default: :test
