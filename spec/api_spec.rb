require 'spec_helper'

describe Transitmix::API do
  include Rack::Test::Methods

  def app
    Transitmix::API
  end

  def response_body
    JSON.parse(last_response.body)
  end

  describe 'GET /api/lines/:id' do
    let(:line) { create(:line) }

    it 'is successful' do
      get "/api/lines/#{line.id}"
      expect(last_response.status).to eq 200
    end

    it 'returns the record' do
      get "/api/lines/#{line.id}"
      expect(last_response.body).to eq line.to_json
    end

    it 'is not found', pending: "pending until ID changed to int" do
      get "/api/lines/missing-id"
      expect(last_response.status).to eq 404
    end
  end

  describe 'POST /api/lines' do
    let(:params) { attributes_for(:line) }

    it 'is successful' do
      post '/api/lines', params
      expect(last_response.status).to eq 201
    end

    it 'creates a new record' do
      expect { post '/api/lines', params }.to change{ Line.count }.by(+1)
    end
  end

  describe 'GET /api/lines' do
    it 'is sucessful' do
      get '/api/lines'
      expect(last_response.status).to eq 200
    end

    it 'returns the list of lines' do
      lines = create_list(:line, 5)
      get '/api/lines', per: 2
      expect(response_body.first['id']).to eq lines.last.id
    end
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
