class LinesController < ApplicationController
  # TODO: should be passing an authenticity token with json requests
  skip_before_action :verify_authenticity_token

  rescue_from ActiveRecord::RecordNotFound, ActiveRecord::StatementInvalid, with: :not_found

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
    # TODO: will need to conditionally return errors once
    # validations are put in place.
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

  def not_found
    render json: { errors: 'not-found' }, status: 404
  end
end
