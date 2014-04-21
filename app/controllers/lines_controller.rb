class LinesController < ApplicationController
  skip_before_action :verify_authenticity_token

  # GET /lines.json
  def index
    render json: LineSearch.new(query_params).all
  end

  # GET /lines/1.json
  def show
    render json: Line.find(params[:id])
  end

  # POST /lines.json
  def create
    render json: Line.create(line_params)
  end

  # PATCH/PUT /lines/1.json
  def update
    line = Line.find(params[:id])
    line.update(line_params)
    render json: { status: :ok, location: line }
  end

  # DELETE /lines/1.json
  def destroy
    Line.find(params[:id]).destroy
    head :no_content
  end

  private

  def line_params
    # Using serialized columns for development. Brakeman will correctly warn of mass assignment
    # vulnerability. Once the data settles, we'll break out individual columns and PostGIS types.
    params.require(:line).permit!
  end

  def query_params
    params.permit(:page, :per, :order_by, :direction)
  end
end
