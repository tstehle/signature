(function () {

    var version = "0.0.1";

var expressionParser = (function () {

    var trim = function (string) {
        return string.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
    };


    var parseExpressions = function (expressions, userDefinedMatchers) {
        var parsedExpressions = [];
        var expression;

        for (expression in expressions) {
            var responder = expressions[expression];
            parsedExpressions.push(parseExpression(expression, responder, userDefinedMatchers));
        }

        return parsedExpressions;
    };

    var parseExpression = function (expression, responder, userDefinedMatchers) {
        var expressionElements = expression.split(','),
            trimmedExpressionElement,
            parsedExpression = [],
            isTheCurrentNodeAStartingNode = true,
            i;

        parsedExpression.data = [];
        parsedExpression.startingNodes = [];
        parsedExpression.responder = responder;

        for (i = 0; i < expressionElements.length; i++) {
            trimmedExpressionElement = trim(expressionElements[i]);

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

            // Build
            parsedExpression.data[i].index = i;
            parsedExpression.data[i].matcher = matchers.findByName(trimmedExpressionElement, userDefinedMatchers);
            parsedExpression.data[i].linksTo = [];
            parsedExpression.data[i].isStartingNode = isTheCurrentNodeAStartingNode;     // ? DO WE USE THIS ?

            if (isTheCurrentNodeAStartingNode) {
                parsedExpression.startingNodes.push(parsedExpression.data[i]);
            }

            if (!(isTheCurrentNodeAStartingNode && parsedExpression.data[i].optional)) {
                isTheCurrentNodeAStartingNode = false;
            }
        }//TODO: handle empty string in trimmedExpressionElement

        for (i = 0; i < parsedExpression.data.length - 1; i++) {
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
        if (parsedExpression.data[0].isEndNode && parsedExpression.data[0].isStartingNode && parsedExpression.data[0].optional) {
            parsedExpression.hasEmptyPath = true;
        }

//console.log("$$$$$ PARSED EXPRESSION IS NOW A TREE $$$$$");
//console.log(parsedExpression);
        return parsedExpression;
    };

    return parseExpressions;
}());




var parseExpression = (function () {

    var generateFunctionCode = function (expressions, userDefinedMatchers) {


    };

    return generateFunctionCode;
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

var treeParser = (function () {
    var stack;
    var argumentsIndex;
    var nodeLinksToIndexes;
    var args;
    var reorderedArgs = [];
    var startingNodes;
    var startingNodesIndex;

    var doParse = function (node) {
        var matcherResult = node.matcher(args[argumentsIndex]);
        if (node.negator) {
            matcherResult = !matcherResult;
        }

        if (matcherResult) {
            if (!nodeLinksToIndexes[node.index]) {
                nodeLinksToIndexes[node.index] = 0;            // init index for current node
            }
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
        args = newArgs;
        argumentsIndex = 0;
        nodeLinksToIndexes = [];
        reorderedArgs = [];
        startingNodes = newTree.startingNodes;
        startingNodesIndex = 0;
        stack = [startingNodes[0]];

        if (newArgs.length === 0 && newTree.hasEmptyPath) {
            return [];
        }

        return doParse(startingNodes[0]);
    };

    return parseTree;
}());

// TODO: case where no arguments must match any number of optional params
// TODO: make creation faster by only having all signature() objects not redefine its private methods when created (like they don't redefine their parser); And take treeParser out of the global scope.
// TODO: add ...
// TODO: a way to catch all, maybe "[...]" will match anything (detect that special case and don't do any check at all?)

// TODO: order matters, so must use an array of key/value pairs? Messy notation:
// [{"string": function () {}}, "number", function () {}, {}]
// Alternative:
// addHandler("string", function () {}).and("number", function () {})

// TODO: test if wrapping the matcher in a not() function in the expressionParser is not faster than doing a !matcherResult in treeParser
// TODO: write tests for all our buildtinmatchers


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

}());