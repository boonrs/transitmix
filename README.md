# Transitmix

TODO: What is this?

## Setup

[Install PostgreSQL](https://github.com/codeforamerica/howto/blob/master/PostgreSQL.md).

```console
git clone https://github.com/codeforamerica/transitmix.git
cd transitmix
cp .env.sample .env
bundle install
rake db:create db:migrate
rake db:create db:migrate DATABASE_URL=postgres://localhost/transitmix_test
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
