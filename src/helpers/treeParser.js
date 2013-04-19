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