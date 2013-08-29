JavaScript Analytics Wrapper API
================================

> **tl;dr**
> 
> Provides a clean interface to the Adobe SiteCatalyst `s_code.js` library

## Features

* Does not pollute the global namespace
* Clearly documented API
* Can be loaded by script-loaders

## Goals

The goals for this library are listed below in order of relative priority. Their solutions are identified throughout the 'wrapper.js' file if not noted below the goal.

  1. Wrap the s_code.js file to hide its implementation from the global scope
  2. Provide a friendly and expressive API for developers to use
  3. Allow for lazy-loading and instantiation of s_code content
  4. Keep the s_code.js file isolated so that it may change without hassle
  5. The build process must be automate-able
      * accomplished with a bash script - by default - using sed command
  6. Enable developers to augment the API to their applications' needs
  7. Don't break backward compatibility for legacy code
  8. A single file to edit the wrapper to be consistent with normal work-flow
  9. An abstraction layer between analytics providers and application code
      * accomplished with an external file where configuration happens

## Using The Object

  1. Include this library
  2. Instantiate an instance
  3. Page-level configuration
  4. Send data to Adobe

To include the library just add the module file; either with a module loader such as RequireJS, or using vanilla JS with a custom module.

    // Step 1
    require(["wrapper"], function (analyticsFactory) {
      // do stuff...
    });
    // or
    <script type="analyticsFactory.module.js"></script>
    // disclaimer - the vanilla version is not written yet (pull request...?)

The next thing needed is a reference to an instance.

    // Step 2
    var omni = analyticsFactory("reportingSuite");

After providing some page-level configuration the library will be ready to send data.

    // Step 3
    var config = {
      homepage: "homepage title",
      prefix: "project name"
    };

    // call the 'init' method with a config object
    omni.api_call("init", config);

And finally.

    // Step 4
    omni.api_call("send");

### Extending

The API also provides the ability to add or replace methods.

    omni.api_call("add", "newMethod", function (/* args */) {
      // the context of 'this' will be bound by the library to the external object
    });

    // now calls to 'newMethod' will look like this
    omni.api_call("newMethod", "arg1");

## Suggestion? Maybe?

If calling the `api_call` method is painful or annoying you could provide an application specific feature that makes this more palatable.

    var lytics = (function (obj) {
      function shortcut () {
        obj.api_call.apply(obj, arguments);
      };

      // preserve access to original object just in case
      shortcut.obj = obj;

      // return function for laziness
      return shortcut;
    }(analyticsFactory("reportingSuite")));

Which would result in calls that look like this.

    lytics("init", config);
    // or
    lytics("send"); // same as omni.object.t()

---------------------------------------

SiteCatalyst is a registered trademark of Adobe Systems Incorporated
