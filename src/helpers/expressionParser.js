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


