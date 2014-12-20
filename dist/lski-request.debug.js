/*!
 * lski-request - 1.0.0
*/
/*jslint browser: true, white: true */
/*global define, window, Promise */

(function (root, factory) {

	"use strict";

	if (typeof define === 'function' && define['amd']) {
		define(['exports'], factory);
	}
	else if (typeof exports === 'object') {
		factory(exports);
	}
	else {
		root.lski = root.lski || {};
		factory(root.lski.request = {});
	}

})(this, function (request) {

	"use strict";

	var _consts = {
		JSON: 1,
		TEXT: null
	};

	/**
	 * Public constants for selecting the correct
	 */
	request.dataTypes = {
		JSON: _consts.JSON,
		TEXT: _consts.TEXT
	};

	/**
	 * Global settings, any change to this object will effect all requests
	 */
	request.settings = {
		/**
		* The headers that are passed along with each request in property:value pairs. NB: value can either be a string or function, if a function it is called per request.
		*/
		headers: {
			'content-type': 'application/json'
		},
		/**
		* A function that if set it will be called prior to any request is made and is passed. It recieves the requet object and options used for this request
		*/
		beforeSend: null,
		/**
		 * If true will reject based on status codes being out of success range as well as Network or Timeout issues
		 */
		rejectOnStatusCode: false,
		/**
		 * If set, the time in milliseconds the request will wait before timing out and rejecting
		 */
		timeout: null,
		/**
		 * If true, will return only the data portion of the request when successfully resolved
		 * (NB: Makes no sense using dataOnly if rejectOnStatusCode === false, because it would not be possible to tell if the response was successful or not)
		 */
		dataOnly: false,
		/**
		 * States the return type of the data returned from the request, if json it will attach an 'accept' header to the request. Either dataTypes.JSON or dataTypes.TEXT
		 */
		dataType: _consts.JSON,
		/**
		 * Only used in combination with 'dataType: json' this method is passed to JSON.parse as the reviver method, helpful for formatting dates recieved
		 */
		jsonReviver: null
	};

	/**
	 * basic utility functions used during the request process, useful for wrapping the request module
	 */
	request.utils = {
		merge: _merge,
		isFunction: _isFunction,
		json: {
			iso8601Reviver: _iso8601Reviver,
			msDateReviver: _msDateReviver
		}
	};

	/**
	* Sends an ajax request and returns a Promise object.
	*
	* @param {string} url The url of the request to be made.
	* @param {string} type The method of submission, i.e. POST,GET,PUT,DELETE
	* @param {string=} data The data that will be added to the request, if sending a GET/DELETE request this should be undefined
	* @param {object=} options Options to override the global options for this request only (NB Only options that need to be overriden should be passed)
	*
	* Resolved if the request is successfully made without timeout or network, regardless of the status code
	* Resolved format: {status: {Number}, statusText: {string}, data: {string}, options: {Object}, xhr: {XmlHttpRequest} }
	*
	* Rejected is there was no error sending a request and recieving a response, regardless of the status code
	*
	* @return {Promise} With the argument
	*/
	request.send = function (url, type, data, options) {

		var ops = _createSendOptions(request.settings, options);
		var prom = _createSendPromise(url, type, ops, _resolveData(data));

		if (ops.rejectOnStatusCode) {
			prom = prom.then(function (response) {

				if (response.status < 200 || response.status > 399) {
					return Promise.reject(_createRejectedResponse(response.status, response.statusText, response.xhr, response.options));
				}

				return response;
			});
		}

		if (ops.dataType === _consts.JSON) {
			prom.then(function (response) {

				response.data = _jsonDataReviver(response.data, response.options);
				return response;
			});
		}

		if (ops.dataOnly) {
			prom = prom.then(function (response) {
				return response.data;
			});
		}

		return prom;
	};

	/**
	* Alias for send(url, 'GET', undefined, options)
	*/
	request.get = function (url, options) {
		return request.send(url, 'GET', undefined, options);
	};

	/**
	* Alias for send(url, 'POST', data, options)
	*/
	request.post = function (url, data, options) {
		return request.send(url, 'POST', data, options);
	};

	/**
	* Alias for send(url, 'PUT', data, options)
	*/
	request.put = function (url, data, options) {
		return request.send(url, 'PUT', data, options);
	};

	/**
	* Alias for send(url, 'DELETE', undefined, options)
	*/
	request.del = request['delete'] = function (url, options) {
		return request.send(url, 'DELETE', undefined, options);
	};

	/**
	 * Simply checks the passed in argument is a callable function
	 */
	function _isFunction(toCheck) {
		return typeof toCheck === 'function' && !!toCheck.call;
	}

	/**
	 * Deep merge of objects
	 *
	 * Overrides or adds a property on the current object with the equivalent on the merging object. If the property is an object it then attempts to merge that object too.
	 * E.g. merge({}, myObj, myObj2) would result in properties in myObj2 overriding myObj, and creating a new object
	 * E.g. merge(myObj, myObj2) would update the myObj with properties from myObj2
	 *
	 * @returns {Object} The combined object
	 */
	function _merge(out) {

		out = out || {};

		for (var i = 1; i < arguments.length; i++) {

			var obj = arguments[i];

			if (!obj) {
				continue;
			}

			for (var key in obj) {

				if (Object.prototype.hasOwnProperty.call(obj, key)) {

					var val = obj[key];

					if (val !== null && typeof val === 'object' && !(val instanceof Date)) {

						out[key] = _merge(out[key], val);
					}
					else {
						out[key] = val;
					}
				}
			}
		}

		return out;
	}

	/**
	 * Uses pattern matching to discover if a string contains a date in ISO 8601 format, if it is then create a date, otherwise returns a string.
	 *
	 * @requires Date.parse to be able to handle iso8601 strings. This can be achieved easily by polyfill
	 * @param key {string} The object property name
	 * @param value {object} The string value to be converted either to a string or date
	 */
	function _iso8601Reviver(key, value) {

		if (typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)/.test(value)) {

			return new Date(Date.parse(value));
		}
		return value;
	}

	/**
	 * A rectifier method used to help JSON.stringfy(JsonObj, rectifier) to handle creating a date for ASP.Net which are in the format /Date(ticks)/ 
	 * so need coercing into string that can be parsed by by ASP.Net
	 * 
	 * @param key {string} The object property name
	 * @param value {object} The string value to be converted either to a string or date
	 */
	function _msDateReviver(key, value) {

		if (typeof value === 'string' && value.match("^/Date\\((\\d+)\\)/$")) {

			return new Date(parseInt(value.replace(/\/Date\((-?\d+)\)\//, '$1')));
		}

		return value;
	}

	/**
	 * Normalises the options, using the settings as defaults, if options are supplied any matching option in options overides the default.
	 */
	function _createSendOptions(defaults, options) {

		var ops = !options ? _merge({}, defaults) : _merge({}, defaults, options);

		// If the dataType being returned should be JSON send the header to tell the server we want it returned
		if (ops.dataType === _consts.JSON) {
			ops.headers.accept = 'application/json, text/javascript';
		}

		return ops;
	}

	/**
	 * Cleans the data to be sent, using JSON.stringify to convert anything thats not already a string into a string.
	 */
	function _resolveData(data) {
		return (typeof data === 'string' ? data : JSON.stringify(data));
	}

	/**
	 * Cleans json data coming back from the server, should only be used when type expected to be json
	 */
	function _jsonDataReviver(data, ops) {
		return (data === '' || data == null) ? null : JSON.parse(data, ops.jsonReviver);
	}

	/**
	* Sends an ajax request and returns a Promise object.
	*
	* @param {string} url The url of the request to be made.
	* @param {string} type The method of submission, i.e. POST,GET,PUT,DELETE
	* @param {object} options The settings to be used in this request, these should be a combination of the global settings overidden by any passed with this request
	* @param {string=} data The data that will be added to the request, if sending a GET/DELETE request this should be undefined
	*
	* @return {Promise} With the argument {status: {Number}, statusText: {string}, data: {string}, options: {Object}, xhr: {XmlHttpRequest} }
	*/
	function _createSendPromise(url, type, ops, data) {

		return new Promise(function (resolve, reject) {

			var req = new XMLHttpRequest();

			req.open(type, url, true);

			for (var prop in (ops.headers || {})) {

				if (Object.prototype.hasOwnProperty.call(ops.headers, prop)) {

					// If a header value is a function then call the function.
					// Using functions means the headers can be set with current values not just values set before values are known at initialisation time
					var val = _isFunction(ops.headers[prop]) ? ops.headers[prop]() : ops.headers[prop];
					if (val) {
						req.setRequestHeader(prop, val);
					}
				}
			}

			// IE8 does not have onload, so test for readyState to prevent double callback in IE9+
			if (req.readyState) {
				req.onreadystatechange = function () {
					if (req.readyState === 4) {
						resolve(_createResolveResponse(req, ops));
					}
				}
			}
			else {
				req.onload = function () {
					resolve(_createResolveResponse(req, ops));
				}
			}

			req.onerror = function () {
				reject(_createRejectedResponse(null, "Network", req, ops));
			};

			// If a timeout is set in the settings then catch any timeout errors
			if (ops.timeout && !isNaN(ops.timeout)) {
				req.timeout = ops.timeout;
				req.ontimeout = function () {
					reject(_createRejectedResponse(null, "Timeout", req, ops));
				}
			}

			// If the caller added a before send function run it now
			if (ops.beforeSend && _isFunction(ops.beforeSend)) {
				ops.beforeSend(req, ops);
			}

			// Send the request
			req.send(data);
		});
	}

	function _createResolveResponse(xhr, options) {

		// Normalize IE's response to HTTP 204 == 1223.
		return {
			status: xhr.status === 1223 ? 204 : xhr.status,
			statusText: xhr.status === 1223 ? "No Content" : xhr.statusText,
			data: xhr.responseText,
			options: options,
			xhr: xhr
		};
	}

	function _createRejectedResponse(code, reason, xhr, options) {

		return {
			status: code,
			statusText: reason,
			xhr: xhr,
			options: options
		};
	}
});