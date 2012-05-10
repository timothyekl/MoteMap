class MoteMap
  
  helpers do
    def node_list
      res = @conn.exec("SELECT DISTINCT ON (nodeid) * FROM node_health ORDER BY nodeid, result_time DESC")
      return res.map{|t| t['nodeid']}.map{|t| t.to_i.to_s == t ? t.to_i : t}
    end

    def node_info(node_id, table, limit = 1)
      res = @conn.exec("SELECT * FROM #{table} WHERE nodeid=$1 ORDER BY result_time DESC LIMIT #{limit}", [node_id])
      if res.num_tuples != limit 
        return {:error => "unexpected number of tuples: #{res.num_tuples} for #{limit}"}
      else
        return res[0] if limit == 1 # special case: return tuple only, not in list, if only one result desired
        return res[0..(limit - 1)]
      end
    end

    def node_health(node_id)
      return self.node_info(node_id, "node_health")
    end

    def node_data(node_id, field = nil)
      res = self.node_info(node_id, "xbw_da100_results")
      return field.nil? ? res : res[field]
    end
  end

  get '/api/nodes' do
    return self.node_list.to_json
  end

  get '/api/node/:nid' do
    if self.node_list.include? params[:nid].to_i
      return ["health", "data"].to_json
    end
    return {:error => "Unknown node ID #{params[:nid]}"}.to_json
  end

  get '/api/node/:nid/health' do
    return node_health(params[:nid].to_i).to_json
  end

  get '/api/node/:nid/data/?:field?' do
    data = node_data(params[:nid].to_i, params[:field])
    return data.to_i.to_json if data.respond_to? :to_i and data.to_i.to_s == data
    return data.to_json
  end

end
