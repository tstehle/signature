var Benchmark = require('benchmark');
var _ = require('lodash');
var signature000 = require("../build/old/signature-0.0.0.js");
var signature_0_0_1 = require("../build/old/signature-0.0.1.js");
var signature_0_0_2 = require("../build/old/signature-0.0.2.js");
var signature = require("../build/signature.js");

var suite = new Benchmark.Suite('Compare speed improvements between versions: TreeParser', {
    'onStart': function() {
        testSignature000= {
            on: signature000.createHandler({
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

        testSignature_0_0_1 = {
            on: signature_0_0_1({
                "!object, [string], [any], function": function(types, selector, data, fn) {
                    return [types, selector, data, fn];
                },
                "!object, [string], [any], false": function(types, selector, data) {
                    return [types, selector, data, function() {return false;}];
                },
                "object, [string], [any]": function(types, selector, data) {
                    //loop
                }
            })
        };

        testSignature_0_0_2 = {
            on: signature_0_0_2({
                "!object, [string], [any], function": function(types, selector, data, fn) {
                    return [types, selector, data, fn];
                },
                "!object, [string], [any], false": function(types, selector, data) {
                    return [types, selector, data, function() {return false;}];
                },
                "object, [string], [any]": function(types, selector, data) {
                    //loop
                }
            })
        };

        testSignature = {
            on: signature({
                "!object, [string], [any], function": function(types, selector, data, fn) {
                    return [types, selector, data, fn];
                },
                "!object, [string], [any], false": function(types, selector, data) {
                    return [types, selector, data, function() {return false;}];
                },
                "object, [string], [any]": function(types, selector, data) {
                    //loop
                }
            })
        };
    }
});



suite.add('signature000', function() {
        testSignature000.on("types", function () {});
        testSignature000.on("types", "sel", function () {});
    })
    .add('signature_0_0_1', function() {
        testSignature_0_0_1.on("types", function () {});
        testSignature_0_0_1.on("types", "sel", function () {});
    })
    .add('signature_0_0_2', function() {
        testSignature_0_0_2.on("types", function () {});
        testSignature_0_0_2.on("types", "sel", function () {});
    })
    .add('signature latest', function() {
        testSignature.on("types", function () {});
        testSignature.on("types", "sel", function () {});
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



// Compare speed improvements between versions: TreeBuilder











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



/*

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

    */