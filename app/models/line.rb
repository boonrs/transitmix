class Line < ActiveRecord::Base
  serialize :properties, JSON
  serialize :coordinates, JSON
end
