class CreateLines < ActiveRecord::Migration
  def change
    create_table :lines, id: :uuid do |t|
      t.text :properties, null: false, default: {}.to_json
      t.text :coordinates, null: false, default: [[],[]].to_json

      t.timestamps
    end
  end
end
