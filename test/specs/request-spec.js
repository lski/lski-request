describe("request", function () {

    var outputResults = false;

	beforeEach(function () {
		lski.request.options.dataType = lski.request.dataTypes.TEXT;
	});

	afterEach(function () {
		lski.request.options.dataType = lski.request.dataTypes.JSON;
	});

	it("namespace exists", function () {

		expect(lski.request).not.toBe(null);

        _log("namespace exists");
	});

	it("basic send request via get", function (done) {

		var url = 'http://api-echo.azurewebsites.net/ip';
		var handler = function (response) {

			_log("basic send request via get", response);

			expect(response.data).not.toBe(null);

			var data = JSON.parse(response.data);

			expect(data.ip).not.toBe(null);
		};

		lski.request.send(url, 'GET').then(handler)["catch"](genericCatch).then(done);
	});

	it("headers are correctly sent", function (done) {

		var url = 'http://api-echo.azurewebsites.net/headers';
		var data = undefined;
		var options = {
			headers: {
				'accept': 'text/plain'
			}
		};
		var handler = function (response) {

			_log("headers are correctly sent", response);

			expect(response).not.toBe(null);
			expect(response.data).not.toBe(null);

			var headers = JSON.parse(response.data);

			expect(headers.accept).toBe('text/plain');
		};

		lski.request.send(url, 'GET', data, options).then(handler)["catch"](genericCatch).then(done);
	});

	it("data sent correctly", function (done) {

		var url = 'http://api-echo.azurewebsites.net/echo';
		var data = {
			a: 1,
			b: 'test'
		};
		var handler = function (response) {

			_log(response, "data sent correctly");

			expect(response).not.toBe(null);
			expect(response.data).not.toBe(null);

			var args = JSON.parse(response.data);

			expect(args.a).toBe(1);
		};

		lski.request.send(url, 'POST', data).then(handler)["catch"](genericCatch).then(done);
	});

	it("data sent correctly (Pre created)", function (done) {

		var url = 'http://api-echo.azurewebsites.net/echo';
		var data = JSON.stringify({ a: 1, b: 'test' });
		var handler = function (response) {

			_log(response, "data sent correctly");

			expect(response).not.toBe(null);
			expect(response.data).not.toBe(null);

			var args = JSON.parse(response.data);

			expect(args.a).toBe(1);
		};

		lski.request.send(url, 'POST', data).then(handler)["catch"](genericCatch).then(done);
	});

	it("data sent correctly (URL Encoded)", function (done) {

		var url = 'http://api-echo.azurewebsites.net/echo';
		var data = "a=1&b=test";
		var options = {
			dataType: null,
			headers: {
				accept: null,
				"content-type": null
			}
		};
		var handler = function (response) {

			_log(response, "data sent correctly");

			expect(response).not.toBe(null);
			expect(response.data).not.toBe(null);
			expect(response.data).toBe("a=1&b=test");
		};

		lski.request.send(url, 'POST', data, options).then(handler)["catch"](genericCatch).then(done);
	});

	if (window.FormData) {

		it("data sent correctly (FormData)", function (done) {

			var url = 'http://api-echo.azurewebsites.net/echo';
			var options = {
				dataType: null,
				headers: {
					accept: null,
					"content-type": null
				}
			};

			var data = new FormData();
			data.append("a", 1);
			data.append("b", "test");
			
			var handler = function (response) {

				_log(response, "data sent correctly");

				expect(response).not.toBe(null);
				expect(response.data).not.toBe(null);
				expect(response.data).toEqual(jasmine.stringMatching(/^----/));
			};

			lski.request.send(url, 'POST', data, options).then(handler)["catch"](genericCatch).then(done);
		});
	}

	it("handles 'not found' correctly (default)", function (done) {

		var url = 'http://api-echo.azurewebsites.net/notFound';
		var handler = function (response) {

			_log("handles 'not found' correctly (default)", response);

			expect(response && response.status).toBe(404);
		};

		lski.request.get(url).then(handler)["catch"](shouldNotRun).then(done);
	});

	it("handles 'not found' correctly (rejectOnStatusCode: true)", function (done) {

		var url = 'http://api-echo.azurewebsites.net/notFound';
		var options = {
			rejectOnStatusCode: true
		};
		var handler = function (err) {

			_log("handles 'not found' correctly (rejectOnStatusCode: true)", err);

			expect(err && err.status).toBe(404);
		};

		lski.request.get(url, options).then(shouldNotRun)["catch"](handler).then(done);
	});

	/**
	 * Generic function that records an error if run as sometimes we need to test a particular promise does not run a particular catch or then
	 */
	function shouldNotRun(response) {

		expect(function () {
			throw new Error("Should not hit here");
		}).not.toThrow();
	}

	/**
	 * Generic catch method for promises, shows an error and allows any following then/done to run normally
	 */
	function genericCatch(err) {

		expect(function () {
			throw new Error(err);
		}).not.toThrow();
	}

    /**
     * Simply outputs the details responses of the requests
     */
    function _log() {
        if (outputResults) {
            console.log.apply(console, arguments);
        }
    }
});