class MoteMap

  get '/' do
    haml :index
  end

  get '/style.css' do
    sass :style
  end

  get '/background' do
    content_type "image/png"
    File.open("background.png") {|f| f.read}
  end

  get '/background/set' do
    haml :upload
  end

  post '/background/set' do
    file = params['background'][:tempfile]
    File.open("background.png", "w") {|f| f.write file.read}
    redirect '/'
  end

end
