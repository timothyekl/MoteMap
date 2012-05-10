class MoteMap

  get '/api/nodes' do
    res = @conn.exec("SELECT DISTINCT ON (nodeid) * FROM node_health ORDER BY nodeid, result_time DESC")
    return res.map{|t| t['nodeid']}.to_json
  end

  get '/api/node/:nid/health' do
    res = @conn.exec("SELECT * FROM node_health WHERE nodeid=$1 ORDER BY result_time DESC LIMIT 1", [params[:nid].to_i])
    if res.num_tuples != 1
      return {:error => "unexpected number of tuples: #{res.num_tuples}"}.to_json
    else
      return res[0].to_json
    end
  end

  get '/api/node/:nid/data' do
    res = @conn.exec("SELECT * FROM xbw_da100_results WHERE nodeid=$1 ORDER BY result_time DESC LIMIT 1", [params[:nid].to_i])
    if res.num_tuples != 1
      return {:error => "unexpected number of tuples: #{res.num_tuples}"}.to_json
    else
      return res[0].to_json
    end
  end

end
