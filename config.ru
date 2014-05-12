require './app'
run Rack::Cascade.new [
  Transitmix::Routes::Home,
  Transitmix::Routes::Lines,
  Transitmix::Routes::Maps,
  Transitmix::Routes::Status
]
