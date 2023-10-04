namespace :plugin do
  desc 'copies the project into your insomnia plugin folder for debugging'
  task :install_dev do |_, args|
    plugins_path = "#{Dir.home}/Library/Application Support/Insomnia/plugins"
    plugin_path = "#{plugins_path}/insomnia-plugin-mypulse-hmac"
    unless File.exists? plugins_path
      raise "Could not find insomnia plugins at #{plugins_path}"
    end

    unless File.exists? plugin_path
      FileUtils.mkdir(plugin_path)
    end
    FileUtils.cp("./package.json", "#{plugin_path}/package.json")
    FileUtils.cp("./main.js", "#{plugin_path}/main.js")
  end

  namespace :dependencies do
    desc 'Install dependencies'
    task :install do
      sh('npm', 'install')
    end
  end

  desc 'Build content for deployment identifier'
  task :test, [] => [:'plugin:dependencies:install'] do |_, args|
    sh('npm', 'test')
  end

end