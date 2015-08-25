var PowerConverter = {
  pipe: function(stream) {
    return stream
      .map(function(d) {
        return d.x;
      });
  }
};

module.exports = PowerConverter;
