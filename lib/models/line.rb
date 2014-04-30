class Line < Sequel::Model
  plugin :timestamps, update_on_create: true
  plugin :json_serializer
end
