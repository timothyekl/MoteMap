class Array
  def to_h(&blk)
    Hash[*self.collect { |v|
      [v, blk.call(v)]
    }.flatten]
  end
end
