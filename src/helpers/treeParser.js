var treeParser = (function () {

    var doParse = function (currentNode, args, argsIndex) {
        var didMatch;

        if (argsIndex !== -1) {         //TODO: damn that's ugly: make it so matcher already knows to invert the result
            didMatch = currentNode.matcher(args[argsIndex]);
            if (currentNode.negator) {
                didMatch = !didMatch;
            }
        }

        if (argsIndex === -1 || didMatch) {
            var reorderedArguments;

            // If we're at the end of the args, we better be in an endNode
            if(args.length === argsIndex + 1) {
                if (currentNode.isEndNode) {
                    // Reorder arguments on the way down
                    reorderedArguments = [];
                    reorderedArguments[currentNode.index] = args[argsIndex];
                    return reorderedArguments;
                } else {
                    // Too few arguments to fit: backtrack
                    return false;
                }
            }

            for (var i = 0; i < currentNode.linksTo.length; i++) {
                var nextNode = currentNode.linksTo[i];
                reorderedArguments = doParse(nextNode, args, argsIndex+1);
                if (reorderedArguments){
                    if (argsIndex !== -1) {
                        reorderedArguments[currentNode.index] = args[argsIndex];
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

        if (args.length === 0 && tree.hasEmptyPath) {
            return [];
        }

        return doParse(tree.data[0], args, -1);
    };

    return parseTree;
}());