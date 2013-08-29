define(["../dist"], function (analyticsFactory) {
  "use strict";

  var omni = analyticsFactory("notatestingsuite")
        .api_call("init", suiteConfig());

  function suiteConfig () {
    var config,
        isSecurePage = /s/.test(window.location.protocol);

    config = {
      homepage: "home",
      prefix: "rocket"
    };

    return config;
  }

  module("API base methods");

  test("Base methods", function () {
    ok(omni.api_call("util.methods"), "Core methods array returned.");
    equal(omni.api_call("util.methods", true).length, 2, "Core methods count.");

    omni.api_call("config", {});
    deepEqual(omni.api_call("config"), {homepage:"", prefix:""}, "Set default values for required config properties.");
  });

  test("Add a new method", function () {
    omni.api_call("add", "thisisawesome", function () {
      return "awesome!";
    });

    equal(omni.api_call("thisisawesome"), "awesome!", "New method returns correct value.");

    omni.api_call("add", "thisisthis", function (obj) {
      return deepEqual(this, obj, "The context of the methods are the same as the external object.");
    });

    omni.api_call("thisisthis", omni);
  });

  test("Override a method", function () {
    ok(omni.api_call("thisisawesome"), "Method returns something.");

    throws(function () {
      omni.api_call("add", "thisisawesome", function () {
        return "continuing awesome!";
      });
    }, "Trying to add an existing method throws an error.");

    omni.api_call("override", "thisisawesome", function () {
      return "continuing awesome!";
    });

    equal(omni.api_call("thisisawesome"), "continuing awesome!", "The over-ridden method returns the correct string.");
  });

  module("API extended methods");

  test("Config", function () {
    omni = analyticsFactory("notatestingsuite")
      .api_call("init", suiteConfig());

    ok(omni.api_call("config"), "Method 'config' returns the configuration oject.");
    deepEqual(omni.api_call("config"), suiteConfig(), "Config object returned is correct.");
  });

  module("Base functionality");

  function testBaseFunctionality (omni) {
    var temp;

    ok(omni.t, ".t property exists: '%s'.".replace(/%s/, omni.t));

    ok(omni.pageName, ".pageName property exists: '%s'.".replace(/%s/, omni.pageName));

    temp = "Hello World.";
    omni.pageName = temp;
    equal(omni.pageName, temp, "Setting the pageName property should return the new value when addressed.");
  }

  test("s_code.js properties and methods should exist", function () {
    testBaseFunctionality(omni);
  });

  test("Alternate initialization", function () {
    var omni;

    omni = analyticsFactory("notatestingsuite")
      .api_call("config", suiteConfig())
      .api_call("init");

    testBaseFunctionality(omni);
  });

  test("Command (pattern) + Mixin (pattern) method should exist", function () {
    ok(omni.api_call, "Manager method is available.");
  });

  module("Methods");

  test("util.pageNameFormat", function () {
    var result = omni.api_call("util.pageNameFormat", "http://hello");

    equal(result, "");
  });
});