require './db/config'
require 'sinatra'
require 'grape'

Dir['./lib/models/**/*.rb'].each { |f| require(f) }
Dir['./lib/validators/**/*.rb'].each { |f| require(f) }

module TransitMix
  class Home < Sinatra::Base
    get '/' do
      erb :index
    end
  end # Home

  class API < ::Grape::API
    version 'v1', using: :header, vendor: 'transitmix'
    format :json

    namespace :api do
      resource :lines do
        helpers do
          def line_params
            Line::PERMITTED.each_with_object({}) { |model_params, attr|
              model_params[attr] = params[attr] if params[attr]
            }
          end
        end

        params do
          requires :id, type: String
        end

        get '/:id' do
          Line.where(id: params[:id]).first
        end

        params do
          optional :page, type: Integer, default: 1
          optional :per, type: Integer, default: 10, max: 100
        end

        get do
          Line.dataset.paginate(params[:page], params[:per]).order(Sequel.desc(:created_at))
        end

        params do
          requires :name, type: String
          requires :description, type: String
          optional :start_time, type: String
          optional :end_time, type: String
          optional :frequency, type: Integer
          optional :speed, type: Integer
          optional :color, type: String
          optional :color2, type: String
          optional :color3, type: String
        end

        post do
          Line.create(line_params)
        end

        params do
          requires :id, type: String
        end

        put '/:id' do
          line = Line.where(id: params[:id]).first
          line.update(line_params)
          line
        end
      end # resource :lines
    end # namespace :api

  end # API
end # TransitMix
