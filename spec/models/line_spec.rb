require 'spec_helper'

describe Line do
  it { should serialize(:properties).as(JSON) }
  it { should serialize(:coordinates).as(JSON) }
end
