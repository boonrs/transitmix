Sequel.migration do
  up do
    execute %{DROP EXTENSION "uuid-ossp";}
  end

  down do
    execute %{CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;}
  end
end
