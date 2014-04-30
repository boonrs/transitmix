require './db/config'
require 'sinatra'
require 'grape'

Dir['./lib/models/**/*.rb'].each { |f| require(f) }
Dir['./lib/validators/**/*.rb'].each { |f| require(f) }

module TransitMix
  class API < ::Grape::API
    version 'v1', using: :header, vendor: 'transitmix'
    format :json

    namespace :api do

      resource :lines do
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
          Line.create({
            name: params[:name],
            description: params[:description],
            start_time: params[:start_time],
            end_time: params[:end_time],
            frequency: params[:frequency],
            speed: params[:speed],
            color: params[:color],
            color2: params[:color2],
            color3: params[:color3]
          })
        end
      end

    end

  end # API
end # TransitMix
