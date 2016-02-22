import StepDetector from './quickCadence/stepDetector';
import PowerConverter from './quickCadence/powerConverter';
import CadenceCounter from './quickCadence/cadenceCounter';

const QuickCadence = {
  pipe(stream) {
    var power = PowerConverter.pipe(stream);
    var steps = StepDetector.pipe(power);
    var cadence = CadenceCounter.pipe(steps);
    return cadence;
  },

  pipeRx(stream) {
    var power = PowerConverter.pipe(stream);
    var steps = StepDetector.pipe(power);
    var cadence = CadenceCounter.pipe(steps);
    return cadence;
  }
};

export default QuickCadence
