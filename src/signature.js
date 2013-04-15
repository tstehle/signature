// TODO: case where no arguments must match any number of optional params
// TODO: make creation faster by only having all signature() objects not redefine its private methods when created (like they don't redefine their parser); And take treeParser out of the global scope.
// TODO: order matters, so must use an array?

var treeParser = (function () {
    var stack;
    var argumentsIndex;
    var tree;
    var nodeLinksToIndexes;
    var args;
    var reorderedArgs = [];

    var doParse = function (node) {
        if (!nodeLinksToIndexes[node.index]) {
            nodeLinksToIndexes[node.index] = 0;            //init index for node
        }

        if (node.matcher(args[argumentsIndex])) {
            console.log("doParse of node " + node.index +  " compared to argument " + args[argumentsIndex] + " --- PASS");
            return nextNode(node);
        } else {
            console.log("doParse of node " + node.index +  " compared to argument " + args[argumentsIndex] + " --- FAIL");
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

        nodeLinksToIndexes[next.index] = 0;//

        return doParse(next);
    };

    var backtrack = function (node) {        //TODO: use nextNode() instead of the second part of this method?
        stack.pop();
        reorderedArgs[node.index] = undefined;        // the arg may have been set before so we remove it

        var previousNode = stack[stack.length - 1];
        console.log("*/*/*/ BACKTRACKING TO PREVIOUS NODE:");
        console.log(previousNode);

        if (!previousNode) {
            return false;
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

        console.log("*/*/*/ FINDING NEXT NODE:");
        console.log(next);

        return doParse(next);
    };

    return {
        parse: function (newTree, newArgs) {
            tree = newTree;
            args = newArgs;
            argumentsIndex = 0;
            stack = [tree[0]];
            nodeLinksToIndexes = [];
            reorderedArgs = [];

            return doParse(tree[0]);
        }
    };
}());

var signature = function () {
    var version = "0.0.0";
    var options;    // Store the user's options
    var parsedExpressions;    // Cache parsed expressions

    var noop = function () {};    // TODO remove return

    var parser = treeParser.parse;

    var parseExpression = function (expression) {
        var expressionElements = expression.split(','),
            trimmedExpressionElement,
            parsedExpression = [],
            isTheCurrentNodeAStartingNode = true,
            i;

        parsedExpression.startingNodes = [];//meh, return an object, not this mess

        for (i = 0; i < expressionElements.length; i++) {
            trimmedExpressionElement = trim(expressionElements[i]);
            parsedExpression[i] = {};

            if ( trimmedExpressionElement.length >= 3 &&
                trimmedExpressionElement.charAt(0) === "[" &&
                trimmedExpressionElement.charAt( trimmedExpressionElement.length - 1 ) === "]") {

                trimmedExpressionElement = trimmedExpressionElement.substring(1, trimmedExpressionElement.length - 1);
                parsedExpression[i].optional = true;
            } else {
                parsedExpression[i].optional = false;
            }

            parsedExpression[i].index = i;
            parsedExpression[i].matcher = findMatcherByName(trimmedExpressionElement);
            parsedExpression[i].linksTo = [];
            parsedExpression[i].isStartingNode = isTheCurrentNodeAStartingNode;

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

        console.log("$$$$$ PARSED EXPRESSION $$$$$");
        console.log(parsedExpression);
        return parsedExpression;
    };

    var parseExpressions = function () {
        var parsedExpressions = {};
        var expression;

        for (expression in options.responders) {
            parsedExpressions[expression] = parseExpression(expression);
        }

        return parsedExpressions;
    };

    var trim = function (string) {
        return string.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
    };

    var findResponder = function (args) {
        var i, responder, matcher, reorderedArgs, expression;

        for (expression in options.responders) {    // look through our responders
            responder = options.responders[expression];
            reorderedArgs = doArgumentsMatchExpression(args, expression);
//console.log(typeof reorderedArgs);
            if (typeof reorderedArgs === "object") {            //WHAT? not "array"??? BUGBUG
                console.log(reorderedArgs);
                break;
            } else {
                reorderedArgs = [];            //ugly
                responder = noop;
            }
        }

        return {
            responder: responder,
            args: reorderedArgs
        };
    };

    var builtinMatchers = {
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

    // Add aliases to builtinMatchers
    builtinMatchers["*"] = builtinMatchers.any;

    var doArgumentsMatchExpression = function(args, expression) {
        var cachedExpressionTree = parsedExpressions[expression];
        return parser(cachedExpressionTree, args);
    };

    // Also look in used defined object first, so user can override ours
    var findMatcherByName = function(name) {
        var matcher;

        if (typeof options.matchers === "object") {
            matcher = options.matchers[name];
        }

        if (!matcher) {
            matcher = builtinMatchers[name];
        }

        return matcher;
    };

    return {
        version: version,
        createHandler: function(userOptions) {
            options = userOptions;
            parsedExpressions = parseExpressions();        //TODO: need a new one for each element.

            return function () {
console.log(arguments);
                var responderData = findResponder(arguments);
                return responderData.responder.apply(this, responderData.args);
            };
        }
    };
};




var sig;
if (typeof exports !== 'undefined') {
    sig = exports;
} else {
    sig = {};
}

sig.signature = signature;

/* BUGBUG: why doesn't it work?
 // Attempt at convenience creator of new instances of signature
 var sig = (function() {
 var that = {
 createHandler: function() {
 // TODO: this is wasted work. We redeclare lots of static helper methods. FIX
 return signature().createHandler(arguments);
 }
 };

 return that;
 }());
 */