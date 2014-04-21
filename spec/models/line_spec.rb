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

require 'spec_helper'

describe Line do
  it { should serialize(:properties).as(JSON) }
  it { should serialize(:coordinates).as(JSON) }
end
