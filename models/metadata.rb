class Metadata
  include DataMapper::Resource

  property :id, Integer, :key => true
  property :x, Integer, :default => -1
  property :y, Integer, :default => -1
  property :visible, Boolean, :default => true
end
