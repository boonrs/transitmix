module Transitmix
  module Entities
    class Line < Grape::Entity
      expose :coordinates
      expose :name
      expose :description
      expose :start_time, as: :startTime
      expose :end_time, as: :endTime
      expose :frequency
      expose :speed
      expose :color
      expose :map_id, as: :mapId
    end
  end
end
