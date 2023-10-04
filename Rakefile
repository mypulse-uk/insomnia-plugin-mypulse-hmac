namespace :plugin do
  desc 'copies the project into your insomnia plugin folder for debugging'
  task :install_dev, [:insomnia_path] do |_, args|
    insomnia_path = case get_platform
                    when 'mac'
                      "#{Dir.home}/Library/Application Support/Insomnia"
                    when 'linux'
                      "#{Dir.home}/.config/Insomnia"
                    else
                      raise 'unsupported platform'
                    end
    plugins_path = "#{insomnia_path}/plugins"
    plugin_path = "#{plugins_path}/insomnia-plugin-mypulse-hmac"

    unless File.exists? plugins_path
      raise "Could not find insomnia plugins at #{plugins_path}"
    end

    unless File.exists? plugin_path
      FileUtils.mkdir(plugin_path)
    end
    puts "Copying plugin to #{plugin_path}"
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

def get_platform
  if /darwin/ =~ RUBY_PLATFORM
    'mac'
  elsif /linux/ =~ RUBY_PLATFORM
    'linux'
  else
    'windows'
  end
end