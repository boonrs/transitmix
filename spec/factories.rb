FactoryGirl.define do
  factory :line, class: Line do
    name { Faker::Lorem.words.join(' ') }
    description { Faker::Lorem.paragraph }
    color { ['red', 'green', 'blue'].sample }
    coordinates {
      Array.new(2) {
        Array.new((2..5).to_a.sample) {
          [Faker::Geolocation.lat, Faker::Geolocation.lng]
        }
      }
    }
  end
end

class Line
  # FactoryGirl expects a #save! method in order use create(:line)
  def save!
    save or raise 'ahhh invalid record!'
  end
end
