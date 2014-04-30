# TransitMix

## Setup

```console
git clone ...
cd transitmix
bundle install
rake db:create db:migrate
bundle exec rackup
```

## Deploy

```console
heroku create <app name>
heroku addons:add heroku-postgresql
git push heroku master
heroku run rake db:migrate
heroku open
```
