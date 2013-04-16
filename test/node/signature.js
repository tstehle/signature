/* nodeunit tests */

var signature = require("../../build/signature.js");

exports.testScoping = function(test){
    var myObject = {
        objectVar: "I am an object var, context is good",
        myFunction: signature.createHandler({
            responders: {
                "string": function(str) {
                    return this.objectVar + " - " + str;
                }
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


exports.testVariousParsing = function(test){
    var myFunction = signature.createHandler({
        matchers: {
            isNegative: function (value) {
                return (value < 0);
            }
        },
        responders: {
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
        }
    });

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
    var myFunction = signature.createHandler({
        responders: {
            "[string], [any], number": function (str, any, num) {
                return [str, any, num];
            }
        }
    });

    //TODO

    test.done();
};

exports.testOptionalsAtTheEnd = function(test){
    var myFunction = signature.createHandler({
        responders: {
            "number, [string], [function]": function(num, str, funct) {
                //optionals at the end
                return [num, str, typeof funct];
            }
        }
    });

    test.deepEqual(
        myFunction(50, "d"),
        [50, "d", "undefined"]
    );

    test.deepEqual(
        myFunction(50, "d", function() {}),
        [50, "d", "function"]
    );

    test.deepEqual(
        myFunction(50, function() {}),
        [50, undefined, "function"]
    );

    test.done();
};


exports.testjQueryLookalike = function(test){
    var $ = {
        on: signature.createHandler({
            responders: {
                "any, [any], [any], function": function(events, selector, data, callback) {            //must be first or no match
                    //console.log("******** events, [selector], [data], function ********");
                    return [events, selector, data, typeof callback];
                },
                "any, [any], [any]": function(events, selector, data) {
                    //console.log("******** events, [selector], [data] ********");
                    return [events, selector, data];
                }
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


// BUGBUG: Probably buggy because there are several end nodes,
// and our parsed State Machine doesn't represent that.
// number, [string], [function]
// Solution: mark end nodes. If we have no more args and are at an end node, we exit.
// With success if match or if undefined vs optional
/*

*/

// BUGBUG: similar bug with starting node
// [string], [any], number
// They're all potential starting nodes
// Yet the state machine that I build only knows of one entry point.
// Solution: have a list of entry points, and if we can't backtrack further we use another entry point.
// Maybe we could make it the first node...
// It would also be an exit point if everything is optional.
// its associated matcher would be any? Must be careful to with the indexes of the arguments and such though...



//myFunction();        // BUGBUG fails because the expression parser doesn't build an object that supports empty paths.
// May be solved by checking if we're at an end node