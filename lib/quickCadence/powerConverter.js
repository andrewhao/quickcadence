var PowerConverter = {
  pipe: function(stream) {
    return stream
      .map(function(d) {
        var val = parseInt(d.y, 10);
        return val
      });
  }
};

module.exports = PowerConverter;
