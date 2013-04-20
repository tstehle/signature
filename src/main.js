// TODO: order matters, so must use an array of key/value pairs? Messy notation:
// [{"string": function () {}}, "number", function () {}, {}]
// Alternative:
// addHandler("string", function () {}).and("number", function () {})
// which means the returned method will need to have methods of its own, which add to the array of trees.
// This would be quite costly is trees must be merged...

// TODO: test if wrapping the matcher in a not() function in the expressionParser is not faster than doing a !matcherResult in treeParser
// This could be the source of much of the recent 10% decrease

// TODO: try building the reorderedArgs array on the way up, so we don't have to bother with the ... arrays

// TODO: write tests for each of our buildtinmatchers

// TODO: log unrecognized matchers, to help debugging

// TODO: a way to catch all, maybe "[...]" will match anything (detect that special case and don't do any check at all?)
// TODO: allow user defined "no match" function. For example in jQuery they would need it to "return this" instead of undefined.
// NOTE: a catchall responder is the same as a "no match" function.
// Thus we could ask the user to use "*": function () {} or some such.
// When used alone it is a catchall, but we can also use it along with other selectors, like "string, number,

/*
    A library to grant overriding capabilities to JavaScript functions.
    All ./helpers/*.js are included here on Build.
*/

    var root = this;

    var signature = function(responders, matchers) {
        //
        //var matchers = createMatchers(userOptions.matchers); // TODO, though maybe do it in the expressionParser

        // Generate Trees out of the Expressions (eg. "number, string") defined by the user.
        var parsedExpressions = expressionParser(responders, matchers);

        var catchall = responders["*"];

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

            // We did not find a match, we return nothing, or execute the use provided catchall
            if (typeof catchall === "function") {
                return catchall.apply(this, arguments);
            } else {
                return undefined;
            }
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
