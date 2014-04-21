# == Schema Information
#
# Table name: lines
#
#  id          :uuid             not null, primary key
#  properties  :text             default("{}"), not null
#  coordinates :text             default("[[],[]]"), not null
#  created_at  :datetime
#  updated_at  :datetime
#

class Line < ActiveRecord::Base
  serialize :properties, JSON
  serialize :coordinates, JSON
end
