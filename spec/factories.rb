FactoryGirl.define do
  factory :line do
    properties {{
      name: Faker::Lorem.words.join(' '),
      color: ['red', 'green', 'blue'].sample
    }}
    coordinates {
      Array.new(2) {
        Array.new((2..5).to_a.sample) {
          [Faker::Geolocation.lat, Faker::Geolocation.lng]
        }
      }
    }
  end
end
