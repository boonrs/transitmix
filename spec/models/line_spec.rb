require 'spec_helper'

describe "Line" do
  it "allows storing lat and long in column coordinates" do
    line = Line.create(:coordinates => [[0,1], [-5.1444, 5.4444]])
    expect(line.coordinates[0][0]).to eq(0)
    expect(line.coordinates[0][1]).to eq(1)
    expect(line.coordinates[1][0]).to eq(-5.1444)
    expect(line.coordinates[1][1]).to eq(5.4444)
  end
end
