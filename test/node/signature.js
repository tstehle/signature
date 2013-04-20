/* nodeunit tests */

var signature = require("../../build/signature.js");

exports.testScoping = function(test){
    var myObject = {
        objectVar: "I am an object var, context is good",
        myFunction: signature({
            "string": function(str) {
                return this.objectVar + " - " + str;
            }
        })
    };

    test.strictEqual(
        myObject.myFunction("test"),
        "I am an object var, context is good - test",
        "Proper Scoping of the called methods"
    );

    test.done();
};

exports.testNegator = function(test){
    var myFunction = signature({
        "string": function(str) {
            return "string - " + str;
        },
        "!string": function(notStr) {
            return "!string - " + notStr;
        }
    });

    test.strictEqual(
        myFunction("test"),
        "string - test"
    );

    test.strictEqual(
        myFunction(101),
        "!string - 101"
    );

    test.done();
};


exports.testVariousParsing = function(test){
    var myFunction = signature({
        "isNegative": function (negativeNumber) {
            return "negative number " + negativeNumber;
        },
        "[number]": function(optionalNumber) {
            return "optional number " + optionalNumber;
        },
        "function": function(funct) {
            return funct.apply();
        },
        "string": function(str) {
            return str;
        },
        "number, number": function(number1, number2) {
            return "multiply 2 numbers: " + number1*number2;
        },
        "number, number, number": function(number1, number2, number3) {
            return "multiply 3 numbers: " + number1*number2*number3;
        },
        "string, number": function(str, number) {
            return str + number;
        }
    }, {
        isNegative: function (value) {
            return (value < 0);
        }
    });


    test.strictEqual(
        myFunction(),
        "optional number undefined"
    );

    // BUGBUG fails because the expression parser doesn't build an object that supports empty paths.
    // May be solved by checking if we're at an end node

    test.strictEqual(
        myFunction(111),
        "optional number 111"
    );

    test.strictEqual(
        myFunction(function() {
            return ("executed function passed as param");
        }),
        "executed function passed as param"
    );

    test.strictEqual(
        myFunction("returned string passed as param"),
        "returned string passed as param"
    );

    test.strictEqual(
        myFunction(-10),
        "negative number -10"
    );

    test.strictEqual(
        myFunction(5, 6),
        "multiply 2 numbers: 30"
    );

    test.strictEqual(
        myFunction(5, 6, 2),
        "multiply 3 numbers: 60"
    );

    test.strictEqual(
        myFunction("Printing six: ", 6),
        "Printing six: 6"
    );

    test.strictEqual(
        myFunction(["should not do anything with Array"]),
        undefined
    );

    test.done();
};



exports.testOptionalsAtTheStart = function(test){
    var myFunction = signature({
        "[string], [function], number": function (str, funct, num) {
            return [str, typeof funct, num];
        }
    });

    test.deepEqual(
        myFunction("d", 50),
        ["d", "undefined", 50]
    );

    test.deepEqual(
        myFunction("d", function () {}, 40),
        ["d", "function", 40]
    );

    test.deepEqual(
        myFunction(50),
        [undefined, "undefined", 50]
    );

    test.deepEqual(
        myFunction(function () {}, 50),
        [undefined, "function", 50]
    );

    test.done();
};

exports.testOptionalsAtTheEnd = function(test){
    var myFunction = signature({
        "number, [string], [function]": function(num, str, funct) {
            //optionals at the end
            return [num, str, typeof funct];
        }
    });

    test.deepEqual(
        myFunction(50, "d"),
        [50, "d", "undefined"]
    );

    test.deepEqual(
        myFunction(50, "d", function () {}),
        [50, "d", "function"]
    );

    test.deepEqual(
        myFunction(50, function () {}),
        [50, undefined, "function"]
    );

    test.done();
};


exports.testjQueryLookalike = function(test){
    var $ = {
        on: signature({
            "any, [any], [any], function": function(events, selector, data, callback) {            //must be first or no match
                //console.log("******** events, [selector], [data], function ********");
                return [events, selector, data, typeof callback];
            },
            "any, [any], [any]": function(events, selector, data) {
                //console.log("******** events, [selector], [data] ********");
                return [events, selector, data];
            }
        })
    };

    test.deepEqual(
        $.on(),
        undefined
    );

    test.deepEqual(
        $.on("arg1", "arg2", function() {}),
        ["arg1", "arg2", undefined, "function"]
    );

    test.deepEqual(
        $.on("arg1", "arg2", "arg3"),
        ["arg1", "arg2", "arg3"]
    );

    test.deepEqual(
        $.on("arg1", "arg2", "arg3", function() {}),
        ["arg1", "arg2", "arg3", "function"]
    );

    test.done();
};


exports.testEmptyPaths = function(test){
    var myFunction = signature({
        "[number]": function(optionalNumber) {
            return "optional number " + optionalNumber;
        }
    });

    test.strictEqual(
        myFunction(),
        "optional number undefined"
    );

    test.strictEqual(
        myFunction(1),
        "optional number 1"
    );

    test.done();
};


exports.testEmptyPaths2 = function(test){
    var myFunction = signature({
        "[number], [number]": function(optionalNumber1, optionalNumber2) {
            return "optional numbers " + optionalNumber1 + " " + optionalNumber2;
        }
    });

    test.strictEqual(
        myFunction(),
        "optional numbers undefined undefined"
    );

    test.strictEqual(
        myFunction(1),
        "optional numbers 1 undefined"
    );

    test.strictEqual(
        myFunction(1, 2),
        "optional numbers 1 2"
    );

    test.done();
};

exports.testEmptyExpression= function(test){
    var myFunction = signature({
        "": function() {
            return "no arguments";
        }
    });

    test.strictEqual(
        myFunction(),
        "no arguments"
    );

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




exports["Test ..."] = function(test){

    var $ = {
        on: signature({
            "!object..., object...": function(notObjects, object) {
                return [notObjects, object];
            },
            "!object..., [object...]": function(notObjects, object) {
                return [notObjects, object];
            }
        })
    };

    test.deepEqual(
        $.on("a", "b", 1, {1:1}, {2:2}),
        [["a", "b", 1], [{1:1}, {2:2}]]
    );

    test.done();
};

exports["Test ... Part #2"] = function(test){

    var $ = {
        on: signature({
            "!object..., [object...], string": function(notObjects, object, string) {
                return [notObjects, object, string];
            }
        })
    };

    test.deepEqual(
        $.on("a", "b", 1, "e"),
        [["a", "b", 1], undefined, "e"]
    );

    test.done();
};

exports["Test catchall"] = function(test){

    var $ = {
        on: signature({
            "*": function() {
                return arguments[3];
            }
        })
    };

    test.deepEqual(
        $.on("a", "b", 1, "e"),
        "e"
    );

    test.done();
};