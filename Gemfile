source 'https://rubygems.org'

ruby '2.1.1'

gem 'jquery-rails'
gem 'kaminari', '~> 0.15'
gem 'pg'
gem 'rails', '4.1.0'
gem 'sass-rails', '~> 4.0.3'
gem 'uglifier', '>= 1.3.0'
gem 'unicorn'

group :production do
  gem 'rails_12factor'
end

group :development do
  gem 'quiet_assets'
  gem 'spring'
end

group :development, :test do
  gem 'annotate'
  gem 'debugger'
  gem 'factory_girl_rails', '~> 4.4'
  gem 'ffaker'
end

group :test do
  gem 'database_cleaner', '~> 1.2'
  gem 'rspec-rails', '~> 2.14'
  # Here to silence annoying warnings
  # must come before shoulda-matchers
  # https://github.com/thoughtbot/shoulda-matchers/issues/408#issuecomment-37011141
  gem 'minitest'
  gem 'shoulda-matchers', '~> 2.5'
end
