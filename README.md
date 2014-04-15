# TransitMix

## Setup

TODO: setup test suite and add readme instructions.

```console
git clone git@github.com:codeforamerica/transitmix.git
cd transitmix
bundle install
bundle exec rake db:create
bundle exec rake db:migrate
bundle exec rails server
```

## Deploy

```console
heroku create my-app-name
heroku config:set SECRET_KEY_BASE=`bundle exec rake secret`
git push heroku master
heroku run rake db:migrate
heroku open
```
