class Line < Sequel::Model
  plugin :timestamps, update_on_create: true
  plugin :json_serializer
  plugin :serialization, :json, :coordinates

  PERMITTED = [:coordinates, :name, :description, :start_time, :end_time, :frequency, :speed, :color].freeze
end
