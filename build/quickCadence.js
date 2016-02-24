/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(19);


/***/ },

/***/ 19:
/***/ function(module, exports) {

	eval("\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"]) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); } }; }();\n\nexports.convertPower = convertPower;\nexports.detectSteps = detectSteps;\nexports.calculateCadence = calculateCadence;\nexports.pipe = pipe;\nvar DEBOUNCE_THRESHOLD = 200;\n\nvar calculatePower = function calculatePower(d) {\n  return parseInt(d.y, 10);\n};\n\nfunction convertPower(stream) {\n  return stream.map(function (v) {\n    return Object.assign(v, { power: calculatePower(v) });\n  });\n}\n\nfunction detectSteps(stream) {\n  var diffDirectionStream = stream.diff({ power: 0 }, function (a, b) {\n    return b.power - a.power;\n  });\n\n  return stream.zip(diffDirectionStream, function (sensor, diff) {\n    var changeSignal = diff > 0;\n\n    return {\n      \"timestamp\": sensor.time,\n      \"diff\": diff,\n      \"changeSignal\": changeSignal\n    };\n  }).slidingWindow(2, 2).filter(function (events) {\n    var _events = _slicedToArray(events, 2);\n\n    var e1 = _events[0];\n    var e2 = _events[1];\n\n    return e1.changeSignal !== e2.changeSignal;\n  }).map('.1').slidingWindow(2, 2).filter(function (events) {\n    var _events2 = _slicedToArray(events, 2);\n\n    var e1 = _events2[0];\n    var e2 = _events2[1];\n\n    return e2.timestamp - e1.timestamp > DEBOUNCE_THRESHOLD;\n  }).map('.1');\n}\n\nvar CYCLE_SAMPLE_BUFFER_SIZE = 10;\nfunction calculateCadence(stream) {\n  return stream.map('.timestamp').slidingWindow(CYCLE_SAMPLE_BUFFER_SIZE, CYCLE_SAMPLE_BUFFER_SIZE).map(function (times) {\n    var t1 = times[0];\n    var tlast = times[times.length - 1];\n    // ms per event\n    var msPerEvent = (tlast - t1) / times.length;\n    // 2 \"event\"s, a min and a max, per period.\n    var msPerPeriod = msPerEvent * 2;\n    return msPerPeriod;\n  }).map(function (duration) {\n    // periods per ms\n    var periodsPerMs = 1 / duration;\n    // periods per minute\n    return periodsPerMs * 1000 * 60;\n  }).map(function (v) {\n    return v.toFixed(2);\n  });\n}\n\nfunction pipe(stream) {\n  return calculateCadence(detectSteps(convertPower(stream)));\n}\n\nvar QuickCadence = {\n  pipe: pipe,\n  convertPower: convertPower,\n  detectSteps: detectSteps,\n  calculateCadence: calculateCadence\n};\n\nexports.default = QuickCadence;//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMTkuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vbGliL1F1aWNrQ2FkZW5jZS5qcz83MjYxIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IERFQk9VTkNFX1RIUkVTSE9MRCA9IDIwMDtcblxuY29uc3QgY2FsY3VsYXRlUG93ZXIgPSAoZCkgPT4gcGFyc2VJbnQoZC55LCAxMClcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRQb3dlcihzdHJlYW0pIHtcbiAgcmV0dXJuIHN0cmVhbVxuICAubWFwKCh2KSA9PiBPYmplY3QuYXNzaWduKHYsIHsgcG93ZXI6IGNhbGN1bGF0ZVBvd2VyKHYpIH0pKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0U3RlcHMoc3RyZWFtKSB7XG4gIHZhciBkaWZmRGlyZWN0aW9uU3RyZWFtID0gc3RyZWFtXG4gIC5kaWZmKHsgcG93ZXI6IDAgfSwgZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBiLnBvd2VyIC0gYS5wb3dlclxuICB9KVxuXG4gIHJldHVybiBzdHJlYW1cbiAgLnppcChkaWZmRGlyZWN0aW9uU3RyZWFtLCAoc2Vuc29yLCBkaWZmKSA9PiB7XG4gICAgdmFyIGNoYW5nZVNpZ25hbCA9IGRpZmYgPiAwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIFwidGltZXN0YW1wXCI6IHNlbnNvci50aW1lLFxuICAgICAgXCJkaWZmXCI6IGRpZmYsXG4gICAgICBcImNoYW5nZVNpZ25hbFwiOiBjaGFuZ2VTaWduYWxcbiAgICB9O1xuICB9KVxuICAuc2xpZGluZ1dpbmRvdygyLDIpXG4gIC5maWx0ZXIoZnVuY3Rpb24oZXZlbnRzKSB7XG4gICAgbGV0IFtlMSwgZTJdID0gZXZlbnRzO1xuICAgIHJldHVybiBlMS5jaGFuZ2VTaWduYWwgIT09IGUyLmNoYW5nZVNpZ25hbFxuICB9KVxuICAubWFwKCcuMScpXG4gIC5zbGlkaW5nV2luZG93KDIsMilcbiAgLmZpbHRlcigoZXZlbnRzKSA9PiB7XG4gICAgbGV0IFtlMSwgZTJdID0gZXZlbnRzO1xuICAgIHJldHVybiBlMi50aW1lc3RhbXAgLSBlMS50aW1lc3RhbXAgPiBERUJPVU5DRV9USFJFU0hPTERcbiAgfSlcbiAgLm1hcCgnLjEnKVxufVxuXG5jb25zdCBDWUNMRV9TQU1QTEVfQlVGRkVSX1NJWkUgPSAxMFxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUNhZGVuY2Uoc3RyZWFtKSB7XG4gIHJldHVybiBzdHJlYW1cbiAgLm1hcCgnLnRpbWVzdGFtcCcpXG4gIC5zbGlkaW5nV2luZG93KENZQ0xFX1NBTVBMRV9CVUZGRVJfU0laRSwgQ1lDTEVfU0FNUExFX0JVRkZFUl9TSVpFKVxuICAubWFwKGZ1bmN0aW9uKHRpbWVzKSB7XG4gICAgdmFyIHQxID0gdGltZXNbMF1cbiAgICB2YXIgdGxhc3QgPSB0aW1lc1t0aW1lcy5sZW5ndGggLSAxXVxuICAgIC8vIG1zIHBlciBldmVudFxuICAgIHZhciBtc1BlckV2ZW50ID0gKHRsYXN0IC0gdDEpIC8gdGltZXMubGVuZ3RoXG4gICAgLy8gMiBcImV2ZW50XCJzLCBhIG1pbiBhbmQgYSBtYXgsIHBlciBwZXJpb2QuXG4gICAgdmFyIG1zUGVyUGVyaW9kID0gbXNQZXJFdmVudCAqIDJcbiAgICByZXR1cm4gbXNQZXJQZXJpb2Q7XG4gIH0pXG4gIC5tYXAoZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAvLyBwZXJpb2RzIHBlciBtc1xuICAgIHZhciBwZXJpb2RzUGVyTXMgPSAxIC8gZHVyYXRpb25cbiAgICAvLyBwZXJpb2RzIHBlciBtaW51dGVcbiAgICByZXR1cm4gcGVyaW9kc1Blck1zICogMTAwMCAqIDYwXG4gIH0pXG4gIC5tYXAodiA9PiB2LnRvRml4ZWQoMikpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaXBlKHN0cmVhbSkge1xuICByZXR1cm4gY2FsY3VsYXRlQ2FkZW5jZShkZXRlY3RTdGVwcyhjb252ZXJ0UG93ZXIoc3RyZWFtKSkpXG59XG5cbmNvbnN0IFF1aWNrQ2FkZW5jZSA9IHtcbiAgcGlwZSxcbiAgY29udmVydFBvd2VyLFxuICBkZXRlY3RTdGVwcyxcbiAgY2FsY3VsYXRlQ2FkZW5jZSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFF1aWNrQ2FkZW5jZVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogbGliL1F1aWNrQ2FkZW5jZS5qc1xuICoqLyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFJQTtBQUtBO0FBK0JBO0FBc0JBO0FBOURBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFFQTtBQURBO0FBQ0E7QUFHQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBSEE7QUFXQTtBQUNBO0FBREE7QUFBQTtBQUNBO0FBQUE7QUFGQTtBQU9BO0FBQ0E7QUFEQTtBQUFBO0FBQ0E7QUFBQTtBQUZBO0FBdkJBO0FBQ0E7QUE2QkE7QUFDQTtBQUNBO0FBSUE7QUFDQTs7QUFGQTs7QUFBQTtBQU9BO0FBUEE7O0FBV0E7O0FBRkE7QUFBQTtBQU1BO0FBQUE7QUFuQkE7QUFDQTtBQXFCQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQUNBO0FBTUEiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }

/******/ });