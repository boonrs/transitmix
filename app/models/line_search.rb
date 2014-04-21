class LineSearch
  DIRECTIONS = %w(asc desc)

  def initialize(params, relation = Line)
    @params = params
    @rel = relation
  end

  def all
    paginate! if paginate?
    order! if order?

    @rel
  end

  def paginate!
    @rel = @rel.page(@params[:page])
    @rel = @rel.per(@params[:per]) if @params[:per]
  end

  def paginate?
    @params[:page].present?
  end

  def order!
    @rel = @rel.order("#{@params[:order_by]} #{@params[:direction]}")
  end

  def order?
    Line.column_names.include?(@params[:order_by].downcase) &&
      DIRECTIONS.include?(@params[:direction].downcase)
  end
end
