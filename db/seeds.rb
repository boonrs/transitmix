# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

Line.create(:name => "hi", :description => "hello some more", :color => "#00015a", :coordinates => 
  [
    [37.773011, -122.409482],
    [37.772537, -122.410083],
    [37.773773, -122.411627],
    [37.783787, -122.39894299999999],
    [37.787299999999995, -122.403358],
    [37.787389999999995, -122.40341799999999],
    [37.787441, -122.40343299999999],
    [37.787675, -122.403436],
    [37.789826, -122.403866],
    [37.78962, -122.40540399999999],
    [37.790108, -122.40550999999999],
    [37.790123, -122.405391]
  ],
  :marker => [37.773157169570666, -122.40966796874999]
    )