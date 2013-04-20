var expressionParser = (function () {

    var trim = function (string) {
        return string.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
    };

    var parseExpressions = function (expressions, userDefinedMatchers) {
        var parsedExpressions = [];
        var expression;

        for (expression in expressions) {
            var responder = expressions[expression];

            //TEST
            if (expression !== "*") {
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


            // Build
            parsedExpression.data[i].index = i-1;
            parsedExpression.data[i].matcher = matchers.findByName(trimmedExpressionElement, userDefinedMatchers, parsedExpression.data[i].negator);
            parsedExpression.data[i].linksTo = [];
            parsedExpression.data[i].isStartingNode = isTheCurrentNodeAStartingNode;     // ? DO WE USE THIS ?

            if (parsedExpression.data[i].infinite) {
                parsedExpression.data[i].linksTo.push(parsedExpression.data[i]);
            }


            if (isTheCurrentNodeAStartingNode) {
                parsedExpression.data[0].linksTo.push(parsedExpression.data[i]);
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
        if (parsedExpression.data[1].isEndNode && parsedExpression.data[1].isStartingNode && parsedExpression.data[1].optional) {
            parsedExpression.hasEmptyPath = true;
        }

console.log("$$$$$ PARSED EXPRESSION IS NOW A TREE $$$$$");
console.log(parsedExpression);
console.log(parsedExpression.data[0]);
        return parsedExpression;
    };

    return parseExpressions;
}());

// TODO: some kinf oF BUG in the starting node, where it has multiple copies of a node
