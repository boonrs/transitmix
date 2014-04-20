require 'sinatra'
require 'grape'

module TransitMix
  class API < ::Grape::API
    version 'v1', using: :header, vendor: 'transitmix'
    format :json

    resource :lines do
      get do
        {'hello' => 'world!'}
      end
    end
  end
end
