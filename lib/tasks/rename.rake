desc "Rename this application"
task :rename, [:name] => :environment do |t, args|
  files  = Dir.glob(%w(rb yml).map{ |ext| Rails.root.join("**/*.#{ext}") }) + %w(Rakefile)
  before = Rails.application.class.name.split('::').first
  after  = args.name or raise "Pass a new name as an argument: $ rake rename[MyCivicApp]"

  files.each do |file|
    # Swap in the new name
    renamed = File.read(file).gsub(/#{before}/, after).gsub(/#{before.underscore}/, after.underscore)
    # Write the updated contents
    File.write(file, renamed)
  end
end
