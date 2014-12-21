describe("request", function () {

	beforeEach(function () {
		lski.request.options.dataType = lski.request.dataTypes.TEXT;
	});

	afterEach(function () {
		lski.request.options.dataType = lski.request.dataTypes.JSON;
	});

	it("namespace exists", function () {

		console.log("namespace exists");
		expect(lski.request).not.toBe(null);
	});

	it("basic send request via get", function (done) {

		lski.request.send('http://api-echo.azurewebsites.net/ip', 'GET').then(function (response) {

			console.log("basic send request via get", response);

			expect(response.data).not.toBe(null);

			var data = JSON.parse(response.data);

			expect(data.ip).not.toBe(null);
		})
		.catch(genericCatch)
		.then(done);
	});

	it("headers are correctly sent", function (done) {

		lski.request.send('http://api-echo.azurewebsites.net/headers', 'GET', undefined, { headers: { 'accept': 'text/plain' } }).then(function (response) {

			console.log("headers are correctly sent", response);

			expect(response).not.toBe(null);
			expect(response.data).not.toBe(null);

			var headers = JSON.parse(response.data);

			expect(headers.accept).toBe('text/plain');
		})
		.catch(genericCatch)
		.then(done);
	});

	it("data sent correctly", function (done) {

		lski.request.send('http://api-echo.azurewebsites.net/echo', 'POST', JSON.stringify({ a: 1, b: 'test' })).then(function (response) {

			console.log(response, "data sent correctly");

			expect(response).not.toBe(null);
			expect(response.data).not.toBe(null);

			var args = JSON.parse(response.data);

			expect(args.a).toBe(1);
		})
		.catch(genericCatch)
		.then(done);
	});

	it("handles 'not found' correctly (default)", function (done) {

		lski.request.get('http://api-echo.azurewebsites.net/notFound').then(function (response) {

			console.log("handles 'not found' correctly (default)", response);

			expect(response && response.status).toBe(404);
		})
		.catch(shouldNotRun)
		.then(done);
	});

	it("handles 'not found' correctly (rejectOnStatusCode: true)", function (done) {

		lski.request.get('http://api-echo.azurewebsites.net/notFound', { rejectOnStatusCode: true })
			.then(shouldNotRun)
			.catch(function (err) {

				console.log("handles 'not found' correctly (rejectOnStatusCode: true)", err);

				expect(err && err.status).toBe(404);
			})
			.then(done);
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
});