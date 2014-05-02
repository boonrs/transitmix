Sequel.migration do
  up do
    add_column :lines, :coordinates, :text
  end

  down do
    drop_column :lines, :coordinates
  end
end
