require 'json'
require 'parseconfig'
require 'pg'
require 'pp'
require 'sinatra/base'

require './helpers.rb'

class MoteMap < Sinatra::Base

  configure do
    set :config, ParseConfig.new("./postgres.conf")
  end

  before do
    @conn = PG::Connection.open([:dbname, :host, :user].to_h {|v| settings.config.get_value(v.to_s).to_s})
  end

  after do
    @conn.close
  end

  get '/' do
    "Hello world"
  end

  get '/config' do
    settings.config.params.to_json
  end

  Dir['./routes/**/*.rb'].each {|f| require f}

  run! if app_file == $0

end

