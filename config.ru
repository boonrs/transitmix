require './web.rb'
run Rack::Cascade.new([
  TransitMix::Home.new,
  TransitMix::API.new
])
