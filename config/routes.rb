Rails.application.routes.draw do
  scope :api do
    resources :lines, only: [:index, :show, :create, :update, :destroy]
  end

  root to: 'main#index'
end
