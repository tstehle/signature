/* nodeunit tests to verify compatibility with node.js */

var signature = require("../../build/signature.js").signature;

exports.testSignatureIsRequiredProperly = function(test) {
    test.strictEqual(
        typeof signature,
        "function"
    );
    test.done();
};