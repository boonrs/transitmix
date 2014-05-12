require 'bundler'
Bundler.require

# setup environment variables
require 'dotenv'
Dotenv.load

# setup load paths
$: << File.expand_path('../', __FILE__)
$: << File.expand_path('../lib', __FILE__)

require 'sinatra/base'
require 'sinatra/assetpack'
require 'sinatra-sequel'
require 'grape'

Dir['./lib/validators/**/*.rb'].each { |f| require(f) }

require 'app/routes'

module Transitmix
  class App < Sinatra::Application
    set :root, File.expand_path('../', __FILE__)
  end
end

require 'app/models'
include Transitmix::Models
