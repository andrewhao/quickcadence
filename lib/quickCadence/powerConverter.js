const calculatePower = (d) => parseInt(d.y, 10)

var PowerConverter = {
  pipe: function(stream) {
    return stream
    .map((v) => Object.assign(v, { power: calculatePower(v) }))
  }
};

module.exports = PowerConverter;
