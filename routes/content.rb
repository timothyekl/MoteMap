class MoteMap

  get '/' do
    haml :index
  end

  get '/style.css' do
    sass :style
  end

end
