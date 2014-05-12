Sequel.migration do
  up do
    execute %{CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;}
  end

  down do
    execute %{DROP EXTENSION "uuid-ossp";}
  end
end
