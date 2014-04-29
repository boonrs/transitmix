require './db/config'
require 'sinatra'
require 'grape'

module TransitMix
  class API < ::Grape::API
    version 'v1', using: :header, vendor: 'transitmix'
    format :json

    namespace :api do

      resource :lines do
        get do
          db_version = DB.tables.include?(:schema_info) ? DB[:schema_info].first[:version] : 0
          { 'db_version' => db_version }
        end
      end

    end

  end # API
end # TransitMix
