# Lski-Request

An ajax module that returns a Promise object from a simple function call that contains the data, if any, returned. It tries to be as un-opinionated as possible, so has lots of options and is extendible.

## Installation

`npm install lski-request --save`

or

`bower install lski-request --save`

or

Grab the minified file from [dist/lski-request.js](https://github.com/lski/lski-request/blob/master/dist/lski-request.js) there is also an un-minified file [dist/lski-request.debug.js](https://github.com/lski/lski-request/blob/master/dist/lski-request.debug.js)

## Usage

A function call to a url, optionally with data and receive a promise object in return. That Promise object is either resolved or rejected, depending on the success of the ajax request. Options can also be supplied either globally or on a per request.

__Note:__ Using the default options, a request is rejected only if there is a network or timeout error, otherwise it is resolved as a success. e.g. 404/500 is still a success. Also requests are made as and accept JSON. Both of these can be overridden in the options (see Options)

## Examples

```js
// Simple get request
lski.request.send('your/url/to/a/service', 'GET').then(function(response) {
    // do something with the response
});

// send method format
lski.request.send(url, type, dataToSend, optionsToOverride);
```

The response returned is an object containing the following properties: *__NB__ There is an option 'dataOnly' that if set to true will only return the data instead of the following object*

- data: The data returned from the request as a string
- options: The options used for this specific request combined from the global
- status: The status code of the request e.g. 200, 404, etc
- statusText: The status text of the request e.g. 'Not found', 'No Content', etc
- xhr: The original request object used to make the request

There is also four alias methods for convenience, which internally call the send method.

```js
    lski.request.get(url, options);
    lski.request.post(url, data, options);
    lski.request.put(url, data, options);
    lski.request.del(url, options); // or lski.request['delete'](url, options); for earlier IE browsers
```

_To learn more about Promises see below for additional information._

## Options

You can choose to override options either on all requests or on individual requests as shown below.

```js
    //Globally, change them on the settings object, e.g:
    lski.request.options.timeout = 60;
    lski.request.options.beforeSend = function(req, options) {
            // do something here
    };
    
    //Per request, pass the option to override as the last argument, e.g:
    lski.request.send('your/url', 'GET', null, {
        timeout: 60,
        beforeSend: function(req, options) {
            // do something here
        }
    });
```

The following are the options that can be overridden

- `headers` {object}

    The headers object stores the that are passed along with each request in property:value pairs. Values can either be a static string or a function that will be run each time that request is run and can be used to create dynamic values. __NB:__ If the value for a particular header is null when the request is made then that header will not be added at all.

```js
    // Default
    { 
        "content-type": "application/json",
        "accept": function(options) {
            if(options.dataType === lski.request.dataTypes.JSON) {
                return "application/json, text/json"
            }
        }
    }
```

- `beforeSend` {function=} __default:__ `null`

  If set it will be called prior to any request is made and is passed, it will receive the request object and options for this request as arguments.

- `rejectOnStatusCode` {boolean} __default:__ `false`

  By default a request is only rejected if there is a timeout or there is a network fail, If rejectOnStatusCode is true it will also reject the promise if the returned response is has a status code less than 200 or greater 399.

- `timeout` {number=} __default:__ `null`

	If set to a number will set the timeout (in milliseconds) that the request will wait before raising an exception, otherwise uses default.

- `dataOnly` {boolean} __default:__ `false`

    If true will only return the data to the parameter of the Promise when a request is resolved successfully rather than the complete object.

- `dataType` {number=} __default:__ `lski.request.dataTypes.JSON`

	States the data type returned from the request. 

	- `lski.request.dataTypes.TEXT` 

		Returns an unaltered version of the data returned as a string

	- `lski.request.dataTypes.JSON`

		Returns a javascript object, if nothing is returned data will be null. It also attaches an 'accept: application/json' header so the server knows what to return.

- `jsonReviver` {function=} __default__ `null`

    Only used in combination when dataType = JSON this method is passed to JSON.parse as the reviver method, helpful for formatting dates received.

## Extending

As it uses promises it is easy to extend the functionality of the api, the easiest way is to 'monkey patch' the `send` function. 

To do this store the current send function and then replace it with a wrapper function that calls the original function internally. That allows you to catch the promise before returning it. 

Alternatively you can simply wrap the api in a service layer and set the options within that layer.

## AMD and CommonJS Support

By default the module registers itself as a global module 'lski.request', however if AMD or CommonJS exports are detected it will register as an anonymous module.

## Utils

There is a utils namespace (lski.request.utils) where there are a few useful functions.

- `merge`

    A deep extend function, doesn't do anything fancy, just overrides or adds a property on the current object with the equivalent on the merging object.
    
- `isFunction`

    Does a simple check to see if a value is a callable function.
    
- `isDate`

    Does a simple check to see if a value is a Date object
   
- `isArray`

    Does a simple check to see if a value is an Array (Not an array like object e.g. arguments)

## Cors (Cross-Origin Resource Sharing) 

As most modern browsers support Cors requests now, this API simply 'works' with Cors requests and deliberately does not do anything to poly-fill CORS requests for the few browsers (IE 9 and below) that dont support it. However this was decided as it would bloat the API when only a few scenerios require it.

If you need to support a browser that doesnt support Cors requests and actually needs to make some Cors requests there are several techniques and poly-fills available to you E.g. [Xdomain](https://github.com/jpillora/xdomain). Although not recommended, it is also possible to change the function `_createRequest()` that generates the XmHttpRequest object to support some more advanced extension of the API, for instance to use an XDomainRequest rather than an XmlHttpRequest object.

## Support

Tested against:

- IE8+
- Firefox
- Chrome
- Android
- Opera

## Dependencies

By design this API does not depend on any other package, however it does require promises be implemented. Promises are part of the ES6 specification, but are already supported in the newest versions of Chrome, Firefox, Opera, Safari and MS Edge.

Promises are powerful but easily poly-filled an example shown at [https://www.promisejs.org/polyfills/promise-6.0.0.min.js](https://www.promisejs.org/polyfills/promise-6.0.0.min.js). There is a lot more information available a good place to start is: [https://www.promisejs.org](https://www.promisejs.org)

## Build

To build a distribution if you make changes, have node.js installed and ensure the local packages are installed by running `npm install` from the command line then run `gulp` from the command line, which will build the source files.

## Test

After building the distribution you can run a test to ensure the project still works. You have a couple of options, either via gulp and the command line or via web browser. For gulp in the command line run `gulp test`, which will activate karma via phantomjs and output the results into the console. For the browser, run any web server that can display static files from the root of the project and navigate to `/test`.