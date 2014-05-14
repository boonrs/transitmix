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
end
