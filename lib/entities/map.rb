module Transitmix
  module Entities
    class Map < Grape::Entity
      expose :name
      expose :center
      expose :zoom_level, as: :zoomLevel
      expose :lines, using: Transitmix::Entities::Line, as: :lines
    end
  end
end

#  PERMITTED = [:name, :center, :zoom_level]

#  one_to_many :lines
