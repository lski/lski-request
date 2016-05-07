# Lski-Request

A micro ajax module (only 2.77kb or 1.2kb gzipped) that provides a simple way to make ajax requests and returns a Promise object.

```javascript
lski.request.get('http://urltoyourapi/').then(function(response) {
    console.log(response.data);
});
```

It tries to give a good out-the-box experience but also be as un-opinionated as possible, so it provides a lot of flexibility and [options](#options). Similar to the new [fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) except it works in older browsers (e.g. IE 8-9) than current polyfills.

## Installation

The module supports UMD so can be used with AMD, CommonJS and as a global object. 

You can install it via npm or bower but is also available from the dist folder or you [download it](https://cdn.rawgit.com/lski/lski-request/master/dist/lski-request.js) and then add to your web page using a `<script>` tag, where it will be available as `lski.request`.

```
npm install lski-request --save
or
bower install lski-request --save
or
https://cdn.rawgit.com/lski/lski-request/master/dist/lski-request.js
```

## Usage

A single function call that returns a promise object, that is either resolved or rejected, depending on the success of the ajax request.

__Important:__ Using the default options, a request is NOT rejected based on its status code, it is only rejected if there is a network or timeout error. Therefore 404/500 is still a considered a success, as it did in fact hit the server and get a reply.

## Examples

```js
// Simple get request
lski.request.send('your/url/to/a/service', 'GET').then(function(response) {
    // do something with the response
});

// send method format
lski.request.send(url, type, dataToSend, optionsToOverride);
```

The response returned is an object containing the following properties: *__NB__ There is an option 'dataOnly' that if set to true will only return the data instead of the following object however this is discouraged*

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
lski.request.del(url, options);
```

_To learn more about Promises see below for additional information._

## Options

Options can be set either globally or for each request:

```js
//Globally, change them on the settings object, e.g:
lski.request.options.timeout = 60;
lski.request.options.beforeSend = function(xhr, options) {
    // do something here
};

//Per request, pass the option to override as the last argument, e.g:
lski.request.send('your/url', 'GET', null, {
    timeout: 60,
    beforeSend: function(xhr, options) {
        // do something here
    }
});
```

#### Default Options

```javascript
{
	headers: { 
	    "content-type": "application/json",
	    "accept": function(options) {
	       if(options.dataType === lski.request.dataTypes.JSON) {
	       		return "application/json, text/json"
	       }
	    }
	},
	beforeSend: null,
	rejectOnStatusCode: false,
	timeout: null,
	dataOnly: false,
	dataType: lski.request.dataTypes.JSON,
	jsonReviver: null
}
```

- __`headers`__ {object}

  The headers object stores the that are passed along with each request in property:value pairs. Values can either be a static string or a function that will be run each time that request is run and can be used to create dynamic values. 
  
  *__NB:__ If the value for a particular header is null when the request is made then that header will not be added at all.*

- __`beforeSend`__ {function=} 

  If set it will be called prior to any request is made and is passed, it will receive the request object and options for this request as arguments.

- __`rejectOnStatusCode`__ {boolean} 

  By default a request is only rejected if there is a timeout or there is a network fail, If rejectOnStatusCode is true it will also reject the promise if the returned response is has a status code less than 200 or greater 399.

- __`timeout`__ {number=}

  If set to a number will set the timeout (in milliseconds) that the request will wait before raising an exception, otherwise uses default.

- __`dataOnly`__ {boolean} 

  If true will only return the data to the parameter of the Promise when a request is resolved successfully rather than the complete object.

- __`dataType`__ {number=} 

  States the data type returned from the request. 

  - `lski.request.dataTypes.TEXT` 

    Returns an unaltered version of the data returned as a string

  - `lski.request.dataTypes.JSON`
  
    Returns a javascript object, if nothing is returned data will be null. It also attaches an 'accept: application/json' header so the server knows what to return.

- __`jsonReviver`__ {function=} 

  Only used in combination when dataType = JSON this method is passed to JSON.parse as the reviver method, helpful for formatting dates received.

## Extending

As it uses promises it is easy to extend the functionality of the api, the easiest way is to 'monkey patch' the `send` function. 

To do this store the current send function and then replace it with a wrapper function that calls the original function internally. That allows you to catch the promise before returning it. 

Alternatively you can simply wrap the api in a service layer and set the options within that layer.

## SemVer

The project adheres to [semantic versioning](http://semver.org/) to give users some confidence about any changes that might break their code.

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

As most modern browsers support Cors requests now, this API tries not to 'fix' the implementation as it would bload the API for edge cases.

If you need to support older browsers with CORS I recommend using a polyfill. The polyfill I have used with this APIis [XDomain](https://github.com/jpillora/xdomain) so I would recommend looking at that.

## Browser Support

|![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png) | ![Android](https://raw.github.com/alrra/browser-logos/master/android/android_48x48.png) 
| --- | --- | --- | --- | --- | --- |
| 30+ ✔ | 38+ ✔ | 8+ ✔ | Latest ✔ | 6.1+ ✔ | Latest ✔ |

It might work in lower versions of each browser, however I have not been able to test them to be sure.

*__Note:__ This API is designed to wrap around the XmlHttpRequest object, which that is not available in Node, however if using a polyfill like xhr2 it should work*

## Dependencies

No package dependancies, although as it is a Promise based API, Promises do need to be supported. 

The latest browsers and node all support Promises by default, however if you need to support an older browser there are several ponyfills available to implement them e.g. [es6-promise](https://github.com/jakearchibald/es6-promise) or [bluebird](https://github.com/petkaantonov/bluebird).

## Build

To build a distribution if you make changes, have node.js installed and ensure the local packages are installed by running `npm install` from the command line then run `gulp` from the command line, which will build the source files.

## Test

To test the source file you have a couple of options, either via gulp and the command line or via a web browser. For gulp in the command line run `gulp test`, which will activate karma via phantomjs and output the results into the console. For the browser, run any web server that can display static files from the root of the project and navigate to `/test`.
