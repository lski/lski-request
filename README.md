# Lski-Request

An ajax module that returns a Promise object from a simple function call.

It tries to be as unopinionated as possible. However due to most requests being made using JSON objects, two default headers (content-type and accept) are automatically set for convenience (see section 'Options' below). These are easy to 'unset' at the global level or override on a pre request basis, like all options.

## Installation

bower install lski-request --save

or

Grab the minified file from [dist/lski-request.js](https://github.com/lski/lski-request/blob/master/dist/lski-request.js) there is also an un-minified file [dist/lski-request.debug.js](https://github.com/lski/lski-request/blob/master/dist/lski-request.debug.js)

## Basic Usage

You make a function call to a url and recieve a promise object in return. That Promise is either resolved or rejected, depending on the success of the ajax request.

__Note:__  By default, a request is rejected only if there is a network or timeout error, otherwise it is resolved. This is independent of the status code of the request as by definition the request itself was a success. This can be overridden in the options by setting rejectOnStatusCode = true

## Examples

	// Simple get request
	lski.request.send('your/url/to/a/service', 'GET').then(function(response) {
		// do something with the response
	});

	// send method format
	lski.request.send(url, type, dataToSend, optionsToOverride);

The response returned is an object containing the following properties: __NB__ There is an option 'dataOnly' that if set to true will only the data instead of the following object

- data: The data returned from the request as a string
- options: The options used for this specific request combined from the global
- status: The status code of the request e.g. 200, 404, etc
- statusText: The status text of the request e.g. 'Not found', 'No Content', etc
- xhr: The original request object used to make the request

There is also four alias methods for convenience, which internally call the send method.

	lski.request.get(url, options);
	lski.request.post(url, data, options);
	lski.request.put(url, data, options);
	lski.request.del(url, options); // or lski.request['delete'](url, options);

_To learn more about Promises see below for additional information._

## Options

You can choose to override options either on all requests or on individual requests as shown below.

- Globally, change them on the settings object, e.g:

        lski.request.options.headers['content-type'] = 'application/json';

        lski.request.options.beforeSend = function(req, options) {
              // do something here
        };

- Per request, pass the option to override as the last argument, e.g:

		lski.request.send('your/url', 'GET', null, {
            headers: {
                // Static header
                'content-type': 'application/json'
                // Dynamic header called each request
                'Authorization': function(options) {
                    return 'Bearer ' + token;
                }
            }
		});

The following are the options that can be overridden

- headers {object} __default:__ 

        { 
            "content-type": "application/json",
            "accept": function(options) {
                if(options.dataType === lski.request.dataTypes.JSON) {
                    return "application/json, text/json"
                }
            }
        }

  The headers object stores the that are passed along with each request in property:value pairs. Values can either be a string or function (functions are called per request and receive a copy of the combined options request options). __NB:__ If the value for a header is null then it wont be added.

- beforeSend {function=} __default:__ null

  If set it will be called prior to any request is made and is passed, it will receive the request object and options for this request as arguments.

- rejectOnStatusCode {boolean} __default:__ false

  If true will also reject the promise if the returned response is has a status code less than 200 or greater 399

- timeout {number=} __default:__ null

	If set to a number will set the timeout (in milliseconds) that the request will wait before raising an exception, otherwise uses default.

- dataOnly {boolean} __default:__ false

    If true will only return the data to the parameter of the Promise when a request is resolved successfully rather than the complete object.

- dataType {number=} __default:__ lski.request.dataTypes.JSON

	States the data type returned from the request. 

	- lski.request.dataTypes.TEXT 

		Returns an unaltered version of the data returned as a string

	- lski.request.dataTypes.JSON

		Returns a javascript object, if nothing is returned data will be null. It also attaches an 'accept: application/json' header so the server knows what to return.

- jsonReviver {function=} __default__ null

    Only used in combination when dataType = JSON this method is passed to JSON.parse as the reviver method, helpful for formatting dates received.

## AMD (UMD) support

By default the module registers itself as a global module 'lski.request', however if AMD or CommonJS exports are detected it will register as an anonymous module.

## Utils

There is a utils namespace (lski.request.utils) where there is a few useful functions.

- merge

    A deep extend function, doesn't do anything fancy, just overrides or adds a property on the current object with the equivalent on the merging object.
    
- isFunction

    Does a simple check to see if a value is a callable function.
    
- isDate

    Does a simple check to see if a value is a Date object
    
- isArray

    Does a simple check to see if a value is an Array (Not an array like object e.g. arguments)

## Extending

As it uses promises it is easy to extend the functionality of the api. The easiest way is to store the current send function and then replace it with a wrapper function that calls the original function internally. That allows you to catch the promise before returning it. Alternatively you can simply wrap the api in a service layer and set the options within that layer.

I will attempt to provide an example when I can.

## Support

Tested against:

- IE8+
- Firefox
- Chrome
- Android
- Opera

## Dependencies

By design this package does not depend on any other package, however it does require promises be implemented. Promises are part of the ES6 specification, but are already supported in the newest versions of Chrome, Firefox, Opera, Safari and is planed for IE.

Promises are powerful but easily polyfilled an example shown at [https://www.promisejs.org/polyfills/promise-6.0.0.min.js](https://www.promisejs.org/polyfills/promise-6.0.0.min.js)

But there is a lot more information available a good place to start is: [https://www.promisejs.org](https://www.promisejs.org)
