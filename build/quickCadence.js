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
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	eval("'use strict';\n\nvar StepDetector = __webpack_require__(10),\n    PowerConverter = __webpack_require__(9),\n    CadenceCounter = __webpack_require__(8);\n\nvar QuickCadence = {\n  pipe: function pipe(stream) {\n    var power = PowerConverter.pipe(stream);\n    var steps = StepDetector.pipe(power);\n    var cadence = CadenceCounter.pipe(steps);\n    return cadence;\n  }\n};\n\nmodule.exports = QuickCadence;//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9saWIvcXVpY2tDYWRlbmNlLmpzPzljOGUiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIFN0ZXBEZXRlY3RvciAgID0gcmVxdWlyZSgnLi9xdWlja0NhZGVuY2Uvc3RlcERldGVjdG9yJyksXG4gICAgUG93ZXJDb252ZXJ0ZXIgPSByZXF1aXJlKCcuL3F1aWNrQ2FkZW5jZS9wb3dlckNvbnZlcnRlcicpLFxuICAgIENhZGVuY2VDb3VudGVyID0gcmVxdWlyZSgnLi9xdWlja0NhZGVuY2UvY2FkZW5jZUNvdW50ZXInKTtcblxuY29uc3QgUXVpY2tDYWRlbmNlID0ge1xuICBwaXBlOiAoc3RyZWFtKSA9PiB7XG4gICAgdmFyIHBvd2VyID0gUG93ZXJDb252ZXJ0ZXIucGlwZShzdHJlYW0pO1xuICAgIHZhciBzdGVwcyA9IFN0ZXBEZXRlY3Rvci5waXBlKHBvd2VyKTtcbiAgICB2YXIgY2FkZW5jZSA9IENhZGVuY2VDb3VudGVyLnBpcGUoc3RlcHMpO1xuICAgIHJldHVybiBjYWRlbmNlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aWNrQ2FkZW5jZTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGxpYi9xdWlja0NhZGVuY2UuanNcbiAqKi8iXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQURBO0FBQ0E7QUFRQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ function(module, exports) {

	eval("'use strict';\n\nvar CYCLE_SAMPLE_BUFFER_SIZE = 10;\nvar CadenceCounter = {\n  pipe: function pipe(stream) {\n    var cadenceStream = stream.map('.timestamp').slidingWindow(CYCLE_SAMPLE_BUFFER_SIZE, CYCLE_SAMPLE_BUFFER_SIZE).map(function (times) {\n      var t1 = times[0];\n      var tlast = times[times.length - 1];\n      // ms per event\n      var msPerEvent = (tlast - t1) / times.length;\n      // 2 \"event\"s, a min and a max, per period.\n      var msPerPeriod = msPerEvent * 2;\n      return msPerPeriod;\n    }).map(function (duration) {\n      // periods per ms\n      var periodsPerMs = 1 / duration;\n      // periods per minute\n      return periodsPerMs * 1000 * 60;\n    });\n    return cadenceStream;\n  }\n};\nmodule.exports = CadenceCounter;//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiOC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9saWIvcXVpY2tDYWRlbmNlL2NhZGVuY2VDb3VudGVyLmpzPzE4N2UiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQ1lDTEVfU0FNUExFX0JVRkZFUl9TSVpFID0gMTBcbnZhciBDYWRlbmNlQ291bnRlciA9IHtcbiAgcGlwZTogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIGNhZGVuY2VTdHJlYW0gPSBzdHJlYW1cbiAgICAgIC5tYXAoJy50aW1lc3RhbXAnKVxuICAgICAgLnNsaWRpbmdXaW5kb3coQ1lDTEVfU0FNUExFX0JVRkZFUl9TSVpFLCBDWUNMRV9TQU1QTEVfQlVGRkVSX1NJWkUpXG4gICAgICAubWFwKGZ1bmN0aW9uKHRpbWVzKSB7XG4gICAgICAgIHZhciB0MSA9IHRpbWVzWzBdXG4gICAgICAgIHZhciB0bGFzdCA9IHRpbWVzW3RpbWVzLmxlbmd0aCAtIDFdXG4gICAgICAgIC8vIG1zIHBlciBldmVudFxuICAgICAgICB2YXIgbXNQZXJFdmVudCA9ICh0bGFzdCAtIHQxKSAvIHRpbWVzLmxlbmd0aFxuICAgICAgICAvLyAyIFwiZXZlbnRcInMsIGEgbWluIGFuZCBhIG1heCwgcGVyIHBlcmlvZC5cbiAgICAgICAgdmFyIG1zUGVyUGVyaW9kID0gbXNQZXJFdmVudCAqIDJcbiAgICAgICAgcmV0dXJuIG1zUGVyUGVyaW9kO1xuICAgICAgfSlcbiAgICAgIC5tYXAoZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgLy8gcGVyaW9kcyBwZXIgbXNcbiAgICAgICAgdmFyIHBlcmlvZHNQZXJNcyA9IDEgLyBkdXJhdGlvblxuICAgICAgICAvLyBwZXJpb2RzIHBlciBtaW51dGVcbiAgICAgICAgcmV0dXJuIHBlcmlvZHNQZXJNcyAqIDEwMDAgKiA2MFxuICAgICAgfSlcbiAgICByZXR1cm4gY2FkZW5jZVN0cmVhbTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBDYWRlbmNlQ291bnRlcjtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGxpYi9xdWlja0NhZGVuY2UvY2FkZW5jZUNvdW50ZXIuanNcbiAqKi8iXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFJQTtBQUNBOztBQUZBOztBQUFBO0FBT0E7QUFQQTs7QUFXQTs7QUFGQTtBQUFBO0FBTUE7QUFuQkE7QUFEQTtBQXVCQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ },
/* 9 */
/***/ function(module, exports) {

	eval("\"use strict\";\n\nvar PowerConverter = {\n  pipe: function pipe(stream) {\n    return stream.map(function (d) {\n      var val = parseInt(d.y, 10);\n      return val;\n    });\n  }\n};\n\nmodule.exports = PowerConverter;//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiOS5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9saWIvcXVpY2tDYWRlbmNlL3Bvd2VyQ29udmVydGVyLmpzPzQ4ZGYiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIFBvd2VyQ29udmVydGVyID0ge1xuICBwaXBlOiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICByZXR1cm4gc3RyZWFtXG4gICAgICAubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIHZhbCA9IHBhcnNlSW50KGQueSwgMTApO1xuICAgICAgICByZXR1cm4gdmFsXG4gICAgICB9KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3dlckNvbnZlcnRlcjtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGxpYi9xdWlja0NhZGVuY2UvcG93ZXJDb252ZXJ0ZXIuanNcbiAqKi8iXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUZBO0FBRkE7QUFEQTtBQUNBO0FBU0EiLCJzb3VyY2VSb290IjoiIn0=");

/***/ },
/* 10 */
/***/ function(module, exports) {

	eval("\"use strict\";\n\nvar ACCEL_CHANGE_THRESHOLD = 50;\nvar DEBOUNCE_THRESHOLD = 200;\n\nvar StepDetector = {\n  pipe: function pipe(stream) {\n    // Fire an event every time acceleration changes from positive to negative\n    var diffDirectionStream = stream.diff(0, function (a, b) {\n      return b - a;\n    }).filter(function (diff) {\n      return Math.abs(diff) > ACCEL_CHANGE_THRESHOLD;\n    }).map(function (diff) {\n      var changeSignal = diff > 0;\n\n      return {\n        \"timestamp\": new Date(),\n        \"diff\": diff,\n        \"changeSignal\": changeSignal\n      };\n    }).slidingWindow(2, 2).filter(function (arr) {\n      return arr[0].changeSignal !== arr[1].changeSignal;\n    }).debounce(DEBOUNCE_THRESHOLD).map('.1');\n\n    return diffDirectionStream;\n  }\n};\n\nmodule.exports = StepDetector;//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMTAuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vbGliL3F1aWNrQ2FkZW5jZS9zdGVwRGV0ZWN0b3IuanM/NmMxMyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBBQ0NFTF9DSEFOR0VfVEhSRVNIT0xEID0gNTA7XG5jb25zdCBERUJPVU5DRV9USFJFU0hPTEQgPSAyMDA7XG5cbnZhciBTdGVwRGV0ZWN0b3IgPSB7XG4gIHBpcGU6IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIC8vIEZpcmUgYW4gZXZlbnQgZXZlcnkgdGltZSBhY2NlbGVyYXRpb24gY2hhbmdlcyBmcm9tIHBvc2l0aXZlIHRvIG5lZ2F0aXZlXG4gICAgdmFyIGRpZmZEaXJlY3Rpb25TdHJlYW0gPSBzdHJlYW1cbiAgICAgIC5kaWZmKDAsIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGIgLSBhXG4gICAgICB9KVxuICAgICAgLmZpbHRlcihmdW5jdGlvbihkaWZmKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhkaWZmKSA+IEFDQ0VMX0NIQU5HRV9USFJFU0hPTEQ7XG4gICAgICB9KVxuICAgICAgLm1hcChmdW5jdGlvbihkaWZmKSB7XG4gICAgICAgIHZhciBjaGFuZ2VTaWduYWwgPSBkaWZmID4gMDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIFwidGltZXN0YW1wXCI6IG5ldyBEYXRlKCksXG4gICAgICAgICAgXCJkaWZmXCI6IGRpZmYsXG4gICAgICAgICAgXCJjaGFuZ2VTaWduYWxcIjogY2hhbmdlU2lnbmFsXG4gICAgICAgIH07XG4gICAgICB9KVxuICAgICAgLnNsaWRpbmdXaW5kb3coMiwyKVxuICAgICAgLmZpbHRlcihmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFyclswXS5jaGFuZ2VTaWduYWwgIT09IGFyclsxXS5jaGFuZ2VTaWduYWw7XG4gICAgICB9KVxuICAgICAgLmRlYm91bmNlKERFQk9VTkNFX1RIUkVTSE9MRClcbiAgICAgIC5tYXAoJy4xJylcblxuICAgIHJldHVybiBkaWZmRGlyZWN0aW9uU3RyZWFtO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBEZXRlY3RvcjtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGxpYi9xdWlja0NhZGVuY2Uvc3RlcERldGVjdG9yLmpzXG4gKiovIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFFQTtBQURBO0FBSUE7QUFEQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBSEE7QUFXQTtBQURBO0FBQ0E7QUFLQTtBQXpCQTtBQURBO0FBQ0E7QUE2QkEiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }
/******/ ]);