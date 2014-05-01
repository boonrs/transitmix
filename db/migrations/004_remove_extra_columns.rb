Sequel.migration do
  up do
    drop_column :lines, :color2
    drop_column :lines, :color3
  end

  down do
    add_column :lines, :color2, String
    add_column :lines, :color3, String
  end
end
