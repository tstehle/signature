(function () {

var expressionParser = (function () {

    var trim = function (string) {
        return string.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
    };


    var parseExpressions = function (expressions, userDefinedMatchers) {
        var parsedExpressions = {};
        var expression;

        for (expression in expressions) {
            parsedExpressions[expression] = parseExpression(expression, userDefinedMatchers);
        }

        return parsedExpressions;
    };

    var parseExpression = function (expression, userDefinedMatchers) {
        var expressionElements = expression.split(','),
            trimmedExpressionElement,
            parsedExpression = [],
            isTheCurrentNodeAStartingNode = true,
            i;

        parsedExpression.startingNodes = []; // meh, return an object, not this mess

        for (i = 0; i < expressionElements.length; i++) {
            trimmedExpressionElement = trim(expressionElements[i]);
            parsedExpression[i] = {};

            // Check for []
            if ( trimmedExpressionElement.length >= 3 &&
                trimmedExpressionElement.charAt(0) === "[" &&
                trimmedExpressionElement.charAt( trimmedExpressionElement.length - 1 ) === "]") {

                trimmedExpressionElement = trimmedExpressionElement.substring(1, trimmedExpressionElement.length - 1);
                parsedExpression[i].optional = true;
            } else {
                parsedExpression[i].optional = false;
            }

            // Check for !
            if (trimmedExpressionElement.charAt(0) === "!") {
                trimmedExpressionElement = trimmedExpressionElement.substring(1, trimmedExpressionElement.length);
                parsedExpression[i].negator = true;
            } else {
                parsedExpression[i].negator = false;
            }


            parsedExpression[i].index = i;
            parsedExpression[i].matcher = matchers.findByName(trimmedExpressionElement, userDefinedMatchers);
            parsedExpression[i].linksTo = [];
            parsedExpression[i].isStartingNode = isTheCurrentNodeAStartingNode;     // ? DO WE USE THIS ?

            if (isTheCurrentNodeAStartingNode) {
                parsedExpression.startingNodes.push(parsedExpression[i]);
            }

            if (!(isTheCurrentNodeAStartingNode && parsedExpression[i].optional)) {
                isTheCurrentNodeAStartingNode = false;
            }
        }//TODO: handle empty string in trimmedExpressionElement

        for (i = 0; i < parsedExpression.length - 1; i++) {
            var allChildrenWereOptional = true;
            for (var j = i + 1; j < parsedExpression.length; j++) {
                parsedExpression[i].linksTo.push(parsedExpression[j]);

                if (!parsedExpression[j].optional) {
                    allChildrenWereOptional = false;
                    break;
                }
            }

            parsedExpression[i].isEndNode = allChildrenWereOptional;
        }

        // Last node is always an end node
        parsedExpression[i].isEndNode = true;

console.log("$$$$$ PARSED EXPRESSION IS NOW A TREE $$$$$");
console.log(parsedExpression);
        return parsedExpression;
    };

    return parseExpressions;
}());




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

    return {
        findByName: findByName
    };
}());

// TODO: call createMatchers(suerDefinedMatchers) which is a constructor which does not redefine builtinMatchers

var treeParser = (function () {
    var stack;
    var argumentsIndex;
    var tree;
    var nodeLinksToIndexes;
    var args;
    var reorderedArgs = [];
    var startingNodes;
    var startingNodesIndex;

    var doParse = function (node) {
        if (!nodeLinksToIndexes[node.index]) {
            nodeLinksToIndexes[node.index] = 0;            //init index for node
        }

        var matcherResult = node.matcher(args[argumentsIndex]);
        if (node.negator) {
            matcherResult = !matcherResult;
        }

        if (matcherResult) {
//console.log("doParse of node " + node.index +  " compared to argument " + args[argumentsIndex] + " --- PASS");
            return nextNode(node);
        } else {
//console.log("doParse of node " + node.index +  " compared to argument " + args[argumentsIndex] + " --- FAIL");
            return backtrack(node);
        }
    };

    var nextNode = function (node) {
        reorderedArgs[node.index] = args[argumentsIndex];

        var indexNextNode = nodeLinksToIndexes[node.index];
        var next = node.linksTo[indexNextNode];
        argumentsIndex++;
        stack.push(next);

        if (node.isEndNode) {
            if (argumentsIndex === args.length) {
                return reorderedArgs;
            }
        }

        if (!next) {
            if (argumentsIndex === args.length) {        //must check whether there are still unaccounted for arguments
                return reorderedArgs;
            } else {
                return false;
            }
        }

        nodeLinksToIndexes[next.index] = 0; //

        return doParse(next);
    };

    var backtrack = function (node) {        //TODO: use nextNode() instead of the second part of this method?
        stack.pop();
        reorderedArgs[node.index] = undefined;        // the arg may have been set before so we remove it

        var previousNode = stack[stack.length - 1];
//console.log("*/*/*/ BACKTRACKING TO PREVIOUS NODE:");
//console.log(previousNode);

        if (!previousNode) {
            startingNodesIndex++;
            var nextStartingNode = startingNodes[startingNodesIndex];
            if (nextStartingNode !== undefined) {
                return doParse(nextStartingNode);
            } else {
                return false;
            }
        }

        nodeLinksToIndexes[previousNode.index] += 1;
        var next = previousNode.linksTo[nodeLinksToIndexes[previousNode.index]];

        // BUGBUG? should I not add an if (node.isEndNode) here as well?
        //

        if (!next) {
            argumentsIndex--;                    // Why does this work?
            return backtrack(previousNode);
        }

        nodeLinksToIndexes[next.index] = 0;//

        stack.push(next);

//console.log("*/*/*/ FINDING NEXT NODE:");
//console.log(next);

        return doParse(next);
    };

    var parseTree = function (newTree, newArgs) {
        tree = newTree;
        args = newArgs;
        argumentsIndex = 0;
        nodeLinksToIndexes = [];
        reorderedArgs = [];
        startingNodes = tree.startingNodes;
        startingNodesIndex = 0;
        stack = [startingNodes[0]];

        return doParse(startingNodes[0]);
    };

    return parseTree;
}());

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

    var findResponder = function (args, responders, parsedExpressions) {
        var responder, reorderedArgs, expression;

        for (expression in responders) {    // look through our responders
            responder = responders[expression];
            reorderedArgs = doArgumentsMatchExpression(args, expression, parsedExpressions);

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

    var doArgumentsMatchExpression = function(args, expression, parsedExpressions) {
        var cachedExpressionTree = parsedExpressions[expression];
        return treeParser(cachedExpressionTree, args);
    };


    var createHandler = function(userOptions) {
        //
        //var matchers = createMatchers(userOptions.matchers); // TODO, though maybe do it in the expressionParser

        // Generate Trees out of the Expressions (eg. "number, string") defined by the user.
        var parsedExpressions = expressionParser(userOptions.responders, userOptions.matchers);

        // Our handler centralises all calls, and finds the proper Responder function to call based on the arguments
        var handler = function () {
            // Find the correct Responder (or noop if no match), as well as the reordered arguments
            var responderData = findResponder(arguments, userOptions.responders, parsedExpressions);

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

}());