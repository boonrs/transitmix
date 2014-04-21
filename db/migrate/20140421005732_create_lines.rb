class CreateLines < ActiveRecord::Migration
  def change
    create_table :lines do |t|
    	t.string :name
      t.string :description
      t.integer :frequency
      t.integer :speed
      t.time :start
      t.time :end
      t.string :color
      t.decimal :coordinates, :array => true
    end
  end
end
