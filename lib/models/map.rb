class Map < Sequel::Model
  plugin :timestamps, update_on_create: true
  plugin :json_serializer, :include=>:lines
  plugin :serialization, :json, :center

  PERMITTED = [:name, :center, :zoom_level]

  one_to_many :lines
end
