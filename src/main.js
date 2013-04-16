// TODO: case where no arguments must match any number of optional params
// TODO: make creation faster by only having all signature() objects not redefine its private methods when created (like they don't redefine their parser); And take treeParser out of the global scope.
// TODO: order matters, so must use an array?
// TODO: better general structure, especially concerning the node/browser integration
// TODO: separate into modules


/*
    A library to grant overriding capabilities to JavaScript functions.
    All helpers are included here on Build.
 */

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

        parsedExpression.startingNodes = []; // meh, return an object, not this mess

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

    var builtinMatchers = matchers;

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


//separate to : initialSetup.js

var root = this;

var sig;
if (typeof exports !== 'undefined') {
    sig = exports;
} else {
    sig = root.sig = {};
}

sig.signature = signature;
