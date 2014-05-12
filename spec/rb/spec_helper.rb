require 'debugger'
require 'factory_girl'
require 'ffaker'
require 'rspec'
require 'rack/test'

require './app'
require './spec/rb/factories'

Dir['./spec/rb/support/**/*.rb'].each { |f| require(f) }

RSpec.configure do |config|
  config.include FactoryGirl::Syntax::Methods
  config.order = "random"
end
