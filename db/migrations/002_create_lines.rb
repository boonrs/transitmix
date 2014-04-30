Sequel.migration do
  up do
    create_table :lines do
      column :id, :uuid, default: Sequel.function(:uuid_generate_v4), primary_key: true
      String :name
      String :description
      String :start_time
      String :end_time
      Integer :frequency
      Integer :speed
      String :color
      String :color2
      String :color3
      DateTime :created_at
      DateTime :updated_at
    end
  end

  down do
    drop_table :lines
  end
end
