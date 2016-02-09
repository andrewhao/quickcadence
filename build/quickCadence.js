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

	eval("'use strict';\n\nvar StepDetector = __webpack_require__(10),\n    PowerConverter = __webpack_require__(9),\n    CadenceCounter = __webpack_require__(8);\n\nvar QuickCadence = {\n  pipe: function pipe(stream) {\n    var power = PowerConverter.pipe(stream);\n    var steps = StepDetector.pipe(power);\n    var cadence = CadenceCounter.pipe(steps);\n    return cadence;\n  }\n};\n\nmodule.exports = QuickCadence;//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9saWIvcXVpY2tDYWRlbmNlLmpzPzljOGUiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIFN0ZXBEZXRlY3RvciA9IHJlcXVpcmUoJy4vc3RlcERldGVjdG9yJyksXG4gICAgUG93ZXJDb252ZXJ0ZXIgPSByZXF1aXJlKCcuL3Bvd2VyQ29udmVydGVyJyksXG4gICAgQ2FkZW5jZUNvdW50ZXIgPSByZXF1aXJlKCcuL2NhZGVuY2VDb3VudGVyJyk7XG5cbmNvbnN0IFF1aWNrQ2FkZW5jZSA9IHtcbiAgcGlwZTogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIHBvd2VyID0gUG93ZXJDb252ZXJ0ZXIucGlwZShzdHJlYW0pO1xuICAgIHZhciBzdGVwcyA9IFN0ZXBEZXRlY3Rvci5waXBlKHBvd2VyKTtcbiAgICB2YXIgY2FkZW5jZSA9IENhZGVuY2VDb3VudGVyLnBpcGUoc3RlcHMpO1xuICAgIHJldHVybiBjYWRlbmNlXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUXVpY2tDYWRlbmNlO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogbGliL3F1aWNrQ2FkZW5jZS5qc1xuICoqLyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBREE7QUFDQTtBQVFBIiwic291cmNlUm9vdCI6IiJ9");

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

	eval("'use strict';\n\nvar CYCLE_SAMPLE_BUFFER_SIZE = 10;\nvar CadenceCounter = {\n  pipe: function pipe(stream) {\n    var cadenceStream = stream.map('.timestamp').slidingWindow(CYCLE_SAMPLE_BUFFER_SIZE, CYCLE_SAMPLE_BUFFER_SIZE).map(function (times) {\n      var t1 = times[0];\n      var tlast = times[times.length - 1];\n      // ms per event\n      var msPerEvent = (tlast - t1) / times.length;\n      // 2 \"event\"s, a min and a max, per period.\n      var msPerPeriod = msPerEvent * 2;\n      return msPerPeriod;\n    }).map(function (duration) {\n      // periods per ms\n      var periodsPerMs = 1 / duration;\n      // periods per minute\n      return periodsPerMs * 1000 * 60;\n    });\n    return cadenceStream;\n  }\n};\nmodule.exports = CadenceCounter;//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiOC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9saWIvY2FkZW5jZUNvdW50ZXIuanM/OGRlMCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBDWUNMRV9TQU1QTEVfQlVGRkVSX1NJWkUgPSAxMFxudmFyIENhZGVuY2VDb3VudGVyID0ge1xuICBwaXBlOiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICB2YXIgY2FkZW5jZVN0cmVhbSA9IHN0cmVhbVxuICAgICAgLm1hcCgnLnRpbWVzdGFtcCcpXG4gICAgICAuc2xpZGluZ1dpbmRvdyhDWUNMRV9TQU1QTEVfQlVGRkVSX1NJWkUsIENZQ0xFX1NBTVBMRV9CVUZGRVJfU0laRSlcbiAgICAgIC5tYXAoZnVuY3Rpb24odGltZXMpIHtcbiAgICAgICAgdmFyIHQxID0gdGltZXNbMF1cbiAgICAgICAgdmFyIHRsYXN0ID0gdGltZXNbdGltZXMubGVuZ3RoIC0gMV1cbiAgICAgICAgLy8gbXMgcGVyIGV2ZW50XG4gICAgICAgIHZhciBtc1BlckV2ZW50ID0gKHRsYXN0IC0gdDEpIC8gdGltZXMubGVuZ3RoXG4gICAgICAgIC8vIDIgXCJldmVudFwicywgYSBtaW4gYW5kIGEgbWF4LCBwZXIgcGVyaW9kLlxuICAgICAgICB2YXIgbXNQZXJQZXJpb2QgPSBtc1BlckV2ZW50ICogMlxuICAgICAgICByZXR1cm4gbXNQZXJQZXJpb2Q7XG4gICAgICB9KVxuICAgICAgLm1hcChmdW5jdGlvbihkdXJhdGlvbikge1xuICAgICAgICAvLyBwZXJpb2RzIHBlciBtc1xuICAgICAgICB2YXIgcGVyaW9kc1Blck1zID0gMSAvIGR1cmF0aW9uXG4gICAgICAgIC8vIHBlcmlvZHMgcGVyIG1pbnV0ZVxuICAgICAgICByZXR1cm4gcGVyaW9kc1Blck1zICogMTAwMCAqIDYwXG4gICAgICB9KVxuICAgIHJldHVybiBjYWRlbmNlU3RyZWFtO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IENhZGVuY2VDb3VudGVyO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogbGliL2NhZGVuY2VDb3VudGVyLmpzXG4gKiovIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFDQTs7QUFGQTs7QUFBQTtBQU9BO0FBUEE7O0FBV0E7O0FBRkE7QUFBQTtBQU1BO0FBbkJBO0FBREE7QUF1QkEiLCJzb3VyY2VSb290IjoiIn0=");

/***/ },
/* 9 */
/***/ function(module, exports) {

	eval("\"use strict\";\n\nvar PowerConverter = {\n  pipe: function pipe(stream) {\n    return stream.map(function (d) {\n      var val = parseInt(d.y, 10);\n      return val;\n    });\n  }\n};\n\nmodule.exports = PowerConverter;//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiOS5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9saWIvcG93ZXJDb252ZXJ0ZXIuanM/ZDg5MSJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUG93ZXJDb252ZXJ0ZXIgPSB7XG4gIHBpcGU6IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHJldHVybiBzdHJlYW1cbiAgICAgIC5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgICB2YXIgdmFsID0gcGFyc2VJbnQoZC55LCAxMCk7XG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvd2VyQ29udmVydGVyO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogbGliL3Bvd2VyQ29udmVydGVyLmpzXG4gKiovIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFGQTtBQUZBO0FBREE7QUFDQTtBQVNBIiwic291cmNlUm9vdCI6IiJ9");

/***/ },
/* 10 */
/***/ function(module, exports) {

	eval("\"use strict\";\n\nvar ACCEL_CHANGE_THRESHOLD = 50;\nvar DEBOUNCE_THRESHOLD = 200;\n\nvar StepDetector = {\n  pipe: function pipe(stream) {\n    // Fire an event every time acceleration changes from positive to negative\n    var diffDirectionStream = stream.diff(0, function (a, b) {\n      return b - a;\n    }).filter(function (diff) {\n      return Math.abs(diff) > ACCEL_CHANGE_THRESHOLD;\n    }).map(function (diff) {\n      var changeSignal = diff > 0;\n\n      return {\n        \"timestamp\": new Date(),\n        \"diff\": diff,\n        \"changeSignal\": changeSignal\n      };\n    }).slidingWindow(2, 2).filter(function (arr) {\n      return arr[0].changeSignal !== arr[1].changeSignal;\n    }).debounce(DEBOUNCE_THRESHOLD).map('.1');\n\n    return diffDirectionStream;\n  }\n};\n\nmodule.exports = StepDetector;//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMTAuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vbGliL3N0ZXBEZXRlY3Rvci5qcz9lMGU2Il0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEFDQ0VMX0NIQU5HRV9USFJFU0hPTEQgPSA1MDtcbmNvbnN0IERFQk9VTkNFX1RIUkVTSE9MRCA9IDIwMDtcblxudmFyIFN0ZXBEZXRlY3RvciA9IHtcbiAgcGlwZTogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgLy8gRmlyZSBhbiBldmVudCBldmVyeSB0aW1lIGFjY2VsZXJhdGlvbiBjaGFuZ2VzIGZyb20gcG9zaXRpdmUgdG8gbmVnYXRpdmVcbiAgICB2YXIgZGlmZkRpcmVjdGlvblN0cmVhbSA9IHN0cmVhbVxuICAgICAgLmRpZmYoMCwgZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYiAtIGFcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uKGRpZmYpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKGRpZmYpID4gQUNDRUxfQ0hBTkdFX1RIUkVTSE9MRDtcbiAgICAgIH0pXG4gICAgICAubWFwKGZ1bmN0aW9uKGRpZmYpIHtcbiAgICAgICAgdmFyIGNoYW5nZVNpZ25hbCA9IGRpZmYgPiAwO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgXCJ0aW1lc3RhbXBcIjogbmV3IERhdGUoKSxcbiAgICAgICAgICBcImRpZmZcIjogZGlmZixcbiAgICAgICAgICBcImNoYW5nZVNpZ25hbFwiOiBjaGFuZ2VTaWduYWxcbiAgICAgICAgfTtcbiAgICAgIH0pXG4gICAgICAuc2xpZGluZ1dpbmRvdygyLDIpXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uKGFycikge1xuICAgICAgICByZXR1cm4gYXJyWzBdLmNoYW5nZVNpZ25hbCAhPT0gYXJyWzFdLmNoYW5nZVNpZ25hbDtcbiAgICAgIH0pXG4gICAgICAuZGVib3VuY2UoREVCT1VOQ0VfVEhSRVNIT0xEKVxuICAgICAgLm1hcCgnLjEnKVxuXG4gICAgcmV0dXJuIGRpZmZEaXJlY3Rpb25TdHJlYW07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RlcERldGVjdG9yO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogbGliL3N0ZXBEZXRlY3Rvci5qc1xuICoqLyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBRUE7QUFEQTtBQUlBO0FBREE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUhBO0FBV0E7QUFEQTtBQUNBO0FBS0E7QUF6QkE7QUFEQTtBQUNBO0FBNkJBIiwic291cmNlUm9vdCI6IiJ9");

/***/ }
/******/ ]);