Sequel.migration do
  up do
    drop_column :lines, :id

    alter_table(:lines) do
      add_primary_key :id
    end
  end

  down do
    drop_column :lines, :id

    alter_table(:lines) do
      add_column :id, :uuid, default: Sequel.function(:uuid_generate_v4), primary_key: true
    end
  end
end
