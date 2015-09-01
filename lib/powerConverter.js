var PowerConverter = {
  pipe: function(stream) {
    return stream
      .map(function(d) {
        return parseInt(d.x, 10);
      });
  }
};

module.exports = PowerConverter;
