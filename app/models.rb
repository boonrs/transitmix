Sequel.default_timezone = :utc

Sequel::Model.plugin :timestamps, update_on_create: true
Sequel::Model.plugin :serialization
Sequel::Model.plugin :json_serializer

# enable pagination
Sequel::Model.db.extension :pagination

module Transitmix
  module Models
  end
end

require 'app/models/line'
require 'app/models/map'
require 'app/models/status'
