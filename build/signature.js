(function () {

    var version = "0.0.4";

var expressionParser = (function () {

    var trim = function (string) {
        return string.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
    };

    var parseExpressions = function (expressions, userDefinedMatchers) {
        var parsedExpressions = [];
        var expression;

        for (expression in expressions) {
            var responder = expressions[expression];

            // Don't bother parsing if we have a * as it will match anything
            if (trim(expression) !== "*") {
                parsedExpressions.push(parseExpression(expression, responder, userDefinedMatchers));
            }
        }

        return parsedExpressions;
    };

    var parseExpression = function (expression, responder, userDefinedMatchers) {
        var expressionElements = expression.split(','),
            trimmedExpressionElement,
            parsedExpression = [],
            isTheCurrentNodeAStartingNode = true,
            i;

        parsedExpression.data = []; //reserve first space in array
        parsedExpression.data[0] = {
            linksTo: [],
            index: -1
        };
        parsedExpression.responder = responder;

        for (i = 1; i < expressionElements.length + 1; i++) {
            trimmedExpressionElement = trim(expressionElements[i-1]);

            //
            if (trimmedExpressionElement === '') {
                parsedExpression.hasEmptyPath = true;
                return parsedExpression;
            }

            parsedExpression.data[i] = {};

            // Check for []
            if ( trimmedExpressionElement.length >= 3 &&
                trimmedExpressionElement.charAt(0) === "[" &&
                trimmedExpressionElement.charAt( trimmedExpressionElement.length - 1 ) === "]") {

                trimmedExpressionElement = trimmedExpressionElement.substring(1, trimmedExpressionElement.length - 1);
                parsedExpression.data[i].optional = true;
            } else {
                parsedExpression.data[i].optional = false;
            }

            // Check for !
            if (trimmedExpressionElement.charAt(0) === "!") {
                trimmedExpressionElement = trimmedExpressionElement.substring(1, trimmedExpressionElement.length);
                parsedExpression.data[i].negator = true;
            } else {
                parsedExpression.data[i].negator = false;
            }

            // Check for ...
            if (trimmedExpressionElement.slice(trimmedExpressionElement.length - 3,  trimmedExpressionElement.length) === "...") {
                trimmedExpressionElement = trimmedExpressionElement.substring(0, trimmedExpressionElement.length - 3);
                parsedExpression.data[i].infinite = true;
            } else {
                parsedExpression.data[i].infinite = false;
            }

            /*  TODO: * used as parts of an expression: what does it even mean? Can't we just do "anyIncludingNullAndUndefined..."?
            // Check for *
            if (trimmedExpressionElement === "*") {
                parsedExpression.data[i].infinite = true;
            }
            */

            // Build
            parsedExpression.data[i].index = i-1;
            parsedExpression.data[i].matcher = matchers.findByName(trimmedExpressionElement, userDefinedMatchers, parsedExpression.data[i].negator);
            parsedExpression.data[i].linksTo = [];
            parsedExpression.data[i].isStartingNode = isTheCurrentNodeAStartingNode;     // ? DO WE USE THIS ?


            if (parsedExpression.data[i].infinite) {
                parsedExpression.data[i].linksTo.push(parsedExpression.data[i]);
            }

            if (isTheCurrentNodeAStartingNode) {
                //parsedExpression.data[0].linksTo.push(parsedExpression.data[i]);  // Unnecessary because done in for loop below
            }

            // Sets value for next run of the loop
            if (!(isTheCurrentNodeAStartingNode && parsedExpression.data[i].optional)) {
                isTheCurrentNodeAStartingNode = false;
            }
        }//TODO: handle empty string in trimmedExpressionElement

        for (i = 0; i < parsedExpression.data.length - 1; i++) {    // TODO: perhaps put all the cose in this for for loop
            var allChildrenWereOptional = true;
            for (var j = i + 1; j < parsedExpression.data.length; j++) {
                parsedExpression.data[i].linksTo.push(parsedExpression.data[j]);

                if (!parsedExpression.data[j].optional) {
                    allChildrenWereOptional = false;
                    break;
                }
            }

            parsedExpression.data[i].isEndNode = allChildrenWereOptional;
        }

        // Last node is always an end node
        parsedExpression.data[i].isEndNode = true;

        // Detect empty paths
        if (parsedExpression.data[1].isEndNode && parsedExpression.data[1].isStartingNode && parsedExpression.data[1].optional) {
            parsedExpression.hasEmptyPath = true;
        }

//console.log("$$$$$ PARSED EXPRESSION IS NOW A TREE $$$$$");
//console.log(parsedExpression);
//console.log(parsedExpression.data[0]);
        return parsedExpression;
    };

    return parseExpressions;
}());

// TODO: some kinf oF BUG in the starting node, where it has multiple copies of a node


var matchers = (function () {

    // Look in user-defined object first, so the User's Matchers can override ours
    var findByName = function(name, userDefinedMatchers, negator) {
        var matcher;

        if (typeof userDefinedMatchers === "object") {
            matcher = userDefinedMatchers[name];
        }

        if (!matcher) {
            matcher = builtinMatchers[name];
        }

        if (negator) {
            return function (input) {
                return !matcher(input);
            };
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
        'undefined': function (input) {
            return (input === undefined);
        },
        'NaN': function (input) {               // TODO: let's try to have consistency between NaN and !number, ok?
            return isNaN(input);
        },
        truthy: function (input) {
            if (input) {
                return true;
            } else {
                return false;
            }
        },
        falsy: function (input) {
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
        },
        '*': function () {
            return true;
        }
    };

    // Add aliases
    builtinMatchers["?"] = builtinMatchers.any;
    builtinMatchers.falsey = builtinMatchers.falsy; // Alternate spelling

    return {
        findByName: findByName
    };
}());

// TODO: call createMatchers(suerDefinedMatchers) which is a constructor which does not redefine builtinMatchers

var treeParser = (function () {
    var __slice = [].slice;

    var doParse = function (currentNode, args, argsIndex, ellipsesIndex) {

        if (argsIndex === -1 || currentNode.matcher(args[argsIndex])) {
            var reorderedArguments, i;

            // If we're at the end of the args, we better be in an endNode
            if(args.length === argsIndex + 1) {
                if (currentNode.isEndNode) {
                    // We found the correct path: now reorder arguments on the way down
                    reorderedArguments = [];
                    if (currentNode.infinite) {
                        reorderedArguments[currentNode.index] = __slice.call(args, argsIndex - ellipsesIndex, argsIndex + 1);
                    } else {
                        reorderedArguments[currentNode.index] = args[argsIndex];
                    }
                    return reorderedArguments;
                } else {
                    // Too few arguments to fit: backtrack
                    return false;
                }
            }

            // Go through the children until we either find a match or run out of children
            for (i = 0; i < currentNode.linksTo.length; i++) {
                var nextNode = currentNode.linksTo[i];

                // Keep track of how many nodes we go through parsing a selector with an "..."
                var newEllipsesIndex = 0;
                if (currentNode === nextNode) {
                    newEllipsesIndex = ellipsesIndex + 1;
                }

                // Recurse over child of durrent node, returns either false or an array
                reorderedArguments = doParse(nextNode, args, argsIndex+1, newEllipsesIndex);

                if (reorderedArguments) {
                    // We found a match: reorder arguments on the way down
                    if (argsIndex !== -1) {
                        if (currentNode.infinite) {
                            if (!reorderedArguments[currentNode.index]) {
                                reorderedArguments[currentNode.index] = __slice.call(args, argsIndex - ellipsesIndex,  argsIndex + 1);
                            }
                            //reorderedArguments[currentNode.index][ellipsesIndex] = args[argsIndex];
                        } else {
                            reorderedArguments[currentNode.index] = args[argsIndex];
                        }
                    }
                    return reorderedArguments;
                }
            }

            // Went through all children and found no match: backtrack
            return false;

        } else {
            // No match for current Node: backtrack
            return false;
        }
    };

    var parseTree = function (tree, args) {

        // Special case: when "no arguments" is allowed
        if (args.length === 0 && tree.hasEmptyPath) {
            return [];
        }

        return doParse(tree.data[0], args, -1);
    };

    return parseTree;
}());

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

}());