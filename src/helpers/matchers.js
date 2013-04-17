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
        'true': function (input) {
            return (input === true);
        },
        'false': function (input) {
            return (input === false);
        },
        'truthy': function (input) {
            if (input) {
                return true;
            } else {
                return false;
            }
        },
        'falsy': function (input) {
            if (input) {
                return false;
            } else {
                return true;
            }
        },
        'object': function (input) {
            return (typeof input === "object");
        },
        number: function (input) {
            return (typeof input === "number");
        },
        string: function (input) {
            return (typeof input === "string");
        },
        any: function (input) {
            return (typeof input !== "undefined" && input !== null);
        },
        'function': function (input) {
            return (typeof input === "function");
        }
    };

    // Add aliases
    builtinMatchers["*"] = builtinMatchers.any;
    builtinMatchers.falsey = builtinMatchers.falsy;

    return {
        findByName: findByName
    };
}());

// TODO: call createMatchers(suerDefinedMatchers) which is a constructor which does not redefine builtinMatchers