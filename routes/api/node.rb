class MoteMap
  
  get '/api/config' do
    settings.config.params.to_json
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

  get '/api/nodes/health' do
    return node_list.to_h {|nid| node_health(nid)}.to_json
  end

  get '/api/node/:nid/data/?:field?' do
    return node_data(params[:nid].to_i, params[:field]).to_json
  end

  get '/api/nodes/data/?:field?' do
    return node_list.to_h {|nid| node_data(nid, params[:field])}.to_json
  end

  get '/api/node/:nid/metadata/?:field?' do
    return node_metadata(params[:nid].to_i, params[:field]).to_json
  end

  get '/api/nodes/metadata/?:field?' do
    return node_list.to_h {|nid| node_metadata(nid, params[:field])}.to_json
  end

  put '/api/node/:nid/metadata' do
    md = Metadata.first_or_create(:id => params[:nid].to_i)
    md.x = params[:x].to_i if !params[:x].nil?
    md.y = params[:y].to_i if !params[:y].nil?
    return {}.to_json if md.save
    return {:error => "Failed to save metadata for node #{params[:nid]}"}
  end

end
