module Transitmix
  module Routes
    class Maps < Grape::API
      version 'v1', using: :header, vendor: 'transitmix'
      format :json

      rescue_from Sequel::NoMatchingRow do
        Rack::Response.new({}, 404)
      end

      helpers do
        def map_params
          Map::PERMITTED.reduce({}) { |model_params, attr|
            model_params[attr] = params[attr] if params[attr]
            model_params
          }
        end
      end

      params do
        requires :id, type: String
      end

      get '/api/maps/:id' do
        Map.first!(id: params[:id])
      end

      params do
        optional :page, type: Integer, default: 1
        optional :per, type: Integer, default: 10, max: 100
      end

      get '/api/maps' do
        Map.dataset.paginate(params[:page], params[:per]).order(Sequel.desc(:created_at))
      end

      params do
        requires :name, type: String
        optional :center, type: Array
        optional :zoom_level, type: String
      end

      post '/api/maps' do
        Map.create(map_params)
      end

      params do
        requires :id, type: String
      end

      put '/api/maps/:id' do
        map = Map.where(id: params[:id]).first
        map.update(map_params)
        map
      end
    end
  end
end
