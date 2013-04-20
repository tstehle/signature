var Benchmark = require('benchmark');
var _ = require('lodash');

var suiteMisc = new Benchmark.Suite('MISC');

var matcher = function(input) {
    return (typeof input === "string");
}

var negatorFunction = function (input) {
    return !(matcher(input));
}

var currentNode = {
    negator: true,
    matcher: matcher,
    negatorFunction: negatorFunction
};



suiteMisc.add('negatorFunction', function() {
        currentNode.negatorFunction('a');
    })
    .add('negatorIf', function() {
        var didMatch = currentNode.matcher("a");
        if (currentNode.negator) {
            didMatch = !didMatch;
        }
    })
// add listeners
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + _.pluck(this.filter('fastest'), 'name'));
    })
// run async
    .run({ 'async': true });
