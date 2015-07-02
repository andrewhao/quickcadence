(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Bacon = require('baconjs');
var csv = require('csv');

// From a stream of data points @ 50hz, buffer the points and release
// @ 50hz.
var Baconifier = {
  pipe: function(stream) {
    var parser = csv.parse({delimeter: ",", columns: true});
    var rawStream = Bacon
                    .fromEvent(stream.pipe(parser), 'data')
                    .bufferingThrottle(1/50 * 1000);
    return rawStream;
  }
}

module.exports = Baconifier;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../lib/baconifier.js","/../../lib")
},{"baconjs":3,"buffer":9,"csv":4,"oMfpAn":14}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
Bacon = require('baconjs');

var CadenceCounter = {
  pipe: function(stream) {
    var combinedStream = stream
      .map(function(d) {
        return Math.sqrt(
          Math.pow(d.x, 2),
          Math.pow(d.y, 2),
          Math.pow(d.z, 2)
        )
      });

    var cadenceStream = combinedStream
      .slidingWindow(4,4)
      .map(function(arr) {
        var diff = arr[1] - arr[0]
        var changeSignal = (diff > 0) ? 1 : -1;
        return {"diff": diff, "changeSignal": changeSignal}
      })
      .slidingWindow(2,2)
      .filter(function(arr) {
        return arr[0].changeSignal !== arr[1].changeSignal
      })
      .debounce(100)
      .map(function() {
        return new Date()
      })
      .slidingWindow(10, 2)
      .map(function(times) {
        var t1 = times[0]
        var tlast = times[times.length - 1]
        // ms per event
        return (tlast - t1) / times.length
      })
      .map(function(duration) {
        // ms per cycle
        return duration * 2
      })
      .map(function(duration) {
        // cycles per ms
        var cyclesPerMs = 1 / duration
        return cyclesPerMs * 1000 * 60
      })
    return cadenceStream;
  }
}
module.exports = CadenceCounter;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../lib/cadenceCounter.js","/../../lib")
},{"baconjs":3,"buffer":9,"oMfpAn":14}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
(function() {
  var Bacon, BufferingSource, Bus, CompositeUnsubscribe, ConsumingSource, Desc, Dispatcher, End, Error, Event, EventStream, Exception, Initial, Next, None, Observable, Property, PropertyDispatcher, Some, Source, UpdateBarrier, _, addPropertyInitValueToStream, assert, assertArray, assertEventStream, assertFunction, assertNoArguments, assertObservable, assertObservableIsProperty, assertString, cloneArray, constantToFunction, containsDuplicateDeps, convertArgsToFunction, describe, endEvent, eventIdCounter, eventMethods, findDeps, findHandlerMethods, flatMap_, former, idCounter, initialEvent, isArray, isFieldKey, isObservable, latter, liftCallback, makeFunction, makeFunctionArgs, makeFunction_, makeObservable, makeSpawner, nextEvent, nop, partiallyApplied, recursionDepth, ref, registerObs, spys, toCombinator, toEvent, toFieldExtractor, toFieldKey, toOption, toSimpleExtractor, valueAndEnd, withDesc, withMethodCallSupport,
    hasProp = {}.hasOwnProperty,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bacon = {
    toString: function() {
      return "Bacon";
    }
  };

  Bacon.version = '0.7.65';

  Exception = (typeof global !== "undefined" && global !== null ? global : this).Error;

  nop = function() {};

  latter = function(_, x) {
    return x;
  };

  former = function(x, _) {
    return x;
  };

  cloneArray = function(xs) {
    return xs.slice(0);
  };

  assert = function(message, condition) {
    if (!condition) {
      throw new Exception(message);
    }
  };

  assertObservableIsProperty = function(x) {
    if (x instanceof Observable && !(x instanceof Property)) {
      throw new Exception("Observable is not a Property : " + x);
    }
  };

  assertEventStream = function(event) {
    if (!(event instanceof EventStream)) {
      throw new Exception("not an EventStream : " + event);
    }
  };

  assertObservable = function(event) {
    if (!(event instanceof Observable)) {
      throw new Exception("not an Observable : " + event);
    }
  };

  assertFunction = function(f) {
    return assert("not a function : " + f, _.isFunction(f));
  };

  isArray = function(xs) {
    return xs instanceof Array;
  };

  isObservable = function(x) {
    return x instanceof Observable;
  };

  assertArray = function(xs) {
    if (!isArray(xs)) {
      throw new Exception("not an array : " + xs);
    }
  };

  assertNoArguments = function(args) {
    return assert("no arguments supported", args.length === 0);
  };

  assertString = function(x) {
    if (typeof x !== "string") {
      throw new Exception("not a string : " + x);
    }
  };

  _ = {
    indexOf: Array.prototype.indexOf ? function(xs, x) {
      return xs.indexOf(x);
    } : function(xs, x) {
      var i, j, len1, y;
      for (i = j = 0, len1 = xs.length; j < len1; i = ++j) {
        y = xs[i];
        if (x === y) {
          return i;
        }
      }
      return -1;
    },
    indexWhere: function(xs, f) {
      var i, j, len1, y;
      for (i = j = 0, len1 = xs.length; j < len1; i = ++j) {
        y = xs[i];
        if (f(y)) {
          return i;
        }
      }
      return -1;
    },
    head: function(xs) {
      return xs[0];
    },
    always: function(x) {
      return function() {
        return x;
      };
    },
    negate: function(f) {
      return function(x) {
        return !f(x);
      };
    },
    empty: function(xs) {
      return xs.length === 0;
    },
    tail: function(xs) {
      return xs.slice(1, xs.length);
    },
    filter: function(f, xs) {
      var filtered, j, len1, x;
      filtered = [];
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        if (f(x)) {
          filtered.push(x);
        }
      }
      return filtered;
    },
    map: function(f, xs) {
      var j, len1, results, x;
      results = [];
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        results.push(f(x));
      }
      return results;
    },
    each: function(xs, f) {
      var key, value;
      for (key in xs) {
        if (!hasProp.call(xs, key)) continue;
        value = xs[key];
        f(key, value);
      }
      return void 0;
    },
    toArray: function(xs) {
      if (isArray(xs)) {
        return xs;
      } else {
        return [xs];
      }
    },
    contains: function(xs, x) {
      return _.indexOf(xs, x) !== -1;
    },
    id: function(x) {
      return x;
    },
    last: function(xs) {
      return xs[xs.length - 1];
    },
    all: function(xs, f) {
      var j, len1, x;
      if (f == null) {
        f = _.id;
      }
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        if (!f(x)) {
          return false;
        }
      }
      return true;
    },
    any: function(xs, f) {
      var j, len1, x;
      if (f == null) {
        f = _.id;
      }
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        if (f(x)) {
          return true;
        }
      }
      return false;
    },
    without: function(x, xs) {
      return _.filter((function(y) {
        return y !== x;
      }), xs);
    },
    remove: function(x, xs) {
      var i;
      i = _.indexOf(xs, x);
      if (i >= 0) {
        return xs.splice(i, 1);
      }
    },
    fold: function(xs, seed, f) {
      var j, len1, x;
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        seed = f(seed, x);
      }
      return seed;
    },
    flatMap: function(f, xs) {
      return _.fold(xs, [], (function(ys, x) {
        return ys.concat(f(x));
      }));
    },
    cached: function(f) {
      var value;
      value = None;
      return function() {
        if (value === None) {
          value = f();
          f = void 0;
        }
        return value;
      };
    },
    isFunction: function(f) {
      return typeof f === "function";
    },
    toString: function(obj) {
      var ex, internals, key, value;
      try {
        recursionDepth++;
        if (obj == null) {
          return "undefined";
        } else if (_.isFunction(obj)) {
          return "function";
        } else if (isArray(obj)) {
          if (recursionDepth > 5) {
            return "[..]";
          }
          return "[" + _.map(_.toString, obj).toString() + "]";
        } else if (((obj != null ? obj.toString : void 0) != null) && obj.toString !== Object.prototype.toString) {
          return obj.toString();
        } else if (typeof obj === "object") {
          if (recursionDepth > 5) {
            return "{..}";
          }
          internals = (function() {
            var results;
            results = [];
            for (key in obj) {
              if (!hasProp.call(obj, key)) continue;
              value = (function() {
                try {
                  return obj[key];
                } catch (_error) {
                  ex = _error;
                  return ex;
                }
              })();
              results.push(_.toString(key) + ":" + _.toString(value));
            }
            return results;
          })();
          return "{" + internals + "}";
        } else {
          return obj;
        }
      } finally {
        recursionDepth--;
      }
    }
  };

  recursionDepth = 0;

  Bacon._ = _;

  UpdateBarrier = Bacon.UpdateBarrier = (function() {
    var afterTransaction, afters, aftersIndex, currentEventId, flush, flushDepsOf, flushWaiters, hasWaiters, inTransaction, rootEvent, waiterObs, waiters, whenDoneWith, wrappedSubscribe;
    rootEvent = void 0;
    waiterObs = [];
    waiters = {};
    afters = [];
    aftersIndex = 0;
    afterTransaction = function(f) {
      if (rootEvent) {
        return afters.push(f);
      } else {
        return f();
      }
    };
    whenDoneWith = function(obs, f) {
      var obsWaiters;
      if (rootEvent) {
        obsWaiters = waiters[obs.id];
        if (obsWaiters == null) {
          obsWaiters = waiters[obs.id] = [f];
          return waiterObs.push(obs);
        } else {
          return obsWaiters.push(f);
        }
      } else {
        return f();
      }
    };
    flush = function() {
      while (waiterObs.length > 0) {
        flushWaiters(0);
      }
      return void 0;
    };
    flushWaiters = function(index) {
      var f, j, len1, obs, obsId, obsWaiters;
      obs = waiterObs[index];
      obsId = obs.id;
      obsWaiters = waiters[obsId];
      waiterObs.splice(index, 1);
      delete waiters[obsId];
      flushDepsOf(obs);
      for (j = 0, len1 = obsWaiters.length; j < len1; j++) {
        f = obsWaiters[j];
        f();
      }
      return void 0;
    };
    flushDepsOf = function(obs) {
      var dep, deps, index, j, len1;
      deps = obs.internalDeps();
      for (j = 0, len1 = deps.length; j < len1; j++) {
        dep = deps[j];
        flushDepsOf(dep);
        if (waiters[dep.id]) {
          index = _.indexOf(waiterObs, dep);
          flushWaiters(index);
        }
      }
      return void 0;
    };
    inTransaction = function(event, context, f, args) {
      var after, result;
      if (rootEvent) {
        return f.apply(context, args);
      } else {
        rootEvent = event;
        try {
          result = f.apply(context, args);
          flush();
        } finally {
          rootEvent = void 0;
          while (aftersIndex < afters.length) {
            after = afters[aftersIndex];
            aftersIndex++;
            after();
          }
          aftersIndex = 0;
          afters = [];
        }
        return result;
      }
    };
    currentEventId = function() {
      if (rootEvent) {
        return rootEvent.id;
      } else {
        return void 0;
      }
    };
    wrappedSubscribe = function(obs, sink) {
      var doUnsub, shouldUnsub, unsub, unsubd;
      unsubd = false;
      shouldUnsub = false;
      doUnsub = function() {
        return shouldUnsub = true;
      };
      unsub = function() {
        unsubd = true;
        return doUnsub();
      };
      doUnsub = obs.dispatcher.subscribe(function(event) {
        return afterTransaction(function() {
          var reply;
          if (!unsubd) {
            reply = sink(event);
            if (reply === Bacon.noMore) {
              return unsub();
            }
          }
        });
      });
      if (shouldUnsub) {
        doUnsub();
      }
      return unsub;
    };
    hasWaiters = function() {
      return waiterObs.length > 0;
    };
    return {
      whenDoneWith: whenDoneWith,
      hasWaiters: hasWaiters,
      inTransaction: inTransaction,
      currentEventId: currentEventId,
      wrappedSubscribe: wrappedSubscribe,
      afterTransaction: afterTransaction
    };
  })();

  Source = (function() {
    function Source(obs1, sync, lazy1) {
      this.obs = obs1;
      this.sync = sync;
      this.lazy = lazy1 != null ? lazy1 : false;
      this.queue = [];
    }

    Source.prototype.subscribe = function(sink) {
      return this.obs.dispatcher.subscribe(sink);
    };

    Source.prototype.toString = function() {
      return this.obs.toString();
    };

    Source.prototype.markEnded = function() {
      return this.ended = true;
    };

    Source.prototype.consume = function() {
      if (this.lazy) {
        return {
          value: _.always(this.queue[0])
        };
      } else {
        return this.queue[0];
      }
    };

    Source.prototype.push = function(x) {
      return this.queue = [x];
    };

    Source.prototype.mayHave = function() {
      return true;
    };

    Source.prototype.hasAtLeast = function() {
      return this.queue.length;
    };

    Source.prototype.flatten = true;

    return Source;

  })();

  ConsumingSource = (function(superClass) {
    extend(ConsumingSource, superClass);

    function ConsumingSource() {
      return ConsumingSource.__super__.constructor.apply(this, arguments);
    }

    ConsumingSource.prototype.consume = function() {
      return this.queue.shift();
    };

    ConsumingSource.prototype.push = function(x) {
      return this.queue.push(x);
    };

    ConsumingSource.prototype.mayHave = function(c) {
      return !this.ended || this.queue.length >= c;
    };

    ConsumingSource.prototype.hasAtLeast = function(c) {
      return this.queue.length >= c;
    };

    ConsumingSource.prototype.flatten = false;

    return ConsumingSource;

  })(Source);

  BufferingSource = (function(superClass) {
    extend(BufferingSource, superClass);

    function BufferingSource(obs) {
      BufferingSource.__super__.constructor.call(this, obs, true);
    }

    BufferingSource.prototype.consume = function() {
      var values;
      values = this.queue;
      this.queue = [];
      return {
        value: function() {
          return values;
        }
      };
    };

    BufferingSource.prototype.push = function(x) {
      return this.queue.push(x.value());
    };

    BufferingSource.prototype.hasAtLeast = function() {
      return true;
    };

    return BufferingSource;

  })(Source);

  Source.isTrigger = function(s) {
    if (s instanceof Source) {
      return s.sync;
    } else {
      return s instanceof EventStream;
    }
  };

  Source.fromObservable = function(s) {
    if (s instanceof Source) {
      return s;
    } else if (s instanceof Property) {
      return new Source(s, false);
    } else {
      return new ConsumingSource(s, true);
    }
  };

  Desc = (function() {
    function Desc(context1, method1, args1) {
      this.context = context1;
      this.method = method1;
      this.args = args1;
    }

    Desc.prototype.deps = function() {
      return this.cached || (this.cached = findDeps([this.context].concat(this.args)));
    };

    Desc.prototype.toString = function() {
      return _.toString(this.context) + "." + _.toString(this.method) + "(" + _.map(_.toString, this.args) + ")";
    };

    return Desc;

  })();

  describe = function() {
    var args, context, method;
    context = arguments[0], method = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    if ((context || method) instanceof Desc) {
      return context || method;
    } else {
      return new Desc(context, method, args);
    }
  };

  withDesc = function(desc, obs) {
    obs.desc = desc;
    return obs;
  };

  findDeps = function(x) {
    if (isArray(x)) {
      return _.flatMap(findDeps, x);
    } else if (isObservable(x)) {
      return [x];
    } else if (x instanceof Source) {
      return [x.obs];
    } else {
      return [];
    }
  };

  Bacon.Desc = Desc;

  Bacon.Desc.empty = new Bacon.Desc("", "", []);

  withMethodCallSupport = function(wrapped) {
    return function() {
      var args, context, f, methodName;
      f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (typeof f === "object" && args.length) {
        context = f;
        methodName = args[0];
        f = function() {
          return context[methodName].apply(context, arguments);
        };
        args = args.slice(1);
      }
      return wrapped.apply(null, [f].concat(slice.call(args)));
    };
  };

  makeFunctionArgs = function(args) {
    args = Array.prototype.slice.call(args);
    return makeFunction_.apply(null, args);
  };

  partiallyApplied = function(f, applied) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return f.apply(null, applied.concat(args));
    };
  };

  toSimpleExtractor = function(args) {
    return function(key) {
      return function(value) {
        var fieldValue;
        if (value == null) {
          return void 0;
        } else {
          fieldValue = value[key];
          if (_.isFunction(fieldValue)) {
            return fieldValue.apply(value, args);
          } else {
            return fieldValue;
          }
        }
      };
    };
  };

  toFieldExtractor = function(f, args) {
    var partFuncs, parts;
    parts = f.slice(1).split(".");
    partFuncs = _.map(toSimpleExtractor(args), parts);
    return function(value) {
      var j, len1;
      for (j = 0, len1 = partFuncs.length; j < len1; j++) {
        f = partFuncs[j];
        value = f(value);
      }
      return value;
    };
  };

  isFieldKey = function(f) {
    return (typeof f === "string") && f.length > 1 && f.charAt(0) === ".";
  };

  makeFunction_ = withMethodCallSupport(function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (_.isFunction(f)) {
      if (args.length) {
        return partiallyApplied(f, args);
      } else {
        return f;
      }
    } else if (isFieldKey(f)) {
      return toFieldExtractor(f, args);
    } else {
      return _.always(f);
    }
  });

  makeFunction = function(f, args) {
    return makeFunction_.apply(null, [f].concat(slice.call(args)));
  };

  convertArgsToFunction = function(obs, f, args, method) {
    var sampled;
    if (f instanceof Property) {
      sampled = f.sampledBy(obs, function(p, s) {
        return [p, s];
      });
      return method.call(sampled, function(arg) {
        var p, s;
        p = arg[0], s = arg[1];
        return p;
      }).map(function(arg) {
        var p, s;
        p = arg[0], s = arg[1];
        return s;
      });
    } else {
      f = makeFunction(f, args);
      return method.call(obs, f);
    }
  };

  toCombinator = function(f) {
    var key;
    if (_.isFunction(f)) {
      return f;
    } else if (isFieldKey(f)) {
      key = toFieldKey(f);
      return function(left, right) {
        return left[key](right);
      };
    } else {
      throw new Exception("not a function or a field key: " + f);
    }
  };

  toFieldKey = function(f) {
    return f.slice(1);
  };

  Some = (function() {
    function Some(value1) {
      this.value = value1;
    }

    Some.prototype.getOrElse = function() {
      return this.value;
    };

    Some.prototype.get = function() {
      return this.value;
    };

    Some.prototype.filter = function(f) {
      if (f(this.value)) {
        return new Some(this.value);
      } else {
        return None;
      }
    };

    Some.prototype.map = function(f) {
      return new Some(f(this.value));
    };

    Some.prototype.forEach = function(f) {
      return f(this.value);
    };

    Some.prototype.isDefined = true;

    Some.prototype.toArray = function() {
      return [this.value];
    };

    Some.prototype.inspect = function() {
      return "Some(" + this.value + ")";
    };

    Some.prototype.toString = function() {
      return this.inspect();
    };

    return Some;

  })();

  None = {
    getOrElse: function(value) {
      return value;
    },
    filter: function() {
      return None;
    },
    map: function() {
      return None;
    },
    forEach: function() {},
    isDefined: false,
    toArray: function() {
      return [];
    },
    inspect: function() {
      return "None";
    },
    toString: function() {
      return this.inspect();
    }
  };

  toOption = function(v) {
    if (v instanceof Some || v === None) {
      return v;
    } else {
      return new Some(v);
    }
  };

  Bacon.noMore = ["<no-more>"];

  Bacon.more = ["<more>"];

  eventIdCounter = 0;

  Event = (function() {
    function Event() {
      this.id = ++eventIdCounter;
    }

    Event.prototype.isEvent = function() {
      return true;
    };

    Event.prototype.isEnd = function() {
      return false;
    };

    Event.prototype.isInitial = function() {
      return false;
    };

    Event.prototype.isNext = function() {
      return false;
    };

    Event.prototype.isError = function() {
      return false;
    };

    Event.prototype.hasValue = function() {
      return false;
    };

    Event.prototype.filter = function() {
      return true;
    };

    Event.prototype.inspect = function() {
      return this.toString();
    };

    Event.prototype.log = function() {
      return this.toString();
    };

    return Event;

  })();

  Next = (function(superClass) {
    extend(Next, superClass);

    function Next(valueF, eager) {
      Next.__super__.constructor.call(this);
      if (!eager && _.isFunction(valueF) || valueF instanceof Next) {
        this.valueF = valueF;
        this.valueInternal = void 0;
      } else {
        this.valueF = void 0;
        this.valueInternal = valueF;
      }
    }

    Next.prototype.isNext = function() {
      return true;
    };

    Next.prototype.hasValue = function() {
      return true;
    };

    Next.prototype.value = function() {
      if (this.valueF instanceof Next) {
        this.valueInternal = this.valueF.value();
        this.valueF = void 0;
      } else if (this.valueF) {
        this.valueInternal = this.valueF();
        this.valueF = void 0;
      }
      return this.valueInternal;
    };

    Next.prototype.fmap = function(f) {
      var event, value;
      if (this.valueInternal) {
        value = this.valueInternal;
        return this.apply(function() {
          return f(value);
        });
      } else {
        event = this;
        return this.apply(function() {
          return f(event.value());
        });
      }
    };

    Next.prototype.apply = function(value) {
      return new Next(value);
    };

    Next.prototype.filter = function(f) {
      return f(this.value());
    };

    Next.prototype.toString = function() {
      return _.toString(this.value());
    };

    Next.prototype.log = function() {
      return this.value();
    };

    return Next;

  })(Event);

  Initial = (function(superClass) {
    extend(Initial, superClass);

    function Initial() {
      return Initial.__super__.constructor.apply(this, arguments);
    }

    Initial.prototype.isInitial = function() {
      return true;
    };

    Initial.prototype.isNext = function() {
      return false;
    };

    Initial.prototype.apply = function(value) {
      return new Initial(value);
    };

    Initial.prototype.toNext = function() {
      return new Next(this);
    };

    return Initial;

  })(Next);

  End = (function(superClass) {
    extend(End, superClass);

    function End() {
      return End.__super__.constructor.apply(this, arguments);
    }

    End.prototype.isEnd = function() {
      return true;
    };

    End.prototype.fmap = function() {
      return this;
    };

    End.prototype.apply = function() {
      return this;
    };

    End.prototype.toString = function() {
      return "<end>";
    };

    return End;

  })(Event);

  Error = (function(superClass) {
    extend(Error, superClass);

    function Error(error1) {
      this.error = error1;
    }

    Error.prototype.isError = function() {
      return true;
    };

    Error.prototype.fmap = function() {
      return this;
    };

    Error.prototype.apply = function() {
      return this;
    };

    Error.prototype.toString = function() {
      return "<error> " + _.toString(this.error);
    };

    return Error;

  })(Event);

  Bacon.Event = Event;

  Bacon.Initial = Initial;

  Bacon.Next = Next;

  Bacon.End = End;

  Bacon.Error = Error;

  initialEvent = function(value) {
    return new Initial(value, true);
  };

  nextEvent = function(value) {
    return new Next(value, true);
  };

  endEvent = function() {
    return new End();
  };

  toEvent = function(x) {
    if (x instanceof Event) {
      return x;
    } else {
      return nextEvent(x);
    }
  };

  idCounter = 0;

  registerObs = function() {};

  Observable = (function() {
    function Observable(desc1) {
      this.desc = desc1;
      this.id = ++idCounter;
      this.initialDesc = this.desc;
    }

    Observable.prototype.subscribe = function(sink) {
      return UpdateBarrier.wrappedSubscribe(this, sink);
    };

    Observable.prototype.subscribeInternal = function(sink) {
      return this.dispatcher.subscribe(sink);
    };

    Observable.prototype.onValue = function() {
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event) {
        if (event.hasValue()) {
          return f(event.value());
        }
      });
    };

    Observable.prototype.onValues = function(f) {
      return this.onValue(function(args) {
        return f.apply(null, args);
      });
    };

    Observable.prototype.onError = function() {
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event) {
        if (event.isError()) {
          return f(event.error);
        }
      });
    };

    Observable.prototype.onEnd = function() {
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event) {
        if (event.isEnd()) {
          return f();
        }
      });
    };

    Observable.prototype.name = function(name) {
      this._name = name;
      return this;
    };

    Observable.prototype.withDescription = function() {
      this.desc = describe.apply(null, arguments);
      return this;
    };

    Observable.prototype.toString = function() {
      if (this._name) {
        return this._name;
      } else {
        return this.desc.toString();
      }
    };

    Observable.prototype.internalDeps = function() {
      return this.initialDesc.deps();
    };

    return Observable;

  })();

  Observable.prototype.assign = Observable.prototype.onValue;

  Observable.prototype.forEach = Observable.prototype.onValue;

  Observable.prototype.inspect = Observable.prototype.toString;

  Bacon.Observable = Observable;

  CompositeUnsubscribe = (function() {
    function CompositeUnsubscribe(ss) {
      var j, len1, s;
      if (ss == null) {
        ss = [];
      }
      this.unsubscribe = bind(this.unsubscribe, this);
      this.unsubscribed = false;
      this.subscriptions = [];
      this.starting = [];
      for (j = 0, len1 = ss.length; j < len1; j++) {
        s = ss[j];
        this.add(s);
      }
    }

    CompositeUnsubscribe.prototype.add = function(subscription) {
      var ended, unsub, unsubMe;
      if (this.unsubscribed) {
        return;
      }
      ended = false;
      unsub = nop;
      this.starting.push(subscription);
      unsubMe = (function(_this) {
        return function() {
          if (_this.unsubscribed) {
            return;
          }
          ended = true;
          _this.remove(unsub);
          return _.remove(subscription, _this.starting);
        };
      })(this);
      unsub = subscription(this.unsubscribe, unsubMe);
      if (!(this.unsubscribed || ended)) {
        this.subscriptions.push(unsub);
      } else {
        unsub();
      }
      _.remove(subscription, this.starting);
      return unsub;
    };

    CompositeUnsubscribe.prototype.remove = function(unsub) {
      if (this.unsubscribed) {
        return;
      }
      if ((_.remove(unsub, this.subscriptions)) !== void 0) {
        return unsub();
      }
    };

    CompositeUnsubscribe.prototype.unsubscribe = function() {
      var j, len1, ref, s;
      if (this.unsubscribed) {
        return;
      }
      this.unsubscribed = true;
      ref = this.subscriptions;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        s = ref[j];
        s();
      }
      this.subscriptions = [];
      return this.starting = [];
    };

    CompositeUnsubscribe.prototype.count = function() {
      if (this.unsubscribed) {
        return 0;
      }
      return this.subscriptions.length + this.starting.length;
    };

    CompositeUnsubscribe.prototype.empty = function() {
      return this.count() === 0;
    };

    return CompositeUnsubscribe;

  })();

  Bacon.CompositeUnsubscribe = CompositeUnsubscribe;

  Dispatcher = (function() {
    Dispatcher.prototype.pushing = false;

    Dispatcher.prototype.ended = false;

    Dispatcher.prototype.prevError = void 0;

    Dispatcher.prototype.unsubSrc = void 0;

    function Dispatcher(_subscribe, _handleEvent) {
      this._subscribe = _subscribe;
      this._handleEvent = _handleEvent;
      this.subscribe = bind(this.subscribe, this);
      this.handleEvent = bind(this.handleEvent, this);
      this.subscriptions = [];
      this.queue = [];
    }

    Dispatcher.prototype.hasSubscribers = function() {
      return this.subscriptions.length > 0;
    };

    Dispatcher.prototype.removeSub = function(subscription) {
      return this.subscriptions = _.without(subscription, this.subscriptions);
    };

    Dispatcher.prototype.push = function(event) {
      if (event.isEnd()) {
        this.ended = true;
      }
      return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
    };

    Dispatcher.prototype.pushToSubscriptions = function(event) {
      var e, j, len1, reply, sub, tmp;
      try {
        tmp = this.subscriptions;
        for (j = 0, len1 = tmp.length; j < len1; j++) {
          sub = tmp[j];
          reply = sub.sink(event);
          if (reply === Bacon.noMore || event.isEnd()) {
            this.removeSub(sub);
          }
        }
        return true;
      } catch (_error) {
        e = _error;
        this.pushing = false;
        this.queue = [];
        throw e;
      }
    };

    Dispatcher.prototype.pushIt = function(event) {
      if (!this.pushing) {
        if (event === this.prevError) {
          return;
        }
        if (event.isError()) {
          this.prevError = event;
        }
        this.pushing = true;
        this.pushToSubscriptions(event);
        this.pushing = false;
        while (this.queue.length) {
          event = this.queue.shift();
          this.push(event);
        }
        if (this.hasSubscribers()) {
          return Bacon.more;
        } else {
          this.unsubscribeFromSource();
          return Bacon.noMore;
        }
      } else {
        this.queue.push(event);
        return Bacon.more;
      }
    };

    Dispatcher.prototype.handleEvent = function(event) {
      if (this._handleEvent) {
        return this._handleEvent(event);
      } else {
        return this.push(event);
      }
    };

    Dispatcher.prototype.unsubscribeFromSource = function() {
      if (this.unsubSrc) {
        this.unsubSrc();
      }
      return this.unsubSrc = void 0;
    };

    Dispatcher.prototype.subscribe = function(sink) {
      var subscription;
      if (this.ended) {
        sink(endEvent());
        return nop;
      } else {
        assertFunction(sink);
        subscription = {
          sink: sink
        };
        this.subscriptions.push(subscription);
        if (this.subscriptions.length === 1) {
          this.unsubSrc = this._subscribe(this.handleEvent);
          assertFunction(this.unsubSrc);
        }
        return (function(_this) {
          return function() {
            _this.removeSub(subscription);
            if (!_this.hasSubscribers()) {
              return _this.unsubscribeFromSource();
            }
          };
        })(this);
      }
    };

    return Dispatcher;

  })();

  Bacon.Dispatcher = Dispatcher;

  EventStream = (function(superClass) {
    extend(EventStream, superClass);

    function EventStream(desc, subscribe, handler) {
      if (_.isFunction(desc)) {
        handler = subscribe;
        subscribe = desc;
        desc = Desc.empty;
      }
      EventStream.__super__.constructor.call(this, desc);
      assertFunction(subscribe);
      this.dispatcher = new Dispatcher(subscribe, handler);
      registerObs(this);
    }

    EventStream.prototype.toProperty = function(initValue_) {
      var disp, initValue;
      initValue = arguments.length === 0 ? None : toOption(function() {
        return initValue_;
      });
      disp = this.dispatcher;
      return new Property(new Bacon.Desc(this, "toProperty", [initValue_]), function(sink) {
        var initSent, reply, sendInit, unsub;
        initSent = false;
        unsub = nop;
        reply = Bacon.more;
        sendInit = function() {
          if (!initSent) {
            return initValue.forEach(function(value) {
              initSent = true;
              reply = sink(new Initial(value));
              if (reply === Bacon.noMore) {
                unsub();
                return unsub = nop;
              }
            });
          }
        };
        unsub = disp.subscribe(function(event) {
          if (event.hasValue()) {
            if (initSent && event.isInitial()) {
              return Bacon.more;
            } else {
              if (!event.isInitial()) {
                sendInit();
              }
              initSent = true;
              initValue = new Some(event);
              return sink(event);
            }
          } else {
            if (event.isEnd()) {
              reply = sendInit();
            }
            if (reply !== Bacon.noMore) {
              return sink(event);
            }
          }
        });
        sendInit();
        return unsub;
      });
    };

    EventStream.prototype.toEventStream = function() {
      return this;
    };

    EventStream.prototype.withHandler = function(handler) {
      return new EventStream(new Bacon.Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
    };

    return EventStream;

  })(Observable);

  Bacon.EventStream = EventStream;

  Bacon.never = function() {
    return new EventStream(describe(Bacon, "never"), function(sink) {
      sink(endEvent());
      return nop;
    });
  };

  Bacon.when = function() {
    var f, i, index, ix, j, k, len, len1, len2, needsBarrier, pat, patSources, pats, patterns, ref, resultStream, s, sources, triggerFound, usage;
    if (arguments.length === 0) {
      return Bacon.never();
    }
    len = arguments.length;
    usage = "when: expecting arguments in the form (Observable+,function)+";
    assert(usage, len % 2 === 0);
    sources = [];
    pats = [];
    i = 0;
    patterns = [];
    while (i < len) {
      patterns[i] = arguments[i];
      patterns[i + 1] = arguments[i + 1];
      patSources = _.toArray(arguments[i]);
      f = constantToFunction(arguments[i + 1]);
      pat = {
        f: f,
        ixs: []
      };
      triggerFound = false;
      for (j = 0, len1 = patSources.length; j < len1; j++) {
        s = patSources[j];
        index = _.indexOf(sources, s);
        if (!triggerFound) {
          triggerFound = Source.isTrigger(s);
        }
        if (index < 0) {
          sources.push(s);
          index = sources.length - 1;
        }
        ref = pat.ixs;
        for (k = 0, len2 = ref.length; k < len2; k++) {
          ix = ref[k];
          if (ix.index === index) {
            ix.count++;
          }
        }
        pat.ixs.push({
          index: index,
          count: 1
        });
      }
      assert("At least one EventStream required", triggerFound || (!patSources.length));
      if (patSources.length > 0) {
        pats.push(pat);
      }
      i = i + 2;
    }
    if (!sources.length) {
      return Bacon.never();
    }
    sources = _.map(Source.fromObservable, sources);
    needsBarrier = (_.any(sources, function(s) {
      return s.flatten;
    })) && (containsDuplicateDeps(_.map((function(s) {
      return s.obs;
    }), sources)));
    return resultStream = new EventStream(new Bacon.Desc(Bacon, "when", patterns), function(sink) {
      var cannotMatch, cannotSync, ends, match, nonFlattened, part, triggers;
      triggers = [];
      ends = false;
      match = function(p) {
        var l, len3, ref1;
        ref1 = p.ixs;
        for (l = 0, len3 = ref1.length; l < len3; l++) {
          i = ref1[l];
          if (!sources[i.index].hasAtLeast(i.count)) {
            return false;
          }
        }
        return true;
      };
      cannotSync = function(source) {
        return !source.sync || source.ended;
      };
      cannotMatch = function(p) {
        var l, len3, ref1;
        ref1 = p.ixs;
        for (l = 0, len3 = ref1.length; l < len3; l++) {
          i = ref1[l];
          if (!sources[i.index].mayHave(i.count)) {
            return true;
          }
        }
      };
      nonFlattened = function(trigger) {
        return !trigger.source.flatten;
      };
      part = function(source) {
        return function(unsubAll) {
          var flush, flushLater, flushWhileTriggers;
          flushLater = function() {
            return UpdateBarrier.whenDoneWith(resultStream, flush);
          };
          flushWhileTriggers = function() {
            var events, l, len3, p, reply, trigger;
            if (triggers.length > 0) {
              reply = Bacon.more;
              trigger = triggers.pop();
              for (l = 0, len3 = pats.length; l < len3; l++) {
                p = pats[l];
                if (match(p)) {
                  events = (function() {
                    var len4, m, ref1, results;
                    ref1 = p.ixs;
                    results = [];
                    for (m = 0, len4 = ref1.length; m < len4; m++) {
                      i = ref1[m];
                      results.push(sources[i.index].consume());
                    }
                    return results;
                  })();
                  reply = sink(trigger.e.apply(function() {
                    var event, values;
                    values = (function() {
                      var len4, m, results;
                      results = [];
                      for (m = 0, len4 = events.length; m < len4; m++) {
                        event = events[m];
                        results.push(event.value());
                      }
                      return results;
                    })();
                    return p.f.apply(p, values);
                  }));
                  if (triggers.length) {
                    triggers = _.filter(nonFlattened, triggers);
                  }
                  if (reply === Bacon.noMore) {
                    return reply;
                  } else {
                    return flushWhileTriggers();
                  }
                }
              }
            } else {
              return Bacon.more;
            }
          };
          flush = function() {
            var reply;
            reply = flushWhileTriggers();
            if (ends) {
              ends = false;
              if (_.all(sources, cannotSync) || _.all(pats, cannotMatch)) {
                reply = Bacon.noMore;
                sink(endEvent());
              }
            }
            if (reply === Bacon.noMore) {
              unsubAll();
            }
            return reply;
          };
          return source.subscribe(function(e) {
            var reply;
            if (e.isEnd()) {
              ends = true;
              source.markEnded();
              flushLater();
            } else if (e.isError()) {
              reply = sink(e);
            } else {
              source.push(e);
              if (source.sync) {
                triggers.push({
                  source: source,
                  e: e
                });
                if (needsBarrier || UpdateBarrier.hasWaiters()) {
                  flushLater();
                } else {
                  flush();
                }
              }
            }
            if (reply === Bacon.noMore) {
              unsubAll();
            }
            return reply || Bacon.more;
          });
        };
      };
      return new Bacon.CompositeUnsubscribe((function() {
        var l, len3, results;
        results = [];
        for (l = 0, len3 = sources.length; l < len3; l++) {
          s = sources[l];
          results.push(part(s));
        }
        return results;
      })()).unsubscribe;
    });
  };

  containsDuplicateDeps = function(observables, state) {
    var checkObservable;
    if (state == null) {
      state = [];
    }
    checkObservable = function(obs) {
      var deps;
      if (_.contains(state, obs)) {
        return true;
      } else {
        deps = obs.internalDeps();
        if (deps.length) {
          state.push(obs);
          return _.any(deps, checkObservable);
        } else {
          state.push(obs);
          return false;
        }
      }
    };
    return _.any(observables, checkObservable);
  };

  constantToFunction = function(f) {
    if (_.isFunction(f)) {
      return f;
    } else {
      return _.always(f);
    }
  };

  Bacon.groupSimultaneous = function() {
    var s, sources, streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (streams.length === 1 && isArray(streams[0])) {
      streams = streams[0];
    }
    sources = (function() {
      var j, len1, results;
      results = [];
      for (j = 0, len1 = streams.length; j < len1; j++) {
        s = streams[j];
        results.push(new BufferingSource(s));
      }
      return results;
    })();
    return withDesc(new Bacon.Desc(Bacon, "groupSimultaneous", streams), Bacon.when(sources, (function() {
      var xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return xs;
    })));
  };

  PropertyDispatcher = (function(superClass) {
    extend(PropertyDispatcher, superClass);

    function PropertyDispatcher(property1, subscribe, handleEvent) {
      this.property = property1;
      this.subscribe = bind(this.subscribe, this);
      PropertyDispatcher.__super__.constructor.call(this, subscribe, handleEvent);
      this.current = None;
      this.currentValueRootId = void 0;
      this.propertyEnded = false;
    }

    PropertyDispatcher.prototype.push = function(event) {
      if (event.isEnd()) {
        this.propertyEnded = true;
      }
      if (event.hasValue()) {
        this.current = new Some(event);
        this.currentValueRootId = UpdateBarrier.currentEventId();
      }
      return PropertyDispatcher.__super__.push.call(this, event);
    };

    PropertyDispatcher.prototype.maybeSubSource = function(sink, reply) {
      if (reply === Bacon.noMore) {
        return nop;
      } else if (this.propertyEnded) {
        sink(endEvent());
        return nop;
      } else {
        return Dispatcher.prototype.subscribe.call(this, sink);
      }
    };

    PropertyDispatcher.prototype.subscribe = function(sink) {
      var dispatchingId, initSent, reply, valId;
      initSent = false;
      reply = Bacon.more;
      if (this.current.isDefined && (this.hasSubscribers() || this.propertyEnded)) {
        dispatchingId = UpdateBarrier.currentEventId();
        valId = this.currentValueRootId;
        if (!this.propertyEnded && valId && dispatchingId && dispatchingId !== valId) {
          UpdateBarrier.whenDoneWith(this.property, (function(_this) {
            return function() {
              if (_this.currentValueRootId === valId) {
                return sink(initialEvent(_this.current.get().value()));
              }
            };
          })(this));
          return this.maybeSubSource(sink, reply);
        } else {
          UpdateBarrier.inTransaction(void 0, this, (function() {
            return reply = sink(initialEvent(this.current.get().value()));
          }), []);
          return this.maybeSubSource(sink, reply);
        }
      } else {
        return this.maybeSubSource(sink, reply);
      }
    };

    return PropertyDispatcher;

  })(Dispatcher);

  Property = (function(superClass) {
    extend(Property, superClass);

    function Property(desc, subscribe, handler) {
      Property.__super__.constructor.call(this, desc);
      assertFunction(subscribe);
      this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
      registerObs(this);
    }

    Property.prototype.changes = function() {
      return new EventStream(new Bacon.Desc(this, "changes", []), (function(_this) {
        return function(sink) {
          return _this.dispatcher.subscribe(function(event) {
            if (!event.isInitial()) {
              return sink(event);
            }
          });
        };
      })(this));
    };

    Property.prototype.withHandler = function(handler) {
      return new Property(new Bacon.Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
    };

    Property.prototype.toProperty = function() {
      assertNoArguments(arguments);
      return this;
    };

    Property.prototype.toEventStream = function() {
      return new EventStream(new Bacon.Desc(this, "toEventStream", []), (function(_this) {
        return function(sink) {
          return _this.dispatcher.subscribe(function(event) {
            if (event.isInitial()) {
              event = event.toNext();
            }
            return sink(event);
          });
        };
      })(this));
    };

    return Property;

  })(Observable);

  Bacon.Property = Property;

  Bacon.constant = function(value) {
    return new Property(new Bacon.Desc(Bacon, "constant", [value]), function(sink) {
      sink(initialEvent(value));
      sink(endEvent());
      return nop;
    });
  };

  Bacon.fromBinder = function(binder, eventTransformer) {
    if (eventTransformer == null) {
      eventTransformer = _.id;
    }
    return new EventStream(new Bacon.Desc(Bacon, "fromBinder", [binder, eventTransformer]), function(sink) {
      var shouldUnbind, unbind, unbinder, unbound;
      unbound = false;
      shouldUnbind = false;
      unbind = function() {
        if (!unbound) {
          if (typeof unbinder !== "undefined" && unbinder !== null) {
            unbinder();
            return unbound = true;
          } else {
            return shouldUnbind = true;
          }
        }
      };
      unbinder = binder(function() {
        var args, event, j, len1, reply, value;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        value = eventTransformer.apply(this, args);
        if (!(isArray(value) && _.last(value) instanceof Event)) {
          value = [value];
        }
        reply = Bacon.more;
        for (j = 0, len1 = value.length; j < len1; j++) {
          event = value[j];
          reply = sink(event = toEvent(event));
          if (reply === Bacon.noMore || event.isEnd()) {
            unbind();
            return reply;
          }
        }
        return reply;
      });
      if (shouldUnbind) {
        unbind();
      }
      return unbind;
    });
  };

  eventMethods = [["addEventListener", "removeEventListener"], ["addListener", "removeListener"], ["on", "off"], ["bind", "unbind"]];

  findHandlerMethods = function(target) {
    var j, len1, methodPair, pair;
    for (j = 0, len1 = eventMethods.length; j < len1; j++) {
      pair = eventMethods[j];
      methodPair = [target[pair[0]], target[pair[1]]];
      if (methodPair[0] && methodPair[1]) {
        return methodPair;
      }
    }
    throw new Error("No suitable event methods in " + target);
  };

  Bacon.fromEventTarget = function(target, eventName, eventTransformer) {
    var ref, sub, unsub;
    ref = findHandlerMethods(target), sub = ref[0], unsub = ref[1];
    return withDesc(new Bacon.Desc(Bacon, "fromEvent", [target, eventName]), Bacon.fromBinder(function(handler) {
      sub.call(target, eventName, handler);
      return function() {
        return unsub.call(target, eventName, handler);
      };
    }, eventTransformer));
  };

  Bacon.fromEvent = Bacon.fromEventTarget;

  Bacon.Observable.prototype.map = function() {
    var args, p;
    p = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return convertArgsToFunction(this, p, args, function(f) {
      return withDesc(new Bacon.Desc(this, "map", [f]), this.withHandler(function(event) {
        return this.push(event.fmap(f));
      }));
    });
  };

  Bacon.combineAsArray = function() {
    var index, j, len1, s, sources, stream, streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (streams.length === 1 && isArray(streams[0])) {
      streams = streams[0];
    }
    for (index = j = 0, len1 = streams.length; j < len1; index = ++j) {
      stream = streams[index];
      if (!(isObservable(stream))) {
        streams[index] = Bacon.constant(stream);
      }
    }
    if (streams.length) {
      sources = (function() {
        var k, len2, results;
        results = [];
        for (k = 0, len2 = streams.length; k < len2; k++) {
          s = streams[k];
          results.push(new Source(s, true));
        }
        return results;
      })();
      return withDesc(new Bacon.Desc(Bacon, "combineAsArray", streams), Bacon.when(sources, (function() {
        var xs;
        xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return xs;
      })).toProperty());
    } else {
      return Bacon.constant([]);
    }
  };

  Bacon.onValues = function() {
    var f, j, streams;
    streams = 2 <= arguments.length ? slice.call(arguments, 0, j = arguments.length - 1) : (j = 0, []), f = arguments[j++];
    return Bacon.combineAsArray(streams).onValues(f);
  };

  Bacon.combineWith = function() {
    var f, streams;
    f = arguments[0], streams = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return withDesc(new Bacon.Desc(Bacon, "combineWith", [f].concat(slice.call(streams))), Bacon.combineAsArray(streams).map(function(values) {
      return f.apply(null, values);
    }));
  };

  Bacon.combineTemplate = function(template) {
    var applyStreamValue, combinator, compile, compileTemplate, constantValue, current, funcs, mkContext, setValue, streams;
    funcs = [];
    streams = [];
    current = function(ctxStack) {
      return ctxStack[ctxStack.length - 1];
    };
    setValue = function(ctxStack, key, value) {
      return current(ctxStack)[key] = value;
    };
    applyStreamValue = function(key, index) {
      return function(ctxStack, values) {
        return setValue(ctxStack, key, values[index]);
      };
    };
    constantValue = function(key, value) {
      return function(ctxStack) {
        return setValue(ctxStack, key, value);
      };
    };
    mkContext = function(template) {
      if (isArray(template)) {
        return [];
      } else {
        return {};
      }
    };
    compile = function(key, value) {
      var popContext, pushContext;
      if (isObservable(value)) {
        streams.push(value);
        return funcs.push(applyStreamValue(key, streams.length - 1));
      } else if (value === Object(value) && typeof value !== "function" && !(value instanceof RegExp) && !(value instanceof Date)) {
        pushContext = function(key) {
          return function(ctxStack) {
            var newContext;
            newContext = mkContext(value);
            setValue(ctxStack, key, newContext);
            return ctxStack.push(newContext);
          };
        };
        popContext = function(ctxStack) {
          return ctxStack.pop();
        };
        funcs.push(pushContext(key));
        compileTemplate(value);
        return funcs.push(popContext);
      } else {
        return funcs.push(constantValue(key, value));
      }
    };
    compileTemplate = function(template) {
      return _.each(template, compile);
    };
    compileTemplate(template);
    combinator = function(values) {
      var ctxStack, f, j, len1, rootContext;
      rootContext = mkContext(template);
      ctxStack = [rootContext];
      for (j = 0, len1 = funcs.length; j < len1; j++) {
        f = funcs[j];
        f(ctxStack, values);
      }
      return rootContext;
    };
    return withDesc(new Bacon.Desc(Bacon, "combineTemplate", [template]), Bacon.combineAsArray(streams).map(combinator));
  };

  Bacon.Observable.prototype.combine = function(other, f) {
    var combinator;
    combinator = toCombinator(f);
    return withDesc(new Bacon.Desc(this, "combine", [other, f]), Bacon.combineAsArray(this, other).map(function(values) {
      return combinator(values[0], values[1]);
    }));
  };

  Bacon.Observable.prototype.decode = function(cases) {
    return withDesc(new Bacon.Desc(this, "decode", [cases]), this.combine(Bacon.combineTemplate(cases), function(key, values) {
      return values[key];
    }));
  };

  Bacon.Observable.prototype.withStateMachine = function(initState, f) {
    var state;
    state = initState;
    return withDesc(new Bacon.Desc(this, "withStateMachine", [initState, f]), this.withHandler(function(event) {
      var fromF, j, len1, newState, output, outputs, reply;
      fromF = f(state, event);
      newState = fromF[0], outputs = fromF[1];
      state = newState;
      reply = Bacon.more;
      for (j = 0, len1 = outputs.length; j < len1; j++) {
        output = outputs[j];
        reply = this.push(output);
        if (reply === Bacon.noMore) {
          return reply;
        }
      }
      return reply;
    }));
  };

  Bacon.Observable.prototype.skipDuplicates = function(isEqual) {
    if (isEqual == null) {
      isEqual = function(a, b) {
        return a === b;
      };
    }
    return withDesc(new Bacon.Desc(this, "skipDuplicates", []), this.withStateMachine(None, function(prev, event) {
      if (!event.hasValue()) {
        return [prev, [event]];
      } else if (event.isInitial() || prev === None || !isEqual(prev.get(), event.value())) {
        return [new Some(event.value()), [event]];
      } else {
        return [prev, []];
      }
    }));
  };

  Bacon.Observable.prototype.awaiting = function(other) {
    return withDesc(new Bacon.Desc(this, "awaiting", [other]), Bacon.groupSimultaneous(this, other).map(function(arg) {
      var myValues, otherValues;
      myValues = arg[0], otherValues = arg[1];
      return otherValues.length === 0;
    }).toProperty(false).skipDuplicates());
  };

  Bacon.Observable.prototype.not = function() {
    return withDesc(new Bacon.Desc(this, "not", []), this.map(function(x) {
      return !x;
    }));
  };

  Bacon.Property.prototype.and = function(other) {
    return withDesc(new Bacon.Desc(this, "and", [other]), this.combine(other, function(x, y) {
      return x && y;
    }));
  };

  Bacon.Property.prototype.or = function(other) {
    return withDesc(new Bacon.Desc(this, "or", [other]), this.combine(other, function(x, y) {
      return x || y;
    }));
  };

  Bacon.scheduler = {
    setTimeout: function(f, d) {
      return setTimeout(f, d);
    },
    setInterval: function(f, i) {
      return setInterval(f, i);
    },
    clearInterval: function(id) {
      return clearInterval(id);
    },
    clearTimeout: function(id) {
      return clearTimeout(id);
    },
    now: function() {
      return new Date().getTime();
    }
  };

  Bacon.EventStream.prototype.bufferWithTime = function(delay) {
    return withDesc(new Bacon.Desc(this, "bufferWithTime", [delay]), this.bufferWithTimeOrCount(delay, Number.MAX_VALUE));
  };

  Bacon.EventStream.prototype.bufferWithCount = function(count) {
    return withDesc(new Bacon.Desc(this, "bufferWithCount", [count]), this.bufferWithTimeOrCount(void 0, count));
  };

  Bacon.EventStream.prototype.bufferWithTimeOrCount = function(delay, count) {
    var flushOrSchedule;
    flushOrSchedule = function(buffer) {
      if (buffer.values.length === count) {
        return buffer.flush();
      } else if (delay !== void 0) {
        return buffer.schedule();
      }
    };
    return withDesc(new Bacon.Desc(this, "bufferWithTimeOrCount", [delay, count]), this.buffer(delay, flushOrSchedule, flushOrSchedule));
  };

  Bacon.EventStream.prototype.buffer = function(delay, onInput, onFlush) {
    var buffer, delayMs, reply;
    if (onInput == null) {
      onInput = nop;
    }
    if (onFlush == null) {
      onFlush = nop;
    }
    buffer = {
      scheduled: null,
      end: void 0,
      values: [],
      flush: function() {
        var reply;
        if (this.scheduled) {
          Bacon.scheduler.clearTimeout(this.scheduled);
          this.scheduled = null;
        }
        if (this.values.length > 0) {
          reply = this.push(nextEvent(this.values));
          this.values = [];
          if (this.end != null) {
            return this.push(this.end);
          } else if (reply !== Bacon.noMore) {
            return onFlush(this);
          }
        } else {
          if (this.end != null) {
            return this.push(this.end);
          }
        }
      },
      schedule: function() {
        if (!this.scheduled) {
          return this.scheduled = delay((function(_this) {
            return function() {
              return _this.flush();
            };
          })(this));
        }
      }
    };
    reply = Bacon.more;
    if (!_.isFunction(delay)) {
      delayMs = delay;
      delay = function(f) {
        return Bacon.scheduler.setTimeout(f, delayMs);
      };
    }
    return withDesc(new Bacon.Desc(this, "buffer", []), this.withHandler(function(event) {
      buffer.push = (function(_this) {
        return function(event) {
          return _this.push(event);
        };
      })(this);
      if (event.isError()) {
        reply = this.push(event);
      } else if (event.isEnd()) {
        buffer.end = event;
        if (!buffer.scheduled) {
          buffer.flush();
        }
      } else {
        buffer.values.push(event.value());
        onInput(buffer);
      }
      return reply;
    }));
  };

  Bacon.Observable.prototype.filter = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    assertObservableIsProperty(f);
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "filter", [f]), this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          return Bacon.more;
        }
      }));
    });
  };

  Bacon.once = function(value) {
    return new EventStream(new Desc(Bacon, "once", [value]), function(sink) {
      sink(toEvent(value));
      sink(endEvent());
      return nop;
    });
  };

  Bacon.EventStream.prototype.concat = function(right) {
    var left;
    left = this;
    return new EventStream(new Bacon.Desc(left, "concat", [right]), function(sink) {
      var unsubLeft, unsubRight;
      unsubRight = nop;
      unsubLeft = left.dispatcher.subscribe(function(e) {
        if (e.isEnd()) {
          return unsubRight = right.dispatcher.subscribe(sink);
        } else {
          return sink(e);
        }
      });
      return function() {
        unsubLeft();
        return unsubRight();
      };
    });
  };

  Bacon.Observable.prototype.flatMap = function() {
    return flatMap_(this, makeSpawner(arguments));
  };

  Bacon.Observable.prototype.flatMapFirst = function() {
    return flatMap_(this, makeSpawner(arguments), true);
  };

  flatMap_ = function(root, f, firstOnly, limit) {
    var childDeps, result, rootDep;
    rootDep = [root];
    childDeps = [];
    result = new EventStream(new Bacon.Desc(root, "flatMap" + (firstOnly ? "First" : ""), [f]), function(sink) {
      var checkEnd, checkQueue, composite, queue, spawn;
      composite = new CompositeUnsubscribe();
      queue = [];
      spawn = function(event) {
        var child;
        child = makeObservable(f(event.value()));
        childDeps.push(child);
        return composite.add(function(unsubAll, unsubMe) {
          return child.dispatcher.subscribe(function(event) {
            var reply;
            if (event.isEnd()) {
              _.remove(child, childDeps);
              checkQueue();
              checkEnd(unsubMe);
              return Bacon.noMore;
            } else {
              if (event instanceof Initial) {
                event = event.toNext();
              }
              reply = sink(event);
              if (reply === Bacon.noMore) {
                unsubAll();
              }
              return reply;
            }
          });
        });
      };
      checkQueue = function() {
        var event;
        event = queue.shift();
        if (event) {
          return spawn(event);
        }
      };
      checkEnd = function(unsub) {
        unsub();
        if (composite.empty()) {
          return sink(endEvent());
        }
      };
      composite.add(function(__, unsubRoot) {
        return root.dispatcher.subscribe(function(event) {
          if (event.isEnd()) {
            return checkEnd(unsubRoot);
          } else if (event.isError()) {
            return sink(event);
          } else if (firstOnly && composite.count() > 1) {
            return Bacon.more;
          } else {
            if (composite.unsubscribed) {
              return Bacon.noMore;
            }
            if (limit && composite.count() > limit) {
              return queue.push(event);
            } else {
              return spawn(event);
            }
          }
        });
      });
      return composite.unsubscribe;
    });
    result.internalDeps = function() {
      if (childDeps.length) {
        return rootDep.concat(childDeps);
      } else {
        return rootDep;
      }
    };
    return result;
  };

  makeSpawner = function(args) {
    if (args.length === 1 && isObservable(args[0])) {
      return _.always(args[0]);
    } else {
      return makeFunctionArgs(args);
    }
  };

  makeObservable = function(x) {
    if (isObservable(x)) {
      return x;
    } else {
      return Bacon.once(x);
    }
  };

  Bacon.Observable.prototype.flatMapWithConcurrencyLimit = function() {
    var args, limit;
    limit = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return withDesc(new Bacon.Desc(this, "flatMapWithConcurrencyLimit", [limit].concat(slice.call(args))), flatMap_(this, makeSpawner(args), false, limit));
  };

  Bacon.Observable.prototype.flatMapConcat = function() {
    return withDesc(new Bacon.Desc(this, "flatMapConcat", Array.prototype.slice.call(arguments, 0)), this.flatMapWithConcurrencyLimit.apply(this, [1].concat(slice.call(arguments))));
  };

  Bacon.later = function(delay, value) {
    return withDesc(new Bacon.Desc(Bacon, "later", [delay, value]), Bacon.fromBinder(function(sink) {
      var id, sender;
      sender = function() {
        return sink([value, endEvent()]);
      };
      id = Bacon.scheduler.setTimeout(sender, delay);
      return function() {
        return Bacon.scheduler.clearTimeout(id);
      };
    }));
  };

  Bacon.Observable.prototype.bufferingThrottle = function(minimumInterval) {
    return withDesc(new Bacon.Desc(this, "bufferingThrottle", [minimumInterval]), this.flatMapConcat(function(x) {
      return Bacon.once(x).concat(Bacon.later(minimumInterval).filter(false));
    }));
  };

  Bacon.Property.prototype.bufferingThrottle = function() {
    return Bacon.Observable.prototype.bufferingThrottle.apply(this, arguments).toProperty();
  };

  Bus = (function(superClass) {
    extend(Bus, superClass);

    function Bus() {
      this.guardedSink = bind(this.guardedSink, this);
      this.subscribeAll = bind(this.subscribeAll, this);
      this.unsubAll = bind(this.unsubAll, this);
      this.sink = void 0;
      this.subscriptions = [];
      this.ended = false;
      Bus.__super__.constructor.call(this, new Bacon.Desc(Bacon, "Bus", []), this.subscribeAll);
    }

    Bus.prototype.unsubAll = function() {
      var j, len1, ref, sub;
      ref = this.subscriptions;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        sub = ref[j];
        if (typeof sub.unsub === "function") {
          sub.unsub();
        }
      }
      return void 0;
    };

    Bus.prototype.subscribeAll = function(newSink) {
      var j, len1, ref, subscription;
      if (this.ended) {
        newSink(endEvent());
      } else {
        this.sink = newSink;
        ref = cloneArray(this.subscriptions);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          subscription = ref[j];
          this.subscribeInput(subscription);
        }
      }
      return this.unsubAll;
    };

    Bus.prototype.guardedSink = function(input) {
      return (function(_this) {
        return function(event) {
          if (event.isEnd()) {
            _this.unsubscribeInput(input);
            return Bacon.noMore;
          } else {
            return _this.sink(event);
          }
        };
      })(this);
    };

    Bus.prototype.subscribeInput = function(subscription) {
      return subscription.unsub = subscription.input.dispatcher.subscribe(this.guardedSink(subscription.input));
    };

    Bus.prototype.unsubscribeInput = function(input) {
      var i, j, len1, ref, sub;
      ref = this.subscriptions;
      for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
        sub = ref[i];
        if (sub.input === input) {
          if (typeof sub.unsub === "function") {
            sub.unsub();
          }
          this.subscriptions.splice(i, 1);
          return;
        }
      }
    };

    Bus.prototype.plug = function(input) {
      var sub;
      assertObservable(input);
      if (this.ended) {
        return;
      }
      sub = {
        input: input
      };
      this.subscriptions.push(sub);
      if ((this.sink != null)) {
        this.subscribeInput(sub);
      }
      return (function(_this) {
        return function() {
          return _this.unsubscribeInput(input);
        };
      })(this);
    };

    Bus.prototype.end = function() {
      this.ended = true;
      this.unsubAll();
      return typeof this.sink === "function" ? this.sink(endEvent()) : void 0;
    };

    Bus.prototype.push = function(value) {
      if (!this.ended) {
        return typeof this.sink === "function" ? this.sink(nextEvent(value)) : void 0;
      }
    };

    Bus.prototype.error = function(error) {
      return typeof this.sink === "function" ? this.sink(new Error(error)) : void 0;
    };

    return Bus;

  })(EventStream);

  Bacon.Bus = Bus;

  liftCallback = function(desc, wrapped) {
    return withMethodCallSupport(function() {
      var args, f, stream;
      f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      stream = partiallyApplied(wrapped, [
        function(values, callback) {
          return f.apply(null, slice.call(values).concat([callback]));
        }
      ]);
      return withDesc(new Bacon.Desc(Bacon, desc, [f].concat(slice.call(args))), Bacon.combineAsArray(args).flatMap(stream));
    });
  };

  Bacon.fromCallback = liftCallback("fromCallback", function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return Bacon.fromBinder(function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    }, (function(value) {
      return [value, endEvent()];
    }));
  });

  Bacon.fromNodeCallback = liftCallback("fromNodeCallback", function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return Bacon.fromBinder(function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    }, function(error, value) {
      if (error) {
        return [new Error(error), endEvent()];
      }
      return [value, endEvent()];
    });
  });

  addPropertyInitValueToStream = function(property, stream) {
    var justInitValue;
    justInitValue = new EventStream(describe(property, "justInitValue"), function(sink) {
      var unsub, value;
      value = void 0;
      unsub = property.dispatcher.subscribe(function(event) {
        if (!event.isEnd()) {
          value = event;
        }
        return Bacon.noMore;
      });
      UpdateBarrier.whenDoneWith(justInitValue, function() {
        if (value != null) {
          sink(value);
        }
        return sink(endEvent());
      });
      return unsub;
    });
    return justInitValue.concat(stream).toProperty();
  };

  Bacon.Observable.prototype.mapEnd = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "mapEnd", [f]), this.withHandler(function(event) {
      if (event.isEnd()) {
        this.push(nextEvent(f(event)));
        this.push(endEvent());
        return Bacon.noMore;
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.Observable.prototype.skipErrors = function() {
    return withDesc(new Bacon.Desc(this, "skipErrors", []), this.withHandler(function(event) {
      if (event.isError()) {
        return Bacon.more;
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.EventStream.prototype.takeUntil = function(stopper) {
    var endMarker;
    endMarker = {};
    return withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), Bacon.groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors()).withHandler(function(event) {
      var data, j, len1, ref, reply, value;
      if (!event.hasValue()) {
        return this.push(event);
      } else {
        ref = event.value(), data = ref[0], stopper = ref[1];
        if (stopper.length) {
          return this.push(endEvent());
        } else {
          reply = Bacon.more;
          for (j = 0, len1 = data.length; j < len1; j++) {
            value = data[j];
            if (value === endMarker) {
              reply = this.push(endEvent());
            } else {
              reply = this.push(nextEvent(value));
            }
          }
          return reply;
        }
      }
    }));
  };

  Bacon.Property.prototype.takeUntil = function(stopper) {
    var changes;
    changes = this.changes().takeUntil(stopper);
    return withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), addPropertyInitValueToStream(this, changes));
  };

  Bacon.Observable.prototype.flatMapLatest = function() {
    var f, stream;
    f = makeSpawner(arguments);
    stream = this.toEventStream();
    return withDesc(new Bacon.Desc(this, "flatMapLatest", [f]), stream.flatMap(function(value) {
      return makeObservable(f(value)).takeUntil(stream);
    }));
  };

  Bacon.Property.prototype.delayChanges = function(desc, f) {
    return withDesc(desc, addPropertyInitValueToStream(this, f(this.changes())));
  };

  Bacon.EventStream.prototype.delay = function(delay) {
    return withDesc(new Bacon.Desc(this, "delay", [delay]), this.flatMap(function(value) {
      return Bacon.later(delay, value);
    }));
  };

  Bacon.Property.prototype.delay = function(delay) {
    return this.delayChanges(new Bacon.Desc(this, "delay", [delay]), function(changes) {
      return changes.delay(delay);
    });
  };

  Bacon.EventStream.prototype.debounce = function(delay) {
    return withDesc(new Bacon.Desc(this, "debounce", [delay]), this.flatMapLatest(function(value) {
      return Bacon.later(delay, value);
    }));
  };

  Bacon.Property.prototype.debounce = function(delay) {
    return this.delayChanges(new Bacon.Desc(this, "debounce", [delay]), function(changes) {
      return changes.debounce(delay);
    });
  };

  Bacon.EventStream.prototype.debounceImmediate = function(delay) {
    return withDesc(new Bacon.Desc(this, "debounceImmediate", [delay]), this.flatMapFirst(function(value) {
      return Bacon.once(value).concat(Bacon.later(delay).filter(false));
    }));
  };

  Bacon.Observable.prototype.scan = function(seed, f) {
    var acc, resultProperty, subscribe;
    f = toCombinator(f);
    acc = toOption(seed);
    subscribe = (function(_this) {
      return function(sink) {
        var initSent, reply, sendInit, unsub;
        initSent = false;
        unsub = nop;
        reply = Bacon.more;
        sendInit = function() {
          if (!initSent) {
            return acc.forEach(function(value) {
              initSent = true;
              reply = sink(new Initial(function() {
                return value;
              }));
              if (reply === Bacon.noMore) {
                unsub();
                return unsub = nop;
              }
            });
          }
        };
        unsub = _this.dispatcher.subscribe(function(event) {
          var next, prev;
          if (event.hasValue()) {
            if (initSent && event.isInitial()) {
              return Bacon.more;
            } else {
              if (!event.isInitial()) {
                sendInit();
              }
              initSent = true;
              prev = acc.getOrElse(void 0);
              next = f(prev, event.value());
              acc = new Some(next);
              return sink(event.apply(function() {
                return next;
              }));
            }
          } else {
            if (event.isEnd()) {
              reply = sendInit();
            }
            if (reply !== Bacon.noMore) {
              return sink(event);
            }
          }
        });
        UpdateBarrier.whenDoneWith(resultProperty, sendInit);
        return unsub;
      };
    })(this);
    return resultProperty = new Property(new Bacon.Desc(this, "scan", [seed, f]), subscribe);
  };

  Bacon.Observable.prototype.diff = function(start, f) {
    f = toCombinator(f);
    return withDesc(new Bacon.Desc(this, "diff", [start, f]), this.scan([start], function(prevTuple, next) {
      return [next, f(prevTuple[0], next)];
    }).filter(function(tuple) {
      return tuple.length === 2;
    }).map(function(tuple) {
      return tuple[1];
    }));
  };

  Bacon.Observable.prototype.doAction = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "doAction", [f]), this.withHandler(function(event) {
      if (event.hasValue()) {
        f(event.value());
      }
      return this.push(event);
    }));
  };

  Bacon.Observable.prototype.doError = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "doError", [f]), this.withHandler(function(event) {
      if (event.isError()) {
        f(event.error);
      }
      return this.push(event);
    }));
  };

  Bacon.Observable.prototype.doLog = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return withDesc(new Bacon.Desc(this, "doLog", args), this.withHandler(function(event) {
      if (typeof console !== "undefined" && console !== null) {
        if (typeof console.log === "function") {
          console.log.apply(console, slice.call(args).concat([event.log()]));
        }
      }
      return this.push(event);
    }));
  };

  Bacon.Observable.prototype.endOnError = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (f == null) {
      f = true;
    }
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "endOnError", []), this.withHandler(function(event) {
        if (event.isError() && f(event.error)) {
          this.push(event);
          return this.push(endEvent());
        } else {
          return this.push(event);
        }
      }));
    });
  };

  Observable.prototype.errors = function() {
    return withDesc(new Bacon.Desc(this, "errors", []), this.filter(function() {
      return false;
    }));
  };

  valueAndEnd = (function(value) {
    return [value, endEvent()];
  });

  Bacon.fromPromise = function(promise, abort, eventTransformer) {
    if (eventTransformer == null) {
      eventTransformer = valueAndEnd;
    }
    return withDesc(new Bacon.Desc(Bacon, "fromPromise", [promise]), Bacon.fromBinder(function(handler) {
      var ref;
      if ((ref = promise.then(handler, function(e) {
        return handler(new Error(e));
      })) != null) {
        if (typeof ref.done === "function") {
          ref.done();
        }
      }
      return function() {
        if (abort) {
          return typeof promise.abort === "function" ? promise.abort() : void 0;
        }
      };
    }, eventTransformer));
  };

  Bacon.Observable.prototype.mapError = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "mapError", [f]), this.withHandler(function(event) {
      if (event.isError()) {
        return this.push(nextEvent(f(event.error)));
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.Observable.prototype.flatMapError = function(fn) {
    return withDesc(new Bacon.Desc(this, "flatMapError", [fn]), this.mapError(function(err) {
      return new Error(err);
    }).flatMap(function(x) {
      if (x instanceof Error) {
        return fn(x.error);
      } else {
        return Bacon.once(x);
      }
    }));
  };

  Bacon.EventStream.prototype.sampledBy = function(sampler, combinator) {
    return withDesc(new Bacon.Desc(this, "sampledBy", [sampler, combinator]), this.toProperty().sampledBy(sampler, combinator));
  };

  Bacon.Property.prototype.sampledBy = function(sampler, combinator) {
    var lazy, result, samplerSource, stream, thisSource;
    if (combinator != null) {
      combinator = toCombinator(combinator);
    } else {
      lazy = true;
      combinator = function(f) {
        return f.value();
      };
    }
    thisSource = new Source(this, false, lazy);
    samplerSource = new Source(sampler, true, lazy);
    stream = Bacon.when([thisSource, samplerSource], combinator);
    result = sampler instanceof Property ? stream.toProperty() : stream;
    return withDesc(new Bacon.Desc(this, "sampledBy", [sampler, combinator]), result);
  };

  Bacon.Property.prototype.sample = function(interval) {
    return withDesc(new Bacon.Desc(this, "sample", [interval]), this.sampledBy(Bacon.interval(interval, {})));
  };

  Bacon.Observable.prototype.map = function() {
    var args, p;
    p = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (p instanceof Property) {
      return p.sampledBy(this, former);
    } else {
      return convertArgsToFunction(this, p, args, function(f) {
        return withDesc(new Bacon.Desc(this, "map", [f]), this.withHandler(function(event) {
          return this.push(event.fmap(f));
        }));
      });
    }
  };

  Bacon.Observable.prototype.fold = function(seed, f) {
    return withDesc(new Bacon.Desc(this, "fold", [seed, f]), this.scan(seed, f).sampledBy(this.filter(false).mapEnd().toProperty()));
  };

  Observable.prototype.reduce = Observable.prototype.fold;

  Bacon.fromPoll = function(delay, poll) {
    return withDesc(new Bacon.Desc(Bacon, "fromPoll", [delay, poll]), Bacon.fromBinder((function(handler) {
      var id;
      id = Bacon.scheduler.setInterval(handler, delay);
      return function() {
        return Bacon.scheduler.clearInterval(id);
      };
    }), poll));
  };

  Bacon.fromArray = function(values) {
    var i;
    assertArray(values);
    if (!values.length) {
      return withDesc(new Bacon.Desc(Bacon, "fromArray", values), Bacon.never());
    } else {
      i = 0;
      return new EventStream(new Bacon.Desc(Bacon, "fromArray", [values]), function(sink) {
        var push, pushNeeded, pushing, reply, unsubd;
        unsubd = false;
        reply = Bacon.more;
        pushing = false;
        pushNeeded = false;
        push = function() {
          var value;
          pushNeeded = true;
          if (pushing) {
            return;
          }
          pushing = true;
          while (pushNeeded) {
            pushNeeded = false;
            if ((reply !== Bacon.noMore) && !unsubd) {
              value = values[i++];
              reply = sink(toEvent(value));
              if (reply !== Bacon.noMore) {
                if (i === values.length) {
                  sink(endEvent());
                } else {
                  UpdateBarrier.afterTransaction(push);
                }
              }
            }
          }
          return pushing = false;
        };
        push();
        return function() {
          return unsubd = true;
        };
      });
    }
  };

  Bacon.EventStream.prototype.holdWhen = function(valve) {
    var bufferedValues, composite, onHold, src, subscribed;
    composite = new CompositeUnsubscribe();
    onHold = false;
    bufferedValues = [];
    subscribed = false;
    src = this;
    return new EventStream(new Bacon.Desc(this, "holdWhen", [valve]), function(sink) {
      var endIfBothEnded;
      endIfBothEnded = function(unsub) {
        if (typeof unsub === "function") {
          unsub();
        }
        if (composite.empty() && subscribed) {
          return sink(endEvent());
        }
      };
      composite.add(function(unsubAll, unsubMe) {
        return valve.subscribeInternal(function(event) {
          var j, len1, results, toSend, value;
          if (event.hasValue()) {
            onHold = event.value();
            if (!onHold) {
              toSend = bufferedValues;
              bufferedValues = [];
              results = [];
              for (j = 0, len1 = toSend.length; j < len1; j++) {
                value = toSend[j];
                results.push(sink(nextEvent(value)));
              }
              return results;
            }
          } else if (event.isEnd()) {
            return endIfBothEnded(unsubMe);
          } else {
            return sink(event);
          }
        });
      });
      composite.add(function(unsubAll, unsubMe) {
        return src.subscribeInternal(function(event) {
          if (onHold && event.hasValue()) {
            return bufferedValues.push(event.value());
          } else if (event.isEnd() && bufferedValues.length) {
            return endIfBothEnded(unsubMe);
          } else {
            return sink(event);
          }
        });
      });
      subscribed = true;
      endIfBothEnded();
      return composite.unsubscribe;
    });
  };

  Bacon.interval = function(delay, value) {
    if (value == null) {
      value = {};
    }
    return withDesc(new Bacon.Desc(Bacon, "interval", [delay, value]), Bacon.fromPoll(delay, function() {
      return nextEvent(value);
    }));
  };

  Bacon.$ = {};

  Bacon.$.asEventStream = function(eventName, selector, eventTransformer) {
    var ref;
    if (_.isFunction(selector)) {
      ref = [selector, void 0], eventTransformer = ref[0], selector = ref[1];
    }
    return withDesc(new Bacon.Desc(this.selector || this, "asEventStream", [eventName]), Bacon.fromBinder((function(_this) {
      return function(handler) {
        _this.on(eventName, selector, handler);
        return function() {
          return _this.off(eventName, selector, handler);
        };
      };
    })(this), eventTransformer));
  };

  if ((ref = typeof jQuery !== "undefined" && jQuery !== null ? jQuery : typeof Zepto !== "undefined" && Zepto !== null ? Zepto : void 0) != null) {
    ref.fn.asEventStream = Bacon.$.asEventStream;
  }

  Bacon.Observable.prototype.log = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.subscribe(function(event) {
      return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log.apply(console, slice.call(args).concat([event.log()])) : void 0 : void 0;
    });
    return this;
  };

  Bacon.EventStream.prototype.merge = function(right) {
    var left;
    assertEventStream(right);
    left = this;
    return withDesc(new Bacon.Desc(left, "merge", [right]), Bacon.mergeAll(this, right));
  };

  Bacon.mergeAll = function() {
    var streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (isArray(streams[0])) {
      streams = streams[0];
    }
    if (streams.length) {
      return new EventStream(new Bacon.Desc(Bacon, "mergeAll", streams), function(sink) {
        var ends, sinks, smartSink;
        ends = 0;
        smartSink = function(obs) {
          return function(unsubBoth) {
            return obs.dispatcher.subscribe(function(event) {
              var reply;
              if (event.isEnd()) {
                ends++;
                if (ends === streams.length) {
                  return sink(endEvent());
                } else {
                  return Bacon.more;
                }
              } else {
                reply = sink(event);
                if (reply === Bacon.noMore) {
                  unsubBoth();
                }
                return reply;
              }
            });
          };
        };
        sinks = _.map(smartSink, streams);
        return new Bacon.CompositeUnsubscribe(sinks).unsubscribe;
      });
    } else {
      return Bacon.never();
    }
  };

  Bacon.repeatedly = function(delay, values) {
    var index;
    index = 0;
    return withDesc(new Bacon.Desc(Bacon, "repeatedly", [delay, values]), Bacon.fromPoll(delay, function() {
      return values[index++ % values.length];
    }));
  };

  Bacon.repeat = function(generator) {
    var index;
    index = 0;
    return Bacon.fromBinder(function(sink) {
      var flag, handleEvent, reply, subscribeNext, unsub;
      flag = false;
      reply = Bacon.more;
      unsub = function() {};
      handleEvent = function(event) {
        if (event.isEnd()) {
          if (!flag) {
            return flag = true;
          } else {
            return subscribeNext();
          }
        } else {
          return reply = sink(event);
        }
      };
      subscribeNext = function() {
        var next;
        flag = true;
        while (flag && reply !== Bacon.noMore) {
          next = generator(index++);
          flag = false;
          if (next) {
            unsub = next.subscribeInternal(handleEvent);
          } else {
            sink(endEvent());
          }
        }
        return flag = true;
      };
      subscribeNext();
      return function() {
        return unsub();
      };
    });
  };

  Bacon.retry = function(options) {
    var delay, error, finished, isRetryable, maxRetries, retries, source;
    if (!_.isFunction(options.source)) {
      throw new Exception("'source' option has to be a function");
    }
    source = options.source;
    retries = options.retries || 0;
    maxRetries = options.maxRetries || retries;
    delay = options.delay || function() {
      return 0;
    };
    isRetryable = options.isRetryable || function() {
      return true;
    };
    finished = false;
    error = null;
    return withDesc(new Bacon.Desc(Bacon, "retry", [options]), Bacon.repeat(function() {
      var context, pause, valueStream;
      if (finished) {
        return null;
      } else {
        valueStream = function() {
          return source().endOnError().withHandler(function(event) {
            if (event.isError()) {
              error = event;
              if (isRetryable(error.error) && retries > 0) {

              } else {
                finished = true;
                return this.push(event);
              }
            } else {
              if (event.hasValue()) {
                error = null;
                finished = true;
              }
              return this.push(event);
            }
          });
        };
        if (error) {
          context = {
            error: error.error,
            retriesDone: maxRetries - retries
          };
          pause = Bacon.later(delay(context)).filter(false);
          retries = retries - 1;
          return pause.concat(Bacon.once().flatMap(valueStream));
        } else {
          return valueStream();
        }
      }
    }));
  };

  Bacon.sequentially = function(delay, values) {
    var index;
    index = 0;
    return withDesc(new Bacon.Desc(Bacon, "sequentially", [delay, values]), Bacon.fromPoll(delay, function() {
      var value;
      value = values[index++];
      if (index < values.length) {
        return value;
      } else if (index === values.length) {
        return [value, endEvent()];
      } else {
        return endEvent();
      }
    }));
  };

  Bacon.Observable.prototype.skip = function(count) {
    return withDesc(new Bacon.Desc(this, "skip", [count]), this.withHandler(function(event) {
      if (!event.hasValue()) {
        return this.push(event);
      } else if (count > 0) {
        count--;
        return Bacon.more;
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.Observable.prototype.take = function(count) {
    if (count <= 0) {
      return Bacon.never();
    }
    return withDesc(new Bacon.Desc(this, "take", [count]), this.withHandler(function(event) {
      if (!event.hasValue()) {
        return this.push(event);
      } else {
        count--;
        if (count > 0) {
          return this.push(event);
        } else {
          if (count === 0) {
            this.push(event);
          }
          this.push(endEvent());
          return Bacon.noMore;
        }
      }
    }));
  };

  Bacon.EventStream.prototype.skipUntil = function(starter) {
    var started;
    started = starter.take(1).map(true).toProperty(false);
    return withDesc(new Bacon.Desc(this, "skipUntil", [starter]), this.filter(started));
  };

  Bacon.EventStream.prototype.skipWhile = function() {
    var args, f, ok;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    assertObservableIsProperty(f);
    ok = false;
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "skipWhile", [f]), this.withHandler(function(event) {
        if (ok || !event.hasValue() || !f(event.value())) {
          if (event.hasValue()) {
            ok = true;
          }
          return this.push(event);
        } else {
          return Bacon.more;
        }
      }));
    });
  };

  Bacon.Observable.prototype.slidingWindow = function(n, minValues) {
    if (minValues == null) {
      minValues = 0;
    }
    return withDesc(new Bacon.Desc(this, "slidingWindow", [n, minValues]), this.scan([], (function(window, value) {
      return window.concat([value]).slice(-n);
    })).filter((function(values) {
      return values.length >= minValues;
    })));
  };

  Bacon.spy = function(spy) {
    return spys.push(spy);
  };

  spys = [];

  registerObs = function(obs) {
    var j, len1, spy;
    if (spys.length) {
      if (!registerObs.running) {
        try {
          registerObs.running = true;
          for (j = 0, len1 = spys.length; j < len1; j++) {
            spy = spys[j];
            spy(obs);
          }
        } finally {
          delete registerObs.running;
        }
      }
    }
    return void 0;
  };

  Bacon.Property.prototype.startWith = function(seed) {
    return withDesc(new Bacon.Desc(this, "startWith", [seed]), this.scan(seed, function(prev, next) {
      return next;
    }));
  };

  Bacon.EventStream.prototype.startWith = function(seed) {
    return withDesc(new Bacon.Desc(this, "startWith", [seed]), Bacon.once(seed).concat(this));
  };

  Bacon.Observable.prototype.takeWhile = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    assertObservableIsProperty(f);
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "takeWhile", [f]), this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          this.push(endEvent());
          return Bacon.noMore;
        }
      }));
    });
  };

  Bacon.update = function() {
    var i, initial, lateBindFirst, patterns;
    initial = arguments[0], patterns = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    lateBindFirst = function(f) {
      return function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return function(i) {
          return f.apply(null, [i].concat(args));
        };
      };
    };
    i = patterns.length - 1;
    while (i > 0) {
      if (!(patterns[i] instanceof Function)) {
        patterns[i] = (function(x) {
          return function() {
            return x;
          };
        })(patterns[i]);
      }
      patterns[i] = lateBindFirst(patterns[i]);
      i = i - 2;
    }
    return withDesc(new Bacon.Desc(Bacon, "update", [initial].concat(slice.call(patterns))), Bacon.when.apply(Bacon, patterns).scan(initial, (function(x, f) {
      return f(x);
    })));
  };

  Bacon.zipAsArray = function() {
    var streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (isArray(streams[0])) {
      streams = streams[0];
    }
    return withDesc(new Bacon.Desc(Bacon, "zipAsArray", streams), Bacon.zipWith(streams, function() {
      var xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return xs;
    }));
  };

  Bacon.zipWith = function() {
    var f, ref1, streams;
    f = arguments[0], streams = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (!_.isFunction(f)) {
      ref1 = [f, streams[0]], streams = ref1[0], f = ref1[1];
    }
    streams = _.map((function(s) {
      return s.toEventStream();
    }), streams);
    return withDesc(new Bacon.Desc(Bacon, "zipWith", [f].concat(slice.call(streams))), Bacon.when(streams, f));
  };

  Bacon.Observable.prototype.zip = function(other, f) {
    if (f == null) {
      f = Array;
    }
    return withDesc(new Bacon.Desc(this, "zip", [other]), Bacon.zipWith([this, other], f));
  };

  

Bacon.Observable.prototype.first = function () {
  return withDesc(new Bacon.Desc(this, "first", []), this.take(1));
};

Bacon.Observable.prototype.last = function () {
  var lastEvent;

  return withDesc(new Bacon.Desc(this, "last", []), this.withHandler(function (event) {
    if (event.isEnd()) {
      if (lastEvent) {
        this.push(lastEvent);
      }
      this.push(endEvent());
      return Bacon.noMore;
    } else {
      lastEvent = event;
    }
  }));
};

Bacon.EventStream.prototype.throttle = function (delay) {
  return withDesc(new Bacon.Desc(this, "throttle", [delay]), this.bufferWithTime(delay).map(function (values) {
    return values[values.length - 1];
  }));
};

Bacon.Property.prototype.throttle = function (delay) {
  return this.delayChanges(new Bacon.Desc(this, "throttle", [delay]), function (changes) {
    return changes.throttle(delay);
  });
};

Observable.prototype.firstToPromise = function (PromiseCtr) {
  var _this = this;

  if (typeof PromiseCtr !== "function") {
    if (typeof Promise === "function") {
      PromiseCtr = Promise;
    } else {
      throw new Exception("There isn't default Promise, use shim or parameter");
    }
  }

  return new PromiseCtr(function (resolve, reject) {
    return _this.subscribe(function (event) {
      if (event.hasValue()) {
        resolve(event.value());
      }
      if (event.isError()) {
        reject(event.error);
      }

      return Bacon.noMore;
    });
  });
};

Observable.prototype.toPromise = function (PromiseCtr) {
  return this.last().firstToPromise(PromiseCtr);
};

if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
    define([], function() {
      return Bacon;
    });
    this.Bacon = Bacon;
  } else if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    module.exports = Bacon;
    Bacon.Bacon = Bacon;
  } else {
    this.Bacon = Bacon;
  }

}).call(this);

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/baconjs/dist/Bacon.js","/../../node_modules/baconjs/dist")
},{"buffer":9,"oMfpAn":14}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Generated by CoffeeScript 1.7.1
var generate, parse, stringify, transform;

generate = require('csv-generate');

parse = require('csv-parse');

transform = require('stream-transform');

stringify = require('csv-stringify');

module.exports.generate = generate;

module.exports.parse = parse;

module.exports.transform = transform;

module.exports.stringify = stringify;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/csv/lib/index.js","/../../node_modules/csv/lib")
},{"buffer":9,"csv-generate":5,"csv-parse":6,"csv-stringify":7,"oMfpAn":14,"stream-transform":8}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Generated by CoffeeScript 1.7.1
var Generator, stream, util;

stream = require('stream');

util = require('util');

module.exports = function() {
  var callback, data, generator, options;
  if (arguments.length === 2) {
    options = arguments[0];
    callback = arguments[1];
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      options = {};
      callback = arguments[0];
    } else {
      options = arguments[0];
    }
  } else if (arguments.length === 0) {
    options = {};
  }
  generator = new Generator(options);
  if (callback) {
    data = [];
    generator.on('readable', function() {
      var d, _results;
      _results = [];
      while (d = generator.read()) {
        _results.push(data.push(options.objectMode ? d : d.toString()));
      }
      return _results;
    });
    generator.on('error', callback);
    generator.on('end', function() {
      return callback(null, options.objectMode ? data : data.join(''));
    });
  }
  return generator;
};

Generator = function(options) {
  var i, v, _base, _base1, _base2, _base3, _base4, _base5, _base6, _base7, _base8, _i, _len, _ref;
  this.options = options != null ? options : {};
  stream.Readable.call(this, this.options);
  this.options.count = 0;
  if ((_base = this.options).duration == null) {
    _base.duration = 4 * 60 * 1000;
  }
  if ((_base1 = this.options).columns == null) {
    _base1.columns = 8;
  }
  if ((_base2 = this.options).max_word_length == null) {
    _base2.max_word_length = 16;
  }
  if ((_base3 = this.options).fixed_size == null) {
    _base3.fixed_size = false;
  }
  if (this.fixed_size_buffer == null) {
    this.fixed_size_buffer = '';
  }
  if ((_base4 = this.options).start == null) {
    _base4.start = Date.now();
  }
  if ((_base5 = this.options).end == null) {
    _base5.end = null;
  }
  if ((_base6 = this.options).seed == null) {
    _base6.seed = false;
  }
  if ((_base7 = this.options).length == null) {
    _base7.length = -1;
  }
  if ((_base8 = this.options).delimiter == null) {
    _base8.delimiter = ',';
  }
  this.count_written = 0;
  this.count_created = 0;
  if (typeof this.options.columns === 'number') {
    this.options.columns = new Array(this.options.columns);
  }
  _ref = this.options.columns;
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    v = _ref[i];
    if (v == null) {
      v = 'ascii';
    }
    if (typeof v === 'string') {
      this.options.columns[i] = Generator[v];
    }
  }
  return this;
};

util.inherits(Generator, stream.Readable);

module.exports.Generator = Generator;

Generator.prototype.random = function() {
  if (this.options.seed) {
    return this.options.seed = this.options.seed * Math.PI * 100 % 100 / 100;
  } else {
    return Math.random();
  }
};

Generator.prototype.end = function() {
  return this.push(null);
};

Generator.prototype._read = function(size) {
  var column, data, header, length, line, lineLength, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref;
  data = [];
  length = this.fixed_size_buffer.length;
  if (length) {
    data.push(this.fixed_size_buffer);
  }
  while (true) {
    if ((this.count_created === this.options.length) || (this.options.end && Date.now() > this.options.end)) {
      if (data.length) {
        if (this.options.objectMode) {
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            line = data[_i];
            this.count_written++;
            this.push(line);
          }
        } else {
          this.count_written++;
          this.push(data.join(''));
        }
      }
      return this.push(null);
    }
    line = [];
    _ref = this.options.columns;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      header = _ref[_j];
      line.push("" + (header(this)));
    }
    if (this.options.objectMode) {
      lineLength = 0;
      for (_k = 0, _len2 = line.length; _k < _len2; _k++) {
        column = line[_k];
        lineLength += column.length;
      }
    } else {
      line = "" + (this.count_created === 0 ? '' : '\n') + (line.join(this.options.delimiter));
      lineLength = line.length;
    }
    this.count_created++;
    if (length + lineLength > size) {
      if (this.options.objectMode) {
        data.push(line);
        for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
          line = data[_l];
          this.count_written++;
          this.push(line);
        }
      } else {
        if (this.options.fixed_size) {
          this.fixed_size_buffer = line.substr(size - length);
          data.push(line.substr(0, size - length));
        } else {
          data.push(line);
        }
        this.count_written++;
        this.push(data.join(''));
      }
      break;
    }
    length += lineLength;
    data.push(line);
  }
};

Generator.ascii = function(gen) {
  var char, column, nb_chars, _i, _ref;
  column = [];
  for (nb_chars = _i = 0, _ref = Math.ceil(gen.random() * gen.options.max_word_length); 0 <= _ref ? _i < _ref : _i > _ref; nb_chars = 0 <= _ref ? ++_i : --_i) {
    char = Math.floor(gen.random() * 32);
    column.push(String.fromCharCode(char + (char < 16 ? 65 : 97 - 16)));
  }
  return column.join('');
};

Generator.int = function(gen) {
  return Math.floor(gen.random() * Math.pow(2, 52));
};

Generator.bool = function(gen) {
  return Math.floor(gen.random() * 2);
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/csv/node_modules/csv-generate/lib/index.js","/../../node_modules/csv/node_modules/csv-generate/lib")
},{"buffer":9,"oMfpAn":14,"stream":16,"util":24}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Generated by CoffeeScript 1.9.1
var Parser, StringDecoder, stream, util;

stream = require('stream');

util = require('util');

StringDecoder = require('string_decoder').StringDecoder;

module.exports = function() {
  var callback, called, chunks, data, options, parser;
  if (arguments.length === 3) {
    data = arguments[0];
    options = arguments[1];
    callback = arguments[2];
    if (typeof callback !== 'function') {
      throw Error("Invalid callback argument: " + (JSON.stringify(callback)));
    }
    if (typeof data !== 'string') {
      return callback(Error("Invalid data argument: " + (JSON.stringify(data))));
    }
  } else if (arguments.length === 2) {
    if (typeof arguments[0] === 'string' || Buffer.isBuffer(arguments[0])) {
      data = arguments[0];
    } else {
      options = arguments[0];
    }
    if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      options = arguments[1];
    }
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
    } else {
      options = arguments[0];
    }
  }
  if (options == null) {
    options = {};
  }
  parser = new Parser(options);
  if (data) {
    process.nextTick(function() {
      parser.write(data);
      return parser.end();
    });
  }
  if (callback) {
    called = false;
    chunks = options.objname ? {} : [];
    parser.on('readable', function() {
      var chunk, results;
      results = [];
      while (chunk = parser.read()) {
        if (options.objname) {
          results.push(chunks[chunk[0]] = chunk[1]);
        } else {
          results.push(chunks.push(chunk));
        }
      }
      return results;
    });
    parser.on('error', function(err) {
      called = true;
      return callback(err);
    });
    parser.on('end', function() {
      if (!called) {
        return callback(null, chunks);
      }
    });
  }
  return parser;
};

Parser = function(options) {
  var base, base1, base10, base11, base2, base3, base4, base5, base6, base7, base8, base9, k, v;
  if (options == null) {
    options = {};
  }
  options.objectMode = true;
  this.options = {};
  for (k in options) {
    v = options[k];
    this.options[k] = v;
  }
  stream.Transform.call(this, this.options);
  if ((base = this.options).rowDelimiter == null) {
    base.rowDelimiter = null;
  }
  if ((base1 = this.options).delimiter == null) {
    base1.delimiter = ',';
  }
  if ((base2 = this.options).quote == null) {
    base2.quote = '"';
  }
  if ((base3 = this.options).escape == null) {
    base3.escape = '"';
  }
  if ((base4 = this.options).columns == null) {
    base4.columns = null;
  }
  if ((base5 = this.options).comment == null) {
    base5.comment = '';
  }
  if ((base6 = this.options).objname == null) {
    base6.objname = false;
  }
  if ((base7 = this.options).trim == null) {
    base7.trim = false;
  }
  if ((base8 = this.options).ltrim == null) {
    base8.ltrim = false;
  }
  if ((base9 = this.options).rtrim == null) {
    base9.rtrim = false;
  }
  if ((base10 = this.options).auto_parse == null) {
    base10.auto_parse = false;
  }
  if ((base11 = this.options).skip_empty_lines == null) {
    base11.skip_empty_lines = false;
  }
  this.lines = 0;
  this.count = 0;
  this.regexp_int = /^(\-|\+)?([1-9]+[0-9]*)$/;
  this.regexp_float = /^(\-|\+)?([0-9]+(\.[0-9]+)?([eE][0-9]+)?|Infinity)$/;
  this.decoder = new StringDecoder();
  this.buf = '';
  this.quoting = false;
  this.commenting = false;
  this.field = '';
  this.nextChar = null;
  this.closingQuote = 0;
  this.line = [];
  this.chunks = [];
  return this;
};

util.inherits(Parser, stream.Transform);

module.exports.Parser = Parser;

Parser.prototype._transform = function(chunk, encoding, callback) {
  var err;
  if (chunk instanceof Buffer) {
    chunk = this.decoder.write(chunk);
  }
  try {
    this.__write(chunk, false);
    return callback();
  } catch (_error) {
    err = _error;
    return this.emit('error', err);
  }
};

Parser.prototype._flush = function(callback) {
  var err;
  try {
    this.__write(this.decoder.end(), true);
    if (this.quoting) {
      this.emit('error', new Error("Quoted field not terminated at line " + (this.lines + 1)));
      return;
    }
    if (this.line.length > 0) {
      this.__push(this.line);
    }
    return callback();
  } catch (_error) {
    err = _error;
    return this.emit('error', err);
  }
};

Parser.prototype.__push = function(line) {
  var field, i, j, len, lineAsColumns;
  if (this.options.columns === true) {
    this.options.columns = line;
    return;
  } else if (typeof this.options.columns === 'function') {
    this.options.columns = this.options.columns(line);
    return;
  }
  this.count++;
  if (this.options.columns != null) {
    lineAsColumns = {};
    for (i = j = 0, len = line.length; j < len; i = ++j) {
      field = line[i];
      lineAsColumns[this.options.columns[i]] = field;
    }
    if (this.options.objname) {
      return this.push([lineAsColumns[this.options.objname], lineAsColumns]);
    } else {
      return this.push(lineAsColumns);
    }
  } else {
    return this.push(line);
  }
};

Parser.prototype.__write = function(chars, end, callback) {
  var acceptedLength, areNextCharsDelimiter, areNextCharsRowDelimiters, char, escapeIsQuote, i, isDelimiter, isEscape, isNextCharAComment, isQuote, isRowDelimiter, l, ltrim, nextCharPos, ref, results, rowDelimiter, rowDelimiterLength, rtrim, wasCommenting;
  ltrim = this.options.trim || this.options.ltrim;
  rtrim = this.options.trim || this.options.rtrim;
  chars = this.buf + chars;
  l = chars.length;
  rowDelimiterLength = this.options.rowDelimiter ? this.options.rowDelimiter.length : 0;
  i = 0;
  if (this.lines === 0 && 0xFEFF === chars.charCodeAt(0)) {
    i++;
  }
  while (i < l) {
    acceptedLength = rowDelimiterLength + this.options.comment.length + this.options.escape.length + this.options.delimiter.length;
    if (this.quoting) {
      acceptedLength += this.options.quote.length;
    }
    if (!end && (i + acceptedLength >= l)) {
      break;
    }
    char = this.nextChar ? this.nextChar : chars.charAt(i);
    this.nextChar = chars.charAt(i + 1);
    if (this.options.rowDelimiter == null) {
      if ((this.field === '') && (char === '\n' || char === '\r')) {
        rowDelimiter = char;
        nextCharPos = i + 1;
      } else if (this.nextChar === '\n' || this.nextChar === '\r') {
        rowDelimiter = this.nextChar;
        nextCharPos = i + 2;
      }
      if (rowDelimiter) {
        if (rowDelimiter === '\r' && chars.charAt(nextCharPos) === '\n') {
          rowDelimiter += '\n';
        }
        this.options.rowDelimiter = rowDelimiter;
        rowDelimiterLength = this.options.rowDelimiter.length;
      }
    }
    if (!this.commenting && char === this.options.escape) {
      escapeIsQuote = this.options.escape === this.options.quote;
      isEscape = this.nextChar === this.options.escape;
      isQuote = this.nextChar === this.options.quote;
      if (!(escapeIsQuote && !this.field && !this.quoting) && (isEscape || isQuote)) {
        i++;
        char = this.nextChar;
        this.nextChar = chars.charAt(i + 1);
        this.field += char;
        i++;
        continue;
      }
    }
    if (!this.commenting && char === this.options.quote) {
      if (this.quoting) {
        areNextCharsRowDelimiters = this.options.rowDelimiter && chars.substr(i + 1, this.options.rowDelimiter.length) === this.options.rowDelimiter;
        areNextCharsDelimiter = chars.substr(i + 1, this.options.delimiter.length) === this.options.delimiter;
        isNextCharAComment = this.nextChar === this.options.comment;
        if (this.nextChar && !areNextCharsRowDelimiters && !areNextCharsDelimiter && !isNextCharAComment) {
          if (this.options.relax) {
            this.quoting = false;
            this.field = "" + this.options.quote + this.field;
          } else {
            throw Error("Invalid closing quote at line " + (this.lines + 1) + "; found " + (JSON.stringify(this.nextChar)) + " instead of delimiter " + (JSON.stringify(this.options.delimiter)));
          }
        } else {
          this.quoting = false;
          this.closingQuote = this.options.quote.length;
          i++;
          if (end && i === l) {
            this.line.push(this.field);
          }
          continue;
        }
      } else if (!this.field) {
        this.quoting = true;
        i++;
        continue;
      } else if (this.field && !this.options.relax) {
        throw Error("Invalid opening quote at line " + (this.lines + 1));
      }
    }
    isRowDelimiter = this.options.rowDelimiter && chars.substr(i, this.options.rowDelimiter.length) === this.options.rowDelimiter;
    if (isRowDelimiter) {
      this.lines++;
    }
    wasCommenting = false;
    if (!this.commenting && !this.quoting && this.options.comment && chars.substr(i, this.options.comment.length) === this.options.comment) {
      this.commenting = true;
    } else if (this.commenting && isRowDelimiter) {
      wasCommenting = true;
      this.commenting = false;
    }
    isDelimiter = chars.substr(i, this.options.delimiter.length) === this.options.delimiter;
    if (!this.commenting && !this.quoting && (isDelimiter || isRowDelimiter)) {
      if (isRowDelimiter && this.line.length === 0 && this.field === '') {
        if (wasCommenting || this.options.skip_empty_lines) {
          i += this.options.rowDelimiter.length;
          this.nextChar = chars.charAt(i);
          continue;
        }
      }
      if (rtrim) {
        if (!this.closingQuote) {
          this.field = this.field.trimRight();
        }
      }
      if (this.options.auto_parse && this.regexp_int.test(this.field)) {
        this.line.push(parseInt(this.field));
      } else if (this.options.auto_parse && this.regexp_float.test(this.field)) {
        this.line.push(parseFloat(this.field));
      } else {
        this.line.push(this.field);
      }
      this.closingQuote = 0;
      this.field = '';
      if (isDelimiter) {
        i += this.options.delimiter.length;
        this.nextChar = chars.charAt(i);
        if (end && !this.nextChar) {
          isRowDelimiter = true;
          this.line.push('');
        }
      }
      if (isRowDelimiter) {
        this.__push(this.line);
        this.line = [];
        i += (ref = this.options.rowDelimiter) != null ? ref.length : void 0;
        this.nextChar = chars.charAt(i);
        continue;
      }
    } else if (!this.commenting && !this.quoting && (char === ' ' || char === '\t')) {
      if (!(ltrim && !this.field)) {
        this.field += char;
      }
      if (end && i + 1 === l) {
        if (this.options.trim || this.options.rtrim) {
          this.field = this.field.trimRight();
        }
        this.line.push(this.field);
      }
      i++;
    } else if (!this.commenting) {
      this.field += char;
      i++;
      if (end && i === l) {
        this.line.push(this.field);
      }
    } else {
      i++;
    }
  }
  this.buf = '';
  results = [];
  while (i < l) {
    this.buf += chars.charAt(i);
    results.push(i++);
  }
  return results;
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/csv/node_modules/csv-parse/lib/index.js","/../../node_modules/csv/node_modules/csv-parse/lib")
},{"buffer":9,"oMfpAn":14,"stream":16,"string_decoder":22,"util":24}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Generated by CoffeeScript 1.9.2
var Stringifier, stream, util;

stream = require('stream');

util = require('util');

module.exports = function() {
  var callback, chunks, data, options, stringifier;
  if (arguments.length === 3) {
    data = arguments[0];
    options = arguments[1];
    callback = arguments[2];
  } else if (arguments.length === 2) {
    if (Array.isArray(arguments[0])) {
      data = arguments[0];
    } else {
      options = arguments[0];
    }
    if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      options = arguments[1];
    }
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
    } else if (Array.isArray(arguments[0])) {
      data = arguments[0];
    } else {
      options = arguments[0];
    }
  }
  if (options == null) {
    options = {};
  }
  stringifier = new Stringifier(options);
  if (data) {
    process.nextTick(function() {
      var d, j, len;
      for (j = 0, len = data.length; j < len; j++) {
        d = data[j];
        stringifier.write(d);
      }
      return stringifier.end();
    });
  }
  if (callback) {
    chunks = [];
    stringifier.on('readable', function() {
      var chunk, results;
      results = [];
      while (chunk = stringifier.read()) {
        results.push(chunks.push(chunk));
      }
      return results;
    });
    stringifier.on('error', function(err) {
      return callback(err);
    });
    stringifier.on('end', function() {
      return callback(null, chunks.join(''));
    });
  }
  return stringifier;
};

Stringifier = function(options) {
  var base, base1, base2, base3, base4, base5, base6, base7, base8;
  if (options == null) {
    options = {};
  }
  stream.Transform.call(this, options);
  this.options = options;
  if ((base = this.options).delimiter == null) {
    base.delimiter = ',';
  }
  if ((base1 = this.options).quote == null) {
    base1.quote = '"';
  }
  if ((base2 = this.options).quoted == null) {
    base2.quoted = false;
  }
  if ((base3 = this.options).quotedString == null) {
    base3.quotedString = false;
  }
  if ((base4 = this.options).eof == null) {
    base4.eof = true;
  }
  if ((base5 = this.options).escape == null) {
    base5.escape = '"';
  }
  if ((base6 = this.options).columns == null) {
    base6.columns = null;
  }
  if ((base7 = this.options).header == null) {
    base7.header = false;
  }
  if ((base8 = this.options).rowDelimiter == null) {
    base8.rowDelimiter = '\n';
  }
  if (this.countWriten == null) {
    this.countWriten = 0;
  }
  switch (this.options.rowDelimiter) {
    case 'auto':
      this.options.rowDelimiter = null;
      break;
    case 'unix':
      this.options.rowDelimiter = "\n";
      break;
    case 'mac':
      this.options.rowDelimiter = "\r";
      break;
    case 'windows':
      this.options.rowDelimiter = "\r\n";
      break;
    case 'unicode':
      this.options.rowDelimiter = "\u2028";
  }
  return this;
};

util.inherits(Stringifier, stream.Transform);

module.exports.Stringifier = Stringifier;

Stringifier.prototype.headers = function() {
  var k, label, labels;
  if (!this.options.header) {
    return;
  }
  if (!this.options.columns) {
    return;
  }
  labels = this.options.columns;
  if (typeof labels === 'object') {
    labels = (function() {
      var results;
      results = [];
      for (k in labels) {
        label = labels[k];
        results.push(label);
      }
      return results;
    })();
  }
  if (this.options.eof) {
    labels = this.stringify(labels) + this.options.rowDelimiter;
  } else {
    labels = this.stringify(labels);
  }
  return stream.Transform.prototype.write.call(this, labels);
};

Stringifier.prototype.end = function(chunk, encoding, callback) {
  if (this.countWriten === 0) {
    this.headers();
  }
  return stream.Transform.prototype.end.apply(this, arguments);
};

Stringifier.prototype.write = function(chunk, encoding, callback) {
  var base, e, preserve;
  if (chunk == null) {
    return;
  }
  preserve = typeof chunk !== 'object';
  if (!preserve) {
    if (this.countWriten === 0 && !Array.isArray(chunk)) {
      if ((base = this.options).columns == null) {
        base.columns = Object.keys(chunk);
      }
    }
    try {
      this.emit('record', chunk, this.countWriten);
    } catch (_error) {
      e = _error;
      return this.emit('error', e);
    }
    if (this.options.eof) {
      chunk = this.stringify(chunk) + this.options.rowDelimiter;
    } else {
      chunk = this.stringify(chunk);
      if (this.options.header || this.countWriten) {
        chunk = this.options.rowDelimiter + chunk;
      }
    }
  }
  if (typeof chunk === 'number') {
    chunk = "" + chunk;
  }
  if (this.countWriten === 0) {
    this.headers();
  }
  if (!preserve) {
    this.countWriten++;
  }
  return stream.Transform.prototype.write.call(this, chunk, encoding, callback);
};

Stringifier.prototype._transform = function(chunk, encoding, callback) {
  this.push(chunk);
  return callback();
};

Stringifier.prototype.stringify = function(line) {
  var _line, column, columns, containsLinebreak, containsQuote, containsdelimiter, delimiter, escape, field, i, j, l, newLine, quote, ref, ref1, regexp;
  if (typeof line !== 'object') {
    return line;
  }
  columns = this.options.columns;
  if (typeof columns === 'object' && columns !== null && !Array.isArray(columns)) {
    columns = Object.keys(columns);
  }
  delimiter = this.options.delimiter;
  quote = this.options.quote;
  escape = this.options.escape;
  if (!Array.isArray(line)) {
    _line = [];
    if (columns) {
      for (i = j = 0, ref = columns.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        column = columns[i];
        _line[i] = typeof line[column] === 'undefined' || line[column] === null ? '' : line[column];
      }
    } else {
      for (column in line) {
        _line.push(line[column]);
      }
    }
    line = _line;
    _line = null;
  } else if (columns) {
    line.splice(columns.length);
  }
  if (Array.isArray(line)) {
    newLine = '';
    for (i = l = 0, ref1 = line.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      field = line[i];
      if (typeof field === 'string') {

      } else if (typeof field === 'number') {
        field = '' + field;
      } else if (typeof field === 'boolean') {
        field = field ? '1' : '';
      } else if (field instanceof Date) {
        field = '' + field.getTime();
      } else if (typeof field === 'object' && field !== null) {
        field = JSON.stringify(field);
      }
      if (field) {
        containsdelimiter = field.indexOf(delimiter) >= 0;
        containsQuote = field.indexOf(quote) >= 0;
        containsLinebreak = field.indexOf('\r') >= 0 || field.indexOf('\n') >= 0;
        if (containsQuote) {
          regexp = new RegExp(quote, 'g');
          field = field.replace(regexp, escape + quote);
        }
        if (containsQuote || containsdelimiter || containsLinebreak || this.options.quoted || (this.options.quotedString && typeof line[i] === 'string')) {
          field = quote + field + quote;
        }
        newLine += field;
      } else if (this.options.quotedEmpty || ((this.options.quotedEmpty == null) && line[i] === '' && this.options.quotedString)) {
        newLine += quote + quote;
      }
      if (i !== line.length - 1) {
        newLine += delimiter;
      }
    }
    line = newLine;
  }
  return line;
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/csv/node_modules/csv-stringify/lib/index.js","/../../node_modules/csv/node_modules/csv-stringify/lib")
},{"buffer":9,"oMfpAn":14,"stream":16,"util":24}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Generated by CoffeeScript 1.9.2
var Transformer, stream, util,
  slice = [].slice;

stream = require('stream');

util = require('util');

module.exports = function() {
  var argument, callback, data, error, handler, i, j, k, len, options, result, transform, type, v;
  options = {};
  for (i = j = 0, len = arguments.length; j < len; i = ++j) {
    argument = arguments[i];
    type = typeof argument;
    if (argument === null) {
      type = 'null';
    } else if (type === 'object' && Array.isArray(argument)) {
      type = 'array';
    }
    if (i === 0) {
      if (type === 'function') {
        handler = argument;
      } else if (type !== null) {
        data = argument;
      }
      continue;
    }
    if (type === 'object') {
      for (k in argument) {
        v = argument[k];
        options[k] = v;
      }
    } else if (type === 'function') {
      if (handler && i === arguments.length - 1) {
        callback = argument;
      } else {
        handler = argument;
      }
    } else if (type !== 'null') {
      throw new Error('Invalid arguments');
    }
  }
  transform = new Transformer(options, handler);
  error = false;
  if (data) {
    process.nextTick(function() {
      var l, len1, row;
      for (l = 0, len1 = data.length; l < len1; l++) {
        row = data[l];
        if (error) {
          break;
        }
        transform.write(row);
      }
      return transform.end();
    });
  }
  if (callback) {
    result = [];
    transform.on('readable', function() {
      var r, results;
      results = [];
      while ((r = transform.read())) {
        results.push(result.push(r));
      }
      return results;
    });
    transform.on('error', function(err) {
      error = true;
      return callback(err);
    });
    transform.on('end', function() {
      if (!error) {
        return callback(null, result);
      }
    });
  }
  return transform;
};

Transformer = function(options1, transform1) {
  var base;
  this.options = options1 != null ? options1 : {};
  this.transform = transform1;
  this.options.objectMode = true;
  if ((base = this.options).parallel == null) {
    base.parallel = 100;
  }
  stream.Transform.call(this, this.options);
  this.running = 0;
  this.started = 0;
  this.finished = 0;
  return this;
};

util.inherits(Transformer, stream.Transform);

module.exports.Transformer = Transformer;

Transformer.prototype._transform = function(chunk, encoding, cb) {
  var err;
  this.started++;
  this.running++;
  if (this.running < this.options.parallel) {
    cb();
    cb = null;
  }
  try {
    if (this.transform.length === 2) {
      this.transform.call(null, chunk, (function(_this) {
        return function() {
          var chunks, err;
          err = arguments[0], chunks = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          return _this._done(err, chunks, cb);
        };
      })(this));
    } else {
      this._done(null, [this.transform.call(null, chunk)], cb);
    }
    return false;
  } catch (_error) {
    err = _error;
    return this._done(err);
  }
};

Transformer.prototype._flush = function(cb) {
  this._ending = function() {
    if (this.running === 0) {
      return cb();
    }
  };
  return this._ending();
};

Transformer.prototype._done = function(err, chunks, cb) {
  var chunk, j, len;
  this.running--;
  if (err) {
    return this.emit('error', err);
  }
  this.finished++;
  for (j = 0, len = chunks.length; j < len; j++) {
    chunk = chunks[j];
    if (typeof chunk === 'number') {
      chunk = "" + chunk;
    }
    if (chunk != null) {
      this.push(chunk);
    }
  }
  if (cb) {
    cb();
  }
  if (this._ending) {
    return this._ending();
  }
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/csv/node_modules/stream-transform/lib/index.js","/../../node_modules/csv/node_modules/stream-transform/lib")
},{"buffer":9,"oMfpAn":14,"stream":16,"util":24}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")
},{"base64-js":10,"buffer":9,"ieee754":11,"oMfpAn":14}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")
},{"buffer":9,"oMfpAn":14}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")
},{"buffer":9,"oMfpAn":14}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/events/events.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/events")
},{"buffer":9,"oMfpAn":14}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/inherits/inherits_browser.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/inherits")
},{"buffer":9,"oMfpAn":14}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/process")
},{"buffer":9,"oMfpAn":14}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

module.exports = Duplex;
var inherits = require('inherits');
var setImmediate = require('process/browser.js').nextTick;
var Readable = require('./readable.js');
var Writable = require('./writable.js');

inherits(Duplex, Readable);

Duplex.prototype.write = Writable.prototype.write;
Duplex.prototype.end = Writable.prototype.end;
Duplex.prototype._write = Writable.prototype._write;

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  var self = this;
  setImmediate(function () {
    self.end();
  });
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify/duplex.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify")
},{"./readable.js":19,"./writable.js":21,"buffer":9,"inherits":13,"oMfpAn":14,"process/browser.js":17}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('./readable.js');
Stream.Writable = require('./writable.js');
Stream.Duplex = require('./duplex.js');
Stream.Transform = require('./transform.js');
Stream.PassThrough = require('./passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify")
},{"./duplex.js":15,"./passthrough.js":18,"./readable.js":19,"./transform.js":20,"./writable.js":21,"buffer":9,"events":12,"inherits":13,"oMfpAn":14}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify/node_modules/process/browser.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify/node_modules/process")
},{"buffer":9,"oMfpAn":14}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

module.exports = PassThrough;

var Transform = require('./transform.js');
var inherits = require('inherits');
inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify/passthrough.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify")
},{"./transform.js":20,"buffer":9,"inherits":13,"oMfpAn":14}],19:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Readable;
Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;
var Stream = require('./index.js');
var Buffer = require('buffer').Buffer;
var setImmediate = require('process/browser.js').nextTick;
var StringDecoder;

var inherits = require('inherits');
inherits(Readable, Stream);

function ReadableState(options, stream) {
  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = false;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // In streams that never have any data, and do push(null) right away,
  // the consumer can miss the 'end' event if they do some I/O before
  // consuming the stream.  So, we don't emit('end') until some reading
  // happens.
  this.calledRead = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (typeof chunk === 'string' && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null || chunk === undefined) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      // update the buffer info.
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) {
        state.buffer.unshift(chunk);
      } else {
        state.reading = false;
        state.buffer.push(chunk);
      }

      if (state.needReadable)
        emitReadable(stream);

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (isNaN(n) || n === null) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  var state = this._readableState;
  state.calledRead = true;
  var nOrig = n;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;

  // if we currently have less than the highWaterMark, then also read some
  if (state.length - n <= state.highWaterMark)
    doRead = true;

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading)
    doRead = false;

  if (doRead) {
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read called its callback synchronously, then `reading`
  // will be false, and we need to re-evaluate how much data we
  // can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we happened to read() exactly the remaining amount in the
  // buffer, and the EOF has been seen at this point, then make sure
  // that we emit 'end' on the very next tick.
  if (state.ended && !state.endEmitted && state.length === 0)
    endReadable(this);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode &&
      !er) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // if we've ended and we have some data left, then emit
  // 'readable' now to make sure it gets picked up.
  if (state.length > 0)
    emitReadable(stream);
  else
    endReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (state.emittedReadable)
    return;

  state.emittedReadable = true;
  if (state.sync)
    setImmediate(function() {
      emitReadable_(stream);
    });
  else
    emitReadable_(stream);
}

function emitReadable_(stream) {
  stream.emit('readable');
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    setImmediate(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    setImmediate(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    if (readable !== src) return;
    cleanup();
  }

  function onend() {
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (!dest._writableState || dest._writableState.needDrain)
      ondrain();
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  // check for listeners before emit removes one-time listeners.
  var errListeners = EE.listenerCount(dest, 'error');
  function onerror(er) {
    unpipe();
    if (errListeners === 0 && EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  dest.once('error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    // the handler that waits for readable events after all
    // the data gets sucked out in flow.
    // This would be easier to follow with a .once() handler
    // in flow(), but that is too slow.
    this.on('readable', pipeOnReadable);

    state.flowing = true;
    setImmediate(function() {
      flow(src);
    });
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var dest = this;
    var state = src._readableState;
    state.awaitDrain--;
    if (state.awaitDrain === 0)
      flow(src);
  };
}

function flow(src) {
  var state = src._readableState;
  var chunk;
  state.awaitDrain = 0;

  function write(dest, i, list) {
    var written = dest.write(chunk);
    if (false === written) {
      state.awaitDrain++;
    }
  }

  while (state.pipesCount && null !== (chunk = src.read())) {

    if (state.pipesCount === 1)
      write(state.pipes, 0, null);
    else
      forEach(state.pipes, write);

    src.emit('data', chunk);

    // if anyone needs a drain, then we have to wait for that.
    if (state.awaitDrain > 0)
      return;
  }

  // if every destination was unpiped, either before entering this
  // function, or in the while loop, then stop flowing.
  //
  // NB: This is a pretty rare edge case.
  if (state.pipesCount === 0) {
    state.flowing = false;

    // if there were data event listeners added, then switch to old mode.
    if (EE.listenerCount(src, 'data') > 0)
      emitDataEvents(src);
    return;
  }

  // at this point, no one needed a drain, so we just ran out of data
  // on the next readable event, start it over again.
  state.ranOut = true;
}

function pipeOnReadable() {
  if (this._readableState.ranOut) {
    this._readableState.ranOut = false;
    flow(this);
  }
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data' && !this._readableState.flowing)
    emitDataEvents(this);

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        this.read(0);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  emitDataEvents(this);
  this.read(0);
  this.emit('resume');
};

Readable.prototype.pause = function() {
  emitDataEvents(this, true);
  this.emit('pause');
};

function emitDataEvents(stream, startPaused) {
  var state = stream._readableState;

  if (state.flowing) {
    // https://github.com/isaacs/readable-stream/issues/16
    throw new Error('Cannot switch to old mode now.');
  }

  var paused = startPaused || false;
  var readable = false;

  // convert to an old-style stream.
  stream.readable = true;
  stream.pipe = Stream.prototype.pipe;
  stream.on = stream.addListener = Stream.prototype.on;

  stream.on('readable', function() {
    readable = true;

    var c;
    while (!paused && (null !== (c = stream.read())))
      stream.emit('data', c);

    if (c === null) {
      readable = false;
      stream._readableState.needReadable = true;
    }
  });

  stream.pause = function() {
    paused = true;
    this.emit('pause');
  };

  stream.resume = function() {
    paused = false;
    if (readable)
      setImmediate(function() {
        stream.emit('readable');
      });
    else
      this.read(0);
    this.emit('resume');
  };

  // now make it start, just in case it hadn't already.
  stream.emit('readable');
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    if (state.decoder)
      chunk = state.decoder.write(chunk);
    if (!chunk || !state.objectMode && !chunk.length)
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (typeof stream[i] === 'function' &&
        typeof this[i] === 'undefined') {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, function (x) {
      return self.emit.apply(self, ev, x);
    });
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted && state.calledRead) {
    state.ended = true;
    setImmediate(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify/readable.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify")
},{"./index.js":16,"buffer":9,"events":12,"inherits":13,"oMfpAn":14,"process/browser.js":17,"string_decoder":22}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

module.exports = Transform;

var Duplex = require('./duplex.js');
var inherits = require('inherits');
inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined)
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  var ts = this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('finish', function() {
    if ('function' === typeof this._flush)
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (ts.writechunk && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var rs = stream._readableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify/transform.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify")
},{"./duplex.js":15,"buffer":9,"inherits":13,"oMfpAn":14}],21:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;
Writable.WritableState = WritableState;

var isUint8Array = typeof Uint8Array !== 'undefined'
  ? function (x) { return x instanceof Uint8Array }
  : function (x) {
    return x && x.constructor && x.constructor.name === 'Uint8Array'
  }
;
var isArrayBuffer = typeof ArrayBuffer !== 'undefined'
  ? function (x) { return x instanceof ArrayBuffer }
  : function (x) {
    return x && x.constructor && x.constructor.name === 'ArrayBuffer'
  }
;

var inherits = require('inherits');
var Stream = require('./index.js');
var setImmediate = require('process/browser.js').nextTick;
var Buffer = require('buffer').Buffer;

inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];
}

function Writable(options) {
  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Stream.Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  setImmediate(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    setImmediate(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (!Buffer.isBuffer(chunk) && isUint8Array(chunk))
    chunk = new Buffer(chunk);
  if (isArrayBuffer(chunk) && typeof Uint8Array !== 'undefined')
    chunk = new Buffer(new Uint8Array(chunk));
  
  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb))
    ret = writeOrBuffer(this, state, chunk, encoding, cb);

  return ret;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  state.needDrain = !ret;

  if (state.writing)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    setImmediate(function() {
      cb(er);
    });
  else
    cb(er);

  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished && !state.bufferProcessing && state.buffer.length)
      clearBuffer(stream, state);

    if (sync) {
      setImmediate(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  cb();
  if (finished)
    finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;

  for (var c = 0; c < state.buffer.length; c++) {
    var entry = state.buffer[c];
    var chunk = entry.chunk;
    var encoding = entry.encoding;
    var cb = entry.callback;
    var len = state.objectMode ? 1 : chunk.length;

    doWrite(stream, state, len, chunk, encoding, cb);

    // if we didn't call the onwrite immediately, then
    // it means that we need to wait until it does.
    // also, that means that the chunk and cb are currently
    // being processed, so move the buffer counter past them.
    if (state.writing) {
      c++;
      break;
    }
  }

  state.bufferProcessing = false;
  if (c < state.buffer.length)
    state.buffer = state.buffer.slice(c);
  else
    state.buffer.length = 0;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (typeof chunk !== 'undefined' && chunk !== null)
    this.write(chunk, encoding);

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    state.finished = true;
    stream.emit('finish');
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      setImmediate(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify/writable.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/stream-browserify")
},{"./index.js":16,"buffer":9,"inherits":13,"oMfpAn":14,"process/browser.js":17}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

function assertEncoding(encoding) {
  if (encoding && !Buffer.isEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  this.charBuffer = new Buffer(6);
  this.charReceived = 0;
  this.charLength = 0;
};


StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  var offset = 0;

  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var i = (buffer.length >= this.charLength - this.charReceived) ?
                this.charLength - this.charReceived :
                buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, offset, i);
    this.charReceived += (i - offset);
    offset = i;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (i == buffer.length) return charStr;

    // otherwise cut off the characters end from the beginning of this buffer
    buffer = buffer.slice(i, buffer.length);
    break;
  }

  var lenIncomplete = this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - lenIncomplete, end);
    this.charReceived = lenIncomplete;
    end -= lenIncomplete;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    this.charBuffer.write(charStr.charAt(charStr.length - 1), this.encoding);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }

  return i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 2;
  this.charLength = incomplete ? 2 : 0;
  return incomplete;
}

function base64DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 3;
  this.charLength = incomplete ? 3 : 0;
  return incomplete;
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/string_decoder/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/string_decoder")
},{"buffer":9,"oMfpAn":14}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/util/support/isBufferBrowser.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/util/support")
},{"buffer":9,"oMfpAn":14}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/util/util.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/util")
},{"./support/isBuffer":23,"buffer":9,"inherits":13,"oMfpAn":14}],25:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var CadenceCounter = require('../../lib/cadenceCounter');
var Baconifier = require('../../lib/baconifier');

var stream = require('stream');
var bacon = require('baconjs');

var points = "x,y,z\n-24,-48,-840\n-40,-48,-856\n-48,-48,-904\n-56,-48,-912\n-64,-40,-912\n-72,-32,-904\n-88,-24,-920\n-104,-24,-928\n-136,-40,-944\n-176,-56,-944\n-192,-64,-960\n-192,-72,-960\n-176,-80,-936\n-168,-88,-952\n-168,-104,-944\n-176,-104,-928\n-176,-104,-952\n-176,-104,-952\n-136,-96,-976\n-104,-88,-976\n-104,-96,-968\n-112,-136,-968\n-232,-80,-1064\n-152,-128,-968\n-56,-128,-1016\n-8,-160,-1016\n-24,-160,-1040\n-8,-128,-1080\n-8,-136,-1032\n40,-136,-984\n80,-160,-944\n112,-168,-952\n136,-152,-960\n152,-144,-1008\n168,-136,-1008\n160,-160,-1000\n160,-168,-1008\n160,-176,-1024\n176,-184,-1080\n224,-200,-1112\n328,-224,-1192\n456,-256,-1248\n592,-304,-1352\n680,-336,-1488\n704,-296,-1592\n712,-240,-1688\n712,-168,-1808\n680,-80,-1872\n624,-8,-1864\n592,64,-1800\n536,104,-1688\n488,104,-1568\n344,184,-1592\n264,160,-1408\n184,168,-1368\n104,184,-1352\n104,160,-1392\n104,152,-1208\n64,152,-1216\n-8,144,-1096\n-88,88,-1024\n-144,56,-888\n-176,40,-744\n-184,16,-640\n-200,8,-512\n-192,24,-440\n-192,32,-376\n-192,32,-312\n-192,16,-256\n-200,0,-216\n-216,-32,-168\n-216,-56,-128\n-216,-104,-112\n-192,-120,-96\n-176,-136,-104\n-168,-160,-120\n-152,-176,-176\n-144,-184,-248\n-136,-192,-344\n-128,-176,-448\n-136,-144,-544\n-160,-104,-736\n-176,-40,-1032\n-192,88,-1400\n-176,256,-1920\n-136,488,-2192\n-112,672,-2216\n-72,784,-2152\n-56,936,-2224\n-8,1144,-2304\n8,1328,-2344\n8,1416,-2288\n-40,1376,-2136\n-96,1264,-1928\n-128,1104,-1728\n-168,976,-1504\n-192,832,-1320\n-200,712,-1072\n-192,616,-848\n-152,536,-584\n-96,464,-336\n-32,400,-80\n16,328,152\n72,232,336\n120,152,296\n152,40,280\n144,-112,208\n136,-288,112\n136,-512,184\n128,-664,472\n112,-672,560\n128,-560,552\n176,-440,472\n272,-352,352\n400,-320,272\n552,-368,240\n696,-440,248\n816,-520,376\n936,-560,432\n1064,-472,200\n1320,0,-256\n1760,1752,-1552\n2560,2920,-1000\n3320,3496,-1232\n3568,3784,-632\n2936,3888,-288\n2224,3656,-128\n1672,3328,24\n1216,2936,112\n792,2536,144\n376,2160,224\n-32,1800,256\n-384,1504,400\n-784,1264,376\n-1136,1064,344\n-1416,944,168\n-1536,848,-24\n-1512,744,-152\n-1360,656,-232\n-1160,560,-296\n-992,448,-312\n-896,344,-256\n-920,248,-160\n-1000,176,-160\n-1096,136,-128\n-1136,104,-112\n-1120,64,-56\n-1032,24,-96\n-912,-8,-144\n-768,-16,-184\n-656,-8,-240\n-576,32,-304\n-512,168,-336\n-472,440,-400\n-432,968,-384\n-400,1736,-512\n-616,2600,-408\n-808,3336,88\n-648,3712,56\n-304,3896,0\n160,3984,-176\n584,4032,-400\n864,4056,-280\n1104,3920,160\n1408,3408,512\n1656,2712,840\n1840,1904,1240\n1920,1144,976\n1784,536,544\n1512,112,232\n1232,-280,-16\n864,-560,-64\n536,-728,88\n376,-864,200\n472,-1024,168\n712,-1192,168\n968,-1392,176\n1120,-1576,128\n1184,-1592,160\n1120,-1488,136\n1040,-1312,136\n984,-1144,152\n984,-944,176\n1016,-776,224\n1088,-632,264\n1184,-528,280\n1272,-424,248\n1344,-296,208\n1392,-144,152\n1424,184,304\n1680,1176,-296\n1984,2624,-528\n2744,3352,-400\n3168,3712,-144\n2808,3896,-304\n2216,3984,-248\n1760,4000,-184\n1424,3768,8\n1080,3432,144\n720,3080,168\n344,2728,144\n-8,2344,184\n-352,1984,64\n-664,1616,168\n-952,1296,216\n-1240,1064,144\n-1528,880,40\n-1776,800,-40\n-1864,712,-96\n-1768,600,-208\n-1592,520,-288\n-1440,432,-352\n-1352,360,-336\n-1320,304,-296\n-1288,264,-216\n-1232,232,-176\n-1120,200,-112\n-976,168,-64\n-824,160,0\n-672,168,-40\n-512,232,40\n-360,400,24\n-200,808,-16\n-152,1480,136\n-280,2224,-56\n-368,3032,216\n-136,3560,56\n232,3816,432\n616,3944,704\n1032,4016,664\n1488,4016,688\n1920,3520,728\n2096,2792,648\n2000,2040,504\n1656,1464,384\n1256,1056,216\n888,768,168\n584,496,48\n376,240,0\n264,-24,-16\n280,-392,-216\n408,-736,40\n584,-984,40\n792,-1184,0\n1000,-1384,-48\n1128,-1520,-120\n1104,-1504,-152\n1008,-1392,-160\n904,-1224,-80\n824,-1064,-8\n808,-936,64\n864,-832,120\n968,-728,72\n1064,-632,-24\n1160,-528,-24\n1216,-408,-72\n1232,-208,-120\n1392,336,168\n1512,1808,-208\n1768,2944,64\n2632,3512,496\n2928,3792,64\n2456,3936,-144\n1840,4008,-232\n1432,3760,-136\n1088,3328,72\n736,2880,208\n376,2440,288\n64,1992,400\n-216,1608,432\n-456,1320,512\n-656,1096,432\n-880,936,240\n-1056,760,176\n-1352,656,-136\n-1544,544,-208\n-1608,432,-304\n-1544,312,-536\n-1456,224,-512\n-1392,184,-456\n-1480,168,-368\n-1584,152,-296\n-1624,96,-184\n-1512,24,-144\n-1320,-48,-64\n-1120,-80,-16\n-952,-96,64\n-808,-16,160\n-704,120,160\n-576,512,352\n-512,1376,-64\n-720,2264,-64\n-1136,3160,864\n-1032,3616,304\n-520,3848,600\n-64,3960,888\n408,4024,888\n856,4048,944\n1360,3896,984\n1960,3288,1080\n2248,2376,984\n2272,1472,632\n1992,864,288\n1568,480,-48\n1160,160,-192\n832,-128,-256\n632,-384,-16\n568,-624,0\n648,-840,8\n824,-1016,32\n1008,-1200,96\n1096,-1384,96\n1232,-1504,48\n1240,-1488,80\n1176,-1384,112\n1104,-1256,152\n1048,-1120,184\n1048,-960,168\n1072,-816,112\n1120,-680,88\n1160,-552,64\n1192,-440,88\n1184,-312,232\n1208,-72,432\n1480,800,408\n1824,2440,-8\n2512,3256,-88\n3064,3672,-120\n2760,3872,-464\n2200,3976,-408\n1792,4024,-96\n1416,3816,232\n1032,3352,376\n640,2856,360\n280,2408,264\n-56,1992,280\n-376,1624,152\n-664,1320,152\n-920,1048,64\n-1120,856,-128\n-1264,720,-224\n-1280,616,-280\n-1216,472,-328\n-1152,344,-264\n-1176,256,-192\n-1304,184,-152\n-1448,144,-136\n-1536,160,-120\n-1584,136,-240\n-1512,120,-328\n-1344,112,-352\n-1216,104,-304\n-1096,104,-232\n-1000,128,-88\n-920,216,16\n-856,392,104\n-808,712,256\n-672,1312,136\n-688,2096,-16\n-872,2744,232\n-936,3408,656\n-624,3744,512\n-176,3912,352\n280,3992,480\n656,4040,544\n1096,4056,776\n1728,3944,920\n2280,3248,1456\n2648,2248,1232\n2504,1424,856\n2064,896,408\n1600,552,56\n1168,208,-392\n800,-168,-408\n536,-408,-104\n464,-512,-48\n600,-616,-64\n856,-752,-48\n1104,-1000,0\n1272,-1256,-8\n1352,-1488,48\n1288,-1536,96\n1152,-1472,168\n1032,-1360,240\n968,-1216,264\n976,-1088,304\n1024,-936,288\n1088,-760,296\n1144,-592,296\n1160,-448,328\n1128,-312,352\n1128,-104,416\n1248,496,488\n1488,2288,-720\n1824,3184,-264\n2520,3632,16\n2656,3856,-296\n2312,3968,-432\n1920,4024,-376\n1512,3952,-80\n1088,3448,120\n656,2920,224\n256,2440,224\n-128,2024,112\n-472,1648,56\n-704,1264,-8\n-1040,1032,-88\n-1320,848,-264\n-1464,688,-408\n-1528,552,-456\n-1528,424,-520\n-1456,296,-520\n-1408,184,-512\n-1456,136,-416\n-1568,112,-376\n-1648,112,-344\n-1624,96,-376\n-1480,56,-416\n-1296,48,-376\n-1144,72,-312\n-1008,144,-232\n-872,264,-136\n-776,440,-104\n-696,704,-72\n-632,1184,96\n-624,1976,120\n-760,2840,8\n-736,3456,16\n-344,3768,-240\n160,3920,-128\n568,4000,248\n1016,4040,448\n1544,3848,504\n1976,3304,704\n2128,2600,768\n2104,1896,480\n1816,1424,184\n1408,1104,-48\n1040,824,-280\n720,600,-288\n536,376,-240\n488,168,-88\n608,-80,-40\n848,-448,-88\n1168,-776,-56\n1424,-1056,-32\n1512,-1296,16\n1456,-1472,48\n1256,-1560,64\n1032,-1528,120\n848,-1408,136\n784,-1288,120\n816,-1136,80\n920,-976,32\n1056,-816,-16\n1160,-656,0\n1216,-480,-8\n1216,-240,-40\n1248,256,80\n1352,1856,-248\n1440,2968,-552\n2104,3520,352\n2488,3800,-240\n2216,3936,-720\n1816,4008,-624\n1504,3896,-440\n1136,3392,-176\n736,2824,40\n344,2296,112\n-8,1832,168\n-312,1472,208\n-560,1192,144\n-760,952,128\n-944,768,40\n-1096,616,-48\n-1232,472,-128\n-1240,384,-184\n-1200,288,-264\n-1152,208,-416\n-1152,120,-384\n-1200,104,-368\n-1296,104,-376\n-1408,136,-344\n-1464,160,-312\n-1408,144,-272\n-1288,96,-248\n-1184,16,-152\n-1104,-48,-56\n-1040,-56,40\n-968,16,168\n-928,184,368\n-896,608,416\n-864,1752,168\n-1112,2728,136\n-1280,3400,528\n-824,3744,72\n-128,3912,256\n336,3992,896\n784,4032,928\n1408,3984,792\n1952,3360,1136\n2288,2416,856\n2296,1632,672\n1936,1120,432\n1480,800,216\n1040,600,-200\n640,408,-368\n320,240,-320\n136,80,-56\n144,-72,-8\n304,-272,-56\n552,-528,-80\n848,-784,-104\n1048,-1048,-40\n1176,-1296,16\n1176,-1416,88\n1096,-1368,184\n1016,-1272,240\n968,-1208,320\n960,-1128,360\n976,-992,336\n1000,-840,240\n1024,-688,184\n1016,-496,128\n1024,-240,112\n1096,256,184\n1320,1968,-424\n1416,3024,-112\n2104,3552,512\n2424,3816,280\n2096,3944,40\n1664,4008,-160\n1312,3912,-104\n920,3512,32\n512,3016,176\n120,2536,232\n-208,2096,264\n-488,1712,224\n-696,1376,256\n-848,1064,168\n-976,832,64\n-1064,672,0\n-1104,552,-80\n-1112,464,-216\n-1136,376,-200\n-1152,272,-224\n-1184,168,-176\n-1264,96,-112\n-1360,80,-88\n-1456,56,-80\n-1448,64,-56\n-1416,16,-64\n-1320,-56,-32\n-1200,-136,16\n-1088,-168,8\n-976,-120,104\n-896,0,192\n-856,216,288\n-832,560,184\n-896,1344,272\n-1032,2232,192\n-1256,3096,784\n-1208,3584,456\n-760,3832,256\n-128,3952,384\n392,4016,472\n736,4048,528\n1128,3888,608\n1560,3280,776\n1824,2496,744\n1880,1704,528\n1736,1096,280\n1464,680,40\n1168,400,-200\n904,168,-384\n688,-40,-456\n568,-248,-328\n568,-392,-256\n744,-528,-264\n960,-656,-112\n1160,-800,-64\n1232,-952,8\n1224,-1072,128\n1120,-1096,240\n1008,-1064,336\n936,-1008,432\n928,-944,464\n968,-848,416\n1032,-744,320\n1096,-632,192\n1136,-528,112\n1144,-416,64\n1120,-280,56\n1120,-80,120\n1208,408,8\n1400,1808,-504\n1672,2944,-408\n2360,3512,72\n2496,3792,72\n2024,3936,-88\n1504,4008,-96\n1104,4040,48\n720,3800,152\n336,3296,296\n-40,2768,384\n-416,2264,336\n-776,1848,296\n-1216,1520,144\n-1640,1288,-88\n-1904,1120,-160\n-1856,952,-272\n-1600,736,-336\n-1400,576,-288\n-1328,496,-216\n-1416,456,-176\n-1544,440,-168\n-1616,400,-160\n-1584,312,-184\n-1464,192,-224\n-1296,72,-272\n-1160,-16,-240\n-1024,-48,-120\n-912,-32,-24\n-824,32,96\n-760,136,136\n-704,320,184\n-680,624,288\n-680,1216,208\n-856,1872,88\n-1128,2592,264\n-1192,3336,416\n-904,3704,368\n-536,3896,296\n-152,3984,608\n320,4032,400\n584,4056,576\n872,3856,752\n1248,3280,808\n1560,2592,984\n1744,1880,1000\n1808,1232,488\n1704,784,200\n1488,480,-80\n1184,216,-320\n816,-8,-112\n616,-208,80\n616,-432,136\n800,-696,176\n1032,-992,232\n1248,-1248,264\n1360,-1392,320\n1344,-1392,432\n1296,-1336,360\n1248,-1272,360\n1208,-1176,360\n1184,-1048,336\n1176,-888,304\n1168,-720,224\n1160,-560,176\n1136,-424,160\n1080,-272,224\n1048,-16,376\n1144,736,264\n1336,2408,-416\n1720,3240,264\n2264,3656,280\n2216,3872,-232\n1840,3976,-440\n1480,4024,-296\n1112,3928,-24\n704,3464,200\n288,2944,320\n-120,2456,408\n-504,2032,400\n-800,1680,344\n-1048,1416,304\n-1256,1232,136\n-1352,1064,64\n-1344,904,-40\n-1304,736,-104\n-1248,568,-160\n-1208,400,-200\n-1208,264,-216\n-1264,144,-280\n-1336,80,-256\n-1408,56,-216\n-1528,24,-200\n-1592,-32,-208\n-1552,-120,-168\n-1456,-192,-96\n-1312,-176,-32\n-1184,-96,40\n-1096,32,104\n-1064,240,248\n-1024,600,336\n-1112,1472,224\n-1240,2576,280\n-1440,3328,384\n-1176,3704,384\n-664,3888,368\n-112,3984,560\n368,4032,792\n736,4056,768\n1088,3808,712\n1384,3184,792\n1624,2472,904\n1736,1728,760\n1712,1128,504\n1544,704,264\n1320,448,-80\n1048,272,-272\n816,112,-200\n712,-40,-40\n768,-256,48\n960,-496,24\n1224,-800,136\n1392,-1128,192\n1480,-1352,296\n1400,-1392,392\n1256,-1344,472\n1136,-1320,472\n1040,-1256,488\n1000,-1144,464\n992,-992,400\n1016,-808,280\n1056,-616,192\n1064,-432,144\n1056,-240,136\n1072,56,144\n1152,856,56\n1200,2464,-632\n1512,3272,-128\n1920,3672,240\n1776,3880,-304\n1376,3976,-440\n1064,4024,-336\n784,3968,-120\n472,3472,56\n136,2888,176\n-184,2344,208\n-496,1872,208\n-768,1504,264\n-1000,1192,176\n-1184,984,0\n-1304,808,-80\n-1328,672,-232\n-1320,552,-256\n-1288,392,-368\n-1304,272,-360\n-1392,208,-352\n-1552,200,-352\n-1696,224,-312\n-1776,224,-280\n-1736,176,-280\n-1592,80,-192\n-1400,-8,-160\n-1232,-48,-168\n-1096,-32,-128\n-992,16,-48\n-920,120,-24\n-880,272,56\n-880,536,144\n-920,1120,232\n-952,2008,-128\n-1176,3040,168\n-1216,3560,136\n-912,3816,184\n-376,3952,384\n176,4016,536\n480,4048,712\n800,4064,504\n1144,3520,544\n1432,2808,656\n1672,1992,624\n1808,1224,488\n1768,576,416\n1576,96,240\n1288,-200,224\n1032,-456,224\n888,-640,208\n888,-864,200\n1000,-1072,152\n1128,-1240,144\n1216,-1320,176\n1304,-1344,224\n1352,-1336,264\n1344,-1288,384\n1320,-1200,448\n1312,-1112,520\n1304,-984,464\n1296,-816,408\n1280,-624,264\n1256,-456,160\n1224,-312,72\n1168,-152,96\n1144,88,256\n1200,904,272\n1320,2488,-280\n1816,3288,-64\n2360,3680,264\n2208,3880,-304\n1688,3976,-304\n1296,4032,-128\n960,3872,16\n600,3408,160\n248,2880,208\n-80,2368,248\n-360,1904,272\n-576,1512,296\n-760,1168,320\n-936,936,264\n-1072,792,184\n-1152,688,40\n-1192,616,-72\n-1160,544,-256\n-1112,416,-280\n-1080,272,-168\n-1128,168,-88\n-1216,128,-56\n-1392,128,-24\n-1512,128,-24\n-1592,72,-96\n-1512,-16,-128\n-1352,-88,-88\n-1168,-104,-64\n-1024,-40,24\n-936,56,80\n-912,208,192\n-912,448,272\n-968,872,280\n-1040,1560,152\n-1112,2432,184\n-1232,3248,352\n-1112,3664,296\n-728,3872,512\n-224,3976,360\n248,4024,424\n560,4056,648\n904,3800,752\n1272,3240,848\n1632,2536,984\n1896,1760,664\n1968,1064,344\n1800,584,72\n1528,264,-240\n1200,8,-416\n960,-200,-392\n856,-392,-280\n936,-640,-200\n1072,-928,-48\n1192,-1168,128\n1272,-1360,176\n1280,-1456,304\n1264,-1440,448\n1280,-1416,424\n1288,-1344,424\n1304,-1200,440\n1312,-1016,336\n1304,-792,224\n1280,-592,120\n1208,-384,0\n1144,-112,40\n1104,376,-120\n1104,1864,-288\n1216,2968,-312\n1992,3528,368\n2392,3800,0\n2096,3936,-464\n1712,4008,-400\n1384,3856,-192\n1032,3384,0\n648,2840,120\n296,2312,168\n-32,1856,288\n-312,1512,272\n-552,1232,288\n-784,992,272\n-992,824,184\n-1184,712,48\n-1288,632,-88\n-1280,584,-144\n-1224,504,-216\n-1176,368,-336\n-1184,200,-256\n-1256,64,-224\n-1344,8,-128\n-1528,8,-56\n-1664,40,-56\n-1672,32,-56\n-1536,0,-48\n-1360,-56,32\n-1208,-72,48\n-1112,-48,96\n-1048,48,168\n-992,216,232\n-984,528,328\n-1000,1024,296\n-992,1888,-16\n-1128,2824,128\n-1208,3448,304\n-1016,3768,80\n-560,3920,-64\n-24,4000,232\n408,4040,416\n760,4056,464\n1200,3784,616\n1720,3200,1016\n2216,2328,1136\n2472,1464,720\n2312,904,416\n1920,584,152\n1456,336,-144\n960,32,-304\n528,-152,-64\n280,-312,88\n320,-536,128\n512,-736,176\n744,-1016,272\n1024,-1328,296\n1208,-1544,368\n1312,-1632,360\n1360,-1592,472\n1344,-1440,512\n1312,-1264,504\n1264,-1080,576\n1248,-872,488\n1248,-696,416\n1264,-544,328\n1280,-392,328\n1304,-272,312\n1328,-88,392\n1384,296,320\n1552,1832,144\n2024,2952,208\n2896,3520,816\n2904,3800,248\n2440,3936,-376\n2032,4008,-608\n1696,4040,-416\n1288,3792,-176\n832,3272,40\n376,2736,256\n-40,2272,400\n-360,1872,472\n-656,1568,480\n-944,1392,376\n-1240,1320,184\n-1512,1296,-144\n-1704,1248,-360\n-1688,1160,-600\n-1496,976,-528\n-1352,784,-464\n-1320,632,-408\n-1424,504,-400\n-1560,440,-264\n-1656,368,-160\n-1616,272,-144\n-1512,168,-96\n-1360,80,-144\n-1216,32,-104\n-1104,40,-32\n-992,88,32\n-832,176,120\n-768,328,136\n-712,568,176\n-656,960,128\n-768,1512,64\n-1000,2088,128\n-1176,2760,536\n-1160,3416,592\n-864,3752,480\n-416,3912,640\n176,3992,664\n528,4040,1064\n1032,4056,936\n1680,3632,1280\n2256,2776,1128\n2520,1840,808\n2328,1176,512\n1904,752,224\n1472,456,-16\n1120,184,-240\n840,-48,-280\n680,-184,-168\n736,-328,-128\n920,-464,-152\n1192,-664,-168\n1400,-872,-16\n1480,-1072,56\n1496,-1256,360\n1424,-1336,424\n1304,-1352,456\n1176,-1304,448\n1072,-1192,488\n984,-1032,448\n944,-840,328\n936,-632,232\n944,-440,160\n952,-240,120\n1000,96,264\n1160,1176,648\n1320,2624,-144\n1720,3352,592\n1904,3712,560\n1768,3896,232\n1544,3984,-96\n1360,4032,-104\n1104,3920,32\n720,3360,112\n304,2712,160\n-104,2136,200\n-496,1672,264\n-848,1312,360\n-1072,1024,504\n-1240,856,336\n-1368,776,136\n-1488,760,-256\n-1536,656,-168\n-1504,496,-16\n-1432,288,24\n-1440,120,-112\n-1536,40,-216\n-1688,8,-152\n-1752,16,-144\n-1656,48,-208\n-1456,72,-232\n-1264,136,-176\n-1112,200,-80\n-992,264,64\n-888,360,224\n-824,504,336\n-784,712,496\n-784,1112,640\n-824,1872,544\n-1000,2832,488\n-992,3456,624\n-672,3768,808\n-192,3920,888\n216,4000,1544\n784,4040,1144\n1520,4056,1096\n2376,3592,1072\n2872,2720,752\n2776,1928,504\n2248,1392,264\n1664,952,128\n1200,632,-16\n832,352,-112\n576,128,-56\n464,-72,128\n536,-256,112\n752,-488,80\n1024,-736,56\n1216,-968,216\n1392,-1240,264\n1424,-1416,328\n1336,-1496,464\n1216,-1512,544\n1128,-1472,640\n1096,-1376,600\n1112,-1232,544\n1176,-1080,392\n1224,-912,256\n1264,-736,128\n1256,-560,96\n1232,-352,168\n1256,40,800\n1464,1696,632\n1848,2888,920\n2424,3480,1376\n2424,3784,416\n2216,3928,-280\n2032,4000,-696\n1736,4040,-296\n1272,3776,72\n688,3304,360\n120,2848,496\n-400,2432,592\n-832,2080,688\n-1176,1816,648\n-1448,1704,512\n-1568,1552,344\n-1640,1368,152\n-1624,1160,24\n-1600,944,-168\n-1608,720,-336\n-1720,448,-312\n-1872,304,-328\n-1960,328,-392\n-1960,392,-280\n-1840,400,-256\n-1672,392,-216\n-1456,360,-168\n-1288,320,-88\n-1128,296,-16\n-976,288,56\n-848,328,176\n-728,400,296\n-656,584,416\n-616,960,496\n-664,1632,184\n-904,2560,416\n-1104,3320,656\n-984,3696,544\n-600,3888,648\n-40,3984,920\n336,4032,1456\n944,4056,1096\n1600,3744,1376\n2160,2968,1392\n2424,2016,1032\n2328,1256,688\n1960,824,392\n1504,520,-24\n1064,256,-360\n672,48,-280\n448,-112,160\n448,-272,88\n656,-528,144\n944,-816,248\n1208,-1080,256\n1424,-1312,152\n1504,-1400,128\n1432,-1384,168\n1288,-1296,168\n1152,-1160,248\n1048,-1016,344\n1016,-848,352\n1048,-664,312\n1128,-488,216\n1200,-320,152\n1232,-168,144\n1208,-24,152\n1136,168,216\n1160,728,40\n1152,2400,-672\n1360,3240,-176\n1872,3656,480\n2040,3872,-64\n1816,3976,-328\n1520,4024,-408\n1240,3816,-224\n888,3328,56\n480,2824,272\n72,2392,400\n-312,2000,504\n-632,1704,584\n-864,1472,544\n-1024,1304,400\n-1120,1152,288\n-1144,1008,136\n-1096,872,-16\n-1024,728,-184\n-928,584,-360\n-864,448,-360\n-864,288,-256\n-952,160,-176\n-1104,80,-104\n-1312,32,-32\n-1456,0,-16\n-1584,-24,-144\n-1544,-56,-136\n-1384,-96,-160\n-1200,-104,-128\n-1040,-48,-48\n-944,56,88\n-864,184,216\n-872,384,296\n-880,712,336\n-912,1184,384\n-976,1856,512\n-1064,2720,584\n-1080,3400,696\n-816,3736,544\n-336,3912,888\n168,3992,1152\n576,4032,1320\n1104,4056,1248\n1688,3552,1320\n2168,2712,1192\n2304,1872,632\n2024,1272,304\n1544,920,40\n1104,632,-248\n704,384,-328\n464,168,-208\n400,-32,-200\n496,-264,-232\n696,-624,-128\n904,-912,-160\n1016,-1168,-24\n1136,-1432,184\n1184,-1600,240\n1136,-1600,384\n1072,-1536,424\n1008,-1392,520\n992,-1216,480\n1000,-992,416\n1016,-760,320\n1040,-552,224\n1064,-384,136\n1072,-232,80\n1072,-80,136\n1040,264,136\n1192,1696,-64\n1392,2888,104\n2144,3480,912\n2592,3784,456\n2472,3928,-168\n2120,4000,-496\n1728,4040,-296\n1264,3608,-56\n760,3056,184\n312,2552,280\n-80,2144,320\n-400,1792,400\n-664,1504,432\n-848,1272,424\n-984,1096,368\n-1088,944,184\n-1160,808,16\n-1208,632,-24\n-1240,472,-120\n-1184,328,-248\n-1144,136,-384\n-1168,0,-264\n-1240,0,-240\n-1424,64,-240\n-1600,136,-144\n-1640,168,-128\n-1528,176,-88\n-1352,176,-24\n-1192,176,24\n-1072,192,64\n-992,224,160\n-936,296,256\n-888,488,336\n-888,816,248\n-888,1400,112\n-904,2000,312\n-968,2616,376\n-1000,3320,712\n-856,3696,792\n-552,3888,840\n-176,3984,1088\n184,4032,1176\n544,4056,1152\n936,3960,1056\n1280,3416,976\n1520,2728,936\n1712,1944,696\n1768,1264,400\n1616,704,296\n1416,288,216\n1224,-104,160\n1096,-480,232\n1080,-808,240\n1160,-1120,328\n1288,-1424,400\n1464,-1704,400\n1512,-1808,400\n1472,-1736,464\n1408,-1616,504\n1368,-1464,544\n1360,-1288,560\n1392,-1096,552\n1416,-880,472\n1448,-672,384\n1464,-464,288\n1472,-232,256\n1504,160,464\n1576,1504,504\n1776,2792,312\n2144,3432,1040\n2200,3760,624\n1880,3920,176\n1576,4000,-216\n1376,4040,-144\n1104,3880,0\n720,3336,184\n312,2752,368\n-72,2264,416\n-432,1856,536\n-688,1504,592\n-896,1272,592\n-1112,1128,496\n-1312,1016,336\n-1432,936,240\n-1448,792,224\n-1416,648,40\n-1320,520,-128\n-1240,336,-232\n-1272,200,-168\n-1408,152,-168\n-1608,216,-144\n-1704,288,-144\n-1632,288,-128\n-1464,248,-152\n-1280,192,-136\n-1128,152,-72\n-992,168,-32\n-896,232,32\n-824,304,160\n-760,424,296\n-728,648,472\n-768,1232,536\n-904,2296,200\n-1080,3128,416\n-920,3600,552\n-512,3840,776\n0,3960,904\n448,4016,1280\n1008,4048,976\n1640,3696,1168\n2248,2912,1040\n2568,2096,768\n2360,1456,512\n1872,1008,272\n1368,696,24\n880,432,-336\n432,272,-328\n152,128,-192\n24,24,-128\n32,-120,-104\n192,-296,-216\n432,-504,-136\n688,-704,-152\n856,-888,-64\n984,-1016,-24\n1048,-1112,-40\n1040,-1064,40\n1008,-984,160\n968,-864,232\n928,-752,184\n912,-680,304\n928,-576,256\n928,-456,144\n928,-352,80\n904,-248,56\n888,-80,96\n896,328,184\n952,1912,-152\n944,2992,328\n1496,3536,992\n1856,3808,568\n1688,3944,152\n1400,4008,-160\n1160,3728,-256\n848,3256,-144\n480,2744,88\n112,2256,256\n-216,1816,368\n-520,1448,432\n-760,1160,432\n-960,944,344\n-1104,776,136\n-1240,624,-80\n-1208,512,-224\n-1120,400,-264\n-1016,288,-320\n-928,192,-368\n-920,136,-312\n-1016,88,-296\n-1216,72,-208\n-1432,48,-152\n-1632,8,-192\n-1656,-56,-176\n-1512,-112,-272\n-1328,-152,-168\n-1184,-128,-48\n-1112,-56,72\n-1080,56,160\n-1072,272,312\n-1152,616,320\n-1280,1392,496\n-1320,2440,328\n-1328,3256,520\n-1144,3672,448\n-624,3872,880\n0,3976,1272\n480,4024,1520\n1040,4056,1296\n1640,3696,1272\n2216,2824,1120\n2512,1904,536\n2248,1360,328\n1728,1096,64\n1144,864,-168\n696,624,-8\n488,432,-24\n496,216,-88\n648,-40,-40\n832,-448,48\n1048,-840,112\n1160,-1120,168\n1272,-1384,272\n1312,-1560,312\n1272,-1640,384\n1208,-1608,432\n1168,-1488,424\n1152,-1304,360\n1160,-1080,304\n1192,-856,144\n1240,-672,-40\n1288,-504,-152\n1304,-288,-192\n1248,32,-120\n1232,688,96\n1128,2208,-344\n1352,3144,-64\n1968,3608,552\n2040,3848,-48\n1720,3960,-192\n1448,4016,-232\n1216,3728,-80\n912,3232,8\n544,2728,104\n176,2272,264\n-152,1912,312\n-464,1632,336\n-744,1424,232\n-1008,1264,96\n-1184,1168,-120\n-1240,1104,-216\n-1168,1008,-352\n-1040,872,-416\n-976,688,-336\n-1000,496,-280\n-1136,304,-208\n-1352,184,-136\n-1544,96,-64\n-1648,24,-176\n-1664,-24,-160\n-1600,-80,-112\n-1464,-136,-88\n-1312,-152,8\n-1176,-88,112\n-1072,16,216\n-1008,160,264\n-992,368,368\n-992,680,368\n-1040,1256,400\n-1024,2136,224\n-1032,3056,520\n-960,3568,472\n-568,3824,288\n-24,3952,544\n464,4016,696\n976,4048,632\n1536,3936,736\n2104,3360,944\n2528,2520,672\n2472,1816,440\n2040,1344,144\n1536,976,-168\n1032,672,-440\n592,400,-456\n312,160,-384\n200,-24,-280\n272,-216,-248\n456,-512,224\n672,-752,-32\n832,-968,32\n968,-1184,16\n1056,-1328,-48\n1048,-1328,96\n1016,-1232,200\n992,-1104,248\n992,-992,264\n984,-864,336\n1008,-720,264\n1024,-592,112\n1048,-472,104\n1064,-352,144\n1056,-208,152\n1104,80,184\n1264,976,280\n1376,2528,-80\n1912,3304,248\n2224,3688,344\n1928,3888,-72\n1520,3984,-336\n1224,3680,-288\n960,3208,-120\n672,2744,88\n360,2320,264\n64,1920,312\n-216,1552,344\n-456,1240,376\n-688,976,376\n-960,792,208\n-1280,656,32\n-1656,560,-216\n-1864,472,-248\n-1808,344,-336\n-1552,208,-424\n-1448,160,-296\n-1472,176,-216\n-1608,184,-144\n-1624,184,-88\n-1512,208,-152\n-1360,232,-64\n-1248,264,0\n-1176,336,64\n-1104,448,128\n-1024,592,160\n-936,808,336\n-848,1168,552\n-792,1904,640\n-808,2848,488\n-792,3464,872\n-448,3768,520\n-48,3928,576\n272,4000,872\n672,4040,872\n1144,3944,864\n1624,3488,944\n2144,2728,984\n2384,1992,608\n2192,1480,488\n1744,1168,312\n1280,912,8\n848,720,-240\n488,592,-344\n288,456,-264\n264,304,-288\n360,136,-248\n584,-80,-288\n840,-432,-272\n1096,-736,-216\n1240,-920,-288\n1304,-1056,-248\n1256,-1176,-192\n1136,-1200,-64\n1024,-1168,80\n936,-1128,144\n896,-1088,176\n912,-1000,144\n936,-880,64\n984,-728,32\n1040,-576,16\n1080,-392,80\n1144,-72,168\n1192,608,336\n1224,2320,384\n1688,3200,1032\n2312,3640,1488\n2232,3856,872\n1824,3968,432\n1464,3936,128\n1104,3592,320\n712,3128,560\n304,2648,672\n-88,2192,752\n-432,1768,712\n-728,1408,648\n-1016,1112,480\n-1328,872,240\n-1608,752,32\n-1704,664,-88\n-1584,544,-184\n-1408,416,-184\n-1320,288,-144\n-1352,152,-112\n-1488,40,-24\n-1624,-32,8\n-1632,-72,-48\n-1552,-80,-24\n-1416,-72,-8\n-1264,0,48\n-1128,104,88\n-1032,232,176\n-944,400,256\n-848,632,408\n-792,952,600\n-752,1464,752\n-768,2304,904\n-792,3192,864\n-648,3632,864\n-368,3856,608\n-32,3968,712\n336,4024,792\n744,4048,848\n1192,3824,856\n1648,3280,952\n2000,2488,792\n2104,1736,488\n1880,1208,336\n1488,856,120\n1104,632,-80\n776,440,-264\n552,272,-240\n512,96,-264\n624,-120,-248\n824,-424,-304\n1016,-720,-264\n1152,-976,-224\n1240,-1160,-112\n1256,-1336,-32\n1224,-1408,64\n1176,-1360,160\n1144,-1264,232\n1120,-1120,272\n1128,-944,232\n1152,-776,88\n1168,-608,16\n1168,-472,-64\n1144,-328,-96\n1080,-128,16\n1040,288,200\n1008,1608,376\n1176,2840,800\n1856,3464,1408\n2248,3768,832\n1840,3920,0\n1432,4000,-208\n1168,3880,-72\n856,3360,184\n504,2808,432\n200,2304,520\n-72,1872,504\n-288,1480,472\n-440,1152,384\n-608,896,304\n-776,712,128\n-992,600,-64\n-1216,528,-184\n-1328,480,-280\n-1288,440,-344\n-1208,408,-352\n-1248,360,-296\n-1384,288,-176\n-1608,248,-152\n-1768,240,-200\n-1752,240,-256\n-1592,192,-248\n-1392,120,-136\n-1248,80,-48\n-1136,112,96\n-1072,200,208\n-1024,320,336\n-992,512,456\n-944,824,608\n-928,1552,568\n-936,2584,488\n-1072,3328,1152\n-880,3704,832\n-376,3888,848\n120,3984,1144\n536,4032,1136\n1000,4056,1160\n1528,3792,1224\n2040,3112,1432\n2416,2192,936\n2376,1424,664\n2016,936,264\n1528,632,-48\n1096,416,-512\n736,224,-448\n592,72,-400\n640,-136,-344\n872,-536,-120\n1120,-832,-208\n1304,-1144,-200\n1416,-1496,-160\n1416,-1720,-136\n1288,-1784,-16\n1168,-1696,152\n1096,-1552,248\n1088,-1360,336\n1160,-1160,368\n1272,-912,264\n1368,-688,168\n1416,-496,104\n1392,-312,64\n1328,-96,136\n1288,312,208\n1304,1376,384\n1480,2728,456\n2192,3400,992\n2600,3744,1008\n2296,3912,216\n1872,3992,-144\n1504,4032,-80\n1112,3680,120\n688,3168,272\n304,2664,312\n-40,2224,320\n-344,1840,272\n-568,1520,192\n-776,1272,104\n-936,1104,-88\n-1064,984,-256\n-1120,864,-344\n-1136,736,-384\n-1144,608,-496\n-1160,488,-408\n-1224,384,-400\n-1344,296,-296\n-1488,216,-200\n-1592,152,-120\n-1640,80,-120\n-1672,32,-128\n-1592,8,-152\n-1408,24,-176\n-1240,88,-80\n-1112,176,0\n-1000,296,104\n-928,432,176\n-872,600,320\n-840,864,408\n-856,1496,456\n-896,2656,256\n-968,3368,672\n-744,3720,520\n-280,3896,648\n256,3992,728\n752,4032,680\n1264,4056,792\n1864,3792,1200\n2488,3096,1392\n2784,2280,1040\n2536,1640,776\n2008,1144,400\n1424,808,-40\n912,560,-376\n544,408,-312\n392,240,-264\n424,56,-168\n616,-304,-64\n864,-664,-8\n1072,-976,72\n1208,-1240,104\n1240,-1448,88\n1160,-1552,120\n1056,-1496,152\n968,-1352,168\n960,-1184,144\n1008,-992,112\n1120,-824,88\n1240,-688,32\n1328,-552,-40\n1344,-440,-48\n1280,-304,8\n1184,-96,168\n1192,296,536\n1328,1728,472\n1688,2904,384\n2336,3488,664\n2248,3784,248\n1664,3928,176\n1248,4008,-40\n944,3848,-48\n664,3320,72\n384,2768,136\n104,2256,184\n-144,1824,200\n-416,1456,256\n-672,1128,304\n-976,896,288\n-1344,728,152\n-1696,624,48\n-1856,576,-96\n-1728,576,-352\n-1512,520,-344\n-1424,344,-208\n-1440,224,-128\n-1464,144,-64\n-1448,112,-40\n-1360,112,0\n-1240,88,72\n-1128,80,88\n-1016,104,136\n-920,176,144\n-824,272,112\n-752,384,144\n-712,512,264\n-680,720,528\n-648,1152,656\n-568,1936,512\n-584,2792,640\n-480,3432,768\n-208,3760,816\n144,3920,944\n504,4000,800\n880,3928,704\n1256,3608,640\n1600,3088,696\n1816,2472,792\n1792,1944,584\n1520,1544,416\n1128,1248,272\n784,984,0\n496,752,-120\n328,528,-152\n288,312,-184\n392,112,-224\n592,-72,-288\n824,-320,-304\n1016,-584,-352\n1144,-784,-344\n1128,-912,-264\n1080,-1016,-104\n1024,-1120,32\n1000,-1232,168\n984,-1288,272\n944,-1272,376\n936,-1176,336\n912,-1064,288\n888,-952,208\n864,-816,128\n824,-664,112\n792,-520,104\n768,-360,152\n792,-160,368\n896,416,320\n1048,1808,432\n1344,2944,472\n1880,3512,1008\n1872,3792,1032\n1456,3936,664\n1120,4008,248\n856,4040,152\n568,3752,96\n248,3296,48\n-56,2744,-32\n-328,2184,16\n-576,1672,-40\n-824,1232,32\n-1096,856,56\n-1368,568,-104\n-1568,368,-160\n-1648,216,-328\n-1624,112,-392\n-1568,8,-448\n-1536,-56,-304\n-1560,-96,-240\n-1632,-80,-96\n-1672,-24,-88\n-1648,24,-72\n-1560,48,-40\n-1448,88,16\n-1296,160,144\n-1144,264,320\n-1000,416,456\n-904,696,704\n-888,1224,840\n-960,2272,592\n-1168,3176,912\n-1032,3624,1168\n-704,3856,1000\n-256,3968,1112\n240,4024,1120\n744,4048,984\n1272,3608,936\n1808,2944,1024\n2232,2064,688\n2272,1376,488\n1920,1032,272\n1432,808,-48\n976,648,-304\n600,528,-320\n440,424,-288\n512,272,-360\n736,16,-368\n1008,-408,-352\n1272,-728,-296\n1416,-984,-224\n1480,-1224,-144\n1448,-1400,-56\n1336,-1456,48\n1224,-1416,184\n1144,-1288,224\n1112,-1120,248\n1144,-920,264\n-1288,528,-328\n-1432,416,-192\n-1616,336,-184\n-1760,304,-128\n-1752,280,-176\n-1600,224,-208\n-1448,152,-144\n-1304,96,-48\n-1168,80,-104\n-1056,144,-40\n-960,272,72\n-864,432,216\n-800,648,360\n-768,1000,552\n-784,1800,376\n-896,2928,192\n-960,3504,720\n-680,3792,400\n-192,3936,552\n288,4008,848\n720,4040,976\n1208,3912,960\n1704,3280,1232\n2144,2368,1008\n2272,1552,576\n1976,1032,440\n1504,768,240\n1024,624,-32\n576,536,-216\n256,472,-56\n120,384,48\n176,272,-40\n392,24,-32\n688,-288,-144\n960,-664,-136\n1176,-920,-96\n1344,-1144,0\n1392,-1312,128\n1344,-1376,320\n1240,-1376,424\n1120,-1312,488\n1000,-1176,472\n936,-1000,456\n928,-800,360\n944,-624,264\n976,-456,112\n968,-288,96\n960,-80,80\n936,272,64\n880,1200,336\n832,2640,248\n1168,3360,440\n1432,3720,872\n1160,3896,496\n832,3992,224\n632,4032,16\n464,3632,40\n248,3032,96\n8,2448,256\n-264,1928,256\n-512,1528,256\n-744,1200,184\n-928,968,56\n-1072,784,-136\n-1160,600,-216\n-1176,432,-248\n-1088,288,-328\n-1008,200,-368\n-976,128,-408\n-1016,72,-280\n-1120,24,-168\n-1296,-56,-168\n-1440,-128,-120\n-1496,-192,-144\n-1480,-256,-144\n-1368,-256,-120\n-1248,-224,-64\n-1128,-168,8\n-1064,-88,136\n-1040,0,232\n-1064,168,320\n-1128,504,440\n-1272,1216,544\n-1312,2288,392\n-1496,3184,880\n-1552,3632,840\n-1216,3856,864\n-616,3968,696\n-48,4024,896\n328,4048,1000\n712,3848,952\n1144,3280,952\n1528,2584,1072\n1784,1800,616\n1832,1184,232\n1600,856,-88\n1248,704,-376\n880,616,-528\n648,520,-456\n584,368,-440\n704,120,-376\n920,-240,-232\n1152,-656,-168\n1288,-984,-80\n1440,-1248,-64\n1456,-1376,128\n1368,-1392,336\n1240,-1360,592\n1128,-1288,632\n1064,-1168,664\n1032,-984,600\n1032,-776,448\n1064,-592,288\n1112,-424,88\n1152,-240,-32\n1104,8,-80\n1048,480,-88\n968,1808,-40\n992,2944,24\n1472,3512,888\n1752,3792,800\n1584,3936,96\n1336,4008,-272\n1168,4040,-264\n888,3728,-128\n512,3168,24\n136,2592,160\n-200,2064,232\n-496,1616,280\n-720,1256,320\n-880,968,320\n-1024,792,208\n-1128,696,24\n-1168,616,-32\n-1136,552,-136\n-1032,528,-384\n-984,472,-352\n-984,360,-312\n-1040,248,-280\n-1128,176,-176\n-1248,120,-128\n-1360,48,-8\n-1432,-16,-56\n-1448,-104,-88\n-1352,-160,-72\n-1216,-208,-8\n-1096,-216,0\n-992,-184,48\n-920,-104,104\n-896,0,168\n-920,136,208\n-984,392,312\n-1104,976,360\n-1248,2104,64\n-1304,3096,432\n-1320,3584,296\n-1016,3832,200\n-352,3952,-88\n224,4016,312\n624,4048,448\n1080,3928,672\n1464,3344,1120\n1824,2496,1096\n2120,1704,528\n2040,1128,184\n1696,792,-200\n1240,536,-640\n744,408,-776\n456,304,-536\n408,200,-432\n552,-8,-272\n800,-384,-40\n1080,-816,32\n1248,-1192,128\n1456,-1512,104\n1528,-1688,216\n1456,-1688,392\n1328,-1584,400\n1200,-1408,456\n1120,-1168,448\n1112,-904,328\n1152,-672,200\n1208,-480,72\n1208,-280,-40\n1168,-40,-32\n1120,416,120\n992,1848,-16\n976,2960,-88\n1320,3520,688\n1568,3800,368\n1416,3936,-184\n1248,4008,-408\n1184,4016,-320\n1024,3560,-104\n712,2944,96\n368,2400,296\n80,1920,304\n-168,1536,320\n-368,1272,360\n-496,1032,392\n-624,864,360\n-728,712,280\n-816,624,176\n-912,552,16\n-968,480,-120\n-1000,376,-176\n-1040,248,-88\n-1104,160,-144\n-1208,112,-88\n-1328,96,-96\n-1416,72,-88\n-1472,16,-160\n-1408,-40,-144\n-1264,-64,-104\n-1112,-56,-56\n-968,-40,-24\n-864,-24,8\n-776,-16,40\n-720,-16,80\n-688,40,88\n-648,192,232\n-656,608,104\n-688,1560,-328\n-784,2688,72\n-776,3384,-112\n-544,3728,-40\n-88,3904,8\n416,3992,72\n1024,4032,56\n1592,3840,448\n2200,3208,888\n2712,2480,368\n2624,1928,232\n2120,1480,-112\n1536,1104,-560\n968,856,-688\n592,704,-592\n448,536,-624\n544,264,-408\n808,-176,-352\n1160,-712,-152\n1432,-1152,96\n1680,-1552,264\n1752,-1856,336\n1640,-1992,496\n1432,-1960,544\n1248,-1776,600\n1128,-1480,600\n1104,-1144,552\n1144,-848,424\n1184,-632,256\n1176,-472,96\n1104,-312,88\n968,-72,184\n848,248,248\n864,1048,240\n832,2352,416\n1208,3216,1016\n1808,3648,1152\n1928,3864,192\n1688,3968,-248\n1480,4024,-240\n1192,3832,-112\n800,3296,48\n392,2704,160\n56,2200,216\n-224,1752,232\n-424,1400,264\n-576,1112,280\n-648,880,200\n-736,696,56\n-800,552,-48\n-848,432,-160\n-872,312,-256\n-872,216,-264\n-856,152,-256\n-904,136,-248\n-1008,120,-256\n-1152,104,-176\n-1288,88,-152\n-1384,56,-200\n-1400,56,-192\n-1328,24,-200\n-1192,32,-152\n-1064,48,-112\n-936,96,-32\n-840,120,72\n-776,160,104\n-712,224,192\n-688,424,352\n-736,1080,520\n-704,2392,-64\n-936,3232,832\n-880,3656,232\n-408,3864,88\n144,3976,456\n728,4024,488\n1352,4048,736\n1936,3632,1352\n2536,2864,1096\n2712,2112,816\n2320,1592,488\n1744,1232,88\n1176,968,-520\n656,808,-472\n360,704,-328\n304,568,-408\n408,272,-240\n696,-248,-248\n1016,-752,-192\n1232,-1160,-104\n1448,-1480,-16\n1528,-1760,0\n1448,-1920,136\n1280,-1920,192\n1120,-1784,328\n1024,-1544,456\n1048,-1280,480\n1136,-1040,392\n1264,-840,336\n1368,-656,256\n1384,-472,256\n1336,-200,264\n1336,400,120\n1336,2192,-120\n1584,3136,320\n2248,3608,1064\n2352,3840,536\n2104,3960,-48\n1896,4016,-192\n1624,3848,128\n1184,3360,400\n672,2848,624\n176,2384,632\n-224,1968,664\n-544,1576,576\n-768,1224,544\n-920,896,504\n-1048,616,440\n-1144,448,328\n-1192,376,248\n-1160,384,96\n-1120,392,-192\n-1120,344,-152\n-1168,240,-96\n-1232,160,-64\n-1296,136,-104\n-1384,112,-80\n-1408,64,-104\n-1360,16,-56\n-1264,-24,16\n-1144,-48,104\n-1072,-56,112\n-992,-40,120\n-904,-8,112\n-840,64,80\n-760,224,152\n-728,504,216\n-712,1168,160\n-728,2176,248\n-824,3128,368\n-832,3600,520\n-672,3840,728\n-128,3960,816\n360,4016,808\n816,4048,816\n1312,4024,992\n1792,3472,1144\n2200,2584,944\n2328,1744,576\n2096,1168,248\n1688,776,-136\n1288,456,-536\n976,232,-600\n888,-8,-760\n1016,-352,-696\n1272,-816,-600\n1488,-1256,-416\n1632,-1664,-248\n1656,-1944,-128\n1504,-2056,72\n1304,-1944,264\n1160,-1752,368\n1080,-1536,320\n1200,-1264,424\n1392,-984,328\n1608,-712,280\n1784,-472,152\n1784,-216,104\n1656,192,120\n1592,1080,216\n1504,2576,200\n1896,3328,424\n2400,3704,1080\n2440,3888,720\n2224,3984,528\n1944,4032,576\n1536,3888,760\n1040,3440,856\n520,2944,864\n56,2496,800\n-288,2088,848\n-536,1736,856\n-680,1408,768\n-776,1152,744\n-840,936,592\n-888,800,488\n-896,688,344\n-888,608,192\n-856,520,0\n-832,408,-96\n-832,264,-120\n-880,152,-160\n-960,112,-120\n-1088,96,-192\n-1192,104,-256\n-1264,120,-296\n-1264,88,-344\n-1168,32,-360\n-1024,8,-344\n-888,32,-288\n-768,88,-248\n-672,152,-232\n-616,224,-184\n-576,360,-80\n-600,664,32\n-680,1480,-104\n-656,2576,-152\n-840,3328,256\n-768,3704,-16\n-336,3888,-280\n208,3984,24\n752,4032,168\n1456,4056,760\n2224,3584,1240\n2872,2704,1152\n2800,1960,992\n2256,1360,672\n1648,888,416\n1088,512,-8\n608,256,-104\n304,120,-72\n200,-64,-32\n280,-344,-8\n480,-656,48\n704,-944,112\n880,-1224,144\n1064,-1488,40\n1136,-1632,-72\n1096,-1560,-16\n992,-1368,32\n896,-1176,128\n832,-984,224\n808,-832,248\n872,-712,264\n952,-616,168\n1040,-544,64\n1088,-464,16\n1080,-400,48\n1032,-288,64\n1032,24,176\n1160,1000,-80\n1208,2536,24\n1848,3312,344\n2576,3696,456\n2408,3888,-72\n1920,3968,-280\n1536,3600,-232\n1184,3128,-8\n784,2680,240\n408,2272,280\n64,1904,248\n-232,1560,232\n-496,1280,256\n-688,1016,264\n-864,808,112\n-984,616,48\n-1088,488,-88\n-1144,368,-168\n-1152,232,-256\n-1128,160,-272\n-1168,96,-272\n-1248,48,-288\n-1384,24,-168\n-1512,-16,-208\n-1544,-56,-224\n-1472,-72,-216\n-1336,-48,-160\n-1200,0,-88\n-1096,72,-88\n-1008,184,16\n-944,320,16\n-872,600,152\n-840,1176,256\n-784,2136,256\n-856,3104,552\n-856,3592,616\n-584,3832,736\n-48,3960,808\n448,4016,864\n920,4048,984\n1432,4064,1368\n2032,3768,1600\n2616,2960,1664\n2816,2120,1456\n2504,1424,1080\n1984,928,680\n1440,608,248\n1024,360,-88\n696,192,-128\n520,48,-88\n520,-160,-72\n592,-464,24\n752,-832,88\n856,-1120,48\n984,-1368,32\n1032,-1520,-112\n1032,-1544,-152\n1000,-1448,-160\n952,-1280,-112\n912,-1096,-48\n912,-912,16\n952,-736,64\n1000,-608,48\n1064,-488,-8\n1112,-400,-64\n1120,-336,-24\n1080,-216,64\n1072,32,344\n1160,888,416\n1336,2480,224\n1888,3280,144\n2352,3680,664\n2088,3880,528\n1536,3976,432\n1160,4024,232\n864,3832,312\n536,3496,392\n256,3072,392\n56,2576,376\n-96,2048,304\n-216,1576,344\n-328,1160,336\n-464,824,360\n-648,544,272\n-912,344,168\n-1240,232,80\n-1552,176,-72\n-1696,176,-128\n-1656,136,-240\n-1512,80,-232\n-1440,16,-176\n-1504,-64,-88\n-1608,-112,-104\n-1616,-120,-40\n-1504,-96,-16\n-1344,-64,56\n-1208,-16,120\n-1104,56,128\n-1040,176,160\n-976,344,280\n-912,648,360\n-952,1376,752\n-992,2200,600\n-1096,3024,800\n-1024,3552,1112\n-760,3816,1080\n-384,3944,984\n48,4016,904\n408,4048,1016\n792,4064,984\n1168,3848,1120\n1488,3360,1080\n1808,2664,1072\n2000,1880,768\n1960,1248,456\n1704,816,152\n1384,496,-48\n1120,232,-256\n912,-24,-320\n808,-320,-184\n824,-560,-272\n928,-760,-200\n1024,-976,-176\n1184,-1224,-72\n1272,-1440,-112\n1232,-1504,-56\n1120,-1440,120\n1016,-1304,280\n960,-1184,344\n944,-1048,456\n984,-896,408\n1040,-720,288\n1072,-536,176\n1080,-368,48\n1064,-192,8\n1080,184,56\n1112,1400,-128\n1136,2744,-352\n1704,3408,32\n664,-1032,176\n856,-1264,240\n1048,-1440,256\n1144,-1504,200\n1144,-1400,248\n1088,-1208,296\n976,-1032,296\n944,-848,400\n968,-680,360\n1008,-512,272\n1056,-376,200\n1080,-256,120\n1072,-144,168\n1032,0,248\n1056,368,432\n1256,1728,-8\n1368,2904,416\n1816,3488,968\n2080,3784,192\n1944,3928,-336\n1656,4008,-608\n1344,4008,-408\n968,3552,-16\n584,3000,216\n208,2520,208\n-120,2080,216\n-392,1680,256\n-584,1336,288\n-744,1088,328\n-888,896,288\n-1040,768,296\n-1168,680,272\n-1256,624,224\n-1304,560,72\n-1328,432,-72\n-1320,280,-72\n-1360,112,-232\n-1408,-8,-240\n-1472,24,-160\n-1552,104,-136\n-1552,208,-88\n-1456,288,-48\n-1320,328,40\n-1176,360,104\n-1056,392,152\n-952,448,208\n-856,536,304\n-752,712,360\n-656,1096,328\n-704,1904,344\n-864,2880,472\n-1064,3480,608\n-856,3776,712\n-552,3928,464\n-248,4000,744\n128,4040,1008\n520,4056,968\n880,3552,784\n1280,2864,800\n1576,2168,808\n1776,1432,536\n1712,856,288\n1416,520,160\n1032,360,-24\n632,232,-120\n312,120,-176\n80,-16,-88\n8,-160,-32\n96,-344,-64\n296,-568,-64\n536,-784,-136\n776,-968,-80\n936,-1128,48\n1048,-1208,152\n1080,-1160,264\n1088,-1056,392\n1088,-976,536\n1152,-896,520\n1232,-792,480\n1256,-664,432\n1248,-512,344\n1224,-384,336\n1168,-264,432\n1136,-80,672\n1248,496,896\n1568,2288,384\n1808,3184,472\n2024,3632,264\n1864,3856,-200\n1480,3968,-456\n1136,4024,-384\n832,3776,-40\n480,3280,264\n128,2840,400\n-240,2432,352\n-552,2032,344\n-816,1672,224\n-1040,1352,120\n-1240,1104,48\n-1376,880,-72\n-1416,664,-72\n-1344,496,-88\n-1232,376,-128\n-1208,352,0\n-1136,272,-72\n-1232,176,-40\n-1384,112,48\n-1512,80,64\n-1600,56,64\n-1568,16,40\n-1480,0,8\n-1336,8,0\n-1224,56,24\n-1120,120,16\n-1024,208,72\n-952,328,168\n-896,480,400\n-864,728,408\n-880,1216,648\n-880,2184,336\n-1064,3136,584\n-984,3608,312\n-600,3840,48\n-112,3960,464\n376,4016,944\n936,4048,1112\n1568,3720,1144\n2104,2904,1008\n2472,2000,736\n2360,1312,392\n1936,880,96\n1368,640,-136\n848,528,-152\n488,464,-160\n328,360,-128\n360,176,-120\n504,-128,-24\n680,-504,-64\n880,-912,16\n984,-1264,104\n1088,-1568,144\n1088,-1736,208\n1032,-1744,280\n952,-1632,288\n856,-1432,288\n784,-1184,336\n752,-928,344\n800,-704,304\n888,-520,216\n992,-368,152\n1096,-248,144\n1160,-176,168\n1160,-128,280\n1152,0,528\n1280,680,680\n1496,2376,-200\n2192,3232,-280\n3024,3656,0\n2800,3864,-264\n2184,3968,-232\n1664,4024,-160\n1200,3640,72\n784,3184,152\n400,2752,152\n112,2320,144\n-112,1888,176\n-304,1488,192\n-464,1184,248\n-616,920,240\n-760,728,176\n-880,608,144\n-1000,672,-96\n-1088,584,-96\n-1128,512,-216\n-1080,432,-232\n-992,328,-208\n-1008,216,-24\n-1024,176,-88\n-1104,176,-80\n-1288,144,-104\n-1416,112,-88\n-1440,64,-136\n-1376,24,-160\n-1256,0,-96\n-1128,64,-176\n-1048,152,0\n-976,280,96\n-912,472,128\n-848,848,192\n-824,1536,-128\n-928,2384,168\n-1080,3232,408\n-928,3656,264\n-640,3864,192\n-232,3976,48\n208,4024,152\n576,4048,384\n912,3880,712\n1288,3400,1088\n1680,2720,1336\n1944,1928,960\n1920,1320,688\n1672,952,328\n1304,728,8\n944,568,-192\n632,440,-192\n432,328,-104\n384,152,-56\n464,-152,-48\n608,-544,24\n728,-896,88\n880,-1216,80\n968,-1480,144\n952,-1568,168\n880,-1512,192\n816,-1368,192\n776,-1184,240\n808,-1008,296\n864,-816,288\n968,-648,304\n1112,-504,184\n1272,-336,96\n1360,-184,88\n1368,-56,64\n1296,112,248\n1280,616,408\n1400,2192,-240\n1720,3136,-312\n2328,3608,-40\n2368,3840,-504\n2040,3960,-800\n1656,4016,-560\n1320,3888,-304\n936,3384,-40\n536,2872,40\n152,2456,112\n-216,2144,104\n-528,1872,96\n-800,1640,48\n-1040,1424,-96\n-1264,1232,-104\n-1256,984,-480\n-1392,880,-320\n-1440,744,-376\n-1432,624,-512\n-1448,512,-584\n-1504,416,-520\n-1592,352,-528\n-1664,312,-400\n-1688,272,-312\n-1632,208,-216\n-1512,112,-168\n-1368,24,-128\n-1192,0,-104\n-1056,8,-88\n-928,56,-96\n-832,112,-88\n-728,224,-88\n-656,384,-216\n-576,920,-384\n-512,1736,-720\n-736,2520,-424\n-768,3304,-904\n-640,3688,-856\n-192,3880,-840\n176,3984,-416\n480,4032,-408\n768,3792,-224\n1072,3336,-56\n1312,2816,176\n1488,2248,376\n1608,1712,304\n1560,1304,56\n1328,1024,-160\n992,864,-256\n624,736,-184\n352,600,-72\n232,440,32\n256,240,80\n376,-8,80\n568,-368,32\n760,-744,96\n952,-1072,96\n1064,-1304,48\n1088,-1432,80\n1024,-1368,168\n904,-1224,264\n800,-1064,296\n792,-968,352\n784,-800,216\n832,-640,240\n888,-504,152\n944,-384,88\n976,-272,112\n1000,-184,152\n1024,-88,160\n1096,304,352\n1336,1736,-488\n1632,2904,-312\n2504,3488,72\n2840,3784,-464\n2392,3928,-648\n1824,4008,-552\n1408,3872,-240\n1008,3504,56\n576,3104,184\n192,2744,312\n-152,2440,304\n-448,2128,376\n-688,1840,312\n-888,1624,336\n-1080,1456,256\n-1240,1320,200\n-1320,1192,72\n-1352,1032,-24\n-1320,848,-176\n-1264,640,-320\n-1280,416,-360\n-1352,208,-352\n-1440,104,-344\n-1520,64,-328\n-1584,32,-280\n-1592,-24,-216\n-1520,-72,-168\n-1368,-72,-56\n-1200,-24,8\n-1040,72,32\n-888,224,80\n-736,488,128\n-560,1080,-64\n-464,1984,-560\n-792,2808,-384\n-920,3200,-216\n-680,3640,-248\n-472,3856,-64\n-280,3968,272\n8,4024,352\n272,3896,424\n520,3488,464\n720,3000,456\n856,2528,512\n952,2048,424\n984,1608,248\n944,1280,176\n808,1064,88\n656,888,80\n528,696,64\n456,456,144\n472,160,280\n552,-144,272\n736,-496,328\n872,-792,384\n1072,-984,336\n1296,-1264,328\n1440,-1440,264\n1440,-1408,264\n1328,-1272,248\n1224,-1120,296\n1160,-952,288\n1160,-808,232\n1216,-688,216\n1280,-568,200\n1336,-440,112\n1336,-328,120\n1288,-144,48\n1296,304,160\n1512,1736,-320\n1624,2904,-888\n2208,3496,-272\n2408,3784,-680\n2000,3928,-952\n1536,4008,-1000\n1304,4040,-800\n1032,3600,-448\n696,3024,-184\n328,2536,-16\n-24,2152,48\n-320,1848,200\n-624,1584,280\n-856,1360,320\n-1056,1176,304\n-1184,1016,312\n-1248,880,224\n-1272,752,200\n-1280,624,104\n-1328,504,-8\n-1400,368,-72\n-1464,224,-56\n-1512,136,32\n-1536,80,-16\n-1536,32,48\n-1480,16,32\n-1384,0,40\n-1248,-16,56\n-1104,8,64\n-952,72,72\n-808,128,104\n-688,200,104\n-600,264,96\n-536,448,192\n-480,1024,-48\n-432,2152,-488\n-544,2984,-352\n-312,3528,-336\n-112,3808,-64\n296,3944,-64\n704,4008,8\n1208,3992,104\n1624,3440,544\n2064,2744,832\n2416,2064,568\n2296,1632,448\n1840,1328,136\n1248,1104,-96\n720,928,-128\n320,808,-120\n160,664,-120\n152,480,-104\n256,184,32\n392,-184,168\n560,-576,192\n704,-904,184\n800,-1184,264\n896,-1408,176\n888,-1504,168\n816,-1480,176\n736,-1352,168\n672,-1160,192\n664,-960,184\n720,-800,200\n808,-672,184\n928,-576,144\n1032,-504,136\n1112,-392,136\n1192,-200,184\n1368,336,-16\n1488,1776,0\n1872,2928,24\n2648,3504,456\n2696,3792,-24\n2176,3936,-224\n1672,3960,-384\n1320,3776,-256\n944,3384,-72\n544,2928,64\n160,2488,120\n-152,2064,184\n-376,1648,248\n-544,1320,288\n-672,1032,328\n-776,816,304\n-896,672,280\n-1008,544,264\n-1120,480,88\n-1208,456,-88\n-1224,384,-224\n-1200,264,-168\n-1136,144,-144\n-1104,72,-48\n-1200,32,-40\n-1344,-8,40\n-1464,-56,64\n-1464,-112,64\n-1344,-128,80\n-1192,-112,120\n-1048,-56,144\n-920,24,136\n-840,120,144\n-792,296,296\n-760,544,392\n-792,1288,312\n-920,2320,400\n-944,3200,576\n-736,3640,856\n-392,3856,672\n64,3968,952\n520,4024,968\n992,4048,992\n1384,3696,1192\n1816,3088,1120\n2152,2320,872\n2152,1704,704\n1824,1320,432\n1376,1032,176\n936,792,48\n592,616,0\n392,416,-64\n336,200,-56\n384,-80,40\n496,-488,16\n664,-872,104\n736,-1160,56\n840,-1384,40\n920,-1520,-48\n912,-1520,-112\n848,-1408,-152\n776,-1200,-120\n744,-984,-88\n752,-776,-16\n832,-624,56\n952,-480,56\n1088,-368,88\n1208,-256,96\n1296,-64,144\n1440,432,160\n1624,1920,112\n2000,3000,104\n2624,3536,416\n2584,3808,-120\n2088,3944,-296\n1680,3992,-240\n1384,3640,40\n1064,3120,312\n720,2624,456\n376,2216,496\n64,1904,504\n-224,1632,432\n-480,1400,544\n-744,1224,512\n-1000,1072,464\n-1264,936,408\n-1464,856,280\n-1528,752,64\n-1520,600,8\n-1424,392,-8\n-1352,192,16\n-1368,80,64\n-1488,40,48\n-1608,48,120\n-1632,48,96\n-1520,56,104\n-1328,56,72\n-1160,80,72\n-1000,136,80\n-880,216,56\n-768,344,40\n-656,520,56\n-568,776,112\n-536,1232,128\n-616,2088,232\n-736,2992,520\n-688,3536,464\n-600,3808,496\n-320,3944,432\n64,4008,584\n440,4048,712\n816,3816,800\n1176,3304,880\n1512,2656,864\n1712,1912,800\n1720,1272,544\n1496,848,344\n1152,632,112\n816,472,-104\n504,320,-192\n288,128,-136\n144,-80,-32\n136,-384,0\n216,-680,-8\n352,-912,16\n544,-1136,48\n712,-1360,152\n800,-1488,48\n816,-1416,64\n776,-1240,72\n720,-1040,128\n704,-832,168\n744,-648,224\n840,-504,232\n976,-376,208\n1120,-256,168\n1224,-136,176\n1280,104,160\n1384,840,264\n1512,2352,152\n1904,3216,-16\n2296,3648,256\n2056,3864,-104\n1528,3968,-232\n1152,3912,-184\n920,3584,-40\n632,3200,144\n312,2832,224\n16,2440,272\n-232,2032,216\n-440,1616,344\n-584,1264,424\n-728,976,432\n-872,760,416\n-1032,624,336\n-1208,544,216\n-1360,496,80\n-1424,424,-32\n-1376,312,-80\n-1272,184,-56\n-1208,88,8\n-1288,24,48\n-1440,-24,88\n-1568,-48,88\n-1536,-56,64\n-1376,-56,96\n-1200,-32,128\n-1064,8,176\n-976,104,168\n-928,248,152\n-872,480,336\n-840,848,376\n-832,1512,304\n-960,2544,336\n-952,3272,576\n-760,3672,528\n-488,3880,464\n-48,3976,416\n336,4024,472\n672,4056,616\n1000,3704,688\n1336,3152,816\n1632,2512,744\n1848,1816,656\n1880,1240,424\n1656,896,232\n1320,672,-56\n960,488,-280\n640,296,-296\n440,128,-168\n368,-32,-136\n424,-296,-144\n568,-600,-56\n720,-856,-32\n840,-1056,-16\n928,-1232,-88\n960,-1304,-96\n936,-1240,-56\n888,-1072,40\n840,-888,128\n856,-712,192\n912,-584,216\n984,-440,168\n1056,-312,128\n1112,-208,40\n1136,-144,48\n1104,-16,128\n1120,272,336\n1136,1280,296\n1176,2680,152\n1624,3376,256\n1880,3728,424\n1664,3904,112\n1352,3920,-32\n1144,3648,-24\n944,3256,160\n664,2816,288\n360,2416,344\n80,2064,360\n-168,1760,320\n-360,1504,288\n-552,1280,280\n-696,1096,208\n-832,928,144\n-904,792,32\n-936,664,-104\n-960,560,-192\n-984,432,-264\n-1056,304,-232\n-1184,184,-232\n-1320,88,-208\n-1448,0,-160\n-1496,-40,-72\n-1496,-112,-104\n-1480,-144,-40\n-1400,-128,16\n-1280,-64,40\n-1160,24,56\n-1056,152,112\n-976,344,176\n-904,632,312\n-864,1200,376\n-824,2088,336\n-976,2928,608\n-936,3504,656\n-720,3792,640\n-288,3936,440\n144,4008,584\n496,4040,736\n864,4056,840\n1304,3584,1048\n1744,2896,1160\n2112,2048,864\n2184,1320,520\n1888,872,320\n1472,616,40\n1024,424,-328\n648,272,-352\n400,144,-312\n336,-8,-256\n464,-216,-248\n648,-552,-176\n824,-888,-88\n976,-1160,-56\n1056,-1424,-128\n1048,-1552,-80\n952,-1512,-16\n872,-1368,40\n832,-1192,136\n864,-1000,168\n968,-800,176\n1128,-624,168\n1312,-456,112\n1448,-312,80\n1480,-128,200\n1488,248,232\n1528,1552,208\n1600,2816,-16\n2104,3448,488\n2312,3760,160\n1952,3920,-264\n1600,3992,-456\n1344,3776,-288\n1032,3352,-24\n672,2864,216\n288,2408,256\n-56,1992,296\n-312,1600,312\n-520,1288,312\n-680,1024,296\n-848,832,224\n-1008,720,176\n-1176,672,32\n-1280,656,-128\n-1336,640,-320\n-1280,584,-312\n-1264,496,-208\n-1416,360,-8\n-1488,224,-64\n-1592,112,8\n-1640,24,-24\n-1616,-40,8\n-1528,-80,48\n-1392,-56,88\n-1264,16,168\n-1176,96,216\n-1120,192,224\n-1064,304,296\n-1032,488,376\n-1000,880,488\n-1024,1744,400\n-992,2912,96\n-952,3496,264\n-648,3784,64\n-160,3928,-56\n336,4008,56\n776,4040,136\n1208,4056,424\n1536,3640,808\n1832,3048,680\n2040,2344,664\n2016,1768,504\n1728,1392,264\n1336,1136,0\n976,904,-208\n680,720,-248\n512,536,-200\n448,320,-168\n496,40,-152\n672,-352,-24\n848,-776,24\n992,-1072,72\n1112,-1360,104\n1176,-1592,72\n1096,-1632,120\n976,-1520,168\n872,-1344,184\n840,-1136,232\n920,-944,232\n1048,-784,224\n1208,-648,144\n1320,-488,136\n1328,-296,168\n1288,-16,144\n1296,744,112\n1336,2408,-448\n1608,3248,-568\n1968,3664,-104\n1920,3872,-360\n1560,3976,-456\n1288,3968,-440\n1080,3608,-216\n792,3144,-24\n448,2704,64\n112,2320,80\n-176,1976,64\n-432,1672,112\n-632,1368,152\n-760,1080,264\n-864,856,232\n-920,664,168\n-952,496,88\n-992,384,120\n-1064,256,-8\n-1136,176,-104\n-1216,112,-144\n-1288,64,-120\n-1328,24,-96\n-1408,8,-48\n-1480,-8,-128\n-1504,-8,-152\n-1432,-8,-96\n-1296,16,-16\n-1168,64,56\n-1064,112,120\n-992,168,152\n-936,288,208\n-888,512,240\n-896,1144,216\n-912,2152,32\n-1008,3088,248\n-904,3584,120\n-688,3832,136\n-240,3952,16\n200,4016,184\n544,4048,312\n840,3976,600\n1144,3496,824\n1480,2904,1136\n1808,2200,864\n1992,1520,496\n1848,1080,224\n1480,840,-144\n1072,640,-328\n720,464,-384\n480,288,-288\n424,32,-216\n488,-376,-192\n672,-816,-72\n864,-1160,40\n1080,-1504,144\n1232,-1728,144\n1192,-1736,200\n1072,-1592,200\n928,-1360,248\n856,-1112,264\n864,-880,280\n952,-688,288\n1112,-528,232\n1264,-368,168\n1344,-224,216\n1360,-48,208\n1392,432,80\n1568,1800,-160\n1864,2936,-488\n2456,3512,64\n2568,3792,-392\n2168,3936,-640\n1784,4008,-616\n1488,3824,-344\n1152,3384,-72\n784,2872,120\n392,2448,200\n40,2096,240\n-248,1776,320\n-464,1488,440\n-640,1240,448\n-760,1064,464\n-872,984,432\n-976,920,384\n-1088,872,216\n-1160,824,80\n-1168,736,16\n-1144,616,-40\n-1096,472,-24\n-1104,288,72\n-1176,200,0\n-1272,152,-120\n-1352,128,-128\n-1400,72,-128\n-1344,16,-176\n-1216,8,-184\n-1064,24,-208\n-920,88,-184\n-816,152,-128\n-744,200,-56\n-688,280,32\n-656,416,152\n-648,688,280\n-712,1352,360\n-840,2400,224\n-1248,3240,816\n-1056,3656,440\n-568,3872,216\n-64,3976,496\n336,4024,992\n888,4024,968\n1336,3448,1456\n1808,2752,1480\n2048,1960,1048\n1944,1352,784\n1592,1000,488\n1184,800,104\n752,680,-112\n320,624,-40\n8,600,72\n-168,576,64\n-192,504,40\n-80,352,216\n72,136,32\n280,-128,64\n536,-416,48\n688,-696,216\n848,-920,136\n968,-1128,208\n1032,-1248,152\n1016,-1224,168\n928,-1104,208\n832,-976,296\n752,-840,312\n720,-680,368\n728,-544,304\n776,-400,192\n808,-296,32\n808,-192,24\n784,-16,72\n768,464,128\n832,2016,-408\n696,3048,88\n1056,3560,528\n1544,3824,88\n1616,3952,-32\n1448,4016,-216\n1248,3712,-160\n984,3256,32\n632,2760,248\n272,2344,496\n-48,2032,488\n-304,1800,512\n-480,1576,488\n-608,1376,496\n-664,1192,456\n-704,1032,400\n-712,888,376\n-712,776,288\n-712,688,176\n-680,624,0\n-704,528,-88\n-760,384,-144\n-840,144,-184\n-848,-88,-112\n-960,-248,-72\n-1032,-328,-120\n-1120,-384,-144\n-1184,-384,-88\n-1200,-344,-48\n-1136,-256,8\n-1024,-152,48\n-888,-56,56\n-760,24,64\n-640,96,72\n-552,176,104\n-496,312,280\n-512,640,376\n-584,1472,-32\n-728,2224,-64\n-952,2880,504\n-992,3480,200\n-720,3776,136\n-352,3928,368\n40,4000,472\n416,3752,328\n736,3248,328\n976,2704,320\n1088,2208,304\n1104,1784,168\n992,1472,32\n800,1280,-88\n584,1168,-152\n376,1096,-200\n216,1024,-288\n112,928,-368\n72,784,-304\n104,576,-208\n200,288,-192\n376,16,-40\n600,-328,-56\n744,-656,72\n912,-856,-32\n992,-960,64\n992,-1008,64\n880,-1024,80\n728,-984,112\n576,-912,168\n472,-800,160\n392,-664,192\n368,-528,152\n400,-384,144\n440,-248,104\n496,-112,184\n552,64,200\n576,424,352\n696,1640,-248\n704,2528,-184\n848,3304,152\n1144,3688,-256\n1376,3888,-480\n1560,3984,-728\n1536,3792,-760\n1288,3448,-496\n928,2968,-256\n528,2520,-32\n136,2144,104\n-224,1856,120\n-552,1616,184\n-792,1400,192\n-928,1208,152\n-976,1016,80\n-936,824,48\n-816,688,0\n-704,576,-56\n-616,496,-56\n-568,440,-136\n-560,392,-176\n-600,344,-176\n-632,280,-200\n-664,224,-176\n-712,152,-192\n-720,88,-136\n-712,40,-104\n-696,0,-72\n-640,-16,-48\n-600,-24,-24\n-560,-32,8\n-520,-24,32\n-520,-8,88\n-544,64,176\n-592,280,232\n-584,1016,-128\n-552,1968,-176\n-904,2448,104\n-912,3056,280\n-528,3568,-400\n-104,3824,-368\n304,3952,-304\n704,3712,-256\n1048,3240,-128\n1264,2680,0\n1288,2152,56\n1144,1688,56\n896,1336,24\n640,1096,-96\n416,944,-240\n224,856,-440\n96,792,-536\n8,728,-584\n0,672,-536\n56,624,-456\n216,616,-464\n328,608,-376\n440,576,-376\n544,520,-336\n608,432,-264\n616,312,-216\n576,184,-216\n520,88,-256\n456,8,-280\n400,-72,-344\n368,-144,-264\n352,-240,-272\n344,-328,-232\n352,-408,-184\n336,-496,-112\n296,-568,-32\n248,-600,40\n216,-576,96\n232,-520,120\n296,-408,176\n384,-280,264\n512,-64,376\n632,240,408\n856,768,816\n1104,1512,336\n1248,2488,176\n1120,3120,-272\n1032,3160,-672\n1016,2752,-1184\n1024,2136,-1504\n1040,1496,-1360\n1128,888,-1072\n1344,440,-936\n1608,128,-792\n1808,-88,-720\n1856,-240,-664\n1760,-312,-632\n1576,-328,-560\n1384,-256,-464\n1224,-136,-376\n1120,24,-288\n1088,232,-288\n1080,504,-296\n1104,864,-240\n1088,1144,-304\n1032,1160,-304\n944,1032,-336\n840,920,-360\n744,880,-336\n680,896,-392\n648,888,-488\n664,888,-640\n704,912,-744\n728,872,-880\n768,752,-976\n808,640,-1120\n832,560,-1192\n824,488,-1208\n816,408,-1144\n792,336,-1112\n752,272,-1104\n712,176,-1080\n664,64,-992\n608,-16,-960\n544,-64,-880\n512,-64,-840\n496,-24,-768\n512,16,-712\n568,72,-616\n656,128,-608\n752,224,-552\n848,344,-544\n928,480,-536\n968,632,-544\n984,752,-584\n992,880,-664\n992,960,-736\n1016,968,-776\n1064,944,-856\n1144,880,-936\n1248,808,-984\n1392,712,-1056\n1536,608,-1096\n1648,488,-1088\n1704,360,-1064\n1688,240,-1016\n1616,144,-936\n1520,64,-872\n1432,0,-808\n1352,-40,-752\n1272,-72,-688\n1192,-80,-632\n1112,-56,-592\n1040,-40,-576\n960,-16,-560\n888,0,-528\n808,8,-488\n728,16,-456\n656,16,-416\n584,24,-368\n520,48,-328\n464,64,-288\n408,88,-256\n360,104,-240\n320,120,-216\n296,128,-200\n272,136,-184\n256,128,-176\n248,120,-200\n248,112,-168\n240,104,-200\n240,96,-176\n240,88,-192\n248,80,-200\n256,72,-192\n264,64,-176\n280,64,-176\n296,72,-160\n328,72,-168\n360,80,-152\n400,88,-144\n448,96,-128\n496,104,-104\n560,120,-88\n632,152,-40\n736,208,-16\n880,256,8\n1048,320,24\n1248,360,32\n1480,416,48\n1712,464,56\n1896,552,32\n2040,656,-32\n2104,728,-104\n2088,760,-160\n2040,752,-208\n2008,720,-248\n2000,672,-272\n1984,616,-256\n1960,552,-168\n1896,496,-96\n1784,448,-56\n1664,408,16\n1536,384,16\n1400,336,48\n1288,304,32\n1184,272,40\n1104,248,48\n1040,224,48\n984,224,48\n928,216,32\n888,216,40\n840,216,40\n816,208,24\n784,200,8\n768,200,0\n752,200,-24\n752,208,-24\n744,216,-32\n744,232,-8\n744,280,8\n752,328,32\n768,384,64\n792,448,72\n824,512,80\n840,568,96\n832,624,128\n840,656,96\n840,688,128\n816,704,120\n784,760,48\n768,800,-56\n760,832,-136\n752,856,-152\n752,832,-160\n768,800,-144\n800,768,-152\n840,736,-160\n888,712,-152\n936,680,-168\n1008,664,-176\n1088,648,-216\n1184,616,-144\n1280,576,-128\n1392,552,-128\n1480,528,-160\n1528,520,-176\n1528,512,-176\n1496,528,-168\n1464,568,-144\n1424,600,-128\n1440,640,-112\n1472,672,-64\n1536,688,-32\n1600,680,48\n1672,648,80\n1720,616,128\n1736,568,152\n1720,528,160\n1688,504,72\n1624,528,152\n1552,568,184\n1496,488,-56\n1424,360,64\n1360,224,16\n1288,120,-16\n1200,112,16\n1128,136,8\n1040,184,24\n960,208,32\n896,240,48\n840,264,64\n792,272,72\n744,280,88\n712,296,96\n680,288,144\n664,288,128\n640,280,104\n616,280,136\n600,280,128\n576,288,112\n568,288,136\n560,272,128\n552,272,120\n536,248,136\n528,224,144\n512,216,136\n512,192,128\n504,176,128\n512,160,136\n504,160,120\n512,168,104\n520,160,88\n544,168,72\n576,176,64\n608,184,32\n656,208,48\n712,224,48\n792,264,64\n888,288,80\n992,328,64\n1112,360,88\n1232,400,88\n1320,424,112\n1408,464,112\n1472,488,104\n1528,536,24\n1584,592,-16\n1640,680,-88\n1680,752,-168\n1704,808,-216\n1704,816,-256\n1656,784,-216\n1600,760,-144\n1528,688,-72\n1432,616,0\n1328,560,48\n1240,504,40\n1144,440,-8\n1080,400,-24\n1032,336,-88\n976,288,-40\n920,224,-104\n880,176,-96\n832,144,-72\n784,128,-64\n736,136,-24\n712,160,-8\n688,200,-16\n672,216,16\n672,216,-16\n688,224,-16\n712,248,-24\n736,280,-48\n760,304,-56\n776,360,-72\n784,440,-64\n776,504,-72\n768,560,-64\n760,592,-48\n768,616,-56\n776,640,-88\n784,672,-144\n816,720,-184\n848,752,-208\n880,744,-176\n904,752,-144\n920,728,-152\n936,704,-144\n936,672,-152\n960,640,-144\n1008,600,-184\n1080,560,-176\n1176,528,-120\n1304,480,-104\n1416,440,-48\n1496,392,-40\n1536,368,-16\n1520,352,0\n1464,376,-56\n1400,400,-72\n1320,448,-104\n1256,496,-96\n1224,528,-88\n1208,560,-32\n1232,600,0\n1272,616,48\n1312,632,64\n1360,640,96\n1384,632,88\n1376,608,80\n1344,576,88\n1288,560,96\n1224,536,88\n1168,496,80\n1120,472,80\n1072,424,80\n1032,400,96\n984,368,88\n952,344,104\n912,320,96\n896,304,120\n864,288,128\n840,264,136\n824,256,120\n808,248,152\n800,240,152\n800,240,152\n800,248,168\n800,248,160\n792,256,160\n776,264,160\n768,264,160\n752,272,152\n728,280,168\n696,280,168\n680,272,144\n656,272,152\n648,272,136\n648,264,144\n640,248,120\n632,240,120\n632,248,120\n640,240,72\n648,248,80\n656,264,64\n680,272,48\n712,288,24\n784,296,24\n880,312,24\n976,344,48\n1064,368,48\n1144,376,64\n1192,384,112\n1216,392,120\n1216,392,112\n1224,408,104\n1224,432,56\n1216,464,-24\n1232,496,-72\n1248,536,-144\n1272,568,-200\n1304,584,-208\n1328,592,-192\n1352,576,-152\n1376,544,-96\n1384,496,-40\n1360,464,-8\n1320,432,64\n1272,424,56\n1208,408,8\n1144,376,-8\n1088,368,-48\n1032,360,-88\n976,320,-120\n912,296,-144\n856,288,-144\n800,264,-152\n744,248,-104\n712,256,-64\n688,272,-48\n680,296,-32\n688,296,-48\n704,320,-48\n720,320,-48\n736,336,-64\n752,368,-104\n768,384,-80\n776,416,-88\n768,440,-88\n752,456,-104\n728,472,-120\n712,480,-152\n696,504,-192\n696,520,-192\n688,536,-216\n704,568,-288\n728,592,-264\n768,600,-240\n816,592,-216\n856,584,-208\n920,568,-152\n976,560,-152\n1048,552,-120\n1136,552,-104\n1256,544,-56\n1384,536,-56\n1520,520,-32\n1592,480,-16\n1600,448,-40\n1560,424,-56\n1488,424,-72\n1400,448,-48\n1344,464,-56\n1336,496,-48\n1360,512,-40\n1416,520,-16\n1456,536,-8\n1464,528,24\n1464,528,48\n1432,496,16\n1400,488,-96\n1288,480,144\n1200,480,80\n1160,440,80\n1120,416,80\n1096,376,72\n1064,336,40\n1016,264,24\n960,200,64\n888,152,64\n824,160,48\n760,184,40\n704,208,56\n656,232,80\n632,256,72\n632,280,96\n648,304,120\n672,320,120\n688,320,120\n720,312,112\n728,320,136\n728,328,168\n720,344,144\n712,344,160\n704,336,160\n704,312,160\n720,304,152\n728,288,152\n744,280,176\n744,264,168\n752,248,152\n744,248,120\n744,256,104\n736,248,96\n736,256,120\n760,256,136\n808,256,168\n880,288,152\n968,320,120\n1064,344,144\n1152,360,112\n1240,384,120\n1288,408,136\n1312,432,152\n1304,456,136\n1280,472,96\n1216,480,40\n1152,496,-56\n1088,512,-136\n1048,536,-192\n1016,552,-288\n1008,584,-312\n1016,592,-296\n1040,592,-264\n1080,568,-192\n1112,520,-88\n1152,472,-16\n1176,432,72\n1176,400,104\n1144,352,120\n1104,320,112\n1056,280,72\n1000,240,16\n928,208,-32\n864,176,-80\n800,160,-104\n736,176,-96\n688,176,-104\n648,208,-72\n632,224,-48\n624,248,-8\n648,288,-24\n688,312,0\n736,352,8\n784,400,-24\n824,448,-48\n856,488,-64\n864,528,-104\n856,576,-112\n840,616,-120\n816,632,-168\n808,640,-168\n792,656,-192\n800,648,-216\n824,632,-240\n848,624,-248\n872,600,-272\n904,592,-256\n928,552,-248\n944,520,-248\n968,504,-232\n992,472,-224\n1032,464,-208\n1096,448,-168\n1176,432,-120\n1280,400,-72\n1392,376,-40\n1480,368,-56\n1544,376,-88\n1560,400,-120\n1536,432,-168\n1472,464,-184\n1400,504,-168\n1352,520,-88\n1328,520,-40\n1360,520,0\n1392,520,56\n1432,520,80\n1448,512,88\n1432,504,104\n1400,488,112\n1344,472,104\n1288,464,88\n1232,464,88\n1176,448,80\n1128,440,72\n1080,432,88\n1032,408,88\n976,400,88\n936,376,104\n896,360,104\n848,360,104\n808,344,120\n776,320,112\n760,312,144\n744,320,152\n736,320,152\n736,312,160\n744,312,168\n736,304,144\n728,296,160\n736,280,168\n712,288,136\n704,280,152\n688,272,152\n680,264,160\n672,264,128\n672,264,120\n680,256,120\n688,240,128\n704,232,112\n712,232,88\n704,248,80\n696,240,96\n688,248,96\n712,240,88\n744,240,104\n816,248,104\n896,264,120\n968,304,104\n1032,320,88\n1080,352,64\n1112,376,64\n1136,408,80\n1160,448,72\n1176,464,48\n1184,488,-8\n1168,504,-64\n1144,512,-136\n1112,544,-216\n1120,568,-256\n1128,592,-240\n1160,600,-248\n1216,600,-200\n1280,576,-112\n1320,536,-48\n1320,488,56\n1288,440,104\n1224,408,136\n1136,368,96\n1080,336,96\n1024,304,32\n976,280,-16\n944,256,-48\n904,224,-80\n864,224,-80\n832,224,-72\n800,232,-40\n760,256,-56\n752,272,-40\n736,288,-32\n736,296,-32\n744,328,-40\n752,368,-64\n776,392,-72\n800,456,-112\n832,504,-144\n832,544,-168\n832,552,-168\n824,560,-152\n808,560,-136\n800,544,-136\n792,528,-152\n792,528,-160\n808,528,-184\n840,536,-192\n864,552,-224\n896,552,-216\n936,576,-256\n968,576,-248\n1000,584,-264\n1040,584,-256\n1096,592,-224\n1168,576,-200\n1248,560,-144\n1328,536,-112\n1400,504,-112\n1440,472,-80\n1448,424,-80\n1424,392,-88\n1376,368,-88\n1344,376,-96\n1320,384,-120\n1320,400,-128\n1320,424,-104\n1336,440,-104\n1336,448,-72\n1336,456,-56\n1336,472,-64\n1328,488,-40\n1312,504,0\n1288,504,-8\n1256,504,8\n1208,512,24\n1160,496,40\n1104,488,56\n1056,472,80\n1008,448,88\n968,432,104\n944,400,120\n912,368,136\n888,352,144\n864,328,152\n856,312,160\n832,288,184\n816,264,192\n824,256,200\n824,248,192\n824,240,208\n824,232,208\n824,232,216\n816,232,208\n800,240,200\n768,240,208\n752,248,208\n736,248,224\n720,256,192\n704,248,200\n696,256,208\n688,264,208\n696,264,208\n688,272,200\n696,272,208\n704,280,168\n720,296,168\n728,304,160\n752,312,144\n784,328,128\n832,328,128\n896,336,104\n952,352,88\n1008,360,64\n1056,376,56\n1096,392,24\n1128,416,0\n1152,440,-32\n1160,464,-72\n1160,488,-120\n1136,504,-152\n1096,512,-184\n1064,512,-200\n1024,504,-208\n1024,488,-184\n1032,472,-160\n1072,448,-120\n1144,416,-88\n1216,392,-56\n1272,368,-32\n1304,344,8\n1304,328,40\n1264,304,8\n1208,280,-16\n1144,280,-32\n1080,264,-80\n1032,256,-112\n968,248,-136\n896,264,-152\n848,280,-136\n792,296,-144\n744,304,-120\n712,320,-80\n696,320,-88\n696,336,-88\n712,352,-88\n736,368,-88\n768,392,-72\n800,408,-64\n840,432,-56\n856,448,-48\n872,472,-64\n872,488,-96\n880,504,-136\n880,520,-168\n872,520,-176\n872,528,-160\n872,520,-144\n880,504,-136\n888,504,-152\n912,504,-160\n920,512,-200\n936,528,-224\n944,536,-256\n952,544,-240\n960,544,-224\n984,528,-208\n1024,520,-192\n1088,520,-184\n1192,520,-152\n1304,520,-136\n1400,520,-120\n1472,512,-96\n1504,496,-80\n1488,488,-56\n1456,480,-16\n1416,480,0\n1392,480,64\n768,288,168\n760,280,176\n760,272,176\n752,272,168\n752,256,168\n752,248,176\n752,240,176\n744,248,152\n736,240,168\n736,240,160\n728,232,168\n728,232,160\n728,240,144\n736,248,152\n744,264,128\n752,272,112\n768,280,120\n792,288,120\n832,296,136\n896,312,136\n968,320,136\n1032,328,144\n1096,336,152\n1136,336,136\n1128,360,128\n1104,376,112\n1064,400,112\n1032,432,72\n1000,456,16\n1000,488,-32\n1016,512,-96\n1024,536,-160\n1064,560,-192\n1104,576,-200\n1168,584,-160\n1232,584,-136\n1304,560,-64\n1368,544,8\n1408,496,72\n1424,456,136\n1400,424,184\n1336,392,152\n1248,376,136\n1160,344,72\n1072,336,8\n984,320,-56\n912,312,-104\n824,304,-120\n752,296,-104\n704,288,-80\n664,296,-72\n656,304,-56\n680,304,-40\n704,312,-8\n760,328,-32\n816,360,-56\n864,408,-96\n904,448,-112\n928,496,-128\n920,536,-120\n912,560,-112\n880,568,-120\n856,560,-112\n840,560,-144\n824,560,-224\n808,560,-256\n800,552,-256\n792,544,-248\n800,528,-232\n800,512,-240\n816,488,-240\n832,472,-232\n856,480,-224\n888,488,-232\n960,504,-216\n1048,520,-184\n1208,544,-128\n1376,536,-80\n1544,528,-40\n1680,520,-24\n1744,520,-56\n1744,520,-104\n1672,536,-104\n1584,528,-72\n1504,512,-32\n1448,504,0\n1448,488,16\n1456,472,32\n1456,448,32\n1424,432,40\n1376,416,40\n1320,400,0\n1264,408,16\n1224,400,32\n1192,408,32\n1152,416,40\n1112,432,72\n1072,432,64\n1032,432,88\n992,424,80\n952,416,88\n912,400,104\n872,384,104\n848,360,112\n808,336,120\n800,320,120\n784,296,120\n776,280,136\n768,264,160\n776,256,176\n776,248,176\n776,232,184\n760,224,184\n744,224,176\n720,224,184\n704,216,168\n680,224,160\n672,224,144\n664,224,152\n664,232,136\n664,232,152\n672,240,144\n672,240,144\n680,248,144\n680,256,128\n696,264,152\n736,264,136\n800,280,144\n872,296,168\n944,312,144\n1024,320,168\n1088,336,152\n1136,360,136\n1152,384,144\n1152,416,120\n1144,424,104\n1128,456,80\n1120,480,24\n1120,496,-16\n1120,512,-48\n1112,520,-120\n1120,528,-160\n1144,544,-184\n1184,560,-208\n1240,584,-208\n1312,592,-152\n1368,568,-72\n1392,536,0\n1384,496,40\n1336,456,72\n1256,416,48\n1168,376,24\n1104,328,-112\n1024,280,-16\n968,224,-248\n928,160,-288\n880,80,-272\n824,32,-216\n784,64,-152\n752,144,-104\n728,256,-72\n712,352,-80\n712,416,-104\n720,432,-144\n728,440,-144\n760,440,-184\n776,456,-168\n784,464,-176\n784,480,-184\n776,496,-184\n768,520,-176\n768,536,-184\n776,552,-232\n800,568,-256\n824,576,-272\n864,600,-304\n904,616,-320\n928,616,-296\n952,608,-280\n968,592,-256\n984,576,-248\n1016,568,-208\n1072,560,-208\n1168,544,-144\n1288,504,-104\n1416,464,-56\n1528,424,-56\n1584,360,-48\n1592,312,-72\n1560,296,-80\n1504,288,-72\n1440,304,-48\n1392,320,-16\n1352,328,48\n1344,336,96\n1352,360,144\n1376,368,160\n1376,384,192\n1368,408,192\n1344,440,176\n1304,480,168\n1248,504,152\n1184,520,136\n1112,520,136\n1056,544,168\n1008,544,152\n952,536,144\n904,528,136\n864,520,128\n840,512,112\n816,504,80\n832,488,64\n840,464,104\n848,432,120\n864,392,128\n864,368,152\n848,328,176\n824,304,184\n800,272,184\n776,264,184\n736,248,184\n704,232,184\n672,224,208\n672,216,168\n648,200,160\n632,184,144\n616,192,136\n608,192,136\n608,192,120\n616,192,112\n608,208,120\n608,216,136\n608,224,104\n616,232,104\n624,240,120\n632,248,136\n672,256,120\n736,256,120\n800,264,128\n888,280,136\n960,304,112\n1040,328,64\n1120,368,32\n1216,400,24\n1280,432,48\n1312,456,40\n1312,464,64\n1280,472,64\n1240,496,40\n1208,512,-40\n1176,544,-144\n1192,592,-224\n1216,648,-272\n1272,696,-280\n1336,720,-240\n1392,720,-152\n1408,672,-40\n1408,616,32\n1360,584,72\n1312,552,64\n1248,528,0\n1184,504,-72\n1120,464,-120\n1048,424,-128\n984,376,-144\n912,336,-120\n840,304,-120\n776,288,-88\n728,272,-72\n696,272,-64\n664,288,-48\n656,312,-64\n656,352,-48\n672,368,-48\n688,416,-64\n712,448,-48\n728,472,-40\n744,496,-48\n744,528,-40\n736,560,-40\n720,592,-64\n704,624,-88\n672,648,-88\n656,648,-96\n648,640,-96\n624,648,-104\n640,640,-144\n680,632,-160\n736,640,-112\n808,624,-96\n888,616,-80\n960,600,-16\n1016,576,-24\n1072,536,-8\n1120,496,8\n1176,464,40\n1240,440,72\n1336,432,64\n1440,424,72\n1512,424,64\n1552,416,64\n1544,432,40\n1496,456,24\n1424,488,0\n1352,528,-8\n1304,560,0\n1296,576,40\n1328,552,88\n1368,544,152\n1408,520,176\n1416,496,208\n1384,472,200\n1336,448,176\n1264,448,160\n1184,440,136\n1112,440,120\n1056,432,112\n992,408,96\n928,384,104\n872,368,80\n816,360,88\n768,360,80\n728,352,64\n696,336,48\n672,320,72\n640,304,56\n640,288,80\n648,280,88\n648,248,96\n648,248,104\n656,232,88\n656,240,96\n664,240,96\n656,232,104\n656,232,96\n656,240,96\n648,248,96\n640,232,104\n640,240,96\n648,240,104\n664,248,112\n680,248,96\n696,248,104\n720,248,80\n760,264,80\n792,280,96\n816,296,96\n848,304,112\n888,320,136\n944,328,144\n1008,360,176\n1088,368,184\n1200,376,192\n1288,384,208\n1352,392,192\n1368,424,144\n1360,448,120\n1312,472,56\n1288,512,-16\n1256,568,-112\n1232,616,-192\n1200,656,-264\n1160,688,-296\n1112,688,-280\n1064,672,-224\n1024,648,-144\n1000,600,-64\n1000,544,-16\n1008,488,-16\n1048,448,-16\n1080,400,-32\n1104,360,-48\n1096,304,-88\n1080,280,-96\n1040,248,-112\n976,208,-120\n920,176,-96\n864,168,-72\n808,168,-72\n760,184,-80\n712,200,-88\n672,208,-80\n648,232,-88\n640,248,-88\n624,280,-80\n624,312,-96\n632,344,-96\n648,384,-112\n664,456,-120\n672,504,-136\n688,552,-136\n688,584,-128\n688,608,-152\n680,616,-152\n680,616,-176\n680,600,-160\n680,592,-160\n696,576,-144\n712,560,-136\n744,544,-144\n776,536,-152\n816,536,-160\n864,520,-144\n912,504,-104\n968,472,-112\n1040,472,-96\n1136,456,-64\n1248,416,-8\n1392,408,48\n1536,400,56\n1664,400,88\n1744,400,72\n1752,424,40\n1704,448,16\n1600,472,16\n1480,472,0\n1360,472,16\n1256,456,32\n1168,432,48\n1112,432,64\n1088,440,72\n1080,440,80\n1096,448,104\n1120,448,112\n1128,472,88\n1120,480,88\n1088,480,80\n1048,480,88\n976,480,72\n912,464,72\n864,464,88\n816,432,88\n776,416,96\n744,384,96\n712,344,72\n680,312,80\n648,280,80\n632,264,88\n608,248,64\n592,240,88\n592,232,96\n600,224,104\n608,216,120\n632,224,112\n648,224,120\n672,240,120\n672,248,120\n672,248,120\n656,256,128\n640,264,128\n632,272,120\n640,280,144\n664,288,144\n680,296,144\n696,304,128\n728,312,128\n752,320,104\n792,336,80\n832,368,48\n896,384,56\n952,408,48\n1040,440,64\n1136,464,48\n1256,480,72\n1368,488,64\n1456,480,72\n1488,480,48\n1480,480,8\n1440,504,0\n1384,496,-40\n1344,496,-64\n1312,488,-112\n1256,472,-136\n1200,440,-168\n1128,408,-192\n1056,400,-192\n1000,392,-184\n984,384,-168\n976,384,-144\n1016,368,-152\n1080,352,-120\n1144,328,-120\n1168,296,-120\n1160,272,-104\n1104,248,-88\n1040,248,-96\n952,248,-88\n872,264,-88\n792,264,-104\n720,288,-64\n656,296,-56\n592,304,-40\n536,328,-8\n504,344,8\n480,352,8\n464,360,8\n464,376,40\n464,392,40\n472,392,40\n496,400,48\n520,408,40\n560,416,40\n592,432,40\n624,440,32\n648,448,16\n664,448,0\n680,464,-8\n704,472,-48\n728,480,-80\n760,504,-104\n800,544,-152\n856,560,-176\n904,576,-144\n960,584,-120\n1008,576,-136\n1056,560,-104\n1120,536,-96\n1184,512,-88\n1264,504,-48\n1368,480,-24\n1464,464,-40\n1552,448,-56\n1592,416,-64\n1576,384,-64\n1504,368,-64\n1408,352,-80\n1312,344,-72\n1224,360,-48\n1168,376,-48\n1136,400,-40\n1128,416,-40\n1144,432,-32\n1176,448,-32\n1192,464,-72\n1176,456,-24\n1128,472,-8\n1096,480,-72\n1064,472,-48\n1016,480,-16\n976,456,-56\n944,432,-64\n912,424,-40\n888,416,-32\n848,408,0\n816,392,16\n776,376,24\n752,352,24\n728,336,24\n704,312,32\n680,296,32\n672,296,32\n656,280,56\n656,280,56\n664,288,64\n680,280,72\n688,280,80\n712,288,80\n728,280,80\n736,280,80\n752,272,80\n752,256,72\n760,256,88\n768,264,96\n792,264,96\n816,264,88\n832,272,88\n832,272,80\n848,280,88\n856,280,96\n864,288,104\n888,296,112\n904,304,112\n936,304,128\n976,320,128\n1008,328,128\n1056,352,104\n1112,376,88\n1168,408,56\n1216,424,80\n1232,448,64\n1216,464,48\n1176,464,32\n1128,472,-16\n1072,480,-96\n1032,496,-152\n992,512,-200\n960,528,-216\n960,536,-200\n984,520,-160\n1016,496,-112\n1056,464,-80\n1104,424,-32\n1128,400,8\n1144,376,32\n1152,352,40\n1128,336,24\n1096,320,16\n1064,304,-24\n1016,264,-40\n968,248,-72\n912,240,-96\n840,248,-112\n784,248,-136\n720,264,-120\n664,288,-88\n600,304,-64\n560,320,-56\n528,336,-24\n520,360,-24\n520,384,-8\n544,400,-16\n568,416,-16\n616,432,-16\n656,456,-32\n688,480,-24\n720,488,-24\n728,496,-32\n752,504,-64\n760,496,-72\n760,496,-80\n768,480,-80\n776,480,-56\n792,464,-80\n816,456,-72\n840,456,-112\n872,456,-144\n912,464,-160\n952,472,-184\n992,472,-152\n1048,464,-112\n1112,448,-64\n1176,416,24\n1232,384,120\n1288,352,128\n1360,376,96\n1432,416,96\n1480,456,48\n1496,496,16\n1480,528,-16\n1432,560,-56\n1360,592,-80\n1280,632,-80\n1200,648,-64\n1128,656,-16\n1080,648,24\n1056,632,48\n1056,608,80\n1072,576,88\n1096,536,104\n1112,504,104\n1112,464,112\n1088,432,88\n1048,408,104\n992,384,72\n952,376,64\n912,352,72\n864,336,56\n824,328,64\n792,312,64\n760,312,56\n736,312,56\n704,304,56\n688,312,48\n688,312,48\n696,312,72\n720,320,80\n752,304,88\n776,296,120\n784,296,128\n784,280,152\n784,288,128\n776,288,128\n768,288,120\n752,280,112\n744,288,120\n728,280,128\n712,280,120\n712,272,112\n704,288,136\n704,296,128\n712,296,136\n712,296,128\n720,288,112\n728,304,88\n744,328,80\n776,336,96\n832,344,104\n888,360,104\n952,376,120\n1032,392,136\n1128,392,96\n1216,400,96\n1304,432,96\n1376,448,88\n1408,472,80\n1392,488,48\n1336,504,24\n1272,504,-32\n1224,520,-112\n1176,544,-168\n1136,552,-216\n1096,552,-216\n1048,536,-208\n1008,504,-184\n976,456,-160\n960,408,-120\n952,368,-128\n968,336,-112\n1000,312,-120\n1016,296,-120\n1024,272,-120\n1024,256,-120\n992,232,-136\n960,216,-144\n912,208,-152\n864,200,-128\n808,208,-128\n760,224,-112\n704,232,-96\n664,248,-80\n616,272,-80\n584,288,-64\n552,312,-32\n544,336,-40\n544,344,-48\n560,376,-32\n576,392,-24\n616,408,-32\n656,432,-8\n688,440,-56\n704,456,-40\n720,472,-56\n720,480,-64\n728,480,-64\n744,480,-48\n760,480,-72\n792,472,-72\n832,480,-72\n872,480,-56\n904,472,-72\n944,464,-48\n952,456,-24\n960,432,-32\n968,408,-32\n984,392,-32\n1008,384,-16\n1048,384,-8\n1104,384,0\n1168,400,24\n1240,408,16\n1312,432,24\n1376,456,0\n1416,496,8\n1440,512,-16\n1424,552,-40\n1360,560,-56\n1256,560,-32\n1168,552,-24\n1096,560,16\n1072,552,-16\n1072,552,-8\n1088,552,-8\n1120,544,-16\n1136,520,-24\n1120,496,-24\n1088,472,-24\n1048,456,-16\n1000,424,-24\n952,408,-32\n912,384,-8\n864,360,0\n824,336,-8\n800,320,-16\n768,296,-8\n744,272,-16\n720,256,-8\n688,248,0\n672,240,-8\n656,232,16\n656,240,8\n664,240,8\n672,264,16\n688,272,32\n720,280,56\n752,296,48\n776,288,64\n792,288,88\n792,280,96\n792,272,96\n792,272,96\n776,272,88\n784,272,88\n792,296,72\n808,304,72\n840,312,48\n872,336,48\n896,344,56\n912,352,64\n936,360,64\n944,360,80\n952,360,112\n968,368,96\n1008,376,88\n1056,384,72\n1112,400,64\n1176,408,56\n1240,416,56\n1288,432,48\n1304,432,56\n1280,432,56\n1232,432,8\n1160,424,-16\n1080,424,-64\n1000,408,-88\n904,408,-120\n832,408,-152\n776,416,-144\n760,408,-160\n776,400,-120\n848,392,-72\n944,376,-72\n1032,360,-24\n1112,352,16\n1152,344,16\n1136,336,8\n1088,336,-32\n1008,336,-56\n936,320,-80\n856,328,-96\n792,312,-128\n736,320,-120\n696,320,-128\n648,320,-120\n624,328,-120\n608,328,-96\n600,336,-96\n616,344,-88\n632,360,-80\n656,368,-88\n680,368,-88\n688,376,-96\n688,392,-120\n688,400,-136\n680,408,-120\n664,424,-144\n664,416,-128\n656,416,-144\n656,408,-176\n664,408,-168\n688,424,-168\n728,440,-208\n784,464,-200\n840,480,-192\n896,496,-160\n960,504,-160\n1000,504,-128\n1032,504,-104\n1064,496,-72\n1112,504,-48\n1184,520,-64\n1280,528,-40\n1384,536,-48\n1488,544,-56\n1544,536,-64\n1544,520,-64\n1480,512,-40\n1384,504,-24\n1280,504,40\n1216,496,64\n1200,488,80\n1208,480,88\n1240,480,96\n1288,472,96\n1304,456,96\n1280,456,64\n1232,464,56\n1176,456,16\n1112,472,-8\n1048,472,8\n992,472,0\n936,472,40\n896,464,32\n864,440,64\n840,408,80\n816,384,72\n792,360,56\n760,336,40\n736,312,64\n704,296,48\n688,296,32\n672,272,32\n672,272,40\n688,280,48\n704,272,56\n720,264,88\n736,264,80\n744,256,96\n752,248,72\n744,248,72\n736,248,72\n728,240,64\n720,248,72\n728,248,96\n744,256,104\n736,248,104\n744,240,104\n760,256,104\n760,264,96\n776,264,104\n784,272,88\n800,296,96\n816,304,112\n848,328,112\n896,344,96\n952,352,120\n1016,368,112\n1096,392,104\n1168,400,104\n1240,440,96\n1264,456,88\n1280,480,40\n1256,488,8\n1232,512,-24\n1192,528,-112\n1128,536,-144\n1072,536,-168\n1032,536,-176\n984,528,-152\n984,512,-128\n1016,488,-96\n1080,464,-56\n1152,432,-16\n1216,400,16\n1248,376,16\n1240,368,24\n1176,360,16\n1112,344,-16\n1032,328,-64\n960,328,-80\n888,312,-128\n824,280,-160\n760,264,-168\n696,256,-144\n648,256,-120\n616,264,-80\n584,264,-72\n584,264,-56\n584,264,-56\n608,288,-56\n632,304,-56\n672,328,-48\n696,360,-56\n720,400,-72\n744,432,-96\n752,464,-120\n744,488,-128\n728,488,-112\n712,488,-120\n696,488,-136\n704,472,-136\n704,472,-152\n728,488,-144\n768,504,-152\n808,504,-168\n856,504,-176\n904,520,-184\n960,528,-192\n1016,520,-168\n1056,496,-104\n1104,464,-48\n1144,440,24\n1200,416,32\n1272,400,24\n1344,400,24\n1400,432,8\n1432,456,8\n1424,480,-40\n1392,504,-56\n1368,520,-8\n1352,544,0\n1344,552,40\n1336,560,64\n1336,568,64\n1352,576,48\n1336,584,48\n1320,584,32\n1288,568,16\n1240,560,-8\n1184,536,0\n1128,520,24\n1072,480,48\n1016,440,64\n952,400,88\n896,376,64\n848,352,72\n816,328,80\n768,304,64\n736,280,56\n704,264,72\n696,248,64\n672,248,64\n648,256,80\n640,256,72\n616,248,64\n616,256,64\n616,264,48\n624,264,32\n640,280,40\n664,280,56\n688,288,64\n720,288,112\n736,272,112\n744,264,104\n752,248,104\n752,248,112\n768,248,120\n800,256,112\n840,264,128\n880,272,136\n920,296,136\n944,312,128\n960,320,160\n960,320,144\n960,336,136\n960,336,168\n992,344,152\n1040,360,168\n1088,376,136\n1136,384,128\n1160,400,88\n1168,424,48\n1168,440,24\n1136,472,-72\n1088,496,-144\n1040,520,-200\n1016,552,-216\n1000,576,-224\n1008,576,-208\n1048,568,-184\n1112,544,-128\n1176,512,-80\n1224,448,-40\n1248,392,-24\n1240,352,-8\n1192,320,8\n1120,280,24\n1048,256,16\n976,224,-8\n896,192,-40\n824,168,-48\n760,152,-56\n712,152,-104\n672,176,-128\n640,184,-104\n608,208,-112\n600,232,-112\n600,232,-88\n616,248,-72\n632,272,-56\n648,304,-48\n664,336,-64\n680,384,-64\n688,400,-80\n696,448,-96\n696,480,-128\n696,496,-120\n696,512,-120\n696,520,-112\n720,520,-96\n736,528,-112\n768,528,-128\n816,544,-136\n872,552,-128\n936,568,-144\n976,560,-128\n1032,552,-128\n1064,536,-112\n1096,520,-96\n1120,512,-80\n1160,504,-48\n1216,496,-24\n1288,480,-32\n1360,480,-48\n1400,488,-56\n1400,504,-80\n1376,528,-112\n1344,552,-112\n1304,576,-64\n1280,592,-56\n1288,592,-8\n1312,584,24\n1344,568,32\n1376,560,0\n1368,552,0\n1336,536,0\n1288,520,-8\n1240,496,-8\n1200,488,24\n1152,456,56\n1112,432,64\n1072,400,64\n1024,384,80\n968,360,80\n904,336,80\n848,320,96\n792,304,72\n736,288,72\n696,272,72\n656,264,64\n616,248,72\n584,248,72\n576,248,80\n576,248,80\n584,256,96\n600,256,96\n608,264,112\n616,264,104\n632,264,120\n640,272,128\n664,280,112\n680,288,112\n696,296,120\n720,304,128\n752,312,144\n784,312,136\n824,320,144\n856,312,144\n896,312,144\n928,304,160\n968,320,144\n1008,320,152\n1048,336,152\n1136,344,152\n1216,368,176\n1312,392,144\n1368,408,120\n1392,424,96\n1368,432,56\n1320,440,24\n1256,440,-8\n1208,440,-56\n1144,440,-80\n1088,440,-128\n1032,448,-168\n960,456,-224\n904,464,-248\n848,480,-248\n824,480,-200\n856,456,-160\n912,432,-104\n976,392,-48\n1056,344,24\n1120,296,48\n1144,248,72\n1136,216,88\n1088,192,72\n1024,184,56\n960,192,16\n880,200,-24\n808,224,-56\n744,240,-80\n680,264,-96\n640,288,-104\n608,312,-104\n584,320,-104\n584,336,-72\n600,352,-48\n624,376,-32\n648,400,-16\n688,408,24\n712,424,16\n736,440,-32\n760,472,-40\n776,488,-64\n800,512,-80\n808,536,-96\n816,552,-96\n832,560,-88\n840,560,-120\n856,568,-136\n880,576,-168\n912,592,-184\n952,600,-184\n1000,608,-208\n1048,592,-208\n1080,576,-200\n1104,552,-200\n1120,536,-200\n1128,520,-200\n1144,496,-176\n1168,464,-136\n1200,440,-136\n1248,408,-104\n1312,384,-104\n1352,360,-96\n1376,344,-152\n1352,336,-160\n1296,360,-184\n1224,376,-176\n1152,408,-144\n1136,376,80\n1176,408,64\n1208,448,16\n1216,480,-40\n1192,520,-96\n1160,544,-168\n1120,576,-248\n1080,600,-288\n1056,624,-288\n1080,632,-272\n1128,624,-224\n1208,576,-144\n1288,528,-40\n1360,472,48\n1384,424,136\n1360,384,176\n1312,352,160\n1224,328,128\n1144,304,72\n1072,272,24\n1016,240,-64\n960,216,-88\n904,208,-88\n856,216,-88\n824,224,-56\n800,240,-48\n776,248,-48\n760,264,-32\n768,280,-16\n760,312,-64\n760,352,-96\n784,400,-144\n792,448,-168\n816,504,-184\n816,552,-160\n824,560,-112\n808,544,-80\n792,528,-96\n792,520,-120\n776,512,-152\n768,504,-168\n768,504,-184\n776,504,-152\n784,488,-160\n808,488,-216\n848,488,-232\n880,488,-224\n928,472,-200\n976,456,-176\n1032,448,-144\n1096,440,-104\n1160,432,-112\n1200,424,-104\n1224,432,-80\n1256,440,-72\n1272,448,-88\n1288,456,-96\n1280,464,-104\n1248,472,-120\n1208,496,-136\n1176,520,-128\n1160,552,-136\n1168,600,-136\n1192,608,-104\n1208,616,-48\n1224,616,24\n1248,608,56\n1280,592,112\n1312,568,120\n1336,552,104\n1344,528,40\n1328,512,40\n1296,472,32\n1256,424,16\n1216,400,24\n1160,368,32\n1120,328,48\n1072,304,24\n1016,296,24\n984,304,32\n960,312,16\n960,328,48\n960,336,48\n952,344,56\n968,336,64\n960,320,64\n952,312,96\n936,304,88\n920,304,104\n888,296,104\n864,280,96\n824,264,104\n784,256,88\n736,248,104\n688,232,80\n640,224,96\n592,216,88\n560,208,88\n536,208,88\n520,208,88\n504,208,104\n496,192,104\n496,192,112\n520,192,96\n544,208,104\n568,232,96\n608,248,80\n640,264,88\n688,264,80\n744,280,80\n808,304,72\n888,328,64\n976,352,48\n1064,384,64\n1160,408,64\n1264,440,72\n1344,456,112\n1400,480,136\n1432,488,152\n1432,496,144\n1400,504,88\n1352,512,0\n1296,512,-72\n1248,520,-128\n1216,536,-144\n1208,520,-128\n1232,512,-120\n1288,488,-48\n1328,472,0\n1352,432,40\n1344,416,56\n1288,400,64\n1208,384,56\n1136,376,40\n1056,368,-24\n984,360,-56\n920,352,-80\n856,360,-104\n800,352,-144\n752,360,-152\n712,368,-152\n680,368,-176\n648,368,-152\n632,376,-144\n624,384,-144\n632,400,-160\n640,424,-160\n672,448,-200\n704,480,-216\n736,504,-256\n752,536,-264\n768,544,-280\n784,552,-296\n800,560,-336\n800,544,-320\n816,544,-304\n824,520,-296\n848,496,-264\n880,456,-256\n912,448,-248\n944,432,-224\n984,416,-208\n1016,408,-192\n1072,392,-144\n1096,384,-136\n1136,368,-128\n1176,360,-80\n1216,360,-40\n1272,352,0\n1328,360,32\n1392,384,32\n1448,416,0\n1464,448,-16\n1456,480,-80\n1416,536,-120\n1360,552,-160\n1312,568,-120\n1288,552,-64\n1280,544,0\n1296,528,72\n1336,496,128\n1376,480,128\n1392,480,128\n1376,488,144\n1328,488,112\n1264,472,88\n1192,488,80\n1120,496,88\n1064,488,104\n992,480,112\n936,464,128\n896,440,144\n856,416,152\n824,384,152\n792,352,144\n776,328,160\n760,304,120\n736,280,136\n728,256,128\n704,248,128\n704,240,112\n704,240,120\n720,240,112\n744,248,120\n760,240,136\n760,248,128\n760,240,144\n744,224,168\n736,224,168\n712,232,144\n712,240,144\n704,240,136\n720,248,136\n728,256,120\n752,248,144\n768,272,144\n792,272,136\n816,280,112\n832,288,104\n856,288,128\n896,304,104\n952,320,120\n1024,344,112\n1104,368,88\n1184,400,80\n1248,424,72\n1280,448,56\n1280,472,24\n1256,480,-8\n1208,496,-80\n1144,504,-152\n1104,528,-232\n1064,544,-288\n1040,568,-296\n1024,560,-304\n1032,528,-216\n1072,472,-152\n1136,416,-80\n1216,344,16\n1288,296,72\n1320,256,112\n1320,216,72\n1280,208,72\n1208,208,40\n1120,200,0\n1064,200,-96\n1008,192,-88\n952,184,-216\n888,168,-280\n840,144,-248\n784,160,-168\n736,216,-112\n704,328,-40\n696,440,-40\n680,536,-40\n680,552,-56\n696,536,-64\n720,512,-88\n744,496,-72\n768,504,-64\n792,528,-72\n800,560,-112\n784,584,-112\n768,616,-120\n744,616,-136\n744,600,-152\n744,592,-160\n760,584,-152\n792,592,-184\n824,592,-168\n880,592,-184\n928,584,-200\n984,584,-224\n1024,584,-208\n1056,568,-192\n1080,536,-152\n1096,504,-120\n1120,464,-72\n1160,424,-64\n1224,392,-56\n1304,392,-40\n1384,400,-32\n1456,416,-56\n1472,416,-56\n1440,432,-56\n1368,448,-56\n1280,448,-56\n1200,464,-56\n1144,472,-32\n1112,472,-24\n1104,488,-24\n1136,512,-16\n1176,520,0\n1208,536,-8\n1216,528,-16\n1192,528,-8\n1136,536,-40\n1088,544,-64\n1048,544,-32\n1016,544,-16\n1000,544,16\n984,528,72\n984,480,96\n984,448,96\n984,416,120\n968,384,104\n960,344,128\n928,328,104\n912,304,104\n896,288,80\n880,272,80\n880,272,72\n880,256,96\n888,248,104\n896,224,120\n888,216,144\n880,216,176\n864,224,144\n848,216,160\n832,232,144\n832,240,128\n808,256,144\n800,248,152\n792,248,152\n784,248,160\n768,264,160\n760,264,144\n744,264,136\n744,272,104\n744,280,88\n760,296,72\n776,312,96\n800,320,96\n840,328,104\n888,336,104\n952,336,80\n992,352,48\n1032,360,40\n1056,376,16\n1056,384,-24\n1040,392,-32\n1024,408,-80\n1008,424,-128\n1000,440,-152\n992,464,-192\n1000,472,-200\n1008,472,-224\n1024,480,-208\n1040,456,-168\n1080,424,-128\n1128,408,-96\n1184,392,-32\n1240,376,32\n1280,352,64\n1296,344,96\n1296,328,88\n1248,304,72\n1200,280,32\n1144,280,-16\n1096,272,-64\n1040,280,-96\n992,280,-112\n944,280,-128\n888,288,-112\n856,296,-80\n816,320,-56\n784,336,-32\n776,376,-8\n760,416,-16\n760,456,0\n768,488,0\n776,512,16\n792,536,0\n784,568,-24\n776,584,-24\n768,600,-32\n768,600,-24\n768,592,-48\n752,584,-72\n760,568,-104\n760,576,-136\n768,568,-144\n776,576,-192\n808,592,-208\n832,600,-200\n872,592,-200\n896,576,-160\n944,560,-128\n1000,544,-112\n1072,536,-72\n1176,528,-48\n1304,528,-24\n1424,512,0\n1536,488,0\n1576,464,-16\n1560,448,-24\n1488,456,-48\n1408,456,-40\n1328,464,-48\n1256,488,-40\n1216,488,0\n1200,496,-8\n1200,496,24\n1208,496,16\n1216,496,32\n1224,512,16\n1208,520,32\n1184,520,0\n1144,520,-24\n1096,528,-40\n1048,536,-40\n1008,536,-16\n976,528,8\n952,512,56\n952,472,72\n952,440,88\n968,384,104\n952,360,80\n944,328,88\n912,312,72\n888,296,72\n848,280,80\n816,272,88\n792,248,96\n776,232,88\n752,224,80\n744,216,88\n736,224,88\n728,224,88\n744,240,96\n744,264,80\n736,264,88\n728,264,96\n720,256,88\n704,264,112\n696,264,104\n688,264,120\n688,264,112\n696,264,112\n712,264,136\n736,264,136\n752,272,128\n776,280,128\n808,288,112\n840,288,128\n888,304,136\n952,312,120\n1024,328,152\n1104,352,200\n1192,360,160\n1256,368,128\n1288,376,80\n1288,408,32\n1256,424,16\n1192,440,-64\n1152,464,-120\n1104,480,-160\n1064,496,-224\n1032,504,-240\n1000,520,-256\n976,512,-248\n992,504,-216\n1000,472,-160\n1032,440,-120\n1064,424,-64\n1096,392,-56\n1104,368,-16\n1112,336,24\n1112,312,8\n1080,288,-8\n1072,264,-64\n1048,248,-96\n1016,232,-128\n968,224,-120\n912,240,-120\n864,240,-96\n816,272,-104\n768,288,-64\n720,304,-40\n696,320,-24\n680,344,-16\n688,368,8\n712,392,8\n736,432,0\n760,464,8\n776,496,0\n792,520,-8\n792,552,0\n784,568,-40\n768,592,-56\n744,600,-72\n744,616,-96\n736,616,-120\n736,608,-96\n752,600,-88\n792,592,-104\n832,592,-104\n888,592,-112\n936,592,-104\n992,584,-104\n1040,568,-88\n1096,544,-72\n1160,520,-32\n1224,480,-16\n1280,432,16\n1336,392,8\n1384,360,0\n1392,328,-32\n1336,328,-56\n1272,344,-64\n1192,360,-72\n1136,384,-72\n1080,416,-72\n1056,448,-32\n1064,472,16\n1112,512,8\n1184,568,48\n1256,608,64\n1312,648,64\n1320,664,64\n1296,680,32\n1240,672,8\n1160,656,-32\n1088,640,-8\n1024,600,0\n976,552,40\n944,504,56\n912,464,64\n880,416,72\n848,368,80\n824,320,72\n800,296,64\n784,264,80\n776,224,64\n776,200,72\n784,200,64\n792,216,64\n808,224,72\n832,232,72\n848,232,80\n856,240,80\n856,240,88\n864,240,112\n840,240,96\n832,248,112\n832,248,104\n824,248,120\n824,248,128\n832,256,120\n840,248,152\n848,248,136\n848,264,144\n848,264,128\n848,272,96\n840,288,96\n848,304,88\n848,320,104\n872,328,88\n904,344,104\n968,352,104\n1016,376,96\n1080,384,96\n1128,392,96\n1128,408,88\n1096,416,80\n1064,424,56\n1032,448,32\n1016,472,8\n1016,480,-48\n1016,496,-88\n1008,512,-136\n1016,520,-136\n1024,520,-160\n1032,520,-136\n1056,504,-80\n1088,480,-40\n1120,448,8\n1144,416,24\n1144,384,48\n1128,352,56\n1096,328,40\n1056,296,40\n1008,272,-8\n960,256,-48\n904,240,-80\n856,240,-88\n800,240,-96\n752,256,-88\n712,264,-72\n688,272,-72\n680,288,-72\n680,296,-64\n704,304,-56\n728,320,-48\n760,344,-56\n792,368,-48\n808,392,-72\n816,416,-104\n808,456,-144\n792,480,-168\n1344,520,0\n1352,504,64\n1360,488,72\n1352,464,80\n1360,448,88\n1360,440,88\n1360,432,64\n1328,416,56\n1304,416,24\n1248,424,0\n1184,424,8\n1128,424,8\n1064,440,16\n1016,432,56\n968,424,56\n920,408,56\n880,400,80\n840,392,72\n800,376,72\n768,368,56\n744,352,64\n728,336,64\n720,328,80\n720,312,80\n736,296,104\n752,280,104\n752,256,128\n760,248,120\n752,240,136\n736,232,128\n712,224,128\n704,224,136\n688,224,120\n672,216,120\n656,224,120\n656,232,144\n648,240,144\n648,240,144\n656,240,136\n664,248,120\n680,248,112\n712,264,88\n736,280,96\n784,296,96\n848,320,120\n912,344,112\n984,368,112\n1072,392,80\n1160,424,56\n1240,448,40\n1296,472,24\n1304,480,8\n1272,504,-40\n1224,512,-72\n1184,520,-88\n1176,536,-112\n1176,560,-104\n1176,544,-104\n1200,520,-128\n1208,496,-104\n1192,464,-88\n1192,456,-64\n1200,432,-32\n1224,408,0\n1264,376,32\n1256,344,40\n1240,304,24\n1184,280,8\n1112,248,-16\n1056,232,-48\n992,224,-80\n928,216,-72\n864,224,-64\n800,232,-48\n744,256,-56\n688,272,-48\n632,272,-32\n608,320,-40\n584,368,-32\n576,392,-40\n584,424,-48\n592,448,-40\n624,472,-64\n640,496,-56\n648,504,-48\n664,512,-40\n672,512,-40\n680,520,-56\n696,512,-64\n696,512,-104\n712,520,-104\n728,520,-128\n752,520,-136\n800,520,-104\n832,520,-88\n880,504,-88\n928,496,-96\n976,488,-96\n1008,480,-104\n1056,480,-88\n1112,488,-88\n1184,496,-80\n1256,512,-40\n1344,512,-40\n1424,520,-8\n1480,520,-16\n1520,520,-48\n1520,520,-88\n1480,528,-120\n1392,528,-128\n1280,528,-120\n1184,520,-88\n1104,496,-56\n1056,480,0\n1040,472,24\n1064,488,8\n1104,480,48\n1160,480,56\n1200,488,48\n1224,488,24\n1216,480,16\n1192,480,24\n1152,464,24\n1104,456,40\n1064,432,64\n1024,408,64\n984,384,56\n944,376,48\n920,360,48\n904,344,56\n896,320,56\n872,296,72\n848,288,80\n816,288,96\n800,288,112\n776,288,104\n760,288,120\n744,280,112\n744,288,120\n752,280,128\n752,280,104\n768,280,112\n768,288,96\n760,280,120\n744,272,120\n720,280,128\n704,272,112\n696,272,136\n680,256,112\n664,256,88\n664,256,104\n672,256,88\n696,264,64\n712,264,64\n728,272,56\n744,280,64\n776,272,88\n824,280,104\n888,288,96\n944,296,104\n1008,304,96\n1080,328,88\n1144,360,64\n1208,384,72\n1248,408,72\n1264,432,64\n1240,456,40\n1216,464,8\n1184,472,-32\n1168,480,-72\n1160,504,-120\n1136,520,-184\n1120,528,-208\n1096,536,-208\n1088,528,-184\n1088,512,-144\n1096,488,-96\n1104,456,-32\n1120,424,8\n1120,392,32\n1128,368,40\n1112,344,40\n1088,328,24\n1048,296,-32\n1024,288,-56\n984,280,-64\n928,280,-80\n864,288,-72\n800,296,-72\n744,304,-56\n696,312,-56\n672,320,-56\n664,328,-56\n664,336,-72\n688,344,-56\n712,376,-72\n728,408,-72\n752,424,-88\n768,440,-104\n784,464,-120\n776,488,-136\n784,488,-152\n776,480,-120\n776,464,-128\n768,448,-136\n768,440,-160\n760,448,-192\n776,464,-200\n784,472,-200\n800,480,-192\n824,488,-192\n864,480,-176\n896,464,-184\n928,464,-192\n952,472,-160\n992,480,-152\n1016,488,-136\n1072,496,-104\n1176,504,-64\n1296,512,-40\n1416,528,-32\n1512,528,-48\n1544,536,-64\n1536,552,-72\n1472,552,-72\n1400,552,-56\n1344,544,-8\n1320,528,16\n1328,496,64\n1328,480,64\n1328,456,80\n1344,456,96\n1344,440,88\n1320,432,80\n1288,432,56\n1248,440,48\n1200,448,48\n1144,456,24\n1088,456,48\n1048,448,56\n1000,456,64\n960,440,56\n912,408,64\n864,400,80\n824,368,88\n784,352,80\n760,328,88\n736,304,96\n728,296,96\n728,272,112\n736,264,112\n752,256,96\n776,256,128\n784,264,104\n784,256,128\n784,256,104\n776,248,120\n776,240,128\n744,232,136\n736,224,136\n712,232,128\n688,224,136\n680,216,128\n680,224,136\n664,224,120\n664,224,120\n656,232,128\n664,232,88\n680,256,72\n712,272,72\n736,296,48\n760,312,72\n816,312,64\n872,320,88\n952,328,88\n1032,344,136\n1128,360,128\n1200,376,136\n1232,392,120\n1232,416,104\n1224,440,88\n1224,464,64\n1232,488,16\n1232,512,-16\n1232,536,-88\n1216,576,-144\n1208,576,-168\n1208,584,-176\n1208,576,-144\n1232,552,-112\n1264,512,-40\n1280,480,8\n1280,440,64\n1256,392,80\n1208,352,88\n1160,312,-16\n1104,280,64\n1056,248,-64\n1000,216,-136\n960,176,-120\n904,176,-104\n840,224,-72\n800,288,-64\n752,352,-32\n696,376,-48\n664,376,-40\n648,352,-64\n648,336,-48\n672,344,-48\n704,368,-48\n728,400,-48\n752,448,-56\n760,488,-72\n760,512,-96\n760,536,-112\n752,544,-112\n752,536,-96\n744,520,-128\n752,512,-120\n776,512,-144\n800,520,-144\n824,536,-176\n856,544,-192\n888,552,-200\n944,544,-216\n976,544,-240\n1008,520,-192\n1032,496,-176\n1064,456,-144\n1104,416,-104\n1168,384,-48\n1248,384,-24\n1344,400,0\n1432,432,-8\n1480,472,-8\n1480,512,8\n1456,544,-16\n1400,560,-8\n1328,560,-24\n1288,568,0\n1232,576,-8\n1200,568,0\n1176,584,8\n1176,592,40\n1192,592,56\n1208,600,56\n1240,592,72\n1248,584,64\n1240,584,80\n1224,568,72\n1184,552,80\n1144,544,104\n1104,520,104\n1072,488,128\n1048,448,144\n1024,408,152\n1008,384,144\n976,360,144\n944,344,168\n920,312,144\n888,296,128\n848,272,136\n808,248,120\n776,240,120\n768,232,112\n760,224,112\n768,232,104\n768,224,128\n784,232,136\n800,240,144\n792,248,136\n776,248,144\n752,240,136\n728,240,136\n712,240,104\n704,248,128\n696,248,144\n696,240,128\n712,232,128\n728,240,128\n744,232,128\n784,240,112\n808,256,104\n848,272,80\n880,280,112\n936,288,112\n992,288,144\n1056,288,128\n1120,296,136\n1176,328,144\n1200,360,128\n1200,368,104\n1176,392,72\n1144,400,40\n1112,408,16\n1080,432,-56\n1032,440,-104\n984,456,-160\n960,472,-184\n960,480,-192\n1000,480,-192\n1088,488,-152\n1192,472,-88\n1288,456,-48\n1368,416,8\n1384,392,56\n1352,376,72\n1272,368,72\n1184,352,56\n1096,352,32\n1016,336,-16\n944,312,-64\n888,304,-88\n824,312,-104\n768,320,-80\n720,312,-72\n688,320,-48\n688,328,-32\n704,336,-48\n744,376,-64\n784,408,-56\n832,432,-40\n872,448,-48\n880,464,-40\n888,488,-32\n888,496,-56\n888,520,-80\n904,536,-112\n904,560,-168\n896,584,-200\n888,600,-240\n872,608,-256\n864,600,-272\n864,584,-264\n888,576,-280\n912,576,-280\n936,576,-288\n968,568,-280\n992,552,-264\n1008,528,-256\n1032,520,-216\n1056,512,-184\n1104,520,-144\n1152,576,-88\n1232,648,-96\n1312,736,-88\n1376,776,-88\n1432,776,-96\n1456,744,-128\n1448,696,-136\n1416,664,-120\n1368,688,-112\n1352,720,-88\n1352,752,-64\n1376,760,-32\n1440,744,16\n1488,720,24\n1536,680,32\n1544,656,40\n1504,656,40\n1456,688,32\n1384,728,8\n1344,768,-8\n1312,752,-8\n1296,704,-8\n1272,656,-32\n1240,624,-32\n1200,624,-24\n1160,672,-64\n1112,728,-72\n1072,768,-72\n1048,792,-88\n1024,760,-64\n1016,704,-56\n992,640,-64\n952,600,-72\n904,584,-88\n848,632,-168\n800,688,-152\n752,712,-192\n720,696,-224\n680,672,-232\n648,600,-248\n616,536,-296\n576,504,-320\n536,480,-304\n496,472,-384\n448,480,-392\n424,480,-472\n392,456,-560\n384,376,-608\n376,280,-664\n360,192,-640\n336,112,-624\n312,64,-592\n272,48,-664\n216,80,-680\n168,96,-728\n136,120,-776\n96,144,-840\n72,112,-912\n80,40,-920\n96,-40,-920\n112,-120,-928\n128,-176,-928\n136,-208,-912\n128,-224,-904\n120,-200,-912\n112,-136,-912\n112,-96,-936\n128,-80,-928\n136,-72,-944\n152,-96,-944\n152,-136,-928\n144,-200,-904\n144,-264,-888\n128,-312,-864\n128,-344,-840\n136,-384,-768\n152,-400,-736\n168,-400,-656\n176,-392,-592\n160,-384,-512\n136,-384,-464\n104,-384,-416\n64,-368,-376\n32,-336,-312\n-8,-296,-280\n-40,-256,-248\n-56,-224,-264\n-64,-224,-272\n-56,-200,-280\n-48,-168,-368\n-24,-120,-496\n24,-56,-568\n56,-8,-656\n96,-16,-672\n112,-56,-680\n112,-96,-632\n112,-152,-544\n120,-192,-464\n144,-216,-376\n192,-240,-296\n232,-256,-224\n296,-264,-224\n360,-264,-200\n440,-256,-192\n528,-240,-168\n624,-184,-176\n728,-128,-176\n840,-96,-176\n952,-64,-152\n1064,-40,-136\n1184,-16,-104\n1296,24,-128\n1424,104,-144\n1544,224,-168\n1664,280,-176\n1768,320,-160\n1856,352,-104\n1912,392,-88\n1960,432,-88\n1992,472,-80\n2032,520,-72\n2080,536,-80\n2136,512,-120\n2176,472,-176\n2184,456,-232\n2160,496,-248\n2112,560,-224\n2064,648,-152\n2024,752,-104\n2008,824,-96\n1968,864,-72\n1896,872,-32\n1784,848,0\n1656,800,16\n1536,728,8\n1408,640,-72\n1288,568,-136\n1168,488,-200\n1048,400,-272\n928,328,-320\n808,288,-344\n688,248,-360\n576,216,-360\n480,200,-376\n400,200,-392\n344,216,-400\n320,240,-416\n328,272,-384\n352,320,-360\n416,376,-328\n472,440,-288\n544,504,-264\n616,568,-248\n688,616,-224\n768,656,-184\n840,672,-136\n904,672,-104\n952,664,-56\n992,664,-32\n1008,656,-32\n1024,664,16\n1056,648,40\n1096,632,56\n1128,584,56\n1176,544,88\n1200,496,88\n1232,448,72\n1256,400,64\n1272,344,56\n1280,320,72\n1280,312,64\n1280,336,64\n1280,384,56\n1288,440,72\n1304,512,72\n1328,584,88\n1352,632,88\n1392,672,120\n1440,696,168\n1480,704,192\n1520,704,192\n1520,680,216\n1472,640,224\n1344,592,208\n1200,560,208\n1064,536,176\n944,520,96\n856,528,48\n816,560,8\n816,584,32\n864,600,48\n944,608,104\n1056,616,144\n1144,640,200\n1216,688,192\n1272,736,216\n1304,744,208\n1336,728,216\n1352,696,184\n1344,632,144\n1320,576,88\n1272,528,40\n1200,496,-16\n1120,448,-64\n1024,424,-120\n928,440,-184\n832,480,-232\n744,544,-264\n680,576,-288\n640,568,-296\n616,520,-312\n600,472,-368\n568,456,-384\n544,432,-440\n504,432,-464\n472,464,-448\n432,456,-488\n400,424,-472\n368,400,-472\n328,392,-520\n280,408,-568\n240,448,-640\n208,520,-672\n208,568,-712\n232,544,-712\n256,496,-712\n280,424,-744\n288,392,-784\n272,368,-816\n240,400,-864\n192,440,-880\n168,464,-872\n160,440,-944\n152,416,-952\n160,368,-1008\n152,328,-1072\n152,280,-1032\n144,240,-1064\n112,232,-1056\n80,240,-1072\n24,248,-1112\n-24,256,-1152\n-72,240,-1176\n-112,248,-1208\n-144,256,-1200\n-160,264,-1200\n-160,256,-1136\n-160,224,-1080\n-160,184,-1064\n-176,144,-1064\n-200,144,-1088\n-216,152,-1080\n-216,168,-1080\n-200,152,-1040\n-176,120,-1008\n-136,80,-968\n-104,24,-984\n-88,32,-936\n-88,40,-920\n-80,40,-864\n-72,24,-824\n-72,0,-784\n-64,-40,-720\n-56,-72,-704\n-56,-96,-664\n-56,-104,-640\n-88,-96,-640\n-112,-88,-648\n-136,-72,-664\n-152,-72,-704\n-160,-80,-720\n-168,-104,-720\n-160,-136,-720\n-160,-168,-704\n-160,-176,-680\n-160,-184,-664\n-160,-184,-696\n-168,-168,-688\n-184,-176,-720\n-216,-184,-768\n-240,-208,-800\n-256,-240,-800\n-264,-272,-824\n-272,-304,-816\n-264,-312,-808\n-264,-304,-816\n-248,-296,-832\n-240,-288,-872\n-224,-296,-904\n-216,-296,-912\n-200,-280,-952\n-192,-288,-976\n-200,-280,-960\n-208,-304,-992\n-208,-312,-1056\n-200,-320,-1088\n-160,-312,-1136\n-88,-328,-1184\n-40,-336,-1192\n0,-336,-1176\n32,-328,-1144\n64,-296,-1120\n80,-256,-1072\n104,-208,-1040\n144,-176,-1008\n176,-168,-952\n216,-192,-880\n248,-232,-824\n280,-272,-728\n328,-264,-656\n344,-240,-592\n376,-184,-552\n392,-104,-496\n400,-48,-464\n416,-16,-464\n424,8,-400\n424,0,-400\n424,-8,-360\n408,-16,-304\n392,-32,-288\n384,-40,-256\n400,-40,-248\n408,32,-232\n408,144,-192\n416,240,-216\n440,280,-248\n456,272,-208\n488,248,-200\n536,232,-200\n616,248,-208\n696,328,-136\n784,472,-128\n888,616,-232\n960,648,-216\n1040,616,-208\n1112,544,-232\n1184,472,-184\n1256,432,-112\n1352,408,-88\n1480,440,-64\n1632,496,-32\n1824,528,-8\n1984,544,0\n2104,592,8\n2136,656,-8\n2128,736,-24\n2096,824,-80\n2056,920,-96\n2000,1016,-104\n1928,1080,-56\n1840,1120,8\n1736,1112,96\n1632,1104,112\n1560,1072,80\n1488,1048,16\n1432,1024,-48\n1384,984,-88\n1328,936,-112\n1288,880,-112\n1248,848,-120\n1224,816,-120\n1200,800,-192\n1168,792,-208\n1128,800,-216\n1072,800,-224\n1008,784,-232\n944,760,-192\n904,736,-176\n880,688,-160\n848,648,-104\n824,608,-88\n800,568,-80\n768,536,-48\n760,520,-32\n752,496,0\n752,472,24\n776,440,32\n808,424,72\n848,408,80\n888,408,88\n928,400,96\n968,400,112\n1000,424,112\n1032,440,88\n1048,448,96\n1072,456,48\n1072,448,72\n1072,432,40\n1064,432,80\n1056,416,72\n1056,416,88\n1064,392,88\n1096,368,104\n1120,336,120\n1144,328,136\n1160,312,152\n1152,304,184\n1136,288,200\n1128,288,224\n1128,296,216\n1160,304,216\n1184,320,216\n1208,328,192\n1200,344,176\n1208,368,152\n1208,384,136\n1200,392,72\n1152,384,72\n1080,384,24\n1000,376,-40\n912,360,-80\n848,320,-112\n816,296,-136\n800,272,-168\n816,264,-152\n856,256,-136\n920,248,-88\n1000,256,-72\n1072,248,-40\n1120,216,8\n1136,192,24\n1128,168,40\n1096,144,40\n1040,120,40\n984,112,32\n936,120,0\n872,136,-40\n824,152,-80\n784,160,-80\n744,176,-112\n720,200,-120\n712,224,-112\n696,240,-96\n704,248,-64\n712,272,-40\n728,304,-16\n760,320,-8\n800,336,32\n848,360,8\n912,384,-8\n960,408,-56\n1008,448,-72\n1032,496,-128\n1080,536,-176\n1112,568,-224\n1136,600,-216\n1128,624,-232\n1136,648,-224\n1152,656,-200\n1176,640,-200\n1200,656,-208\n1208,656,-224\n1192,664,-248\n1176,656,-240\n1152,648,-232\n1144,624,-248\n1160,576,-224\n1176,528,-184\n1216,464,-128\n1264,432,-112\n1344,424,-128\n1400,456,-184\n1424,488,-200\n1400,528,-248\n1344,576,-264\n1272,608,-256\n1200,624,-200\n1152,648,-144\n1144,664,-80\n1176,672,-72\n1240,696,-56\n1296,712,-40\n1336,720,-32\n1360,680,-32\n1352,632,8\n1336,576,0\n1320,520,8\n1312,488,32\n1304,440,48\n1288,400,48\n1280,368,56\n1248,328,48\n1208,304,56\n1168,264,80\n1128,232,80\n1072,216,80\n1040,208,96\n1016,208,88\n984,216,88\n976,224,104\n968,248,120\n960,264,112\n952,272,112\n936,272,128\n928,288,128\n904,296,112\n896,312,120\n864,320,136\n848,312,128\n808,304,152\n792,304,152\n776,296,144\n776,280,152\n768,272,152\n768,272,152\n768,256,144\n768,256,152\n768,256,144\n784,248,152\n808,240,160\n840,232,160\n888,240,136\n944,240,144\n976,248,112\n992,272,112\n1016,296,72\n1024,328,32\n1024,336,-8\n1000,368,-24\n976,376,-72\n952,392,-88\n936,400,-88\n928,400,-96\n960,400,-104\n992,392,-96\n1040,392,-96\n1104,384,-64\n1184,376,-56\n1256,376,-24\n1312,368,8\n1352,368,32\n1376,352,56\n1360,352,64\n1336,360,40\n1288,360,0\n1232,360,-64\n1176,360,-120\n1112,368,-152\n1064,368,-152\n1016,352,-144\n968,368,-112\n936,376,-80\n920,384,-56\n912,416,-56\n920,440,-80\n936,480,-72\n952,504,-72\n960,520,-80\n952,544,-56\n944,560,-64\n928,584,-64\n912,592,-88\n888,608,-112\n856,624,-120\n832,624,-128\n808,624,-152\n808,640,-144\n816,640,-160\n848,632,-168\n880,640,-168\n920,640,-144\n952,648,-136\n976,640,-152\n992,640,-160\n1008,640,-136\n1024,624,-120\n1048,600,-80\n1088,584,-32\n1176,560,-48\n1272,560,-72\n1352,568,-80\n1384,600,-128\n1384,632,-152\n1360,656,-152\n1360,672,-120\n1376,656,-72\n1416,640,-24\n1472,608,24\n1544,592,48\n1616,584,72\n1680,568,88\n1712,552,88\n1704,520,80\n1664,480,88\n1616,448,88\n1544,408,104\n1480,376,88\n1408,344,96\n1344,320,72\n1264,304,96\n1200,288,88\n1120,272,96\n1056,256,112\n1000,248,120\n960,240,120\n920,240,96\n888,248,136\n864,240,136\n848,248,112\n832,256,104\n816,256,120\n816,256,128\n800,264,120\n776,280,136\n752,280,136\n728,264,152\n704,248,168\n672,240,176\n640,224,176\n616,200,168\n592,176,160\n576,168,152\n576,176,120\n592,184,136\n608,192,136\n648,208,120\n680,216,136\n728,208,152\n768,208,152\n824,232,144\n880,256,144\n944,280,128\n992,304,120\n1040,328,96\n1064,360,80\n1080,376,72\n1088,400,32\n1080,408,0\n1072,440,-48\n1072,448,-136\n1080,472,-144\n1136,480,-128\n1216,488,-72\n1344,504,-40\n1480,496,8\n1616,472,64\n1712,456,104\n1744,424,120\n1688,416,152\n1608,416,176\n1496,416,120\n1384,416,64\n1296,416,-56\n1216,424,-120\n1128,408,-216\n1048,384,-304\n984,376,-352\n912,344,-312\n840,344,-248\n792,328,-168\n768,328,-112\n776,328,-72\n792,320,-80\n832,328,-96\n864,360,-128\n896,400,-160\n912,448,-184\n904,480,-168\n872,504,-160\n840,520,-136\n808,536,-128\n792,552,-152\n784,584,-168\n792,608,-168\n824,640,-208\n856,672,-208\n872,704,-208\n888,720,-200\n904,736,-200\n928,744,-200\n968,744,-184\n1024,760,-152\n1104,768,-120\n1208,776,-112\n1344,768,-120\n1448,752,-112\n1520,728,-88\n1552,680,-80\n1544,640,-48\n1528,584,-16\n1520,544,24\n1560,512,32\n1632,504,64\n1704,480,80\n1768,472,80\n1792,472,64\n1776,480,56\n1712,456,32\n1632,448,56\n1568,440,48\n1488,432,80\n1416,416,88\n1336,408,128\n1264,392,120\n1184,376,136\n1112,368,128\n1048,344,136\n984,328,120\n944,320,136\n904,312,128\n888,304,112\n880,288,144\n872,272,128\n872,264,128\n880,248,120\n864,248,120\n848,248,136\n832,240,136\n800,224,144\n752,216,152\n704,200,152\n672,192,152\n648,192,128\n640,184,112\n640,176,112\n648,176,128\n656,176,136\n656,176,136\n656,184,144\n656,184,136\n656,192,128\n680,208,136\n720,224,136\n768,248,152\n824,272,160\n872,280,168\n920,304,152\n952,320,160\n984,352,136\n984,376,136\n992,400,88\n1000,432,72\n1000,480,24\n1016,528,-40\n1024,560,-80\n1048,608,-128\n1072,608,-144\n1112,616,-152\n1168,608,-128\n1256,592,-96\n1376,568,-48\n1480,552,-8\n1584,528,40\n1632,504,48\n1616,504,16\n1544,504,-24\n1440,504,-96\n1336,496,-152\n1240,464,-208\n1144,424,-256\n1064,376,-256\n992,328,-264\n920,288,-232\n872,272,-200\n832,280,-200\n808,312,-176\n808,344,-168\n808,384,-176\n824,408,-216\n840,440,-256\n840,464,-280\n840,496,-280\n824,512,-264\n800,512,-256\n776,512,-264\n760,512,-280\n736,504,-312\n720,488,-312\n720,472,-304\n712,464,-288\n736,456,-288\n776,448,-272\n824,440,-280\n880,456,-272\n944,472,-280\n1000,488,-280\n1048,496,-264\n1088,496,-240\n1104,496,-176\n1120,488,-104\n1152,480,-104\n1224,504,-112\n1320,536,-160\n1416,568,-192\n1496,592,-232\n1536,592,-248\n1536,584,-216\n1496,560,-128\n1448,520,-64\n1400,488,-24\n1384,480,16\n1424,472,40\n1480,472,24\n1520,472,24\n1568,464,56\n1576,448,48\n1560,424,56\n1512,408,88\n1448,384,112\n1384,376,144\n1312,360,136\n1240,344,136\n1168,328,128\n1104,312,136\n1040,288,152\n984,288,144\n944,288,136\n904,288,136\n872,280,136\n848,280,144\n832,280,152\n808,272,144\n784,280,128\n768,280,136\n752,288,144\n752,288,168\n744,288,168\n728,280,168\n704,272,184\n672,256,192\n640,240,184\n608,232,176\n584,216,168\n576,216,136\n584,208,136\n616,208,128\n656,224,136\n680,216,144\n704,224,144\n720,216,152\n728,224,144\n752,216,152\n800,232,136\n856,256,136\n912,264,128\n976,304,120\n1024,328,112\n1056,360,64\n1080,368,40\n1080,376,8\n1064,392,-16\n1048,416,-48\n1040,424,-40\n1056,416,-56\n1088,432,-48\n1160,432,-16\n1280,440,0\n1416,448,48\n1552,456,48\n1680,472,40\n1744,472,48\n1736,472,48\n1656,472,24\n1552,472,8\n1440,472,-40\n1328,472,-120\n1216,456,-200\n1128,432,-240\n1024,400,-256\n928,368,-256\n856,336,-216\n800,312,-176\n776,312,-136\n776,304,-96\n792,328,-88\n808,344,-104\n840,376,-128\n848,408,-160\n864,448,-168\n864,472,-184\n856,504,-184\n840,536,-192\n824,552,-200\n808,560,-208\n792,568,-216\n776,584,-248\n776,608,-248\n784,632,-272\n800,648,-272\n824,648,-256\n856,648,-232\n888,640,-232\n928,624,-216\n968,624,-184\n1024,624,-184\n1080,592,-144\n1144,592,-112\n1240,584,-96\n1336,584,-120\n1432,600,-152\n1480,616,-160\n1504,624,-152\n1496,616,-104\n1472,600,-56\n1480,560,8\n1488,528,48\n1520,520,72\n1576,512,80\n1640,504,104\n1688,512,104\n1712,496,120\n1704,480,128\n1672,432,120\n1624,400,120\n1568,384,144\n1496,376,136\n1416,360,152\n1336,360,144\n1248,336,136\n1184,352,120\n1120,352,120\n1080,360,128\n1056,360,136\n1048,344,152\n1032,336,184\n1016,320,200\n992,304,216\n960,280,200\n936,280,224\n912,272,200\n880,264,208\n856,256,200\n832,256,192\n800,240,184\n768,232,176\n736,232,176\n696,232,152\n672,216,144\n656,200,120\n640,192,120\n624,192,128\n624,184,128\n616,176,136\n624,168,136\n624,160,128\n600,144,128\n592,144,128\n608,144,96\n624,152,80\n656,168,48\n688,184,24\n728,240,56\n784,312,0\n848,384,-32\n904,456,-48\n944,528,-80\n944,584,-128\n944,640,-152\n944,664,-176\n968,664,-152\n1008,640,-160\n1072,584,-112\n1192,520,-88\n1328,464,-48\n1464,424,-64\n1584,392,-88\n1656,424,-120\n1672,448,-184\n1624,488,-232\n1528,504,-248\n1424,496,-248\n1328,464,-280\n1232,424,-280\n1144,392,-280\n1064,376,-272\n992,376,-280\n920,400,-264\n856,432,-248\n800,456,-256\n760,472,-232\n752,504,-208\n760,520,-184\n784,544,-176\n800,560,-168\n816,576,-184\n824,608,-184\n808,632,-176\n776,656,-168\n752,672,-144\n712,680,-136\n688,688,-144\n664,712,-168\n664,720,-160\n680,728,-184\n720,736,-168\n752,744,-128\n792,752,-112\n848,744,-120\n904,752,-96\n968,736,-64\n1040,744,-32\n1136,752,-8\n1280,760,-16\n1416,744,-16\n1544,712,-8\n1600,688,-40\n1560,672,-16\n1480,640,-8\n1392,632,32\n1352,632,80\n1392,624,128\n1488,624,136\n1600,608,160\n1688,592,160\n1728,568,136\n1720,552,112\n1656,520,112\n1584,496,112\n1488,472,112\n1416,456,120\n1344,432,88\n1272,400,104\n1208,376,96\n1152,352,104\n1104,328,96\n1072,312,104\n1040,296,112\n1008,288,120\n984,272,128\n952,264,120\n912,248,136\n872,232,128\n848,224,104\n824,208,88\n808,208,96\n800,216,72\n784,224,80\n768,224,104\n728,216,112\n680,192,96\n640,184,96\n592,176,80\n560,168,72\n544,160,48\n552,160,48\n568,168,40\n608,176,56\n632,176,64\n664,192,64\n680,192,80\n688,200,64\n704,208,40\n736,216,40\n784,232,40\n840,264,48\n920,288,72\n968,312,72\n1016,344,88\n1048,392,72\n1064,440,48\n1064,480,32\n1056,528,-16\n1048,568,-72\n1064,600,-112\n1112,608,-160\n1208,608,-120\n1352,584,-120\n1528,552,-56\n1712,528,8\n1848,512,72\n1888,528,120\n1824,528,144\n1688,552,112\n1544,552,56\n1400,568,-16\n1264,552,-120\n1136,520,-192\n1016,488,-248\n904,448,-256\n808,408,-240\n744,392,-184\n696,384,-120\n664,360,-80\n664,352,-64\n680,360,-32\n712,400,-40\n752,424,-64\n776,456,-80\n776,488,-80\n768,512,-96\n736,544,-128\n728,560,-112\n712,576,-120\n688,592,-112\n680,608,-112\n672,616,-144\n688,640,-168\n720,656,-200\n776,672,-184\n848,688,-160\n920,696,-144\n976,688,-144\n1024,664,-120\n1056,648,-128\n1072,616,-104\n1080,592,-64\n1104,576,-72\n1176,568,-72\n1296,584,-96\n1432,608,-128\n1560,632,-120\n1608,640,-128\n1576,624,-120\n1480,608,-96\n1368,568,-48\n1312,544,8\n1312,528,48\n1392,528,72\n1480,520,88\n1552,520,96\n1608,496,88\n1616,480,104\n1584,440,112\n1544,416,112\n1480,392,112\n1392,360,136\n1296,344,128\n1200,328,112\n1112,296,128\n1032,296,112\n960,288,96\n904,280,72\n864,280,56\n832,272,80\n808,264,96\n792,264,120\n784,256,128\n752,248,120\n736,240,128\n720,248,120\n704,248,112\n696,248,104\n696,256,128\n712,256,112\n704,248,144\n704,240,144\n688,224,144\n672,224,152\n656,216,128\n648,200,112\n648,208,88\n664,216,88\n704,216,80\n736,216,104\n768,216,120\n784,216,128\n816,216,128\n848,224,144\n888,240,120\n936,256,128\n992,280,104\n1048,304,104\n1096,352,88\n1136,376,80\n1144,392,56\n1128,400,32\n1104,416,8\n1096,440,-16\n1112,464,-8\n1136,480,-40\n1192,488,-48\n1240,480,-32\n1328,480,-32\n1424,480,-8\n1512,480,40\n1584,480,64\n1624,472,96\n1584,456,112\n1496,440,104\n1392,440,48\n1296,440,-24\n1176,440,-96\n1080,432,-168\n976,408,-176\n888,384,-184\n808,376,-176\n744,368,-144\n720,376,-128\n720,392,-112\n744,400,-96\n776,432,-88\n808,456,-88\n816,480,-80\n816,504,-72\n816,528,-80\n800,552,-64\n800,568,-64\n784,592,-72\n776,608,-72\n752,632,-72\n736,656,-80\n736,664,-80\n736,672,-104\n744,680,-120\n776,696,-120\n816,688,-128\n848,696,-104\n880,696,-104\n920,696,-104\n960,696,-88\n1008,688,-56\n1072,680,-40\n1160,672,-8\n1296,672,-8\n1424,672,-16\n1528,680,-16\n1560,680,-24\n1528,672,-8\n1456,648,8\n1392,632,64\n1376,608,128\n1440,584,144\n1520,560,160\n1608,552,152\n1672,544,152\n1688,528,104\n1656,520,88\n1616,488,96\n1560,472,104\n1480,448,112\n1392,424,104\n1304,400,88\n1216,368,104\n1144,344,112\n1080,312,128\n1032,304,120\n984,296,120\n944,288,112\n928,280,104\n912,272,128\n912,256,144\n904,248,160\n896,248,160\n872,232,184\n832,208,192\n776,208,160\n744,200,160\n704,200,128\n680,208,128\n656,208,120\n648,216,120\n624,208,120\n600,200,112\n584,192,128\n568,192,120\n552,184,96\n560,184,104\n576,176,112\n608,184,112\n648,184,112\n688,192,120\n728,200,136\n776,200,128\n816,224,112\n872,248,112\n928,256,128\n976,288,128\n1016,312,136\n1056,336,160\n1072,360,136\n1088,368,136\n1088,384,112\n1104,400,72\n1160,440,16\n1248,480,-24\n1384,528,-32\n1536,576,-40\n1696,616,0\n1816,608,16\n1880,600,88\n1848,560,112\n1744,536,152\n1600,528,184\n1464,520,144\n1328,504,32\n1208,496,-72\n1104,464,-152\n1000,432,-200\n912,384,-176\n840,344,-176\n800,304,-152\n760,288,-104\n744,264,-104\n752,272,-128\n776,304,-144\n792,336,-144\n808,368,-128\n816,376,-128\n824,400,-112\n816,416,-128\n808,456,-176\n800,496,-208\n800,536,-232\n784,584,-256\n768,608,-224\n752,632,-240\n752,640,-272\n752,656,-312\n760,656,-312\n784,656,-272\n808,664,-256\n840,664,-240\n888,680,-224\n960,672,-224\n1032,672,-160\n1112,664,-112\n1224,640,-64\n1344,624,-56\n1464,600,-64\n1560,560,-64\n1584,512,-56\n1552,496,-72\n1488,472,-64\n1432,464,-56\n1400,456,-8\n1416,464,24\n1472,472,48\n1536,480,80\n1608,488,96\n1664,488,120\n1680,504,120\n1664,512,104\n1624,528,104\n1576,520,96\n1512,512,112\n1456,488,120\n1384,464,128\n1296,432,136\n1216,400,152\n1144,368,160\n1080,352,184\n1016,328,176\n960,312,184\n920,296,176\n880,280,184\n840,288,192\n816,280,176\n792,280,176\n776,272,176\n768,272,160\n752,272,152\n744,264,152\n736,264,160\n728,264,144\n720,264,152\n712,256,168\n688,248,160\n680,232,160\n664,208,152\n640,200,160\n640,184,152\n640,176,144\n664,168,136\n696,176,120\n736,192,120\n784,200,128\n824,200,128\n872,208,144\n912,216,160\n944,216,160\n984,224,144\n1016,248,168\n1016,272,160\n1016,296,168\n1016,320,144\n1008,336,112\n1008,352,56\n1008,376,-16\n1016,416,-64\n1064,440,-160\n1144,472,-168\n1264,504,-136\n1416,536,-128\n1568,552,-64\n1712,544,-16\n1792,520,56\n1784,480,96\n1712,448,128\n1608,432,104\n1480,432,64\n1344,416,24\n1224,400,-40\n1112,376,-120\n1016,344,-168\n936,312,-200\n872,280,-192\n824,272,-160\n808,280,-136\n816,296,-88\n848,336,-80\n888,384,-72\n936,424,-96\n968,480,-112\n976,528,-136\n968,568,-136\n944,600,-136\n904,624,-136\n864,648,-144\n824,680,-152\n800,696,-160\n784,728,-184\n792,752,-184\n808,768,-208\n832,768,-200\n864,744,-208\n896,736,-160\n904,728,-144\n944,744,-144\n984,736,-144\n1016,728,-144\n1048,704,-112\n1088,664,-56\n1152,624,-16\n1240,592,0\n1344,576,-8\n1432,552,0\n1464,544,-8\n1440,544,-48\n1392,544,-56\n1352,528,-40\n1344,528,0\n1376,544,24\n1464,568,56\n1568,576,80\n1696,584,80\n1792,600,88\n1840,600,88\n1824,584,80\n1752,552,80\n1672,520,88\n1584,488,96\n1504,456,80\n1424,424,112\n1360,400,120\n1296,360,144\n1216,336,136\n1152,312,168\n1096,296,176\n1040,280,160\n992,272,176\n952,264,168\n920,248,176\n872,256,136\n840,248,136\n808,232,144\n776,232,128\n744,232,120\n712,232,96\n680,224,72\n648,232,80\n632,232,64\n616,232,72\n616,224,104\n624,216,112\n632,216,104\n632,200,120\n632,192,136\n624,184,144\n632,176,112\n648,176,120\n664,192,112\n712,200,104\n752,200,136\n816,208,136\n872,208,144\n912,232,120\n952,248,104\n984,264,104\n1000,288,104\n1008,312,72\n1000,336,48\n976,360,56\n944,368,40\n936,376,8\n968,384,-40\n1032,400,-56\n1128,424,-56\n1264,456,-32\n1408,464,-24\n1568,488,-8\n1704,512,24\n1784,536,48\n1808,528,64\n1752,536,96\n1672,528,80\n1568,520,88\n1456,520,48\n1352,504,-40\n1224,496,-104\n1128,480,-184\n1040,448,-224\n960,416,-216\n904,384,-176\n872,360,-112\n864,328,-104\n872,312,-80\n904,312,-88\n936,328,-96\n960,368,-136\n968,408,-160\n968,448,-200\n952,496,-216\n920,536,-224\n880,560,-216\n840,592,-232\n808,608,-224\n784,624,-240\n784,656,-216\n784,680,-240\n792,720,-248\n808,736,-272\n816,768,-280\n824,776,-264\n848,776,-216\n872,752,-192\n920,744,-160\n968,728,-144\n1048,720,-96\n1152,696,-80\n1288,688,-48\n1416,672,-72\n1520,656,-88\n1568,608,-64\n1552,568,-72\n1504,536,-32\n1464,520,-8\n1464,520,16\n1504,528,48\n1584,544,64\n1688,536,88\n1792,520,96\n1872,520,112\n1888,496,88\n1840,496,88\n1752,496,64\n1664,488,56\n1568,480,48\n1488,472,48\n1424,464,48\n1368,456,56\n1320,424,88\n1264,400,128\n1216,392,192\n1168,392,192\n1112,400,184\n1072,416,200\n1040,416,208\n1008,408,232\n976,408,248\n968,416,248\n968,456,264\n960,504,248\n944,536,240\n912,552,248\n888,536,248\n848,520,184\n808,512,120\n784,512,40\n744,512,8\n712,512,-40\n672,504,-88\n640,496,-128\n600,512,-176\n560,512,-224\n528,504,-288\n496,520,-360\n472,536,-400\n448,536,-416\n424,520,-480\n416,488,-544\n400,496,-616\n400,520,-656\n400,552,-752\n392,544,-808\n376,464,-856\n352,352,-920\n312,208,-960\n280,72,-992\n232,0,-1064\n200,-16,-1080\n168,32,-1104\n192,88,-1128\n248,120,-1112\n328,88,-1112\n392,24,-1104\n448,-40,-1112\n480,-80,-1136\n488,-96,-1072\n456,-88,-1024\n408,-88,-960\n352,-96,-896\n296,-112,-840\n248,-152,-792\n200,-184,-744\n152,-208,-680\n104,-224,-632\n64,-248,-608\n24,-264,-584\n-16,-248,-568\n-24,-224,-568\n-48,-208,-592\n-40,-192,-600\n-48,-208,-600\n-56,-248,-576\n-64,-272,-584\n-80,-288,-600\n-88,-280,-624\n-96,-264,-600\n-104,-272,-616\n-104,-288,-616\n-104,-312,-616\n-104,-320,-616\n-88,-320,-600\n-72,-288,-608\n-56,-272,-608\n-64,-256,-672\n-72,-240,-680\n-64,-224,-720\n-64,-208,-784\n-56,-176,-856\n-32,-128,-912\n-24,-136,-960\n8,-168,-1040\n48,-200,-1080\n88,-232,-1072\n104,-264,-1032\n104,-272,-984\n80,-248,-952\n56,-232,-880\n40,-208,-816\n40,-184,-768\n48,-184,-664\n64,-176,-608\n96,-200,-536\n128,-216,-472\n168,-224,-432\n216,-248,-352\n280,-256,-368\n392,-192,-464\n528,-8,-568\n680,240,-656\n872,352,-688\n1096,360,-648\n1280,328,-616\n1400,312,-520\n1424,328,-432\n1408,328,-352\n1400,312,-296\n1408,248,-112\n1456,208,-184\n1512,200,-136\n1544,224,-112\n1576,240,-128\n1576,264,-120\n1560,296,-88\n1520,336,-56\n1464,376,-40\n1416,432,16\n1360,472,16\n1296,528,56\n1232,584,80\n1168,624,96\n1104,648,96\n1048,664,128\n1000,672,104\n968,656,136\n960,616,120\n968,584,144\n992,560,136\n1032,520,136\n1088,496,128\n1144,472,64\n1200,472,16\n1232,456,-24\n1272,472,8\n1304,488,8\n1360,504,-32\n1424,544,-64\n1488,592,-160\n1536,656,-248\n1544,720,-304\n1504,792,-312\n1432,824,-280\n1328,816,-272\n1224,784,-240\n1096,728,-280\n960,680,-328\n816,656,-368\n664,664,-440\n552,696,-448\n472,728,-392\n448,776,-296\n512,808,-200\n664,848,-80\n904,880,-16\n1176,896,24\n1432,856,48\n1616,776,64\n1744,656,56\n1792,528,64\n1800,392,32\n1800,280,0\n1752,184,-32\n1712,112,-80\n1632,64,-112\n1560,40,-128\n1480,32,-120\n1400,48,-120\n1344,56,-88\n1288,72,-64\n1240,96,0\n1208,136,32\n1152,176,72\n1104,216,88\n1064,264,96\n1024,296,120\n976,328,120\n920,352,112\n864,376,80\n808,384,64\n768,376,32\n720,376,8\n680,368,-16\n640,360,-32\n616,344,-56\n584,312,-40\n568,280,-40\n552,232,-48\n544,192,-32\n528,168,-8\n512,136,-16\n496,112,-16\n480,88,-32\n488,80,8\n496,72,-16\n528,72,-40\n560,80,-72\n624,128,-96\n696,192,-128\n784,288,-168\n864,384,-200\n928,488,-184\n984,568,-152\n1040,616,-64\n1096,616,-16\n1160,608,40\n1240,568,96\n1344,552,64\n1440,552,24\n1544,568,-16\n1640,584,-48\n1688,640,-64\n1712,696,-88\n1688,752,-72\n1616,808,-40\n1528,832,-16\n1392,840,0\n1264,824,-16\n1128,784,24\n1000,736,32\n888,664,48\n816,584,80\n792,496,96\n816,424,128\n864,344,152\n920,280,168\n976,240,128\n1000,224,80\n1008,208,56\n976,216,-8\n928,248,-48\n888,272,-88\n856,312,-96\n832,352,-88\n848,392,-56\n864,416,-8\n896,440,40\n920,440,72\n968,448,120\n1016,448,168\n1072,472,200\n1120,488,264\n1176,520,320\n1240,552,320\n1312,600,256\n1376,656,160\n1432,728,88\n1424,784,8\n1384,848,-88\n1344,880,-128\n1256,840,-136\n1160,784,-120\n1048,712,-120\n936,648,-200\n832,592,-272\n728,544,-368\n664,504,-416\n648,472,-448\n664,464,-440\n736,472,-344\n848,512,-272\n968,576,-184\n1120,608,-96\n1240,624,-80\n1344,608,-48\n1424,576,-48\n1472,520,-64\n1472,480,-48\n1440,424,-48\n1384,384,-40\n1304,360,-48\n1240,344,-56\n1176,352,-16\n1112,360,-24\n1080,352,40\n1056,360,40\n1032,376,48\n1040,376,64\n1048,376,80\n1064,376,80\n1064,384,96\n1064,392,112\n1048,400,120\n1016,424,144\n984,432,112\n944,424,88\n912,416,72\n872,416,80\n832,424,72\n792,432,48\n760,456,64\n728,480,104\n720,512,88\n720,552,72\n712,560,40\n704,544,16\n696,544,-24\n688,536,-64\n672,536,-64\n664,528,-56\n656,528,-56\n672,528,-104\n688,536,-120\n704,536,-96\n696,528,-96\n664,552,-104\n624,584,-112\n584,592,-72\n552,600,-40\n528,624,24\n536,624,64\n576,640,88\n648,656,80\n728,664,80\n792,664,64\n840,664,24\n872,672,-32\n872,672,-56\n880,680,-120\n872,672,-168\n864,656,-176\n848,640,-176\n840,608,-184\n816,592,-168\n784,568,-168\n752,528,-184\n728,504,-168\n696,464,-192\n672,432,-168\n672,384,-152\n688,352,-160\n712,312,-120\n744,272,-104\n784,232,-64\n824,192,-64\n840,176,-56\n832,152,-40\n800,128,-24\n784,128,-32\n760,136,-8\n752,152,8\n760,176,40\n792,184,56\n848,208,56\n920,240,96\n992,272,104\n1080,312,120\n1168,384,192\n1280,456,240\n1400,528,312\n1528,584,352\n1656,648,400\n1744,712,392\n1768,776,336\n1744,824,320\n1680,848,320\n1592,856,304\n1480,848,280\n1352,824,224\n1208,800,144\n1064,768,48\n952,744,-40\n872,712,-32\n864,656,8\n936,576,112\n1056,496,176\n1192,416,232\n1296,336,232\n1336,264,168\n1288,240,80\n1192,208,24\n1096,200,-80\n1000,216,-120\n896,232,-176\n784,264,-184\n688,272,-152\n608,272,-152\n544,264,-120\n488,264,-96\n448,256,-88\n432,240,-160\n416,200,-176\n400,144,-312\n392,72,-184\n408,8,-256\n440,-8,-344\n472,16,-320\n504,48,-280\n536,80,-200\n560,128,-152\n600,160,-112\n640,200,-128\n688,192,-168\n744,160,-216\n808,120,-216\n880,104,-232\n960,128,-224\n1032,176,-200\n1112,216,-144\n1192,280,-104\n1256,352,-80\n1288,432,-24\n1328,520,-8\n1352,608,24\n1400,696,56\n1480,776,64\n1584,816,104\n1672,840,80\n1712,816,72\n1688,752,56\n1624,688,88\n1560,608,120\n1488,536,160\n1472,480,152\n1496,424,184\n1536,392,200\n1568,344,176\n1568,336,192\n1536,336,168\n1456,336,144\n1360,344,120\n1248,376,72\n1152,392,64\n1072,408,40\n976,432,16\n888,448,-16\n808,448,-24\n728,448,-16\n656,448,0\n608,416,8\n576,392,24\n552,352,24\n536,320,40\n536,296,72\n536,264,72\n536,256,96\n552,232,112\n552,224,96\n560,208,96\n576,200,88\n584,200,88\n584,216,72\n592,208,64\n592,208,48\n592,208,64\n600,200,72\n608,208,56\n632,216,56\n656,216,56\n688,224,56\n728,232,56\n760,248,88\n800,248,80\n840,240,96\n888,248,88\n944,264,104\n1000,272,104\n1056,296,88\n1112,336,72\n1152,360,48\n1176,392,40\n1176,416,8\n1152,432,-16\n1104,448,-80\n1064,464,-128\n1032,480,-192\n1024,504,-208\n1056,528,-224\n1128,544,-200\n1240,544,-168\n1376,536,-112\n1512,512,-64\n1600,496,-16\n1632,464,0\n1592,448,-32\n1488,448,-16\n1352,432,-48\n1224,424,-112\n1104,392,-168\n1008,360,-208\n912,320,-208\n816,288,-200\n744,264,-168\n688,240,-144\n648,232,-104\n632,224,-112\n632,216,-112\n648,232,-104\n656,248,-96\n688,264,-120\n712,280,-112\n728,304,-96\n752,336,-96\n776,384,-112\n792,424,-96\n800,464,-104\n808,496,-120\n808,528,-128\n792,544,-120\n760,552,-120\n752,560,-128\n744,568,-128\n752,584,-152\n776,600,-176\n824,608,-208\n864,624,-192\n904,640,-160\n960,648,-120\n1008,648,-112\n1080,640,-72\n1160,632,-32\n1240,608,0\n1344,576,-8\n1440,552,-24\n1512,536,-48\n1520,520,-56\n1496,504,-80\n1432,496,-80\n1392,488,-48\n1384,480,8\n1424,472,48\n1496,464,72\n1576,472,88\n1640,464,72\n1664,472,48\n1632,472,32\n1568,480,8\n1480,472,24\n1400,464,-16\n1320,464,-8\n1248,456,0\n1192,448,-16\n1136,432,16\n1080,400,24\n1024,376,48\n968,344,40\n920,328,56\n872,312,48\n848,296,32\n816,280,48\n808,264,64\n800,248,56\n808,232,48\n816,224,80\n808,208,64\n800,192,104\n784,176,96\n752,160,96\n728,160,88\n688,152,88\n656,144,80\n632,144,80\n608,152,72\n584,160,64\n576,160,64\n568,168,56\n568,176,64\n576,192,72\n584,208,96\n608,200,80\n632,200,104\n664,208,128\n712,208,144\n768,224,160\n832,240,168\n896,256,176\n952,296,176\n992,336,168\n1040,392,144\n1080,448,104\n1104,496,64\n1120,552,16\n1128,608,-56\n1104,656,-112\n1112,664,-168\n1160,680,-160\n1256,656,-136\n1384,608,-40\n1552,560,16\n1720,512,128\n1856,472,168\n1864,472,176\n1768,488,104\n1616,520,16\n1464,560,-64\n1296,560,-168\n1160,520,-232\n1048,472,-248\n944,400,-240\n864,336,-240\n808,272,-216\n776,248,-192\n760,248,-192\n744,272,-192\n744,304,-192\n744,336,-200\n720,384,-200\n704,400,-184\n688,432,-200\n664,464,-224\n632,488,-240\n600,512,-224\n576,528,-232\n552,552,-208\n536,560,-200\n528,568,-184\n528,568,-176\n536,560,-176\n544,568,-168\n576,560,-184\n616,576,-208\n672,576,-176\n728,584,-152\n800,592,-144\n888,592,-128\n984,600,-104\n1088,592,-56\n1192,584,-16\n1304,552,16\n1424,544,24\n1552,528,32\n1672,520,0\n1728,504,-32\n1704,504,-56\n1632,512,-32\n1560,512,16\n1544,528,112\n1600,536,192\n1720,536,232\n1832,544,272\n1880,520,280\n1864,496,280\n1792,480,264\n1696,464,248\n1616,448,232\n1528,416,192\n1456,408,160\n1376,392,120\n1296,376,120\n1216,376,128\n1128,368,88\n1064,360,112\n1000,328,120\n952,320,136\n904,304,120\n864,280,144\n832,256,128\n792,240,128\n752,224,120\n720,216,88\n696,200,72\n664,192,88\n640,192,80\n600,176,88\n568,168,80\n536,136,112\n504,128,88\n464,104,80\n424,88,88\n400,72,96\n392,56,72\n400,56,72\n424,56,40\n440,64,56\n472,56,40\n496,72,40\n520,80,48\n544,96,64\n576,128,64\n624,176,64\n696,248,72\n792,344,56\n904,464,56\n1032,584,64\n1152,696,80\n1224,752,112\n1232,744,56\n1184,712,24\n1112,688,-56\n1064,656,-112\n1064,600,-192\n1144,520,-152\n1312,456,-96\n1536,408,-72\n1752,376,16\n1928,392,48\n1992,432,48\n1936,496,40\n1808,568,32\n1656,624,8\n1496,648,-40\n1368,624,-96\n1248,584,-96\n1144,528,-96\n1064,480,-120\n968,448,-104\n880,440,-64\n800,448,-56\n736,456,-16\n688,472,0\n664,496,-8\n664,512,-8\n672,520,-24\n672,520,-56\n680,536,-56\n680,544,-48\n656,552,-72\n632,560,-72\n600,568,-72\n568,568,-88\n544,568,-88\n512,568,-80\n520,568,-72\n544,544,-56\n584,544,-48\n648,544,-48\n720,560,-48\n792,576,-32\n840,608,-40\n904,640,-56\n960,664,-56\n1016,696,-32\n1096,728,-24\n1224,752,40\n1368,784,64\n1520,792,32\n1648,776,56\n1688,752,48\n1648,720,48\n1552,672,96\n1488,624,128\n1488,584,144\n1536,552,152\n1616,528,152\n1688,512,152\n1720,488,144\n1704,480,160\n1664,464,184\n1600,464,208\n1544,448,232\n1504,416,248\n1440,392,264\n1392,368,264\n1312,344,256\n1240,336,272\n1168,312,240\n1104,288,240\n1048,256,200\n992,248,176\n944,240,160\n880,232,176\n824,232,160\n752,240,152\n696,232,160\n640,232,160\n592,232,152\n552,232,152\n520,224,184\n496,216,160\n480,216,160\n472,208,144\n488,200,144\n512,200,136\n528,200,128\n560,200,112\n592,192,96\n632,208,80\n672,216,72\n720,216,64\n784,216,80\n856,216,96\n944,216,120\n1040,216,136\n1112,208,152\n1160,200,152\n1176,216,152\n1160,224,160\n1144,248,160\n1136,272,160\n1128,296,176\n1128,304,152\n1144,312,136\n1184,336,104\n1272,376,80\n1400,440,64\n1552,512,48\n1728,576,64\n1864,600,72\n1920,584,96\n1888,568,88\n1768,552,104\n1632,544,80\n1496,536,64\n1376,536,-16\n1256,520,-88\n1136,504,-144\n1056,472,-160\n984,440,-168\n912,432,-160\n888,424,-144\n872,424,-120\n872,424,-104\n880,440,-104\n904,472,-128\n904,496,-176\n896,520,-208\n872,544,-248\n840,592,-248\n784,624,-256\n712,664,-240\n656,704,-200\n600,736,-200\n552,776,-192\n520,808,-184\n512,848,-176\n520,856,-184\n568,864,-168\n624,848,-144\n704,832,-96\n784,824,-48\n880,816,-40\n960,792,-16\n1048,776,8\n1144,760,0\n1264,760,-24\n1384,752,-24\n1504,736,-32\n1584,704,-16\n1584,696,-24\n1520,680,8\n1464,672,64\n1480,672,144\n1552,656,224\n1688,648,312\n1840,624,368\n1976,608,400\n2064,584,392\n2104,560,368\n2096,536,312\n2072,520,272\n2024,512,240\n1952,496,200\n1880,480,168\n1784,472,152\n1688,472,144\n1592,456,120\n1496,440,120\n1408,424,144\n1320,392,128\n1232,368,144\n1152,328,136\n1072,288,152\n992,256,136\n920,232,128\n848,208,88\n792,184,56\n744,176,80\n704,144,80\n680,120,80\n656,96,80\n624,72,56\n584,56,80\n536,24,80\n496,16,64\n456,-8,64\n416,-40,56\n384,-40,48\n368,-48,16\n360,-48,32\n376,-24,16\n400,-24,0\n432,0,16\n448,8,0\n472,40,24\n512,88,16\n544,128,40\n592,200,40\n640,280,8\n696,368,0\n760,504,0\n848,640,8\n928,736,40\n1000,792,48\n1048,832,32\n1088,848,32\n1112,856,24\n1144,832,-32\n1232,776,-48\n1344,696,-88\n1504,616,-120\n1672,584,-184\n1816,576,-176\n1888,592,-216\n1880,608,-248\n1784,616,-272\n1680,632,-256\n1568,632,-240\n1448,608,-232\n1352,568,-216\n1256,528,-208\n1152,496,-208\n1064,472,-168\n968,464,-176\n896,472,-160\n832,496,-184\n792,552,-200\n768,600,-216\n776,656,-264\n776,704,-328\n776,736,-360\n752,776,-376\n720,808,-392\n680,832,-368\n632,864,-336\n584,880,-312\n560,896,-312\n536,904,-280\n536,904,-280\n552,904,-272\n600,880,-256\n656,864,-216\n704,824,-176\n768,776,-104\n840,744,-80\n944,696,-56\n1056,672,-16\n1168,640,8\n1296,616,24\n1408,592,40\n1496,576,48\n1568,584,40\n1616,592,32\n1648,632,8\n1648,664,-8\n1640,704,32\n1632,704,104\n1656,696,192\n1704,680,272\n1784,648,336\n1880,624,328\n1920,600,352\n1936,576,320\n1912,560,312\n1872,544,256\n1816,528,224\n1744,528,184\n1680,512,144\n1616,504,128\n1560,488,120\n1488,488,112\n1416,472,112\n1328,440,120\n1256,400,96\n1184,352,96\n1112,296,104\n1056,248,96\n992,192,88\n912,128,48\n840,72,32\n760,32,56\n696,0,48\n632,-24,48\n576,-40,32\n528,-48,24\n472,-48,16\n416,-56,0\n376,-56,8\n336,-48,8\n312,-48,-24\n296,-40,-8\n312,-40,-8\n328,-16,-24\n360,0,0\n392,24,8\n408,40,-16\n408,88,-16\n432,120,-16\n464,168,-8\n504,232,16\n576,280,16\n648,352,40\n728,424,48\n784,496,48\n840,560,8\n888,600,-32\n944,616,-32\n1000,632,-24\n1072,640,-40\n1136,664,-32\n1200,664,-8\n1264,664,-8\n1336,656,-16\n1448,624,-64\n1608,600,-80\n1792,584,-64\n1968,568,-72\n2104,592,-48\n2128,632,-24\n2032,664,16\n1888,704,16\n1728,736,-8\n1576,736,-32\n1432,712,-72\n1280,672,-120\n1144,624,-160\n1008,584,-192\n872,560,-192\n760,536,-184\n680,536,-152\n632,552,-160\n608,552,-176\n624,568,-160\n624,568,-176\n632,576,-176\n616,584,-176\n584,584,-176\n552,592,-168\n504,600,-136\n464,600,-128\n432,616,-96\n432,632,-64\n440,648,-56\n488,672,-40\n576,688,-48\n664,704,-16\n752,720,8\n832,736,24\n896,760,24\n968,784,8\n1032,792,32\n1104,800,64\n1176,784,88\n1264,768,104\n1384,760,88\n1528,744,24\n1648,744,-24\n1688,768,0\n1696,760,40\n1704,760,144\n1760,744,216\n1856,720,288\n1952,688,328\n2008,640,336\n2016,600,320\n1992,576,280\n1952,552,248\n1912,528,240\n1880,488,208\n1816,464,192\n1728,408,184\n1616,368,200\n1504,336,168\n1400,312,152\n1296,312,144\n1200,288,144\n1120,264,96\n1064,240,80\n1008,232,64\n968,224,56\n928,216,72\n888,208,64\n848,176,72\n800,144,88\n736,120,80\n672,88,80\n608,56,72\n552,32,72\n496,16,64\n464,8,48\n448,8,56\n432,8,56\n440,16,64\n448,24,48\n464,40,48\n480,40,48\n496,32,40\n504,48,56\n520,72,56\n544,88,64\n584,120,64\n624,176,96\n664,224,104\n720,312,88\n784,424,96\n864,584,104\n944,720,104\n1008,824,80\n1032,856,48\n1024,848,0\n1008,816,-56\n1000,768,-120\n1024,704,-184\n1112,656,-208\n1256,608,-224\n1440,592,-224\n1616,568,-184\n1752,576,-120\n1800,600,-96\n1752,640,-56\n1648,680,-48\n1512,696,-48\n1376,704,-72\n1248,680,-112\n1120,648,-128\n1008,616,-168\n904,584,-168\n800,560,-152\n736,552,-152\n688,552,-152\n664,552,-128\n688,544,-120\n720,552,-104\n768,552,-120\n816,568,-112\n848,592,-112\n848,608,-128\n824,632,-128\n792,664,-152\n736,696,-136\n704,728,-128\n680,752,-136\n672,768,-120\n696,768,-128\n728,752,-120\n768,744,-120\n808,736,-104\n848,736,-120\n904,736,-104\n952,728,-64\n1024,736,0\n1120,736,64\n1248,728,72\n1400,704,88\n1536,688,96\n1640,680,48\n1664,688,64\n1632,688,64\n1592,680,120\n1592,672,144\n1624,672,184\n1680,680,184\n1728,672,144\n1736,648,112\n1696,632,112\n1632,592,96\n1552,560,104\n1488,520,96\n1416,480,80\n1360,448,80\n1288,408,72\n1216,376,80\n1152,344,112\n1088,328,120\n1048,304,144\n1008,288,136\n984,280,128\n968,280,128\n976,280,120\n968,288,104\n976,296,120\n968,296,112\n960,296,136\n952,288,136\n928,280,128\n896,272,144\n864,256,152\n840,248,128\n816,232,104\n792,232,112\n784,216,112\n784,208,120\n792,200,120\n800,184,128\n808,176,144\n800,168,128\n792,144,96\n784,128,96\n792,120,136\n824,112,136\n848,96,168\n864,96,168\n848,104,168\n808,128,184\n768,160,176\n728,224,152\n696,280,80\n696,328,64\n728,368,16\n800,424,-40\n896,488,-88\n1040,560,-88\n1216,640,-128\n1416,712,-128\n1600,736,-96\n1728,688,-64\n1784,616,-16\n1768,560,-8\n1680,520,16\n1576,520,40\n1464,512,-8\n1352,504,-56\n1224,488,-104\n1120,456,-160\n1032,432,-192\n952,392,-200\n904,344,-224\n880,320,-232\n888,304,-216\n904,312,-200\n944,328,-184\n976,360,-184\n1000,392,-232\n1000,424,-256\n976,456,-288\n936,488,-304\n888,528,-280\n832,568,-256\n776,608,-232\n736,656,-208\n728,696,-176\n736,752,-168\n768,800,-128\n824,848,-104\n872,880,-72\n904,920,-56\n944,936,-64\n968,936,-40\n984,928,-40\n976,880,-40\n976,832,-32\n992,760,-40\n1016,712,-40\n1080,680,-80\n1152,672,-128\n1200,712,-112\n1248,776,-96\n1336,872,-64\n1480,976,-32\n1704,1048,40\n1920,1080,120\n2072,1040,296\n2112,952,336\n2072,840,384\n2000,704,368\n1936,592,344\n1888,512,288\n1848,432,200\n1784,360,88\n1704,296,48\n1600,248,40\n1496,216,48\n1384,208,72\n1280,208,96\n1176,232,120\n1104,248,144\n1048,280,160\n1016,320,168\n1016,344,160\n1032,392,144\n1064,416,152\n1096,424,160\n1096,408,160\n1080,400,176\n1056,376,176\n1008,344,208\n952,320,208\n888,296,192\n832,280,192\n792,256,184\n760,240,128\n752,216,128\n760,192,112\n768,192,88\n784,176,96\n784,168,96\n800,152,104\n808,144,136\n800,136,128\n768,120,136\n744,120,128\n720,128,112\n704,160,104\n688,200,104\n688,248,96\n672,280,72\n664,296,40\n640,304,8\n616,320,-40\n608,352,-112\n624,416,-152\n696,496,-200\n832,592,-240\n976,656,-256\n1152,680,-248\n1304,664,-200\n1408,600,-112\n1464,520,-24\n1488,472,16\n1496,448,32\n1488,472,8\n1464,504,-48\n1432,512,-104\n1368,512,-152\n1304,480,-232\n1240,448,-248\n1184,400,-272\n1144,376,-272\n1128,360,-232\n1128,360,-240\n1144,376,-192\n1152,400,-160\n1152,432,-144\n1152,472,-160\n1144,512,-192\n1136,576,-240\n1112,632,-280\n1080,664,-264\n1040,704,-248\n992,736,-232\n936,760,-208\n896,776,-192\n872,792,-184\n872,800,-168\n888,824,-176\n928,832,-192\n968,832,-192\n992,840,-184\n976,832,-200\n960,824,-200\n928,800,-176\n904,760,-160\n920,720,-128\n984,696,-96\n1072,680,-72\n1176,656,-72\n1264,680,-104\n1296,736,-104\n1312,792,-144\n1344,864,-120\n1424,912,-72\n1552,952,16\n1728,928,144\n1896,864,224\n2000,792,280\n2032,720,272\n2008,640,272\n1936,568,272\n1864,504,224\n1792,432,192\n1728,384,184\n1656,328,112\n1576,296,112\n1496,264,112\n1416,256,120\n1336,256,120\n1272,272,144\n1192,296,168\n1136,352,208\n1096,416,192\n1072,464,200\n1048,496,256\n1040,520,304\n1040,552,336\n1032,592,352\n1024,608,368\n1016,624,360\n992,632,328\n968,616,328\n944,600,336\n928,592,344\n928,584,296\n928,584,272\n920,608,216\n920,632,136\n928,624,80\n904,600,24\n864,576,-16\n808,552,-32\n752,560,-72\n688,584,-104\n632,608,-144\n592,616,-192\n552,600,-280\n520,552,-368\n472,512,-448\n408,456,-520\n328,424,-616\n232,376,-672\n152,312,-712\n80,248,-712\n32,184,-712\n16,160,-696\n48,152,-760\n120,160,-840\n224,176,-920\n336,152,-976\n424,112,-1024\n472,72,-1032\n512,-8,-1040\n528,-104,-1016\n520,-184,-1032\n488,-240,-1000\n440,-240,-952\n384,-216,-880\n312,-208,-800\n248,-224,-752\n184,-248,-728\n120,-272,-688\n80,-280,-656\n48,-264,-680\n16,-256,-680\n8,-256,-672\n-24,-256,-672\n-40,-256,-672\n-48,-256,-656\n-48,-272,-648\n-40,-272,-664\n-24,-280,-664\n-16,-296,-688\n0,-296,-696\n8,-312,-704\n16,-320,-688\n16,-296,-704\n16,-304,-680\n24,-280,-696\n32,-272,-688\n40,-272,-696\n80,-288,-664\n136,-312,-648\n208,-352,-624\n296,-376,-600\n400,-392,-576\n504,-384,-512\n624,-344,-416\n744,-288,-400\n864,-160,-392\n944,72,-464\n1008,408,-552\n1032,728,-560\n1016,944,-608\n952,992,-712\n848,976,-784\n704,992,-856\n584,1064,-968\n464,1168,-1176\n368,1280,-1424\n296,1392,-1704\n280,1432,-1848\n336,1432,-1896\n456,1392,-1896\n584,1344,-1776\n704,1288,-1640\n760,1248,-1480\n728,1216,-1304\n624,1232,-1064\n480,1248,-920\n344,1136,-808\n224,968,-824\n152,840,-768\n88,768,-704\n32,720,-592\n-8,696,-560\n-56,696,-520\n-96,680,-504\n-128,656,-472\n-152,616,-432\n-168,576,-440\n-160,560,-424\n-128,568,-432\n-96,584,-392\n-64,608,-384\n-32,648,-368\n-8,688,-352\n0,688,-336\n8,664,-344\n24,616,-352\n48,576,-384\n80,536,-416\n112,512,-424\n184,480,-432\n264,448,-416\n344,424,-344\n448,416,-224\n552,432,-120\n648,464,32\n720,496,168\n760,528,320\n776,568,424\n776,552,400\n776,512,248\n768,472,56\n784,400,-48\n824,368,-376\n872,360,-472\n912,376,-560\n936,464,-480\n960,552,-416\n960,560,-248\n928,528,-120\n912,448,-16\n912,352,32\n960,272,128\n1088,256,280\n1320,448,360\n1696,1008,224\n2248,1768,112\n2736,2208,56\n2768,2512,-72\n2488,2568,-376\n2192,2432,-576\n1960,2280,-704\n1744,2136,-720\n1520,2016,-696\n1240,1944,-640\n928,1912,-536\n648,1832,-392\n376,1736,-272\n128,1608,-240\n-88,1488,-280\n-304,1368,-416\n-456,1216,-456\n-568,1080,-568\n-664,920,-568\n-752,712,-472\n-832,520,-496\n-896,368,-440\n-984,264,-392\n-1040,160,-256\n-1080,136,-368\n-1088,176,-336\n-1072,208,-256\n-1048,240,-176\n-984,256,-72\n-904,280,-8\n-816,312,32\n-736,360,80\n-664,408,120\n-584,480,160\n-504,600,168\n-424,800,128\n-376,1136,48\n-352,1584,-80\n-400,2016,-160\n-448,2368,48\n-424,2904,40\n-368,3424,-64\n-280,3752,96\n-48,3912,72\n256,3992,96\n664,4040,280\n1096,3856,600\n1504,3224,728\n1712,2456,856\n1720,1808,832\n1560,1320,720\n1312,984,608\n1088,744,368\n904,552,296\n792,400,160\n760,256,136\n800,88,128\n872,-96,96\n928,-280,200\n984,-472,200\n1016,-672,112\n1016,-888,64\n984,-1032,8\n904,-1072,8\n816,-1080,8\n696,-1040,24\n600,-968,56\n528,-904,120\n480,-848,128\n464,-800,120\n480,-736,144\n488,-656,208\n528,-536,192\n592,-288,136\n776,504,328\n1064,2288,-896\n1344,3184,-456\n1888,3632,-512\n2120,3856,-592\n2088,3968,-544\n1808,4008,-640\n1440,3600,-552\n1032,3040,-352\n640,2528,-280\n272,2112,-192\n-56,1800,-72\n-328,1544,-40\n-544,1360,0\n-688,1176,16\n-792,1016,0\n-824,840,-16\n-832,672,-72\n-808,520,-96\n-792,384,-152\n-776,256,-232\n-776,160,-232\n-832,96,-144\n-928,-8,-184\n-1064,-112,-208\n-1184,-168,-136\n-1216,-208,-120\n-1168,-216,-88\n-1072,-216,-104\n-960,-192,-96\n-864,-152,-56\n-784,-112,-24\n-728,-56,40\n-688,40,40\n-656,200,120\n-656,488,112\n-648,1176,208\n-832,2064,24\n-1160,2760,536\n-1264,3416,312\n-984,3752,200\n-608,3912,328\n-192,3992,448\n240,4040,496\n648,4048,744\n1080,3512,872\n1480,2744,672\n1664,1960,488\n1560,1360,208\n1288,1040,32\n960,840,-224\n688,680,-376\n536,552,-368\n552,400,-352\n688,232,-280\n888,32,-192\n1160,-264,-72\n1360,-672,112\n1464,-984,128\n1408,-1216,56\n1216,-1360,120\n976,-1440,240\n736,-1432,296\n560,-1344,384\n464,-1200,384\n472,-1048,352\n576,-888,184\n712,-712,56\n816,-536,16\n856,-288,0\n928,272,-48\n976,2176,-872\n1016,3128,-168\n1376,3600,328\n1608,3840,-80\n1600,3960,-224\n1488,4016,-520\n1264,4016,-424\n912,3520,-192\n504,2952,48\n112,2480,184\n-232,2080,184\n-496,1728,208\n-704,1448,240\n-856,1224,224\n-936,1024,224\n-976,824,160\n-992,632,80\n-968,440,48\n-936,304,-24\n-896,184,-112\n-880,88,-112\n-920,0,-104\n-992,-56,-168\n-1096,-80,-168\n-1192,-96,-128\n-1224,-96,-128\n-1192,-104,-104\n-1120,-136,-88\n-1048,-176,-64\n-984,-216,-8\n-936,-240,40\n-904,-248,88\n-880,-216,128\n-840,-152,184\n-800,8,248\n-784,432,592\n-840,1472,312\n-1064,2640,648\n-1352,3360,1296\n-1048,3720,512\n-464,3896,384\n-40,3992,952\n488,4032,792\n1032,4040,808\n1560,3400,960\n1976,2536,832\n2040,1744,456\n1744,1192,288\n1304,872,112\n880,648,-64\n504,488,-296\n240,328,-392\n120,200,-384\n160,88,-352\n328,-16,-352\n584,-184,-360\n848,-424,-200\n1128,-720,-56\n1312,-1008,-8\n1384,-1224,-16\n1304,-1336,40\n1144,-1336,112\n960,-1272,192\n800,-1152,232\n696,-1008,256\n680,-848,224\n720,-672,152\n768,-504,112\n808,-312,120\n880,40,56\n1056,1280,32\n1160,2680,-496\n1432,3376,-304\n1576,3728,56\n1384,3904,16\n1144,3992,16\n984,3928,-240\n864,3616,-288\n688,3176,-264\n448,2704,-248\n184,2304,-144\n-72,1936,-16\n-288,1640,160\n-488,1416,280\n-680,1248,336\n-864,1128,344\n-1024,1024,248\n-1160,928,184\n-1248,864,56\n-1232,776,-64\n-1152,632,-56\n-1096,520,-304\n-1056,376,-288\n-1104,256,-224\n-1232,200,-280\n-1312,160,-168\n-1328,96,-192\n-1256,32,-208\n-1144,-32,-192\n-1040,-72,-144\n-952,-104,-72\n-880,-112,-48\n-800,-112,16\n-736,-88,72\n-696,-48,112\n-680,40,120\n-680,240,248\n-680,664,264\n-912,1480,152\n-1264,2512,-80\n-1640,3296,280\n-1520,3688,328\n-1200,3880,160\n-776,3984,304\n-304,4032,424\n64,4056,576\n512,4016,592\n944,3352,584\n1320,2592,736\n1576,1832,720\n1640,1224,376\n1496,848,136\n1256,592,-224\n992,368,-408\n744,176,-328\n576,0,-160\n544,-152,-96\n648,-336,-32\n832,-600,16\n1056,-864,224\n1296,-1088,352\n1496,-1264,432\n1576,-1352,472\n1504,-1312,424\n1360,-1192,400\n1216,-1040,392\n1112,-880,360\n1064,-728,336\n1048,-568,280\n1048,-424,200\n1024,-304,184\n992,-176,224\n1048,176,248\n1240,1960,-112\n1432,3016,-456\n1816,3544,144\n1840,3816,-376\n1648,3944,-448\n1456,4008,-672\n1264,4048,-544\n960,3800,-304\n592,3248,-112\n216,2704,24\n-144,2248,88\n-472,1848,200\n-728,1512,272\n-880,1272,312\n-960,1104,272\n-1032,952,216\n-1072,832,176\n-1080,696,104\n-1056,576,-8\n-1048,448,-88\n-1080,320,-120\n-1152,208,-184\n-1264,88,-240\n-1352,-8,-328\n-1392,-64,-296\n-1360,-72,-264\n-1264,-80,-208\n-1160,-72,-144\n-1072,-80,-80\n-984,-80,-8\n-904,-72,48\n-832,-32,80\n-768,40,80\n-736,192,104\n-704,472,72\n-680,1088,32\n-848,1824,-136\n-1160,2568,88\n-1240,3296,248\n-1048,3688,104\n-704,3880,232\n-336,3984,544\n88,4032,792\n560,4056,1008\n1016,3624,1144\n1440,2984,1136\n1832,2176,752\n1952,1480,264\n1728,960,-88\n1296,616,-336\n848,392,-352\n480,224,-240\n304,64,-128\n280,-136,-80\n368,-408,-8\n520,-688,32\n744,-888,64\n968,-1072,120\n1176,-1224,208\n1272,-1256,288\n1232,-1176,248\n1096,-1048,272\n912,-880,256\n792,-704,224\n736,-544,208\n736,-416,176\n768,-288,160\n816,-96,88\n864,312,232\n936,1352,432\n856,2712,352\n888,3400,528\n872,3736,632\n632,3904,464\n448,3992,168\n432,3728,-24\n448,3240,48\n368,2728,80\n208,2312,200\n16,2040,152\n-224,1760,184\n-456,1472,392\n-704,1288,240\n-904,1200,-32\n-1048,1120,-208\n-1136,992,-240\n-1080,800,-360\n-920,592,-408\n-760,432,-392\n-672,280,-304\n-704,144,-232\n-816,16,-184\n-944,-104,-112\n-1048,-200,-88\n-1088,-280,-72\n-1088,-328,-8\n-1016,-328,64\n-904,-304,144\n-752,-288,200\n-632,-216,256\n-512,-112,248\n-424,16,280\n-368,216,344\n-376,496,448\n-520,880,656\n-704,1432,608\n-1120,2080,744\n-1504,2640,992\n-1520,3208,1192\n-1224,3648,1344\n-808,3864,1224\n-344,3752,968\n56,3392,728\n360,2912,608\n592,2408,496\n736,1904,456\n752,1472,288\n656,1224,168\n544,1096,-176\n408,944,-344\n288,864,-296\n304,816,-440\n360,600,-304\n416,344,-120\n536,40,-144\n616,-248,-64\n656,-488,-48\n688,-720,16\n704,-944,136\n664,-1096,280\n608,-1136,408\n536,-1096,472\n488,-968,504\n448,-768,472\n424,-528,424\n392,-256,376\n360,112,464\n304,624,416\n208,1408,432\n0,2192,608\n-216,2800,752\n-432,3152,968\n-672,3440,1144\n-880,3688,1248\n-928,3728,1032\n-768,3600,752\n-616,3264,568\n-528,2784,368\n-504,2320,312\n-504,1864,320\n-528,1416,440\n-568,1040,480\n-616,760,432\n-688,528,320\n-752,368,192\n-792,264,16\n-776,144,-80\n-704,-48,-176\n-648,-264,-320\n-648,-440,-296\n-712,-584,-256\n-816,-688,-184\n-896,-744,-152\n-912,-688,-16\n-848,-544,56\n-728,-416,144\n-616,-312,192\n-528,-216,256\n-472,-136,304\n-440,-48,312\n-448,80,416\n-496,328,512\n-584,736,552\n-912,1360,784\n-1432,2056,880\n-1848,2576,1160\n-1808,2816,1192\n-1488,3048,1264\n-1176,3248,1368\n-864,3256,1192\n-512,3040,696\n-232,2696,488\n-88,2304,304\n-64,1976,160\n-104,1672,128\n-152,1416,128\n-160,1152,8\n-80,888,-56\n80,648,-112\n272,440,-112\n472,160,-80\n712,-136,-144\n912,-416,-104\n984,-632,-112\n952,-800,-32\n848,-872,64\n760,-904,192\n728,-920,264\n768,-888,296\n808,-768,320\n848,-552,368\n848,-232,400\n816,240,520\n744,704,568\n552,1232,672\n296,1776,848\n-32,2392,1064\n-352,2936,1472\n-640,3448,1624\n-864,3760,1752\n-904,3832,1480\n-768,3680,1160\n-608,3352,904\n-504,2848,704\n-480,2304,560\n-512,1808,424\n-568,1392,328\n-616,1032,264\n-624,760,256\n-608,560,256\n-568,424,160\n-528,296,64\n-504,176,-40\n-520,56,-96\n-568,-88,-192\n-672,-248,-152\n-824,-416,-112\n-1008,-576,-48\n-1208,-696,64\n-1360,-752,152\n-1408,-728,120\n-1328,-672,200\n-1208,-656,232\n-1112,-640,320\n-1064,-576,344\n-1064,-472,432\n-1136,-360,528\n-1272,-176,720\n-1384,232,880\n-1312,1120,1528\n-1656,2432,816\n-2104,3256,1856\n-2280,3664,2216\n-1912,3872,1488\n-1312,3976,1640\n-696,4024,1296\n-112,4056,984\n352,3736,856\n760,3128,696\n1040,2448,560\n1288,1824,392\n1376,1368,8\n1272,1128,-288\n1064,1000,-528\n880,880,-672\n800,688,-720\n840,400,-672\n960,48,-632\n1112,-336,-384\n1216,-712,-264\n1272,-1032,-160\n1224,-1232,-8\n1120,-1312,152\n1016,-1264,264\n936,-1144,296\n904,-1000,376\n920,-832,368\n960,-672,272\n1008,-512,200\n1016,-360,104\n1008,-232,48\n984,-104,-24\n976,160,-144\n984,984,-112\n1120,2480,-120\n1616,3280,-232\n2008,3680,304\n1928,3880,16\n1712,3976,-320\n1512,4032,-424\n1280,3896,-344\n952,3512,-240\n520,3032,-80\n112,2544,56\n-248,2088,160\n-520,1728,176\n-704,1424,152\n-808,1184,80\n-808,960,-144\n-848,744,-408\n-920,592,-392\n-976,472,-648\n-1056,368,-696\n-1144,296,-576\n-1224,240,-480\n-1320,184,-368\n-1424,104,-208\n-1512,16,-120\n-1592,-48,-40\n-1640,-96,0\n-1640,-136,96\n-1608,-144,152\n-1560,-120,248\n-1512,-48,328\n-1456,64,376\n-1376,240,456\n-1288,504,512\n-1184,968,656\n-1144,1856,656\n-1096,2968,840\n-952,3520,672\n-576,3800,584\n-64,3936,312\n464,4008,296\n952,4040,32\n1536,4064,88\n2280,4048,528\n2920,3392,672\n3048,2496,328\n2608,1848,64\n1992,1376,-184\n1440,1032,-480\n1000,784,-648\n776,592,-584\n744,392,-576\n872,176,-504\n1088,-80,-352\n1352,-344,-280\n1552,-648,-248\n1640,-936,-312\n1552,-1232,-360\n1352,-1376,-344\n1120,-1440,-240\n912,-1368,-144\n816,-1232,-64\n832,-1088,16\n912,-960,40\n1008,-824,144\n1064,-656,120\n1072,-512,80\n1024,-376,80\n960,-248,152\n888,80,384\n920,1336,504\n1104,2704,384\n1656,3392,960\n2024,3736,968\n2032,3904,416\n1896,3992,-48\n1672,4032,-208\n1272,3816,-128\n792,3288,128\n384,2728,344\n24,2208,456\n-272,1728,608\n-472,1336,672\n-608,1008,784\n-720,768,640\n-864,608,448\n-1056,496,320\n-1248,432,88\n-1424,384,-160\n-1568,320,-440\n-1544,200,-512\n-1504,184,-336\n-1536,200,-288\n-1624,144,-136\n-1664,96,-64\n-1632,64,-88\n-1560,48,-56\n-1464,0,64\n-1360,-16,208\n-1288,-8,272\n-1232,48,352\n-1200,136,416\n-1168,240,496\n-1160,448,744\n-1168,872,1072\n-1192,1712,1320\n-1224,2896,1104\n-1128,3488,1488\n-704,3784,1072\n-112,3928,1360\n400,4008,1616\n976,4040,1416\n1640,4056,1344\n2328,3496,1136\n2720,2536,720\n2552,1776,416\n2032,1328,192\n1472,1008,-120\n952,744,-288\n560,552,-208\n368,360,-184\n320,192,-104\n384,-16,-72\n520,-272,-64\n680,-568,-120\n840,-792,-80\n896,-944,-88\n952,-1072,-48\n1000,-1160,16\n1016,-1216,24\n1008,-1144,104\n992,-1040,176\n976,-904,192\n968,-776,200\n944,-640,144\n920,-512,80\n888,-408,56\n856,-304,64\n824,-208,72\n816,24,248\n928,624,88\n1016,1832,152\n1296,2952,208\n1704,3520,488\n1704,3800,504\n1408,3936,704\n1120,4008,664\n880,4040,600\n600,3816,560\n288,3328,496\n-8,2768,424\n-256,2232,392\n-432,1728,432\n-568,1288,416\n-712,912,432\n-864,608,392\n-1008,416,248\n-1168,320,88\n-1264,248,-48\n-1360,192,-104\n-1432,120,-88\n-1488,40,-128\n-1520,-40,-112\n-1528,-128,-96\n-1512,-200,-104\n-1448,-264,-48\n-1352,-320,8\n-1232,-336,48\n-1128,-312,72\n-1048,-256,192\n-984,-144,272\n-936,40,424\n-912,352,664\n-960,912,768\n-1144,1760,1040\n-1344,2912,1344\n-1344,3496,1440\n-1000,3784,1608\n-528,3928,1704\n8,4008,1576\n512,4040,1320\n1064,3792,976\n1504,3184,832\n1824,2448,512\n1768,1752,248\n1480,1296,88\n1112,1016,-72\n736,800,-312\n464,632,-360\n376,424,-336\n456,200,-392\n664,-40,-440\n904,-288,-416\n1128,-536,-368\n1272,-760,-384\n1336,-944,-280\n1312,-1088,-152\n1256,-1176,-80\n1192,-1192,24\n1136,-1128,136\n1096,-1024,248\n1088,-896,288\n1112,-760,264\n1128,-608,208\n1136,-440,216\n1128,-216,280\n1144,168,376\n1144,1048,704\n1216,2568,856\n1472,3320,688\n1416,3696,1640\n1096,3888,1384\n736,3984,1288\n576,4032,856\n408,4056,688\n176,3672,568\n-104,3080,520\n-352,2464,488\n-560,1920,504\n-752,1448,432\n-920,1048,424\n-1104,736,400\n-1304,544,160\n-1448,448,-64\n-1512,360,-264\n-1472,264,-280\n-1408,152,-312\n-1392,72,-256\n-1464,0,-256\n-1568,-32,-168\n-1624,-80,-168\n-1568,-120,-152\n-1416,-160,-96\n-1240,-184,-8\n-1072,-184,56\n-928,-152,88\n-824,-88,240\n-760,0,328\n-728,168,496\n-728,496,728\n-840,1056,848\n-1104,1904,1080\n-1368,2888,1296\n-1400,3480,1560\n-1160,3784,1872\n-736,3928,1912\n-200,4000,1680\n280,4040,1464\n736,3584,1080\n1144,2928,800\n1480,2248,600\n1584,1584,240\n1464,1096,56\n1208,808,-208\n920,624,-424\n704,464,-504\n616,288,-488\n704,88,-472\n872,-136,-440\n1056,-400,-400\n1216,-672,-312\n1304,-912,-184\n1352,-1048,-112\n1360,-1200,-16\n1344,-1280,56\n1296,-1288,152\n1232,-1184,176\n1152,-1032,200\n1096,-872,168\n1064,-704,128\n1064,-512,200\n1096,-256,232\n1168,136,232\n1192,1024,616\n1280,2552,984\n1528,3312,1072\n1480,3696,2008\n1184,3888,1424\n952,3984,872\n880,4032,520\n768,4032,408\n536,3568,400\n224,2936,464\n-88,2328,448\n-360,1800,488\n-608,1368,496\n-824,1032,440\n-1024,768,304\n-1184,576,40\n-1288,432,-136\n-1328,336,-272\n-1296,248,-368\n-1272,144,-488\n-1272,64,-424\n-1320,32,-392\n-1376,48,-296\n-1408,64,-216\n-1424,48,-176\n-1416,0,-104\n-1384,-56,0\n-1320,-112,120\n-1256,-112,208\n-1216,-88,288\n-1216,-32,368\n-1208,96,504\n-1192,368,688\n-1192,872,984\n-1288,1688,1136\n-1408,2752,1208\n-1408,3416,1600\n-1152,3744,1752\n-744,3912,1720\n-240,3992,1768\n216,4040,1576\n632,4056,1544\n1120,3632,1304\n1648,2992,1264\n2080,2192,888\n2192,1472,352\n1952,984,-144\n1544,672,-400\n1144,456,-600\n848,280,-616\n744,64,-576\n792,-192,-464\n944,-504,-368\n1104,-816,-232\n1216,-1072,-96\n1288,-1224,-24\n1344,-1336,16\n1392,-1336,72\n1432,-1232,104\n1456,-1072,88\n1456,-920,56\n1416,-760,8\n1368,-616,-48\n1312,-472,-96\n1232,-304,-48\n1192,8,112\n1240,760,416\n1320,2416,640\n1744,3248,488\n1944,3664,1472\n1688,3872,1024\n1320,3976,616\n1104,4024,272\n912,3936,160\n664,3440,184\n360,2848,304\n72,2280,440\n-184,1792,480\n-416,1368,568\n-616,1072,568\n-792,848,512\n-960,688,368\n-1128,568,64\n-1216,472,-96\n-1200,376,-272\n-1168,296,-376\n-1152,208,-320\n-1216,160,-272\n-1384,136,-224\n-1576,144,-136\n-1696,168,-120\n-1688,144,-152\n-1592,80,-80\n-1456,8,8\n-1320,-16,56\n-1200,-8,152\n-1120,48,304\n-1088,136,400\n-1128,280,496\n-1160,536,696\n-1288,1064,1056\n-1496,2072,1224\n-1648,3072,1504\n-1528,3576,1944\n-1080,3824,1672\n-424,3952,1624\n200,4016,1552\n680,4048,1336\n1280,3872,1096\n1904,3224,1008\n2320,2344,688\n2296,1576,384\n1920,1104,88\n1464,808,-168\n1048,608,-416\n776,480,-416\n704,376,-424\n856,232,-432\n1112,-24,-328\n1360,-312,-240\n1528,-560,-120\n1576,-784,-16\n1576,-976,72\n1584,-1112,176\n1576,-1248,248\n1560,-1288,280\n1504,-1208,272\n1440,-1104,256\n1400,-944,200\n1376,-760,120\n1336,-568,96\n1272,-328,120\n1240,24,160\n1224,816,400\n1224,2432,832\n1368,3256,800\n1360,3664,1640\n992,3872,1208\n592,3976,960\n432,4024,408\n336,4056,192\n168,3696,168\n-56,3080,192\n-272,2456,264\n-448,1912,256\n-608,1496,312\n-760,1184,288\n-888,944,192\n-1008,768,-8\n-1104,648,-208\n-1128,504,-360\n-1096,344,-440\n-1048,176,-440\n-1032,56,-432\n-1096,0,-384\n-1256,-16,-304\n-1456,-8,-200\n-1616,-16,-120\n-1656,-24,-64\n-1584,-56,-32\n-1448,-96,24\n-1312,-96,56\n-1184,-72,144\n-1088,-56,216\n-1024,-32,328\n-984,16,408\n-968,160,560\n-992,504,840\n-1072,1304,1152\n-1240,2472,1296\n-1472,3272,1840\n-1344,3680,1672\n-856,3880,1320\n-272,3976,1392\n240,4024,1200\n672,4056,1088\n1152,3688,904\n1624,3064,768\n1944,2312,504\n1952,1656,112\n1664,1280,-136\n1312,1056,-352\n960,872,-520\n752,728,-600\n688,560,-600\n784,320,-520\n984,32,-376\n1208,-296,-320\n1384,-560,-288\n1496,-800,-272\n1536,-1032,-112\n1520,-1256,24\n1488,-1424,96\n1408,-1496,152\n1336,-1432,168\n1272,-1296,136\n1248,-1112,56\n1224,-888,24\n1200,-640,0\n1176,-328,-8\n1168,232,88\n1144,1600,560\n1176,2840,232\n1384,3456,968\n1320,3768,1296\n1072,3920,856\n976,4000,152\n936,4040,-40\n800,3992,-168\n536,3392,-48\n240,2696,112\n-40,2080,200\n-280,1592,240\n-488,1256,312\n-672,1024,280\n-832,872,144\n-936,736,-96\n-1008,640,-296\n-1088,560,-408\n-1168,456,-448\n-1264,328,-472\n-1368,264,-504\n-1480,256,-456\n-1568,288,-304\n-1600,368,-208\n-1568,384,-192\n-1504,336,-72\n-1448,232,-8\n-1376,112,64\n-1328,-8,200\n-1272,-88,336\n-1216,-120,464\n-1208,-64,608\n-1200,72,720\n-1248,328,864\n-1368,768,792\n-1600,1584,1064\n-1840,2656,1256\n-1848,3368,1536\n-1480,3720,1120\n-824,3904,808\n-112,3992,760\n376,4032,728\n912,4056,632\n1432,3560,520\n1840,2808,464\n1968,2064,64\n1824,1496,-240\n1504,1136,-424\n1152,928,-472\n872,776,-544\n720,632,-464\n768,448,-408\n952,224,-328\n1224,-104,-200\n1456,-384,-216\n1576,-616,-176\n1584,-848,-128\n1528,-992,-56\n1456,-1080,56\n1376,-1128,248\n1344,-1112,392\n1336,-1048,384\n1304,-944,384\n1264,-800,352\n1200,-640,232\n1128,-456,112\n1048,-224,168\n992,208,88\n960,1408,296\n1032,2744,296\n1192,3408,664\n1120,3744,832\n816,3912,568\n584,3992,344\n424,4040,192\n232,4056,96\n16,3608,16\n-200,2992,-16\n-376,2408,64\n-528,1912,80\n-640,1512,88\n-752,1200,96\n-856,952,48\n-960,752,-56\n-1024,592,-184\n-1064,464,-344\n-1072,360,-448\n-1104,264,-384\n-1144,128,-424\n-1240,48,-368\n-1408,0,-336\n-1560,-24,-272\n-1672,-32,-200\n-1688,-40,-120\n-1632,-96,-24\n-1552,-168,120\n-1512,-208,304\n-1520,-216,496\n-1544,-176,656\n-1520,-96,792\n-1568,24,984\n-1712,232,1056\n-1824,744,1256\n-1952,1656,1488\n-1912,2672,1456\n-1672,3376,1840\n-1368,3728,1320\n-728,3904,496\n-152,3992,848\n296,4032,880\n752,4056,832\n1376,4024,696\n1840,3472,984\n2264,2664,736\n2552,1888,136\n2392,1496,-168\n1976,1264,-608\n1520,1032,-728\n1232,752,-688\n1144,456,-616\n1280,64,-480\n1496,-352,-312\n1632,-688,-192\n1632,-984,-160\n1520,-1144,-200\n1384,-1240,-88\n1256,-1216,-48\n1192,-1112,40\n1176,-992,80\n1224,-840,200\n1256,-688,184\n1248,-544,184\n1176,-448,104\n1088,-360,40\n992,-256,8\n904,-32,0\n864,480,-56\n888,1632,72\n1160,2856,-32\n1456,3464,576\n1440,3776,408\n1248,3928,144\n1032,4000,-152\n816,4040,-128\n552,3816,-56\n232,3312,56\n-64,2784,112\n-312,2288,168\n-520,1880,112\n-696,1536,128\n-856,1272,112\n-968,1048,-16\n-1040,856,-112\n-1088,696,-312\n-1112,544,-392\n-1128,392,-448\n-1168,256,-480\n-1256,176,-496\n-1352,120,-400\n-1496,56,-272\n-1640,-8,-128\n-1736,-72,-16\n-1768,-168,80\n-1752,-280,240\n-1728,-376,376\n-1680,-416,512\n-1616,-352,624\n-1560,-200,712\n-1560,40,816\n-1648,448,1096\n-1824,1168,1576\n-1984,2336,1760\n-1936,3208,2120\n-1664,3640,2800\n-1168,3864,1848\n-528,3968,1936\n96,4024,2112\n624,4048,2008\n1200,4064,1520\n1680,3544,1136\n2032,2784,776\n2296,2024,488\n2248,1488,200\n2000,1160,-64\n1720,856,-328\n1528,544,-440\n1464,232,-440\n1504,-56,-352\n1568,-320,-280\n1624,-608,-184\n1600,-872,-128\n1536,-1032,-224\n1456,-1136,-136\n1368,-1200,-64\n1312,-1128,16\n1304,-1000,72\n1336,-832,104\n1376,-656,16\n1384,-488,-80\n1336,-328,-104\n1232,-176,-56\n1128,64,-16\n1112,680,192\n1160,2144,48\n1488,3112,168\n1784,3592,1032\n1760,3840,512\n1560,3960,64\n1352,4016,-240\n1120,4048,-120\n792,3760,-16\n392,3264,208\n8,2760,344\n-320,2288,528\n-576,1904,488\n-768,1592,480\n-912,1312,424\n-1016,1088,256\n-1096,872,32\n-1160,672,-64\n-1216,504,-216\n-1240,360,-280\n-1272,264,-328\n-1352,192,-384\n-1456,152,-336\n-1568,88,-272\n-1680,16,-224\n-1696,-40,-168\n-1624,-88,-144\n-1496,-104,-16\n-1392,-120,64\n-1296,-104,184\n-1256,-56,288\n-1248,32,376\n-1264,232,456\n-1280,560,544\n-1328,1136,696\n-1432,2128,888\n-1504,3104,896\n-1360,3592,1296\n-1056,3832,1256\n-640,3960,1064\n-144,4016,888\n248,4048,984\n504,4064,1120\n816,3904,1120\n1240,3368,1048\n1752,2736,1088\n2232,1968,608\n2368,1328,216\n2104,976,-152\n1680,736,-464\n1280,488,-472\n1008,272,-352\n912,16,-256\n984,-304,-104\n1136,-648,-72\n1328,-976,-32\n1440,-1176,24\n1448,-1304,40\n1344,-1312,80\n1208,-1232,160\n1104,-1096,224\n1056,-928,272\n1056,-752,272\n1096,-576,248\n1136,-416,136\n1152,-296,16\n1128,-168,-56\n1088,8,-72\n1048,408,-64\n1016,1488,184\n1136,2784,-136\n1512,3432,536\n1600,3752,728\n1368,3912,344\n1112,4000,200\n912,4040,144\n688,3864,216\n376,3432,312\n64,2936,376\n-216,2488,392\n-424,2072,376\n-584,1704,416\n-704,1384,384\n-824,1112,400\n-912,912,288\n-1000,744,168\n-1056,608,72\n-1056,480,-48\n-1016,360,-152\n-992,240,-192\n-1008,120,-152\n-1112,16,-104\n-1272,-104,-40\n-1472,-184,24\n-1608,-248,-16\n-1648,-248,-32\n-1544,-184,-32\n-1368,-96,8\n-1232,0,40\n-1136,112,104\n-1072,256,176\n-1024,408,248\n-992,648,384\n-1000,1088,512\n-1048,1960,520\n-1104,2912,376\n-1096,3496,696\n-896,3784,640\n-512,3936,424\n-56,4008,392\n280,4040,504\n480,4056,728\n832,3632,816\n1232,3048,728\n1728,2376,968\n2112,1648,416\n2088,1056,88\n1744,744,-248\n1280,568,-480\n832,400,-464\n504,240,-304\n320,40,-136\n280,-240,48\n368,-576,136\n512,-904,192\n704,-1184,136\n880,-1368,152\n1000,-1472,200\n1064,-1416,176\n1056,-1256,184\n1024,-1088,232\n1016,-888,240\n1032,-704,208\n1056,-536,224\n1088,-392,160\n1088,-272,136\n1048,-184,176\n992,-88,256\n952,320,464\n1080,1800,-280\n1288,2944,-288\n1816,3512,200\n2104,3792,88\n1912,3936,96\n1584,4008,16\n1320,4040,96\n1000,3976,224\n640,3560,152\n296,3072,72\n-8,2600,16\n-216,2176,72\n-360,1784,112\n-464,1416,152\n-552,1104,184\n-640,848,192\n-728,648,144\n-816,504,72\n-920,384,-8\n-1072,248,32\n-1264,96,72\n-1464,-16,112\n-1680,-72,144\n-1880,-104,136\n-2032,-64,120\n-1952,-32,-8\n-1760,0,-8\n-1528,24,8\n-1344,96,88\n-1232,224,160\n-1192,400,184\n-1216,728,288\n-1224,1376,208\n-1248,2184,104\n-1152,3080,152\n-944,3584,112\n-648,3832,-88\n-128,3952,-312\n304,4016,-296\n528,4048,-104\n688,3784,-88\n856,3160,112\n1144,2464,152\n1424,1792,240\n1608,1160,72\n1568,672,-144\n1320,376,-360\n1040,208,-464\n736,96,-448\n472,-24,-280\n288,-152,-112\n208,-272,40\n224,-360,152\n280,-400,216\n352,-400,200\n424,-352,168\n480,-248,112\n536,-56,-40\n560,256,-256\n576,624,-440\n592,952,-584\n608,1200,-760\n600,1224,-832\n536,1136,-920\n456,984,-936\n304,840,-912\n112,736,-1000\n-128,680,-1144\n-352,592,-1336\n-624,464,-1336\n-904,400,-1704\n-1120,416,-1888\n-1160,368,-1824\n-1040,344,-1784\n-896,248,-1592\n-752,128,-1392\n-608,-24,-1168\n-488,-168,-848\n-384,-264,-616\n-288,-328,-472\n-216,-376,-368\n-208,-416,-320\n-248,-424,-296\n-328,-376,-304\n-408,-296,-264\n-464,-216,-200\n-480,-144,-168\n-512,-96,-136\n-544,-96,-136\n-592,-120,-112\n-608,-168,-88\n-600,-200,-128\n-584,-224,-192\n-552,-240,-280\n-536,-256,-392\n-520,-256,-512\n-520,-192,-640\n-512,-104,-592\n-528,0,-592\n-624,48,-680\n-720,64,-1064\n-800,88,-1480\n-816,32,-1808\n-840,-8,-1904\n-904,-24,-2224\n-888,-32,-2504\n-768,-64,-2624\n-664,-104,-2376\n-552,-128,-2096\n-432,-160,-1792\n-312,-176,-1488\n-184,-200,-1224\n-40,-232,-920\n128,-280,-624\n288,-272,-304\n448,-208,-88\n616,-112,176\n768,-56,456\n872,-48,608\n888,-88,648\n856,-144,648\n824,-88,880\n776,88,744\n752,264,640\n768,384,568\n856,424,464\n984,440,344\n1128,360,264\n1224,176,224\n1232,-48,216\n1208,-224,216\n1248,-256,-24\n1400,40,-608\n1656,928,-1080\n2152,1936,-1496\n2920,3008,-1504\n3496,3544,-1464\n3288,3808,-1352\n2624,3944,-1112\n2064,3752,-800\n1664,3408,-456\n1256,2936,-64\n864,2576,304\n480,2320,464\n120,2184,656\n-288,2136,640\n-800,2040,408\n-1256,1904,232\n-1536,1712,48\n-1608,1432,-80\n-1512,1104,-184\n-1352,800,-192\n-1240,528,-200\n-1232,304,-216\n-1352,160,-224\n-1544,88,-224\n-1728,48,-160\n-1800,88,-288\n-1688,144,-264\n-1472,176,-304\n-1240,176,-272\n-1064,160,-160\n-952,136,-136\n-888,152,-80\n-872,176,8\n-872,256,40\n-872,464,56\n-832,1096,-48\n-912,2064,-504\n-1248,2952,-232\n-1200,3520,-240\n-776,3800,-528\n-192,3936,-384\n416,4008,-408\n672,4040,72\n896,4064,520\n1368,3648,632\n1904,3024,1112\n2400,2120,1120\n2576,1344,752\n2304,904,392\n1872,528,-328\n1352,168,-400\n840,-120,-296\n488,-328,-176\n376,-592,48\n440,-848,232\n632,-1128,336\n832,-1336,328\n1032,-1456,312\n1200,-1440,240\n1288,-1352,184\n1296,-1176,160\n1312,-1024,144\n1312,-864,272\n1376,-736,336\n1456,-632,344\n1512,-504,256\n1520,-368,360\n1472,-240,440\n1432,-80,456\n1552,600,704\n1872,2336,-512\n2560,3208,-560\n2960,3640,8\n2632,3864,-400\n2168,3968,-568\n1840,4024,-584\n1488,3808,-448\n1088,3360,-200\n656,2920,56\n240,2512,232\n-144,2160,400\n-488,1824,576\n-752,1528,584\n-952,1328,504\n-1096,1160,376\n-1200,1000,264\n-1232,872,24\n-1232,768,-208\n-1232,656,-488\n-1272,480,-488\n-1384,304,-312\n-1568,224,-312\n-1752,216,-280\n-1888,208,-192\n-1896,160,-120\n-1800,96,-136\n-1664,32,-56\n-1536,-8,40\n-1384,32,160\n-1288,120,224\n-1192,248,272\n-1120,448,264\n-1072,816,304\n-1056,1544,296\n-1088,2624,384\n-1152,3352,912\n-912,3712,632\n-480,3896,392\n120,3984,304\n536,4032,480\n848,4056,672\n1288,4064,784\n1640,3576,1248\n2096,2840,992\n2400,1952,696\n2312,1280,360\n1952,848,-32\n1480,528,-384\n1040,280,-192\n752,56,-8\n728,-248,64\n920,-656,168\n1184,-1088,264\n1440,-1488,272\n1600,-1728,240\n1576,-1784,200\n1448,-1664,176\n1288,-1448,208\n1200,-1248,264\n1216,-1064,368\n1352,-920,456\n1496,-784,456\n1600,-616,376\n1600,-424,344\n1520,-192,368\n1520,472,336\n1592,2232,224\n1840,3152,-320\n2056,3616,232\n1904,3848,-152\n1576,3960,-368\n1392,4024,-480\n1272,3904,-384\n1064,3424,-112\n760,2848,176\n432,2368,320\n120,2016,448\n-176,1752,512\n-440,1552,600\n-648,1384,528\n-792,1272,440\n-912,1168,392\n-1000,1080,320\n-1072,1016,112\n-1112,920,-72\n-1144,752,-240\n-1184,576,-240\n-1304,408,-152\n-1464,264,-152\n-1616,208,-120\n-1704,184,-144\n-1720,176,-112\n-1672,144,-104\n-1584,64,-88\n-1448,24,-88\n-1368,8,8\n-1328,40,120\n-1344,80,208\n-1320,176,328\n-1288,376,448\n-1264,880,624\n-1320,1928,184\n-1312,2944,368\n-1096,3512,264\n-704,3792,120\n-40,3936,-104\n360,4008,592\n584,4040,1040\n1072,3872,888\n1584,3304,1464\n2240,2568,1184\n2664,1736,576\n2512,1120,168\n2032,728,-168\n1512,408,-344\n1032,152,-248\n688,-112,-32\n520,-472,200\n552,-880,232\n696,-1192,304\n888,-1464,344\n1080,-1608,296\n1200,-1616,192\n1216,-1472,144\n1176,-1240,128\n1120,-1000,200\n1112,-816,320\n1184,-704,432\n1328,-640,480\n1472,-584,480\n1552,-480,488\n1536,-264,464\n1560,376,384\n1664,2232,-88\n1888,3152,-800\n2256,3616,-64\n2160,3848,-504\n1864,3960,-672\n1640,4024,-720\n1432,3872,-616\n1136,3368,-464\n784,2832,-280\n408,2352,-96\n40,1920,-16\n-296,1568,152\n-600,1256,240\n-824,1008,264\n-976,824,272\n-1064,696,216\n-1136,600,88\n-1240,504,-8\n-1280,376,-128\n-1328,240,-248\n-1304,88,-248\n-1320,-48,-160\n-1400,-64,-104\n-1536,-40,-56\n-1648,-40,-56\n-1616,-56,-72\n-1440,-88,-96\n-1232,-96,-96\n-1056,-56,-48\n-928,0,24\n-832,104,48\n-752,256,104\n-696,464,112\n-688,928,168\n-728,1840,-32\n-920,2880,-136\n-944,3480,-144\n-824,3776,224\n-464,3928,-120\n24,4000,-104\n360,4040,96\n600,4024,360\n880,3648,688\n1224,3176,688\n1472,2616,760\n1704,2016,536\n1752,1464,152\n1608,1048,40\n1344,776,-40\n1096,528,-88\n912,256,-120\n840,-56,-32\n872,-408,-32\n968,-784,16\n1088,-1088,88\n1168,-1280,160\n1192,-1368,152\n1160,-1320,216\n1120,-1232,240\n1072,-1120,304\n1040,-1000,368\n1048,-880,496\n1088,-776,448\n1128,-688,376\n1152,-600,216\n1136,-512,144\n1080,-408,128\n1048,-240,104\n1112,352,-144\n1160,1816,-616\n1440,2944,-616\n2016,3512,80\n2176,3792,-248\n1936,3936,-360\n1712,4008,-384\n1480,3856,-88\n1176,3368,168\n768,2856,416\n368,2384,568\n24,2040,568\n-320,1768,560\n-664,1560,448\n-976,1352,352\n-1192,1184,200\n-1288,1008,-8\n-1256,880,-184\n-1152,728,-304\n-1104,536,-360\n-1152,296,-280\n-1280,112,-200\n-1432,0,-168\n-1576,-72,-72\n-1672,-120,-104\n-1680,-136,-56\n-1608,-144,-8\n-1448,-136,96\n-1304,-136,136\n-1168,-120,216\n-1096,-72,320\n-1056,8,392\n-1024,136,456\n-1024,360,552\n-1032,960,784\n-1088,2112,456\n-1064,3048,496\n-816,3560,832\n-528,3816,776\n40,3952,1016\n408,4016,1264\n848,4048,1008\n1416,3792,936\n1984,3168,976\n2320,2328,792\n2288,1600,608\n1928,1088,360\n1472,696,-32\n1016,424,-320\n616,216,-344\n368,64,-224\n304,-112,-168\n408,-336,-136\n624,-640,-72\n808,-952,-104\n976,-1248,-56\n1048,-1456,-24\n1032,-1576,16\n944,-1520,88\n856,-1360,192\n792,-1152,320\n824,-960,392\n936,-784,392\n1064,-600,312\n1216,-424,200\n1344,-240,144\n1408,-48,136\n1400,256,128\n1416,1272,232\n1432,2672,-96\n1816,3376,424\n2056,3728,912\n1744,3904,456\n1320,3992,192\n1032,4032,112\n728,3720,184\n360,3224,416\n-8,2712,448\n-288,2232,456\n-520,1768,472\n-672,1336,480\n-784,936,544\n-880,632,512\n-968,408,448\n-1056,264,320\n-1192,192,152\n-1328,136,-48\n-1352,80,-152\n-1288,8,-168\n-1216,-32,-16\n-1248,-64,32\n-1368,-120,64\n-1544,-192,112\n-1672,-256,88\n-1616,-312,72\n-1456,-312,136\n-1288,-272,144\n-1168,-168,168\n-1104,-40,272\n-1072,144,360\n-1072,368,416\n-1144,920,680\n-1376,2000,664\n-1464,3040,912\n-1296,3560,912\n-1040,3816,960\n-584,3952,672\n-80,4016,840\n288,4048,904\n592,3984,904\n888,3448,824\n1232,2856,768\n1576,2240,648\n1816,1576,312\n1752,1032,144\n1472,760,-128\n1128,560,-288\n800,360,-240\n568,136,-184\n504,-168,-120\n576,-512,-128\n744,-824,-120\n888,-1072,-96\n1032,-1264,-88\n1112,-1376,-96\n1120,-1360,-64\n1096,-1240,-40\n1088,-1080,72\n1104,-904,168\n1224,-752,208\n1376,-576,192\n1504,-432,136\n1560,-296,40\n1504,-176,40\n1416,64,96\n1400,808,136\n1344,2392,-32\n1648,3232,-136\n2016,3656,432\n1888,3864,-104\n1544,3976,-416\n1352,4024,-408\n1160,3872,-168\n872,3408,40\n544,2896,216\n216,2432,304\n-88,2008,472\n-344,1624,496\n-560,1280,552\n-736,992,536\n-912,744,464\n-1080,568,320\n-1208,448,248\n-1272,376,112\n-1240,328,-24\n-1192,248,-48\n-1168,144,-64\n-1232,24,-64\n-1376,-64,-88\n-1464,-128,-80\n-1568,-200,-96\n-1576,-248,-64\n-1504,-264,-40\n-1400,-208,-16\n-1288,-104,8\n-1184,-16,56\n-1104,72,104\n-1024,216,152\n-984,472,216\n-984,952,200\n-1040,1776,8\n-1136,2888,-136\n-1152,3480,-160\n-1104,3776,184\n-752,3928,-72\n-240,4000,-56\n152,4040,104\n384,4056,472\n728,3680,728\n1208,3128,672\n1696,2496,880\n2104,1736,440\n2136,1128,240\n1832,872,-112\n1376,640,-224\n904,416,-128\n560,160,24\n416,-184,176\n424,-632,296\n520,-1048,432\n696,-1408,464\n872,-1704,448\n992,-1832,472\n1048,-1760,416\n1072,-1552,336\n1088,-1288,312\n1144,-1040,240\n1280,-776,248\n1496,-560,208\n1712,-352,152\n1824,-216,144\n1736,-144,192\n1576,48,240\n1520,840,296\n1520,2456,-432\n1880,3264,-464\n2208,3672,8\n2072,3872,-384\n1728,3976,-592\n1480,4024,-576\n1208,3752,-360\n832,3232,-88\n424,2784,144\n56,2408,248\n-264,2032,368\n-528,1656,392\n-720,1336,456\n-848,1104,440\n-936,912,328\n-1040,768,168\n-1144,664,-8\n-1192,560,-120\n-1208,472,-136\n-1216,384,-152\n-1296,280,-24\n-1480,176,24\n-1704,56,40\n-1864,-88,104\n-1904,-152,-24\n-1800,-200,-24\n-1624,-200,-16\n-1424,-136,80\n-1232,-32,160\n-1072,88,240\n-936,224,216\n-856,392,192\n-808,640,304\n-848,1072,296\n-984,1856,168\n-1144,2688,312\n-1240,3384,408\n-1168,3728,488\n-808,3904,328\n-280,3992,312\n152,4032,448\n424,4024,672\n736,3536,816\n1128,2928,816\n1544,2232,872\n1904,1520,312\n1912,976,48\n1624,800,-288\n1240,624,-488\n872,416,-408\n648,152,-288\n584,-224,-160\n688,-680,-32\n856,-1096,24\n1040,-1440,8\n1184,-1672,224\n1216,-1696,264\n1208,-1552,304\n1192,-1368,344\n1192,-1144,384\n1280,-912,400\n1408,-672,312\n1552,-456,192\n1648,-272,112\n1640,-184,80\n1544,-88,184\n1536,352,224\n1656,1720,144\n2096,2896,-16\n2784,3488,480\n2808,3784,24\n2456,3928,-400\n2168,4008,-432\n1824,4024,-64\n1368,3576,200\n896,3080,464\n448,2672,560\n56,2360,560\n-288,2032,648\n-568,1712,640\n-768,1416,576\n-904,1176,528\n-1008,976,280\n-1096,816,168\n-1112,712,-104\n-1128,600,-296\n-1152,424,-296\n-1176,248,-288\n-1208,136,-264\n-1296,96,-264\n-1408,88,-216\n-1520,72,-192\n-1592,80,-176\n-1552,48,-96\n-1424,24,-88\n-1304,40,-64\n-1192,56,-48\n-1120,96,64\n-1064,176,136\n-1016,328,224\n-984,592,304\n-984,1064,312\n-1072,1824,384\n-1208,2696,584\n-1224,3384,880\n-1040,3736,936\n-552,3904,736\n32,3992,656\n432,4032,808\n824,4056,952\n1496,4000,1256\n2328,3400,1568\n3064,2368,1176\n3040,1576,824\n2488,1008,480\n1736,608,-32\n1072,312,-88\n552,88,8\n272,-160,136\n184,-488,360\n232,-768,520\n392,-1024,512\n576,-1264,488\n768,-1472,432\n952,-1600,272\n1072,-1576,128\n1072,-1400,72\n1024,-1160,56\n984,-928,56\n1016,-720,96\n1128,-608,152\n1272,-552,160\n1392,-520,168\n1448,-496,264\n1440,-488,368\n1408,-432,376\n1440,-64,344\n1656,1200,-288\n2040,2640,-648\n3064,3360,-88\n3088,3720,-344\n2472,3896,-720\n1992,3992,-720\n1632,3776,-424\n1280,3288,-88\n880,2832,144\n488,2448,240\n104,2136,280\n-240,1832,368\n-544,1560,280\n-800,1344,256\n-1008,1184,184\n-1160,1080,40\n-1232,984,-152\n-1192,848,-288\n-1144,624,-264\n-1120,344,-128\n-1168,152,-112\n-1320,0,-104\n-1512,-104,-40\n-1744,-168,-16\n-1912,-208,-16\n-1904,-208,-88\n-1728,-176,-64\n-1536,-96,24\n-1376,-8,96\n-1256,96,160\n-1184,240,232\n-1144,416,272\n-1160,712,432\n-1232,1312,512\n-1368,2400,344\n-1400,3240,480\n-1280,3656,616\n-888,3872,648\n-200,3976,640\n328,4024,672\n608,4048,880\n952,3944,1056\n1440,3480,1312\n2048,2712,1416\n2648,1680,872\n2664,1032,616\n2192,760,248\n1504,512,-16\n984,312,88\n744,16,168\n752,-400,288\n896,-800,416\n1080,-1200,440\n1288,-1552,400\n1392,-1736,368\n1344,-1720,320\n1248,-1568,272\n1184,-1320,280\n1216,-1080,288\n1352,-896,312\n1520,-720,280\n1664,-584,192\n1720,-472,120\n1656,-384,96\n1552,-272,128\n1464,24,112\n1528,832,-32\n1640,2456,-592\n2272,3264,-304\n2624,3672,-224\n2248,3872,-720\n1744,3976,-584\n1432,4016,-360\n1112,3552,-8\n752,3064,208\n360,2664,360\n-16,2328,472\n-360,1984,544\n-648,1648,408\n-848,1376,448\n-1008,1152,464\n-1128,984,352\n-1184,872,168\n-1176,800,0\n-1144,688,-48\n-1104,520,-72\n-1104,360,-32\n-1176,184,-88\n-1280,64,-80\n-1456,-32,-16\n-1664,-104,0\n-1784,-176,-120\n-1792,-224,-176\n-1656,-216,-144\n-1472,-168,-88\n-1312,-112,-40\n-1192,-24,-24\n-1104,64,8\n-1064,184,56\n-1072,416,128\n-1128,1000,248\n-1208,2328,-72\n-1240,3200,32\n-1184,3640,-120\n-888,3856,-112\n-176,3968,-296\n304,4024,120\n536,4048,488\n832,3864,744\n1232,3440,808\n1696,2800,1000\n2168,2040,904\n2304,1384,448\n2016,984,-8\n1504,728,-256\n960,472,-96\n520,216,96\n272,-128,400\n264,-528,536\n408,-952,520\n624,-1320,584\n848,-1624,536\n1080,-1792,456\n1256,-1744,296\n1328,-1544,184\n1312,-1272,144\n1272,-1024,168\n1264,-816,272\n1328,-648,328\n1416,-512,368\n1488,-392,312\n1504,-288,328\n1448,-200,304\n1408,0,264\n1464,728,-32\n1616,2400,-392\n2248,3240,-536\n2784,3656,248\n2480,3872,-264\n1984,3976,-424\n1672,4024,-432\n1360,3872,-248\n1016,3360,-80\n656,2792,72\n312,2312,160\n-24,1920,328\n-304,1536,392\n-544,1240,384\n-736,1016,384\n-904,888,296\n-1040,832,232\n-1152,792,112\n-1176,736,16\n-1176,640,-104\n-1168,480,-128\n-1248,280,-56\n-1392,128,-88\n-1600,56,-40\n-1768,64,-24\n-1784,72,16\n-1712,48,-40\n-1560,0,-48\n-1392,-40,0\n-1224,-32,72\n-1096,32,144\n-1016,120,216\n-968,192,272\n-968,264,272\n-968,400,352\n-936,704,384\n-920,1480,280\n-960,2432,56\n-1008,3256,360\n-848,3664,168\n-504,3872,88\n-40,3976,168\n416,4024,232\n672,4056,488\n992,3808,720\n1328,3240,832\n1768,2520,1240\n2088,1792,552\n2120,1200,192\n1840,832,-176\n1408,592,-480\n984,432,-480\n664,288,-440\n544,136,-320\n576,-160,-152\n752,-480,-40\n960,-832,72\n1160,-1168,112\n1320,-1376,176\n1368,-1448,224\n1296,-1392,280\n1200,-1256,320\n1112,-1112,360\n1088,-936,392\n1120,-744,336\n1160,-584,280\n1184,-440,168\n1176,-312,136\n1120,-192,160\n1040,-88,224\n976,32,304\n984,328,192\n1144,1256,440\n1480,2664,80\n2120,3376,288\n2400,3728,456\n2080,3904,136\n1624,3992,344\n1224,4032,648\n832,3928,736\n424,3632,576\n24,3192,272\n-336,2728,80\n-664,2280,-88\n-912,1872,-144\n-1096,1520,-160\n-1224,1240,-248\n-1288,1024,-384\n-1336,872,-464\n-1392,728,-504\n-1464,576,-464\n-1536,448,-392\n-1600,296,-320\n-1640,176,-304\n-1664,80,-264\n-1632,8,-288\n-1576,-48,-208\n-1456,-88,-80\n-1296,-88,16\n-1160,-24,136\n-1064,128,312\n-1008,352,448\n-992,768,536\n-1024,1672,400\n-1128,2832,216\n-1056,3456,144\n-824,3768,272\n-352,3920,176\n144,4000,336\n512,4040,536\n920,4024,584\n1328,3592,856\n1840,3048,1080\n2336,2272,880\n2440,1600,720\n2104,1232,488\n1632,976,160\n1144,800,-88\n728,672,-80\n512,504,48\n512,240,136\n704,-240,200\n952,-792,224\n1192,-1256,104\n1352,-1664,104\n1352,-1888,72\n1224,-1904,128\n1096,-1808,240\n1000,-1640,312\n968,-1424,424\n1016,-1224,448\n1152,-1056,336\n1312,-880,184\n1432,-680,32\n1504,-464,-24\n1480,-216,8\n1520,400,-56\n1552,1984,-168\n2032,3032,216\n2944,3552,1152\n2960,3816,408\n2560,3944,80\n2176,4016,184\n1736,3824,440\n1248,3288,648\n800,2736,752\n400,2288,816\n48,1968,832\n-256,1672,688\n-544,1408,584\n-824,1176,472\n-1096,960,344\n-1288,784,232\n-1360,632,88\n-1328,472,8\n-1312,296,-88\n-1344,128,-88\n-1464,-16,-32\n-1648,-88,-16\n-1608,-80,64\n-1824,-40,-136\n-1848,32,-272\n-1688,96,-360\n-1480,128,-312\n-1304,176,-136\n-1176,248,-56\n-1080,304,56\n-1032,344,256\n-984,384,416\n-944,528,688\n-888,976,1024\n-800,2128,352\n-888,3104,624\n-816,3592,640\n-344,3832,312\n168,3960,168\n536,4016,272\n832,4048,512\n1192,3944,784\n1520,3384,1032\n1816,2664,968\n1992,1808,856\n1960,1096,584\n1704,584,368\n1432,192,120\n1216,-224,-72\n1088,-744,-40\n1008,-984,-16\n1016,-1272,128\n1152,-1560,272\n1288,-1816,296\n1328,-1920,328\n1240,-1800,440\n1112,-1552,560\n1040,-1296,648\n1072,-1072,680\n1208,-872,640\n1424,-712,536\n1664,-544,360\n1832,-360,336\n1840,-176,432\n1760,-80,528\n1680,48,672\n1840,760,664\n2336,2416,8\n3208,3248,448\n3280,3664,416\n2816,3872,-296\n2464,3976,-560\n2112,4024,-392\n1688,3736,-56\n1224,3280,256\n768,2864,504\n328,2568,664\n-112,2336,776\n-520,2088,840\n-896,1832,712\n-1248,1672,584\n-1472,1568,448\n-1560,1432,208\n-1576,1192,48\n-1528,904,-24\n-1456,664,-200\n-1424,480,-120\n-1424,376,-136\n-1496,376,-144\n-1568,384,-64\n-1664,424,-88\n-1624,432,-120\n-1480,408,-184\n-1288,384,-152\n-1104,392,-144\n-968,416,-104\n-848,408,-64\n-768,384,32\n-720,392,128\n-648,488,160\n-568,792,32\n-472,1496,-304\n-664,2280,-136\n-744,3120,-64\n-424,3600,-376\n-64,3840,-600\n400,3960,-416\n616,4016,152\n864,4048,400\n1304,3768,744\n1728,3360,992\n2120,2664,1000\n2328,1912,704\n2160,1336,392\n1744,936,96\n1232,680,-72\n808,432,48\n480,216,88\n312,-96,232\n328,-544,312\n480,-960,336\n720,-1360,248\n984,-1712,344\n1208,-1896,336\n1312,-1928,240\n1296,-1824,208\n1224,-1640,232\n1192,-1432,272\n1248,-1256,304\n1376,-1136,320\n1512,-1040,392\n1616,-976,456\n1624,-888,568\n1568,-696,632\n1608,-80,960\n2040,1992,-544\n2536,3032,-1112\n3304,3560,-496\n3152,3816,-1112\n2712,3944,-1096\n2384,4016,-520\n1960,3880,-192\n1464,3304,-16\n1032,2648,-80\n680,2128,-168\n368,1744,-216\n72,1576,-152\n-240,1600,0\n-672,1632,-88\n-1168,1656,-152\n-1536,1528,-224\n-1616,1336,-224\n-1560,1136,-456\n-1408,832,-240\n-1296,560,-200\n-1272,400,-184\n-1304,296,-152\n-1360,240,-160\n-1408,224,-200\n-1408,208,-152\n-1360,208,-136\n-1224,224,-176\n-1072,224,-112\n-912,232,-24\n-776,264,40\n-664,312,72\n-600,368,64\n-552,440,80\n-528,544,24\n-496,752,-8\n-544,1176,-176\n-768,1856,-128\n-1024,2544,-224\n-1048,3312,-376\n-872,3696,-272\n-464,3888,-544\n120,3984,-560\n384,4032,80\n624,3896,384\n1000,3376,760\n1464,2808,928\n1904,2040,848\n2112,1336,416\n1944,816,200\n1568,512,40\n1184,232,-32\n856,-104,24\n648,-536,56\n560,-976,192\n608,-1368,152\n792,-1744,232\n984,-1968,368\n1120,-2024,416\n1200,-1904,360\n1248,-1656,368\n1304,-1392,384\n1408,-1120,384\n1560,-872,408\n1736,-632,392\n1840,-392,448\n1800,-184,480\n1728,160,496\n1800,1264,424\n1976,2672,32\n2504,3376,-96\n2720,3728,-328\n2432,3904,-840\n2072,3992,-616\n1744,3984,-304\n1344,3496,8\n920,2968,216\n512,2528,320\n128,2184,368\n-224,1880,464\n-536,1688,432\n-792,1536,440\n-968,1440,336\n-1048,1344,232\n-1056,1200,80\n-1008,1024,-16\n-944,800,-32\n-904,576,-56\n-912,376,-24\n-1000,232,-16\n-1136,136,-56\n-1352,80,-120\n-1536,80,-336\n-1736,96,-408\n-1768,160,-416\n-1656,224,-344\n-1496,272,-256\n-1376,296,-168\n-1256,368,-64\n-1160,448,-32\n-1064,608,64\n-1008,928,40\n-944,1584,-224\n-1160,2344,-56\n-1288,2808,192\n-1104,3440,128\n-720,3760,-128\n-312,3920,-192\n152,4000,72\n448,4040,528\n632,3912,904\n968,3472,904\n1448,2904,1080\n1880,2144,936\n2128,1440,552\n1992,1008,216\n1608,792,-24\n1192,616,-48\n800,400,0\n512,136,104\n384,-232,224\n424,-648,184\n544,-992,160\n744,-1272,112\n936,-1504,144\n1064,-1568,112\n1088,-1464,128\n1072,-1248,208\n1056,-1040,328\n1128,-864,440\n1248,-688,472\n1392,-520,496\n1488,-352,392\n1496,-264,280\n1416,-216,256\n1352,0,224\n1448,840,176\n1504,2456,-280\n2000,3264,-88\n2352,3672,240\n2048,3872,-408\n1616,3976,-536\n1384,4024,-376\n1112,3608,-72\n768,3064,184\n400,2560,344\n32,2120,448\n-288,1720,472\n-592,1392,520\n-816,1160,512\n-1008,1000,432\n-1168,904,328\n-1248,856,264\n-1264,792,64\n-1224,696,-80\n-1184,520,-136\n-1176,312,-48\n-1224,120,-64\n-1344,32,-88\n-1568,8,-88\n-1768,8,-88\n-1832,8,-192\n-1816,8,-152\n-1648,16,-136\n-1424,32,-56\n-1224,72,32\n-1072,128,96\n-968,200,72\n-888,344,120\n-864,584,184\n-896,1024,256\n-1032,1808,168\n-1280,2704,424\n-1360,3392,328\n-1168,3736,144\n-800,3904,16\n-216,3992,8\n248,4032,144\n440,4056,496\n736,3608,488\n1104,2992,288\n1496,2336,552\n1784,1712,208\n1848,1232,40\n1664,984,-168\n1408,792,-296\n1152,600,-328\n944,392,-240\n864,136,-144\n936,-192,-72\n1104,-608,16\n1312,-992,104\n1432,-1312,216\n1480,-1512,288\n1416,-1568,304\n1312,-1472,288\n1232,-1288,280\n1216,-1080,272\n1272,-848,352\n1376,-608,288\n1464,-360,224\n1504,-152,192\n1448,-32,104\n1320,56,136\n1224,232,96\n1160,744,24\n1152,1840,-272\n1336,2960,-608\n1568,3520,72\n1552,3800,176\n1296,3936,64\n1056,4008,-56\n880,4040,-104\n-864,288,96\n-816,552,248\n-776,1080,280\n-800,1888,248\n-1176,2856,440\n-1248,3464,600\n-984,3776,448\n-544,3928,472\n-56,4000,624\n312,4040,904\n656,4056,1000\n1104,3832,912\n1616,3280,1032\n2080,2536,912\n2248,1784,624\n2008,1264,496\n1584,880,328\n1168,600,136\n824,376,-128\n552,200,-216\n400,64,-120\n408,-112,-232\n568,-312,-304\n784,-648,-264\n1000,-992,-240\n1144,-1248,-272\n1232,-1384,-248\n1200,-1456,-136\n1136,-1408,8\n1096,-1280,152\n1064,-1120,184\n1104,-952,320\n1176,-752,288\n1224,-560,192\n1248,-392,64\n1216,-240,16\n1136,-8,120\n1056,584,128\n944,2088,376\n1160,3088,520\n1608,3584,1272\n1664,3832,752\n1320,3952,416\n1136,4016,200\n952,3936,232\n680,3432,304\n360,2840,368\n96,2280,488\n-152,1792,496\n-360,1408,536\n-544,1080,552\n-704,824,568\n-848,640,488\n-992,504,440\n-1088,408,288\n-1136,336,192\n-1104,320,64\n-1048,264,-8\n-1048,176,-216\n-1088,80,-96\n-1192,56,-128\n-1296,104,-168\n-1464,112,-152\n-1552,88,-120\n-1480,32,-88\n-1336,-16,-16\n-1192,-40,72\n-1088,-32,112\n-1000,16,144\n-936,104,208\n-880,240,344\n-888,512,560\n-928,1072,688\n-1088,2144,528\n-1296,3104,952\n-1192,3592,960\n-928,3832,1136\n-480,3960,1040\n-16,4016,1136\n352,4048,1152\n672,3736,976\n960,3152,936\n1296,2544,896\n1576,1880,648\n1640,1304,336\n1480,904,136\n1176,712,-56\n856,584,-200\n584,448,-272\n416,288,-232\n376,40,-128\n456,-296,-144\n640,-688,-56\n808,-1016,-64\n984,-1288,-64\n1112,-1480,64\n1152,-1528,96\n1144,-1432,176\n1112,-1256,272\n1112,-1080,400\n1168,-880,336\n1256,-696,288\n1360,-520,176\n1432,-352,48\n1424,-184,64\n1368,128,24\n1312,824,664\n1280,2456,184\n1656,3264,376\n1952,3672,944\n1728,3872,448\n1328,3976,144\n1096,4024,120\n824,3816,192\n496,3392,360\n152,2944,416\n-176,2464,384\n-464,2024,352\n-680,1624,304\n-824,1280,304\n-928,992,288\n-984,784,224\n-1016,624,168\n-1048,504,80\n-1080,416,8\n-1088,352,-64\n-1104,312,-176\n-1152,256,-120\n-1224,176,-56\n-1328,64,24\n-1408,-40,80\n-1480,-120,120\n-1504,-184,128\n-1456,-216,160\n-1360,-200,232\n-1240,-136,280\n-1152,-32,344\n-1088,96,328\n-1032,264,384\n-992,512,456\n-1024,1040,648\n-1144,2080,528\n-1296,3080,344\n-1224,3576,656\n-1064,3824,568\n-704,3952,136\n-232,4016,48\n152,4048,64\n384,4064,192\n648,3776,256\n936,3144,408\n1224,2496,512\n1432,1880,632\n1624,1368,352\n1640,992,64\n1464,744,-200\n1200,568,-320\n912,440,-368\n672,288,-280\n552,120,-160\n584,-120,-80\n720,-440,80\n888,-744,152\n1040,-1040,176\n1200,-1256,152\n1264,-1304,256\n1248,-1240,320\n1208,-1104,384\n1192,-944,408\n1192,-776,504\n1240,-624,456\n1304,-480,400\n1344,-344,312\n1360,-224,248\n1320,-128,200\n1272,24,248\n1280,520,640\n1448,2288,240\n1672,3184,408\n1912,3632,520\n1784,3856,-136\n1560,3968,-696\n1392,4024,-776\n1208,4048,-488\n920,3672,-24\n552,3112,384\n160,2632,624\n-224,2224,840\n-584,1896,856\n-864,1624,776\n-1128,1424,640\n-1424,1304,624\n-1576,1216,448\n-1600,1112,280\n-1560,1000,-64\n-1544,808,-80\n-1560,520,-216\n-1688,320,-208\n-1896,264,-240\n-2040,296,-184\n-2080,304,-96\n-1944,280,-72\n-1712,248,-96\n-1488,256,-8\n-1296,272,40\n-1152,312,80\n-1032,400,120\n-936,512,176\n-840,704,160\n-776,992,184\n-744,1488,352\n-768,2256,360\n-816,3072,672\n-672,3576,744\n-384,3824,704\n48,3952,544\n392,4016,880\n648,4048,1064\n1064,3968,1056\n1488,3368,1192\n1944,2568,1096\n2240,1776,824\n2168,1160,640\n1808,856,328\n1344,688,-8\n888,584,88\n496,472,128\n224,336,216\n104,112,296\n136,-256,336\n264,-696,320\n448,-1048,208\n688,-1368,200\n880,-1600,264\n1024,-1712,192\n1096,-1616,88\n1128,-1424,104\n1144,-1184,136\n1168,-944,200\n1216,-736,232\n1280,-520,280\n1344,-320,152\n1344,-168,80\n1280,-112,32\n1176,-24,104\n1176,336,208\n1192,1728,-264\n1336,2904,-112\n1904,3488,384\n2176,3784,40\n1936,3928,-232\n1544,4008,-192\n1224,3872,-64\n848,3408,144\n456,2928,352\n88,2520,424\n-240,2144,480\n-504,1800,552\n-712,1480,464\n-856,1224,456\n-984,1040,400\n-1080,904,320\n-1168,784,192\n-1152,632,40\n-1248,496,-96\n-1288,352,-104\n-1312,216,-40\n-1448,136,-128\n-1560,80,24\n-1688,104,48\n-1832,64,32\n-1816,0,-48\n-1656,-40,-40\n-1448,-24,8\n-1264,56,0\n-1136,152,-16\n-1048,240,72\n-968,336,200\n-904,504,392\n-864,920,472\n-968,1880,432\n-1168,2976,568\n-1224,3528,904\n-984,3800,680\n-536,3936,696\n-24,4008,920\n384,4040,1104\n728,4064,1040\n1088,3512,1144\n1520,2800,1080\n1984,2032,864\n2160,1336,584\n1944,1032,336\n1536,888,128\n1136,720,72\n808,536,72\n616,320,104\n552,48,144\n632,-304,152\n776,-656,144\n936,-944,88\n1104,-1208,104\n1264,-1408,48\n1304,-1480,8\n1256,-1368,40\n1184,-1200,88\n1136,-1008,192\n1128,-840,264\n1176,-680,272\n1232,-504,280\n1256,-352,256\n1240,-248,128\n1168,-176,96\n1088,-96,152\n1072,176,144\n1080,1088,56\n1160,2584,-304\n1456,3328,-184\n1728,3704,248\n1592,3888,-184\n1320,3984,-296\n1096,4032,-224\n872,3656,-112\n576,3080,48\n272,2544,152\n-32,2112,192\n-320,1800,200\n-576,1552,184\n-808,1360,136\n-992,1208,64\n-1080,1072,72\n-1088,936,-48\n-1064,760,-88\n-1056,592,-120\n-1088,416,-112\n-1168,280,-120\n-1280,160,-104\n-1424,80,-120\n-1480,64,-56\n-1576,56,-56\n-1608,48,-96\n-1544,32,-56\n-1432,8,-16\n-1296,0,8\n-1176,8,16\n-1080,56,80\n-1000,120,152\n-936,224,200\n-896,424,320\n-912,880,272\n-1040,1848,184\n-1192,2944,88\n-1184,3512,96\n-880,3792,-16\n-400,3936,0\n104,4008,200\n392,4040,536\n728,3808,664\n1104,3192,656\n1504,2520,912\n1824,1800,688\n1912,1208,328\n1648,888,32\n1256,776,-208\n856,656,-312\n488,520,-256\n256,312,-168\n168,32,-48\n240,-392,0\n400,-784,-8\n584,-1104,-16\n808,-1352,-16\n960,-1472,64\n1048,-1464,48\n1064,-1320,40\n1048,-1120,120\n1032,-936,80\n1056,-720,232\n1112,-512,296\n1160,-328,248\n1200,-176,144\n1176,-96,104\n1104,-32,168\n1032,232,544\n1056,1336,304\n1136,2712,8\n1664,3392,656\n1968,3736,544\n1752,3904,120\n1424,3992,-120\n1208,3896,-56\n928,3520,88\n592,3064,264\n248,2624,384\n-64,2208,408\n-304,1816,312\n-496,1488,416\n-608,1216,448\n-712,992,416\n-816,824,432\n-896,720,352\n-936,680,208\n-936,648,56\n-928,576,-72\n-952,440,-32\n-968,288,8\n-1008,152,64\n-1064,48,96\n-1168,-16,144\n-1312,-72,168\n-1440,-112,80\n-1560,-152,64\n-1568,-160,64\n-1448,-144,32\n-1272,-96,56\n-1120,-24,56\n-1000,56,112\n-944,144,136\n-912,296,232\n-960,536,424\n-1072,1072,440\n-1224,2056,368\n-1496,3064,696\n-1536,3568,616\n-1176,3824,360\n-592,3952,400\n-32,4016,736\n360,4048,928\n744,3776,904\n1112,3160,960\n1528,2448,1056\n1872,1808,616\n1928,1312,408\n1728,1088,160\n1400,968,-16\n1080,800,-64\n856,592,-80\n768,304,-56\n816,-56,-8\n960,-456,-64\n1112,-800,-32\n1200,-1048,-48\n1280,-1200,16\n1264,-1272,0\n1192,-1264,24\n1120,-1152,64\n1056,-1000,128\n1032,-816,200\n1016,-640,240\n1024,-456,240\n1032,-288,184\n1024,-160,112\n976,-104,56\n920,-56,96\n880,120,0\n920,760,104\n976,2168,-104\n1128,3128,-72\n1312,3600,360\n1296,3840,-32\n1136,3960,-248\n936,4016,-248\n768,3728,-168\n568,3112,-24\n312,2480,144\n24,1960,192\n-216,1552,216\n-432,1272,248\n-616,1032,208\n-784,848,176\n-912,712,136\n-1000,616,112\n-1032,536,40\n-1032,432,16\n-1000,320,-8\n-976,168,-80\n-1008,32,32\n-1096,-104,48\n-1208,-176,72\n-1304,-200,56\n-1352,-184,32\n-1312,-160,-8\n-1232,-120,-8\n-1112,-80,8\n-992,-32,16\n-872,32,40\n-784,120,80\n-712,208,128\n-656,312,224\n-640,480,312\n-656,848,472\n-744,1632,208\n-984,2576,288\n-1280,3328,704\n-1176,3704,296\n-808,3888,464\n-360,3984,568\n64,4032,648\n496,3832,520\n912,3248,448\n1232,2600,488\n1464,1928,344\n1520,1424,120\n1344,1104,-24\n1080,968,-136\n800,936,-288\n568,880,-400\n424,768,-416\n392,600,-400\n472,392,-328\n648,144,-224\n896,-160,-120\n1168,-448,-40\n1416,-736,88\n1528,-944,104\n1544,-1088,224\n1400,-1128,208\n1200,-1096,264\n1008,-1016,328\n872,-920,320\n776,-776,264\n744,-624,280\n744,-472,192\n768,-296,208\n792,-104,136\n808,144,128\n832,736,80\n808,2184,-208\n800,3128,232\n912,3600,632\n912,3840,224\n824,3960,-256\n728,4016,-464\n624,3952,-384\n464,3480,-192\n224,2864,40\n-96,2320,200\n-408,1888,224\n-688,1584,232\n-888,1376,200\n-1032,1216,144\n-1080,1096,16\n-1056,960,8\n-984,824,-48\n-912,696,-128\n-856,592,-176\n-832,504,-240\n-864,408,-272\n-944,296,-232\n-1048,176,-200\n-1136,64,-192\n-1184,-16,-176\n-1192,-72,-200\n-1136,-96,-224\n-1032,-112,-184\n-920,-120,-168\n-808,-104,-96\n-688,-80,-56\n-592,-56,-48\n-528,-24,-8\n-448,80,-16\n-464,216,120\n-520,544,184\n-696,1176,152\n-1024,2368,-408\n-1704,2952,312\n-1712,3512,-240\n-1208,3800,-344\n-728,3936,-256\n-224,4008,-152\n160,4040,-136\n440,3600,-64\n688,2952,8\n904,2304,64\n1016,1728,112\n1000,1296,88\n864,1048,-32\n680,912,-96\n512,840,-160\n376,808,-312\n256,792,-368\n184,808,-376\n168,792,-344\n232,744,-272\n336,624,-240\n456,480,-216\n584,320,-176\n704,168,-104\n808,16,-40\n904,-112,-40\n992,-208,-8\n1064,-296,56\n1120,-360,64\n1104,-432,144\n1040,-464,192\n912,-464,232\n840,-472,224\n784,-512,176\n744,-520,120\n728,-504,40\n696,-472,-8\n640,-416,56\n544,-320,280\n432,-104,624\n272,336,1152\n160,1224,1088\n160,2592,1336\n400,3336,56\n528,3440,-40\n736,3360,-616\n1264,3128,-1032\n1728,3000,-968\n1800,3304,-984\n1584,3464,-840\n1264,3360,-544\n896,3112,-304\n496,2824,-128\n120,2568,48\n-168,2336,64\n-384,2120,8\n-528,1880,-48\n-608,1640,-112\n-632,1384,-144\n-624,1168,-224\n-592,952,-288\n-576,744,-312\n-592,576,-344\n-640,464,-384\n-704,352,-520\n-776,296,-448\n-832,272,-376\n-896,256,-312\n-936,280,-304\n-944,320,-288\n-944,336,-216\n-912,328,-136\n-880,336,-56\n-856,376,80\n-832,440,120\n-840,664,224\n-864,1192,168\n-944,2096,176\n-1024,2744,-160\n-704,3232,-440\n-304,3656,-232\n136,3864,-536\n456,3840,-424\n728,3584,-664\n928,3328,-608\n1176,3080,-680\n1440,2824,-536\n1592,2520,-456\n1584,2144,-280\n1408,1808,-208\n1144,1456,-88\n896,1144,-96\n720,896,-56\n600,704,-56\n544,584,-56\n536,488,-104\n568,424,-56\n608,352,-96\n648,296,-88\n672,224,-88\n688,168,-112\n688,144,-80\n664,128,-72\n632,128,-88\n600,144,-88\n592,184,-72\n616,224,-96\n664,248,-64\n712,240,-40\n768,216,8\n792,176,32\n800,136,64\n776,88,88\n760,48,80\n736,16,72\n704,-16,96\n704,-24,168\n704,-32,232\n704,-32,328\n672,-8,456\n640,8,504\n648,40,560\n688,144,416\n824,288,232\n1048,480,48\n1344,808,-8\n1648,1120,-264\n1904,1240,-144\n2056,1280,-152\n2032,1320,-128\n1912,1424,-64\n1832,1448,-8\n1840,1320,88\n1896,1128,176\n1992,928,200\n2072,800,256\n2184,744,208\n2304,768,176\n2400,808,40\n2448,912,0\n2432,984,-24\n2384,1040,-200\n2296,1128,-200\n2176,1184,-280\n2024,1240,-176\n1872,1216,-32\n1736,1112,88\n1632,960,152\n1568,800,168\n1552,664,88\n1536,544,-8\n1528,464,-136\n1512,408,-280\n1464,352,-408\n1408,296,-472\n1336,232,-552\n1288,176,-584\n1240,112,-616\n1192,80,-680\n1136,56,-704\n1080,72,-696\n1016,120,-632\n952,192,-592\n912,264,-536\n896,344,-488\n920,432,-456\n968,544,-440\n1032,640,-448\n1080,752,-424\n1112,856,-416\n1112,928,-408\n1080,976,-368\n1056,1008,-312\n1048,1024,-248\n1088,1016,-192\n1152,1000,-144\n1256,984,-88\n1352,936,-48\n1448,896,-48\n1560,848,0\n1640,792,16\n1720,720,-32\n1792,656,-80\n1880,576,-120\n1976,488,-120\n2056,392,-104\n2072,296,-64\n2040,232,-24\n1976,192,0\n1888,216,40\n1808,264,40\n1768,304,64\n1792,336,136\n1832,352,184\n1872,336,296\n1864,328,424\n1784,312,520\n1672,304,600\n1536,296,640\n1416,296,648\n1312,320,624\n1240,336,560\n1184,376,536\n1128,408,480\n1088,440,416\n1048,480,392\n1024,496,384\n1000,520,384\n992,528,392\n976,520,424\n968,496,424\n936,472,400\n888,432,424\n848,384,400\n800,320,376\n752,280,344\n704,232,320\n664,192,320\n624,160,272\n584,144,240\n568,120,216\n560,112,208\n568,128,208\n608,152,192\n632,184,200\n672,224,208\n704,256,224\n736,280,240\n768,296,232\n776,288,208\n768,288,168\n752,296,80\n728,304,-88\n704,320,-304\n704,368,-368\n688,432,-352\n688,464,-328\n736,480,-288\n816,488,-240\n912,456,-112\n1024,416,-88\n1136,368,24\n1256,328,104\n1352,288,128\n1440,264,168\n1504,248,144\n1560,256,104\n1608,256,48\n1648,272,0\n1688,280,-72\n1728,304,-168\n1752,352,-240\n1760,392,-312\n1744,440,-328\n1712,496,-360\n1680,552,-376\n1632,600,-408\n1592,664,-440\n1544,760,-488\n1488,832,-528\n1416,896,-560\n1328,920,-576\n1256,896,-568\n1192,840,-552\n1120,776,-528\n1072,736,-528\n1032,688,-520\n984,648,-496\n952,576,-440\n928,480,-432\n920,368,-416\n904,256,-408\n904,176,-392\n896,112,-384\n872,80,-344\n856,48,-328\n832,32,-320\n808,40,-296\n784,56,-256\n768,64,-248\n752,80,-200\n752,96,-192\n752,128,-160\n760,168,-152\n792,232,-128\n856,288,-104\n928,368,-136\n1032,448,-152\n1168,544,-232\n1352,640,-328\n1560,720,-336\n1768,760,-304\n1936,776,-192\n2016,784,-56\n2008,792,104\n1928,800,232\n1840,768,248\n1776,696,216\n1728,624,272\n1704,536,240\n1688,440,216\n1664,360,192\n1616,288,176\n1568,256,160\n1512,256,216\n1448,288,264\n1392,312,352\n1336,376,352\n1264,448,408\n1168,512,448\n1072,536,488\n984,568,496\n904,600,520\n848,632,472\n816,648,472\n800,640,408\n792,616,400\n792,568,392\n792,512,368\n792,464,344\n800,416,360\n792,360,344\n808,312,352\n816,280,368\n832,264,328\n848,264,344\n864,264,344\n880,272,336\n888,264,328\n872,256,312\n880,256,304\n864,248,280\n856,256,256\n856,264,224\n848,272,176\n840,280,144\n856,280,112\n848,280,104\n840,288,80\n824,304,80\n800,312,88\n784,320,56\n784,336,48\n784,328,40\n808,320,56\n824,320,24\n848,328,0\n864,336,-24\n872,344,-72\n880,352,-80\n896,368,-96\n920,368,-88\n968,360,-64\n1032,336,-40\n1104,320,0\n1184,288,16\n1280,264,72\n1400,248,104\n1536,232,112\n1688,264,72\n1832,312,16\n1952,376,-72\n2024,464,-176\n2040,552,-280\n2016,608,-336\n1976,624,-400\n1928,632,-400\n1848,624,-408\n1752,608,-384\n1656,568,-352\n1568,544,-328\n1496,512,-304\n1432,496,-320\n1376,472,-312\n1328,456,-336\n1272,456,-352\n1200,448,-384\n1136,432,-408\n1064,400,-432\n984,360,-440\n912,320,-424\n840,264,-400\n776,208,-392\n712,160,-352\n656,128,-344\n616,112,-304\n584,112,-328\n560,144,-312\n552,176,-304\n544,200,-320\n528,216,-320\n528,240,-296\n528,264,-296\n544,288,-264\n560,312,-264\n592,336,-232\n640,352,-248\n688,368,-232\n736,384,-240\n792,400,-240\n856,416,-192\n928,432,-176\n984,440,-184\n1056,464,-136\n1112,464,-136\n1152,464,-96\n1200,464,-96\n1240,480,-72\n1288,480,-64\n1328,480,-56\n1360,488,-24\n1384,488,56\n1376,528,200\n1360,592,296\n1312,720,288\n1272,800,280\n1256,832,216\n1264,824,168\n1288,792,120\n1328,752,144\n1384,736,136\n1440,752,192\n1496,800,192\n1544,872,248\n1592,928,264\n1592,952,248\n1544,920,208\n1464,872,184\n1360,848,152\n1264,840,128\n1176,840,128\n1120,872,80\n1064,872,104\n1032,856,72\n1016,800,80\n992,752,32\n960,736,24\n928,744,0\n888,752,-16\n840,728,-56\n800,696,-88\n752,632,-120\n704,568,-200\n656,504,-256\n624,448,-280\n584,384,-320\n552,328,-304\n512,304,-360\n472,280,-424\n440,248,-464\n400,216,-504\n360,168,-512\n344,120,-520\n312,80,-544\n264,64,-552\n216,48,-584\n160,56,-600\n120,56,-656\n88,56,-688\n64,48,-744\n48,24,-752\n40,0,-784\n48,-16,-808\n48,-16,-792\n72,-16,-816\n72,0,-808\n56,0,-816\n40,0,-832\n32,-8,-872\n32,8,-872\n32,32,-912\n32,56,-952\n32,72,-968\n-8,96,-984\n-32,88,-928\n-40,72,-928\n-32,56,-896\n-16,32,-888\n-32,16,-880\n-16,0,-904\n0,-8,-872\n40,-32,-896\n32,-32,-944\n0,-24,-904\n-48,-32,-912\n-88,-32,-936\n-104,24,-944\n-136,64,-952\n-136,32,-952\n-112,-56,-976\n-56,-88,-1024\n-48,-56,-1032\n-112,-32,-1048\n-160,-40,-1072\n-168,-24,-1112\n-152,-16,-1136\n-128,-40,-1144\n-120,-16,-1152\n-88,0,-1144\n-88,8,-1192\n-88,8,-1232\n-64,0,-1256\n-48,-16,-1240\n-72,-24,-1224\n-80,-8,-1192\n-40,-48,-1200\n-40,-32,-1200\n-8,-8,-1288\n0,-16,-1272\n-8,0,-1304\n8,8,-1320\n8,32,-1328\n-24,72,-1304\n0,64,-1240\n32,88,-1208\n56,80,-1144\n40,72,-1096\n32,56,-1080\n40,48,-1072\n24,40,-1008\n24,32,-1032\n24,24,-1016\n48,8,-1008\n72,8,-1016\n96,8,-1024\n120,0,-1048\n120,-8,-1032\n152,-8,-1008\n168,-16,-984\n160,-48,-968\n136,-72,-960\n120,-72,-944\n104,-80,-904\n112,-48,-928\n552,-320,-968\n312,-160,-944\n208,-96,-904\n176,-72,-912\n136,-64,-896\n136,-88,-880\n144,-120,-880\n136,-152,-840\n128,-184,-848\n112,-200,-824\n112,-208,-832\n112,-216,-816\n96,-192,-808\n80,-192,-816\n48,-184,-816\n32,-192,-832\n24,-200,-832\n24,-208,-832\n16,-216,-840\n8,-216,-856\n0,-208,-856\n-24,-192,-848\n-48,-192,-840\n-64,-184,-856\n-72,-176,-856\n-80,-168,-832\n-88,-168,-872\n";

var pointStream = new stream.PassThrough();
pointStream.end(new Buffer(points));
var rawStream = Baconifier.pipe(pointStream);

d3.select('body'),
  WIDTH = 1000,
  HEIGHT = 500,
  MARGINS = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }

$(function() {
  $('body').on('keyup', function(e) {
    var $body = $(this);
    if($(this).data('started') || e.keyCode !== 32) { return true; }
    $(this).data('started', true);

    $(this).append($('<p>Starting...</p>'))
    var cadenceStream = CadenceCounter.pipe(rawStream);
    cadenceStream.onValue(function(val) {
      $body.append($('<span>' + val + '</span>&nbsp;'));
    });
  });
});

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_f6229606.js","/")
},{"../../lib/baconifier":1,"../../lib/cadenceCounter":2,"baconjs":3,"buffer":9,"oMfpAn":14,"stream":16}]},{},[25])