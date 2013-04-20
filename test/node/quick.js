var signature = require("../../build/signature.js");

exports.testSomething = function(test){
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

exports["Test jQuery .on lookalike"] = function(test){

    var $ = {
        on: signature({
            "!object, [string], [any], function": function(types, selector, data, fn) {
                return [types, selector, data, typeof fn];
            },
            "!object, [string], [any], false": function(types, selector, data) {
                var fn = function() {return false;};
                return [types, selector, data, typeof fn];
            },
            "object, [string], [any]": function(types, selector, data) {
                return [types, selector, data];
            }
        })
    };

    test.deepEqual(
        $.on("selector", "subselector", 3, function () {}),
        ["selector", "subselector", 3, "function"]
    );

    test.deepEqual(
        $.on("selector", "subselector", function () {}),
        ["selector", "subselector", undefined, "function"]
    );

    test.done();
};