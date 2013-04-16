    // Signature comes with several predefined matchers
    var matchers = {
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
    matchers["*"] = matchers.any;