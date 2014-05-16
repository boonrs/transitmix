require './spec/rb/spec_helper.rb'

describe Transitmix::Routes::Maps do
  include Rack::Test::Methods

  def app
    subject
  end

  describe 'GET /api/maps/:id' do
    let(:map) { create(:map) }

    it 'is successful' do
      get "/api/maps/#{map.id}"
      expect(last_response.status).to eq 200
    end

    it 'returns the record' do
      get "/api/maps/#{map.id}"
      expect(last_response.body).to eq map.to_json
    end

    it 'is not found' do
      missing_id = (Map.dataset.max(:id) || 0) + 1
      get "/api/maps/#{missing_id}"
      expect(last_response.status).to eq 404
    end
  end

  describe 'POST /api/maps' do
    let(:params) { attributes_for(:map) }

    it 'is successful' do
      post '/api/maps', params
      expect(last_response.status).to eq 201
    end

    it 'creates a new record' do
      expect { post '/api/maps', params }.to change{ Map.count }.by(+1)
    end
  end

  describe 'GET /api/maps' do
    it 'is successful' do
      get '/api/maps'
      expect(last_response.status).to eq 200
    end

    it 'returns the list of maps' do
      maps = create_list(:map, 5)
      get '/api/maps', per: 2
      expect(last_response.body).to eq [maps[4], maps[3]].to_json
    end
  end

  describe 'PUT /api/maps/:id/remix' do
    let(:map) { create(:map) }
    let(:lines) { Array.new(3) { FactoryGirl.create(:line, map_id: map.id) } }
    it 'is successful' do
      put "/api/maps/#{map.id}/remix"
      expect(last_response.status).to eq 200
    end

    it 'returns a map with a different id' do
      put "/api/maps/#{map.id}/remix"
      remix = JSON.parse(last_response.body)
      expect(remix["id"]).should_not eq map.id
    end

    it 'copies a map' do
      put "/api/maps/#{map.id}/remix"

      remix = JSON.parse(last_response.body).symbolize_keys

      puts "*"*40
      p map.id
      p lines
      p remix[:lines]
      puts "*"*40

      # In comparisons, ignore id and datetime
      remix[:id] = nil
      map.id = nil
      remix[:created_at] = nil
      map.created_at = nil
      remix[:updated_at] = nil
      map.updated_at = nil

      # map.lines = nil

      # remix = JSON.parse(last_response.body).symbolize_keys

      # # ignore the id when comparing and datetime stuff
      # remix[:id] = nil
      # line.id = nil
      # remix[:created_at] = nil
      # line.created_at = nil
      # remix[:updated_at] = nil
      # line.updated_at = nil

      # expect(remix).to eq line.values
    end
  end
end
