require 'dotenv'
Dotenv.load

require 'logger'
require 'sequel'
DB = Sequel.connect(ENV.fetch('DATABASE_URL'), logger: Logger.new(STDOUT))

# check for pending migrations
Sequel.extension :migration
Sequel::Migrator.check_current(DB, 'db/migrations')

# enable pagination
Sequel::Model.db.extension :pagination

# require model files
Dir['./lib/models/**/*.rb'].each { |f| require(f) }
