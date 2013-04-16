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

            if ( trimmedExpressionElement.length >= 3 &&
                trimmedExpressionElement.charAt(0) === "[" &&
                trimmedExpressionElement.charAt( trimmedExpressionElement.length - 1 ) === "]") {

                trimmedExpressionElement = trimmedExpressionElement.substring(1, trimmedExpressionElement.length - 1);
                parsedExpression[i].optional = true;
            } else {
                parsedExpression[i].optional = false;
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

        console.log("$$$$$ PARSED EXPRESSION $$$$$");
        console.log(parsedExpression);
        return parsedExpression;
    };

    return parseExpressions;
}());


