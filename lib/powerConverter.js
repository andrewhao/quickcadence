var PowerConverter = {
  pipe: function(stream) {
    return stream
      .map(function(d) {
        //var rawMagnitude = Math.sqrt(Math.pow(d.x, 2), Math.pow(d.y, 2), Math.pow(d.z, 2));
        //return rawMagnitude;
        //
        var val = parseInt(d.y, 10);
        return val < 0 ? 0 : val;
      });
  }
};

module.exports = PowerConverter;
