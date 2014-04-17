# TransitMix

## Install

Start by cloning this Github repository to your development environment:

    git clone git@github.com:codeforamerica/transitmix.git

Transitmix is a Ruby on Rails application. Prepare your development environment
by first installing [Ruby](https://github.com/codeforamerica/howto/blob/master/Ruby.md)
and [Rails](https://github.com/codeforamerica/howto/blob/master/Rails.md).

TODO: setup test suite and add readme instructions.

Inside your repository:

```console
bundle install
bundle exec rake db:create
bundle exec rake db:migrate
rails server
```

## Deploy

To deploy to Heroku:

```console
heroku create my-app-name
heroku config:set SECRET_KEY_BASE=`bundle exec rake secret`
git push heroku master
heroku run rake db:migrate
heroku open
```
