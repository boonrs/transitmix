require './web.rb'
run Rack::Cascade.new([
  Transitmix::Home.new,
  Transitmix::API.new,
  Transitmix::StatusAPI.new
])
