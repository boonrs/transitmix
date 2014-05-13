require './app'
run Rack::Cascade.new [
  Transitmix::Routes::Status,
  Transitmix::Routes::Lines,
  Transitmix::Routes::Maps,
  Transitmix::Routes::Home
]
