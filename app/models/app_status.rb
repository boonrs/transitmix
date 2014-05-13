class AppStatus
  OK = 'ok'.freeze
  FAILURE = 'not ok'.freeze

  def payload
    {
      dependencies: %w(heroku-postgresql heroku-scheduler mapbox mapbox-smart-directions),
      status: status,
      updated: Time.now.to_i,
      resources: {}
    }
  end

  def status
    raise if DB.tables.empty?

    OK
  rescue
    FAILURE
  end

  def to_json
    JSON.pretty_generate(payload)
  end
end
