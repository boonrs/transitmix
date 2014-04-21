require 'spec_helper'

describe LinesController do
  def response_body
    JSON.parse response.body
  end

  describe 'GET index' do
    let(:params) {{
      page: 2,
      per: 2,
      order_by: 'created_at',
      direction: 'desc',
      format: :json
    }}
    let!(:lines) { create_list(:line, 4) }

    it 'returns the filtered records' do
      get :index, params
      expect(response_body[0]['coordinates']).to eq lines[1].coordinates
    end
  end

  describe 'DELETE destroy' do
    let(:params) {{
      id: line.to_param,
      format: :json
    }}
    let!(:line) { create(:line) }

    it 'responds 204 NO CONTENT' do
      delete :destroy, params
      expect(response.code).to eq "204"
    end

    it 'deletes the record' do
      expect { delete :destroy, params }.to change{ Line.count }.by(-1)
    end
  end

  describe 'PATCH update' do
    let(:params) {{
      id: line.to_param,
      line: new_attributes,
      format: :json
    }}
    let(:new_attributes) { attributes_for(:line) }
    let!(:line) { create(:line) }

    it 'responds 200 OK' do
      patch :update, params
      expect(response.code).to eq "200"
    end

    it 'updates the record' do
      patch :update, params
      expect(line.reload.coordinates).to eq new_attributes[:coordinates]
    end
  end

  describe 'GET show' do
    let(:params) {{
      id: line.to_param,
      format: :json
    }}
    let!(:line) { create(:line) }

    it 'responds 200 OK' do
      get :show, params
      expect(response.code).to eq "200"
    end

    it 'responds with the record' do
      get :show, params
      expect(response_body['coordinates']).to eq line.coordinates
    end
  end

  describe 'POST create' do
    let(:params) {{ line: attributes_for(:line), format: :json }}

    it 'responds 200 OK' do
      post :create, params
      expect(response.code).to eq "200"
    end

    it 'creates a new record' do
      expect { post :create, params }.to change{ Line.count }.by(+1)
    end

    it 'stores the nested data' do
      post :create, params
      line = Line.order('created_at desc').first
      expect(line.coordinates).to eq response_body['coordinates']
    end
  end
end
