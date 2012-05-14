class MoteMap

  before '/api/node*' do
    args = [:dbname, :host, :user].to_h {|v| settings.config.get_value(v.to_s).to_s}
    args[:connect_timeout] = 1
    begin
      @conn = PG::Connection.open(args)
    rescue PG::Error => err
      return {:error => "no database connection available", :detail => err.to_s}
    end
  end

  after '/api/node*' do
    @conn.close if !@conn.nil?
  end

end
