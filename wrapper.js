/**
 * Omniture / SiteCatalyst Module
 * Author - Joshua T Kalis <joshkalis@quickenloans.com>
 *
 * @return {Object}
 *         The original object is returned, with a new method (api_call) added,
 *         for using the new API defined or all the original methods/properties.
 */
// Goal #8: single file
define([], function analyticsWrapperModule () {
  "use strict";

  var API,
      coreMethodsOnAPI,
      config,
      noop = function noop () {},
      slice = [].slice,
      undef = (function (u) {return u;}())
      ;

  function defaultStringValue (str, alternate) {
    if (str === undef || ("" + str) === "undefined") {
      str = alternate || "";
    }

    return str;
  }

  // Goal #6: augment-able API
  /** Command (Pattern)
   * These methods will always be called through the 'api_call' method, added
   * by the facadeManagerMixin which will attempt to fix the context (this)
   * and return the context for "chainable" calling.
   *
   * Adding methods to the API assumes a function is being passed in that has
   * not had a context fixed for their execution; using Function.prototype.bind,
   * or any other similar way to fix a context other than the public object,
   * will pobably cause problems for the proper functioning of those methods.
   *
   * @type {Object}
   */
  API = {
    // Add new methods to the API if the name is not already used
    add: function API_add (name, fn) {
      var msg = "Method [%] already defined in the API." +
            "To overwrite an existing method use 'override' not 'add'.";

      if (!API[name]) {
        API.override(name, fn);
      } else {
        throw new Error(msg
          .replace("%", name));
      }
    },

    // Replace - if existing - or add a method to the API
    override: function API_override (name, fn) {
      var fnIsFunction,
          nameIsString;

      nameIsString = /string/i.test({}.toString.call(name));
      fnIsFunction = /function/i.test({}.toString.call(fn));

      if (!nameIsString) {
        throw new Error("Name (%) for API method is not a string."
          .replace("%", name));
      }

      if (!fnIsFunction) {
        throw new Error("Function argument given for API is not a function.");
      }

      // prevent overwrite of core API methods: add, override, and remove
      if (~coreMethodsOnAPI.indexOf(name)) {
        throw new Error("Can not replace core API method [%]."
          .replace("%", name));
      } else {
        API[name] = fn;
      }
    }
  };

  // cache of core methods that should probably never be overwritten
  coreMethodsOnAPI = Object.keys(API);

  // getter/setter function for config object; normalize some values on set
  API.add("config", function add_config (_config) {
    if (0 === arguments.length) {
      return config;
    } else {
      config = _config;

      // coerce the values to a string
      config.homepage = defaultStringValue(config.homepage);
      config.prefix = defaultStringValue(config.prefix);
    }
  });

  // Basic initialization actions that should happen on object creation
  API.add("init", function add_init (_config) {
    var loc = window.location.href;

    if (_config) {
      // the config object is being passed in and should be initialized
      this.api_call("config", _config);
    } else if (!config) {
      // no config is available, either passed in or globally for the object
      throw new Error("No configuration for analyticsWrapperModule.");
    }

    this.pageName = this.api_call("util.pageNameFormat", loc, config.prefix, config.homepage);

    // if no hash in URL, use pageName; rule from Acronym
    this.eVar22 = this.api_call("util.parseURL", loc).hash.slice(1) || this.pageName;

    if (config.trackingServer) {
      this.trackingServer = config.trackingServer;
    }
  });

  // Send data to analytics service
  API.add("send", function add_send (data) {
    if (1 === arguments.length) {
      for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
          this[prop] = data[prop];
        }
      }
    }

    this.t();
  });

  // list the methods available in the API
  API.add("util.methods", function (coreMethods) {
    var result;

    // only core methods of the API
    if (true === coreMethods) {
      result = coreMethodsOnAPI;
    } else {
      // start with all methods in the API
      result = Object.keys(API);

      // only non-core methods of the API
      if (false === coreMethods) {
        result = result
          .filter(function (item) {
            return (-1 === coreMethodsOnAPI.indexOf(item));
          });
      }
    }

    return result;
  });

  // Return a standardized page name string based on the URL passed in
  API.add("util.pageNameFormat", function add_pageNameFormat (url, prefix, homepage) {
    if (arguments.length === 0) {
      throw new Error("Zero arguments passed to pageNameFormat function.");
    }
    // coerce into a string
    prefix = defaultStringValue(prefix);
    homepage = defaultStringValue(homepage);

    // follow format guidelines
    prefix = prefix !== "" ? prefix + ":" : "";

    url = this
      .api_call("util.parseURL", url)
      .pathname
      // rules according to Acronym
      .replace(/^\/|\/$/g, "")
      .replace(/\//g, ":")
      .replace(/-/g, " ");

    // if prefix is empty, there is no need for the colon
    return prefix + (url || homepage);
  });

  // Use the DOM to parse a URL into its parts
  API.add("util.parseURL", function add_parseURL (url) {
    var linkElement = document.createElement("a");

    linkElement.href = url;

    return linkElement;
  });

  // Goal #3: lazy invocation of analytics library
  /** Factory (Pattern)
   * This function is a "factory" that builds an instance of a Facade and does
   * some initial configuration of the Omniture/SiteCatalyst "s" object.
   *
   * @param  {String} s_account
   *         A string representing the reporting suite that SiteCatalyst is
   *         expecting data to be categorized into for reports.
   *
   * @return {Facade Object}
   *         An instance of AnalyticsFacade inheriting the "s", object from
   *         Omniture/SiteCatalyst s_code.js file, as a prototype to allow
   *         syntax reuse in older applications.
   */
  function analyticsFacadeFactory (s_account) {
    if (!s_account) {
      throw new Error("No reporting reporting suite configured for analytics.");
    }

    var subject;

    try {
      subject = s_code(s_account);
    } catch (e) {
      console.error("An error occurred when initializing the 's' object from" +
        " s_code.js, or as a result of being wrapped and hidden away by an API");
      throw e;
    }

    return facadeManagerMixin(subject);
  }

  // Goal #2: a friendly API
  /** Command + Mixin (Patterns)
   * Add the new method into the object for added functionality without
   * leaving legacy code to a mandatory complete overhaul.
   *
   * @param  {Object} subject
   *         The original object provided by the analytics service.
   *
   * @return {Object}
   *         An augmented original object with added functionality that does
   *         not break backward compatibility.
   */
  function facadeManagerMixin (subject) {
    subject
      .api_call = function api_call (fn/*, args...*/) {
        var args,
            optionalCall = false,
            result;

        // allow for calling api methods without throwing an error if it doesn't
        // exist in the api instead of requiring all potentially non-existant
        // method call to be wrapped in a try/catch
        if (/\?/.test(fn)) {
          fn = fn.slice(1);
          optionalCall = true;
        }

        if (API[fn]) {
          // args here is being changed to act as a "splat"; everything after
          // the first argument is kept
          args = slice.call(arguments, 1);

          // By using "apply" here, attempt to fix the context (this) to the
          // public object (subject) every time the method is called
          result = API[fn].apply(subject, args);

          // if any value is returned from the method call, return that value
          // otherwise return "subject" to enable a fluent API
          return (undef !== result ? result : subject);
        } else {
          if (!optionalCall) {
            throw new Error("Method [%] not available in this API."
              .replace("%", fn));
          }
        }
      };

    return subject;
  }

  // Goal #1: wrap external code to hide away the badness
  function s_code (s_account) {
    // initialize this to empty string to prevent errors; might not be necessary
    var linkTrackVars = "";

    // Goal #4: external s_code.js file
    // S_CODE_FILE

    // Goal #7: backward compatibility
    // return s object created
    return s;
  }

  return analyticsFacadeFactory;
});
