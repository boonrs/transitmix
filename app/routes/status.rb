module Transitmix
  module Routes
    class Status < Grape::API
      format :json

      get '/.well-known/status' do
        Status.new
      end
    end
  end
end
