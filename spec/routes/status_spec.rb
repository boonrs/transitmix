require 'spec_helper'

describe Transitmix::Routes::Status do
  include Rack::Test::Methods

  def app
    Transitmix::Routes::Status
  end

  it 'returns the application status' do
    get '/.well-known/status'
    expect(last_response.body).to eq AppStatus.new.to_json
  end
end
