require 'dotenv'
Dotenv.load

require 'sequel'
DB = Sequel.connect ENV.fetch('DATABASE_URL')

# check for pending migrations
Sequel.extension :migration
Sequel::Migrator.check_current(DB, 'db/migrations')
