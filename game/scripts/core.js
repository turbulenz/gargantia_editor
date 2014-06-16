/*
 extend derived from http://ejohn.org/blog/simple-javascript-inheritance/
*/

var tzBaseObject = Object;

var initializing = false,
                fnTest = /xyz/.test(function () {/**@nosideeffects*/xyz;}) ? /\b_super\b/ : /.*/;

tzBaseObject.extend = function (prop) {
    // _super rename to _super to ease code reading
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var proto = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
            // Check if we're overwriting an existing function
            proto[name] = typeof prop[name] === "function"
                            && typeof _super[name] === "function"
                            && fnTest.test(prop[name]) ? (function(name, fn) {
                    return function() {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                    };
            })(name, prop[name]) : prop[name];
    }

    // The dummy class constructor
    function Class() {
            if (!initializing && this.init) {
                    this.init.apply(this, arguments);
            }
            return this;
    }
    // Populate our constructed prototype object
    Class.prototype = proto;
    // Enforce the constructor to be what we expect
    Class.constructor = Class;
    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
};

// Bind function
if (!Function.bind)
{
    Function.prototype.bind = function (scope)
    {
        var boundFunction = this;

        return function ()
        {
            return boundFunction.apply(scope, arguments);
        }
    }
}

// Filter function
if (!Array.prototype.filter)
{
    Array.prototype.filter = function(fun /*, thisArg */)
    {
        "use strict";
        if (this === void 0 || this === null)
        {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
        {
            throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        var i;
        for (i = 0; i < len; i += 1)
        {
            if (i in t)
            {
                var val = t[i];

                // NOTE: Technically this should Object.defineProperty at
                //       the next index, as push can be affected by
                //       properties on Object.prototype and Array.prototype.
                //       But that method's new, and collisions should be
                //       rare, so use the more-compatible alternative.
                if (fun.call(thisArg, val, i, t))
                {
                    res.push(val);
                }
            }
        }
        return res;
    };
}
