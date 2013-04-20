var Benchmark = require('benchmark');
var _ = require('lodash');
var signature_0_0_1 = require("../build/old/signature-0.0.1.js");
var signature = require("../build/signature.js");



var handwrittenVsGenerated = new Benchmark.Suite('Compare speed between handwritten code and ours');

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

var $withSignature_0_0_0 = {
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

var $withSignature = {
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


// add tests
handwrittenVsGenerated.add('$.on() Without Signature', function() {
    $.on("types", function () {});
})
    .add('$.on() With Signature 0.0.1', function() {
        $withSignature_0_0_0.on("types", function () {});
    })
    .add('$.on() With Signature Latest', function() {
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