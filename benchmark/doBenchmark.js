var Benchmark = require('benchmark');
var _ = require('lodash');
var signature = require("../build/signature.js");

var suite = new Benchmark.Suite;


/*
var basicFunctionWithoutSignature = function(object, fn) {
    if (object === "object" && typeof fn === "function") {
        return [object, fn];
    } else {
        return undefined;
    }
};


var responder = function (object, fn) {
    if (object === "object" && typeof fn === "function") {
        return [object, fn];
    } else {
        return undefined;
    }
};

var basicFunctionWithMockupSignature = function(object, fn) {

    return responder.apply();

};

var basicFunctionWithSignature = signature.createHandler({
    responders: {
        "object, function": function(object, fn) {
            return [object, fn];
        }
    }
});

// add tests
suite.add('basicFunctionWithMockupSignature', function() {
        basicFunctionWithMockupSignature("types", function () {});
    })
    .add('basicFunctionWithoutSignature', function() {
        basicFunctionWithoutSignature("types", function () {});
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

*/


var $ = {
    on: function( types, selector, data, fn ) {
        var type;

        // Types can be a map of types/handlers
        if ( typeof types === "object" ) {
            // ( types-Object, selector, data )
            if ( typeof selector !== "string" ) {
                // ( types-Object, data )
                data = data || selector;
                selector = undefined;
            }
            for ( type in types ) {
                this.on( type, selector, data, types[ type ]);
            }
            return this;
        }

        if ( data == null && fn == null ) {
            // ( types, fn )
            fn = selector;
            data = selector = undefined;
        } else if ( fn == null ) {
            if ( typeof selector === "string" ) {
                // ( types, selector, fn )
                fn = data;
                data = undefined;
            } else {
                // ( types, data, fn )
                fn = data;
                data = selector;
                selector = undefined;
            }
        }
        if ( fn === false ) {
            fn = function () {return false;};
        } else if ( !fn ) {
            return this;
        }

        return [types, selector, data, fn];
    }
};


var $withSignature = {
    on: signature.createHandler({
        responders: {
            "!object, [string], [any], function": function(types, selector, data, fn) {
                return [types, selector, data, fn];
            },
            "!object, [string], [any], false": function(types, selector, data) {
                return [types, selector, data, function() {return false;}];
            },
            "object, [string], [any]": function(types, selector, data) {
                //loop
            }
        }
    })
};


// add tests
suite.add('$.on() Without Signature', function() {
    $.on("types", function () {});
})
.add('$.on() With Signature', function() {
    $withSignature.on("types", function () {});
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