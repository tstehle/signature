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