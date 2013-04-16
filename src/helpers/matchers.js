var matchers = (function () {

    // Look in user-defined object first, so the User's Matchers can override ours
    var findByName = function(name, userDefinedMatchers) {
        var matcher;

        if (typeof userDefinedMatchers === "object") {
            matcher = userDefinedMatchers[name];
        }

        if (!matcher) {
            matcher = builtinMatchers[name];
        }

        return matcher;
    };

    // Signature comes with several predefined matchers
    var builtinMatchers = {
        number: function(input) {
            return (typeof input === "number");
        },
        string: function(input) {
            return (typeof input === "string");
        },
        any: function(input) {
            return (typeof input !== "undefined" && input !== null);
        },
        'function': function(input) {
            return (typeof input === "function");
        }
    };

    // Add aliases
    builtinMatchers["*"] = builtinMatchers.any;

    return {
        findByName: findByName
    };
}());

// TODO: call createMatchers(suerDefinedMatchers) which is a constructor which does not redefine builtinMatchers