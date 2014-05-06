Sequel.migration do
  up do
    create_table :maps do
      primary_key :id
      String :name
      Text :center
      Integer :zoom_level
      DateTime :created_at
      DateTime :updated_at
    end

    alter_table(:lines) do
      add_foreign_key :map_id, :maps
    end
  end

  down do
    alter_table(:lines) do
      drop_foreign_key :map_id
    end

    drop_table :maps
  end
end
