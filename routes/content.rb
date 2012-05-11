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

end
