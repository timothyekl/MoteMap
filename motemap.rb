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
    args = [:dbname, :host, :user].to_h {|v| settings.config.get_value(v.to_s).to_s}
    args[:connect_timeout] = 1
    begin
      @conn = PG::Connection.open(args)
    rescue PG::Error => err
      return {:error => "no database connection available", :detail => err.to_s}
    end
  end

  after do
    @conn.close if !@conn.nil?
  end

  Dir['./routes/**/*.rb'].each {|f| require f}

  run! if app_file == $0

end

