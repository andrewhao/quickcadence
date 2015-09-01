var PowerConverter = {
  pipe: function(stream) {
    return stream
      .map(function(d) {
        var rawMagnitude = Math.sqrt(Math.pow(d.x, 2), Math.pow(d.y, 2), Math.pow(d.z, 2));
        return rawMagnitude;
      });
  }
};

module.exports = PowerConverter;
