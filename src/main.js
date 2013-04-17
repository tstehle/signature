// TODO: case where no arguments must match any number of optional params
// TODO: make creation faster by only having all signature() objects not redefine its private methods when created (like they don't redefine their parser); And take treeParser out of the global scope.

// TODO: "!string" selector

// TODO: order matters, so must use an array of key/value pairs? Messy notation:
// [{"string": function () {}}, "number", function () {}, {}]
// Alternative:
// addHandler("string", function () {}).and("number", function () {})

//TODO: test if wrapping the matcher in a not() function in the expressionParser is not faster than doing a !matcherResult in treeParser

/*
    A library to grant overriding capabilities to JavaScript functions.
    All helpers are included here on Build.
 */

    var version = "0.0.0";

    var noop = function () {};

    var findResponder = function (args, parsedExpressions) {
        var responder, reorderedArgs, parsedExpression, i;

        for (i = 0; i < parsedExpressions.length; i++) {    // look through our responders
            parsedExpression = parsedExpressions[i];
            responder = parsedExpression.responder;
            reorderedArgs = treeParser(parsedExpression, args); //call it doArgumentsMatchExpression()

            if (typeof reorderedArgs === "object") {            //WHAT? not "array"??? BUGBUG
//console.log(reorderedArgs);
                break;
            } else {
                reorderedArgs = [];            //ugly, but apply() demands and array
                responder = noop;
            }
        }

        return {
            responder: responder,
            args: reorderedArgs
        };
    };

    var createHandler = function(userOptions) {
        //
        //var matchers = createMatchers(userOptions.matchers); // TODO, though maybe do it in the expressionParser

        // Generate Trees out of the Expressions (eg. "number, string") defined by the user.
        var parsedExpressions = expressionParser(userOptions.responders, userOptions.matchers);

        // Our handler centralises all calls, and finds the proper Responder function to call based on the arguments
        var handler = function () {
            // Find the correct Responder (or noop if no match), as well as the reordered arguments
            var responderData = findResponder(arguments, parsedExpressions);

            // Call the Responder in the proper context and pass along its returned value
            return responderData.responder.apply(this, responderData.args);
        };

        return handler;
    };



    //separate to : initialSetup.js

    var root = this;

    var signature;
    if (typeof exports !== 'undefined') {
        signature = exports;
    } else {
        signature = root.signature = {};
    }

    signature.createHandler = createHandler;
