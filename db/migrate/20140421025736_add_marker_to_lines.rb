class AddMarkerToLines < ActiveRecord::Migration
  def change
  	add_column :lines, :marker, :decimal, :array => true
  end
end
