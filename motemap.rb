require 'data_mapper'
require 'haml'
require 'json'
require 'parseconfig'
require 'pg'
require 'pp'
require 'sass'
require 'sinatra/base'

require './helpers.rb'
Dir['./models/*.rb'].each {|f| require f}

class MoteMap < Sinatra::Base

  configure do
    set :config, ParseConfig.new("./postgres.conf")

    DataMapper.setup(:default, "sqlite://#{Dir.pwd}/metadata.sqlite")
    DataMapper.finalize
    DataMapper.auto_upgrade!
  end

  Dir['./routes/**/*.rb'].each {|f| require f}

  run! if app_file == $0

end

