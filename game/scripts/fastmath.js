/*global Float32Array: false*/
/*global Uint32Array: false*/
/*global module: false*/
/*jshint bitwise: false*/
"use strict";

/**
 * @license
 * fastmath.js
 *                   Copyright (C) 2012 Paul Mineiro                   *
 * All rights reserved.                                                *
 *                                                                     *
 * Redistribution and use in source and binary forms, with             *
 * or without modification, are permitted provided that the            *
 * following conditions are met:                                       *
 *                                                                     *
 *     * Redistributions of source code must retain the                *
 *     above copyright notice, this list of conditions and             *
 *     the following disclaimer.                                       *
 *                                                                     *
 *     * Redistributions in binary form must reproduce the             *
 *     above copyright notice, this list of conditions and             *
 *     the following disclaimer in the documentation and/or            *
 *     other materials provided with the distribution.                 *
 *                                                                     *
 *     * Neither the name of Paul Mineiro nor the names                *
 *     of other contributors may be used to endorse or promote         *
 *     products derived from this software without specific            *
 *     prior written permission.                                       *
 *                                                                     *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND              *
 * CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,         *
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES               *
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE             *
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER               *
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                 *
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES            *
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE           *
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR                *
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF          *
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT           *
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY              *
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE             *
 * POSSIBILITY OF SUCH DAMAGE.                                         *
 *                                                                     *
 * Contact: Paul Mineiro <paul@mineiro.com>                            *
 *=====================================================================*/

//
// This is a modified, JS translated subset of https://code.google.com/p/fastapprox/
//
// fastersin/fastercos only deal with x in -pi to pi.
// fasterexp (not present in original code in this form) works only for x >= 0
//
// In testing, under V8/node. These methods are twice as fast as the inbuilt Math ones.
//

var FastMath = (function ()
{
    var f = new Float32Array(1);
    var b = new Uint32Array(f.buffer);

    var FastMath = {};

    // Precondition: p >= 0 && p <= 88
    //
    // Nature of error:
    //
    // FastMath.exp will never return a value < 1 (for valid p)
    // FastMath.exp will remain within approximately 2% of Math.exp (for valid p)
    FastMath.exp = function FastMathExp(p)
    {
        b[0] = 1064872507.1541044 + (12102203.15410432 * p);
        return f[0] + 0.028652489185333252;
    };

    // Precondition, x in -pi to pi
    //
    // Nature of error:
    //
    // FastMath.cos will never return values outside of [-1, 1] (for valid p)
    // FastMath.cos will remain with approximately 1% of Math.cos (for valid p)
    FastMath.cos = function FastMathCos(x)
    {
        x += 1.57079632;
        if (x > 3.14159265)
        {
            x -= 6.28318531;
        }
        f[0] = x;
        var sign = b[0] & 0x80000000;
        b[0] &= 0x7fffffff;
        var q = 1.2732395447351627 * x - 0.40528473456935109 * x * f[0];
        f[0] = 0.22308510060189463;
        b[0] |= sign;
        return q * (0.77633023248007499 + f[0] * q);
    };

    // Precondition, x in -pi to pi
    //
    // Nature of error:
    //
    // FastMath.sin will never return values outside of [-1, 1] (for valid p)
    // FastMath.sin will remain with approximately 1% of Math.sin (for valid p)
    FastMath.sin = function FastMathSin(x)
    {
        f[0] = x;
        var sign = b[0] & 0x80000000;
        b[0] &= 0x7fffffff;
        var q = 1.2732395447351627 * x - 0.40528473456935109 * x * f[0];
        f[0] = 0.22308510060189463;
        b[0] |= sign;
        return q * (0.77633023248007499 + f[0] * q);
    };

    return FastMath;
})();

if (typeof module !== "undefined" && module.exports)
{
    module.exports = FastMath;
}
