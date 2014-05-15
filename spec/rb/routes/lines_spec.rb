require './spec/rb/spec_helper.rb'
require 'json'

describe Transitmix::Routes::Lines do
  include Rack::Test::Methods

  def app
    subject
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

    it 'is not found' do
      max = Line.max(:id) || 0
      get "/api/lines/#{ max + 1 }"
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

  describe 'PUT /api/lines/:id/remix' do
    let(:line) { create(:line) }

    it 'is successful' do
      put "/api/lines/#{line.id}/remix"
      expect(last_response.status).to eq 200
    end

    it 'returns a line with a different id' do
      put "/api/lines/#{line.id}/remix"
      remix = JSON.parse(last_response.body)
      expect(remix["id"]).should_not eq line.id
    end

    it 'copies a line' do
      put "/api/lines/#{line.id}/remix"
      remix = JSON.parse(last_response.body).symbolize_keys

      # ignore the id when comparing and datetime stuff
      remix[:id] = nil
      line.id = nil
      remix[:created_at] = nil
      line.created_at = nil
      remix[:updated_at] = nil
      line.updated_at = nil

      expect(remix).to eq line.values
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
      expect(last_response.body).to eq [lines[4], lines[3]].to_json
    end
  end

  describe 'DELETE /api/lines' do
    let!(:line) { create(:line) }

    it 'is sucessful' do
      delete "/api/lines/#{ line.id }"
      expect(last_response.status).to eq 200
    end

    it 'deletes the line' do
      expect { delete "/api/lines/#{ line.id }" }.to change{ Line.count }.by(-1)
    end
  end
end
