# Transitmix

Transitmix is a sketching tool for transit planners (both professional and armchair) to quickly design routes and share with the public. It lives at [transitmix.net](http://transitmix.net).

## About

### What does this do now?

* You can draw your own routes by dragging and dropping points and it snaps to a street grid.
* You can input stats like headway ("bus comes every X min"), speed (mph), and operating hours.
* It outputs stats like distance of route, # of buses required, and total cost.

### What will this do in the future?

* It will take customizable inputs for layover percentage, cost per revenue hour, annual service days, and perhaps bus capacity.
* It will output round trip / cycle time, revenue hours per day, and estimated ridership
* It will allow users to import custom data for decision making (i.e. census data, residential density, employment density, etc.)

### What does this not do?

* Transitmix is not (yet) a replacement for professional transit operations planning and scheduling.

### How can I help?

* Check out our github issues page [here](https://github.com/codeforamerica/transitmix/issues/).


## Setup

Transitmix is a Ruby application with a PostgreSQL database.

1. [Install PostgreSQL](https://github.com/codeforamerica/howto/blob/master/PostgreSQL.md).
2. [Install Ruby](https://github.com/codeforamerica/howto/blob/master/Ruby.md).

Finally, clone Transmitmix from Github and prepare the database:
   
```console
git clone https://github.com/codeforamerica/transitmix.git
cd transitmix
cp .env.sample .env
bundle install
rake db:create db:migrate
rake db:create db:migrate DATABASE_URL=postgres://localhost/transitmix_test
bundle exec rackup
```

## Deploy to Heroku

```console
heroku create <app name>
heroku addons:add heroku-postgresql
git push heroku master
heroku run rake db:migrate
heroku open
```

### Various Setup Notes
* Install PostGres via `brew install postgres`, event if you have Postgres.app otherwise bundle install will keep failing.
* If you wish to work on Sinatra and want auto-reload per file change:

```
gem install rerun
rerun 'bundle exec rackup'
```
