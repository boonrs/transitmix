require 'debugger'
require 'factory_girl'
require 'ffaker'
require 'rspec'
require 'rack/test'

require './app'
require './spec/factories'

Dir['./spec/support/**/*.rb'].each { |f| require(f) }

RSpec.configure do |config|
  config.include FactoryGirl::Syntax::Methods
  config.order = "random"
end
