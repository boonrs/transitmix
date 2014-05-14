require './spec/rb/spec_helper.rb'

describe Transitmix::Routes::Home do
  include Rack::Test::Methods

  def app
    subject
  end

  describe 'GET /' do
    it 'responds with 200 OK' do
      get '/'
      expect(last_response.status).to eq 200
    end

    it 'returns a non-empty body' do
      get '/'
      expect(last_response.body).not_to be_empty
    end
  end
end
