class LineSearch
  DIRECTIONS = %w(asc desc)

  def initialize(params, relation = Line)
    @params = params
    @rel = relation
  end

  def all
    paginate!
    order!

    @rel
  end

  def paginate!
    @rel = @rel.page(page)
    @rel = @rel.per(per)
  end

  def order!
    @rel = @rel.order("#{order_by} #{direction}")
  end

  def page
    @params[:page] || 1
  end

  def per
    @params[:per] || 20
  end

  def order_by
    @params[:order_by] || :created_at
  end

  def direction
    @params[:direction] || :desc
  end
end
