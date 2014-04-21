Rails.application.routes.draw do
  resources :lines, only: [:index, :show, :create, :update, :destroy]
  root to: 'main#index'
end
