require 'spec_helper'

describe Transitmix::API do
  include Rack::Test::Methods

  def app
    Transitmix::API
  end

  def response_body
    JSON.parse(last_response.body)
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
end
