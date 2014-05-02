require 'debugger'
require 'factory_girl'
require 'ffaker'
require 'rspec'
require 'rack/test'

# TODO: find a better way to do this
ENV['DATABASE_URL'] = 'postgres://localhost/transitmix_test'
require './web'
require './spec/factories'

Dir['./spec/support/**/*.rb'].each { |f| require(f) }

RSpec.configure do |config|
  config.include FactoryGirl::Syntax::Methods
  config.order = "random"
end
