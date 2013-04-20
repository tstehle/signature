// TODO: case where no arguments must match any number of optional params
// TODO: make creation faster by only having all signature() objects not redefine its private methods when created (like they don't redefine their parser); And take treeParser out of the global scope.
// TODO: add ... and return an array of the elements
// TODO: a way to catch all, maybe "[...]" will match anything (detect that special case and don't do any check at all?)
// TODO: order matters, so must use an array of key/value pairs? Messy notation:
// [{"string": function () {}}, "number", function () {}, {}]
// Alternative:
// addHandler("string", function () {}).and("number", function () {})

// TODO: test if wrapping the matcher in a not() function in the expressionParser is not faster than doing a !matcherResult in treeParser
// TODO: write tests for all our buildtinmatchers
// TODO: log unregognized matchers, to help debugging
// TODO: allow user defined "no match" function. For example in jQuery they would need it to "return this" instead of undefined.


/*
    A library to grant overriding capabilities to JavaScript functions.
    All helpers are included here on Build.
*/

    var root = this;

    var signature = function(responders, matchers) {
        //
        //var matchers = createMatchers(userOptions.matchers); // TODO, though maybe do it in the expressionParser

        // Generate Trees out of the Expressions (eg. "number, string") defined by the user.
        var parsedExpressions = expressionParser(responders, matchers);

        // Handler centralises all calls, and finds the proper Responder function to call based on the arguments
        var handler = function () {
            var responder, reorderedArgs, parsedExpression, i;

            for (i = 0; i < parsedExpressions.length; i++) {    // look through our responders
                parsedExpression = parsedExpressions[i];
                reorderedArgs = treeParser(parsedExpression, arguments); //call it doArgumentsMatchExpression()

                if (reorderedArgs !== false) {            //WHAT? not "array"??? is an "object"?? BUGBUG
                    // Call the Responder in the proper context and pass along its returned value
                    responder = parsedExpression.responder;
                    return responder.apply(this, reorderedArgs);
                }
            }

            // We did not find a match, we return nothing
            return undefined;
        };

        return handler;
    };

    // Taken from underscore.js
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = signature;
        }
        exports.signature = signature;
    } else {
        root.signature = signature;
    }
