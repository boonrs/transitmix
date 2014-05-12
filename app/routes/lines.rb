module Transitmix
  module Routes
    class Lines < Grape::API
      version 'v1', using: :header, vendor: 'transitmix'
      format :json

      rescue_from Sequel::NoMatchingRow do
        Rack::Response.new({}, 404)
      end

      helpers do
        def line_params
          Line::PERMITTED.reduce({}) { |model_params, attr|
            model_params[attr] = params[attr] if params[attr]
            model_params
          }
        end
      end

      params do
        requires :id, type: String
      end

      get '/api/lines/:id' do
        Line.first!(id: params[:id])
      end

      params do
        optional :page, type: Integer, default: 1
        optional :per, type: Integer, default: 10, max: 100
      end

      get '/api/lines' do
        Line.dataset.paginate(params[:page], params[:per]).order(Sequel.desc(:created_at))
      end

      params do
        requires :name, type: String
        requires :description, type: String
        requires :coordinates, type: Array
        optional :start_time, type: String
        optional :end_time, type: String
        optional :frequency, type: Integer
        optional :speed, type: Integer
        optional :color, type: String
      end

      post '/api/lines' do
        Line.create(line_params)
      end

      params do
        requires :id, type: String
      end

      put '/api/lines/:id' do
        line = Line.where(id: params[:id]).first
        line.update(line_params)
        line
      end
    end
  end
end
