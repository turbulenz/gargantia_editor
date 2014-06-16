// Copyright (c) 2012-2014 Turbulenz Limited
// Complains in various parts about use of (/*NAME*/value) constants.
/*global
Float32Array: false
Uint16Array: false
BoxTree: false
*/
"use strict";
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
//
// Physics2D Configuration
//
var Physics2DConfig = {
    // (Contact Physics)
    // Amount of slop permitted in contact penetration
    CONTACT_SLOP: 0.01,
    EFF_MASS_EPSILON: 1e-10,
    ILL_THRESHOLD: 1e5,
    CLIP_EPSILON: 1.65e-10,
    // Configuration of bias coeffecient computation
    // for percentage of error to resolve per-frame.
    BIAS_COEF: 0.15,
    STATIC_BIAS_COEF: 0.75,
    CONT_BIAS_COEF: 0.5,
    CONT_STATIC_BIAS_COEF: 0.6,
    // Bounce-target-velocity at contact below this value
    // will cause bouncing to be ignored.
    BOUNCE_VELOCITY_THRESHOLD: 0.25,
    // Threshold at which static friction takes over from
    // dynamic.
    STATIC_FRIC_SQ_EPSILON: 1e-4,
    // ================================================
    // (Constraint physics)
    // Point
    // -----------
    // Percentage of error solved per-iteration
    POINT_BIAS_COEF: 0.5,
    // Maximum error to be resolved per-iteration
    POINT_MAX_ERROR: 0.2,
    POINT_MAX_ERROR_SQ: (0.2 * 0.2),
    POINT_SLOP_SQ: 1e-6,
    // Squared error to consider error too large
    // to solve properly.
    POINT_LARGE_ERROR_SQ: 0.01,
    // Percentage of error solved per-iteration in large error case
    POINT_LARGE_ERROR_BIAS: 0.75,
    // Maximum error to be resolve per-iteration in large error case
    POINT_LARGE_ERROR_MAX: 0.4,
    // Weld
    // ----
    // Percentage of error solved per-iteration
    WELD_BIAS_COEF: 0.5,
    // Maximum error to be resolved per-iteration
    WELD_MAX_LINEAR_ERROR: 0.2,
    WELD_MAX_ANGULAR_ERROR: 0.5,
    WELD_MAX_LINEAR_ERROR_SQ: (0.2 * 0.2),
    WELD_LINEAR_SLOP_SQ: 1e-6,
    WELD_ANGULAR_SLOP_SQ: 1e-6,
    // Squared error to consider error too large
    // to solve properly.
    WELD_LARGE_ERROR_SQ: 0.01,
    // Percentage of linear error solved per-iteration in large error case
    WELD_LARGE_ERROR_BIAS: 0.75,
    // Maximum linear error to be resolve per-iteration in large error case
    WELD_LARGE_ERROR_MAX: 0.4,
    // Angle
    // -----
    // Percentage of error solved per-iteration
    ANGLE_BIAS_COEF: 0.5,
    ANGLE_SLOP_SQ: 1e-6,
    // Distance
    // --------
    // Percentage of error solved per-iteration
    DIST_BIAS_COEF: 0.5,
    DIST_SLOP_SQ: 1e-6,
    // Squared error to consider error too large
    // to solve properly.
    DIST_LARGE_ERROR_SQ: 0.01,
    // Percentage of error to solve per-iteration in large error case
    DIST_LARGE_ERROR_BIAS: 0.75,
    // Line
    // ----
    // Percentage of error solved per-iteration
    LINE_BIAS_COEF: 0.8,
    LINE_SLOP_SQ: 1e-6,
    // Squared error to consider error too large
    // to solve properly.
    LINE_LARGE_ERROR_SQ: 0.01,
    // Percentage of error to solve per-iteration in large error case
    LINE_LARGE_ERROR_BIAS: 0.9,
    // Pulley
    // --------
    // Percentage of error solved per-iteration
    PULLEY_BIAS_COEF: 0.5,
    PULLEY_SLOP_SQ: 1e-6,
    // Squared error to consider error too large
    // to solve properly.
    PULLEY_LARGE_ERROR_SQ: 0.01,
    // Percentage of error to solve per-iteration in large error case
    PULLEY_LARGE_ERROR_BIAS: 0.75,
    // ================================================
    // (Continuous collisions)
    // Percentage of body radius body must move through.
    MIN_LINEAR_STATIC_SWEEP: 0.05,
    MIN_ANGULAR_STATIC_SWEEP: 0.005,
    MIN_LINEAR_BULLET_SWEEP: 0.5,
    MIN_ANGULAR_BULLET_SWEEP: 0.05,
    // Accuracy threshold for sweeps on distance.
    SWEEP_LIMIT: 0.0005,
    // Amount of slop permitted in a continuous collision.
    SWEEP_SLOP: 0.05,
    // Minimum fractional TOI-alpha advancement
    MINIMUM_SWEEP_ADVANCE: 1e-6,
    // Maximum sub-steps in sweep
    MAX_SWEEP_ITER: 50,
    // Squared relative velocity in dynamic sweeps to ignore pair
    EQUAL_SQ_VEL: 0.2,
    // Sum of angular-velocity * radius for pair of shapes to ignore pair in dynamic sweeps.
    ZERO_ANG_BIAS: 0.02,
    // Scale factor for angular velocity when TOI has been permitted to slip.
    // This helps prevent an object getting 'stuck' for a few steps when in
    // a fast rotating continuous set of collisions at one point.
    TOI_SLIP_SCALE: 0.75,
    // ================================================
    // (Arbiter/Contact persistance)
    // Number of simulation steps before inactive arbiter is killed.
    DELAYED_DEATH: 30,
    // ================================================
    // (Body integration)
    DELTA_ROTATION_EPSILON: 1e-4,
    // ================================================
    // (Sleeping)
    SLEEP_DELAY: 60,
    // squared linear velocity for sleeping
    SLEEP_LINEAR_SQ: 0.0006,
    // squared tangent velocity for sleeping (body radius taken into account)
    SLEEP_ANGULAR_SQ: 0.001,
    // ================================================
    // (Point containment)
    CONTAINS_EPSILON: 1e-6,
    CONTAINS_SQ_EPSILON: 1e-12,
    // ================================================
    // (General)
    COLLINEAR_EPSILON: 1e-5,
    COLLINEAR_SQ_EPSILON: (1e-5 * 1e-5),
    NORMALIZE_EPSILON: 1e-6,
    NORMALIZE_SQ_EPSILON: (1e-6 * 1e-6)
};

;
var Physics2DMaterial = (function () {
    function Physics2DMaterial() {
    }
    Physics2DMaterial.prototype.getElasticity = function () {
        return this._data[(0)];
    };

    Physics2DMaterial.prototype.getStaticFriction = function () {
        return this._data[(1)];
    };

    Physics2DMaterial.prototype.getDynamicFriction = function () {
        return this._data[(2)];
    };

    Physics2DMaterial.prototype.getRollingFriction = function () {
        return this._data[(3)];
    };

    Physics2DMaterial.prototype.getDensity = function () {
        return this._data[(4)];
    };

    Physics2DMaterial.create = // params = {
    //    elasticity: ## = 0,
    //    staticFriction: ## = 2,
    //    dynamicFriction: ## = 1,
    //    rollingFriction: ## = 0.005,
    //    density: ## = 1,
    //    userData: null
    // }
    function (params) {
        var m = new Physics2DMaterial();
        var elasticity = (params && params.elasticity !== undefined ? params.elasticity : 0);
        var staticFriction = (params && params.staticFriction !== undefined ? params.staticFriction : 2);
        var dynamicFriction = (params && params.dynamicFriction !== undefined ? params.dynamicFriction : 1);
        var rollingFriction = (params && params.rollingFriction !== undefined ? params.rollingFriction : 0.005);
        var density = (params && params.density !== undefined ? params.density : 1);

        var data = m._data = new Physics2DDevice.prototype.floatArray((5));

        data[(0)] = elasticity;
        data[(1)] = staticFriction;
        data[(2)] = dynamicFriction;
        data[(3)] = rollingFriction;
        data[(4)] = density;

        m.userData = (params && params.userData ? params.userData : null);

        return m;
    };
    Physics2DMaterial.version = 1;
    return Physics2DMaterial;
})();

var Physics2DConstraint = (function () {
    function Physics2DConstraint() {
    }
    // Abstract methods to be overridden by subclasses
    Physics2DConstraint.prototype._inWorld = function () {
        debug.abort("abstract method");
    };
    Physics2DConstraint.prototype._outWorld = function () {
        debug.abort("abstract method");
    };
    Physics2DConstraint.prototype._pairExists = function (b1, b2) {
        debug.abort("abstract method");
        return false;
    };
    Physics2DConstraint.prototype._wakeConnected = function () {
        debug.abort("abstract method");
    };
    Physics2DConstraint.prototype._sleepComputation = function (union) {
        debug.abort("abstract method");
    };
    Physics2DConstraint.prototype._preStep = function (deltaTime) {
        debug.abort("abstract method");
        return false;
    };
    Physics2DConstraint.prototype._warmStart = function () {
        debug.abort("abstract method");
    };
    Physics2DConstraint.prototype._iterateVel = function () {
        debug.abort("abstract method");
        return false;
    };
    Physics2DConstraint.prototype._iteratePos = function () {
        debug.abort("abstract method");
        return false;
    };

    Physics2DConstraint.prototype.init = function (con, params) {
        var data = con._data;
        data[(0)] = (params.frequency !== undefined ? params.frequency : 10.0);
        data[(1)] = (params.damping !== undefined ? params.damping : 1.0);
        data[(2)] = (params.maxForce !== undefined ? params.maxForce : Number.POSITIVE_INFINITY);
        data[(3)] = (params.maxError !== undefined ? params.maxError : Number.POSITIVE_INFINITY);
        data[(4)] = -1;

        con._removeOnBreak = (params.removeOnBreak !== undefined ? params.removeOnBreak : true);
        con._breakUnderError = (params.breakUnderError !== undefined ? params.breakUnderError : false);
        con._breakUnderForce = (params.breakUnderForce !== undefined ? params.breakUnderForce : false);
        con._stiff = (params.stiff !== undefined ? params.stiff : true);
        con._ignoreInteractions = (params.ignoreInteractions !== undefined ? params.ignoreInteractions : false);
        con.sleeping = (params.sleeping !== undefined ? params.sleeping : false);
        con._active = (params.disabled !== undefined ? (!params.disabled) : true);

        con.world = null;
        con._islandRoot = null;
        con._islandRank = 0;
        con._island = null;
        con._isBody = false;

        con._wakeTime = 0;

        con._onBreak = [];
        con._onWake = [];
        con._onSleep = [];

        con.userData = (params.userData || null);
    };

    Physics2DConstraint.prototype.configure = function (params) {
        var data = this._data;
        if (params.frequency !== undefined) {
            data[(0)] = params.frequency;
        }
        if (params.damping !== undefined) {
            data[(1)] = params.damping;
        }
        if (params.maxForce !== undefined) {
            data[(2)] = params.maxForce;
        }
        if (params.maxError !== undefined) {
            data[(3)] = params.maxError;
        }
        if (params.removeOnBreak !== undefined) {
            this._removeOnBreak = params.removeOnBreak;
        }
        if (params.breakUnderError !== undefined) {
            this._breakUnderError = params.breakUnderError;
        }
        if (params.breakUnderForce !== undefined) {
            this._breakUnderForce = params.breakUnderForce;
        }
        if (params.ignoreInteractions !== undefined) {
            this._ignoreInteractions = params.ignoreInteractions;
        }
        if (params.stiff !== undefined) {
            this._stiff = params.stiff;
        }
        this.wake(true);
    };

    // ===============================================
    Physics2DConstraint.prototype.addEventListener = function (eventType, callback) {
        var events = (eventType === 'wake' ? this._onWake : eventType === 'sleep' ? this._onSleep : eventType === 'break' ? this._onBreak : null);

        if (events === null) {
            return false;
        }

        var index = events.indexOf(callback);
        if (index !== -1) {
            return false;
        }

        events.push(callback);

        this.wake();

        return true;
    };

    Physics2DConstraint.prototype.removeEventListener = function (eventType, callback) {
        var events = (eventType === 'wake' ? this._onWake : eventType === 'sleep' ? this._onSleep : eventType === 'break' ? this._onBreak : null);

        if (events === null) {
            return false;
        }

        var index = events.indexOf(callback);
        if (index === -1) {
            return false;
        }

        // Need to keep order, cannot use swap-pop
        events.splice(index, 1);

        this.wake();

        return true;
    };

    // ===============================================
    Physics2DConstraint.prototype.wake = function (automated) {
        if (!this.world) {
            this.sleeping = false;
            return;
        }

        this.world._wakeConstraint(this, !automated);
    };
    Physics2DConstraint.prototype.sleep = function () {
        if (!this.world) {
            this.sleeping = true;
            return;
        }

        this.world._forceSleepConstraint(this);
    };

    // ================================================
    Physics2DConstraint.prototype.isEnabled = function () {
        return this._active;
    };

    Physics2DConstraint.prototype.isDisabled = function () {
        return (!this._active);
    };

    Physics2DConstraint.prototype.enable = function () {
        if (!this._active) {
            this._active = true;
            if (this.world) {
                this.world._enabledConstraint(this);
                this.wake(true);
            }
        }
    };

    Physics2DConstraint.prototype.disable = function () {
        if (this._active) {
            if (this.world) {
                // Emulate a non-automated wake
                // to prevent wake callback.
                this.wake(false);
                this.world._disabledConstraint(this);
            }
            this._active = false;
        }
    };

    // ================================================
    Physics2DConstraint.prototype.getAnchorA = function (dst) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        var INDEX = this._ANCHOR_A;
        dst[0] = data[INDEX];
        dst[1] = data[INDEX + 1];
        return dst;
    };
    Physics2DConstraint.prototype.getAnchorB = function (dst) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        var INDEX = this._ANCHOR_B;
        dst[0] = data[INDEX];
        dst[1] = data[INDEX + 1];
        return dst;
    };

    Physics2DConstraint.prototype.setAnchorA = function (anchor) {
        var data = this._data;
        var INDEX = this._ANCHOR_A;
        var newX = anchor[0];
        var newY = anchor[1];
        if (newX !== data[INDEX] || newY !== data[INDEX + 1]) {
            data[INDEX] = newX;
            data[INDEX + 1] = newY;
            this.wake(true);
        }
    };
    Physics2DConstraint.prototype.setAnchorB = function (anchor) {
        var data = this._data;
        var INDEX = this._ANCHOR_B;
        var newX = anchor[0];
        var newY = anchor[1];
        if (newX !== data[INDEX] || newY !== data[INDEX + 1]) {
            data[INDEX] = newX;
            data[INDEX + 1] = newY;
            this.wake(true);
        }
    };

    Physics2DConstraint.prototype.rotateAnchor = function (data/*floatArray*/ , body, LOCAL, RELATIVE) {
        var x = data[LOCAL];
        var y = data[LOCAL + 1];
        var cos = body[(5)];
        var sin = body[(5) + 1];

        data[RELATIVE] = ((cos * x) - (sin * y));
        data[RELATIVE + 1] = ((sin * x) + (cos * y));
    };

    // ================================================
    Physics2DConstraint.prototype.dtRatio = function (data/*floatArray*/ , deltaTime) {
        var preDt = data[(4)];
        var dtRatio = (preDt === -1 ? 1.0 : (deltaTime / preDt));
        data[(4)] = deltaTime;
        return dtRatio;
    };

    // ================================================
    Physics2DConstraint.prototype.twoBodyInWorld = function () {
        this.bodyA.constraints.push(this);
        this.bodyB.constraints.push(this);
    };

    Physics2DConstraint.prototype.twoBodyOutWorld = function () {
        var constraints = this.bodyA.constraints;
        var index = constraints.indexOf(this);
        constraints[index] = constraints[constraints.length - 1];
        constraints.pop();

        constraints = this.bodyB.constraints;
        index = constraints.indexOf(this);
        constraints[index] = constraints[constraints.length - 1];
        constraints.pop();
    };

    Physics2DConstraint.prototype.twoBodyPairExists = function (b1, b2) {
        return ((b1 === this.bodyA && b2 === this.bodyB) || (b2 === this.bodyA && b1 === this.bodyB));
    };

    Physics2DConstraint.prototype.twoBodyWakeConnected = function () {
        var body = this.bodyA;
        if (body._type === (0)) {
            body.wake(true);
        }

        body = this.bodyB;
        if (body._type === (0)) {
            body.wake(true);
        }
    };

    Physics2DConstraint.prototype.twoBodySleepComputation = function (union) {
        var body = this.bodyA;
        if (body._type === (0)) {
            union(body, this);
        }

        body = this.bodyB;
        if (body._type === (0)) {
            union(body, this);
        }
    };

    // ================================================
    Physics2DConstraint.prototype._clearCache = function () {
        debug.abort("abstract method");
    };

    Physics2DConstraint.prototype.clearCache = function () {
        var data = this._data;
        data[this._JACC] = 0;
        data[(4)] = -1;
    };
    Physics2DConstraint.prototype.clearCache2 = function () {
        var data = this._data;
        var INDEX = this._JACC;
        data[INDEX] = data[INDEX + 1] = 0;
        data[(4)] = -1;
    };
    Physics2DConstraint.prototype.clearCache3 = function () {
        var data = this._data;
        var INDEX = this._JACC;
        data[INDEX] = data[INDEX + 1] = data[INDEX + 2] = 0;
        data[(4)] = -1;
    };

    // ================================================
    // Soft constraint parameter logic.
    // storing gamma at index GAMMA
    // scaling effective mass at KMASS
    // scaling bias at BIAS
    // and returning true if constraint was broken.
    Physics2DConstraint.prototype.soft_params = function (data/*floatArray*/ , KMASS, GAMMA, BIAS, deltaTime, breakUnderError) {
        var bias = data[BIAS];
        var bsq = (bias * bias);
        var maxError = data[(3)];
        if (breakUnderError && (bsq > (maxError * maxError))) {
            return true;
        }

        var omega = (2 * Math.PI * data[(0)]);
        var gamma = (1 / (deltaTime * omega * ((2 * data[(1)]) + (omega * deltaTime))));
        var iG = (1 / (1 + gamma));
        var biasCoef = (deltaTime * omega * omega * gamma);

        data[GAMMA] = (gamma * iG);
        data[KMASS] *= iG;

        bias *= biasCoef;
        bsq *= (biasCoef * biasCoef);
        if (bsq > (maxError * maxError)) {
            bsq = (maxError / Math.sqrt(bsq));
            bias *= bsq;
        }
        data[BIAS] = bias;
        return false;
    };
    Physics2DConstraint.prototype.soft_params2 = function (data/*floatArray*/ , KMASS, GAMMA, BIAS, deltaTime, breakUnderError) {
        var biasX = data[BIAS];
        var biasY = data[BIAS + 1];
        var bsq = ((biasX * biasX) + (biasY * biasY));
        var maxError = data[(3)];
        if (breakUnderError && (bsq > (maxError * maxError))) {
            return true;
        }

        var omega = (2 * Math.PI * data[(0)]);
        var gamma = (1 / (deltaTime * omega * ((2 * data[(1)]) + (omega * deltaTime))));
        var iG = (1 / (1 + gamma));
        var biasCoef = (deltaTime * omega * omega * gamma);

        data[GAMMA] = (gamma * iG);
        data[KMASS] *= iG;
        data[KMASS + 1] *= iG;
        data[KMASS + 2] *= iG;

        biasX *= biasCoef;
        biasY *= biasCoef;
        bsq *= (biasCoef * biasCoef);
        if (bsq > (maxError * maxError)) {
            bsq = (maxError / Math.sqrt(bsq));
            biasX *= bsq;
            biasY *= bsq;
        }
        data[BIAS] = biasX;
        data[BIAS + 1] = biasY;
        return false;
    };
    Physics2DConstraint.prototype.soft_params3 = function (data/*floatArray*/ , KMASS, GAMMA, BIAS, deltaTime, breakUnderError) {
        var biasX = data[BIAS];
        var biasY = data[BIAS + 1];
        var biasZ = data[BIAS + 2];
        var bsq = ((biasX * biasX) + (biasY * biasY) + (biasZ * biasZ));
        var maxError = data[(3)];
        if (breakUnderError && (bsq > (maxError * maxError))) {
            return true;
        }

        var omega = (2 * Math.PI * data[(0)]);
        var gamma = (1 / (deltaTime * omega * ((2 * data[(1)]) + (omega * deltaTime))));
        var iG = (1 / (1 + gamma));
        var biasCoef = (deltaTime * omega * omega * gamma);

        data[GAMMA] = (gamma * iG);
        data[KMASS] *= iG;
        data[KMASS + 1] *= iG;
        data[KMASS + 2] *= iG;
        data[KMASS + 3] *= iG;
        data[KMASS + 4] *= iG;
        data[KMASS + 5] *= iG;

        biasX *= biasCoef;
        biasY *= biasCoef;
        biasZ *= biasCoef;
        bsq *= (biasCoef * biasCoef);
        if (bsq > (maxError * maxError)) {
            bsq = (maxError / Math.sqrt(bsq));
            biasX *= bsq;
            biasY *= bsq;
            biasZ *= bsq;
        }
        data[BIAS] = biasX;
        data[BIAS + 1] = biasY;
        data[BIAS + 2] = biasZ;
        return false;
    };

    // Solve K * j = err, permitting degeneracies in K
    // indices JMASS, ERR, IMP
    // ERR may be equal to IMP.
    Physics2DConstraint.prototype.safe_solve = function (data/*floatArray*/ , KMASS, ERR, IMP) {
        var err = data[ERR];
        var K = data[KMASS];
        data[IMP] = (K !== 0 ? (err / K) : 0);
    };
    Physics2DConstraint.prototype.safe_solve2 = function (data/*floatArray*/ , KMASS, ERR, IMP) {
        var errX = data[ERR];
        var errY = data[ERR + 1];

        var Ka = data[KMASS];
        var Kb = data[KMASS + 1];
        var Kc = data[KMASS + 2];
        var det = ((Ka * Kc) - (Kb * Kb));
        if (det === 0) {
            // Consider ranks seperately.
            data[IMP] = (Ka !== 0 ? (errX / Ka) : 0);
            data[IMP + 1] = (Kc !== 0 ? (errY / Kc) : 0);
        } else {
            // Full matrix inversion.
            det = (1 / det);
            data[IMP] = (det * ((Kc * errX) - (Kb * errY)));
            data[IMP + 1] = (det * ((Ka * errY) - (Kb * errX)));
        }
    };
    Physics2DConstraint.prototype.safe_solve3 = function (data/*floatArray*/ , KMASS, ERR, IMP) {
        var errX = data[ERR];
        var errY = data[ERR + 1];
        var errZ = data[ERR + 2];

        var Ka = data[KMASS];
        var Kb = data[KMASS + 1];
        var Kc = data[KMASS + 2];
        var Kd = data[KMASS + 3];
        var Ke = data[KMASS + 4];
        var Kf = data[KMASS + 5];

        var A = ((Kd * Kf) - (Ke * Ke));
        var B = ((Kc * Ke) - (Kb * Kf));
        var C = ((Kb * Ke) - (Kc * Kd));
        var det = ((Ka * A) + (Kb * B) + (Kc * C));
        if (det === 0) {
            det = ((Ka * Kd) - (Kb * Kb));
            if (det !== 0) {
                // Invert matrix ignoring bottom rank.
                // [Ka Kb #]
                // [Kb Kd #]
                // [#  #  #]
                det = (1 / det);
                data[IMP] = (det * ((Kd * errX) - (Kb * errY)));
                data[IMP + 1] = (det * ((Ka * errY) - (Kb * errX)));
                data[IMP + 2] = (Kf !== 0 ? (errZ / Kf) : 0);
                return;
            }

            det = ((Ka * Kf) - (Kc * Kc));
            if (det !== 0) {
                // Invert matrix ignoring bottom rank.
                // [Ka # Kc]
                // [#  #  #]
                // [Kc # Kf]
                det = (1 / det);
                data[IMP] = (det * ((Kf * errX) - (Kc * errZ)));
                data[IMP + 1] = (Kd !== 0 ? (errY / Kd) : 0);
                data[IMP + 2] = (det * ((Ka * errZ) - (Kc * errX)));
                return;
            }

            det = ((Kd * Kf) - (Ke * Ke));
            if (det !== 0) {
                // Invert matrix ignoring top rank
                // [#  #  #]
                // [# Kd Ke]
                // [# Ke Kf]
                det = (1 / det);
                data[IMP] = (Ka !== 0 ? (errX / Ka) : 0);
                data[IMP + 1] = (det * ((Kf * errY) - (Ke * errZ)));
                data[IMP + 2] = (det * ((Kd * errZ) - (Ke * errY)));
                return;
            }

            // Consider all ranks seperately.
            data[IMP] = (Ka !== 0 ? (errX / Ka) : 0);
            data[IMP + 1] = (Kd !== 0 ? (errY / Kd) : 0);
            data[IMP + 2] = (Kf !== 0 ? (errZ / Kf) : 0);
        } else {
            // Full matrix inversion.
            det = (1 / det);
            var D = ((Ka * Kf) - (Kc * Kc));
            var E = ((Kb * Kc) - (Ka * Ke));
            var F = ((Ka * Kd) - (Kb * Kb));
            data[IMP] = (det * ((A * errX) + (B * errY) + (C * errZ)));
            data[IMP + 1] = (det * ((B * errX) + (D * errY) + (E * errZ)));
            data[IMP + 2] = (det * ((C * errX) + (E * errY) + (F * errZ)));
        }
    };

    // Invert matrix stored symmetrically in data at
    // indices KMASS
    // with accumulated impulse at indices JACC
    Physics2DConstraint.prototype.safe_invert = function (data/*floatArray*/ , KMASS, JACC) {
        // Invert [K != 0] into [1 / K]
        // And otherwise into [0] with zero-ed JACC
        var K = data[KMASS];
        if (K === 0) {
            data[JACC] = 0;
        } else {
            data[KMASS] = (1 / K);
        }
    };
    Physics2DConstraint.prototype.safe_invert2 = function (data/*floatArray*/ , KMASS, JACC) {
        var Ka = data[KMASS];
        var Kb = data[KMASS + 1];
        var Kc = data[KMASS + 2];

        var det = ((Ka * Kc) - (Kb * Kb));
        if (det === 0) {
            if (Ka !== 0) {
                data[KMASS] = (1 / Ka);
            } else {
                data[JACC] = 0.0;
            }

            if (Kc !== 0) {
                data[KMASS + 2] = (1 / Kc);
            } else {
                data[JACC + 1] = 0.0;
            }

            data[KMASS + 1] = 0.0;
        } else {
            // Full matrix inversion.
            det = (1 / det);
            data[KMASS] = (det * Kc);
            data[KMASS + 1] = (det * -Kb);
            data[KMASS + 2] = (det * Ka);
        }
    };
    Physics2DConstraint.prototype.safe_invert3 = function (data/*floatArray*/ , KMASS, JACC) {
        var Ka = data[KMASS];
        var Kb = data[KMASS + 1];
        var Kc = data[KMASS + 2];
        var Kd = data[KMASS + 3];
        var Ke = data[KMASS + 4];
        var Kf = data[KMASS + 5];

        var A = ((Kd * Kf) - (Ke * Ke));
        var B = ((Kc * Ke) - (Kb * Kf));
        var C = ((Kb * Ke) - (Kc * Kd));
        var det = ((Ka * A) + (Kb * B) + (Kc * C));
        if (det === 0) {
            det = ((Ka * Kd) - (Kb * Kb));
            if (det !== 0) {
                // Invert matrix ignoring bottom rank
                // [Ka Kb #]
                // [Kb Kd #]
                // [#  #  #]
                det = (1 / det);
                data[KMASS] = (det * Kd);
                data[KMASS + 1] = (det * -Kb);
                data[KMASS + 3] = (det * Ka);

                if (Kf !== 0) {
                    data[KMASS + 5] = (1 / Kf);
                } else {
                    data[JACC + 2] = 0;
                }

                data[KMASS + 2] = data[KMASS + 4] = 0;
                return;
            }

            det = ((Ka * Kf) - (Kc * Kc));
            if (det !== 0) {
                // Invert matrix ignoring middle rank
                // [Ka # Kc]
                // [#  #  #]
                // [Kc # Kf]
                det = (1 / det);
                data[KMASS] = (det * Kf);
                data[KMASS + 2] = (det * -Kc);
                data[KMASS + 5] = (det * Ka);

                if (Kd !== 0) {
                    data[KMASS + 3] = (1 / Kd);
                } else {
                    data[JACC + 1] = 0;
                }

                data[KMASS + 1] = data[KMASS + 4] = 0;
                return;
            }

            det = ((Kd * Kf) - (Ke * Ke));
            if (det !== 0) {
                // Invert matrix ignoring top rank
                // [#  #  #]
                // [# Kd Ke]
                // [# Ke Kf]
                det = (1 / det);
                data[KMASS + 3] = (det * Kf);
                data[KMASS + 4] = (det * -Ke);
                data[KMASS + 5] = (det * Kd);

                if (Ka !== 0) {
                    data[KMASS] = (1 / Ka);
                } else {
                    data[JACC] = 0;
                }

                data[KMASS + 1] = data[KMASS + 2] = 0;
                return;
            }

            if (Ka !== 0) {
                data[KMASS] = (1 / Ka);
            } else {
                data[JACC] = 0;
            }

            if (Kd !== 0) {
                data[KMASS + 3] = (1 / Kd);
            } else {
                data[JACC + 1] = 0;
            }

            if (Kf !== 0) {
                data[KMASS + 5] = (1 / Kf);
            } else {
                data[JACC + 2] = 0;
            }

            data[KMASS + 1] = data[KMASS + 2] = data[KMASS + 4] = 0;
        } else {
            // Full matrix inversion.
            det = (1 / det);
            data[KMASS] = (det * A);
            data[KMASS + 1] = (det * B);
            data[KMASS + 2] = (det * C);
            data[KMASS + 3] = (det * ((Ka * Kf) - (Kc * Kc)));
            data[KMASS + 4] = (det * ((Kb * Kc) - (Ka * Ke)));
            data[KMASS + 5] = (det * ((Ka * Kd) - (Kb * Kb)));
        }
    };
    return Physics2DConstraint;
})();

// =========================================================================
//
// Custom Constraint
//
// CUSTOM DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*CUSTOM_JMAX*/5
///*CUSTOM_GAMMA*/6
var Physics2DCustomConstraint = (function (_super) {
    __extends(Physics2DCustomConstraint, _super);
    function Physics2DCustomConstraint() {
        _super.apply(this, arguments);
        this.type = "CUSTOM";
    }
    // ===============================================
    Physics2DCustomConstraint.prototype._inWorld = function () {
        var bodies = this.bodies;
        var limit = bodies.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            bodies[i].constraints.push(this);
        }
    };

    Physics2DCustomConstraint.prototype._outWorld = function () {
        var bodies = this.bodies;
        var limit = bodies.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var constraints = bodies[i].constraints;
            var index = constraints.indexOf(this);
            constraints[index] = constraints[constraints.length - 1];
            constraints.pop();
        }
    };

    Physics2DCustomConstraint.prototype._pairExists = function (b1, b2) {
        var bodies = this.bodies;
        var limit = bodies.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var bodyA = bodies[i];
            if (bodyA === b1 || bodyA === b2) {
                var j;
                for (j = (i + 1); j < limit; j += 1) {
                    var bodyB = bodies[j];
                    if ((bodyA === b1 && bodyB === b2) || (bodyA === b2 && bodyB === b1)) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    Physics2DCustomConstraint.prototype._wakeConnected = function () {
        var bodies = this.bodies;
        var limit = bodies.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var body = bodies[i];
            if (body._type === (0)) {
                body.wake(true);
            }
        }
    };

    Physics2DCustomConstraint.prototype._sleepComputation = function (union) {
        var bodies = this.bodies;
        var limit = bodies.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var body = bodies[i];
            if (body._type === (0)) {
                union(body, this);
            }
        }
    };

    // =====================================================
    Physics2DCustomConstraint.prototype._clearCache = function () {
        var data = this._data;

        var J_ACC = this._J_ACC;
        var limit = (J_ACC + this.dimension);
        var i;
        for (i = J_ACC; i < limit; i += 1) {
            data[i] = 0;
        }

        data[(4)] = -1;
    };

    // Compute cholesky decomposition of A into
    // lower triangular matrix L. A stored
    // as symmetric matrix. and L a full matrix
    // for ease of computation.
    Physics2DCustomConstraint.prototype._cholesky = function () {
        var data = this._data;
        var A = this._K_MASS;
        var L = this._K_CHOLESKY;
        var dim = this.dimension;

        var j;
        for (j = 0; j < dim; j += 1) {
            var sum = 0;
            var k;
            for (k = 0; k <= (j - 1); k += 1) {
                var Lval = data[L + (j * dim) + k];
                sum += (Lval * Lval);
            }

            var rec = data[A] - sum;
            var zeroRank = (rec <= 0);
            if (zeroRank) {
                rec = data[A];
            }
            rec = (rec <= 0 ? 0 : Math.sqrt(rec));
            A += 1;
            data[L + (j * dim) + j] = rec;

            var i;
            if (rec !== 0 && !zeroRank) {
                rec = (1 / rec);
                for (i = (j + 1); i < dim; i += 1) {
                    sum = 0;
                    for (k = 0; k <= (j - 1); k += 1) {
                        sum += (data[L + (i * dim) + k] * data[L + (j * dim) + k]);
                    }
                    data[L + (i * dim) + j] = rec * (data[A] - sum);
                    A += 1;
                }
            }

            if (zeroRank) {
                for (i = (j + 1); i < dim; i += 1) {
                    data[L + (i * dim) + j] = 0;
                }
                for (i = 0; i < j; i += 1) {
                    data[L + (j * dim) + i] = 0;
                }
                A += (dim - j - 1);
            }
        }
    };

    // Perform multiplication with inverse of eff-mass matrix.
    // X = (LL^T)^-1 * X for L = CHOLESKY
    Physics2DCustomConstraint.prototype._transform = function (X/*floatArray*/ ) {
        var data = this._data;
        var Y = this._VECTOR_TMP;
        var L = this._K_CHOLESKY;
        var dim = this.dimension;

        // Y = (L^-1) * X
        var i, lii, sum, k;
        for (i = 0; i < dim; i += 1) {
            sum = data[X + i];
            lii = data[L + (i * dim) + i];
            if (lii !== 0) {
                for (k = 0; k < i; k += 1) {
                    sum -= data[L + (i * dim) + k] * data[Y + k];
                }
                data[Y + i] = (sum / lii);
            } else {
                data[Y + i] = 0;
            }
        }

        // X = (L^T)^-1 * Y
        var ix;
        for (ix = 0; ix < dim; ix += 1) {
            i = (dim - 1 - ix);
            lii = data[L + (i * dim) + i];
            if (lii !== 0) {
                sum = data[Y + i];
                for (k = (i + 1); k < dim; k += 1) {
                    sum -= data[L + (k * dim) + i] * data[X + k];
                }
                data[X + i] = (sum / lii);
            } else {
                data[X + i] = 0;
            }
        }
    };

    Physics2DCustomConstraint.prototype._effMass = function () {
        var data = this._data;
        var dimension = this.dimension;
        var bodies = this.bodies;
        var limit = bodies.length;
        var length = (limit * 3);

        // Compute non-inverted effective mass
        var JAC = this._JACOBIAN;
        var KMASS = this._K_MASS;
        var i, j, k;
        for (i = 0; i < dimension; i += 1) {
            var JACI = (JAC + (i * length));
            for (j = i; j < dimension; j += 1) {
                var JACJ = (JAC + (j * length));
                var sum = 0;
                for (k = 0; k < limit; k += 1) {
                    var body = bodies[k]._data;
                    var k3 = (k * 3);
                    sum += (body[(0)] * ((data[JACI + k3] * data[JACJ + k3]) + (data[JACI + k3 + 1] * data[JACJ + k3 + 1])));
                    sum += (body[(1)] * (data[JACI + k3 + 2] * data[JACJ + k3 + 2]));
                }
                data[KMASS] = sum;
                KMASS += 1;
            }
        }
    };

    Physics2DCustomConstraint.prototype._preStep = function (deltaTime) {
        var dimension = this.dimension;
        var data = this._data;
        var i, limit;

        if (this._posConsts) {
            this._posConsts.call(this);
        }

        var JAC = this._JACOBIAN;
        var K_CHOLESKY = this._K_CHOLESKY;
        var BIAS = this._BIAS;

        if (!this._stiff && !this._velocityOnly) {
            this._posError.call(this, data, BIAS);

            this._jacobian.call(this, data, JAC);
            this._effMass();
            this._cholesky();

            // Compute |BIAS|^2
            var bsq = 0;
            limit = (BIAS + dimension);
            for (i = BIAS; i < limit; i += 1) {
                var bias = data[i];
                bsq += (bias * bias);
            }

            var maxError = data[(3)];
            if (this._breakUnderError && (bsq > (maxError * maxError))) {
                return true;
            }

            var omega = (2 * Math.PI * data[(0)]);
            var gamma = (1 / (deltaTime * omega * ((2 * data[(1)]) + (omega * deltaTime))));
            var iG = (1 / (1 + gamma));
            var biasCoef = -(deltaTime * omega * omega * gamma);

            data[(6)] = (gamma * iG);

            // Multiply K_CHOLESKY with (1 / sqrt(iG)).
            //
            //   (We want to mulitply inverted eff-mass with iG.
            //    Instead of iG * K^1 we have:
            //    (g * L)^T^-1 * (g * L)^-1
            //    so we must have g = 1 / sqrt(iG)
            //    so that after multiplication we get iG * K^-1
            limit = (K_CHOLESKY + (dimension * dimension));
            iG = (1 / Math.sqrt(iG));
            for (i = K_CHOLESKY; i < limit; i += 1) {
                data[i] *= iG;
            }

            // Clamp BIAS magnitude to maxError
            // (implicit via scaling of biasCoef)
            bsq *= (biasCoef * biasCoef);
            if (bsq > (maxError * maxError)) {
                biasCoef *= (maxError / Math.sqrt(bsq));
            }

            // Multiply BIAS with biasCoef
            limit = (BIAS + dimension);
            for (i = BIAS; i < limit; i += 1) {
                data[i] *= biasCoef;
            }
        } else {
            this._jacobian.call(this, data, JAC);
            this._effMass();
            this._cholesky();

            // BIAS = 0
            limit = (BIAS + dimension);
            for (i = BIAS; i < limit; i += 1) {
                data[i] = 0;
            }
            data[(6)] = 0;
        }

        var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);

        // Multiply J_ACC with dtRatio.
        var J_ACC = this._J_ACC;
        limit = (J_ACC + this.dimension);
        for (i = J_ACC; i < limit; i += 1) {
            data[i] *= dtRatio;
        }

        data[(5)] = (data[(2)] * deltaTime);

        return false;
    };

    Physics2DCustomConstraint.prototype._warmStart = function () {
        this._applyImpulse(this._J_ACC);
    };

    Physics2DCustomConstraint.prototype.getImpulseForBody = function (body, dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(3);
        }

        var data = this._data;
        var JAC = this._JACOBIAN;
        var J = this._J_ACC;

        var bodies = this.bodies;
        var limit = bodies.length;
        var length = (limit * 3);
        var dim = this.dimension;

        var i;
        for (i = 0; i < limit; i += 1) {
            var b = bodies[i];
            if (b === body) {
                var sumX = 0;
                var sumY = 0;
                var sumW = 0;
                var j;
                for (j = 0; j < dim; j += 1) {
                    sumX += (data[J + j] * data[JAC + (length * j)]);
                    sumY += (data[J + j] * data[JAC + (length * j) + 1]);
                    sumW += (data[J + j] * data[JAC + (length * j) + 2]);
                }

                dst[0] = sumX;
                dst[1] = sumY;
                dst[2] = sumW;
                return dst;
            }

            JAC += 3;
        }

        dst[0] = dst[1] = dst[2] = 0;
        return dst;
    };

    Physics2DCustomConstraint.prototype._applyImpulse = function (J, position) {
        var data = this._data;
        var JAC = this._JACOBIAN;

        var bodies = this.bodies;
        var limit = bodies.length;
        var length = (limit * 3);
        var dim = this.dimension;

        var i;
        for (i = 0; i < limit; i += 1) {
            var b = bodies[i];
            var body = b._data;

            var sumX = 0;
            var sumY = 0;
            var sumW = 0;
            var j;
            for (j = 0; j < dim; j += 1) {
                sumX += (data[J + j] * data[JAC + (length * j)]);
                sumY += (data[J + j] * data[JAC + (length * j) + 1]);
                sumW += (data[J + j] * data[JAC + (length * j) + 2]);
            }

            var im = body[(0)];
            var dr = sumW * body[(1)];
            if (position) {
                body[(2)] += sumX * im;
                body[(2) + 1] += sumY * im;
                if (dr !== 0) {
                    b._deltaRotation(dr);
                }
            } else {
                body[(7)] += sumX * im;
                body[(7) + 1] += sumY * im;
                body[(7) + 2] += dr;
            }

            JAC += 3;
        }
    };

    Physics2DCustomConstraint.prototype._iterateVel = function () {
        var dimension = this.dimension;
        var data = this._data;
        var i, limit;

        var VECTOR = this._VECTOR;
        var BIAS = this._BIAS;

        // VECTOR = BIAS - velocity()
        var j;
        var bodies = this.bodies;
        var limit2 = bodies.length;
        var JAC = this._JACOBIAN;
        for (i = 0; i < dimension; i += 1) {
            var term = data[BIAS + i];
            for (j = 0; j < limit2; j += 1) {
                var body = bodies[j]._data;
                term -= ((body[(7)] * data[JAC]) + (body[(7) + 1] * data[JAC + 1]) + (body[(7) + 2] * data[JAC + 2]));
                JAC += 3;
            }
            data[VECTOR + i] = term;
        }

        // VECTOR = KMASS * VECTOR
        this._transform(VECTOR);

        // JOLD = JACC
        // JACC += (VECTOR - JOLD * gamma)
        var JACC = this._J_ACC;
        var JOLD = this._VECTOR_TMP;
        var jAcc;
        var gamma = data[(6)];
        for (i = 0; i < dimension; i += 1) {
            jAcc = data[JOLD + i] = data[JACC + i];
            data[JACC + i] += (data[VECTOR + i] - (jAcc * gamma));
        }

        if (this._velClamp) {
            this._velClamp.call(this, data, JACC);
        }

        // jlsq = |JACC|^2
        var jlsq = 0;
        limit = (JACC + dimension);
        for (i = JACC; i < limit; i += 1) {
            jAcc = data[i];
            jlsq += (jAcc * jAcc);
        }

        var jMax = data[(5)];
        if (this._breakUnderForce && jlsq > (jMax * jMax)) {
            return true;
        } else if (!this._stiff && jlsq > (jMax * jMax)) {
            // clamp(JACC, jMax)
            jlsq = (jMax / Math.sqrt(jlsq));
            for (i = JACC; i < limit; i += 1) {
                data[i] *= jlsq;
            }
        }

        for (i = 0; i < dimension; i += 1) {
            data[VECTOR + i] = (data[JACC + i] - data[JOLD + i]);
        }

        this._applyImpulse(VECTOR);

        return false;
    };

    Physics2DCustomConstraint.prototype._iteratePos = function () {
        if (this._velocityOnly) {
            return false;
        }

        if (this._posConsts) {
            this._posConsts.call(this);
        }

        var dimension = this.dimension;
        var data = this._data;
        var i, limit;

        var BIAS = this._BIAS;
        this._posError.call(this, data, BIAS);

        // elsq = |BIAS|^2
        // BIAS = -BIAS
        limit = (BIAS + dimension);
        var err;
        var elsq = 0;
        for (i = BIAS; i < limit; i += 1) {
            err = data[i];
            elsq += (err * err);
            data[i] = -err;
        }

        var maxError = data[(3)];
        if (this._breakUnderError && (elsq > (maxError * maxError))) {
            return true;
        }

        var JAC = this._JACOBIAN;

        // Recompute jacobian
        this._jacobian.call(this, data, JAC);

        // Recompute effective mass.
        this._effMass();
        this._cholesky();

        // BIAS = KMASS * BIAS
        this._transform(BIAS);
        if (this._posClamp) {
            this._posClamp.call(this, data, BIAS);
        }

        this._applyImpulse(BIAS, true);

        return false;
    };

    Physics2DCustomConstraint.create = function (params) {
        var p = new Physics2DCustomConstraint();

        var dim = p.dimension = params.dimension;
        p.bodies = params.bodies.concat();

        // K_MASS     = (dim * (dim + 1)) / 2
        // K_CHOLSEKY = (dim * dim)
        // BIAS       = dim
        // J_ACC      = dim
        // VECTOR     = dim
        // JACOBIAN   = (dim * bodies.length * 3)
        // VECTOR_TMP = dim
        var dataSize = 7 + (dim * (4 + dim) + ((dim * (dim + 1)) / 2));
        dataSize += (dim * p.bodies.length * 3);
        p._data = new Physics2DDevice.prototype.floatArray(dataSize);
        Physics2DConstraint.prototype.init(p, params);

        p._K_MASS = 7;
        p._K_CHOLESKY = p._K_MASS + ((dim * (dim + 1)) / 2);
        p._BIAS = p._K_CHOLESKY + (dim * dim);
        p._J_ACC = p._BIAS + dim;
        p._VECTOR = p._J_ACC + dim;
        p._JACOBIAN = p._VECTOR + dim;
        p._VECTOR_TMP = p._JACOBIAN + (dim * p.bodies.length * 3);

        p._draw = params.debugDraw;
        p._posConsts = params.positionConstants;
        p._posError = params.position;
        p._posClamp = params.positionClamp;
        p._velClamp = params.velocityClamp;
        p._jacobian = params.jacobian;

        p._velocityOnly = (p._posError === undefined);

        return p;
    };
    return Physics2DCustomConstraint;
})(Physics2DConstraint);

// =========================================================================
//
//
// Pulley Constraint
//
// PULLEY DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*PULLEY_JOINTMIN*/5   // Joint limits
///*PULLEY_JOINTMAX*/6   //
///*PULLEY_RATIO*/7      // Pulley ratio
///*PULLEY_KMASS*/8      // Effective-mass (scalar)
///*PULLEY_JACC*/9       // Accumulated impulse (scalar)
///*PULLEY_JMAX*/10      // Maximum impulse (maxForce derived)
///*PULLEY_LANCHOR1*/11  // Local anchor position on bodyA (x, y)
///*PULLEY_LANCHOR2*/13  // Local anchor position on bodyB (x, y)
///*PULLEY_LANCHOR3*/15  // Local anchor position on bodyC (x, y)
///*PULLEY_LANCHOR4*/17  // Local anchor position on bodyD (x, y)
///*PULLEY_RANCHOR1*/19  // Relative anchor position on bodyA (x, y)
///*PULLEY_RANCHOR2*/21  // Relative anchor position on bodyB (x, y)
///*PULLEY_RANCHOR3*/23  // Relative anchor position on bodyC (x, y)
///*PULLEY_RANCHOR4*/25  // Relative anchor position on bodyD (x, y)
///*PULLEY_GAMMA*/27     // Soft constraint gamma
///*PULLEY_BIAS*/28      // Soft constraint bias (scalar)
///*PULLEY_N12*/29       // Direction of constraint (r1 -> r2) (x, y)
///*PULLEY_N34*/31       // Direction of constraint (r3 -> r4) (x, y)
///*PULLEY_CX1*/33       // (RANCHOR1 cross N12)
///*PULLEY_CX2*/34       // (RANCHOR2 cross N12)
///*PULLEY_CX3*/35       // (RANCHOR3 cross N34)
///*PULLEY_CX4*/36       // (RANCHOR4 cross N34)
//
///*PULLEY_DATA_SIZE*/37
var Physics2DPulleyConstraint = (function (_super) {
    __extends(Physics2DPulleyConstraint, _super);
    function Physics2DPulleyConstraint() {
        _super.apply(this, arguments);
        this.type = "PULLEY";
        this.dimension = 1;
        // Inherited
        this._ANCHOR_A = (11);
        this._ANCHOR_B = (13);
        this._ANCHOR_C = (15);
        this._ANCHOR_D = (17);
        // =====================================================
        // Inherited
        this._JACC = (9);
    }
    // ===============================================
    Physics2DPulleyConstraint.prototype.getRatio = function () {
        return this._data[(7)];
    };
    Physics2DPulleyConstraint.prototype.setRatio = function (ratio) {
        var data = this._data;
        if (data[(7)] !== ratio) {
            data[(7)] = ratio;
            this.wake(true);
        }
    };

    Physics2DPulleyConstraint.prototype.getLowerBound = function () {
        return this._data[(5)];
    };
    Physics2DPulleyConstraint.prototype.getUpperBound = function () {
        return this._data[(6)];
    };

    Physics2DPulleyConstraint.prototype.setLowerBound = function (lowerBound) {
        var data = this._data;
        if (data[(5)] !== lowerBound) {
            data[(5)] = lowerBound;
            this._equal = (lowerBound === data[(6)]);
            this.wake(true);
        }
    };
    Physics2DPulleyConstraint.prototype.setUpperBound = function (upperBound) {
        var data = this._data;
        if (data[(6)] !== upperBound) {
            data[(6)] = upperBound;
            this._equal = (upperBound === data[(5)]);
            this.wake(true);
        }
    };

    Physics2DPulleyConstraint.prototype.getAnchorC = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        var INDEX = this._ANCHOR_C;
        dst[0] = data[INDEX];
        dst[1] = data[INDEX + 1];
        return dst;
    };
    Physics2DPulleyConstraint.prototype.setAnchorC = function (anchor/*v2*/ ) {
        var data = this._data;
        var INDEX = this._ANCHOR_C;
        var newX = anchor[0];
        var newY = anchor[1];
        if (newX !== data[INDEX] || newY !== data[INDEX + 1]) {
            data[INDEX] = newX;
            data[INDEX + 1] = newY;
            this.wake(true);
        }
    };

    Physics2DPulleyConstraint.prototype.getAnchorD = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        var INDEX = this._ANCHOR_D;
        dst[0] = data[INDEX];
        dst[1] = data[INDEX + 1];
        return dst;
    };
    Physics2DPulleyConstraint.prototype.setAnchorD = function (anchor/*v2*/ ) {
        var data = this._data;
        var INDEX = this._ANCHOR_D;
        var newX = anchor[0];
        var newY = anchor[1];
        if (newX !== data[INDEX] || newY !== data[INDEX + 1]) {
            data[INDEX] = newX;
            data[INDEX + 1] = newY;
            this.wake(true);
        }
    };

    // =========================================================
    Physics2DPulleyConstraint.prototype._inWorld = function () {
        this.bodyA.constraints.push(this);
        this.bodyB.constraints.push(this);
        if (this.bodyB !== this.bodyC) {
            this.bodyC.constraints.push(this);
        }
        this.bodyD.constraints.push(this);
    };

    Physics2DPulleyConstraint.prototype._outWorld = function () {
        var constraints = this.bodyA.constraints;
        var index = constraints.indexOf(this);
        constraints[index] = constraints[constraints.length - 1];
        constraints.pop();

        constraints = this.bodyB.constraints;
        index = constraints.indexOf(this);
        constraints[index] = constraints[constraints.length - 1];
        constraints.pop();

        if (this.bodyB !== this.bodyC) {
            constraints = this.bodyB.constraints;
            index = constraints.indexOf(this);
            constraints[index] = constraints[constraints.length - 1];
            constraints.pop();
        }

        constraints = this.bodyD.constraints;
        index = constraints.indexOf(this);
        constraints[index] = constraints[constraints.length - 1];
        constraints.pop();
    };

    Physics2DPulleyConstraint.prototype._pairExists = function (b1, b2) {
        var bodyA = this.bodyA;
        var bodyB = this.bodyB;
        var bodyC = this.bodyC;
        var bodyD = this.bodyD;

        return ((b1 === bodyA && (b2 === bodyB || b2 === bodyC || b2 === bodyD)) || (b1 === bodyB && (b2 === bodyA || b2 === bodyC || b2 === bodyD)) || (b1 === bodyC && (b2 === bodyA || b2 === bodyB || b2 === bodyD)) || (b1 === bodyD && (b2 === bodyA || b2 === bodyB || b2 === bodyC)));
    };

    Physics2DPulleyConstraint.prototype._wakeConnected = function () {
        var body = this.bodyA;
        if (body._type === (0)) {
            body.wake(true);
        }

        body = this.bodyB;
        if (body._type === (0)) {
            body.wake(true);
        }

        body = this.bodyC;
        if (body !== this.bodyB && body._type === (0)) {
            body.wake(true);
        }

        body = this.bodyD;
        if (body._type === (0)) {
            body.wake(true);
        }
    };

    Physics2DPulleyConstraint.prototype._sleepComputation = function (union) {
        var body = this.bodyA;
        if (body._type === (0)) {
            union(body, this);
        }

        body = this.bodyB;
        if (body._type === (0)) {
            union(body, this);
        }

        body = this.bodyC;
        if (body !== this.bodyB && body._type === (0)) {
            union(body, this);
        }

        body = this.bodyD;
        if (body._type === (0)) {
            union(body, this);
        }
    };

    Physics2DPulleyConstraint.prototype._posError = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;
        var b3 = this.bodyC._data;
        var b4 = this.bodyD._data;

        Physics2DConstraint.prototype.rotateAnchor(data, b1, (11), (19));
        Physics2DConstraint.prototype.rotateAnchor(data, b2, (13), (21));
        Physics2DConstraint.prototype.rotateAnchor(data, b3, (15), (23));
        Physics2DConstraint.prototype.rotateAnchor(data, b4, (17), (25));

        var jointMin = data[(5)];
        var jointMax = data[(6)];

        var n12x = ((b2[(2)] + data[(21)]) - (b1[(2)] + data[(19)]));
        var n12y = ((b2[(2) + 1] + data[(21) + 1]) - (b1[(2) + 1] + data[(19) + 1]));
        var n34x = ((b4[(2)] + data[(25)]) - (b3[(2)] + data[(23)]));
        var n34y = ((b4[(2) + 1] + data[(25) + 1]) - (b3[(2) + 1] + data[(23) + 1]));

        var err12 = ((n12x * n12x) + (n12y * n12y));
        var err34 = ((n34x * n34x) + (n34y * n34y));
        var rec;
        if (err12 < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
            err12 = 0;
            n12x = data[(29)];
            n12y = data[(29) + 1];
        } else {
            err12 = Math.sqrt(err12);
            rec = (1 / err12);
            n12x *= rec;
            n12y *= rec;
        }

        var ratio = data[(7)];
        if (err34 < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
            err34 = 0;
            n34x = data[(31)];
            n34y = data[(31) + 1];
        } else {
            err34 = Math.sqrt(err34);
            rec = (ratio / err34);
            n34x *= rec;
            n34y *= rec;
        }

        var err = (err12 + (err34 * ratio));
        if (this._equal) {
            err -= jointMin;
            this._slack = false;
        } else if (err < jointMin) {
            err = (jointMin - err);
            n12x = -n12x;
            n12y = -n12y;
            n34x = -n34x;
            n34y = -n34y;
            this._slack = false;
        } else if (err > jointMax) {
            err -= jointMax;
            this._slack = false;
        } else {
            // Don't set normals to 0.
            // In this case that _slack is true, we do no further work
            // So we permit normals to persist so that should constraint
            // become degenerate we can still choose a 'good' direction.
            //
            // Constraint only becomes degenerate when jointMin = 0 and we reach this
            // limit. In this condition we want negated normals, so that's what we
            // allow to persist.
            n12x = -n12x;
            n12y = -n12y;
            n34x = -n34x;
            n34y = -n34y;

            err = 0;
            this._slack = true;
        }

        data[(29)] = n12x;
        data[(29) + 1] = n12y;
        data[(31)] = n34x;
        data[(31) + 1] = n34y;
        data[(28)] = (-err);
    };

    Physics2DPulleyConstraint.prototype._preStep = function (deltaTime) {
        this._posError();
        if (this._slack) {
            return false;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;
        var b3 = this.bodyC._data;
        var b4 = this.bodyD._data;

        // Compute non-inverted effective mass.
        var ratioSq = data[(7)];
        ratioSq *= ratioSq;
        var n12x = data[(29)];
        var n12y = data[(29) + 1];
        var n34x = data[(31)];
        var n34y = data[(31) + 1];
        var cx1 = data[(33)] = ((data[(19)] * n12y) - (data[(19) + 1] * n12x));
        var cx2 = data[(34)] = ((data[(21)] * n12y) - (data[(21) + 1] * n12x));
        var cx3 = data[(35)] = ((data[(23)] * n34y) - (data[(23) + 1] * n34x));
        var cx4 = data[(36)] = ((data[(25)] * n34y) - (data[(25) + 1] * n34x));
        var im3 = b3[(0)];
        var ii3 = b3[(1)];
        var K = (b1[(0)] + b2[(0)] + (ratioSq * (im3 + b4[(0)])) + (cx1 * b1[(1)] * cx1) + (cx2 * b2[(1)] * cx2) + (cx3 * ii3 * cx3) + (cx4 * b4[(1)] * cx4));
        if (b2 === b3) {
            K -= 2 * ((((n12x * n34x) + (n12y * n34y)) * im3) + (cx2 * cx3 * ii3));
        }
        data[(8)] = K;

        // Invert effective mass
        Physics2DConstraint.prototype.safe_invert(data, (8), (9));

        if (!this._stiff) {
            if (Physics2DConstraint.prototype.soft_params(data, (8), (27), (28), deltaTime, this._breakUnderError)) {
                return true;
            }
        } else {
            data[(27)] = 0;
            data[(28)] = 0;
        }

        var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
        data[(9)] *= dtRatio;
        data[(10)] = (data[(2)] * deltaTime);

        return false;
    };

    Physics2DPulleyConstraint.prototype._warmStart = function () {
        if (this._slack) {
            return false;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;
        var b3 = this.bodyC._data;
        var b4 = this.bodyD._data;

        var jAcc = data[(9)];
        var jx = (data[(29)] * jAcc);
        var jy = (data[(29) + 1] * jAcc);

        var im = b1[(0)];
        b1[(7)] -= (jx * im);
        b1[(7) + 1] -= (jy * im);
        b1[(7) + 2] -= (data[(33)] * jAcc * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (jx * im);
        b2[(7) + 1] += (jy * im);
        b2[(7) + 2] += (data[(34)] * jAcc * b2[(1)]);

        jx = (data[(31)] * jAcc);
        jy = (data[(31) + 1] * jAcc);

        im = b3[(0)];
        b3[(7)] -= (jx * im);
        b3[(7) + 1] -= (jy * im);
        b3[(7) + 2] -= (data[(35)] * jAcc * b3[(1)]);

        im = b4[(0)];
        b4[(7)] += (jx * im);
        b4[(7) + 1] += (jy * im);
        b4[(7) + 2] += (data[(36)] * jAcc * b4[(1)]);
    };

    Physics2DPulleyConstraint.prototype.getImpulseForBody = function (body, dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(3);
        }

        var jAcc = data[(9)];

        var data = this._data;
        if (body === this.bodyA) {
            dst[0] = -(data[(29)] * jAcc);
            dst[1] = -(data[(29) + 1] * jAcc);
            dst[2] = -data[(33)] * jAcc;
        } else if (body === this.bodyD) {
            dst[0] = (data[(31)] * jAcc);
            dst[1] = (data[(31) + 1] * jAcc);
            dst[2] = data[(36)] * jAcc;
        } else {
            var sumX = 0;
            var sumY = 0;
            var sumW = 0;
            if (body === this.bodyB) {
                sumX += (data[(29)] * jAcc);
                sumY += (data[(29) + 1] * jAcc);
                sumW += data[(34)] * jAcc;
            }
            if (body === this.bodyC) {
                sumX -= (data[(31)] * jAcc);
                sumY -= (data[(31) + 1] * jAcc);
                sumW -= data[(35)] * jAcc;
            }
            dst[0] = sumX;
            dst[1] = sumY;
            dst[2] = sumW;
        }

        return dst;
    };

    Physics2DPulleyConstraint.prototype._iterateVel = function () {
        if (this._slack) {
            return false;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;
        var b3 = this.bodyC._data;
        var b4 = this.bodyD._data;

        // x = Bias - VelocityError
        var n12x = data[(29)];
        var n12y = data[(29) + 1];
        var n34x = data[(31)];
        var n34y = data[(31) + 1];
        var cx1 = data[(33)];
        var cx2 = data[(34)];
        var cx3 = data[(35)];
        var cx4 = data[(36)];
        var x = (data[(28)] - ((n12x * (b2[(7)] - b1[(7)])) + (n12y * (b2[(7) + 1] - b1[(7) + 1])) + (n34x * (b4[(7)] - b3[(7)])) + (n34y * (b4[(7) + 1] - b3[(7) + 1])) + (cx2 * b2[(7) + 2]) - (cx1 * b1[(7) + 2]) + (cx4 * b4[(7) + 2]) - (cx3 * b3[(7) + 2])));

        var jOld = data[(9)];

        // Impulse.
        // j = K * x - jAcc * gamma
        var j = ((data[(8)] * x) - (jOld * data[(27)]));

        // Accumulate and clamp.
        var jAcc = (jOld + j);
        var jMax = data[(10)];
        if (!this._equal && jAcc > 0) {
            jAcc = 0;
        }
        if (this._breakUnderForce) {
            if (jAcc > jMax || jAcc < -jMax) {
                return true;
            }
        } else if (!this._stiff) {
            if (jAcc > jMax) {
                jAcc = jMax;
            } else if (jAcc < -jMax) {
                jAcc = -jMax;
            }
        }

        j = (jAcc - jOld);
        data[(9)] = jAcc;

        // Apply impulse.
        var jx = (data[(29)] * j);
        var jy = (data[(29) + 1] * j);

        var im = b1[(0)];
        b1[(7)] -= (jx * im);
        b1[(7) + 1] -= (jy * im);
        b1[(7) + 2] -= (cx1 * j * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (jx * im);
        b2[(7) + 1] += (jy * im);
        b2[(7) + 2] += (cx2 * j * b2[(1)]);

        jx = (data[(31)] * j);
        jy = (data[(31) + 1] * j);

        im = b3[(0)];
        b3[(7)] -= (jx * im);
        b3[(7) + 1] -= (jy * im);
        b3[(7) + 2] -= (cx3 * j * b3[(1)]);

        im = b4[(0)];
        b4[(7)] += (jx * im);
        b4[(7) + 1] += (jy * im);
        b4[(7) + 2] += (cx4 * j * b4[(1)]);

        return false;
    };

    Physics2DPulleyConstraint.prototype._iteratePos = function () {
        this._posError();
        if (this._slack) {
            return false;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;
        var b3 = this.bodyC._data;
        var b4 = this.bodyD._data;

        var im1 = b1[(0)];
        var im2 = b2[(0)];
        var im3 = b3[(0)];
        var im4 = b4[(0)];
        var ii1 = b1[(1)];
        var ii2 = b2[(1)];
        var ii3 = b3[(1)];
        var ii4 = b4[(1)];

        var err = data[(28)];
        var maxError = data[(3)];

        if (this._breakUnderError && (err > maxError || err < -maxError)) {
            return true;
        }

        var slop = Physics2DConfig.PULLEY_SLOP_SQ;
        if ((err * err) < slop) {
            return false;
        }

        err *= Physics2DConfig.PULLEY_BIAS_COEF;

        var ratioSq = data[(7)];
        ratioSq *= ratioSq;

        var K = (im1 + im2 + (ratioSq * (im3 + im4)));
        var n12x = data[(29)];
        var n12y = data[(29) + 1];
        var n34x = data[(31)];
        var n34y = data[(31) + 1];
        if (b2 === b3) {
            K -= 2 * ((n12x * n34x) + (n12y * n34y)) * im2;
        }

        var j, jx, jy;

        if ((err * err) > Physics2DConfig.PULLEY_LARGE_ERROR_SQ) {
            if (K > Physics2DConfig.EFF_MASS_EPSILON) {
                j = (err * Physics2DConfig.PULLEY_LARGE_ERROR_BIAS / K);
                if (this._equal || j < 0) {
                    jx = (n12x * j);
                    jy = (n12y * j);
                    b1[(2)] -= (jx * im1);
                    b1[(2) + 1] -= (jy * im1);
                    b2[(2)] += (jx * im2);
                    b2[(2) + 1] += (jy * im2);

                    jx = (n34x * j);
                    jy = (n34y * j);
                    b3[(2)] -= (jx * im3);
                    b3[(2) + 1] -= (jy * im3);
                    b4[(2)] += (jx * im4);
                    b4[(2) + 1] += (jy * im4);

                    // Recalculate error.
                    this._posError();
                    n12x = data[(29)];
                    n12y = data[(29) + 1];
                    n34x = data[(31)];
                    n34y = data[(31) + 1];
                    err = data[(28)] * Physics2DConfig.PULLEY_BIAS_COEF;
                }
            }
        }

        var cx1 = ((data[(19)] * n12y) - (data[(19) + 1] * n12x));
        var cx2 = ((data[(21)] * n12y) - (data[(21) + 1] * n12x));
        var cx3 = ((data[(23)] * n34y) - (data[(23) + 1] * n34x));
        var cx4 = ((data[(25)] * n34y) - (data[(25) + 1] * n34x));
        K += ((cx1 * ii1 * cx1) + (cx2 * ii2 * cx2) + (cx3 * ii3 * cx3) + (cx4 * ii4 * cx4));
        if (b2 === b2) {
            K -= (2 * cx2 * ii2 * cx3);
        }

        data[(8)] = K;
        data[(28)] = err;
        Physics2DConstraint.prototype.safe_solve(data, (8), (28), (28));
        j = data[(28)];

        if (this._equal || j < 0) {
            var dr;
            jx = (n12x * j);
            jy = (n12y * j);
            b1[(2)] -= (jx * im1);
            b1[(2) + 1] -= (jy * im1);
            dr = (-cx1 * j * ii1);
            if (dr !== 0) {
                this.bodyA._deltaRotation(dr);
            }

            b2[(2)] += (jx * im2);
            b2[(2) + 1] += (jy * im2);
            dr = (cx2 * j * ii2);
            if (dr !== 0) {
                this.bodyB._deltaRotation(dr);
            }

            jx = (n34x * j);
            jy = (n34y * j);
            b3[(2)] -= (jx * im3);
            b3[(2) + 1] -= (jy * im3);
            dr = (-cx3 * j * ii3);
            if (dr !== 0) {
                this.bodyC._deltaRotation(dr);
            }

            b4[(2)] += (jx * im4);
            b4[(2) + 1] += (jy * im4);
            dr = (cx4 * j * ii4);
            if (dr !== 0) {
                this.bodyD._deltaRotation(dr);
            }
        }

        return false;
    };

    Physics2DPulleyConstraint.create = // params = {
    //   bodyA, bodyB, bodyC, bodyD // bodyB permitted equal to bodyC
    //   anchorA, anchorB, anchorC, anchorD
    //   lowerBound, upperBound, ratio
    //   .. common constraint params
    // }
    function (params) {
        var p = new Physics2DPulleyConstraint();
        var data = p._data = new Physics2DDevice.prototype.floatArray((37));
        Physics2DConstraint.prototype.init(p, params);

        var anchor = params.anchorA;
        data[(11)] = (anchor ? anchor[0] : 0);
        data[(11) + 1] = (anchor ? anchor[1] : 0);

        anchor = params.anchorB;
        data[(13)] = (anchor ? anchor[0] : 0);
        data[(13) + 1] = (anchor ? anchor[1] : 0);

        anchor = params.anchorC;
        data[(15)] = (anchor ? anchor[0] : 0);
        data[(15) + 1] = (anchor ? anchor[1] : 0);

        anchor = params.anchorD;
        data[(17)] = (anchor ? anchor[0] : 0);
        data[(17) + 1] = (anchor ? anchor[1] : 0);

        var min = data[(5)] = (params.lowerBound !== undefined ? params.lowerBound : 0);
        var max = data[(6)] = (params.upperBound !== undefined ? params.upperBound : 0);
        p._equal = (min === max);

        data[(7)] = (params.ratio !== undefined ? params.ratio : 1);

        p._slack = false;

        p.bodyA = params.bodyA;
        p.bodyB = params.bodyB;
        p.bodyC = params.bodyC;
        p.bodyD = params.bodyD;

        // Seed normal incase initial anchors are degenerate.
        data[(29)] = 1;
        data[(29) + 1] = 0;
        data[(31)] = 1;
        data[(31) + 1] = 0;

        return p;
    };
    return Physics2DPulleyConstraint;
})(Physics2DConstraint);

// =========================================================================
//
// Motor Constraint
//
// MOTOR DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*MOTOR_RATE*/5   // Motor rate
///*MOTOR_RATIO*/6  // Motor ratio
///*MOTOR_KMASS*/7  // Effective mass (scalar)
///*MOTOR_JACC*/8   // Accumulated impulse (scalar)
///*MOTOR_JMAX*/9   // Maximum impulse (maxForce derived)
//
///*MOTOR_DATA_SIZE*/10
var Physics2DMotorConstraint = (function (_super) {
    __extends(Physics2DMotorConstraint, _super);
    function Physics2DMotorConstraint() {
        _super.apply(this, arguments);
        this.type = "MOTOR";
        this.dimension = 1;
        // ==========================================================
        // Inherited
        this._JACC = (8);
    }
    // // Inherited
    // wake  = Physics2DConstraint.prototype.wake;
    // sleep = Physics2DConstraint.prototype.sleep;
    // configure  = Physics2DConstraint.prototype.configure;
    // isEnabled  = Physics2DConstraint.prototype.isEnabled;
    // isDisabled = Physics2DConstraint.prototype.isDisabled;
    // enable     = Physics2DConstraint.prototype.enable;
    // disable    = Physics2DConstraint.prototype.disable;
    // addEventListener    = Physics2DConstraint.prototype.addEventListener;
    // removeEventListener = Physics2DConstraint.prototype.removeEventListener;
    // ===============================================
    Physics2DMotorConstraint.prototype.getRate = function () {
        return this._data[(5)];
    };
    Physics2DMotorConstraint.prototype.getRatio = function () {
        return this._data[(6)];
    };

    Physics2DMotorConstraint.prototype.setRate = function (rate) {
        var data = this._data;
        if (data[(5)] !== rate) {
            data[(5)] = rate;
            this.wake(true);
        }
    };
    Physics2DMotorConstraint.prototype.setRatio = function (ratio) {
        var data = this._data;
        if (data[(6)] !== ratio) {
            data[(6)] = ratio;
            this.wake(true);
        }
    };

    Physics2DMotorConstraint.prototype._preStep = function (deltaTime) {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        // Compute non-inverted effective mass
        var ratio = data[(6)];
        data[(7)] = (b1[(1)] + (ratio * ratio * b2[(1)]));

        // Invert eff-mass matrix
        Physics2DConstraint.prototype.safe_invert(data, (7), (8));

        var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
        data[(8)] *= dtRatio;
        data[(9)] = (data[(2)] * deltaTime);

        return false;
    };

    Physics2DMotorConstraint.prototype._warmStart = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var j = data[(8)];
        b1[(7) + 2] -= (j * b1[(1)]);
        b2[(7) + 2] += (data[(6)] * j * b2[(1)]);
    };

    Physics2DMotorConstraint.prototype.getImpulseForBody = function (body, dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(3);
        }

        var data = this._data;

        dst[0] = dst[1] = 0;
        dst[2] = (body === this.bodyA ? -1 : (body === this.bodyB ? data[(6)] : 0)) * data[(8)];
        return dst;
    };

    Physics2DMotorConstraint.prototype._iterateVel = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var ratio = data[(6)];
        var j = (data[(7)] * (data[(5)] + b1[(7) + 2] - (ratio * b2[(7) + 2])));
        var jOld = data[(8)];
        var jAcc = (jOld + j);
        var jMax = data[(9)];
        if (this._breakUnderForce && (jAcc > jMax || jAcc < -jMax)) {
            return true;
        } else {
            if (jAcc > jMax) {
                jAcc = jMax;
            } else if (jAcc < -jMax) {
                jAcc = -jMax;
            }
        }

        j = (jAcc - jOld);
        data[(8)] = jAcc;

        b1[(7) + 2] -= (j * b1[(1)]);
        b2[(7) + 2] += (ratio * j * b2[(1)]);

        return false;
    };

    // Velocity only constraint.
    Physics2DMotorConstraint.prototype._iteratePos = function () {
        return false;
    };

    Physics2DMotorConstraint.create = function (params) {
        var p = new Physics2DMotorConstraint();
        var data = p._data = new Physics2DDevice.prototype.floatArray((10));
        Physics2DConstraint.prototype.init(p, params);

        data[(5)] = (params.rate !== undefined ? params.rate : 0);
        data[(6)] = (params.ratio !== undefined ? params.ratio : 1);

        p.bodyA = params.bodyA;
        p.bodyB = params.bodyB;

        return p;
    };
    return Physics2DMotorConstraint;
})(Physics2DConstraint);

// Point these methods at specific methods on the base class.
Physics2DMotorConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
Physics2DMotorConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
Physics2DMotorConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
Physics2DMotorConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
Physics2DMotorConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;

// =========================================================================
//
// Line Constraint
//
// LINE DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*LINE_JOINTMIN*/5   // Joint limits (axial)
///*LINE_JOINTMAX*/6   //
///*LINE_LANCHOR1*/7   // Local anchor on bodyA (x, y)
///*LINE_LANCHOR2*/9   // Local anchor on bodyB (x, y)
///*LINE_LAXIS*/11     // Local axis on bodyA (x, y)
///*LINE_RANCHOR1*/13  // Relative anchor on bodyA (x, y)
///*LINE_RANCHOR2*/15  // Relative anchor on bodyB (x, y)
///*LINE_RAXIS*/17     // Relative/World axis on bodyA (x, y)
///*LINE_KMASS*/19     // Effective mass [a b; b c] (symmetric)
///*LINE_JACC*/22      // Accumulated impuse (x, y)
///*LINE_JMAX*/24      // Maximum impulse magnitude
///*LINE_GAMMA*/25     // Soft constraint gamma
///*LINE_BIAS*/26      // Soft constraint bias (x, y)
///*LINE_CX1*/28
///*LINE_CX2*/29
///*LINE_DOT1*/30
///*LINE_DOT2*/31
///*LINE_SCALE*/32     // Direction scaling of axis.
//
///*LINE_DATA_SIZE*/33
var Physics2DLineConstraint = (function (_super) {
    __extends(Physics2DLineConstraint, _super);
    function Physics2DLineConstraint() {
        _super.apply(this, arguments);
        this.type = "LINE";
        this.dimension = 2;
        // Inherited
        this._ANCHOR_A = (7);
        this._ANCHOR_B = (9);
        // ==========================================================
        // Inherited
        this._JACC = (22);
    }
    // ===============================================
    Physics2DLineConstraint.prototype.getLowerBound = function () {
        return this._data[(5)];
    };
    Physics2DLineConstraint.prototype.getUpperBound = function () {
        return this._data[(6)];
    };

    Physics2DLineConstraint.prototype.setLowerBound = function (lowerBound) {
        var data = this._data;
        if (data[(5)] !== lowerBound) {
            data[(5)] = lowerBound;
            this._equal = (lowerBound === data[(6)]);
            this.wake(true);
        }
    };
    Physics2DLineConstraint.prototype.setUpperBound = function (upperBound) {
        var data = this._data;
        if (data[(6)] !== upperBound) {
            data[(6)] = upperBound;
            this._equal = (upperBound === data[(5)]);
            this.wake(true);
        }
    };

    Physics2DLineConstraint.prototype.getAxis = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        dst[0] = data[(11)];
        dst[1] = data[(11) + 1];
        return dst;
    };
    Physics2DLineConstraint.prototype.setAxis = function (axis/*v2*/ ) {
        var data = this._data;
        var newX = axis[0];
        var newY = axis[1];
        if (newX !== data[(11)] || newY !== data[(11) + 1]) {
            var nlsq = ((newX * newX) + (newY * newY));
            if (nlsq === 0) {
                return;
            } else {
                nlsq = (1 / Math.sqrt(nlsq));
                newX *= nlsq;
                newY *= nlsq;
            }
            data[(11)] = newX;
            data[(11) + 1] = newY;
            this.wake(true);
        }
    };

    Physics2DLineConstraint.prototype._posError = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        Physics2DConstraint.prototype.rotateAnchor(data, b1, (7), (13));
        Physics2DConstraint.prototype.rotateAnchor(data, b2, (9), (15));
        Physics2DConstraint.prototype.rotateAnchor(data, b1, (11), (17));

        var jointMin = data[(5)];
        var jointMax = data[(6)];

        var rx1 = data[(13)];
        var ry1 = data[(13) + 1];
        var rx2 = data[(15)];
        var ry2 = data[(15) + 1];
        var nx = data[(17)];
        var ny = data[(17) + 1];

        // Store (dx, dy) in (cx1, cx2) temporarigly.
        // As this information is needed in subsequent calculations for eff-mass.
        // We take care not to alias values!
        var dx = data[(28)] = ((b2[(2)] + rx2) - (b1[(2)] + rx1));
        var dy = data[(29)] = ((b2[(2) + 1] + ry2) - (b1[(2) + 1] + ry1));

        var errX = ((nx * dy) - (ny * dx));
        var errY = ((nx * dx) + (ny * dy));
        if (this._equal) {
            errY -= jointMin;
            data[(32)] = 1.0;
        } else {
            if (errY > jointMax) {
                errY -= jointMax;
                data[(32)] = 1.0;
            } else if (errY < jointMin) {
                errY = (jointMin - errY);
                data[(32)] = -1.0;
            } else {
                errY = 0;
                data[(32)] = 0.0;
            }
        }

        data[(26)] = (-errX);
        data[(26) + 1] = (-errY);
    };

    Physics2DLineConstraint.prototype._preStep = function (deltaTime) {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        // Must compute (dx, dy) (stored into cx1/cx2)
        // As well as scale for eff-mass computation.
        this._posError();

        // Compute non-inverted effective mass.
        var rx1 = data[(13)];
        var ry1 = data[(13) + 1];
        var rx2 = data[(15)];
        var ry2 = data[(15) + 1];
        var nx = data[(17)];
        var ny = data[(17) + 1];
        var scale = data[(32)];
        var delX = (data[(28)] + rx1);
        var delY = (data[(29)] + ry1);

        var cx1 = data[(28)] = (nx * delY) - (ny * delX);
        var cx2 = data[(29)] = (nx * ry2) - (ny * rx2);
        var dot1 = data[(30)] = (nx * delX) + (ny * delY);
        var dot2 = data[(31)] = (nx * rx2) + (ny * ry2);

        var massSum = (b1[(0)] + b2[(0)]);
        var ii1 = b1[(1)];
        var ii2 = b2[(1)];

        data[(19)] = massSum + (dot1 * ii1 * dot1) + (dot2 * ii2 * dot2);
        data[(19) + 1] = -scale * ((dot1 * ii1 * cx1) + (dot2 * ii2 * cx2));
        data[(19) + 2] = scale * scale * (massSum + (cx1 * ii1 * cx1) + (cx2 * ii2 * cx2));

        // Invert effective mass.
        Physics2DConstraint.prototype.safe_invert2(data, (19), (22));

        if (!this._stiff) {
            if (Physics2DConstraint.prototype.soft_params2(data, (19), (25), (26), deltaTime, this._breakUnderError)) {
                return true;
            }
        } else {
            data[(25)] = 0;
            data[(26)] = 0;
            data[(26) + 1] = 0;
        }

        var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
        data[(22)] *= dtRatio;
        data[(22) + 1] *= dtRatio;
        data[(24)] = (data[(2)] * deltaTime);

        return false;
    };

    Physics2DLineConstraint.prototype._warmStart = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var jx = data[(22)];
        var jy = data[(22) + 1];
        var scale = data[(32)];
        var nx = data[(17)];
        var ny = data[(17) + 1];

        var lx = (scale * nx * jy) - (ny * jx);
        var ly = (nx * jx) + (scale * ny * jy);

        var im = b1[(0)];
        b1[(7)] -= (lx * im);
        b1[(7) + 1] -= (ly * im);
        b1[(7) + 2] += (((scale * data[(28)] * jy) - (data[(30)] * jx)) * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (lx * im);
        b2[(7) + 1] += (ly * im);
        b2[(7) + 2] += (((data[(31)] * jx) - (scale * data[(29)] * jy)) * b2[(1)]);
    };

    Physics2DLineConstraint.prototype.getImpulseForBody = function (body, dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(3);
        }

        var data = this._data;
        var jx = data[(22)];
        var jy = data[(22) + 1];
        var scale = data[(32)];
        var nx = data[(17)];
        var ny = data[(17) + 1];

        var lx = (scale * nx * jy) - (ny * jx);
        var ly = (nx * jx) + (scale * ny * jy);

        if (body === this.bodyA) {
            dst[0] = -lx;
            dst[1] = -ly;
            dst[2] = ((scale * data[(28)] * jy) - (data[(30)] * jx));
        } else if (body === this.bodyB) {
            dst[0] = lx;
            dst[1] = ly;
            dst[2] = ((data[(31)] * jx) - (scale * data[(29)] * jy));
        } else {
            dst[0] = dst[1] = dst[2] = 0;
        }

        return dst;
    };

    Physics2DLineConstraint.prototype._iterateVel = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        // (x, y) = Bias - VelocityError
        var scale = data[(32)];
        var nx = data[(17)];
        var ny = data[(17) + 1];
        var cx1 = data[(28)];
        var cx2 = data[(29)];
        var dot1 = data[(30)];
        var dot2 = data[(31)];

        var vx = (b2[(7)] - b1[(7)]);
        var vy = (b2[(7) + 1] - b1[(7) + 1]);
        var vw1 = b1[(7) + 2];
        var vw2 = b2[(7) + 2];
        var x = (data[(26)] - ((nx * vy) - (ny * vx) + (vw2 * dot2) - (vw1 * dot1)));
        var y = (data[(26) + 1] - (scale * ((nx * vx) + (ny * vy) - (vw2 * cx2) + (vw1 * cx1))));

        var jOldX = data[(22)];
        var jOldY = data[(22) + 1];
        var gamma = data[(25)];

        // Impulse.
        // (jx, jy) = K * (x, y) - Jacc * gamma
        var Kb = data[(19) + 1];
        var jx = ((data[(19)] * x) + (Kb * y)) - (jOldX * gamma);
        var jy = ((Kb * x) + (data[(19) + 2] * y)) - (jOldY * gamma);

        // Accumulate and clamp
        var jAccX = (jOldX + jx);
        var jAccY = (jOldY + jy);
        if (!this._equal && jAccY > 0) {
            jAccY = 0;
        }

        var jlsq = ((jAccX * jAccX) + (jAccY * jAccY));
        var jMax = data[(24)];
        if (this._breakUnderForce) {
            if (jlsq > (jMax * jMax)) {
                return true;
            }
        } else if (!this._stiff) {
            if (jlsq > (jMax * jMax)) {
                jlsq = (jMax / Math.sqrt(jlsq));
                jAccX *= jlsq;
                jAccY *= jlsq;
            }
        }

        jx = (jAccX - jOldX);
        jy = (jAccY - jOldY);
        data[(22)] = jAccX;
        data[(22) + 1] = jAccY;

        // Apply impulse.
        var lx = (scale * nx * jy) - (ny * jx);
        var ly = (nx * jx) + (scale * ny * jy);

        var im = b1[(0)];
        b1[(7)] -= (lx * im);
        b1[(7) + 1] -= (ly * im);
        b1[(7) + 2] += (((scale * cx1 * jy) - (dot1 * jx)) * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (lx * im);
        b2[(7) + 1] += (ly * im);
        b2[(7) + 2] += (((dot2 * jx) - (scale * cx2 * jy)) * b2[(1)]);

        return false;
    };

    Physics2DLineConstraint.prototype._iteratePos = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        this._posError();
        var errX = data[(26)];
        var errY = data[(26) + 1];
        var elsq = ((errX * errX) + (errY * errY));

        var maxError = data[(3)];
        if (this._breakUnderError && elsq > (maxError * maxError)) {
            return true;
        }

        var slop = Physics2DConfig.LINE_SLOP_SQ;
        if (elsq < slop) {
            return false;
        }

        var bias = Physics2DConfig.LINE_BIAS_COEF;
        errX *= bias;
        errY *= bias;
        elsq *= (bias * bias);

        var im1 = b1[(0)];
        var im2 = b2[(0)];
        var ii1 = b1[(1)];
        var ii2 = b2[(1)];
        var massSum = (im1 + im2);

        var nx = data[(17)];
        var ny = data[(17) + 1];
        var scale = data[(32)];

        var lx, ly;

        if (elsq > Physics2DConfig.LINE_LARGE_ERROR_SQ) {
            if (massSum > Physics2DConfig.EFF_MASS_EPSILON) {
                var K = (Physics2DConfig.LINE_LARGE_ERROR_BIAS / massSum);
                lx = K * ((ny * errX) - (scale * nx * errY));
                ly = K * ((nx * errX * scale) - (ny * errX));

                b1[(2)] -= (lx * im1);
                b1[(2) + 1] -= (ly * im1);
                b2[(2)] += (lx * im2);
                b2[(2) + 1] += (ly * im2);

                this._posError();
                nx = data[(17)];
                ny = data[(17) + 1];
                scale = data[(32)];

                errX = (data[(26)] * bias);
                errY = (data[(26) + 1] * bias);
            }
        }

        // Compute non-inverted effective mass.
        var rx1 = data[(13)];
        var ry1 = data[(13) + 1];
        var rx2 = data[(15)];
        var ry2 = data[(15) + 1];
        var delX = (data[(28)] + rx1);
        var delY = (data[(29)] + ry1);

        var cx1 = (nx * delY) - (ny * delX);
        var cx2 = (nx * ry2) - (ny * rx2);
        var dot1 = (nx * delX) + (ny * delY);
        var dot2 = (nx * rx2) + (ny * ry2);

        data[(19)] = massSum + (dot1 * ii1 * dot1) + (dot2 * ii2 * dot2);
        data[(19) + 1] = -scale * ((dot1 * ii1 * cx1) + (dot2 * ii2 * cx2));
        data[(19) + 2] = scale * scale * (massSum + (cx1 * ii1 * cx1) + (cx2 * ii2 * cx2));

        data[(26)] = errX;
        data[(26) + 1] = errY;
        Physics2DConstraint.prototype.safe_solve2(data, (19), (26), (26));
        var jx = data[(26)];
        var jy = data[(26) + 1];

        if (!this._equal && jy > 0) {
            jy = 0;
        }

        lx = (scale * nx * jy) - (ny * jx);
        ly = (nx * jx) + (scale * ny * jy);

        b1[(2)] -= (lx * im1);
        b1[(2) + 1] -= (ly * im1);
        var dr = (((scale * cx1 * jy) - (dot1 * jx)) * ii1);
        if (dr !== 0) {
            this.bodyA._deltaRotation(dr);
        }

        b2[(2)] += (lx * im2);
        b2[(2) + 1] += (ly * im2);
        dr = (((dot2 * jx) - (scale * cx2 * jy)) * ii2);
        if (dr !== 0) {
            this.bodyB._deltaRotation(dr);
        }

        return false;
    };

    Physics2DLineConstraint.create = // params = {
    //   bodyA, bodyB
    //   anchorA, anchorB, axis
    //   lowerBound, upperBound
    //   .. common constraint params
    // }
    function (params) {
        var p = new Physics2DLineConstraint();
        var data = p._data = new Physics2DDevice.prototype.floatArray((33));
        Physics2DConstraint.prototype.init(p, params);

        var anchor = params.anchorA;
        data[(7)] = (anchor ? anchor[0] : 0);
        data[(7) + 1] = (anchor ? anchor[1] : 0);

        anchor = params.anchorB;
        data[(9)] = (anchor ? anchor[0] : 0);
        data[(9) + 1] = (anchor ? anchor[1] : 0);

        anchor = params.axis;
        data[(11)] = anchor[0];
        data[(11) + 1] = anchor[1];

        var min = data[(5)] = (params.lowerBound !== undefined ? params.lowerBound : Number.NEGATIVE_INFINITY);
        var max = data[(6)] = (params.upperBound !== undefined ? params.upperBound : Number.POSITIVE_INFINITY);
        p._equal = (min === max);

        p.bodyA = params.bodyA;
        p.bodyB = params.bodyB;

        return p;
    };
    return Physics2DLineConstraint;
})(Physics2DConstraint);

// Redirect some methods
Physics2DLineConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
Physics2DLineConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
Physics2DLineConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
Physics2DLineConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
Physics2DLineConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;

// =========================================================================
//
// Distance Constraint
//
// DIST DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*DIST_JOINTMIN*/5   // Joint limits
///*DIST_JOINTMAX*/6   //
///*DIST_LANCHOR1*/7   // Local anchor on bodyA (x, y)
///*DIST_LANCHOR2*/9   // Local anchor on bodyB (x, y)
///*DIST_RANCHOR1*/11  // Relative anchor on bodyA (x, y)
///*DIST_RANCHOR2*/13  // Relative anchor on bodyB (x, y)
///*DIST_KMASS*/15     // Effective mass matrix (scalar)
///*DIST_JACC*/16      // Accumulated impulse
///*DIST_JMAX*/17      // Maximum impulse (maxForce derived)
///*DIST_GAMMA*/18     // Soft constraint gamma
///*DIST_BIAS*/19      // Bias for soft constraint (scalar)
///*DIST_NORMAL*/20    // Direction of constraint error (x, y)
///*DIST_CX1*/22       // (RANCHOR1 cross NORMAL)
///*DIST_CX2*/23       // (RANCHOR2 cross NORMAL)
//
///*DIST_DATA_SIZE*/24
var Physics2DDistanceConstraint = (function (_super) {
    __extends(Physics2DDistanceConstraint, _super);
    function Physics2DDistanceConstraint() {
        _super.apply(this, arguments);
        this.type = "DISTANCE";
        this.dimension = 1;
        // Inherited
        this._ANCHOR_A = (7);
        this._ANCHOR_B = (9);
        // =======================================================
        // Inherited
        this._JACC = (16);
    }
    // ===============================================
    Physics2DDistanceConstraint.prototype.getLowerBound = function () {
        return this._data[(5)];
    };
    Physics2DDistanceConstraint.prototype.getUpperBound = function () {
        return this._data[(6)];
    };

    Physics2DDistanceConstraint.prototype.setLowerBound = function (lowerBound) {
        var data = this._data;
        if (data[(5)] !== lowerBound) {
            data[(5)] = lowerBound;
            this._equal = (lowerBound === data[(6)]);
            this.wake(true);
        }
    };
    Physics2DDistanceConstraint.prototype.setUpperBound = function (upperBound) {
        var data = this._data;
        if (data[(6)] !== upperBound) {
            data[(6)] = upperBound;
            this._equal = (upperBound === data[(5)]);
            this.wake(true);
        }
    };

    Physics2DDistanceConstraint.prototype._posError = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var jointMin = data[(5)];
        var jointMax = data[(6)];

        Physics2DConstraint.prototype.rotateAnchor(data, b1, (7), (11));
        Physics2DConstraint.prototype.rotateAnchor(data, b2, (9), (13));

        var nx = ((b2[(2)] + data[(13)]) - (b1[(2)] + data[(11)]));
        var ny = ((b2[(2) + 1] + data[(13) + 1]) - (b1[(2) + 1] + data[(11) + 1]));

        var err = ((nx * nx) + (ny * ny));
        if (err < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
            nx = data[(20)];
            ny = data[(20) + 1];
            err = 0;
        } else {
            err = Math.sqrt(err);
            var rec = (1 / err);
            nx *= rec;
            ny *= rec;
        }

        if (this._equal) {
            err -= jointMin;
            this._slack = false;
        } else if (err < jointMin) {
            err = (jointMin - err);
            nx = -nx;
            ny = -ny;
            this._slack = false;
        } else if (err > jointMax) {
            err -= jointMax;
            this._slack = false;
        } else {
            // Don't set normals to 0.
            // In this case that _slack is true, we do no further work
            // So we permit normals to persist so that should constraint
            // become degenerate we can still choose a 'good' direction.
            //
            // Constraint only becomes degenerate when jointMin = 0 and we reach this
            // limit. In this condition we want negated normals, so that's what we
            // allow to persist.
            nx = -nx;
            ny = -ny;

            err = 0;
            this._slack = true;
        }

        data[(20)] = nx;
        data[(20) + 1] = ny;
        data[(19)] = (-err);
    };

    Physics2DDistanceConstraint.prototype._preStep = function (deltaTime) {
        this._posError();
        if (this._slack) {
            return false;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        // Compute non-inverted effective mass.
        var nx = data[(20)];
        var ny = data[(20) + 1];
        var cx1 = data[(22)] = ((data[(11)] * ny) - (data[(11) + 1] * nx));
        var cx2 = data[(23)] = ((data[(13)] * ny) - (data[(13) + 1] * nx));
        data[(15)] = (b1[(0)] + (cx1 * b1[(1)] * cx1) + b2[(0)] + (cx2 * b2[(1)] * cx2));

        // Invert effective mass
        Physics2DConstraint.prototype.safe_invert(data, (15), (16));

        if (!this._stiff) {
            if (Physics2DConstraint.prototype.soft_params(data, (15), (18), (19), deltaTime, this._breakUnderError)) {
                return true;
            }
        } else {
            data[(18)] = 0.0;
            data[(19)] = 0.0;
        }

        var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
        data[(16)] *= dtRatio;
        data[(17)] = (data[(2)] * deltaTime);

        return false;
    };

    Physics2DDistanceConstraint.prototype._warmStart = function () {
        if (this._slack) {
            return;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var jAcc = data[(16)];
        var jx = (data[(20)] * jAcc);
        var jy = (data[(20) + 1] * jAcc);

        var im = b1[(0)];
        b1[(7)] -= (jx * im);
        b1[(7) + 1] -= (jy * im);
        b1[(7) + 2] -= (data[(22)] * jAcc * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (jx * im);
        b2[(7) + 1] += (jy * im);
        b2[(7) + 2] += (data[(23)] * jAcc * b2[(1)]);
    };

    Physics2DDistanceConstraint.prototype.getImpulseForBody = function (body, dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(3);
        }

        var data = this._data;

        var jAcc = data[(16)];
        var jx = (data[(20)] * jAcc);
        var jy = (data[(20) + 1] * jAcc);

        if (body === this.bodyA) {
            dst[0] = -jx;
            dst[1] = -jy;
            dst[2] = -(data[(22)] * jAcc);
        } else if (body === this.bodyB) {
            dst[0] = jx;
            dst[1] = jy;
            dst[2] = (data[(23)] * jAcc);
        } else {
            dst[0] = dst[1] = dst[2] = 0;
        }

        return dst;
    };

    Physics2DDistanceConstraint.prototype._iterateVel = function () {
        if (this._slack) {
            return false;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        // x = Bias - VelocityError
        var nx = data[(20)];
        var ny = data[(20) + 1];
        var cx1 = data[(22)];
        var cx2 = data[(23)];
        var x = (data[(19)] - ((nx * (b2[(7)] - b1[(7)])) + (ny * (b2[(7) + 1] - b1[(7) + 1])) + (cx2 * b2[(7) + 2]) - (cx1 * b1[(7) + 2])));

        var jOld = data[(16)];

        // Impulse.
        // j = K * x - Jacc * gamma
        var j = ((data[(15)] * x) - (jOld * data[(18)]));

        // Accumulate and clamp.
        var jAcc = (jOld + j);
        var jMax = data[(17)];
        if (!this._equal && jAcc > 0) {
            jAcc = 0;
        }
        if (this._breakUnderForce) {
            if (jAcc > jMax || jAcc < -jMax) {
                return true;
            }
        } else if (!this._stiff) {
            if (jAcc > jMax) {
                jAcc = jMax;
            } else if (jAcc < -jMax) {
                jAcc = -jMax;
            }
        }

        j = (jAcc - jOld);
        data[(16)] = jAcc;

        // Apply impulse.
        var jx = (nx * j);
        var jy = (ny * j);

        var im = b1[(0)];
        b1[(7)] -= (jx * im);
        b1[(7) + 1] -= (jy * im);
        b1[(7) + 2] -= (data[(22)] * j * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (jx * im);
        b2[(7) + 1] += (jy * im);
        b2[(7) + 2] += (data[(23)] * j * b2[(1)]);

        return false;
    };

    Physics2DDistanceConstraint.prototype._iteratePos = function () {
        this._posError();
        if (this._slack) {
            return false;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var im1 = b1[(0)];
        var im2 = b2[(0)];
        var ii1 = b1[(1)];
        var ii2 = b2[(1)];

        var err = data[(19)];
        var maxError = data[(3)];
        if (this._breakUnderError && (err > maxError || err < -maxError)) {
            return true;
        }

        var slop = Physics2DConfig.DIST_SLOP_SQ;
        if ((err * err) < slop) {
            return false;
        }

        err *= Physics2DConfig.DIST_BIAS_COEF;

        var massSum = (im1 + im2);
        var nx = data[(20)];
        var ny = data[(20) + 1];

        var j, jx, jy;

        if ((err * err) > Physics2DConfig.DIST_LARGE_ERROR_SQ) {
            if (massSum > Physics2DConfig.EFF_MASS_EPSILON) {
                j = (err * Physics2DConfig.DIST_LARGE_ERROR_BIAS / massSum);
                if (this._equal || j < 0) {
                    jx = (nx * j);
                    jy = (ny * j);
                    b1[(2)] -= (jx * im1);
                    b1[(2) + 1] -= (jy * im1);
                    b2[(2)] += (jx * im2);
                    b2[(2) + 1] += (jy * im2);

                    // Recalculate error.
                    this._posError();
                    err = data[(19)] * Physics2DConfig.DIST_BIAS_COEF;
                    nx = data[(20)];
                    ny = data[(20) + 1];
                }
            }
        }

        var cx1 = ((data[(11)] * ny) - (data[(11) + 1] * nx));
        var cx2 = ((data[(13)] * ny) - (data[(13) + 1] * nx));
        data[(15)] = (massSum + (cx1 * ii1 * cx1) + (cx2 * ii2 * cx2));

        data[(19)] = err;
        Physics2DConstraint.prototype.safe_solve(data, (15), (19), (19));
        j = data[(19)];

        if (this._equal || j < 0) {
            jx = (nx * j);
            jy = (ny * j);

            b1[(2)] -= (jx * im1);
            b1[(2) + 1] -= (jy * im1);
            var dr = (-cx1 * ii1 * j);
            if (dr !== 0) {
                this.bodyA._deltaRotation(dr);
            }

            b2[(2)] += (jx * im2);
            b2[(2) + 1] += (jy * im2);
            dr = (cx2 * ii2 * j);
            if (dr !== 0) {
                this.bodyB._deltaRotation(dr);
            }
        }

        return false;
    };

    Physics2DDistanceConstraint.create = // params = {
    //   bodyA, bodyB
    //   anchorA, anchorB,
    //   lowerBound, upperBound
    //   .. common constraint params
    // }
    function (params) {
        var p = new Physics2DDistanceConstraint();
        var data = p._data = new Physics2DDevice.prototype.floatArray((24));
        Physics2DConstraint.prototype.init(p, params);

        var anchor = params.anchorA;
        data[(7)] = (anchor ? anchor[0] : 0);
        data[(7) + 1] = (anchor ? anchor[1] : 0);

        anchor = params.anchorB;
        data[(9)] = (anchor ? anchor[0] : 0);
        data[(9) + 1] = (anchor ? anchor[1] : 0);

        var min = data[(5)] = (params.lowerBound !== undefined ? params.lowerBound : 0);
        var max = data[(6)] = (params.upperBound !== undefined ? params.upperBound : 0);
        p._equal = (min === max);

        p._slack = false;

        p.bodyA = params.bodyA;
        p.bodyB = params.bodyB;

        // Seed normal incase initial anchors are degenerate.
        data[(20)] = 1;
        data[(20) + 1] = 0;

        return p;
    };
    return Physics2DDistanceConstraint;
})(Physics2DConstraint);

// Redirect some methods
Physics2DDistanceConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
Physics2DDistanceConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
Physics2DDistanceConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
Physics2DDistanceConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
Physics2DDistanceConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;

// =========================================================================
//
// Angle Constraint
//
// ANGLE DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*ANGLE_JOINTMIN*/5 // Joint limits
///*ANGLE_JOINTMAX*/6 //
///*ANGLE_RATIO*/7    // Angle ratio for constraint
///*ANGLE_KMASS*/8    // Effective mass matrix (Scalar)
///*ANGLE_JACC*/9     // Accumulated impulse
///*ANGLE_JMAX*/10    // Maximum impulse (maxForce derived)
///*ANGLE_GAMMA*/11   // Gamma for soft constraint
///*ANGLE_BIAS*/12    // Bias for soft constraint (scalar)
///*ANGLE_SCALE*/13   // Scaling for impulse direction.
//
///*ANGLE_DATA_SIZE*/14
var Physics2DAngleConstraint = (function (_super) {
    __extends(Physics2DAngleConstraint, _super);
    function Physics2DAngleConstraint() {
        _super.apply(this, arguments);
        this.type = "ANGLE";
        this.dimension = 1;
        // =======================================================
        // Inherited
        this._JACC = (9);
    }
    // ===============================================
    Physics2DAngleConstraint.prototype.getLowerBound = function () {
        return this._data[(5)];
    };
    Physics2DAngleConstraint.prototype.getUpperBound = function () {
        return this._data[(6)];
    };
    Physics2DAngleConstraint.prototype.getRatio = function () {
        return this._data[(7)];
    };

    Physics2DAngleConstraint.prototype.setLowerBound = function (lowerBound) {
        var data = this._data;
        if (data[(5)] !== lowerBound) {
            data[(5)] = lowerBound;
            this._equal = (lowerBound === data[(6)]);
            this.wake(true);
        }
    };
    Physics2DAngleConstraint.prototype.setUpperBound = function (upperBound) {
        var data = this._data;
        if (data[(6)] !== upperBound) {
            data[(6)] = upperBound;
            this._equal = (upperBound === data[(5)]);
            this.wake(true);
        }
    };
    Physics2DAngleConstraint.prototype.setRatio = function (ratio) {
        var data = this._data;
        if (data[(7)] !== ratio) {
            data[(7)] = ratio;
            this.wake(true);
        }
    };

    Physics2DAngleConstraint.prototype._posError = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var ratio = data[(7)];
        var jointMin = data[(5)];
        var jointMax = data[(6)];

        var err = ((ratio * b2[(2) + 2]) - b1[(2) + 2]);
        if (this._equal) {
            err -= jointMax;
            this._slack = false;
            data[(13)] = 1;
        } else {
            if (err < jointMin) {
                err = (jointMin - err);
                this._slack = false;
                data[(13)] = -1;
            } else if (err > jointMax) {
                err -= jointMax;
                this._slack = false;
                data[(13)] = 1;
            } else {
                err = 0;
                this._slack = true;
                data[(13)] = 0;
            }
        }
        data[(12)] = (-err);
    };

    Physics2DAngleConstraint.prototype._preStep = function (deltaTime) {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        // Compute effective mass before existing on _slack
        // As effective-mass is not recomputed in iteratePos
        // for stiff constraints.
        var ratio = data[(7)];

        // Compute non-inverted effective mass.
        var ii1 = b1[(1)];
        var ii2 = b2[(1)];
        data[(8)] = ii1 + (ratio * ratio * ii2);

        // Invert effective mass
        Physics2DConstraint.prototype.safe_invert(data, (8), (9));

        this._posError();
        if (this._slack) {
            return false;
        }

        if (!this._stiff) {
            if (Physics2DConstraint.prototype.soft_params(data, (8), (11), (12), deltaTime, this._breakUnderError)) {
                return true;
            }
        } else {
            data[(11)] = 0;
            data[(12)] = 0;
        }

        var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
        data[(9)] *= dtRatio;
        data[(10)] = (data[(2)] * deltaTime);

        return false;
    };

    Physics2DAngleConstraint.prototype._warmStart = function () {
        if (this._slack) {
            return;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var j = (data[(9)] * data[(13)]);
        b1[(7) + 2] -= (j * b1[(1)]);
        b2[(7) + 2] += (j * data[(7)] * b2[(1)]);
    };

    Physics2DAngleConstraint.prototype.getImpulseForBody = function (body, dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(3);
        }

        var data = this._data;
        var j = (data[(9)] * data[(13)]);

        dst[0] = dst[1] = 0;
        dst[2] = (body === this.bodyA ? -1 : (body === this.bodyB ? data[(7)] : 0)) * j;

        return dst;
    };

    Physics2DAngleConstraint.prototype._iterateVel = function () {
        if (this._slack) {
            return false;
        }

        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        // x = Bias - VelocityError
        var scale = data[(13)];
        var ratio = data[(7)];
        var x = (data[(12)] - (scale * ((ratio * b2[(7) + 2]) - b1[(7) + 2])));

        var jOld = data[(9)];

        // Impulse.
        // j = K * x - Jacc * gamma
        var j = (data[(8)] * x) - (jOld * data[(11)]);

        // Accumulate and clamp
        var jAcc = (jOld + j);
        var jMax = data[(10)];
        if (this._breakUnderForce) {
            if (jAcc > jMax || jAcc < -jMax) {
                return true;
            } else if (!this._equal && jAcc > 0) {
                jAcc = 0;
            }
        } else if (!this._stiff) {
            if (!this._equal) {
                if (jAcc > 0) {
                    jAcc = 0;
                } else if (jAcc < -jMax) {
                    jAcc = -jMax;
                }
            } else {
                if (jAcc > jMax) {
                    jAcc = jMax;
                } else if (jAcc < -jMax) {
                    jAcc = -jMax;
                }
            }
        } else if (!this._equal && jAcc > 0) {
            jAcc = 0;
        }

        j = (jAcc - jOld);
        data[(9)] = jAcc;

        // Apply impulse
        j *= scale;
        b1[(7) + 2] -= (j * b1[(1)]);
        b2[(7) + 2] += (j * ratio * b2[(1)]);

        return false;
    };

    Physics2DAngleConstraint.prototype._iteratePos = function () {
        this._posError();
        if (this._slack) {
            return false;
        }

        var data = this._data;
        var err = data[(12)];
        var maxError = data[(3)];
        if (this._breakUnderError && (err > maxError || err < -maxError)) {
            return true;
        }

        var slop = Physics2DConfig.ANGLE_SLOP_SQ;
        if ((err * err) < slop) {
            return false;
        }

        err *= Physics2DConfig.ANGLE_BIAS_COEF;
        var j = (err * Physics2DConfig.ANGLE_BIAS_COEF * data[(8)]);

        if (this._equal || j < 0) {
            var b = this.bodyA;
            j *= data[(13)];
            var dr = (-j * b._data[(1)]);
            if (dr !== 0) {
                b._deltaRotation(dr);
            }

            b = this.bodyB;
            dr = (j * b._data[(1)]);
            if (dr !== 0) {
                b._deltaRotation(dr);
            }
        }

        return false;
    };

    Physics2DAngleConstraint.create = // params = {
    //   bodyA, bodyB,
    //   lowerBound, upperBound, ratio
    //   ... common constraint params
    // }
    function (params) {
        var p = new Physics2DAngleConstraint();
        var data = p._data = new Physics2DDevice.prototype.floatArray((14));
        Physics2DConstraint.prototype.init(p, params);

        data[(7)] = (params.ratio !== undefined ? params.ratio : 1);
        var min = data[(5)] = (params.lowerBound !== undefined ? params.lowerBound : 0);
        var max = data[(6)] = (params.upperBound !== undefined ? params.upperBound : 0);
        p._equal = (min === max);

        p._slack = false;

        p.bodyA = params.bodyA;
        p.bodyB = params.bodyB;

        return p;
    };
    return Physics2DAngleConstraint;
})(Physics2DConstraint);

// Inherited
Physics2DAngleConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
Physics2DAngleConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
Physics2DAngleConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
Physics2DAngleConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
Physics2DAngleConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;

// =========================================================================
//
// Weld Constraint
//
// WELD DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*WELD_LANCHOR1*/5  // Locally defined anchor on first body.
///*WELD_LANCHOR2*/7  // Locally defined anchor on second body.
///*WELD_RANCHOR1*/9  // Relatively defined anchor on first body.
///*WELD_RANCHOR2*/11 // Relatively defined anchor on second body.
///*WELD_PHASE*/13    // Rotational phase between bodies
///*WELD_KMASS*/14    // Effective mass matrix [ a b c ; b d e ; c e f ] symmetric.
///*WELD_JACC*/20     // Accumulated impulse (x, y, w).
///*WELD_JMAX*/23     // Maximum impulse magnitude (maxForce derived).
///*WELD_GAMMA*/24    // Gamma for soft constraint
///*WELD_BIAS*/25     // Bias for soft constraint (x, y, w) (maxError derived).
//
///*WELD_DATA_SIZE*/28
var Physics2DWeldConstraint = (function (_super) {
    __extends(Physics2DWeldConstraint, _super);
    function Physics2DWeldConstraint() {
        _super.apply(this, arguments);
        this.type = "WELD";
        this.dimension = 3;
        // ===============================================
        // Inherited
        this._ANCHOR_A = (5);
        this._ANCHOR_B = (7);
        // =======================================================
        // Inherited
        this._JACC = (20);
    }
    Physics2DWeldConstraint.prototype.getPhase = function () {
        return this._data[(13)];
    };
    Physics2DWeldConstraint.prototype.setPhase = function (phase) {
        var data = this._data;
        if (phase !== data[(13)]) {
            data[(13)] = phase;
            this.wake(true);
        }
    };

    Physics2DWeldConstraint.prototype._preStep = function (deltaTime) {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        Physics2DConstraint.prototype.rotateAnchor(data, b1, (5), (9));
        var rx1 = data[(9)];
        var ry1 = data[(9) + 1];

        Physics2DConstraint.prototype.rotateAnchor(data, b2, (7), (11));
        var rx2 = data[(11)];
        var ry2 = data[(11) + 1];

        // Compute non-inverted effective mass.
        var massSum = (b1[(0)] + b2[(0)]);
        var ii1 = b1[(1)];
        var ii2 = b2[(1)];
        data[(14)] = massSum + (ry1 * ii1 * ry1) + (ry2 * ii2 * ry2);
        data[(14) + 1] = -(rx1 * ii1 * ry1) - (rx2 * ii2 * ry2);
        data[(14) + 2] = -(ry1 * ii1) - (ry2 * ii2);
        data[(14) + 3] = massSum + (rx1 * ii1 * rx1) + (rx2 * ii2 * rx2);
        data[(14) + 4] = (rx1 * ii1) + (rx2 * ii2);
        data[(14) + 5] = ii1 + ii2;

        // Invert effective mass
        Physics2DConstraint.prototype.safe_invert3(data, (14), (20));

        if (!this._stiff) {
            data[(25)] = ((b1[(2)] + rx1) - (b2[(2)] + rx2));
            data[(25) + 1] = ((b1[(2) + 1] + ry1) - (b2[(2) + 1] + ry2));
            data[(25) + 2] = ((b1[(2) + 2] + data[(13)]) - b2[(2) + 2]);
            if (Physics2DConstraint.prototype.soft_params3(data, (14), (24), (25), deltaTime, this._breakUnderError)) {
                return true;
            }
        } else {
            data[(24)] = 0.0;
            data[(25)] = 0.0;
            data[(25) + 1] = 0.0;
            data[(25) + 2] = 0.0;
        }

        var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
        data[(20)] *= dtRatio;
        data[(20) + 1] *= dtRatio;
        data[(20) + 2] *= dtRatio;
        data[(23)] = (data[(2)] * deltaTime);

        return false;
    };

    Physics2DWeldConstraint.prototype._warmStart = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var jx = data[(20)];
        var jy = data[(20) + 1];
        var jz = data[(20) + 2];

        var im = b1[(0)];
        b1[(7)] -= (jx * im);
        b1[(7) + 1] -= (jy * im);
        b1[(7) + 2] -= (((data[(9)] * jy) - (data[(9) + 1] * jx) + jz) * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (jx * im);
        b2[(7) + 1] += (jy * im);
        b2[(7) + 2] += (((data[(11)] * jy) - (data[(11) + 1] * jx) + jz) * b2[(1)]);
    };

    Physics2DWeldConstraint.prototype.getImpulseForBody = function (body, dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(3);
        }

        var data = this._data;
        var jx = data[(20)];
        var jy = data[(20) + 1];
        var jz = data[(20) + 2];

        if (body === this.bodyA) {
            dst[0] = -jx;
            dst[1] = -jy;
            dst[2] = -((data[(9)] * jy) - (data[(9) + 1] * jx) + jz);
        } else if (body === this.bodyB) {
            dst[0] = jx;
            dst[1] = jy;
            dst[2] = ((data[(11)] * jy) - (data[(11) + 1] * jx) + jz);
        } else {
            dst[0] = dst[1] = dst[2] = 0;
        }

        return dst;
    };

    Physics2DWeldConstraint.prototype._iterateVel = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var rx1 = data[(9)];
        var ry1 = data[(9) + 1];
        var rx2 = data[(11)];
        var ry2 = data[(11) + 1];

        // (x, y, z) = Bias - VelocityError
        var vw1 = b1[(7) + 2];
        var vw2 = b2[(7) + 2];
        var x = (data[(25)] - (b2[(7)] - (ry2 * vw2)) + (b1[(7)] - (ry1 * vw1)));
        var y = (data[(25) + 1] - (b2[(7) + 1] + (rx2 * vw2)) + (b1[(7) + 1] + (rx1 * vw1)));
        var z = (data[(25) + 2] - vw2 + vw1);

        var jOldX = data[(20)];
        var jOldY = data[(20) + 1];
        var jOldZ = data[(20) + 2];
        var gamma = data[(24)];

        // Impulse.
        // (jx, jy, jz) = K * (x, y, z) - (JAcc * gamma);
        var Kb = data[(14) + 1];
        var Kc = data[(14) + 2];
        var Ke = data[(14) + 4];
        var jx = ((data[(14)] * x) + (Kb * y) + (Kc * z)) - (jOldX * gamma);
        var jy = ((Kb * x) + (data[(14) + 3] * y) + (Ke * z)) - (jOldY * gamma);
        var jz = ((Kc * x) + (Ke * y) + (data[(14) + 5] * z)) - (jOldZ * gamma);

        // Accumulate and clamp.
        var jAccX = (jOldX + jx);
        var jAccY = (jOldY + jy);
        var jAccZ = (jOldZ + jz);
        var jsq = ((jAccX * jAccX) + (jAccY * jAccY) + (jAccZ * jAccZ));
        var jMax = data[(23)];
        if (this._breakUnderForce) {
            if (jsq > (jMax * jMax)) {
                return true;
            }
        } else if (!this._stiff) {
            if (jsq > (jMax * jMax)) {
                jsq = (jMax / Math.sqrt(jsq));
                jAccX *= jsq;
                jAccY *= jsq;
                jAccZ *= jsq;
            }
        }

        jx = (jAccX - jOldX);
        jy = (jAccY - jOldY);
        jz = (jAccZ - jOldZ);
        data[(20)] = jAccX;
        data[(20) + 1] = jAccY;
        data[(20) + 2] = jAccZ;

        // Apply impulse
        var im = b1[(0)];
        b1[(7)] -= (jx * im);
        b1[(7) + 1] -= (jy * im);
        b1[(7) + 2] -= (((rx1 * jy) - (ry1 * jx) + jz) * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (jx * im);
        b2[(7) + 1] += (jy * im);
        b2[(7) + 2] += (((rx2 * jy) - (ry2 * jx) + jz) * b2[(1)]);

        return false;
    };

    Physics2DWeldConstraint.prototype._iteratePos = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var im1 = b1[(0)];
        var im2 = b2[(0)];
        var ii1 = b1[(1)];
        var ii2 = b2[(1)];

        Physics2DConstraint.prototype.rotateAnchor(data, b1, (5), (9));
        var rx1 = data[(9)];
        var ry1 = data[(9) + 1];

        Physics2DConstraint.prototype.rotateAnchor(data, b2, (7), (11));
        var rx2 = data[(11)];
        var ry2 = data[(11) + 1];

        // Positional error
        var errX = ((b1[(2)] + rx1) - (b2[(2)] + rx2));
        var errY = ((b1[(2) + 1] + ry1) - (b2[(2) + 1] + ry2));
        var errZ = ((b1[(2) + 2] + data[(13)]) - b2[(2) + 2]);

        var elsq = ((errX * errX) + (errY * errY));
        var wlsq = (errZ * errZ);
        var maxError = data[(3)];
        if (this._breakUnderError && (elsq + wlsq > (maxError * maxError))) {
            return true;
        }

        if (elsq < Physics2DConfig.WELD_LINEAR_SLOP_SQ && wlsq < Physics2DConfig.WELD_ANGULAR_SLOP_SQ) {
            return false;
        }

        var scale = Physics2DConfig.WELD_BIAS_COEF;
        errX *= scale;
        errY *= scale;
        errZ *= scale;
        elsq *= (scale * scale);

        var massSum = (im1 + im2);
        var jx, jy;

        if (elsq > Physics2DConfig.WELD_LARGE_ERROR_SQ) {
            if (massSum > Physics2DConfig.EFF_MASS_EPSILON) {
                var K = (Physics2DConfig.WELD_BIAS_COEF / massSum);
                jx = (errX * K);
                jy = (errY * K);

                // Clamp
                var jsq = ((jx * jx) + (jy * jy));
                var maxJ = Physics2DConfig.WELD_LARGE_ERROR_MAX;
                if (jsq > (maxJ * maxJ)) {
                    jsq = (maxJ / Math.sqrt(jsq));
                    jx *= jsq;
                    jy *= jsq;
                }

                // Apply impulse
                b1[(2)] -= (jx * im1);
                b1[(2) + 1] -= (jy * im1);
                b2[(2)] += (jx * im1);
                b2[(2) + 1] += (jy * im1);

                // Recompute error.
                errX = ((b1[(2)] + rx1) - (b2[(2)] + rx2));
                errY = ((b1[(2) + 1] + ry1) - (b2[(2) + 1] + ry2));
                errX *= scale;
                errY *= scale;
                elsq = ((errX * errX) + (errY * errY));
            }
        }

        // Compute non-inverted effective mass.
        data[(14)] = massSum + (ry1 * ii1 * ry1) + (ry2 * ii2 * ry2);
        data[(14) + 1] = -(rx1 * ii1 * ry1) - (rx2 * ii2 * ry2);
        data[(14) + 2] = -(ry1 * ii1) - (ry2 * ii2);
        data[(14) + 3] = massSum + (rx1 * ii1 * rx1) + (rx2 * ii2 * rx2);
        data[(14) + 4] = (rx1 * ii1) + (rx2 * ii2);
        data[(14) + 5] = ii1 + ii2;

        if (elsq > Physics2DConfig.WELD_MAX_LINEAR_ERROR_SQ) {
            elsq = (Physics2DConfig.WELD_MAX_LINEAR_ERROR / Math.sqrt(elsq));
            errX *= elsq;
            errY *= elsq;
        }

        var maxW = Physics2DConfig.WELD_MAX_ANGULAR_ERROR;
        if (errZ > maxW) {
            errZ = maxW;
        } else if (errZ < -maxW) {
            errZ = -maxW;
        }

        data[(25)] = errX;
        data[(25) + 1] = errY;
        data[(25) + 2] = errZ;
        Physics2DConstraint.prototype.safe_solve3(data, (14), (25), (25));
        jx = data[(25)];
        jy = data[(25) + 1];
        var jz = data[(25) + 2];

        // Apply impulse
        b1[(2)] -= (jx * im1);
        b1[(2) + 1] -= (jy * im1);
        var dW = -(((rx1 * jy) - (ry1 * jx) + jz) * ii1);
        if (dW !== 0) {
            this.bodyA._deltaRotation(dW);
        }

        b2[(2)] += (jx * im2);
        b2[(2) + 1] += (jy * im2);
        dW = (((rx2 * jy) - (ry2 * jx) + jz) * ii2);
        if (dW !== 0) {
            this.bodyB._deltaRotation(dW);
        }

        return false;
    };

    Physics2DWeldConstraint.create = // params = {
    //   bodyA, bodyB,
    //   anchorA, anchorB,
    //   phase
    //   ... common constraint params
    // }
    function (params) {
        var p = new Physics2DWeldConstraint();
        var data = p._data = new Physics2DDevice.prototype.floatArray((28));
        Physics2DConstraint.prototype.init(p, params);

        var anchor = params.anchorA;
        data[(5)] = (anchor ? anchor[0] : 0);
        data[(5) + 1] = (anchor ? anchor[1] : 0);

        anchor = params.anchorB;
        data[(7)] = (anchor ? anchor[0] : 0);
        data[(7) + 1] = (anchor ? anchor[1] : 0);

        data[(13)] = (params.phase !== undefined ? params.phase : 0);

        p.bodyA = params.bodyA;
        p.bodyB = params.bodyB;

        return p;
    };
    return Physics2DWeldConstraint;
})(Physics2DConstraint);

// Inherited
Physics2DWeldConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
Physics2DWeldConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
Physics2DWeldConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
Physics2DWeldConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
Physics2DWeldConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;

// =========================================================================
//
// Point Constraint
//
// POINT DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*POINT_LANCHOR1*/5  // Locally defined anchor on first body.
///*POINT_LANCHOR2*/7  // Locally defined anchor on second body.
///*POINT_RANCHOR1*/9  // Relatively defined anchor on first body.
///*POINT_RANCHOR2*/11 // Relatively defined anchor on second body.
///*POINT_KMASS*/13    // Effective mass matrix [ a b ; b c] symmetric.
///*POINT_JACC*/16     // Accumulated impulses (x, y).
///*POINT_JMAX*/18     // Maximimum impulse magnitude (maxForce derived).
///*POINT_GAMMA*/19    // Gamma for soft constraint.
///*POINT_BIAS*/20     // Bias for soft constraint (x, y) (maxError derived).
//
///*POINT_DATA_SIZE*/22
var Physics2DPointConstraint = (function (_super) {
    __extends(Physics2DPointConstraint, _super);
    function Physics2DPointConstraint() {
        _super.apply(this, arguments);
        this.type = "POINT";
        this.dimension = 2;
        // ===============================================
        // Inherited
        this._ANCHOR_A = (5);
        this._ANCHOR_B = (7);
        // =========================================================
        // Inherited
        this._JACC = (16);
    }
    Physics2DPointConstraint.prototype._preStep = function (deltaTime) {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        Physics2DConstraint.prototype.rotateAnchor(data, b1, (5), (9));
        var rx1 = data[(9)];
        var ry1 = data[(9) + 1];

        Physics2DConstraint.prototype.rotateAnchor(data, b2, (7), (11));
        var rx2 = data[(11)];
        var ry2 = data[(11) + 1];

        // Compute non-inverted effective mass.
        var massSum = (b1[(0)] + b2[(0)]);
        var ii1 = b1[(1)];
        var ii2 = b2[(1)];
        data[(13)] = massSum + (ry1 * ii1 * ry1) + (ry2 * ii2 * ry2);
        data[(13) + 1] = -(rx1 * ii1 * ry1) - (rx2 * ii2 * ry2);
        data[(13) + 2] = massSum + (rx1 * ii1 * rx1) + (rx2 * ii2 * rx2);

        // Invert effective mass
        Physics2DConstraint.prototype.safe_invert2(data, (13), (16));

        if (!this._stiff) {
            data[(20)] = ((b1[(2)] + rx1) - (b2[(2)] + rx2));
            data[(20) + 1] = ((b1[(2) + 1] + ry1) - (b2[(2) + 1] + ry2));
            if (Physics2DConstraint.prototype.soft_params2(data, (13), (19), (20), deltaTime, this._breakUnderError)) {
                return true;
            }
        } else {
            data[(19)] = 0.0;
            data[(20)] = 0.0;
            data[(20) + 1] = 0.0;
        }

        var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
        data[(16)] *= dtRatio;
        data[(16) + 1] *= dtRatio;
        data[(18)] = (data[(2)] * deltaTime);

        return false;
    };

    Physics2DPointConstraint.prototype._warmStart = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var jx = data[(16)];
        var jy = data[(16) + 1];

        var im = b1[(0)];
        b1[(7)] -= (jx * im);
        b1[(7) + 1] -= (jy * im);
        b1[(7) + 2] -= (((data[(9)] * jy) - (data[(9) + 1] * jx)) * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (jx * im);
        b2[(7) + 1] += (jy * im);
        b2[(7) + 2] += (((data[(11)] * jy) - (data[(11) + 1] * jx)) * b2[(1)]);
    };

    Physics2DPointConstraint.prototype.getImpulseForBody = function (body, dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(3);
        }

        var data = this._data;

        var jx = data[(16)];
        var jy = data[(16) + 1];

        if (body === this.bodyA) {
            dst[0] = -jx;
            dst[1] = -jy;
            dst[2] = -((data[(9)] * jy) - (data[(9) + 1] * jx));
        } else if (body === this.bodyB) {
            dst[0] = jx;
            dst[1] = jy;
            dst[2] = ((data[(11)] * jy) - (data[(11) + 1] * jx));
        } else {
            dst[0] = dst[1] = dst[2] = 0;
        }

        return dst;
    };

    Physics2DPointConstraint.prototype._iterateVel = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var rx1 = data[(9)];
        var ry1 = data[(9) + 1];
        var rx2 = data[(11)];
        var ry2 = data[(11) + 1];

        // (x, y) = Bias - VelocityError
        var vw1 = b1[(7) + 2];
        var vw2 = b2[(7) + 2];
        var x = (data[(20)] - (b2[(7)] - (ry2 * vw2)) + (b1[(7)] - (ry1 * vw1)));
        var y = (data[(20) + 1] - (b2[(7) + 1] + (rx2 * vw2)) + (b1[(7) + 1] + (rx1 * vw1)));

        var jOldX = data[(16)];
        var jOldY = data[(16) + 1];
        var Kb = data[(13) + 1];
        var gamma = data[(19)];

        // Impulse.
        // (jx, jy) = K * (x, y) - (JAcc * gamma);
        var jx = ((data[(13)] * x) + (Kb * y)) - (jOldX * gamma);
        var jy = ((Kb * x) + (data[(13) + 2] * y)) - (jOldY * gamma);

        // Accumulate and clamp.
        var jAccX = (jOldX + jx);
        var jAccY = (jOldY + jy);
        var jsq = ((jAccX * jAccX) + (jAccY * jAccY));
        var jMax = data[(18)];
        if (this._breakUnderForce) {
            if (jsq > (jMax * jMax)) {
                return true;
            }
        } else if (!this._stiff) {
            if (jsq > (jMax * jMax)) {
                jsq = (jMax / Math.sqrt(jsq));
                jAccX *= jsq;
                jAccY *= jsq;
            }
        }

        jx = (jAccX - jOldX);
        jy = (jAccY - jOldY);
        data[(16)] = jAccX;
        data[(16) + 1] = jAccY;

        // Apply impulse
        var im = b1[(0)];
        b1[(7)] -= (jx * im);
        b1[(7) + 1] -= (jy * im);
        b1[(7) + 2] -= (((rx1 * jy) - (ry1 * jx)) * b1[(1)]);

        im = b2[(0)];
        b2[(7)] += (jx * im);
        b2[(7) + 1] += (jy * im);
        b2[(7) + 2] += (((rx2 * jy) - (ry2 * jx)) * b2[(1)]);

        return false;
    };

    Physics2DPointConstraint.prototype._iteratePos = function () {
        var data = this._data;
        var b1 = this.bodyA._data;
        var b2 = this.bodyB._data;

        var im1 = b1[(0)];
        var im2 = b2[(0)];
        var ii1 = b1[(1)];
        var ii2 = b2[(1)];

        Physics2DConstraint.prototype.rotateAnchor(data, b1, (5), (9));
        var rx1 = data[(9)];
        var ry1 = data[(9) + 1];

        Physics2DConstraint.prototype.rotateAnchor(data, b2, (7), (11));
        var rx2 = data[(11)];
        var ry2 = data[(11) + 1];

        // Positional error
        var errX = ((b1[(2)] + rx1) - (b2[(2)] + rx2));
        var errY = ((b1[(2) + 1] + ry1) - (b2[(2) + 1] + ry2));
        var elsq = ((errX * errX) + (errY * errY));
        var maxError = data[(3)];
        if (this._breakUnderError && (elsq > (maxError * maxError))) {
            return true;
        }

        if (elsq < Physics2DConfig.POINT_SLOP_SQ) {
            return false;
        }

        var scale = Physics2DConfig.POINT_BIAS_COEF;
        errX *= scale;
        errY *= scale;
        elsq *= (scale * scale);

        var massSum = (im1 + im2);
        var jx, jy;

        if (elsq > Physics2DConfig.POINT_LARGE_ERROR_SQ) {
            if (massSum > Physics2DConfig.EFF_MASS_EPSILON) {
                // We resolve error assuming infinite inertia (ignore rotation).
                var K = (Physics2DConfig.POINT_LARGE_ERROR_BIAS / massSum);
                jx = (errX * K);
                jy = (errY * K);

                // Clamp
                var jsq = ((jx * jx) + (jy * jy));
                var maxJ = Physics2DConfig.POINT_LARGE_ERROR_MAX;
                if (jsq > (maxJ * maxJ)) {
                    jsq = (maxJ / Math.sqrt(jsq));
                    jx *= jsq;
                    jy *= jsq;
                }

                // Apply impulse
                b1[(2)] -= (jx * im1);
                b1[(2) + 1] -= (jy * im1);
                b2[(2)] += (jx * im1);
                b2[(2) + 1] += (jy * im1);

                // Recompute error.
                errX = ((b1[(2)] + rx1) - (b2[(2)] + rx2));
                errY = ((b1[(2) + 1] + ry1) - (b2[(2) + 1] + ry2));
                errX *= scale;
                errY *= scale;
                elsq = ((errX * errX) + (errY * errY));
            }
        }

        // Compute non-inverted effective mass.
        data[(13)] = (massSum + (ry1 * ii1 * ry1) + (ry2 * ii2 * ry2));
        data[(13) + 1] = (-(rx1 * ii1 * ry1) - (rx2 * ii2 * ry2));
        data[(13) + 2] = (massSum + (rx1 * ii1 * rx1) + (rx2 * ii2 * rx2));

        if (elsq > Physics2DConfig.POINT_MAX_ERROR_SQ) {
            elsq = (Physics2DConfig.POINT_MAX_ERROR / Math.sqrt(elsq));
            errX *= elsq;
            errY *= elsq;
        }

        data[(20)] = errX;
        data[(20) + 1] = errY;
        Physics2DConstraint.prototype.safe_solve2(data, (13), (20), (20));
        jx = data[(20)];
        jy = data[(20) + 1];

        // Apply impulse
        b1[(2)] -= (jx * im1);
        b1[(2) + 1] -= (jy * im1);
        var dW = -(((rx1 * jy) - (ry1 * jx)) * ii1);
        if (dW !== 0) {
            this.bodyA._deltaRotation(dW);
        }

        b2[(2)] += (jx * im2);
        b2[(2) + 1] += (jy * im2);
        dW = (((rx2 * jy) - (ry2 * jx)) * ii2);
        if (dW !== 0) {
            this.bodyB._deltaRotation(dW);
        }

        return false;
    };

    Physics2DPointConstraint.create = // params = {
    //   bodyA, bodyB,
    //   anchorA, anchorB,
    //   ... common constraint params
    // }
    function (params) {
        var p = new Physics2DPointConstraint();
        var data = p._data = new Physics2DDevice.prototype.floatArray((22));
        Physics2DConstraint.prototype.init(p, params);

        var anchor = params.anchorA;
        data[(5)] = (anchor ? anchor[0] : 0);
        data[(5) + 1] = (anchor ? anchor[1] : 0);

        anchor = params.anchorB;
        data[(7)] = (anchor ? anchor[0] : 0);
        data[(7) + 1] = (anchor ? anchor[1] : 0);

        p.bodyA = params.bodyA;
        p.bodyB = params.bodyB;

        return p;
    };
    return Physics2DPointConstraint;
})(Physics2DConstraint);

// Inherited
Physics2DPointConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
Physics2DPointConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
Physics2DPointConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
Physics2DPointConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
Physics2DPointConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;

;

var Physics2DShape = (function () {
    function Physics2DShape() {
    }
    // _validate()
    // {
    //     debug.abort("abstract method");
    // }
    // Abstract methods (have to have a body unfortunately)
    Physics2DShape.prototype.computeArea = function () {
        debug.abort("abstract method");
        return 0;
    };
    Physics2DShape.prototype.computeMasslessInertia = function () {
        debug.abort("abstract method");
        return 0;
    };
    Physics2DShape.prototype.computeCenterOfMass = function (dst/*v2*/ ) {
        debug.abort("abstract method");
        return null;
    };

    // {
    //     debug.abort("abstract method"); return 0;
    // }
    Physics2DShape.prototype.translate = function (translation, skip) {
        debug.abort("abstract method");
    };
    Physics2DShape.prototype._update = function (posX, posY, cos, sin, skipAABB) {
        debug.abort("abstract method");
    };
    Physics2DShape.prototype.clone = function () {
        debug.abort("abstract method");
        return undefined;
    };

    // Methods
    Physics2DShape.prototype.getGroup = function () {
        return this._group;
    };

    Physics2DShape.prototype.setGroup = function (group) {
        this._group = group;
        if (this.body) {
            this.body.wake(true);
        }
    };

    Physics2DShape.prototype.getMask = function () {
        return this._mask;
    };

    Physics2DShape.prototype.setMask = function (mask) {
        this._mask = mask;
        if (this.body) {
            this.body.wake(true);
        }
    };

    Physics2DShape.prototype.getMaterial = function () {
        return this._material;
    };

    Physics2DShape.prototype.setMaterial = function (material) {
        if (this._material !== material) {
            this._material = material;
            if (this.body) {
                this.body._invalidate();
            }

            var arbiters = this.arbiters;
            var limit2 = arbiters.length;
            var j;
            for (j = 0; j < limit2; j += 1) {
                arbiters[j]._invalidate();
            }
        }
    };

    Physics2DShape.prototype.copyCommon = function (from, to) {
        to._type = from._type;

        to._material = from._material;
        to._group = from._group;
        to._mask = from._mask;
        to.sensor = from.sensor;

        to.id = Physics2DShape.uniqueId;
        Physics2DShape.uniqueId += 1;

        to.arbiters = [];
        to._bphaseHandle = null;

        to.userData = from.userData;

        var fromData = from._data;
        var limit = from._data.length;
        var toData = to._data = new Physics2DDevice.prototype.floatArray(limit);
        var i;
        for (i = 0; i < limit; i += 1) {
            toData[i] = fromData[i];
        }

        to._onPreSolve = [];
        to._events = [];
    };

    Physics2DShape.prototype.init = function (shape, params) {
        shape._material = params.material || Physics2DMaterial.create();
        shape._group = (params.group !== undefined) ? params.group : 1;
        shape._mask = (params.mask !== undefined) ? params.mask : 0xffffffff;
        shape.sensor = (params.sensor !== undefined) ? params.sensor : false;

        shape.arbiters = [];
        shape._bphaseHandle = null;
        shape.userData = (params.userData !== undefined) ? params.userData : null;

        shape.id = Physics2DShape.uniqueId;
        Physics2DShape.uniqueId += 1;

        shape._onPreSolve = [];
        shape._events = [];
    };

    Physics2DShape.eventIndex = // =============================================================================
    function (events, type, callback, callbackMask) {
        var limit = events.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var eventObject = events[i];
            if (eventObject.callback === callback && eventObject.mask === callbackMask && eventObject.type === type) {
                return i;
            }
        }

        return -1;
    };

    Physics2DShape.prototype.addEventListener = function (eventType, callback, callbackMask, deterministic) {
        var events, type;
        if (eventType === 'preSolve') {
            events = this._onPreSolve;
            type = (6);
        } else {
            events = this._events;
            type = (eventType === 'begin' ? (1) : eventType === 'progress' ? (2) : eventType === 'end' ? (3) : null);
        }

        if (type === null) {
            return false;
        }

        if (eventType !== 'preSolve') {
            deterministic = undefined;
        } else if (deterministic === undefined) {
            deterministic = false;
        }

        var index = Physics2DShape.eventIndex(events, type, callback, callbackMask);
        if (index !== -1) {
            return false;
        }

        events.push({
            callback: callback,
            mask: callbackMask,
            type: type,
            deterministic: deterministic
        });

        if (this.body) {
            this.body.wake(true);
        }

        return true;
    };

    Physics2DShape.prototype.removeEventListener = function (eventType, callback, callbackMask) {
        var events, type;
        if (eventType === 'preSolve') {
            events = this._onPreSolve;
            type = (6);
        } else {
            events = this._events;
            type = (eventType === 'begin' ? (1) : eventType === 'progress' ? (2) : eventType === 'end' ? (3) : null);
        }

        if (type === null) {
            return false;
        }

        var index = Physics2DShape.eventIndex(events, type, callback, callbackMask);
        if (index === -1) {
            return false;
        }

        // Need to keep order, cannot use swap-pop
        events.splice(index, 1);

        if (this.body) {
            this.body.wake(true);
        }

        return true;
    };
    Physics2DShape.uniqueId = 0;
    return Physics2DShape;
})();

// =========================================================================
//
// Physics2D Circle
//
// CIRCLE DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*CIRCLE_RADIUS*/6    // Radius of circle about its origin
///*CIRCLE_LOCAL*/7     // Local position of circle origin (x, y)
///*CIRCLE_WORLD*/9     // World position of circle origin (x, y)
//
///*CIRCLE_DATA_SIZE*/11
var Physics2DCircle = (function (_super) {
    __extends(Physics2DCircle, _super);
    function Physics2DCircle() {
        _super.call(this);
        this.type = "CIRCLE";
    }
    // ==============================================================
    Physics2DCircle.prototype.computeArea = function () {
        var r = this._data[(6)];
        return (Math.PI * r * r);
    };

    Physics2DCircle.prototype.computeMasslessInertia = function () {
        var data = this._data;
        var r = this._data[(6)];
        var x = data[(7)];
        var y = data[(7) + 1];
        return ((0.5 * r * r) + ((x * x) + (y * y)));
    };

    // ==============================================================
    Physics2DCircle.prototype.getRadius = function () {
        return this._data[(6)];
    };

    Physics2DCircle.prototype.setRadius = function (radius) {
        var body = this.body;
        if (body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        var data = this._data;
        if (radius !== data[(6)]) {
            data[(6)] = radius;
            this._validate();
            if (body) {
                body._invalidate();
            }
        }
    };

    // ==============================================================
    Physics2DCircle.prototype.getOrigin = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        dst[0] = data[(7)];
        dst[1] = data[(7) + 1];
        return dst;
    };

    Physics2DCircle.prototype.setOrigin = function (origin/*v2*/ ) {
        var body = this.body;
        if (body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        var data = this._data;
        var originX = origin[0];
        var originY = origin[1];

        if (data[(7)] !== originX || data[(7) + 1] !== originY) {
            data[(7)] = originX;
            data[(7) + 1] = originY;
            this._validate();
            if (body) {
                body._invalidate();
            }
        }
    };

    // ==============================================================
    Physics2DCircle.prototype.clone = function () {
        var c = new Physics2DCircle();
        Physics2DShape.prototype.copyCommon(this, c);
        return c;
    };

    // ==============================================================
    Physics2DCircle.prototype.scale = function (scale) {
        if (scale <= 0) {
            return;
        }

        var body = this.body;
        if (body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        var data = this._data;
        data[(7)] *= scale;
        data[(7) + 1] *= scale;
        data[(6)] *= scale;

        this._validate();
        if (body) {
            body._invalidate();
        }
    };

    Physics2DCircle.prototype.translate = function (translation/*v2*/ , skip) {
        var body = this.body;
        if (!skip && body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        var data = this._data;
        data[(7)] += translation[0];
        data[(7) + 1] += translation[1];

        this._validate();
        if (!skip && body) {
            body._invalidate();
        }
    };

    Physics2DCircle.prototype.rotate = function (rotation) {
        var body = this.body;
        if (body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        var cos = Math.cos(rotation);
        var sin = Math.sin(rotation);
        var data = this._data;
        var x = data[(7)];
        var y = data[(7) + 1];
        data[(7)] = ((cos * x) - (sin * y));
        data[(7) + 1] = ((sin * x) + (cos * y));

        this._validate();
        if (body) {
            body._invalidate();
        }
    };

    Physics2DCircle.prototype.transform = function (matrix/*m23*/ ) {
        var body = this.body;
        if (body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        // a b tx
        // c d ty
        var a = matrix[0];
        var b = matrix[2];
        var c = matrix[1];
        var d = matrix[3];

        var data = this._data;
        var det = ((a * d) - (b * c));
        if (det <= 0) {
            return;
        }

        data[(6)] *= Math.sqrt(det);

        var x = data[(7)];
        var y = data[(7) + 1];
        data[(7)] = ((a * x) + (b * y) + matrix[4]);
        data[(7) + 1] = ((c * x) + (d * y) + matrix[5]);

        this._validate();
        if (body) {
            body._invalidate();
        }
    };

    // ==============================================================
    Physics2DCircle.prototype._update = function (posX, posY, cos, sin, skipAABB) {
        var data = this._data;
        var originX = data[(7)];
        var originY = data[(7) + 1];
        var ox = data[(9)] = posX + (cos * originX) - (sin * originY);
        var oy = data[(9) + 1] = posY + (sin * originX) + (cos * originY);

        if (!skipAABB) {
            var radius = data[(6)];
            data[(0)] = (ox - radius);
            data[(0) + 1] = (oy - radius);
            data[(0) + 2] = (ox + radius);
            data[(0) + 3] = (oy + radius);
        }
    };

    Physics2DCircle.prototype._validate = function () {
        var data = this._data;
        var originX = data[(7)];
        var originY = data[(7) + 1];
        var radius = data[(6)];

        var olength = Math.sqrt((originX * originX) + (originY * originY));
        data[(4)] = (radius + olength);
        data[(5)] = (data[(4)] - Math.max(radius - olength, 0));
    };

    Physics2DCircle.prototype.computeCenterOfMass = function (dst/*v2*/ ) {
        return this.getOrigin(dst);
    };

    Physics2DCircle.create = // params = {
    //      radius: ##,
    //      origin: [##, ##] = [0, 0],
    //      ... common shape props.
    // }
    function (params) {
        var c = new Physics2DCircle();
        c._type = (0);
        Physics2DShape.prototype.init(c, params);

        var radius = params.radius;
        var originX = (params.origin ? params.origin[0] : 0);
        var originY = (params.origin ? params.origin[1] : 0);

        var data = c._data = new Physics2DDevice.prototype.floatArray((11));
        data[(6)] = radius;
        data[(7)] = originX;
        data[(7) + 1] = originY;
        c._validate();

        return c;
    };
    Physics2DCircle.version = 1;
    return Physics2DCircle;
})(Physics2DShape);

// =========================================================================
//
// Physics2D Polygon
//
// POLYGON DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*POLY_VERTICES*/6   // Start of vertex data
///*POLY_STRIDE*/13    // Values per vertex till end of object.
//
// PER VERTEX CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*POLY_LOCAL*/0     // Local position of vertex (x, y)
///*POLY_WORLD*/2     // World position of vertex (x, y)
///*POLY_LNORMAL*/4   // Local normal of edge starting at vertex (x, y)
///*POLY_WNORMAL*/6   // World normal of edge starting at vertex (x, y)
///*POLY_LPROJ*/8     // Local projection of polygon to edge.
///*POLY_WPROJ*/9      // World projection of polygon to edge.
///*POLY_CROSS1*/10    // World cross-projection of vertex to its edge.
///*POLY_CROSS2*/11   // World cross-projection of 'next' vertex to this edge.
///*POLY_LENGTH*/12   // Length of edge startinga t this vertex.
var Physics2DPolygon = (function (_super) {
    __extends(Physics2DPolygon, _super);
    function Physics2DPolygon() {
        _super.call(this);
        this.type = "POLYGON";
    }
    Physics2DPolygon.prototype.computeArea = function () {
        var data = this._data;
        var index = (6);
        var limit = data.length;
        var doubleArea = 0;
        for (; index < limit; index += (13)) {
            var next = index + (13);
            if (next === limit) {
                next = (6);
            }

            doubleArea += ((data[index + (0)] * data[next + (0) + 1]) - (data[index + (0) + 1] * data[next + (0)]));
        }
        return (doubleArea * 0.5);
    };

    Physics2DPolygon.prototype.computeMasslessInertia = function () {
        var data = this._data;
        var index = (6);
        var limit = data.length;
        var s1 = 0;
        var s2 = 0;
        for (; index < limit; index += (13)) {
            var next = index + (13);
            if (next === limit) {
                next = (6);
            }

            var x1 = data[index + (0)];
            var y1 = data[index + (0) + 1];
            var x2 = data[next + (0)];
            var y2 = data[next + (0) + 1];

            var a = (x1 * y2) - (x2 * y1);
            var b = ((x1 * x1) + (y1 * y1)) + ((x2 * x2) + (y2 * y2)) + ((x1 * x2) + (y1 * y2));

            s1 += (a * b);
            s2 += a;
        }

        return (s1 / (6 * s2));
    };

    // Workaround for TS lack of support for abstract methods
    Physics2DPolygon.prototype.computeCenterOfMass = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }

        var data = this._data;
        var index = (6);
        var limit = data.length;
        var doubleArea = 0;
        var cx = 0;
        var cy = 0;
        for (; index < limit; index += (13)) {
            var next = index + (13);
            if (next === limit) {
                next = (6);
            }

            var x1 = data[index + (0)];
            var y1 = data[index + (0) + 1];
            var x2 = data[next + (0)];
            var y2 = data[next + (0) + 1];

            var cross = ((x1 * y2) - (y1 * x2));
            doubleArea += cross;
            cx += ((x1 + x2) * cross);
            cy += ((y1 + y2) * cross);
        }

        var rec = (1 / (3 * doubleArea));
        dst[0] = (cx * rec);
        dst[1] = (cy * rec);

        return dst;
    };

    // ===========================================================================
    Physics2DPolygon.prototype.setVertices = function (vertices/*v2[]*/ ) {
        var body = this.body;
        if (body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        this._validate(vertices);
        if (body) {
            body._invalidate();
        }
    };

    // ===========================================================================
    Physics2DPolygon.prototype.clone = function () {
        var c = new Physics2DPolygon();
        Physics2DShape.prototype.copyCommon(this, c);
        return c;
    };

    // ===========================================================================
    Physics2DPolygon.prototype.scale = function (scaleX, scaleY) {
        var body = this.body;
        if (body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        if (scaleY === undefined) {
            scaleY = scaleX;
        }

        if (scaleX <= 0 || scaleY <= 0) {
            return;
        }

        var iscaleX = (1 / scaleX);
        var iscaleY = (1 / scaleY);

        var data = this._data;
        var limit = data.length;
        var index = (6);

        var radius = 0.0;
        var minProj = Number.POSITIVE_INFINITY;
        for (; index < limit; index += (13)) {
            var x = (data[index + (0)] *= scaleX);
            var y = (data[index + (0) + 1] *= scaleY);

            var nx = (data[index + (4)] * iscaleX);
            var ny = (data[index + (4) + 1] * iscaleY);
            var rec = (1 / Math.sqrt((nx * nx) + (ny * ny)));

            data[index + (4)] = (nx *= rec);
            data[index + (4) + 1] = (ny *= rec);
            var lproj = data[index + (8)] = ((nx * x) + (ny * y));
            if (lproj < minProj) {
                minProj = lproj;
            }
            var vlsq = ((x * x) + (y * y));
            if (vlsq > radius) {
                radius = vlsq;
            }

            var next = (index + (13));
            if (next === limit) {
                next = (6);
            }

            var dx = ((data[next + (0)] * scaleX) - x);
            var dy = ((data[next + (0) + 1] * scaleY) - y);
            var dL = Math.sqrt((dx * dx) + (dy * dy));
            data[index + (12)] = dL;
        }

        data[(4)] = Math.sqrt(radius);
        data[(5)] = (data[(4)] - Math.max(minProj, 0));
        if (body) {
            body._invalidate();
        }
    };

    Physics2DPolygon.prototype.translate = function (translation/*v2*/ , skip) {
        var body = this.body;
        if (!skip && body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        var data = this._data;
        var limit = data.length;
        var index = (6);

        var tx = translation[0];
        var ty = translation[1];

        var radius = 0.0;
        var minProj = Number.POSITIVE_INFINITY;
        for (; index < limit; index += (13)) {
            var x = (data[index + (0)] += tx);
            var y = (data[index + (0) + 1] += ty);

            var nx = data[index + (4)];
            var ny = data[index + (4) + 1];
            var lproj = (data[index + (8)] += ((nx * tx) + (ny * ty)));
            if (lproj < minProj) {
                minProj = lproj;
            }
            var vlsq = ((x * x) + (y * y));
            if (vlsq > radius) {
                radius = vlsq;
            }
            // Translation does not effect local normal or edge length.
        }

        data[(4)] = Math.sqrt(radius);
        data[(5)] = (data[(4)] - Math.max(minProj, 0));
        if (!skip && body) {
            body._invalidate();
        }
    };

    Physics2DPolygon.prototype.rotate = function (rotation) {
        var body = this.body;
        if (body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        var data = this._data;
        var limit = data.length;
        var index = (6);

        var cos = Math.cos(rotation);
        var sin = Math.sin(rotation);

        for (; index < limit; index += (13)) {
            var x = data[index + (0)];
            var y = data[index + (0) + 1];
            data[index + (0)] = ((x * cos) - (y * sin));
            data[index + (0) + 1] = ((x * sin) + (y * cos));

            x = data[index + (4)];
            y = data[index + (4) + 1];
            data[index + (4)] = ((x * cos) - (y * sin));
            data[index + (4) + 1] = ((x * sin) + (y * cos));
            // Rotation does not effect local projection, edge length
            // nor does it effect radius and sweep factor.
        }

        if (body) {
            body._invalidate();
        }
    };

    Physics2DPolygon.prototype.transform = function (matrix/*m32*/ ) {
        var body = this.body;
        if (body && body.world && (body._type === (2) || body.world._midStep)) {
            return;
        }

        // a b tx
        // c d ty
        var a = matrix[0];
        var b = matrix[2];
        var c = matrix[1];
        var d = matrix[3];
        var tx = matrix[4];
        var ty = matrix[5];

        if (((a * d) - (b * c)) <= 0) {
            return;
        }

        var data = this._data;
        var limit = data.length;
        var index = (6);
        var x, y;
        for (; index < limit; index += (13)) {
            x = data[index + (0)];
            y = data[index + (0) + 1];
            data[index + (0)] = ((a * x) + (b * y) + tx);
            data[index + (0) + 1] = ((c * x) + (d * y) + ty);
        }

        var radius = 0.0;
        var minProj = Number.POSITIVE_INFINITY;
        index = (6);
        for (; index < limit; index += (13)) {
            x = data[index + (0)];
            y = data[index + (0) + 1];

            var next = (index + (13));
            if (next === limit) {
                next = (6);
            }

            var dx = -(data[next + (0)] - x);
            var dy = -(data[next + (0) + 1] - y);
            var dL = Math.sqrt((dx * dx) + (dy * dy));
            var rec = (1 / dL);

            var nx = (-dy * rec);
            var ny = (dx * rec);

            data[index + (4)] = nx;
            data[index + (4) + 1] = ny;
            data[index + (12)] = dL;
            var lproj = data[index + (8)] = ((nx * x) + (ny * y));

            var vlsq = ((x * x) + (y * y));
            if (vlsq > radius) {
                radius = vlsq;
            }
            if (lproj < minProj) {
                minProj = lproj;
            }
        }

        data[(4)] = Math.sqrt(radius);
        data[(5)] = (data[(4)] - Math.max(minProj, 0));
        if (body) {
            body._invalidate();
        }
    };

    // ===========================================================================
    Physics2DPolygon.prototype._update = function (posX, posY, cos, sin, skipAABB) {
        var data = this._data;
        var limit = data.length;
        var index = (6);
        var j;

        var minX, minY, maxX, maxY;
        for (; index < limit; index += (13)) {
            // Compute world-space vertex.
            var x = data[index + (0)];
            var y = data[index + (0) + 1];
            var vX = data[index + (2)] = posX + (cos * x) - (sin * y);
            var vY = data[index + (2) + 1] = posY + (sin * x) + (cos * y);

            // Compute world-space normal.
            x = data[index + (4)];
            y = data[index + (4) + 1];
            var nx = data[index + (6)] = (cos * x) - (sin * y);
            var ny = data[index + (6) + 1] = (sin * x) + (cos * y);

            // Compute world-space projections.
            data[index + (9)] = (nx * vX) + (ny * vY);
            data[index + (10)] = (nx * vY) - (ny * vX);
            if (index !== (6)) {
                j = index - (13);
                data[j + (11)] = ((data[j + (6)] * vY) - (data[j + (6) + 1] * vX));

                if (!skipAABB) {
                    if (vX < minX) {
                        minX = vX;
                    } else if (vX > maxX) {
                        maxX = vX;
                    }

                    if (vY < minY) {
                        minY = vY;
                    } else if (vY > maxY) {
                        maxY = vY;
                    }
                }
            } else if (!skipAABB) {
                // Init. partial AABB.
                minX = maxX = vX;
                minY = maxY = vY;
            }
        }

        // Compute remaining projection
        index = (6);
        j = data.length - (13);
        data[j + (11)] = ((data[j + (6)] * data[index + (2) + 1]) - (data[j + (6) + 1] * data[index + (2)]));

        if (!skipAABB) {
            // AABB
            data[(0)] = minX;
            data[(0) + 1] = minY;
            data[(0) + 2] = maxX;
            data[(0) + 3] = maxY;
        }
    };

    Physics2DPolygon.prototype._validate = function (vertices/*v2[]*/ ) {
        var vCount = vertices.length;
        var data = this._data;

        // Avoid recreating array if number of vertices is unchanged!
        var newLimit = (6) + (vCount * (13));
        if (!data || newLimit !== data.length) {
            data = this._data = new Physics2DDevice.prototype.floatArray(newLimit);
        }

        var radius = 0.0;
        var minProj = Number.POSITIVE_INFINITY;

        var index = (6);
        var i;
        for (i = 0; i < vCount; i += 1, index += (13)) {
            var v1 = vertices[i];
            var v2 = vertices[(i === (vCount - 1) ? 0 : (i + 1))];

            var x = v1[0];
            var y = v1[1];
            var dx = x - v2[0];
            var dy = y - v2[1];
            var dL = Math.sqrt((dx * dx) + (dy * dy));
            var rec = (1 / dL);

            var nx = (-dy * rec);
            var ny = (dx * rec);

            data[index + (0)] = x;
            data[index + (0) + 1] = y;
            data[index + (4)] = nx;
            data[index + (4) + 1] = ny;
            data[index + (12)] = dL;
            var lproj = data[index + (8)] = ((nx * x) + (ny * y));

            // ---
            var vlsq = ((x * x) + (y * y));
            if (vlsq > radius) {
                radius = vlsq;
            }
            if (lproj < minProj) {
                minProj = lproj;
            }
        }

        data[(4)] = Math.sqrt(radius);
        data[(5)] = (data[(4)] - Math.max(minProj, 0));
    };

    Physics2DPolygon.create = // params = {
    //      vertices: [v2, v2, ...]  (CLOCKWISE)
    //      ... common shape props.
    // }
    // inVertices optionally replacing params.vertices
    function (params, inVertices) {
        var p = new Physics2DPolygon();
        p._type = (1);
        Physics2DShape.prototype.init(p, params);

        p._validate(inVertices || params.vertices);
        return p;
    };
    Physics2DPolygon.version = 1;
    return Physics2DPolygon;
})(Physics2DShape);

// =========================================================================
//
// Physics2D Rigid Body
//
// BODY DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*BODY_IMASS*/0           // 1 / mass (possibly 0) for body. Always 0 for non-dynamic
///*BODY_IINERTIA*/1        // 1 / inertia (possibly 0) for body. Always 0 for non-dynamic
///*BODY_POS*/2             // World position and rotation (CW rad) of body (x, y, r)
///*BODY_AXIS*/5            // (cos(rotation), sin(rotation))
///*BODY_VEL*/7             // World velocity and ang.vel of body (vx, vy, w)
///*BODY_FORCE*/10          // World force + torque, persistently applied (fx, fy, t)
///*BODY_SURFACE_VEL*/13    // Surface velocity biasing contact physics (vt, vn)
///*BODY_PRE_POS*/15        // Previous position and rotation (x, y, r)
///*BODY_SWEEP_TIME*/18     // Time alpha for current partial integration of body.
///*BODY_RADIUS*/19         // Approximate radius of body about its origin.
///*BODY_SWEEP_ANGVEL*/20   // Angular velocity % (2 * pi / timeStep) for sweeps.
///*BODY_LIN_DRAG*/21       // Log of (1 - linear drag).
///*BODY_ANG_DRAG*/22       // Log of (1 - angular drag).
///*BODY_MASS*/23           // Untainted by body type mass.
///*BODY_INERTIA*/24        // Untainted by body type inertia.
//
///*BODY_DATA_SIZE*/25
//
// BODY TYPE CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*TYPE_DYNAMIC*/0
///*TYPE_KINEMATIC*/1
///*TYPE_STATIC*/2
var Physics2DRigidBody = (function () {
    function Physics2DRigidBody() {
    }
    Physics2DRigidBody.prototype.isDynamic = function () {
        return (this._type === (0));
    };

    Physics2DRigidBody.prototype.setAsDynamic = function () {
        if (this.world && this.world._midStep) {
            return;
        }

        this._setTypeValue((0));
        var data = this._data;

        var mass = data[(23)];
        var inertia = data[(24)];
        data[(0)] = (mass === Number.POSITIVE_INFINITY ? 0 : (1 / mass));
        data[(1)] = (inertia === Number.POSITIVE_INFINITY ? 0 : (1 / inertia));
    };

    Physics2DRigidBody.prototype.isStatic = function () {
        return (this._type === (2));
    };

    Physics2DRigidBody.prototype.setAsStatic = function () {
        if (this.world && this.world._midStep) {
            return;
        }

        this._setTypeValue((2));
        var data = this._data;
        data[(0)] = data[(1)] = 0;

        // Static body cannot have velocity
        data[(7)] = data[(7) + 1] = data[(7) + 2] = 0;
    };

    Physics2DRigidBody.prototype.isKinematic = function () {
        return (this._type === (1));
    };

    Physics2DRigidBody.prototype.setAsKinematic = function () {
        if (this.world && this.world._midStep) {
            return;
        }

        this._setTypeValue((1));
        var data = this._data;
        data[(0)] = data[(1)] = 0;
    };

    Physics2DRigidBody.prototype._setTypeValue = function (newType) {
        if (newType === this._type) {
            return;
        }

        if (!this.world) {
            this._type = newType;
            return;
        }

        this.world._transmitBodyType(this, newType);
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.applyImpulse = function (impulse/*v2*/ , position/*v2*/ ) {
        if (this._type !== (0)) {
            return;
        }

        var data = this._data;
        var x, y;
        if (position) {
            x = (position[0] - data[(2)]);
            y = (position[1] - data[(2) + 1]);
        } else {
            x = 0;
            y = 0;
        }
        var ix = impulse[0];
        var iy = impulse[1];
        var im = data[(0)];
        data[(7)] += (ix * im);
        data[(7) + 1] += (iy * im);
        data[(7) + 2] += (((x * iy) - (y * ix)) * data[(1)]);
        this.wake(true);
    };

    Physics2DRigidBody.prototype.setVelocityFromPosition = function (newPosition/*v2*/ , newRotation, deltaTime) {
        if (this._type === (2)) {
            return;
        }

        var data = this._data;
        var idt = (1 / deltaTime);
        data[(7)] = ((newPosition[0] - data[(2)]) * idt);
        data[(7) + 1] = ((newPosition[1] - data[(2) + 1]) * idt);
        data[(7) + 2] = ((newRotation - data[(2) + 2]) * idt);
        this.wake(true);
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.transformWorldPointToLocal = function (src/*v2*/ , dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        var cos = data[(5)];
        var sin = data[(5) + 1];
        var x = (src[0] - data[(2)]);
        var y = (src[1] - data[(2) + 1]);
        dst[0] = ((cos * x) + (sin * y));
        dst[1] = ((cos * y) - (sin * x));
        return dst;
    };

    Physics2DRigidBody.prototype.transformWorldVectorToLocal = function (src/*v2*/ , dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        var cos = data[(5)];
        var sin = data[(5) + 1];
        var x = src[0];
        var y = src[1];
        dst[0] = ((cos * x) + (sin * y));
        dst[1] = ((cos * y) - (sin * x));
        return dst;
    };

    Physics2DRigidBody.prototype.transformLocalPointToWorld = function (src/*v2*/ , dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        var cos = data[(5)];
        var sin = data[(5) + 1];
        var x = src[0];
        var y = src[1];
        dst[0] = ((cos * x) - (sin * y) + data[(2)]);
        dst[1] = ((sin * x) + (cos * y) + data[(2) + 1]);
        return dst;
    };

    Physics2DRigidBody.prototype.transformLocalVectorToWorld = function (src/*v2*/ , dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        var cos = data[(5)];
        var sin = data[(5) + 1];
        var x = src[0];
        var y = src[1];
        dst[0] = ((cos * x) - (sin * y));
        dst[1] = ((sin * x) + (cos * y));
        return dst;
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.getPosition = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }

        var data = this._data;
        dst[0] = data[(2)];
        dst[1] = data[(2) + 1];
        return dst;
    };

    Physics2DRigidBody.prototype.setPosition = function (position/*v2*/ ) {
        if (this.world && (this.world._midStep || this._type === (2))) {
            return;
        }

        var data = this._data;
        var newX = position[0];
        var newY = position[1];
        if ((data[(2)] !== newX) || (data[(2) + 1] !== newY)) {
            data[(2)] = newX;
            data[(2) + 1] = newY;
            this._invalidated = true;
            this.wake(true);
        }
    };

    Physics2DRigidBody.prototype.getRotation = function () {
        return this._data[(2) + 2];
    };

    Physics2DRigidBody.prototype.setRotation = function (rotation) {
        if (this.world && (this.world._midStep || this._type === (2))) {
            return;
        }

        var data = this._data;
        if (data[(2) + 2] !== rotation) {
            this._data[(2) + 2] = rotation;
            this._data[(5)] = Math.cos(rotation);
            this._data[(5) + 1] = Math.sin(rotation);
            this._invalidated = true;
            this.wake(true);
        }
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.getVelocity = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }

        var data = this._data;
        dst[0] = data[(7)];
        dst[1] = data[(7) + 1];
        return dst;
    };

    Physics2DRigidBody.prototype.setVelocity = function (velocity/*v2*/ ) {
        if (this._type === (2)) {
            return;
        }

        var data = this._data;
        var newX = velocity[0];
        var newY = velocity[1];
        if ((data[(7)] !== newX) || (data[(7) + 1] !== newY)) {
            data[(7)] = newX;
            data[(7) + 1] = newY;
            this.wake(true);
        }
    };

    Physics2DRigidBody.prototype.getAngularVelocity = function () {
        return this._data[(7) + 2];
    };

    Physics2DRigidBody.prototype.setAngularVelocity = function (angularVelocity) {
        if (this._type === (2)) {
            return;
        }

        var data = this._data;
        if (data[(7) + 2] !== angularVelocity) {
            data[(7) + 2] = angularVelocity;
            this.wake(true);
        }
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.getForce = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }

        var data = this._data;
        dst[0] = data[(10)];
        dst[1] = data[(10) + 1];
        return dst;
    };

    Physics2DRigidBody.prototype.setForce = function (force/*v2*/ ) {
        var data = this._data;
        var newX = force[0];
        var newY = force[1];
        if ((data[(10)] !== newX) || (data[(10) + 1] !== newY)) {
            data[(10)] = newX;
            data[(10) + 1] = newY;

            // we wake static/kinematic bodies even if force has no effect
            // incase user has some crazy callback that queries force to
            // make a decision
            this.wake(true);
        }
    };

    Physics2DRigidBody.prototype.getTorque = function () {
        return this._data[(10) + 2];
    };

    Physics2DRigidBody.prototype.setTorque = function (torque) {
        var data = this._data;
        if (data[(10) + 2] !== torque) {
            data[(10) + 2] = torque;

            // we wake static/kinematic bodies even if force has no effect
            // incase user has some crazy callback that queries torque to
            // make a decision
            this.wake(true);
        }
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.getSurfaceVelocity = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }

        var data = this._data;
        dst[0] = data[(13)];
        dst[1] = data[(13) + 1];
        return dst;
    };

    Physics2DRigidBody.prototype.setSurfaceVelocity = function (surfaceVelocity/*v2*/ ) {
        var data = this._data;
        data[(13)] = surfaceVelocity[0];
        data[(13) + 1] = surfaceVelocity[1];
        this.wake(true);
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.getMass = function () {
        return this._data[(23)];
    };

    Physics2DRigidBody.prototype.getInertia = function () {
        return this._data[(24)];
    };

    Physics2DRigidBody.prototype.setMass = function (mass) {
        var data = this._data;
        var oldMass = data[(23)];
        if (!this._customMass || (oldMass !== mass)) {
            data[(23)] = mass;
            this._customMass = true;
            this._invalidateMassInertia();
        }
    };

    Physics2DRigidBody.prototype.setMassFromShapes = function () {
        if (this._customMass) {
            this._customMass = false;
            this._data[(23)] = this.computeMassFromShapes();
            this._invalidateMassInertia();
        }
    };

    Physics2DRigidBody.prototype.setInertia = function (inertia) {
        var data = this._data;
        var oldInertia = data[(24)];
        if (!this._customInertia || (oldInertia !== inertia)) {
            data[(24)] = inertia;
            this._customInertia = true;
            this._invalidateMassInertia();
        }
    };

    Physics2DRigidBody.prototype.setInertiaFromShapes = function () {
        if (this._customInertia) {
            this._customInertia = false;
            this._data[(24)] = this.computeInertiaFromShapes();
            this._invalidateMassInertia();
        }
    };

    Physics2DRigidBody.prototype._invalidateMassInertia = function () {
        var data = this._data;
        var mass = data[(23)];
        var inertia = data[(24)];

        var staticType = (this._type !== (0));
        var inf = Number.POSITIVE_INFINITY;
        data[(0)] = (staticType || mass === inf) ? 0 : (1 / mass);
        data[(1)] = (staticType || inertia === inf) ? 0 : (1 / inertia);

        // We wake body, even if static/kinematic incase user has some crazy
        // callback which queries mass/inertia to make decision
        this.wake(true);
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.getLinearDrag = function () {
        return (1 - Math.exp(this._data[(21)]));
    };

    Physics2DRigidBody.prototype.setLinearDrag = function (linearDrag) {
        this._data[(21)] = Math.log(1 - linearDrag);

        // We wake body, even if static/kinematic incase user has some crazy
        // callback which queries mass/inertia to make decision
        this.wake(true);
    };

    Physics2DRigidBody.prototype.getAngularDrag = function () {
        return (1 - Math.exp(this._data[(22)]));
    };

    Physics2DRigidBody.prototype.setAngularDrag = function (angularDrag) {
        this._data[(22)] = Math.log(1 - angularDrag);

        // We wake body, even if static/kinematic incase user has some crazy
        // callback which queries mass/inertia to make decision
        this.wake(true);
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.addShape = function (shape) {
        if (this.world && (this.world._midStep || this._type === (2))) {
            return false;
        }

        if (shape.body) {
            return false;
        }

        shape.body = this;
        this.shapes.push(shape);

        if (this.world) {
            this.wake(true);
            this.world._addShape(shape);
        }

        // Recompute body radius
        var rad = shape._data[(4)];
        var data = this._data;
        if (rad > data[(19)]) {
            data[(19)] = rad;
        }

        this._invalidate();

        return true;
    };

    Physics2DRigidBody.prototype.removeShape = function (shape) {
        if (this.world && (this.world._midStep || this._type === (2))) {
            return false;
        }

        if (shape.body !== this) {
            return false;
        }

        if (this.world) {
            this.wake(true);
            this.world._removeShape(shape);
        }

        shape.body = null;
        var shapes = this.shapes;
        var limit = (shapes.length - 1);
        var index = shapes.indexOf(shape);
        shapes[index] = shapes[limit];
        shapes.pop();

        // Recompute body radius.
        var i;
        var radius = 0;
        for (i = 0; i < limit; i += 1) {
            shape = shapes[i];
            var rad = shape._data[(4)];
            if (rad > radius) {
                radius = rad;
            }
        }
        this._data[(19)] = radius;

        this._invalidate();

        return true;
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.computeMassFromShapes = function () {
        var mass = 0;
        var i;
        var shapes = this.shapes;
        var limit = shapes.length;
        for (i = 0; i < limit; i += 1) {
            var shape = shapes[i];
            mass += shape._material._data[(4)] * shape.computeArea();
        }
        return mass;
    };

    Physics2DRigidBody.prototype.computeInertiaFromShapes = function () {
        var inertia = 0;
        var i;
        var shapes = this.shapes;
        var limit = shapes.length;
        for (i = 0; i < limit; i += 1) {
            var shape = shapes[i];
            inertia += shape._material._data[(4)] * shape.computeMasslessInertia() * shape.computeArea();
        }
        return inertia;
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.wake = function (automated) {
        if (!this.world) {
            this.sleeping = false;
            return;
        }

        this.world._wakeBody(this, !automated);
    };

    Physics2DRigidBody.prototype.sleep = function () {
        if (!this.world) {
            this.sleeping = true;
            return;
        }

        this.world._forceSleepBody(this);
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.computeLocalCenterOfMass = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var comX = 0;
        var comY = 0;
        var totalMass = 0;

        var shapes = this.shapes;
        var limit = shapes.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var shape = shapes[i];
            shape.computeCenterOfMass(dst);
            var mass = shape.computeArea() * shape._material._data[(4)];
            comX += (dst[0] * mass);
            comY += (dst[1] * mass);
            totalMass += mass;
        }

        var imass = (1 / totalMass);
        dst[0] = (comX * imass);
        dst[1] = (comY * imass);
        return dst;
    };

    Physics2DRigidBody.prototype.computeWorldBounds = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(4);
        }
        var inf = Number.POSITIVE_INFINITY;
        var minX = inf;
        var minY = inf;
        var maxX = -inf;
        var maxY = -inf;

        this._update();
        var shapes = this.shapes;
        var limit = shapes.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var shape = shapes[i]._data;
            var x0 = shape[(0)];
            var y0 = shape[(0) + 1];
            var x1 = shape[(0) + 2];
            var y1 = shape[(0) + 3];
            if (x0 < minX) {
                minX = x0;
            }
            if (x1 > maxX) {
                maxX = x1;
            }
            if (y0 < minY) {
                minY = y0;
            }
            if (y1 > maxY) {
                maxY = y1;
            }
        }

        dst[0] = minX;
        dst[1] = minY;
        dst[2] = maxX;
        dst[3] = maxY;
        return dst;
    };

    // ===============================================================================
    Physics2DRigidBody.prototype.alignWithOrigin = function () {
        if (this.world && (this.world._midStep || this._type === (2))) {
            return;
        }

        var negCOM = this.computeLocalCenterOfMass();
        negCOM[0] *= -1;
        negCOM[1] *= -1;

        var shapes = this.shapes;
        var limit = shapes.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            shapes[i].translate(negCOM, true);
        }
        this._invalidate();
    };

    // ===============================================================================
    Physics2DRigidBody.prototype._invalidate = function () {
        this._invalidated = true;

        var customMass = this._customMass;
        var customInertia = this._customInertia;
        if ((!customMass) || (!customInertia)) {
            if (!customMass) {
                this._data[(23)] = this.computeMassFromShapes();
            }
            if (!customInertia) {
                this._data[(24)] = this.computeInertiaFromShapes();
            }

            this._invalidateMassInertia();
        }

        this.wake(true);
    };

    Physics2DRigidBody.prototype._update = function () {
        if (this._invalidated) {
            this._invalidated = false;
            var data = this._data;
            var shapes = this.shapes;
            var limit = shapes.length;
            var i;
            for (i = 0; i < limit; i += 1) {
                shapes[i]._update(data[(2)], data[(2) + 1], data[(5)], data[(5) + 1]);
            }
        }
    };

    // =====================================================================
    Physics2DRigidBody.prototype._atRest = function (deltaTime, timeStamp) {
        if (this._type !== (0)) {
            return this.sleeping;
        } else {
            var data = this._data;
            var canSleep;

            do {
                var x = data[(7)];
                var y = data[(7) + 1];
                var conf = Physics2DConfig.SLEEP_LINEAR_SQ;
                if (((x * x) + (y * y)) > conf) {
                    canSleep = false;
                    break;
                }

                x = (data[(2)] - data[(15)]);
                y = (data[(2) + 1] - data[(15) + 1]);
                var threshold = (deltaTime * deltaTime * conf);
                if (((x * x) + (y * y)) > threshold) {
                    canSleep = false;
                    break;
                }

                y = data[(19)];
                x = data[(7) + 2] * y;
                conf = Physics2DConfig.SLEEP_ANGULAR_SQ;
                if ((x * x) > conf) {
                    canSleep = false;
                    break;
                }

                x = (data[(2) + 2] - data[(15) + 2]) * y;
                threshold = (deltaTime * deltaTime * conf);
                canSleep = (x * x <= threshold);
            } while(false);

            if (!canSleep) {
                this._wakeTime = timeStamp;
                return false;
            } else {
                return ((this._wakeTime + Physics2DConfig.SLEEP_DELAY) < timeStamp);
            }
        }
    };

    // =====================================================================
    Physics2DRigidBody.prototype._deltaRotation = function (delta) {
        var data = this._data;
        var rotation = (data[(2) + 2] += delta);
        if ((delta * delta) > Physics2DConfig.DELTA_ROTATION_EPSILON) {
            data[(5)] = Math.cos(rotation);
            data[(5) + 1] = Math.sin(rotation);
        } else {
            // approximation of axis rotation
            // p, delta provide small angle approximations
            // whilst m provides an approximation to 1/|axis| after
            // the small angle rotation approximation, so as to
            // approximate the the normalization and hugely reduce
            // errors over many calls
            //
            // in testing even with an epsilon above of 0.01
            // the error in the axis is limited to 0.00002 after 100
            // updates.
            //
            // each update of the world, sin/cos is recomputed fully
            // so the accumulate error here is limited to a single step
            // and is really, very, very small.
            var d2 = (delta * delta);
            var p = (1 - (0.5 * d2));
            var m = (1 - (d2 * d2 * 0.125));

            var cos = data[(5)];
            var sin = data[(5) + 1];

            var nSin = ((p * sin) + (delta * cos)) * m;
            var nCos = ((p * cos) - (delta * sin)) * m;
            data[(5)] = nCos;
            data[(5) + 1] = nSin;
        }
        return rotation;
    };

    // Integrate to deltaTime from current sweepTime (back or forth).
    Physics2DRigidBody.prototype._sweepIntegrate = function (deltaTime) {
        var data = this._data;
        var delta = (deltaTime - data[(18)]);
        if (delta !== 0) {
            data[(18)] = deltaTime;
            data[(2)] += (data[(7)] * delta);
            data[(2) + 1] += (data[(7) + 1] * delta);

            var angVel = data[(20)];
            if (angVel !== 0) {
                this._deltaRotation(data[(20)] * delta);
            }
        }
    };

    Physics2DRigidBody.prototype.integrate = function (deltaTime) {
        if (this.world && (this.world._midStep || this._type === (2))) {
            return;
        }

        var data = this._data;
        data[(18)] = 0;
        data[(20)] = data[(7) + 2];
        this._sweepIntegrate(deltaTime);
        data[(18)] = 0;
        this._invalidated = true;
        this.wake(true);
    };

    // ==========================================================
    Physics2DRigidBody.prototype.addEventListener = function (eventType, callback) {
        var events = (eventType === 'wake' ? this._onWake : eventType === 'sleep' ? this._onSleep : null);

        if (events === null) {
            return false;
        }

        var index = events.indexOf(callback);
        if (index !== -1) {
            return false;
        }

        events.push(callback);

        this.wake();

        return true;
    };

    Physics2DRigidBody.prototype.removeEventListener = function (eventType, callback) {
        var events = (eventType === 'wake' ? this._onWake : eventType === 'sleep' ? this._onSleep : null);

        if (events === null) {
            return false;
        }

        var index = events.indexOf(callback);
        if (index === -1) {
            return false;
        }

        // Need to keep order, cannot use swap-pop
        events.splice(index, 1);

        this.wake();

        return true;
    };

    Physics2DRigidBody.create = // params = {
    //      shapes: [...],
    //      mass: [...] = computed from shapes + type
    //      inertia: [...] = computed from shapes + type
    //      type: 'static', 'kinematic', 'dynamic' = 'kinematic'
    //      sleeping: = false,
    //      force: [, ] = [0,0],
    //      torque: = 0
    //      position: [...] = [0,0],
    //      rotation: = 0
    //      surfaceVelocity = [0,0]
    //      velocity: = [0,0],
    //      angularVelocity: = 0,
    //      bullet = false,
    //      linearDrag = 0.05,
    //      angularDrag = 0.05
    // }
    function (params) {
        var b = new Physics2DRigidBody();
        var data = b._data = new Physics2DDevice.prototype.floatArray((25));

        var inf = Number.POSITIVE_INFINITY;

        b._type = (params.type === 'dynamic' ? (0) : params.type === 'static' ? (2) : params.type === 'kinematic' ? (1) : (0));

        var shapes = params.shapes;
        b.shapes = [];
        b.constraints = [];
        b.world = null;

        var radius = 0;
        if (shapes) {
            var limit = shapes.length;
            var i;
            for (i = 0; i < limit; i += 1) {
                var shape = shapes[i];
                if (shape.body === b) {
                    continue;
                }

                shape.body = b;
                b.shapes.push(shape);

                var rad = shape._data[(4)];
                if (rad > radius) {
                    radius = rad;
                }
            }
        }

        data[(19)] = radius;

        b._customMass = (params.mass !== undefined);
        b._customInertia = (params.inertia !== undefined);
        var mass = (b._customMass ? params.mass : b.computeMassFromShapes());
        var inertia = (b._customInertia ? params.inertia : b.computeInertiaFromShapes());

        var isDynamic = (b._type === (0));
        var isStatic = (b._type === (2));

        data[(0)] = ((!isDynamic) || mass === inf) ? 0 : (1 / mass);
        data[(1)] = ((!isDynamic) || inertia === inf) ? 0 : (1 / inertia);
        data[(23)] = mass;
        data[(24)] = inertia;

        var vec = params.position;
        var x = data[(2)] = (vec ? vec[0] : 0);
        var y = data[(2) + 1] = (vec ? vec[1] : 0);
        var rot = data[(2) + 2] = (params.rotation || 0);

        data[(5)] = Math.cos(rot);
        data[(5) + 1] = Math.sin(rot);

        data[(15)] = x;
        data[(15) + 1] = y;
        data[(15) + 2] = rot;

        vec = params.velocity;
        data[(7)] = (((!isStatic) && vec) ? vec[0] : 0);
        data[(7) + 1] = (((!isStatic) && vec) ? vec[1] : 0);
        data[(7) + 2] = (((!isStatic) && params.angularVelocity) || 0);

        vec = params.force;
        data[(10)] = (vec ? vec[0] : 0);
        data[(10) + 1] = (vec ? vec[1] : 0);
        data[(10) + 2] = (params.torque || 0);

        vec = params.surfaceVelocity;
        data[(13)] = (vec ? vec[0] : 0);
        data[(13) + 1] = (vec ? vec[1] : 0);

        b.sleeping = (params.sleeping || false);
        b.bullet = (params.bullet || false);

        // Static/kinematic always 'frozen'
        b._sweepFrozen = (b._type !== (0));
        b._deferred = false;

        b._island = null;
        b._islandRank = 0;
        b._islandRoot = null;

        b._isBody = true;
        b._wakeTime = 0;
        b._woken = false;

        b._invalidated = true;

        data[(21)] = Math.log(1 - (params.linearDrag !== undefined ? params.linearDrag : 0.05));
        data[(22)] = Math.log(1 - (params.angularDrag !== undefined ? params.angularDrag : 0.05));

        b.userData = (params.userData || null);

        b._onWake = [];
        b._onSleep = [];

        return b;
    };
    Physics2DRigidBody.version = 1;
    return Physics2DRigidBody;
})();

//
// Physics2D Callback
//
var Physics2DCallback = (function () {
    function Physics2DCallback() {
        // All events
        this.thisObject = null;
        this.callback = null;

        // Used to ensure time ordering of deferred events.
        // -1 if event corresponds to action performed before step()
        // 0  if event is a standard event during step()
        // 1  if event is result of a continuous collision during step()
        this.time = 0;

        // Interaction events
        this.index = 0;
        this.arbiter = null;

        this.next = null;
    }
    Physics2DCallback.allocate = function () {
        if (Physics2DCallback.pool) {
            var ret = Physics2DCallback.pool;
            Physics2DCallback.pool = ret.next;
            ret.next = null;
            return ret;
        } else {
            return (new Physics2DCallback());
        }
    };

    Physics2DCallback.deallocate = function (callback) {
        callback.next = Physics2DCallback.pool;
        Physics2DCallback.pool = callback;

        callback.thisObject = null;
        callback.callback = null;
        callback.arbiter = null;
    };
    Physics2DCallback.pool = null;
    return Physics2DCallback;
})();

//
// Physics2DIsland
//
var Physics2DIsland = (function () {
    function Physics2DIsland() {
        this.components = [];
        this.sleeping = false;
        this.wakeTime = 0;
        this.next = null;
    }
    Physics2DIsland.allocate = function () {
        if (Physics2DIsland.pool) {
            var ret = Physics2DIsland.pool;
            Physics2DIsland.pool = ret.next;
            ret.next = null;
            return ret;
        } else {
            return (new Physics2DIsland());
        }
    };

    Physics2DIsland.deallocate = function (island) {
        island.next = Physics2DIsland.pool;
        Physics2DIsland.pool = island;
        island.wakeTime = 0;
    };
    Physics2DIsland.pool = null;
    return Physics2DIsland;
})();

// =====================================================================
//
// Physics2D TOI Event
//
// TOI DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*TOI_AXIS*/0       - seperating/MTV axis (x, y)
///*TOI_WITNESS_A*/2  - witness on shape A (x, y)
///*TOI_WITNESS_B*/4  - witness on shape B (x, y)
///*TOI_TOI_ALPHA*/6  - time of impact.
//
///*TOI_DATA_SIZE*/7
var Physics2DTOIEvent = (function () {
    function Physics2DTOIEvent() {
        this.next = null;
        this.shapeA = null;
        this.shapeB = null;
        this.frozenA = this.frozenB = false;
        this.arbiter = null;
        this.failed = false;
        this.slipped = false;
        this._data = new Physics2DDevice.prototype.floatArray((7));
    }
    Physics2DTOIEvent.allocate = function () {
        if (Physics2DTOIEvent.pool) {
            var ret = Physics2DTOIEvent.pool;
            Physics2DTOIEvent.pool = ret.next;
            ret.next = null;
            return ret;
        } else {
            return (new Physics2DTOIEvent());
        }
    };

    Physics2DTOIEvent.deallocate = function (toi) {
        toi.next = Physics2DTOIEvent.pool;
        Physics2DTOIEvent.pool = toi;

        toi.shapeA = toi.shapeB = null;
        toi.failed = false;
        toi.slipped = false;
        toi.arbiter = null;
    };
    Physics2DTOIEvent.pool = null;
    return Physics2DTOIEvent;
})();

// =====================================================================
//
// Physics2D Box Tree Broadphase
//
var Physics2DBoxTreeBroadphaseHandle = (function () {
    function Physics2DBoxTreeBroadphaseHandle() {
        this.boxTreeIndex = -1;

        this.data = null;
        this.isStatic = false;
    }
    Physics2DBoxTreeBroadphaseHandle.allocate = function () {
        if (0 < this.pool.length) {
            return this.pool.pop();
        } else {
            return new Physics2DBoxTreeBroadphaseHandle();
        }
    };

    Physics2DBoxTreeBroadphaseHandle.deallocate = function (handle) {
        this.pool.push(handle);

        handle.data = null;
    };
    Physics2DBoxTreeBroadphaseHandle.pool = [];
    return Physics2DBoxTreeBroadphaseHandle;
})();

var Physics2DBoxTreeBroadphase = (function () {
    function Physics2DBoxTreeBroadphase() {
        this.staticTree = BoxTree.create(true);
        this.dynamicTree = BoxTree.create(false);
        this.overlappingNodes = [];
    }
    Physics2DBoxTreeBroadphase.prototype.sample = function (box/*v4*/ , lambda, thisObject) {
        var overlappingNodes = this.overlappingNodes;

        var numOverlappingNodes = this.staticTree.getOverlappingNodes(box, overlappingNodes, 0);
        numOverlappingNodes += this.dynamicTree.getOverlappingNodes(box, overlappingNodes, numOverlappingNodes);

        var n;
        for (n = 0; n < numOverlappingNodes; n += 1) {
            lambda.call(thisObject, overlappingNodes[n], box);
        }
    };

    Physics2DBoxTreeBroadphase.prototype.insert = function (data, box/*v4*/ , isStatic) {
        var handle = Physics2DBoxTreeBroadphaseHandle.allocate();
        handle.data = data;
        handle.isStatic = isStatic;

        if (isStatic) {
            this.staticTree.add(handle, box);
        } else {
            this.dynamicTree.add(handle, box);
        }

        return handle;
    };

    Physics2DBoxTreeBroadphase.prototype.update = function (handle, box/*v4*/ , isStatic) {
        if (isStatic !== undefined && handle.isStatic !== isStatic) {
            if (handle.isStatic) {
                this.staticTree.remove(handle);
                this.dynamicTree.add(handle, box);
            } else {
                this.dynamicTree.remove(handle);
                this.staticTree.add(handle, box);
            }
            handle.isStatic = isStatic;
        } else {
            if (isStatic) {
                this.staticTree.update(handle, box);
            } else {
                this.dynamicTree.update(handle, box);
            }
        }
    };

    Physics2DBoxTreeBroadphase.prototype.remove = function (handle) {
        if (handle.isStatic) {
            this.staticTree.remove(handle);
        } else {
            this.dynamicTree.remove(handle);
        }

        Physics2DBoxTreeBroadphaseHandle.deallocate(handle);
    };

    Physics2DBoxTreeBroadphase.prototype.clear = function (callback, thisObject) {
        this._clearTree(this.staticTree, callback, thisObject);
        this._clearTree(this.dynamicTree, callback, thisObject);
    };

    Physics2DBoxTreeBroadphase.prototype._clearTree = function (tree, callback, thisObject) {
        var nodes = tree.getNodes();
        var numNodes = nodes.length;
        var n;
        for (n = 0; n < numNodes; n += 1) {
            var handle = nodes[n].externalNode;
            if (handle) {
                if (callback) {
                    callback.call(thisObject, handle);
                }
                Physics2DBoxTreeBroadphaseHandle.deallocate(handle);
            }
        }
        tree.clear();
    };

    Physics2DBoxTreeBroadphase.prototype._validate = function () {
        this.staticTree.finalize();
        this.dynamicTree.finalize();
    };

    Physics2DBoxTreeBroadphase.prototype.perform = function (lambda, thisObject) {
        this._validate();

        var overlappingNodes = this.overlappingNodes;

        var staticTree = this.staticTree;
        var dynamicTree = this.dynamicTree;

        var dynamicNodes = dynamicTree.getNodes();
        var numDynamicNodes = dynamicNodes.length;
        var n;
        for (n = 0; n < numDynamicNodes; n += 1) {
            var dynamicNode = dynamicNodes[n];
            var handle = dynamicNode.externalNode;
            if (handle) {
                var numOverlappingNodes = staticTree.getOverlappingNodes(dynamicNode.extents, overlappingNodes, 0);
                var i;
                for (i = 0; i < numOverlappingNodes; i += 1) {
                    lambda.call(thisObject, handle, overlappingNodes[i]);
                }
            }
        }

        var numPairs = dynamicTree.getOverlappingPairs(overlappingNodes, 0);
        for (n = 0; n < numPairs; n += 2) {
            lambda.call(thisObject, overlappingNodes[n], overlappingNodes[n + 1]);
        }
    };

    Physics2DBoxTreeBroadphase.create = function () {
        return new Physics2DBoxTreeBroadphase();
    };
    Physics2DBoxTreeBroadphase.version = 1;
    return Physics2DBoxTreeBroadphase;
})();

// =====================================================================
//
// Physics2D 1D (x) Sweep and Prune Broadphase
//
var Physics2DSweepAndPruneHandle = (function () {
    function Physics2DSweepAndPruneHandle() {
        this._next = null;
        this._prev = null;
        this._aabb = new Physics2DDevice.prototype.floatArray(4);

        this.data = null;
        this.isStatic = false;
    }
    Physics2DSweepAndPruneHandle.allocate = function () {
        if (!this.pool) {
            return new Physics2DSweepAndPruneHandle();
        } else {
            var ret = this.pool;
            this.pool = ret._next;
            ret._next = null;
            return ret;
        }
    };

    Physics2DSweepAndPruneHandle.deallocate = function (handle) {
        handle._prev = null;
        handle._next = this.pool;
        this.pool = handle;

        handle.data = null;
    };
    Physics2DSweepAndPruneHandle.pool = null;
    return Physics2DSweepAndPruneHandle;
})();

var Physics2DSweepAndPrune = (function () {
    function Physics2DSweepAndPrune() {
    }
    Physics2DSweepAndPrune.prototype.sample = function (rectangle, lambda, thisObject) {
        var minX = rectangle[0];
        var minY = rectangle[1];
        var maxX = rectangle[2];
        var maxY = rectangle[3];

        this._validate();

        var d1 = this._list;
        while (d1) {
            var aabb = d1._aabb;

            if (aabb[2] < minX) {
                d1 = d1._next;
                continue;
            }

            if (aabb[0] > maxX) {
                break;
            }

            if (aabb[1] <= maxY && minY <= aabb[3]) {
                lambda.call(thisObject, d1, rectangle);
            }
            d1 = d1._next;
        }
    };

    Physics2DSweepAndPrune.prototype.insert = function (data, aabb, isStatic) {
        var handle = Physics2DSweepAndPruneHandle.allocate();
        var ab = handle._aabb;
        ab[0] = aabb[0];
        ab[1] = aabb[1];
        ab[2] = aabb[2];
        ab[3] = aabb[3];

        handle.data = data;
        handle.isStatic = isStatic;

        // Insert at beginning, let broadphase update deal with it.
        var list = this._list;
        handle._next = list;
        if (list) {
            list._prev = handle;
        }
        this._list = handle;

        return handle;
    };

    Physics2DSweepAndPrune.prototype.update = function (handle, aabb, isStatic) {
        var ab = handle._aabb;
        ab[0] = aabb[0];
        ab[1] = aabb[1];
        ab[2] = aabb[2];
        ab[3] = aabb[3];

        if (isStatic !== undefined) {
            handle.isStatic = isStatic;
        }
    };

    Physics2DSweepAndPrune.prototype.remove = function (handle) {
        if (!handle._prev) {
            this._list = handle._next;
        } else {
            handle._prev._next = handle._next;
        }

        if (handle._next) {
            handle._next._prev = handle._prev;
        }

        Physics2DSweepAndPruneHandle.deallocate(handle);
    };

    Physics2DSweepAndPrune.prototype.clear = function (callback, thisObject) {
        var handle = this._list;
        while (handle) {
            var next = handle._next;
            if (callback) {
                callback.call(thisObject, handle);
            }
            Physics2DSweepAndPruneHandle.deallocate(handle);
            handle = next;
        }
        this._list = null;
    };

    Physics2DSweepAndPrune.prototype._validate = function () {
        if (!this._list) {
            return;
        }

        var a = this._list._next;
        while (a) {
            var next = a._next;
            var b = a._prev;

            var aMinX = a._aabb[0];
            if (aMinX > b._aabb[0]) {
                // Nothing to do.
                a = next;
                continue;
            }

            while (b._prev && b._prev._aabb[0] > aMinX) {
                b = b._prev;
            }

            // Remove a
            var prev = a._prev;
            prev._next = next;
            if (next) {
                next._prev = prev;
            }

            if (!b._prev) {
                a._prev = null;
                this._list = a;
                a._next = b;
                b._prev = a;
            } else {
                a._prev = b._prev;
                b._prev = a;
                a._prev._next = a;
                a._next = b;
            }

            a = next;
        }
    };

    Physics2DSweepAndPrune.prototype.perform = function (lambda, thisObject) {
        this._validate();

        var d1 = this._list;
        while (d1) {
            var d2 = d1._next;
            var aabb1 = d1._aabb;
            var d1Static = d1.isStatic;

            var maxX = aabb1[2];
            while (d2) {
                var aabb2 = d2._aabb;
                if (aabb2[0] > maxX) {
                    break;
                }

                if (d1Static && d2.isStatic) {
                    d2 = d2._next;
                    continue;
                }

                if (aabb1[1] > aabb2[3] || aabb2[1] > aabb1[3]) {
                    d2 = d2._next;
                    continue;
                }

                lambda.call(thisObject, d1, d2);
                d2 = d2._next;
            }

            d1 = d1._next;
        }
    };

    Physics2DSweepAndPrune.create = function () {
        var b = new Physics2DSweepAndPrune();
        b._list = null;
        return b;
    };
    Physics2DSweepAndPrune.version = 1;
    return Physics2DSweepAndPrune;
})();

// =====================================================================
//
// Physics2D Contact
//
//
// CONTACT DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*CON_POS*/0         // World position of contact (x, y)
///*CON_DIST*/2        // Penetration distance of contact
///*CON_BOUNCE*/3      // Per-contact bounce error.
///*CON_FRICTION*/4    // Per-contact friction (based on arbiter and rel. velocity)
///*CON_NMASS*/5       // Normal effective mass
///*CON_TMASS*/6       // Tangent effective mass
///*CON_REL1*/7        // Contact relative to object 1 (x, y)
///*CON_REL2*/9        // Contact relative to object 2 (x, y)
///*CON_JNACC*/11      // Normal accumulated impulse
///*CON_JTACC*/12      // Tangent accumulated impulse
///*CON_LREL1*/13      // Local contact point on object 1 (position iteration) (x, y)
///*CON_LREL2*/15      // Local contact point on object 2 (position iteration) (x, y)
//
///*CON_DATA_SIZE*/17
var Physics2DContact = (function () {
    function Physics2DContact() {
        this._data = new Physics2DDevice.prototype.floatArray((17));
        this.fresh = false;
        this._hash = 0;
        this._timeStamp = 0;
        this._next = null;
        this.active = false;
        this.virtual = false;
    }
    Physics2DContact.allocate = function () {
        if (!this.pool) {
            return new Physics2DContact();
        } else {
            var ret = this.pool;
            this.pool = ret._next;
            ret._next = null;
            return ret;
        }
    };
    Physics2DContact.deallocate = function (contact) {
        contact._next = this.pool;
        this.pool = contact;
    };

    Physics2DContact.prototype.getPosition = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        var data = this._data;
        dst[0] = data[(0)];
        dst[1] = data[(0) + 1];
        return dst;
    };

    Physics2DContact.prototype.getPenetration = function () {
        return (-this._data[(2)]);
    };

    Physics2DContact.prototype.getNormalImpulse = function () {
        return (this.virtual ? 0 : this._data[(11)]);
    };

    Physics2DContact.prototype.getTangentImpulse = function () {
        return (this.virtual ? 0 : this._data[(12)]);
    };
    Physics2DContact.version = 1;

    Physics2DContact.pool = null;
    return Physics2DContact;
})();

// =====================================================================
//
// Physics2D Arbiter
//
//
// ARBITER DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
// Velocity iterations.
// these values must remain below (31) as used as bit accessors
// on userdef flag.
///*ARB_DYN_FRIC*/0      // Coef. dynamic friction
///*ARB_STATIC_FRIC*/1   // Coef. static friction
///*ARB_ELASTICITY*/2    // Coef. elasticity
///*ARB_ROLLING_FRIC*/3  // Coef. rolling friction
//
///*ARB_NORMAL*/4        // World space normal (velocity iterations) (x, y)
///*ARB_PREDT*/6         // Previous time-step on computation for scaling.
//
// Jacobian (first contact)
///*ARB_RN1A*/7          // (contact1.ra cross normal)
///*ARB_RN1B*/8          // (contact1.rb cross normal)
///*ARB_RT1A*/9          // (contact1.ra dot normal)
///*ARB_RT1B*/10          // (contact1.rb dot normal)
//
// Position iterations.
///*ARB_LNORM*/11         // Local normal of reference edge (x, y)
///*ARB_LPROJ*/13         // Local projection onto reference edge.
///*ARB_RADIUS*/14        // Sum radius of shapes (0 poly, radius circle)
///*ARB_BIAS*/15          // Bias coeffecient
//
// 2-contact arbiter only.
// Jacobian second contact
///*ARB_RN2A*/16          // (contact2.ra cross normal)
///*ARB_RN2B*/17          // (contact2.rb cross normal)
///*ARB_RT2A*/18          // (contact2.ra dot normal)
///*ARB_RT2B*/19          // (contact2.rb dot normal)
////**/
///*ARB_K*/20             // Block solver non-inverted effectivemass [a b; b c] (sym. matrix)
///*ARB_KMASS*/23         // (1 / det) of ARB_K for on the fly inversion.
//
// 1-contact arbiter only. (when one is a circle)
///*ARB_JRACC*/16         // Accumulated rolling friction impulse
///*ARB_RMASS*/17         // Rolling friction effectivemass.
//
//
//
///*ARB_DATA_SIZE*/24
//
//
// Flags for when user has explicitly set values on arbiter.
///*USERDEF_DYN*/1
///*USERDEF_STAT*/2
///*USERDEF_ROLLING*/4
///*USERDEF_ELASTICITY*/8
//
// Face flags
///*FACE_CIRCLE*/0
///*FACE_1*/1
///*FACE_2*/2
//
// Hash flags
///*HASH_CIRCLE*/0
///*HASH_LEFT*/1
///*HASH_RIGHT*/2
//
// State flags
///*STATE_ACCEPT*/1
///*STATE_ALWAYS*/2
var Physics2DArbiter = (function () {
    function Physics2DArbiter() {
        this.shapeA = null;
        this.shapeB = null;
        this.bodyA = null;
        this.bodyB = null;
        this._next = null;

        this._retired = false;
        this._lazyRetired = false;
        this._static = false;
        this._state = 0;
        this.sensor = false;

        this._createStamp = 0;
        this._updateStamp = 0;
        this._sleepStamp = 0;
        this._timeStamp = 0;

        // injected contacts have correct time set without later
        // iteration.
        this._createContinuous = false;

        // continuous collisions for callbacks.
        this._endGenerated = 0;

        // This deals with another corner case where
        // object seperates (end event), then continuously collide
        // needing to generate a begin even for the same pair of
        // objects (same arbiter) in the same step!.
        this._midStep = false;

        this.sleeping = false;
        this.active = false;
        this._invalidated = false;

        this._data = new Physics2DDevice.prototype.floatArray((24));
        this.contacts = [];

        this._userdef = 0;
        this._velocity2Contact = false;
        this._position2Contact = false;
        this._contact1 = this._contact2 = null;
        this._faceType = 0;
    }
    Physics2DArbiter.prototype.getNormal = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }
        if (this.sensor) {
            dst[0] = dst[1] = 0;
        } else {
            var data = this._data;
            dst[0] = data[(4)];
            dst[1] = data[(4) + 1];
        }
        return dst;
    };

    Physics2DArbiter.prototype.getRollingImpulse = function () {
        if (this.sensor || this._velocity2Contact || this._contact1._hash !== (0)) {
            return 0;
        } else {
            return this._data[(16)];
        }
    };

    // =========================================================
    Physics2DArbiter.prototype.getElasticity = function () {
        if (this.sensor) {
            return undefined;
        }

        this._validate();
        return this._data[(2)];
    };

    Physics2DArbiter.prototype.getDynamicFriction = function () {
        if (this.sensor) {
            return undefined;
        }

        this._validate();
        return this._data[(0)];
    };

    Physics2DArbiter.prototype.getStaticFriction = function () {
        if (this.sensor) {
            return undefined;
        }

        this._validate();
        return this._data[(1)];
    };

    Physics2DArbiter.prototype.getRollingFriction = function () {
        if (this.sensor) {
            return undefined;
        }

        this._validate();
        return this._data[(3)];
    };

    /*jshint bitwise: false*/
    Physics2DArbiter.prototype.setElasticity = function (elasticity) {
        if (this.sensor) {
            return;
        }

        this._data[(2)] = elasticity;
        this._userdef |= (1 << (2));
        this._invalidate(true);
    };

    Physics2DArbiter.prototype.setDynamicFriction = function (dynamicFriction) {
        if (this.sensor) {
            return;
        }

        this._data[(0)] = dynamicFriction;
        this._userdef |= (1 << (0));
        this._invalidate(true);
    };

    Physics2DArbiter.prototype.setStaticFriction = function (staticFriction) {
        if (this.sensor) {
            return;
        }

        this._data[(1)] = staticFriction;
        this._userdef |= (1 << (1));
        this._invalidate(true);
    };

    Physics2DArbiter.prototype.setRollingFriction = function (rollingFriction) {
        if (this.sensor) {
            return;
        }

        this._data[(3)] = rollingFriction;
        this._userdef |= (1 << (3));
        this._invalidate(true);
    };

    Physics2DArbiter.prototype.setElasticityFromShapes = function () {
        if (this.sensor) {
            return;
        }

        this._userdef &= ~(1 << (2));
        this._invalidate(true);
    };

    Physics2DArbiter.prototype.setDynamicFrictionFromShapes = function () {
        if (this.sensor) {
            return;
        }

        this._userdef &= ~(1 << (0));
        this._invalidate(true);
    };

    Physics2DArbiter.prototype.setStaticFrictionFromShapes = function () {
        if (this.sensor) {
            return;
        }

        this._userdef &= ~(1 << (1));
        this._invalidate(true);
    };

    Physics2DArbiter.prototype.setRollingFrictionFromShapes = function () {
        if (this.sensor) {
            return;
        }

        this._userdef &= ~(1 << (3));
        this._invalidate(true);
    };

    /*jshint bitwise: true*/
    // =========================================================
    /*jshint bitwise: false*/
    Physics2DArbiter.prototype.isStateAccepted = function () {
        if (this.sensor) {
            return false;
        } else {
            return ((this._state & (1)) !== 0);
        }
    };

    Physics2DArbiter.prototype.isStatePersistent = function () {
        if (this.sensor) {
            return false;
        } else {
            return ((this._state & (2)) !== 0);
        }
    };

    Physics2DArbiter.prototype.setAcceptedState = function (accepted) {
        if (this.sensor) {
            return;
        }

        if (accepted) {
            this._state |= (1);
        } else {
            this._state &= ~(1);
        }
        this._invalidate(true);
    };

    Physics2DArbiter.prototype.setPersistentState = function (persistent) {
        if (this.sensor) {
            return;
        }

        if (persistent) {
            this._state |= (2);
        } else {
            this._state &= ~(2);
        }
        this._invalidate(true);
    };

    /*jshint bitwise: true*/
    // =========================================================
    // Called when arbiter is destroyed by removal of a shape
    // Or change in body type signialling end of an interaction.
    // In either case, arbiter was woken and sleeping is false.
    //
    // Effect is that in following step, arbiter is permitted
    // to persist one additional frame (for any end events)
    // and then in the next step retired fully and reused.
    Physics2DArbiter.prototype._lazyRetire = function (ignoreShape) {
        this._lazyRetired = true;
        this._retired = true;
        this.active = false;

        var arbiters;
        var index;
        if (this.shapeA !== ignoreShape) {
            arbiters = this.shapeA.arbiters;
            index = arbiters.indexOf(this);
            arbiters[index] = arbiters[arbiters.length - 1];
            arbiters.pop();
        }
        if (this.shapeB !== ignoreShape) {
            arbiters = this.shapeB.arbiters;
            index = arbiters.indexOf(this);
            arbiters[index] = arbiters[arbiters.length - 1];
            arbiters.pop();
        }
    };

    Physics2DArbiter.prototype._assign = function (s1, s2) {
        this.bodyA = s1.body;
        this.bodyB = s2.body;
        this.shapeA = s1;
        this.shapeB = s2;

        s1.arbiters.push(this);
        s2.arbiters.push(this);

        this._retired = false;
        this.sleeping = false;

        this._invalidate();
    };

    Physics2DArbiter.prototype._retire = function () {
        this.shapeA = this.shapeB = null;
        this.bodyA = this.bodyB = null;
        this._retired = true;
        this._lazyRetired = false;
        this.active = false;
        this._data[(6)] = 0;

        var contacts = this.contacts;
        while (contacts.length > 0) {
            var contact = contacts.pop();
            Physics2DContact.deallocate(contact);
        }
        this._contact1 = this._contact2 = null;
    };

    // =====================================================================
    Physics2DArbiter.prototype._invalidate = function (dontSkip) {
        this._invalidated = true;
        if (dontSkip && !this._midStep) {
            this.shapeA.body.wake();
            this.shapeB.body.wake();
        }
    };

    Physics2DArbiter.prototype._validate = function () {
        this._invalidated = false;

        var data = this._data;
        var mA = this.shapeA._material._data;
        var mB = this.shapeB._material._data;
        var userdef = this._userdef;

        if ((userdef & (1 << (2))) === 0) {
            var elasticity;
            var elasticA = mA[(0)];
            var elasticB = mB[(0)];
            if (elasticA <= Number.NEGATIVE_INFINITY || elasticB <= Number.NEGATIVE_INFINITY) {
                elasticity = 0;
            } else if (elasticA >= Number.POSITIVE_INFINITY || elasticB >= Number.POSITIVE_INFINITY) {
                elasticity = 1;
            } else {
                elasticity = (elasticA + elasticB) * 0.5;
                if (elasticity < 0) {
                    elasticity = 0;
                } else if (elasticity > 1) {
                    elasticity = 1;
                }
            }
            data[(2)] = elasticity;
        }

        var sqrt = Math.sqrt;
        if ((userdef & (1 << (0))) === 0) {
            data[(0)] = sqrt(mA[(2)] * mB[(2)]);
        }
        if ((userdef & (1 << (1))) === 0) {
            data[(1)] = sqrt(mA[(1)] * mB[(1)]);
        }
        if ((userdef & (1 << (3))) === 0) {
            data[(3)] = sqrt(mA[(3)] * mB[(3)]);
        }
        /*jshint bitwise: true*/
    };

    // =====================================================================
    Physics2DArbiter.prototype._injectContact = function (px, py, nx, ny, dist, hash, virtual) {
        var contact;
        var contacts = this.contacts;
        var limit = contacts.length;
        if (limit !== 0) {
            contact = contacts[0];
            if (contact._hash !== hash) {
                if (limit !== 1) {
                    contact = contacts[1];
                    if (contact._hash !== hash) {
                        contact = null;
                    }
                } else {
                    contact = null;
                }
            }
        }

        if (virtual === undefined) {
            virtual = false;
        }

        var data;
        if (!contact) {
            contact = Physics2DContact.allocate();
            data = contact._data;
            data[(11)] = data[(12)] = 0;
            contact._hash = hash;
            contact.fresh = (!virtual);
            contacts.push(contact);

            if (hash === (0)) {
                this._data[(16)] = 0;
            }
        } else {
            contact.fresh = (!virtual && contact.virtual);
            data = contact._data;
        }

        data[(0)] = px;
        data[(0) + 1] = py;
        data[(2)] = dist;
        contact._timeStamp = this._timeStamp;
        contact.virtual = virtual;

        data = this._data;
        data[(4)] = nx;
        data[(4) + 1] = ny;

        return contact;
    };

    Physics2DArbiter.prototype._cleanContacts = function (timeStamp) {
        var fst = true;
        this._position2Contact = false;
        this._contact2 = null;
        var contacts = this.contacts;
        var limit = contacts.length;
        var i;
        for (i = 0; i < limit;) {
            var c = contacts[i];
            if (c._timeStamp + Physics2DConfig.DELAYED_DEATH < timeStamp) {
                limit -= 1;
                contacts[i] = contacts[limit];
                contacts.pop();
                Physics2DContact.deallocate(c);
                continue;
            }

            c.active = (c._timeStamp === timeStamp);
            if (c.active) {
                if (fst) {
                    this._contact1 = c;
                    fst = false;
                } else {
                    this._contact2 = c;
                    this._position2Contact = true;
                }
            }

            i += 1;
        }

        if (this._position2Contact) {
            if (this._contact1.virtual) {
                var tmp = this._contact1;
                this._contact1 = this._contact2;
                this._contact2 = tmp;
            }
            this._velocity2Contact = !(this._contact2.virtual);
        } else {
            this._velocity2Contact = false;
        }

        return !fst;
    };

    // =====================================================================
    Physics2DArbiter.prototype._preStep = function (deltaTime, timeStamp, continuous) {
        if (!this._cleanContacts(timeStamp)) {
            return false;
        }

        if (this._invalidated) {
            this._validate();
        }

        var adata = this._data;
        var predt = adata[(6)];
        var dtRatio = (predt === 0) ? 1 : (deltaTime / predt);
        adata[(6)] = deltaTime;

        var data1 = this.bodyA._data;
        var data2 = this.bodyB._data;

        var px1 = data1[(2)];
        var py1 = data1[(2) + 1];
        var px2 = data2[(2)];
        var py2 = data2[(2) + 1];

        var vx1 = data1[(7)];
        var vy1 = data1[(7) + 1];
        var vw1 = data1[(7) + 2];
        var vx2 = data2[(7)];
        var vy2 = data2[(7) + 1];
        var vw2 = data2[(7) + 2];

        var nx = adata[(4)];
        var ny = adata[(4) + 1];

        var massSum = data1[(0)] + data2[(0)];

        var ii1 = data1[(1)];
        var ii2 = data2[(1)];

        var EPS = Physics2DConfig.EFF_MASS_EPSILON;
        var BIAS = (continuous ? (this._static ? Physics2DConfig.CONT_STATIC_BIAS_COEF : Physics2DConfig.CONT_BIAS_COEF) : this._static ? Physics2DConfig.STATIC_BIAS_COEF : Physics2DConfig.BIAS_COEF);
        adata[(15)] = BIAS;

        var c = this._contact1;
        var data;
        var rx1, ry1, rx2, ry2;
        while (true) {
            data = c._data;

            var px = data[(0)];
            var py = data[(0) + 1];

            // Contact point relative vectors.
            rx1 = data[(7)] = (px - px1);
            ry1 = data[(7) + 1] = (py - py1);
            rx2 = data[(9)] = (px - px2);
            ry2 = data[(9) + 1] = (py - py2);

            // Tangent effective mass.
            var v1 = (rx1 * nx) + (ry1 * ny);
            var v2 = (rx2 * nx) + (ry2 * ny);
            var kt = massSum + (ii2 * v2 * v2) + (ii1 * v1 * v1);
            data[(6)] = (kt < EPS) ? 0 : (1 / kt);

            // Normal effective mass.
            v1 = (rx1 * ny) - (ry1 * nx);
            v2 = (rx2 * ny) - (ry2 * nx);
            var kn = massSum + (ii2 * v2 * v2) + (ii1 * v1 * v1);
            data[(5)] = (kn < EPS) ? 0 : (1 / kn);

            // Relative velocity at contact point.
            var vrx = (vx2 - (ry2 * vw2)) - (vx1 - (ry1 * vw1));
            var vry = (vy2 + (rx2 * vw2)) - (vy1 + (rx1 * vw1));

            // Compute bounce error
            var vdot = (nx * vrx) + (ny * vry);
            var bounce = (vdot * adata[(2)]);
            if (bounce > -Physics2DConfig.BOUNCE_VELOCITY_THRESHOLD) {
                bounce = 0;
            }
            data[(3)] = bounce;

            // Compute friction coef.
            vdot = (nx * vry) - (ny * vrx);
            if ((vdot * vdot) > Physics2DConfig.STATIC_FRIC_SQ_EPSILON) {
                data[(4)] = adata[(0)];
            } else {
                data[(4)] = adata[(1)];
            }

            // Scale impulses from change in time step
            data[(11)] *= dtRatio;
            data[(12)] *= dtRatio;

            if (this._velocity2Contact) {
                if (c === this._contact2) {
                    break;
                }
                c = this._contact2;
            } else {
                break;
            }
        }

        data = this._contact1._data;
        rx1 = data[(7)];
        ry1 = data[(7) + 1];
        rx2 = data[(9)];
        ry2 = data[(9) + 1];
        var rn1a = adata[(7)] = (rx1 * ny) - (ry1 * nx);
        var rn1b = adata[(8)] = (rx2 * ny) - (ry2 * nx);
        adata[(9)] = (rx1 * nx) + (ry1 * ny);
        adata[(10)] = (rx2 * nx) + (ry2 * ny);

        if (!this._velocity2Contact && this._contact1._hash === (0)) {
            adata[(16)] *= dtRatio;
            var sum = ii1 + ii2;
            adata[(17)] = (sum < EPS) ? 0 : (1 / sum);
        } else if (this._velocity2Contact) {
            data = this._contact2._data;
            var r2x1 = data[(7)];
            var r2y1 = data[(7) + 1];
            var r2x2 = data[(9)];
            var r2y2 = data[(9) + 1];
            var rn2a = adata[(16)] = (r2x1 * ny) - (r2y1 * nx);
            var rn2b = adata[(17)] = (r2x2 * ny) - (r2y2 * nx);
            adata[(18)] = (r2x1 * nx) + (r2y1 * ny);
            adata[(19)] = (r2x2 * nx) + (r2y2 * ny);

            var Ka = adata[(20)] = massSum + (ii1 * rn1a * rn1a) + (ii2 * rn1b * rn1b);
            var Kb = adata[(20) + 1] = massSum + (ii1 * rn1a * rn2a) + (ii2 * rn1b * rn2b);
            var Kc = adata[(20) + 2] = massSum + (ii1 * rn2a * rn2a) + (ii2 * rn2b * rn2b);

            // Degenerate case! eek.
            var det = ((Ka * Kc) - (Kb * Kb));
            if ((Ka * Ka) > (Physics2DConfig.ILL_THRESHOLD * det)) {
                if (this._contact2._data[(2)] < this._contact1._data[(2)]) {
                    this._contact1 = this._contact2;
                    adata[(7)] = rn2a;
                    adata[(8)] = rn2b;
                    adata[(9)] = adata[(18)];
                    adata[(10)] = adata[(19)];
                }
                this._velocity2Contact = false;
                this._position2Contact = false;
                this._contact2 = null;
            } else {
                adata[(23)] = (1 / det);
            }
        }

        return true;
    };

    // =====================================================================
    Physics2DArbiter.prototype._iterateVelocity = function () {
        var data1 = this.bodyA._data;
        var data2 = this.bodyB._data;
        var im1 = data1[(0)];
        var ii1 = data1[(1)];
        var im2 = data2[(0)];
        var ii2 = data2[(1)];
        var vx1 = data1[(7)];
        var vy1 = data1[(7) + 1];
        var vw1 = data1[(7) + 2];
        var vx2 = data2[(7)];
        var vy2 = data2[(7) + 1];
        var vw2 = data2[(7) + 2];

        var adata = this._data;
        var nx = adata[(4)];
        var ny = adata[(4) + 1];
        var rn1a = adata[(7)];
        var rn1b = adata[(8)];
        var rt1a = adata[(9)];
        var rt1b = adata[(10)];

        var cdata1 = this._contact1._data;
        var rx1 = cdata1[(7)];
        var ry1 = cdata1[(7) + 1];
        var rx2 = cdata1[(9)];
        var ry2 = cdata1[(9) + 1];

        var surfaceX = (data2[(13)] - data1[(13)]);
        var surfaceY = (data2[(13) + 1] - data1[(13) + 1]);

        // Relative velocity first contact
        var vrx1 = (vx2 - (ry2 * vw2)) - (vx1 - (ry1 * vw1));
        var vry1 = (vy2 + (rx2 * vw2)) - (vy1 + (rx1 * vw1));

        var j, jOld, cjAcc, jx, jy, jMax;

        // First contact friction
        j = (((nx * vry1) - (ny * vrx1)) + surfaceX) * cdata1[(6)];
        jMax = (cdata1[(4)] * cdata1[(11)]);
        jOld = cdata1[(12)];
        cjAcc = (jOld - j);
        if (cjAcc > jMax) {
            cjAcc = jMax;
        } else if (cjAcc < -jMax) {
            cjAcc = -jMax;
        }
        j = (cjAcc - jOld);
        cdata1[(12)] = cjAcc;

        jx = (-ny * j);
        jy = (nx * j);
        vx1 -= (jx * im1);
        vy1 -= (jy * im1);
        vw1 -= (rt1a * j * ii1);
        vx2 += (jx * im2);
        vy2 += (jy * im2);
        vw2 += (rt1b * j * ii2);

        if (this._velocity2Contact) {
            var cdata2 = this._contact2._data;
            var r2x1 = cdata2[(7)];
            var r2y1 = cdata2[(7) + 1];
            var r2x2 = cdata2[(9)];
            var r2y2 = cdata2[(9) + 1];

            var Ka = adata[(20)];
            var Kb = adata[(20) + 1];
            var Kc = adata[(20) + 2];
            var idet = adata[(23)];

            var rn2a = adata[(16)];
            var rn2b = adata[(17)];
            var rt2a = adata[(18)];
            var rt2b = adata[(19)];

            // Second contact friction
            var vrx2 = (vx2 - (r2y2 * vw2)) - (vx1 - (r2y1 * vw1));
            var vry2 = (vy2 + (r2x2 * vw2)) - (vy1 + (r2x1 * vw1));

            j = (((nx * vry2) - (ny * vrx2)) + surfaceX) * cdata2[(6)];
            jMax = (cdata2[(4)] * cdata2[(11)]);
            jOld = cdata2[(12)];
            cjAcc = (jOld - j);
            if (cjAcc > jMax) {
                cjAcc = jMax;
            } else if (cjAcc < -jMax) {
                cjAcc = -jMax;
            }
            j = (cjAcc - jOld);
            cdata2[(12)] = cjAcc;

            jx = (-ny * j);
            jy = (nx * j);
            vx1 -= (jx * im1);
            vy1 -= (jy * im1);
            vw1 -= (rt2a * j * ii1);
            vx2 += (jx * im2);
            vy2 += (jy * im2);
            vw2 += (rt2b * j * ii2);

            // Normal impulses.
            vrx1 = (vx2 - (ry2 * vw2)) - (vx1 - (ry1 * vw1));
            vry1 = (vy2 + (rx2 * vw2)) - (vy1 + (rx1 * vw1));
            vrx2 = (vx2 - (r2y2 * vw2)) - (vx1 - (r2y1 * vw1));
            vry2 = (vy2 + (r2x2 * vw2)) - (vy1 + (r2x1 * vw1));

            var ax = cdata1[(11)];
            var ay = cdata2[(11)];

            // Block solver for both normal impulses together.
            var jnx = ((vrx1 * nx) + (vry1 * ny)) + surfaceY + cdata1[(3)] - ((Ka * ax) + (Kb * ay));
            var jny = ((vrx2 * nx) + (vry2 * ny)) + surfaceY + cdata2[(3)] - ((Kb * ax) + (Kc * ay));

            var xx = idet * ((Kb * jny) - (Kc * jnx));
            var xy = idet * ((Kb * jnx) - (Ka * jny));

            if (xx >= 0 && xy >= 0) {
                jnx = (xx - ax);
                jny = (xy - ay);
                cdata1[(11)] = xx;
                cdata2[(11)] = xy;
            } else {
                xx = -(cdata1[(5)] * jnx);
                if (xx >= 0 && ((Kb * xx) + jny) >= 0) {
                    jnx = (xx - ax);
                    jny = -ay;
                    cdata1[(11)] = xx;
                    cdata2[(11)] = 0;
                } else {
                    xy = -(cdata2[(5)] * jny);
                    if (xy >= 0 && ((Kb * xy) + jnx) >= 0) {
                        jnx = -ax;
                        jny = (xy - ay);
                        cdata1[(11)] = 0;
                        cdata2[(11)] = xy;
                    } else if (jnx >= 0 && jny >= 0) {
                        jnx = -ax;
                        jny = -ay;
                        cdata1[(11)] = cdata2[(11)] = 0;
                    } else {
                        jnx = 0;
                        jny = 0;
                    }
                }
            }

            // Apply impulses
            j = (jnx + jny);
            jx = (nx * j);
            jy = (ny * j);

            vx1 -= (jx * im1);
            vy1 -= (jy * im1);
            vw1 -= ((rn1a * jnx) + (rn2a * jny)) * ii1;
            vx2 += (jx * im2);
            vy2 += (jy * im2);
            vw2 += ((rn1b * jnx) + (rn2b * jny)) * ii2;
        } else {
            if (this._contact1._hash === (0)) {
                // rolling impulse.
                var dw = (vw2 - vw1);
                j = (dw * adata[(17)]);
                jMax = (adata[(3)] * cdata1[(11)]);
                jOld = adata[(16)];
                cjAcc = (jOld - j);
                if (cjAcc > jMax) {
                    cjAcc = jMax;
                } else if (cjAcc < -jMax) {
                    cjAcc = -jMax;
                }
                j = (cjAcc - jOld);
                adata[(16)] = cjAcc;

                vw1 -= (j * ii1);
                vw2 += (j * ii2);
            }

            // normal impulse.
            vrx1 = (vx2 - (ry2 * vw2)) - (vx1 - (ry1 * vw1));
            vry1 = (vy2 + (rx2 * vw2)) - (vy1 + (rx1 * vw1));

            j = (cdata1[(3)] + surfaceY + ((nx * vrx1) + (ny * vry1))) * cdata1[(5)];
            jOld = cdata1[(11)];
            cjAcc = (jOld - j);
            if (cjAcc < 0) {
                cjAcc = 0;
            }
            j = (cjAcc - jOld);
            cdata1[(11)] = cjAcc;

            jx = (nx * j);
            jy = (ny * j);
            vx1 -= (jx * im1);
            vy1 -= (jy * im1);
            vw1 -= (rn1a * j * ii1);
            vx2 += (jx * im2);
            vy2 += (jy * im2);
            vw2 += (rn1b * j * ii2);
        }

        data1[(7)] = vx1;
        data1[(7) + 1] = vy1;
        data1[(7) + 2] = vw1;
        data2[(7)] = vx2;
        data2[(7) + 1] = vy2;
        data2[(7) + 2] = vw2;
    };

    // =====================================================================
    Physics2DArbiter.prototype._refreshContactData = function () {
        var data1 = this.bodyA._data;
        var data2 = this.bodyB._data;
        var cos1 = data1[(5)];
        var sin1 = data1[(5) + 1];
        var cos2 = data2[(5)];
        var sin2 = data2[(5) + 1];
        var px1 = data1[(2)];
        var py1 = data1[(2) + 1];
        var px2 = data2[(2)];
        var py2 = data2[(2) + 1];

        var err, nx, ny;
        var adata = this._data;
        var rad = adata[(14)];
        var cdata1 = this._contact1._data;
        if (this._faceType === (0)) {
            var x = cdata1[(13)];
            var y = cdata1[(13) + 1];
            var rx1 = ((cos1 * x) - (sin1 * y) + px1);
            var ry1 = ((sin1 * x) + (cos1 * y) + py1);

            x = cdata1[(15)];
            y = cdata1[(15) + 1];
            var rx2 = ((cos2 * x) - (sin2 * y) + px2);
            var ry2 = ((sin2 * x) + (cos2 * y) + py2);

            var dx = (rx2 - rx1);
            var dy = (ry2 - ry1);
            var dl = Math.sqrt((dx * dx) + (dy * dy));

            nx = adata[(4)];
            ny = adata[(4) + 1];
            if (dl < Physics2DConfig.NORMALIZE_EPSILON) {
                dx = nx;
                dy = ny;
            } else {
                var rec = (1 / dl);
                dx *= rec;
                dy *= rec;
            }

            err = (dl - rad);
            if (((dx * nx) + (dy * ny)) < 0) {
                err -= rad;
                dx = -dx;
                dy = -dy;
            }

            adata[(4)] = dx;
            adata[(4) + 1] = dy;
            var px, py, r1;
            if (this.shapeA._type === (0)) {
                r1 = this.shapeA._data[(6)] + (err * 0.5);
                px = cdata1[(0)] = (rx1 + (dx * r1));
                py = cdata1[(0) + 1] = (ry1 + (dy * r1));
            } else {
                r1 = this.shapeB._data[(6)] + (err * 0.5);
                px = cdata1[(0)] = (rx2 - (dx * r1));
                py = cdata1[(0) + 1] = (ry2 - (dy * r1));
            }
            cdata1[(2)] = err;
        } else {
            var cdata2 = (this._position2Contact ? this._contact2._data : null);
            var proj;
            var cx1, cx2, cy1, cy2;

            var lx = adata[(11)];
            var ly = adata[(11) + 1];
            var rx = cdata1[(13)];
            var ry = cdata1[(13) + 1];
            if (this._faceType === (1)) {
                nx = (lx * cos1) - (ly * sin1);
                ny = (lx * sin1) + (ly * cos1);
                proj = adata[(13)] + ((nx * px1) + (ny * py1));
                cx1 = (px2 + (rx * cos2) - (ry * sin2));
                cy1 = (py2 + (rx * sin2) + (ry * cos2));
                if (cdata2) {
                    rx = cdata2[(13)];
                    ry = cdata2[(13) + 1];
                    cx2 = (px2 + (rx * cos2) - (ry * sin2));
                    cy2 = (py2 + (rx * sin2) + (ry * cos2));
                }
            } else {
                nx = (lx * cos2) - (ly * sin2);
                ny = (lx * sin2) + (ly * cos2);
                proj = adata[(13)] + ((nx * px2) + (ny * py2));
                cx1 = (px1 + (rx * cos1) - (ry * sin1));
                cy1 = (py1 + (rx * sin1) + (ry * cos1));
                if (cdata2) {
                    rx = cdata2[(13)];
                    ry = cdata2[(13) + 1];
                    cx2 = (px1 + (rx * cos1) - (ry * sin1));
                    cy2 = (py1 + (rx * sin1) + (ry * cos1));
                }
            }

            var flip = (this._reverse ? -1 : 1);
            adata[(4)] = (flip * nx);
            adata[(4) + 1] = (flip * ny);

            var bias = -proj - rad;

            err = ((cx1 * nx) + (cy1 * ny)) + bias;
            var df = ((err * 0.5) + rad);
            cdata1[(0)] = (cx1 - (nx * df));
            cdata1[(0) + 1] = (cy1 - (ny * df));
            cdata1[(2)] = err;

            if (cdata2) {
                err = ((cx2 * nx) + (cy2 * ny)) + bias;
                df = ((err * 0.5) + rad);
                cdata2[(0)] = (cx2 - (nx * df));
                cdata2[(0) + 1] = (cy2 - (ny * df));
                cdata2[(2)] = err;
            }
        }
    };

    Physics2DArbiter.prototype._iteratePosition = function () {
        this._refreshContactData();

        var b1 = this.bodyA;
        var b2 = this.bodyB;
        var data1 = b1._data;
        var data2 = b2._data;
        var im1 = data1[(0)];
        var ii1 = data1[(1)];
        var im2 = data2[(0)];
        var ii2 = data2[(1)];
        var px1 = data1[(2)];
        var py1 = data1[(2) + 1];
        var px2 = data2[(2)];
        var py2 = data2[(2) + 1];

        var px, py, nx, ny, Jx, Jy, jn, dr, Ka, bc;
        var c1r1x, c1r1y, c1r2x, c1r2y, rn1a, rn1b;

        var adata = this._data;
        var cdata1 = this._contact1._data;
        var err1 = cdata1[(2)] + Physics2DConfig.CONTACT_SLOP;
        if (this._position2Contact) {
            var cdata2 = this._contact2._data;
            var err2 = cdata2[(2)] + Physics2DConfig.CONTACT_SLOP;
            if (err1 < 0 || err2 < 0) {
                px = cdata1[(0)];
                py = cdata1[(0) + 1];
                c1r1x = (px - px1);
                c1r1y = (py - py1);
                c1r2x = (px - px2);
                c1r2y = (py - py2);

                px = cdata2[(0)];
                py = cdata2[(0) + 1];
                var c2r1x = (px - px1);
                var c2r1y = (py - py1);
                var c2r2x = (px - px2);
                var c2r2y = (py - py2);

                nx = adata[(4)];
                ny = adata[(4) + 1];

                rn1a = (c1r1x * ny) - (c1r1y * nx);
                rn1b = (c1r2x * ny) - (c1r2y * nx);
                var rn2a = (c2r1x * ny) - (c2r1y * nx);
                var rn2b = (c2r2x * ny) - (c2r2y * nx);

                // Non-inverted block effective-mass.
                var massSum = (im1 + im2);
                Ka = massSum + (ii1 * rn1a * rn1a) + (ii2 * rn1b * rn1b);
                var Kb = massSum + (ii1 * rn1a * rn2a) + (ii2 * rn1b * rn2b);
                var Kc = massSum + (ii1 * rn2a * rn2a) + (ii2 * rn2b * rn2b);

                bc = adata[(15)];
                var bx = (err1 * bc);
                var by = (err2 * bc);

                // Block solver.
                var det = ((Ka * Kc) - (Kb * Kb));
                var xx, xy;
                if (det === 0) {
                    xx = (Ka === 0) ? 0 : (-bx / Ka);
                    xy = (Kc === 0) ? 0 : (-by / Kc);
                } else {
                    det = (1 / det);
                    xx = (det * (Kb * by - Kc * bx));
                    xy = (det * (Kb * bx - Ka * by));
                }

                if (xx < 0 || xy < 0) {
                    xx = (-bx / Ka);
                    xy = 0;
                    if (xx < 0 || ((Kb * xx) + by) < 0) {
                        xx = 0;
                        xy = (-by / Kc);
                        if (xy < 0 || ((Kb * xy) + bx) < 0) {
                            xx = xy = 0;
                        }
                    }
                }

                // Apply impulses.
                jn = xx + xy;
                Jx = (nx * jn);
                Jy = (ny * jn);

                px1 -= (Jx * im1);
                py1 -= (Jy * im1);
                dr = -((rn1a * xx) + (rn2a * xy)) * ii1;
                if (dr !== 0) {
                    b1._deltaRotation(dr);
                }
                px2 += (Jx * im2);
                py2 += (Jy * im2);
                dr = ((rn1b * xx) + (rn2b * xy)) * ii2;
                if (dr !== 0) {
                    b2._deltaRotation(dr);
                }
            }
        } else {
            if (err1 < 0) {
                px = cdata1[(0)];
                py = cdata1[(0) + 1];

                c1r1x = (px - px1);
                c1r1y = (py - py1);
                c1r2x = (px - px2);
                c1r2y = (py - py2);

                nx = adata[(4)];
                ny = adata[(4) + 1];

                // jac
                rn1a = (c1r1x * ny) - (c1r1y * nx);
                rn1b = (c1r2x * ny) - (c1r2y * nx);

                // eff-mass
                Ka = im2 + (rn1b * rn1b * ii2) + im1 + (rn1a * rn1a * ii1);
                if (Ka !== 0) {
                    bc = adata[(15)];
                    jn = -(bc * err1 / Ka);
                    Jx = (nx * jn);
                    Jy = (ny * jn);

                    px1 -= (Jx * im1);
                    py1 -= (Jy * im1);
                    dr = -(rn1a * ii1 * jn);
                    if (dr !== 0) {
                        b1._deltaRotation(dr);
                    }
                    px2 += (Jx * im2);
                    py2 += (Jy * im2);
                    dr = (rn1b * ii2 * jn);
                    if (dr !== 0) {
                        b2._deltaRotation(dr);
                    }
                }
            }
        }

        data1[(2)] = px1;
        data1[(2) + 1] = py1;
        data2[(2)] = px2;
        data2[(2) + 1] = py2;
    };

    // =====================================================================
    Physics2DArbiter.prototype._warmStart = function () {
        var data1 = this.bodyA._data;
        var data2 = this.bodyB._data;
        var im1 = data1[(0)];
        var ii1 = data1[(1)];
        var im2 = data2[(0)];
        var ii2 = data2[(1)];

        var adata = this._data;
        var nx = adata[(4)];
        var ny = adata[(4) + 1];

        var cdata = this._contact1._data;
        var jn = cdata[(11)];
        var jt = cdata[(12)];

        var jx = (nx * jn) - (ny * jt);
        var jy = (ny * jn) + (nx * jt);
        data1[(7)] -= (jx * im1);
        data1[(7) + 1] -= (jy * im1);
        data1[(7) + 2] -= ((cdata[(7)] * jy) - (cdata[(7) + 1] * jx)) * ii1;
        data2[(7)] += (jx * im2);
        data2[(7) + 1] += (jy * im2);
        data2[(7) + 2] += ((cdata[(9)] * jy) - (cdata[(9) + 1] * jx)) * ii2;

        if (this._velocity2Contact) {
            cdata = this._contact2._data;
            jn = cdata[(11)];
            jt = cdata[(12)];

            jx = (nx * jn) - (ny * jt);
            jy = (ny * jn) + (nx * jt);
            data1[(7)] -= (jx * im1);
            data1[(7) + 1] -= (jy * im1);
            data1[(7) + 2] -= ((cdata[(7)] * jy) - (cdata[(7) + 1] * jx)) * ii1;
            data2[(7)] += (jx * im2);
            data2[(7) + 1] += (jy * im2);
            data2[(7) + 2] += ((cdata[(9)] * jy) - (cdata[(9) + 1] * jx)) * ii2;
        } else if (this._contact1._hash === (0)) {
            jn = adata[(16)];

            data1[(7) + 2] -= (jn * ii1);
            data2[(7) + 2] += (jn * ii2);
        }
    };

    Physics2DArbiter.prototype.getImpulseForBody = function (body, dst/*v3*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(3);
        }

        var adata = this._data;
        var nx = adata[(4)];
        var ny = adata[(4) + 1];

        var cdata = this._contact1._data;
        var jn = cdata[(11)];
        var jt = cdata[(12)];

        var jx = (nx * jn) - (ny * jt);
        var jy = (ny * jn) + (nx * jt);

        var sumX = 0;
        var sumY = 0;
        var sumW = 0;
        if (body === this.bodyA) {
            sumX -= jx;
            sumY -= jy;
            sumW -= ((cdata[(7)] * jy) - (cdata[(7) + 1] * jx));
        } else if (body === this.bodyB) {
            sumX += jx;
            sumY += jy;
            sumW += ((cdata[(9)] * jy) - (cdata[(9) + 1] * jx));
        }

        if (this._velocity2Contact) {
            cdata = this._contact2._data;
            jn = cdata[(11)];
            jt = cdata[(12)];

            jx = (nx * jn) - (ny * jt);
            jy = (ny * jn) + (nx * jt);
            if (body === this.bodyA) {
                sumX -= jx;
                sumY -= jy;
                sumW -= ((cdata[(7)] * jy) - (cdata[(7) + 1] * jx));
            } else if (body === this.bodyB) {
                sumX += jx;
                sumY += jy;
                sumW += ((cdata[(9)] * jy) - (cdata[(9) + 1] * jx));
            }
        } else if (this._contact1._hash === (0)) {
            jn = adata[(16)];
            sumW += (body === this.bodyA ? -1 : (body === this.bodyB ? 1 : 0)) * jn;
        }

        dst[0] = sumX;
        dst[1] = sumY;
        dst[2] = sumW;
        return dst;
    };

    Physics2DArbiter.allocate = function () {
        if (!this.pool) {
            return new Physics2DArbiter();
        } else {
            var arb = this.pool;
            this.pool = arb._next;
            arb._next = null;
            return arb;
        }
    };
    Physics2DArbiter.deallocate = function (arb) {
        arb._next = this.pool;
        this.pool = arb;

        arb._userdef = 0;
    };
    Physics2DArbiter.version = 1;

    Physics2DArbiter.pool = null;
    return Physics2DArbiter;
})();

;

;

;

//
// Physics2D World
//
var Physics2DWorld = (function () {
    function Physics2DWorld() {
    }
    Physics2DWorld.prototype.getGravity = function (dst/*v2*/ ) {
        if (dst === undefined) {
            dst = new Physics2DDevice.prototype.floatArray(2);
        }

        dst[0] = this._gravityX;
        dst[1] = this._gravityY;
        return dst;
    };

    Physics2DWorld.prototype.setGravity = function (gravity/*v2*/ ) {
        var newX = gravity[0];
        var newY = gravity[1];
        if (newX !== this._gravityX || newY !== this._gravityY) {
            this._gravityX = newX;
            this._gravityY = newY;

            var bodies = this.rigidBodies;
            var limit = bodies.length;
            var i;
            for (i = 0; i < limit; i += 1) {
                this._wakeBody(bodies[i]);
            }
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._addShape = function (shape) {
        var body = shape.body;
        body._update();

        var isStaticHandle = ((body._type === (2)) || body.sleeping);
        shape._bphaseHandle = this.broadphase.insert(shape, shape._data, isStaticHandle);
    };

    // precon: body was woken before calling this method.
    //         therefore all arbiters are in the world as
    //         non-sleeping.
    Physics2DWorld.prototype._removeShape = function (shape, noCallbacks) {
        var body = shape.body;
        this.broadphase.remove(shape._bphaseHandle);
        shape._bphaseHandle = null;

        var arbiters = shape.arbiters;
        while (arbiters.length !== 0) {
            var arb = arbiters.pop();
            if (arb._retired) {
                continue;
            }

            if (arb.bodyA !== body && arb.bodyA._type === (0)) {
                this._wakeBody(arb.bodyA);
            }
            if (arb.bodyB !== body && arb.bodyB._type === (0)) {
                this._wakeBody(arb.bodyB);
            }

            arb._lazyRetire(shape);
            if (!noCallbacks) {
                this._pushInteractionEvents((3), arb);
            }
        }
    };

    // Call on constraint when:
    //  A)  active (outside world), and then added to world
    //  B)  in world (inactive), and then enabled
    Physics2DWorld.prototype._enabledConstraint = function (constraint) {
        // prepare constraint for disjoint set forest.
        constraint._islandRoot = constraint;
        constraint._islandRank = 0;

        if (!constraint.sleeping) {
            constraint.sleeping = true;
            this._wakeConstraint(constraint, true);
        }
    };

    // Call on constraint when:
    //  A)  active (in world), and then removed from world
    //  B)  in world (active), and then disabled.
    Physics2DWorld.prototype._disabledConstraint = function (constraint) {
        this._wakeConstraint(constraint);

        var constraints = this.liveConstraints;
        var index = constraints.indexOf(constraint);
        constraints[index] = constraints[constraints.length - 1];
        constraints.pop();
    };

    Physics2DWorld.prototype.addConstraint = function (constraint) {
        if (constraint.world) {
            return false;
        }

        constraint.world = this;
        this.constraints.push(constraint);

        constraint._inWorld();

        if (constraint._active) {
            this._enabledConstraint(constraint);
        }

        return true;
    };

    Physics2DWorld.prototype.removeConstraint = function (constraint) {
        if (constraint.world !== this) {
            return false;
        }

        var constraints = this.constraints;
        var index = constraints.indexOf(constraint);
        constraints[index] = constraints[constraints.length - 1];
        constraints.pop();

        if (constraint._active) {
            this._disabledConstraint(constraint);
        }

        constraint.world = null;
        constraint._outWorld();

        return true;
    };

    Physics2DWorld.prototype.addRigidBody = function (body) {
        if (body.world) {
            return false;
        }

        body.world = this;
        this.rigidBodies.push(body);

        body._update();

        var i;
        var shapes = body.shapes;
        var limit = shapes.length;
        for (i = 0; i < limit; i += 1) {
            this._addShape(shapes[i]);
        }

        if (body._type === (2)) {
            body.sleeping = true;
            return true;
        }

        // prepare body for disjoint set forest.
        body._islandRoot = body;
        body._islandRank = 0;

        if (!body.sleeping) {
            body.sleeping = true;
            this._wakeBody(body, true);
        }

        return true;
    };

    Physics2DWorld.prototype.removeRigidBody = function (body, noCallbacks) {
        if (body.world !== this) {
            return false;
        }

        this._wakeBody(body);

        body.world = null;
        var rigidBodies = this.rigidBodies;
        var index = rigidBodies.indexOf(body);
        rigidBodies[index] = rigidBodies[rigidBodies.length - 1];
        rigidBodies.pop();

        if (!body.sleeping && (body._type !== (2))) {
            if (body._type === (0)) {
                rigidBodies = this.liveDynamics;
            } else {
                rigidBodies = this.liveKinematics;
            }

            index = rigidBodies.indexOf(body);
            rigidBodies[index] = rigidBodies[rigidBodies.length - 1];
            rigidBodies.pop();
        }

        var i;
        var shapes = body.shapes;
        var limit = shapes.length;
        for (i = 0; i < limit; i += 1) {
            this._removeShape(shapes[i], noCallbacks);
        }

        // Remove constraints!
        var constraints = body.constraints;
        while (constraints.length > 0) {
            this.removeConstraint(constraints[0]);
        }

        return true;
    };

    // =====================================================================
    Physics2DWorld.prototype.clear = function () {
        // Clean up rigidBodies, liveDynamics, liveKinematics
        var bodies = this.rigidBodies;
        var limit = bodies.length;
        while (limit > 0) {
            limit -= 1;
            this.removeRigidBody(bodies[limit], true);
        }

        // Clean up constraints, liveConstraints
        var constraints = this.constraints;
        limit = constraints.length;
        while (limit > 0) {
            limit -= 1;
            this.removeConstraint(constraints[limit]);
        }

        // Clean up dynamicArbiters, staticArbiters
        this._clearArbiters(this.staticArbiters);
        this._clearArbiters(this.dynamicArbiters);

        // Clean up any deferred callbacks generated
        // outside of world::step()
        // (Waking a constraint/body indirectly)
        // (Removing a shape)
        var callbacks = this._callbacks;
        limit = callbacks.length;
        while (limit > 0) {
            limit -= 1;
            Physics2DCallback.deallocate(callbacks.pop());
        }
        // _island, _toiEvents already empty
        // broadphase already clear by removal of shapes.
    };

    Physics2DWorld.prototype._clearArbiters = function (arbiters) {
        var limit = arbiters.length;
        while (limit > 0) {
            var arb = arbiters.pop();
            limit -= 1;

            arb._retire();
            Physics2DArbiter.deallocate(arb);
        }
    };

    // =====================================================================
    Physics2DWorld.prototype.shapePointQuery = function (point/*v2*/ , store) {
        return this._pointQuery(this._shapePointCallback, point, store);
    };

    Physics2DWorld.prototype.bodyPointQuery = function (point/*v2*/ , store) {
        return this._pointQuery(this._bodyPointCallback, point, store);
    };

    Physics2DWorld.prototype._pointQuery = function (callback, point, store) {
        var rect = this._sampleRectangle;
        rect[0] = rect[2] = point[0];
        rect[1] = rect[3] = point[1];

        callback.store = store;
        callback.count = 0;
        this.broadphase.sample(rect, callback.sample, callback);
        return callback.count;
    };

    // -------------------------------------
    Physics2DWorld.prototype.shapeCircleQuery = function (center/*v2*/ , radius, store) {
        return this._circleQuery(this._shapeCircleCallback, center, radius, store);
    };

    Physics2DWorld.prototype.bodyCircleQuery = function (center/*v2*/ , radius, store) {
        return this._circleQuery(this._bodyCircleCallback, center, radius, store);
    };

    Physics2DWorld.prototype._circleQuery = function (callback, center, radius, store) {
        var circle = this._circleQueryShape;
        circle.setRadius(radius);

        var posX = center[0];
        var posY = center[1];
        circle._update(posX, posY, 1, 0);

        var rect = this._sampleRectangle;
        rect[0] = (posX - radius);
        rect[1] = (posY - radius);
        rect[2] = (posX + radius);
        rect[3] = (posY + radius);

        callback.store = store;
        callback.count = 0;
        this.broadphase.sample(rect, callback.sample, callback);
        return callback.count;
    };

    // -------------------------------------
    Physics2DWorld.prototype.shapeRectangleQuery = function (aabb/*v4*/ , store) {
        return this._rectangleQuery(this._shapeRectangleCallback, aabb, store);
    };

    Physics2DWorld.prototype.bodyRectangleQuery = function (aabb/*v4*/ , store) {
        return this._rectangleQuery(this._bodyRectangleCallback, aabb, store);
    };

    Physics2DWorld.prototype._rectangleQuery = function (callback, aabb, store) {
        var vertices = this._rectangleQueryVertices;

        var x1 = aabb[0];
        var y1 = aabb[1];
        var x2 = aabb[2];
        var y2 = aabb[3];
        vertices[0][0] = vertices[3][0] = (x1 < x2 ? x1 : x2);
        vertices[0][1] = vertices[1][1] = (y1 < y2 ? y1 : y2);
        vertices[1][0] = vertices[2][0] = (x1 < x2 ? x2 : x1);
        vertices[2][1] = vertices[3][1] = (y1 < y2 ? y2 : y1);

        var poly = this._rectangleQueryShape;
        poly.setVertices(vertices);
        poly._update(0, 0, 1, 0);

        callback.store = store;
        callback.count = 0;
        this.broadphase.sample(aabb, callback.sample, callback);
        return callback.count;
    };

    // =====================================================================
    Physics2DWorld.prototype.rayCast = function (ray, noInnerSurfaces, customCallback, thisObject) {
        var origin = ray.origin;
        var direction = ray.direction;
        var maxFactor = ray.maxFactor;
        var x1 = origin[0];
        var y1 = origin[1];
        var x2 = x1 + (direction[0] * maxFactor);
        var y2 = y1 + (direction[1] * maxFactor);

        var rect = this._sampleRectangle;
        rect[0] = (x1 < x2 ? x1 : x2);
        rect[1] = (y1 < y2 ? y1 : y2);
        rect[2] = (x1 < x2 ? x2 : x1);
        rect[3] = (y1 < y2 ? y2 : y1);

        var callback = this._rayCast;
        callback.ray = ray;
        callback.noInner = (noInnerSurfaces || false);
        callback.minFactor = ray.maxFactor;
        callback.userCallback = customCallback;
        callback.userThis = thisObject;
        callback.minShape = null;
        this.broadphase.sample(rect, callback.sample, callback);

        if (callback.minShape) {
            var data = callback.minNormal;
            var hitNormal = new Physics2DDevice.prototype.floatArray(2);
            var hitPoint = new Physics2DDevice.prototype.floatArray(2);
            hitNormal[0] = data[0];
            hitNormal[1] = data[1];
            hitPoint[0] = (x1 + (direction[0] * callback.minFactor));
            hitPoint[1] = (y1 + (direction[1] * callback.minFactor));
            return {
                shape: callback.minShape,
                hitNormal: hitNormal,
                hitPoint: hitPoint,
                factor: callback.minFactor
            };
        } else {
            return null;
        }
    };

    Physics2DWorld.prototype.convexCast = function (shape, deltaTime, customCallback, thisObject) {
        var body = shape.body;
        var bdata = body._data;
        var preX = bdata[(2)];
        var preY = bdata[(2) + 1];
        body._sweepIntegrate(deltaTime);
        var curX = bdata[(2)];
        var curY = bdata[(2) + 1];

        var rect = this._sampleRectangle;
        var radius = shape._data[(4)];
        rect[0] = ((preX < curX ? preX : curX) - radius);
        rect[1] = ((preY < curY ? preY : curY) - radius);
        rect[2] = ((preX < curX ? curX : preX) + radius);
        rect[3] = ((preY < curY ? curY : preY) + radius);

        body[(20)] = body[(7) + 2];

        var callback = this._convexCast;
        callback.deltaTime = deltaTime;
        callback.minTOIAlpha = 1;
        callback.minShape = null;
        callback.toi.shapeA = shape;
        callback.userCallback = customCallback;
        callback.userThis = thisObject;
        this.broadphase.sample(rect, callback.sample, callback);

        // reset sweep body and shape.
        body._sweepIntegrate(0);
        shape._update(preX, preY, bdata[(5)], bdata[(5) + 1], true);

        if (callback.minShape) {
            var data = callback.minData;
            var hitNormal = new Physics2DDevice.prototype.floatArray(2);
            var hitPoint = new Physics2DDevice.prototype.floatArray(2);
            hitNormal[0] = -data[0];
            hitNormal[1] = -data[1];
            hitPoint[0] = data[2];
            hitPoint[1] = data[3];
            return {
                shape: callback.minShape,
                hitNormal: hitNormal,
                hitPoint: hitPoint,
                factor: (callback.minTOIAlpha * deltaTime)
            };
        } else {
            return null;
        }
    };

    // =====================================================================
    Physics2DWorld.prototype.step = function (deltaTime) {
        this._midStep = true;
        this._eventTime = (0);
        this.timeStamp += 1;
        this._deltaTime = deltaTime;
        this.simulatedTime += deltaTime;

        // Update objects for current position/rotation
        // As well as preparing delayed WAKE callbacks.
        this._validate();

        // Perform discrete collision detection
        this._discreteCollisions();

        // Perform sleeping
        this._sleepComputations(deltaTime);

        // Pre-step arbiters
        this._preStep(deltaTime);

        // Sort arbiters
        this._sortArbiters();

        // Integrate velocities
        this._integrateVelocity(deltaTime);

        // Warm start arbiters
        this._warmStart();

        // Velocity iterators.
        this._iterateVelocity(this.velocityIterations);

        // Integrate positions and prepare for continuous collision detection.
        this._integratePosition(deltaTime);

        // Perform continous collision detection
        this._eventTime = (1);
        this._continuousCollisions(deltaTime);

        // Sort arbiters (continuous may have inserted more).
        this._sortArbiters();

        // Positional iterationrs
        this._iteratePosition(this.positionIterations);

        // Finalize bodies, invalidating if necessary
        // Put kinematics that have not moved to sleep
        // Finalize contact positions, generate interaction callbacks.
        this._finalize();

        // Issue callbacks
        this._midStep = false;
        this._eventTime = (-1);
        this._doCallbacks();
    };

    // =========================================================================
    // =========================================================================
    Physics2DWorld.prototype._discreteCollisions = function () {
        this.broadphase.perform(this._discreteNarrowPhase, this);
        this._doDeferredWake(false);
    };

    Physics2DWorld.prototype._doDeferredWake = function (continuous) {
        // Waking of bodies by collision must be deferred,
        // Broadphase must not be modified during 'perform' call.
        var wakes = this._deferredWake;
        var limit = wakes.length;
        while (limit > 0) {
            var body = wakes.pop();
            body._deferred = false;

            // In the case of waking bodies after continuous collisions.
            // We must prestep the arbiters both for correct physics
            // and for callbacks to be properly generated (progress on sleeping arbiters).
            //
            // This is given by the continuous argument.
            this._wakeBody(body, false, continuous);
            limit -= 1;
        }
    };

    Physics2DWorld.prototype._collisionType = function (s1, s2, b1, b2) {
        if (b1 === b2) {
            return undefined;
        }

        var constraints = ((b1.constraints.length < b2.constraints.length) ? b1.constraints : b2.constraints);
        var limit = constraints.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var con = constraints[i];
            if (con._active && con._ignoreInteractions && con._pairExists(b1, b2)) {
                return undefined;
            }
        }

        if ((s1._group & s2._mask) === 0 || (s2._group & s1._mask) === 0) {
            return undefined;
        }

        var collisionType = !(s1.sensor || s2.sensor);

        if (b1._type !== (0) && b2._type !== (0) && collisionType) {
            return undefined;
        }

        return collisionType;
    };

    Physics2DWorld.prototype._discreteNarrowPhase = function (handleA, handleB, continuous) {
        var s1 = handleA.data;
        var s2 = handleB.data;

        var b1 = s1.body;
        var b2 = s2.body;

        var ctype = this._collisionType(s1, s2, b1, b2);
        if (ctype === undefined) {
            // No interaction wanted.
            return null;
        }

        var staticType = (b1._type !== (0) || b2._type !== (0));

        // Order shapes by id for consistent Arbiter lookup without two-way check.
        var sa, sb;
        if (s1.id < s2.id) {
            sa = s1;
            sb = s2;
        } else {
            sa = s2;
            sb = s1;
        }

        // Search for existing Arbiter using smallest of shapes' arbiters lists.
        var arbiters = (sa.arbiters.length < sb.arbiters.length ? sa : sb).arbiters;
        var limit = arbiters.length;
        var i;
        var arb;
        for (i = 0; i < limit; i += 1) {
            var sarb = arbiters[i];
            if (sarb.shapeA === sa && sarb.shapeB === sb) {
                arb = sarb;
                break;
            }
        }

        var first = (!arb);
        if (first) {
            arb = Physics2DArbiter.allocate();
        }

        if (first || arb._timeStamp !== this.timeStamp || continuous) {
            arb._timeStamp = this.timeStamp;
            if ((ctype && this._collisions._collide(sa, sb, arb)) || (!ctype && this._collisions._test(sa, sb))) {
                if (first) {
                    arb.sensor = (!ctype);
                    arb._assign(sa, sb);
                    arb._static = staticType;
                    if (staticType) {
                        this.staticArbiters.push(arb);
                    } else {
                        this.dynamicArbiters.push(arb);
                    }
                }

                if (first || (arb._endGenerated === this.timeStamp && continuous) || (arb._updateStamp < (this.timeStamp - 1))) {
                    arb._createContinuous = continuous;
                    arb._createStamp = this.timeStamp;

                    // Sensor type interaction takes no presolve events.
                    // so we immediately set state to ACCEPT|ALWAYS
                    /*jshint bitwise: false*/
                    arb._state = (ctype ? 0 : ((1) | (2)));
                    /*jshint bitwise: true*/
                }

                arb._updateStamp = this.timeStamp;

                var anyIndeterminate = false;

                if (ctype && (arb._state & (2)) === 0) {
                    // Reset to default of ACCEPT, but not ALWAYS
                    // so that if no events are yet added, and one is then added
                    // it will be called.
                    arb._state = (1);
                    arb._midStep = true;

                    var events = sa._onPreSolve;
                    limit = events.length;
                    var eventObject;
                    for (i = 0; i < limit; i += 1) {
                        eventObject = events[i];
                        eventObject.callback.call(eventObject.thisObject, arb, sb);
                        if (!eventObject.deterministic) {
                            anyIndeterminate = true;
                        }
                    }

                    events = sb._onPreSolve;
                    limit = events.length;
                    for (i = 0; i < limit; i += 1) {
                        eventObject = events[i];
                        eventObject.callback.call(eventObject.thisObject, arb, sa);
                        if (!eventObject.deterministic) {
                            anyIndeterminate = true;
                        }
                    }

                    arb._midStep = false;
                    arb._indeterminate = anyIndeterminate;

                    if (anyIndeterminate && (arb._state & (2)) === 0) {
                        if (b1._type === (0) && !b1._deferred) {
                            b1._deferred = true;
                            this._deferredWake.push(b1);
                        }
                        if (b2._type === (0) && !b1._deferred) {
                            b2._deferred = true;
                            this._deferredWake.push(b2);
                        }
                    }
                }

                if (ctype && ((arb._state & (1)) !== 0)) {
                    if (b1._type === (0) && b1.sleeping && !b1._deferred) {
                        b1._deferred = true;
                        this._deferredWake.push(b1);
                    }
                    if (b2._type === (0) && b2.sleeping && !b2._deferred) {
                        b2._deferred = true;
                        this._deferredWake.push(b2);
                    }
                }

                if (arb.sleeping) {
                    this._wakeArbiter(arb);
                }
            } else if (first) {
                Physics2DArbiter.deallocate(arb);
                arb = null;
            }
        }

        return arb;
    };

    // =====================================================================
    Physics2DWorld.prototype._continuousCollisions = function (deltaTime) {
        this.broadphase.perform(this._continuousNarrowPhase, this);

        var curTimeAlpha = 0.0;
        var toiEvents = this._toiEvents;
        var limit = toiEvents.length;
        var toi, i;
        while (curTimeAlpha < 1.0 && limit !== 0) {
            var minTOIAlpha = Number.POSITIVE_INFINITY;
            var minKinematic = false;
            var min = -1;

            var b1, b2;
            for (i = 0; i < limit;) {
                toi = toiEvents[i];
                b1 = toi.shapeA.body;
                b2 = toi.shapeB.body;

                if (b1._sweepFrozen && b2._sweepFrozen) {
                    limit -= 1;
                    toiEvents[i] = toiEvents[limit];
                    toiEvents.pop();
                    Physics2DTOIEvent.deallocate(toi);
                    continue;
                }

                if (toi.frozenA !== b1._sweepFrozen || toi.frozenB !== b2._sweepFrozen) {
                    // Recompute TOI
                    toi.frozenA = b1._sweepFrozen;
                    toi.frozenB = b2._sweepFrozen;

                    if (toi.frozenA) {
                        var tmp = toi.shapeA;
                        toi.shapeA = toi.shapeB;
                        toi.shapeB = tmp;
                        toi.frozenA = false;
                        toi.frozenB = true;
                    }

                    this._collisions._staticSweep(toi, deltaTime, Physics2DConfig.SWEEP_SLOP);
                    if (toi._data[(6)] < 0) {
                        limit -= 1;
                        toiEvents[i] = toiEvents[limit];
                        toiEvents.pop();
                        Physics2DTOIEvent.deallocate(toi);
                        continue;
                    }
                }

                var curTOIAlpha = toi._data[(6)];
                if (curTOIAlpha >= 0 && (curTOIAlpha < minTOIAlpha || (!minKinematic && toi.kinematic))) {
                    minTOIAlpha = curTOIAlpha;
                    minKinematic = toi.kinematic;
                    min = i;
                }

                i += 1;
            }

            if (min === -1) {
                break;
            }

            // Remove TOI event from list
            toi = toiEvents[min];
            limit -= 1;
            toiEvents[min] = toiEvents[limit];
            toiEvents.pop();

            // Advance time alpha
            curTimeAlpha = minTOIAlpha;

            var s1 = toi.shapeA;
            var s2 = toi.shapeB;
            b1 = s1.body;
            b2 = s2.body;
            var data1 = b1._data;
            var data2 = b2._data;

            if (!b1._sweepFrozen || toi.kinematic) {
                b1._sweepIntegrate(curTimeAlpha * deltaTime);
                s1._update(data1[(2)], data1[(2) + 1], data1[(5)], data1[(5) + 1], true);
            }
            if (!b2._sweepFrozen || toi.kinematic) {
                b2._sweepIntegrate(curTimeAlpha * deltaTime);
                s2._update(data2[(2)], data2[(2) + 1], data2[(5)], data2[(5) + 1], true);
            }

            var arb = this._discreteNarrowPhase(s1._bphaseHandle, s2._bphaseHandle, true);
            if (arb) {
                // Discrete collision detected, pre-step for position iterations
                // (For sensors, issue begin callbacks if appropriate)
                this._continuousArbiterPrepare(arb, deltaTime);
            }

            if (arb && !arb.sensor && (arb._state & (1)) !== 0) {
                if (!b1._sweepFrozen && b1._type === (0)) {
                    b1._sweepFrozen = true;
                    if (toi.failed) {
                        data1[(20)] = 0;
                    } else if (toi.slipped) {
                        data1[(20)] *= Physics2DConfig.TOI_SLIP_SCALE;
                    }
                    data1[(7) + 2] = data1[(20)];
                }
                if (!b2._sweepFrozen && b2._type === (0)) {
                    b2._sweepFrozen = true;
                    if (toi.failed) {
                        data2[(20)] = 0;
                    } else if (toi.slipped) {
                        data2[(20)] *= Physics2DConfig.TOI_SLIP_SCALE;
                    }
                    data2[(7) + 2] = data2[(20)];
                }
            }

            Physics2DTOIEvent.deallocate(toi);
        }

        while (limit > 0) {
            toi = toiEvents.pop();
            Physics2DTOIEvent.deallocate(toi);
            limit -= 1;
        }

        // Advance remaining, unfrozen objects to end of time step.
        var bodies = this.liveDynamics;
        limit = bodies.length;
        for (i = 0; i < limit; i += 1) {
            var body = bodies[i];
            if (!body._sweepFrozen) {
                body._sweepIntegrate(deltaTime);
            }
        }

        // Advance all kinematics to end of time step.
        bodies = this.liveKinematics;
        limit = bodies.length;
        for (i = 0; i < limit; i += 1) {
            bodies[i]._sweepIntegrate(deltaTime);
        }

        // We do not need to do any more work with sleeping arbiters
        // here like pre-stepping before position iterations
        //
        // Arbiters were sleeping -> objects were sleeping -> data
        // is the same.
        this._doDeferredWake(true);
    };

    Physics2DWorld.prototype._continuousNarrowPhase = function (handleA, handleB) {
        var s1 = handleA.data;
        var s2 = handleB.data;
        var b1 = s1.body;
        var b2 = s2.body;
        if (b1._sweepFrozen && b2._sweepFrozen) {
            return;
        }

        var staticType = (b1._type !== (0) || b2._type !== (0));
        if (staticType || (b1._bullet || b2._bullet)) {
            var toi = Physics2DTOIEvent.allocate();
            var kin = (b1._type === (1) || b2._type === (1));
            if (staticType && !kin) {
                if (b1._type !== (0)) {
                    toi.shapeB = s1;
                    toi.shapeA = s2;
                } else {
                    toi.shapeA = s1;
                    toi.shapeB = s2;
                }
                this._collisions._staticSweep(toi, this._deltaTime, Physics2DConfig.SWEEP_SLOP);
            } else {
                if (s1.body._sweepFrozen) {
                    toi.shapeB = s1;
                    toi.shapeA = s2;
                    this._collisions._staticSweep(toi, this._deltaTime, Physics2DConfig.SWEEP_SLOP);
                } else if (s2.body._sweepFrozen) {
                    toi.shapeA = s1;
                    toi.shapeB = s2;
                    this._collisions._staticSweep(toi, this._deltaTime, Physics2DConfig.SWEEP_SLOP);
                } else {
                    toi.shapeA = s1;
                    toi.shapeB = s2;
                    this._collisions._dynamicSweep(toi, this._deltaTime, Physics2DConfig.SWEEP_SLOP);
                }
            }

            if ((staticType && toi._data[(6)] < 0) || toi.failed) {
                Physics2DTOIEvent.deallocate(toi);
            } else {
                this._toiEvents.push(toi);
                toi.frozenA = toi.shapeA.body._sweepFrozen;
                toi.frozenB = toi.shapeB.body._sweepFrozen;
                toi.staticType = staticType;
                toi.kinematic = kin;
            }
        }
    };

    // =====================================================================
    Physics2DWorld.prototype.__union = function (x, y) {
        var stack, next;

        while (x !== x._islandRoot) {
            next = x._islandRoot;
            x._islandRoot = stack;
            stack = x;
            x = next;
        }
        while (stack) {
            next = stack._islandRoot;
            stack._islandRoot = x;
            stack = next;
        }

        while (y !== y._islandRoot) {
            next = y._islandRoot;
            y._islandRoot = stack;
            stack = y;
            y = next;
        }
        while (stack) {
            next = stack._islandRoot;
            stack._islandRoot = y;
            stack = next;
        }

        if (x !== y) {
            if (x._islandRank < y._islandRank) {
                x._islandRoot = y;
            } else if (y._islandRank < x._islandRank) {
                y._islandRoot = x;
            } else {
                y._islandRoot = x;
                x._islandRank += 1;
            }
        }
    };

    Physics2DWorld.prototype.__find = function (x) {
        if (x === x._islandRoot) {
            return x;
        }

        var stack = null;
        var next;
        while (x !== x._islandRoot) {
            next = x._islandRoot;
            x._islandRoot = stack;
            stack = x;
            x = next;
        }
        while (stack) {
            next = stack._islandRoot;
            stack._islandRoot = x;
            stack = next;
        }
        return x;
    };

    // =====================================================================
    Physics2DWorld.prototype._sleepComputations = function (deltaTime) {
        // Build disjoint set forest.
        //
        // arb.active not yet computed, so base it on currently available info.
        var arbiters = this.dynamicArbiters;
        var arb;
        var limit = arbiters.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            arb = arbiters[i];

            if (!arb.sensor && !arb._retired && arb._updateStamp === this.timeStamp && (arb._state & (1)) !== 0) {
                /*jshint bitwise: true*/
                var b1 = arb.bodyA;
                var b2 = arb.bodyB;
                if (b1._type === (0) && b2._type === (0)) {
                    this.__union(b1, b2);
                }
            }
        }

        var constraints = this.liveConstraints;
        limit = constraints.length;
        for (i = 0; i < limit; i += 1) {
            constraints[i]._sleepComputation(this.__union);
        }

        // Build islands.
        var islands = this._islands;
        var island, root;
        var bodies = this.liveDynamics;
        limit = bodies.length;
        while (limit > 0) {
            limit -= 1;
            var body = bodies.pop();

            root = this.__find(body);
            island = root._island;
            if (island === null) {
                root._island = island = Physics2DIsland.allocate();
                islands.push(island);
                island.sleeping = true;
                island.wakeTime = 0;
            }
            body._island = island;
            island.components.push(body);

            var atRest = body._atRest(deltaTime, this.timeStamp);
            island.sleeping = (island.sleeping && atRest);
            if (body._wakeTime > island.wakeTime) {
                island.wakeTime = body._wakeTime;
            }
        }

        limit = constraints.length;
        while (limit > 0) {
            limit -= 1;
            var con = constraints.pop();

            root = this.__find(con);
            island = root._island;
            if (island === null) {
                root._island = island = Physics2DIsland.allocate();
                islands.push(island);
                island.sleeping = true;
                island.wakeTime = 0;
            }

            con._island = island;
            island.components.push(con);
            if (con._wakeTime > island.wakeTime) {
                island.wakeTime = con._wakeTime;
            }
        }

        // Build new live lists of bodies and constraints.
        // live lists of arbiters is deferred to preStep.
        // And destroy waking islands.
        limit = islands.length;
        var limit2;
        var bphase = this.broadphase;
        while (limit > 0) {
            limit -= 1;
            island = islands[limit];
            islands.pop();

            var comp, comps;
            if (island.sleeping) {
                comps = island.components;
                limit2 = comps.length;
                var j;
                for (j = 0; j < limit2; j += 1) {
                    comp = comps[j];
                    comp.sleeping = true;

                    if (comp._isBody) {
                        var shapes = comp.shapes;
                        var limit3 = shapes.length;
                        var k;
                        for (k = 0; k < limit3; k += 1) {
                            var shape = shapes[k];
                            bphase.update(shape._bphaseHandle, shape._data, true);
                        }
                        var data = comp._data;
                        data[(7)] = 0;
                        data[(7) + 1] = 0;
                        data[(7) + 2] = 0;
                    }

                    if (comp._onSleep.length > 0) {
                        this._pushCallbacks(comp, comp._onSleep);
                    }
                }
            } else {
                comps = island.components;
                limit2 = comps.length;
                while (limit2 > 0) {
                    limit2 -= 1;
                    comp = comps.pop();

                    comp._wakeTime = island.wakeTime;
                    if (comp._isBody) {
                        bodies.push(comp);
                    } else {
                        constraints.push(comp);
                    }

                    // Reset island properties
                    comp._island = null;
                    comp._islandRoot = comp;
                    comp._islandRank = 0;
                }

                Physics2DIsland.deallocate(island);
            }
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._sortArbiters = function () {
        this._subSortArbiters(this.dynamicArbiters);
        this._subSortArbiters(this.staticArbiters);
    };

    Physics2DWorld.prototype._subSortArbiters = function (arbiters) {
        // Insertion sort of arbiters list using shape id's as
        // lexicographical keys.
        //
        // Insertion sort is suitable here, as arbiter list will be
        // SUBSTANTIALLY sorted already.
        //
        // We perform this sort so that broadphase has no effect
        // on physics behaviour.
        var i;
        var limit = arbiters.length - 1;
        for (i = 1; i < limit; i += 1) {
            var item = arbiters[i];
            var idA = item.shapeA.id;
            var idB = item.shapeB.id;

            var hole = i;
            while (hole > 0) {
                var cur = arbiters[hole - 1];
                var curIDA = cur.shapeA.id;
                if (curIDA < idA || (curIDA === idA && cur.shapeB.id < idB)) {
                    break;
                }

                arbiters[hole] = cur;
                hole -= 1;
            }

            arbiters[hole] = item;
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._onWakeCallbacks = function (component) {
        if (this._midStep) {
            if (component._onWake.length > 0) {
                this._pushCallbacks(component, component._onWake);
            }
        } else {
            component._woken = true;
        }
    };

    Physics2DWorld.prototype._pushCallbacks = function (thisObject, callbacks) {
        var cbs = this._callbacks;
        var limit = callbacks.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var cb = Physics2DCallback.allocate();
            cb.thisObject = thisObject;
            cb.callback = callbacks[i];
            cb.time = this._eventTime;
            cb.index = i;
            cbs.push(cb);
        }
    };

    Physics2DWorld.prototype._pushInteractionEvents = function (eventType, arb) {
        var cbs = this._callbacks;

        var shapeA = arb.shapeA;
        var shapeB = arb.shapeB;

        var groupA = shapeA._group;
        var groupB = shapeB._group;

        // Event listeners on shapeA
        var events = shapeA._events;
        var limit = events.length;
        var i, eventObject, cb;
        for (i = 0; i < limit; i += 1) {
            eventObject = events[i];

            if (eventObject.type === eventType && (eventObject.mask === undefined || ((eventObject.mask & groupB) !== 0))) {
                cb = Physics2DCallback.allocate();
                cb.thisObject = shapeA;
                cb.callback = eventObject.callback;
                cb.time = this._eventTime;
                cb.index = i;
                cb.arbiter = arb;
                cbs.push(cb);
            }
        }

        // Event listeners on shapeB
        events = shapeB._events;
        limit = events.length;
        for (i = 0; i < limit; i += 1) {
            eventObject = events[i];

            if (eventObject.type === eventType && (eventObject.mask === undefined || ((eventObject.mask & groupA) !== 0))) {
                cb = Physics2DCallback.allocate();
                cb.thisObject = shapeA;
                cb.callback = eventObject.callback;
                cb.time = this._eventTime;
                cb.index = i;
                cb.arbiter = arb;
                cbs.push(cb);
            }
        }
    };

    // =====================================================================
    // precon: constraint was removed from live list.
    Physics2DWorld.prototype._brokenConstraint = function (con) {
        if (con._onBreak.length > 0) {
            this._pushCallbacks(con, con._onBreak);
        }

        if (con._removeOnBreak) {
            con.world = null;

            var constraints = this.constraints;
            var index = constraints.indexOf(con);
            constraints[index] = constraints[constraints.length - 1];
            constraints.pop();

            con._outWorld();
        } else {
            con._active = false;
        }

        con._clearCache();
    };

    Physics2DWorld.prototype._preStep = function (deltaTime) {
        var constraints = this.liveConstraints;
        var limit = constraints.length;
        var i;
        for (i = 0; i < limit;) {
            var con = constraints[i];
            if (con._preStep(deltaTime)) {
                limit -= 1;
                constraints[i] = constraints[limit];
                constraints.pop();
                this._brokenConstraint(con);
                continue;
            }

            i += 1;
        }

        this._preStepArbiters(this.dynamicArbiters, deltaTime);
        this._preStepArbiters(this.staticArbiters, deltaTime);
    };

    // Used in continuous collisions, only want to pre-step a single arbiter.
    Physics2DWorld.prototype._preStepArbiter = function (arb, deltaTime, progressEvents) {
        var timeStamp = this.timeStamp;

        // Should never be the case that arbiter needs to be put to sleep
        // Or needs to be retired, or to issue an end.
        arb.active = (arb._updateStamp === timeStamp);

        if (arb._createContinuous && arb._createStamp === timeStamp) {
            this._pushInteractionEvents((1), arb);
        } else if (progressEvents && arb.active) {
            this._pushInteractionEvents((2), arb);
        }

        if (arb.active) {
            if ((arb._state & (1)) !== 0) {
                if (!arb._preStep(deltaTime, timeStamp, true)) {
                    arb.active = false;
                }
            } else if (!arb.sensor && !arb._cleanContacts(timeStamp)) {
                arb.active = false;
            }
        }
    };

    // Used in usual case, pre stepping whole list of arbiters.
    Physics2DWorld.prototype._preStepArbiters = function (arbiters, deltaTime) {
        var timeStamp = this.timeStamp;
        var limit = arbiters.length;
        var i;
        for (i = 0; i < limit;) {
            var arb = arbiters[i];
            if (!arb._retired && (arb.bodyA.sleeping && arb.bodyB.sleeping)) {
                arb._sleepStamp = timeStamp;
                arb.sleeping = true;
                arb.active = false;

                // Issue progress callback for first update that arbiter sleeps!
                this._pushInteractionEvents((2), arb);

                limit -= 1;
                arbiters[i] = arbiters[limit];
                arbiters.pop();
                continue;
            }

            if (!arb._lazyRetired) {
                if (arb._retired || arb._updateStamp + (arb.sensor ? 1 : Physics2DConfig.DELAYED_DEATH) < timeStamp) {
                    arb._retire();
                    limit -= 1;
                    arbiters[i] = arbiters[limit];
                    arbiters.pop();
                    Physics2DArbiter.deallocate(arb);
                    continue;
                }
            } else {
                arb._lazyRetired = false;
                i += 1;
                continue;
            }

            arb.active = (arb._updateStamp === timeStamp);

            if (arb._createStamp === timeStamp) {
                this._pushInteractionEvents((1), arb);
            } else if (arb.active) {
                this._pushInteractionEvents((2), arb);
            } else if (arb._updateStamp === (timeStamp - 1)) {
                this._pushInteractionEvents((3), arb);
                arb._endGenerated = this.timeStamp;
            }

            if (arb.active) {
                if ((arb._state & (1)) !== 0) {
                    if (!arb._preStep(deltaTime, timeStamp)) {
                        arb.active = false;
                    }
                } else if (!arb.sensor && !arb._cleanContacts(timeStamp)) {
                    arb.active = false;
                }
            }

            i += 1;
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._iterateVelocity = function (count) {
        var constraints = this.liveConstraints;
        while (count > 0) {
            var limit = constraints.length;
            var i;
            for (i = 0; i < limit;) {
                var con = constraints[i];
                if (con._iterateVel()) {
                    limit -= 1;
                    constraints[i] = constraints[limit];
                    constraints.pop();
                    this._brokenConstraint(con);
                    continue;
                }

                i += 1;
            }

            this._iterateVelocityArbiters(this.dynamicArbiters);
            this._iterateVelocityArbiters(this.staticArbiters);
            count -= 1;
        }
    };

    Physics2DWorld.prototype._iterateVelocityArbiters = function (arbiters) {
        var limit = arbiters.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var arb = arbiters[i];

            if (arb.active && !arb.sensor && (arb._state & (1)) !== 0) {
                arb._iterateVelocity();
            }
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._iteratePosition = function (count) {
        var constraints = this.liveConstraints;
        while (count > 0) {
            var limit = constraints.length;
            var i;
            for (i = 0; i < limit;) {
                var con = constraints[i];
                if (con._stiff && con._iteratePos()) {
                    limit -= 1;
                    constraints[i] = constraints[limit];
                    constraints.pop();
                    this._brokenConstraint(con);
                    continue;
                }

                i += 1;
            }

            this._iteratePositionArbiters(this.dynamicArbiters);
            this._iteratePositionArbiters(this.staticArbiters);
            count -= 1;
        }
    };

    Physics2DWorld.prototype._iteratePositionArbiters = function (arbiters) {
        var limit = arbiters.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var arb = arbiters[i];

            if (arb.active && !arb.sensor && (arb._state & (1)) !== 0) {
                arb._iteratePosition();
            }
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._integrateVelocity = function (deltaTime) {
        var gravityX = this._gravityX;
        var gravityY = this._gravityY;

        var bodies = this.liveDynamics;
        var limit = bodies.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var body = bodies[i];
            var data = body._data;

            var imass = data[(0)];
            var drag;
            if (imass !== 0) {
                data[(7)] += ((data[(10)] * imass) + gravityX) * deltaTime;
                data[(7) + 1] += ((data[(10) + 1] * imass) + gravityY) * deltaTime;

                drag = Math.exp(deltaTime * data[(21)]);
                data[(7)] *= drag;
                data[(7) + 1] *= drag;
            }

            var iinertia = data[(1)];
            if (iinertia !== 0) {
                data[(7) + 2] += (data[(10) + 2] * iinertia) * deltaTime;
                data[(7) + 2] *= Math.exp(deltaTime * data[(22)]);
            }
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._integratePosition = function (deltaTime) {
        this._integratePositionBodies(this.liveDynamics, deltaTime);
        this._integratePositionBodies(this.liveKinematics, deltaTime);
    };

    Physics2DWorld.prototype._integratePositionBodies = function (bodies, deltaTime) {
        var MAX_VEL = (2 * Math.PI / deltaTime);
        var idt2 = (1 / (deltaTime * deltaTime));

        var linThreshold = Physics2DConfig.MIN_LINEAR_STATIC_SWEEP;
        var angThreshold = Physics2DConfig.MIN_ANGULAR_STATIC_SWEEP;
        linThreshold *= linThreshold * idt2;
        angThreshold *= angThreshold * idt2;

        var bulletLinThreshold = Physics2DConfig.MIN_LINEAR_BULLET_SWEEP;
        var bulletAngThreshold = Physics2DConfig.MIN_ANGULAR_BULLET_SWEEP;
        bulletLinThreshold *= bulletLinThreshold * idt2;
        bulletAngThreshold *= bulletAngThreshold * idt2;

        var bphase = this.broadphase;

        var limit = bodies.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var body = bodies[i];
            var data = body._data;
            var preX = data[(15)] = data[(2)];
            var preY = data[(15) + 1] = data[(2) + 1];
            data[(15) + 2] = data[(2) + 2];

            var curX = data[(2)] += (data[(7)] * deltaTime);
            var curY = data[(2) + 1] += (data[(7) + 1] * deltaTime);
            var angVel = data[(7) + 2];
            body._deltaRotation(angVel * deltaTime);

            data[(18)] = deltaTime;

            // If moving very slowly, treat as static freezing object at t = deltaTime
            var vx = data[(7)];
            var vy = data[(7) + 1];
            var vw = data[(20)] = (angVel % MAX_VEL);

            var rad = data[(19)];
            var lin = (linThreshold * rad * rad);
            var vmag = ((vx * vx) + (vy * vy));
            if (vmag > lin || (vw * vw) > angThreshold) {
                // Compute swept AABB
                var minX = (preX < curX ? preX : curX);
                var minY = (preY < curY ? preY : curY);
                var maxX = (preX < curX ? curX : preX);
                var maxY = (preY < curY ? curY : preY);

                var shapes = body.shapes;
                var limit2 = shapes.length;
                var j;
                for (j = 0; j < limit2; j += 1) {
                    var shape = shapes[j];
                    var sdata = shape._data;
                    rad = sdata[(4)];
                    sdata[(0)] = (minX - rad);
                    sdata[(0) + 1] = (minY - rad);
                    sdata[(0) + 2] = (maxX + rad);
                    sdata[(0) + 3] = (maxY + rad);

                    bphase.update(shape._bphaseHandle, sdata);
                }

                body._sweepFrozen = false;

                if (body._type === (0)) {
                    body._bullet = (body.bullet && (vmag > (bulletLinThreshold * rad * rad) || (vw * vw) > bulletAngThreshold));
                }
            } else {
                body._sweepFrozen = true;
                body._bullet = false;
            }
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._finalize = function () {
        this._finalizeBodies(this.liveDynamics);
        this._finalizeBodies(this.liveKinematics);

        // Finalize contact positions for API to be correct at end of step() in queries
        this._finalizeArbiters(this.dynamicArbiters);
        this._finalizeArbiters(this.staticArbiters);
    };

    Physics2DWorld.prototype._finalizeArbiters = function (arbiters) {
        var limit = arbiters.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var arb = arbiters[i];
            if (arb.active && !arb.sensor) {
                arb._refreshContactData();
            }
        }
    };

    Physics2DWorld.prototype._finalizeBodies = function (bodies) {
        var bphase = this.broadphase;
        var limit = bodies.length;
        var i;
        for (i = 0; i < limit;) {
            var body = bodies[i];
            var data = body._data;

            var shapes = body.shapes;
            var limit2 = shapes.length;
            var j, shape;

            if (data[(15)] !== data[(2)] || data[(15) + 1] !== data[(2) + 1] || data[(15) + 2] !== data[(2) + 2]) {
                body._invalidated = true;
            } else if (body._type === (1)) {
                limit -= 1;
                bodies[i] = bodies[limit];
                bodies.pop();

                body.sleeping = true;

                for (j = 0; j < limit2; j += 1) {
                    shape = shapes[j];
                    bphase.update(shape._bphaseHandle, shape._data, true);
                }
                continue;
            }

            i += 1;
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._doCallbacks = function () {
        // Order by event index so as to guarantee that event listeners
        // added first, are processed first.
        //
        // Inlined quick sort, builtin JS.sort was too slow with function comparator.
        var callbacks = this._callbacks;
        var i;
        var stack = [callbacks.length - 1, 0];
        do {
            var left = stack.pop();
            var right = stack.pop();
            if (left > right) {
                continue;
            }

            /*jshint bitwise: false*/
            var pivot = (left + right) >> 1;

            /*jshint bitwise: true*/
            // Partition about center
            var pivotValue = callbacks[pivot];
            var index = left;
            var pIndex = pivotValue.index;
            var pTime = pivotValue.time;

            callbacks[pivot] = callbacks[right];
            callbacks[right] = pivotValue;
            for (i = left; i < right; i += 1) {
                var cur = callbacks[i];
                if (cur.time < pTime || (cur.time === pTime && cur.index < pIndex)) {
                    callbacks[i] = callbacks[index];
                    callbacks[index] = cur;
                    index += 1;
                }
            }
            callbacks[right] = callbacks[index];
            callbacks[index] = pivotValue;

            if (index + 1 < right) {
                stack.push(right);
                stack.push(index + 1);
            }

            if (left < index - 1) {
                stack.push(index - 1);
                stack.push(left);
            }
        } while(stack.length > 0);

        // Issue callbacks
        var limit = callbacks.length;
        for (i = 0; i < limit; i += 1) {
            var cb = callbacks[i];
            if (cb.arbiter) {
                // BEGIN/PROGRESS/END
                var arb = cb.arbiter;
                var sa = arb.shapeA;
                var sb = arb.shapeB;
                var thisShape = cb.thisObject;
                cb.callback.call(thisShape, arb, (thisShape === sa ? sb : sa));
            } else {
                // WAKE/SLEEP/BREAK
                cb.callback.call(cb.thisObject);
            }
            Physics2DCallback.deallocate(cb);
        }
        callbacks.length = 0;
    };

    // =====================================================================
    Physics2DWorld.prototype._warmStart = function () {
        var constraints = this.liveConstraints;
        var limit = constraints.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            constraints[i]._warmStart();
        }

        this._warmStartArbiters(this.dynamicArbiters);
        this._warmStartArbiters(this.staticArbiters);
    };

    Physics2DWorld.prototype._warmStartArbiters = function (arbiters) {
        var limit = arbiters.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var arb = arbiters[i];

            if (arb.active && !arb.sensor && (arb._state & (1)) !== 0) {
                arb._warmStart();
            }
        }
    };

    // =====================================================================
    Physics2DWorld.prototype._forceSleepBody = function (body) {
        if (body.sleeping || body._type !== (0)) {
            return;
        }

        body.sleeping = true;

        var bodies = this.liveDynamics;
        var index = bodies.indexOf(body);
        bodies[index] = bodies[bodies.length - 1];
        bodies.pop();

        var shapes = body.shapes;
        var limit = shapes.length;
        var i;
        var bphase = this.broadphase;
        for (i = 0; i < limit; i += 1) {
            var shape = shapes[i];
            bphase.update(shape._bphaseHandle, shape._data, true);

            // Force arbiters to go to sleep.
            var arbiters = shape.arbiters;
            var limit2 = arbiters.length;
            var j;
            for (j = 0; j < limit2; j += 1) {
                var arb = arbiters[j];
                if (arb._retired || arb.sleeping) {
                    continue;
                }

                arb.sleeping = true;
                arb._sleepStamp = this.timeStamp;
                var arbs;
                if (arb._static) {
                    arbs = this.staticArbiters;
                } else {
                    arbs = this.dynamicArbiters;
                }

                index = arbs.indexOf(arb);
                arbs[index] = arbs[arbs.length - 1];
                arbs.pop();
            }
        }
    };

    Physics2DWorld.prototype._forceSleepConstraint = function (constraint) {
        if (constraint.sleeping) {
            return;
        }

        constraint.sleeping = true;

        if (constraint._active) {
            var constraints = this.liveConstraints;
            var index = constraints.indexOf(constraint);
            constraints[index] = constraints[constraints.length - 1];
            constraints.pop();
        }
    };

    Physics2DWorld.prototype._wakeConstraint = function (constraint, noCallback) {
        if (constraint.world !== this) {
            return;
        }

        if (constraint._active) {
            constraint._wakeTime = (this.timeStamp + (this._midStep ? 0 : 1));
            if (constraint.sleeping) {
                if (!constraint._island) {
                    constraint.sleeping = false;
                    this.liveConstraints.push(constraint);
                    constraint._wakeConnected();

                    if (!noCallback) {
                        this._onWakeCallbacks(constraint);
                    }
                } else {
                    this._wakeIsland(constraint._island, (noCallback ? constraint : null));
                }
            }
        }
    };

    Physics2DWorld.prototype._wakeBody = function (body, noCallback, continuousCallbacks) {
        if (body.world !== this) {
            return;
        }

        body._wakeTime = (this.timeStamp + (this._midStep ? 0 : 1));
        if (body.sleeping) {
            if (!body._island) {
                var bphase = this.broadphase;

                if (body._type === (0)) {
                    body.sleeping = false;
                    this.liveDynamics.push(body);
                } else if (body._type === (1)) {
                    body.sleeping = false;
                    this.liveKinematics.push(body);
                }

                var constraints = body.constraints;
                var limit = constraints.length;
                var i;
                for (i = 0; i < limit; i += 1) {
                    this._wakeConstraint(constraints[i]);
                }

                var isStatic = (body._type === (2));

                var shapes = body.shapes;
                limit = shapes.length;
                for (i = 0; i < limit; i += 1) {
                    var shape = shapes[i];
                    this._wakeArbiters(shape.arbiters, false, continuousCallbacks);
                    if (!isStatic) {
                        bphase.update(shape._bphaseHandle, shape._data, false);
                    }
                }

                if (!noCallback && (body._type === (0))) {
                    this._onWakeCallbacks(body);
                }
            } else {
                this._wakeIsland(body._island, (noCallback ? body : null), continuousCallbacks);
            }
        }
    };

    Physics2DWorld.prototype._wakeArbiter = function (arb, continuousCallbacks) {
        arb.sleeping = false;

        var timeStamp = (this.timeStamp + (this._midStep ? 0 : 1));
        var tDelta = (timeStamp - arb._sleepStamp);
        arb._updateStamp += tDelta;
        var contacts = arb.contacts;
        var limit2 = contacts.length;
        var j;
        for (j = 0; j < limit2; j += 1) {
            contacts[j]._timeStamp += tDelta;
        }

        if (arb._static) {
            this.staticArbiters.push(arb);
        } else {
            this.dynamicArbiters.push(arb);
        }

        if (continuousCallbacks) {
            this._continuousArbiterPrepare(arb, this._deltaTime, true);
        }
    };

    Physics2DWorld.prototype._continuousArbiterPrepare = function (arb, deltaTime, progressEvents) {
        this._preStepArbiter(arb, deltaTime, progressEvents);

        if (arb.active && !arb.sensor && (arb._state & (1)) !== 0) {
            // Single velocity iteration of just this arbiter.
            // Helps objects to bounce immediately, any errors will be resolved
            // in following step anyhow.
            arb._iterateVelocity();
        }
    };

    Physics2DWorld.prototype._wakeArbiters = function (arbiters, skip, continuousCallbacks) {
        var limit = arbiters.length;
        var i;
        var timeStamp = (this.timeStamp + (this._midStep ? 0 : 1));
        for (i = 0; i < limit; i += 1) {
            var arb = arbiters[i];
            if (arb._retired) {
                continue;
            }

            if (arb.sleeping) {
                this._wakeArbiter(arb, continuousCallbacks);
            }

            if (!skip) {
                if ((arb._updateStamp === timeStamp) && !arb.sensor && (arb._state & (1)) !== 0) {
                    var b1 = arb.bodyA;
                    var b2 = arb.bodyB;
                    if (b1._type === (0) && b1.sleeping) {
                        this._wakeBody(b1, false, continuousCallbacks);
                    }
                    if (b2._type === (0) && b2.sleeping) {
                        this._wakeBody(b2, false, continuousCallbacks);
                    }
                }
            }
        }
    };

    Physics2DWorld.prototype._wakeIsland = function (island, noCallbackObject, continuousCallbacks) {
        var bphase = this.broadphase;
        var bodies = this.liveDynamics;
        var constraints = this.liveConstraints;

        var timeStamp = (this.timeStamp + (this._midStep ? 0 : 1));
        var components = island.components;
        var limit = components.length;
        while (limit > 0) {
            limit -= 1;
            var c = components.pop();
            c._wakeTime = timeStamp;

            // Reset island properties.
            c._island = null;
            c._islandRoot = c;
            c._islandRank = 0;

            c.sleeping = false;

            if (c._isBody) {
                // TODO: fix <any> casts
                // only dynamic bodies are inserted to islands.
                bodies.push(c);

                var shapes = (c).shapes;
                var limit2 = shapes.length;
                var i;
                for (i = 0; i < limit2; i += 1) {
                    var shape = shapes[i];
                    this._wakeArbiters(shape.arbiters, true, continuousCallbacks);
                    bphase.update(shape._bphaseHandle, shape._data, false);
                }
            } else {
                constraints.push(c);
            }

            if (noCallbackObject !== c) {
                this._onWakeCallbacks(c);
            }
        }

        Physics2DIsland.deallocate(island);
    };

    // =====================================================================
    Physics2DWorld.prototype._transmitBodyType = function (body, newType) {
        // Wake as old type.
        // Interactions that are presently active may
        // become ignored.
        this._wakeBody(body);

        // Just woke the body, so it's not sleeping
        var bodies;
        if (body._type === (0)) {
            bodies = this.liveDynamics;
        } else if (body._type === (1)) {
            bodies = this.liveKinematics;
        }

        var index;
        if (bodies) {
            index = bodies.indexOf(body);
            bodies[index] = bodies[bodies.length - 1];
            bodies.pop();
        }

        body._type = newType;

        var staticBody = (newType === (2));
        if (staticBody) {
            // Ensure body is updated as run time validation
            // Does not occur for static types.
            body._update();
        }

        if (newType === (0)) {
            // Set up ready for island computations
            body._islandRoot = body;
            body._islandRank = 0;
        }

        var bphase = this.broadphase;

        // Destroy redundant arbiters, and mutate arbiter static type.
        var shapes = body.shapes;
        var limit = shapes.length;
        var i;
        for (i = 0; i < limit; i += 1) {
            var shape = shapes[i];
            if (staticBody) {
                // Static bodies aren't synced by wakeBody
                bphase.update(shape._bphaseHandle, shape._data, true);
            }

            var arbiters = shape.arbiters;
            var limit2 = arbiters.length;
            var j;
            for (j = 0; j < limit2;) {
                var arb = arbiters[j];
                if (arb._retired) {
                    continue;
                }

                var bothStaticType = (arb.bodyA._type !== (0) && arb.bodyB._type !== (0));
                var atleastOneKinematic = (arb.bodyA._type === (1) || arb.bodyB._type === (1));
                if (bothStaticType && !(atleastOneKinematic && arb.sensor)) {
                    limit2 -= 1;
                    arbiters[j] = arbiters[limit2];
                    arbiters.pop();
                    arb._lazyRetire(shape);
                    this._pushInteractionEvents((3), arb);
                    continue;
                }

                var staticType = (arb.bodyA._type !== (0) || arb.bodyB._type !== (0));
                if (staticType !== arb._static) {
                    var arbs = (arb._static ? this.staticArbiters : this.dynamicArbiters);
                    index = arbs.indexOf(arb);
                    arbs[index] = arbs[arbs.length - 1];
                    arbs.pop();

                    arb._static = staticType;
                    arbs = (staticType ? this.staticArbiters : this.dynamicArbiters);
                    arbs.push(arb);
                }

                j += 1;
            }
        }

        // Force wake as new type.
        // Interactions that may have been previously ignored
        // may now become active.
        body.sleeping = true;
        this._wakeBody(body);
    };

    // =====================================================================
    Physics2DWorld.prototype._validate = function () {
        this._validateBodies(this.liveDynamics);
        this._validateBodies(this.liveKinematics);

        // Issue deferred wake callbacks to stack.
        var constraints = this.liveConstraints;
        var i;
        var limit = constraints.length;
        for (i = 0; i < limit; i += 1) {
            var con = constraints[i];
            if (con._woken && con._onWake.length > 0) {
                this._pushCallbacks(con, con._onWake);
            }
            con._woken = false;
        }
    };

    Physics2DWorld.prototype._validateBodies = function (bodies) {
        var bphase = this.broadphase;
        var i;
        var limit = bodies.length;
        for (i = 0; i < limit; i += 1) {
            var body = bodies[i];

            // Prevent errors accumulating.
            var data = body._data;
            var rot = data[(2) + 2];
            data[(5)] = Math.cos(rot);
            data[(5) + 1] = Math.sin(rot);

            // Update shape world-data.
            body._update();

            if (body._type === (0) && body._woken && body._onWake.length > 0) {
                this._pushCallbacks(body, body._onWake);
            }
            body._woken = false;

            var shapes = body.shapes;
            var limit2 = shapes.length;
            var j;
            for (j = 0; j < limit2; j += 1) {
                var shape = shapes[j];
                bphase.update(shape._bphaseHandle, shape._data);
            }
        }
    };

    Physics2DWorld.create = function (params) {
        var w = new Physics2DWorld();
        w.simulatedTime = 0;

        // ALL such objects.
        w.rigidBodies = [];
        w.constraints = [];

        // Non-sleeping such objects.
        w.liveDynamics = [];
        w.liveKinematics = [];
        w.liveConstraints = [];

        // Non-sleeping only.
        w.dynamicArbiters = [];
        w.staticArbiters = [];

        w._islands = [];
        w._toiEvents = [];
        w._deferredWake = [];

        w._eventTime = (-1);
        w._callbacks = [];

        w.broadphase = (params.broadphase || Physics2DBoxTreeBroadphase.create());

        w.velocityIterations = (params.velocityIterations || 8);
        w.positionIterations = (params.positionIterations || 8);

        w._midStep = false;
        w.timeStamp = 0;

        var gravity = params.gravity;
        w._gravityX = (gravity ? gravity[0] : 0);
        w._gravityY = (gravity ? gravity[1] : 10);

        w._collisions = Physics2DCollisionUtils.create();

        // =====================================================================
        w._sampleRectangle = new Physics2DDevice.prototype.floatArray(4);

        var shapeSampler = function shapeSamplerFn(lambda) {
            return {
                store: null,
                count: 0,
                collisions: w._collisions,
                sample: function (handle, bounds) {
                    var shape = handle.data;
                    if (lambda.call(this, shape, bounds)) {
                        this.store[this.count] = shape;
                        this.count += 1;
                    }
                }
            };
        };

        var bodySampler = function bodySamplerFn(lambda) {
            return {
                store: null,
                count: 0,
                collisions: w._collisions,
                sample: function (handle, bounds) {
                    var shape = handle.data;
                    if (lambda.call(this, shape, bounds)) {
                        var found = false;
                        var body = shape.body;
                        var i;
                        var limit = this.count;
                        var bodies = this.store;
                        for (i = 0; i < limit; i += 1) {
                            if (bodies[i] === body) {
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            bodies[limit] = body;
                            this.count += 1;
                        }
                    }
                }
            };
        };

        var pointSampler = function pointSamplerFn(shape, point) {
            return this.collisions._contains(shape, point[0], point[1]);
        };
        w._shapePointCallback = shapeSampler(pointSampler);
        w._bodyPointCallback = bodySampler(pointSampler);

        var rectangleSampler = function rectangleSamplerFn(shape, unusedSampleBox) {
            return (this).collisions._test(shape, this.rectangleShape);
        };
        w._shapeRectangleCallback = shapeSampler(rectangleSampler);
        w._bodyRectangleCallback = bodySampler(rectangleSampler);

        w._rectangleQueryVertices = [
            new Physics2DDevice.prototype.floatArray(2),
            new Physics2DDevice.prototype.floatArray(2),
            new Physics2DDevice.prototype.floatArray(2),
            new Physics2DDevice.prototype.floatArray(2)
        ];
        w._rectangleQueryShape = Physics2DPolygon.create({ vertices: w._rectangleQueryVertices });
        w._shapeRectangleCallback.rectangleShape = w._rectangleQueryShape;
        w._bodyRectangleCallback.rectangleShape = w._rectangleQueryShape;

        var circleSampler = function circleSamplerFn(shape, unusedSampleBox) {
            return (this).collisions._test(shape, this.circleShape);
        };
        w._shapeCircleCallback = shapeSampler(circleSampler);
        w._bodyCircleCallback = bodySampler(circleSampler);

        w._circleQueryShape = Physics2DCircle.create({ radius: 1 });
        w._shapeCircleCallback.circleShape = w._circleQueryShape;
        w._bodyCircleCallback.circleShape = w._circleQueryShape;

        var tempCastResult = {
            shape: null,
            hitPoint: new Physics2DDevice.prototype.floatArray(2),
            hitNormal: new Physics2DDevice.prototype.floatArray(2),
            factor: 0
        };

        w._rayCast = {
            minNormal: new Physics2DDevice.prototype.floatArray(2),
            minShape: null,
            minFactor: 0,
            userCallback: null,
            userThis: null,
            ray: null,
            noInner: false,
            normal: new Physics2DDevice.prototype.floatArray(2),
            sample: function sampleFn(handle, _) {
                var shape = handle.data;

                var ray = (this).ray;
                var normal = (this).normal;

                var oldFactor = ray.maxFactor;
                ray.maxFactor = (this).minFactor;
                var factor = w._collisions.rayTest(shape, ray, normal, (this).noInner);
                ray.maxFactor = oldFactor;

                if ((this).userCallback) {
                    var result = tempCastResult;
                    var vector = result.hitNormal;
                    vector[0] = normal[0];
                    vector[1] = normal[1];

                    vector = result.hitPoint;
                    var origin = ray.origin;
                    var direction = ray.direction;
                    vector[0] = (origin[0] + (direction[0] * factor));
                    vector[1] = (origin[1] + (direction[1] * factor));
                    result.factor = factor;
                    result.shape = shape;

                    if (!(this).userCallback.call((this).userThis, ray, result)) {
                        return;
                    }
                }

                if (factor !== undefined) {
                    (this).minFactor = factor;
                    (this).minShape = shape;

                    var minNormal = (this).minNormal;
                    minNormal[0] = normal[0];
                    minNormal[1] = normal[1];
                }
            }
        };

        w._convexCast = {
            toi: w._collisions._toi,
            minData: new Physics2DDevice.prototype.floatArray(4),
            minShape: null,
            minTOIAlpha: 0,
            userCallback: null,
            userThis: null,
            deltaTime: 0,
            sample: function sampleFn(handle, _) {
                var toi = (this).toi;
                var shape = handle.data;

                if (shape === toi.shapeA) {
                    return;
                }

                toi.shapeB = shape;
                shape.body._update();

                var ret = w._collisions._staticSweep(toi, ((this).minTOIAlpha * (this).deltaTime), 0) * (this).minTOIAlpha;

                if (ret <= 0) {
                    return;
                }

                var tdata = toi._data;
                if ((this).userCallback) {
                    var result = tempCastResult;
                    var vector = result.hitNormal;
                    vector[0] = (-tdata[(0)]);
                    vector[1] = (-tdata[(0) + 1]);
                    vector = result.hitPoint;
                    vector[0] = tdata[(4)];
                    vector[1] = tdata[(4) + 1];
                    result.factor = (ret * (this).deltaTime);
                    result.shape = shape;
                    result.shape = shape;

                    if (!(this).userCallback.call((this).userThis, toi.shapeA, result)) {
                        return;
                    }
                }

                (this).minTOIAlpha = ret;
                var data = (this).minData;
                data[0] = tdata[(0)];
                data[1] = tdata[(0) + 1];
                data[2] = tdata[(4)];
                data[3] = tdata[(4) + 1];
                (this).minShape = shape;
            }
        };

        return w;
    };
    Physics2DWorld.version = 1;
    return Physics2DWorld;
})();

// =========================================================================
//
// Physics2D internal collision detection routines.
//
var Physics2DCollisionUtils = (function () {
    function Physics2DCollisionUtils() {
    }
    Physics2DCollisionUtils.prototype.containsPoint = function (shape, point/*v2*/ ) {
        shape.body._update();
        return this._contains(shape, point[0], point[1]);
    };

    Physics2DCollisionUtils.prototype.signedDistance = function (shapeA, shapeB, witnessA/*v2*/ , witnessB/*v2*/ , axis/*v2*/ ) {
        shapeA.body._update();
        if (shapeB.body !== shapeA.body) {
            shapeB.body._update();
        }

        var data = this._toi._data;
        var ret = this._distance(shapeA, shapeB, data);
        witnessA[0] = data[(2)];
        witnessA[1] = data[(2) + 1];
        witnessB[0] = data[(4)];
        witnessB[1] = data[(4) + 1];
        axis[0] = data[(0)];
        axis[1] = data[(0) + 1];

        return ret;
    };

    Physics2DCollisionUtils.prototype.intersects = function (shapeA, shapeB) {
        shapeA.body._update();
        if (shapeB.body !== shapeA.body) {
            shapeB.body._update();
        }

        return this._test(shapeA, shapeB);
    };

    Physics2DCollisionUtils.prototype.rayTest = function (shape, ray, normal/*v2*/ , ignoreInnerSurfaces) {
        shape.body._update();
        return this._rayTest(shape, ray, normal, ignoreInnerSurfaces);
    };

    Physics2DCollisionUtils.prototype.sweepTest = function (shapeA, shapeB, deltaTime, point/*v2*/ , normal/*v2*/ ) {
        var toi = this._toi;
        toi.shapeA = shapeA;
        toi.shapeB = shapeB;

        var bodyA = shapeA.body;
        var bodyB = shapeB.body;
        var dataA = bodyA._data;
        var dataB = bodyB._data;
        dataA[(18)] = 0;
        dataB[(18)] = 0;
        dataA[(20)] = (dataA[(7) + 2]);
        dataB[(20)] = (dataB[(7) + 2]);
        var ret = this._dynamicSweep(toi, deltaTime, 0, true);
        bodyA._sweepIntegrate(0);
        bodyB._sweepIntegrate(0);
        shapeA._update(dataA[(2)], dataA[(2) + 1], dataA[(5)], dataA[(5) + 1]);
        shapeB._update(dataB[(2)], dataB[(2) + 1], dataB[(5)], dataB[(5) + 1]);

        if (ret < 0) {
            return undefined;
        }

        var data = toi._data;
        point[0] = (0.5 * (data[(2)] + data[(4)]));
        point[1] = (0.5 * (data[(2) + 1] + data[(4) + 1]));
        normal[0] = data[(0)];
        normal[1] = data[(0) + 1];
        return (ret * deltaTime);
    };

    //=======================================================================================
    //=======================================================================================
    // Private.
    // Test if (parametric) ray intersects
    // Shape between 0 and ray.maxFactor
    // Assume shape has been updated by a Body.
    // (need not be 'in' a body).
    Physics2DCollisionUtils.prototype._rayTest = function (shape, ray, normal, noInner) {
        if (shape._type === (0)) {
            return this._rayTestCircle(shape, ray, normal, noInner);
        } else {
            return this._rayTestPolygon(shape, ray, normal, noInner);
        }
    };

    Physics2DCollisionUtils.prototype._rayTestPolygon = function (poly, ray, normal, noInner) {
        var origin = ray.origin;
        var direction = ray.direction;
        var data = poly._data;

        var ox = origin[0];
        var oy = origin[1];
        var dx = direction[0];
        var dy = direction[1];

        var min = ray.maxFactor;
        var edge, inner;

        var index = (6);
        var limit = data.length;
        for (; index < limit; index += (13)) {
            var nx = data[index + (6)];
            var ny = data[index + (6) + 1];
            var den = (nx * dx) + (ny * dy);
            if ((den >= 0 && noInner) || (den * den) < Physics2DConfig.COLLINEAR_SQ_EPSILON) {
                continue;
            }

            var t = (data[index + (9)] - ((ox * nx) + (oy * ny))) / den;
            if (t < 0 || t >= min) {
                continue;
            }

            var hitX = ox + (dx * t);
            var hitY = oy + (dy * t);
            var dproj = (nx * hitY) - (ny * hitX);
            if (dproj < data[index + (10)] || dproj > data[index + (11)]) {
                continue;
            }

            min = t;
            edge = index;
            inner = (den >= 0);
        }

        if (edge === undefined) {
            return undefined;
        } else {
            var scale = (inner ? -1 : 1);
            normal[0] = (data[edge + (6)] * scale);
            normal[1] = (data[edge + (6) + 1] * scale);
            return min;
        }
    };

    Physics2DCollisionUtils.prototype._rayTestCircle = function (circle, ray, normal, noInner) {
        var origin = ray.origin;
        var direction = ray.direction;
        var data = circle._data;

        var ox = origin[0];
        var oy = origin[1];
        var dx = direction[0];
        var dy = direction[1];
        var cx = data[(9)];
        var cy = data[(9) + 1];
        var radius = data[(6)];

        var ocX = (ox - cx);
        var ocY = (oy - cy);

        // Quadratic equation at^2 + bt + c = 0
        var a = ((dx * dx) + (dy * dy));
        var b = 2 * ((ocX * dx) + (ocY * dy));
        var c = (ocX * ocX) + (ocY * ocY) - (radius * radius);

        var determinant = ((b * b) - (4 * a * c));
        if (determinant < 0) {
            return undefined;
        }

        var normalScale = 1.0;
        var rec = (1 / (2 * a));
        var rootD = Math.sqrt(determinant);
        var distance = ((-b - rootD) * rec);
        if (distance < 0) {
            if (noInner) {
                return undefined;
            }
            distance += (rootD * 2 * rec);
            normalScale = -1.0;
        }

        if (0 <= distance && distance < ray.maxFactor) {
            var hitX = (ox + (dx * distance) - cx);
            var hitY = (oy + (dy * distance) - cy);
            var scale = (normalScale / radius);
            normal[0] = (hitX * scale);
            normal[1] = (hitY * scale);
            return distance;
        } else {
            return undefined;
        }
    };

    // =====================================================================
    // Test point containment in shape.
    // no AABB check is performed.
    // Assume shape has been updated by a Body.
    // (need not be 'in' a body).
    Physics2DCollisionUtils.prototype._contains = function (shape, x, y) {
        if (shape._type === (0)) {
            return this._containsCircle(shape, x, y);
        } else {
            return this._containsPolygon(shape, x, y);
        }
    };

    Physics2DCollisionUtils.prototype._containsCircle = function (circle, x, y) {
        var data = circle._data;
        var dx = (data[(9)] - x);
        var dy = (data[(9) + 1] - y);
        var rad = data[(6)];
        return ((dx * dx) + (dy * dy) - (rad * rad)) <= Physics2DConfig.CONTAINS_SQ_EPSILON;
    };

    Physics2DCollisionUtils.prototype._containsPolygon = function (poly, x, y) {
        var data = poly._data;
        var index = (6);
        var limit = data.length;
        var EPS = Physics2DConfig.CONTAINS_EPSILON;
        for (; index < limit; index += (13)) {
            var proj = ((data[index + (6)] * x) + (data[index + (6) + 1] * y)) - data[index + (9)];
            if (proj > EPS) {
                return false;
            }
        }
        return true;
    };

    // =====================================================================
    // slowSweep is true when method is invoked from public API.
    // Or in convexSweep to be more accurate and fail less easily.
    // This is also to disable slipping TOI's and terminate as soon
    // as objects intersect.
    Physics2DCollisionUtils.prototype._dynamicSweep = function (toi, timeStep, negRadius, slowSweep) {
        var s1 = toi.shapeA;
        var s2 = toi.shapeB;
        var b1 = s1.body;
        var b2 = s2.body;
        var data1 = b1._data;
        var data2 = b2._data;

        // relative linear velocity and angular bias for distance calculation.
        var deltaX = (data2[(7)] - data1[(7)]);
        var deltaY = (data2[(7) + 1] - data1[(7) + 1]);
        var ang1 = data1[(20)];
        var ang2 = data2[(20)];
        var angBias = ((s1._data[(5)] * (ang1 < 0 ? -ang1 : ang1)) + (s2._data[(5)] * (ang2 < 0 ? -ang2 : ang2)));

        if (!slowSweep) {
            if (((deltaX * deltaX) + (deltaY * deltaY)) < Physics2DConfig.EQUAL_SQ_VEL && angBias < Physics2DConfig.ZERO_ANG_BIAS) {
                toi._data[(6)] = undefined;
                toi.failed = true;
                return;
            }
        }

        var curTOIAlpha = 0;
        var curIter = 0;
        var toiData = toi._data;

        var LIMIT = Physics2DConfig.SWEEP_LIMIT;
        var HALF_LIMIT = (LIMIT * 0.5);
        var MIN_ADVANCE = Physics2DConfig.MINIMUM_SWEEP_ADVANCE;
        var MAX_ITER = Physics2DConfig.MAX_SWEEP_ITER;

        while (true) {
            b1._sweepIntegrate(curTOIAlpha * timeStep);
            b2._sweepIntegrate(curTOIAlpha * timeStep);
            var posX = data1[(2)];
            var posY = data1[(2) + 1];
            s1._update(posX, posY, data1[(5)], data1[(5) + 1], true);
            posX = data2[(2)];
            posY = data2[(2) + 1];
            s2._update(posX, posY, data2[(5)], data2[(5) + 1], true);

            var sep = this._distance(s1, s2, toiData) + negRadius;
            var axisX = toiData[(0)];
            var axisY = toiData[(0) + 1];
            var dot = ((axisX * deltaX) + (axisY * deltaY));

            if (sep < LIMIT) {
                if (slowSweep) {
                    break;
                } else {
                    var d1X = (toiData[(2)] - posX);
                    var d1Y = (toiData[(2) + 1] - posY);
                    var proj = (dot - (ang1 * ((d1X * axisY) - (d1Y * axisX))));

                    if (proj > 0) {
                        toi.slipped = true;
                    }
                    if (proj <= 0 || sep < HALF_LIMIT) {
                        break;
                    }
                }
            }

            // Lower bound on TOI advancement
            var denom = (angBias - dot) * timeStep;
            if (denom <= 0) {
                // fail.
                curTOIAlpha = -1;
                break;
            }

            var delta = (sep / denom);

            if (delta < MIN_ADVANCE) {
                delta = MIN_ADVANCE;
            }

            curTOIAlpha += delta;
            if (curTOIAlpha >= 1) {
                // fail
                curTOIAlpha = -1;
                break;
            }

            curIter += 1;
            if (curIter >= MAX_ITER) {
                if (sep > negRadius) {
                    toi.failed = true;
                } else if (slowSweep) {
                    // fail
                    curTOIAlpha = -1;
                }
                break;
            }
        }

        toiData[(6)] = curTOIAlpha;
        return curTOIAlpha;
    };

    Physics2DCollisionUtils.prototype._staticSweep = function (toi, timeStep, negRadius) {
        var s1 = toi.shapeA;
        var s2 = toi.shapeB;
        var b1 = s1.body;
        var data1 = b1._data;

        // relative linear velocity and angular bias for distance calculation.
        var deltaX = -data1[(7)];
        var deltaY = -data1[(7) + 1];
        var ang1 = data1[(20)];
        var angBias = (s1._data[(5)] * (ang1 < 0 ? -ang1 : ang1));

        var curTOIAlpha = 0;
        var curIter = 0;
        var toiData = toi._data;

        var LIMIT = Physics2DConfig.SWEEP_LIMIT;
        var HALF_LIMIT = (LIMIT * 0.5);
        var MIN_ADVANCE = Physics2DConfig.MINIMUM_SWEEP_ADVANCE;
        var MAX_ITER = Physics2DConfig.MAX_SWEEP_ITER;

        while (true) {
            b1._sweepIntegrate(curTOIAlpha * timeStep);
            var posX = data1[(2)];
            var posY = data1[(2) + 1];
            s1._update(posX, posY, data1[(5)], data1[(5) + 1], true);

            var sep = this._distance(s1, s2, toiData) + negRadius;
            var axisX = toiData[(0)];
            var axisY = toiData[(0) + 1];
            var dot = ((axisX * deltaX) + (axisY * deltaY));

            if (sep < LIMIT) {
                var d1X = (toiData[(2)] - posX);
                var d1Y = (toiData[(2) + 1] - posY);
                var proj = (dot - (ang1 * ((d1X * axisY) - (d1Y * axisX))));

                if (proj > 0) {
                    toi.slipped = true;
                }
                if (proj <= 0 || sep < HALF_LIMIT) {
                    break;
                }
            }

            // Lower bound on TOI advancement
            var denom = (angBias - dot) * timeStep;
            if (denom <= 0) {
                // fail.
                curTOIAlpha = -1;
                break;
            }

            var delta = (sep / denom);

            if (delta < MIN_ADVANCE) {
                delta = MIN_ADVANCE;
            }

            curTOIAlpha += delta;
            if (curTOIAlpha >= 1) {
                // fail
                curTOIAlpha = -1;
                break;
            }

            curIter += 1;
            if (curIter >= MAX_ITER) {
                if (sep > negRadius) {
                    toi.failed = true;
                }
                break;
            }
        }

        toiData[(6)] = curTOIAlpha;
        return curTOIAlpha;
    };

    // =====================================================================
    // Assumption, shapes have been updated by body.
    // need not be IN a body.
    Physics2DCollisionUtils.prototype._distance = function (shapeA, shapeB, toiData) {
        if (shapeA._type === (0)) {
            if (shapeB._type === (0)) {
                return this._distanceCircle2Circle(shapeA, shapeB, toiData);
            } else {
                return this._distanceCircle2Polygon(shapeA, shapeB, toiData);
            }
        } else {
            if (shapeB._type === (0)) {
                var ret = this._distanceCircle2Polygon(shapeB, shapeA, toiData);

                // Reverse axis.
                toiData[(0)] = -toiData[(0)];
                toiData[(0) + 1] = -toiData[(0) + 1];

                // Swap witness points.
                var tmp = toiData[(2)];
                toiData[(2)] = toiData[(4)];
                toiData[(4)] = tmp;

                tmp = toiData[(2) + 1];
                toiData[(2) + 1] = toiData[(4) + 1];
                toiData[(4) + 1] = tmp;
                return ret;
            } else {
                return this._distancePolygon2Polygon(shapeA, shapeB, toiData);
            }
        }
    };

    Physics2DCollisionUtils.prototype._distanceCircle2Circle = function (circleA, circleB, toiData) {
        var dataA = circleA._data;
        var dataB = circleB._data;

        var cAX = dataA[(9)];
        var cAY = dataA[(9) + 1];
        var cBX = dataB[(9)];
        var cBY = dataB[(9) + 1];
        var radA = dataA[(6)];
        var radB = dataB[(6)];

        var dx = (cBX - cAX);
        var dy = (cBY - cAY);
        var rSum = (radA + radB);

        var len = Math.sqrt((dx * dx) + (dy * dy));
        if (len === 0) {
            toiData[(0)] = dx = 1;
            toiData[(0) + 1] = dy = 0;
        } else {
            var rec = (1 / len);
            toiData[(0)] = (dx *= rec);
            toiData[(0) + 1] = (dy *= rec);
        }
        toiData[(2)] = cAX + (dx * radA);
        toiData[(2) + 1] = cAY + (dy * radA);
        toiData[(4)] = cBX - (dx * radB);
        toiData[(4) + 1] = cBY - (dy * radB);

        return (len - rSum);
    };

    Physics2DCollisionUtils.prototype._distanceCircle2Polygon = function (circle, polygon, toiData) {
        var dataC = circle._data;
        var dataP = polygon._data;

        var cx = dataC[(9)];
        var cy = dataC[(9) + 1];
        var radius = dataC[(6)];

        var max = Number.NEGATIVE_INFINITY;
        var edge, proj;

        var index = (6);
        var limit = dataP.length;
        for (; index < limit; index += (13)) {
            // proj = world-normal dot position
            proj = ((dataP[index + (6)] * cx) + (dataP[index + (6) + 1] * cy));
            var dist = proj - (radius + dataP[index + (9)]);
            if (dist > max) {
                max = dist;
                edge = index;
            }
        }

        var nx = dataP[edge + (6)];
        var ny = dataP[edge + (6) + 1];
        proj = ((nx * cy) - (ny * cx));
        if (proj >= dataP[edge + (10)]) {
            if (proj <= dataP[edge + (11)]) {
                // circle center is within voronoi region of edge.
                toiData[(0)] = -nx;
                toiData[(0) + 1] = -ny;
                toiData[(2)] = (cx -= (nx * radius));
                toiData[(2) + 1] = (cy -= (ny * radius));
                toiData[(4)] = (cx - (nx * max));
                toiData[(4) + 1] = (cy - (ny * max));
                return max;
            } else {
                // skip to next edge.
                edge += (13);
                if (edge === limit) {
                    edge = (6);
                }
            }
        }

        // Perform circle-vertex check.
        var vX = dataP[edge + (2)];
        var vY = dataP[edge + (2) + 1];
        var dx = (vX - cx);
        var dy = (vY - cy);

        var len = Math.sqrt((dx * dx) + (dy * dy));
        if (len === 0) {
            toiData[(0)] = dx = -nx;
            toiData[(0) + 1] = dy = -ny;
        } else {
            var rec = (1 / len);
            toiData[(0)] = (dx *= rec);
            toiData[(0) + 1] = (dy *= rec);
        }
        toiData[(2)] = (cx + (dx * radius));
        toiData[(2) + 1] = (cy + (dy * radius));
        toiData[(4)] = vX;
        toiData[(4) + 1] = vY;
        return (len - radius);
    };

    Physics2DCollisionUtils.prototype._distancePolygon2Polygon = function (polyA, polyB, toiData) {
        var inf = Number.POSITIVE_INFINITY;
        var dataA = polyA._data;
        var dataB = polyB._data;

        var limitA = dataA.length;
        var limitB = dataB.length;

        var i, j;
        var min, k, nx, ny;

        var max = -inf;
        var first, edge;

        for (i = (6); i < limitA; i += (13)) {
            min = inf;
            nx = dataA[i + (6)];
            ny = dataA[i + (6) + 1];
            for (j = (6); j < limitB; j += (13)) {
                k = (nx * dataB[j + (2)]) + (ny * dataB[j + (2) + 1]);
                if (k < min) {
                    min = k;
                }
            }
            min -= dataA[i + (9)];

            if (min > max) {
                max = min;
                edge = i;
                first = true;
            }
        }

        for (j = (6); j < limitB; j += (13)) {
            min = inf;
            nx = dataB[j + (6)];
            ny = dataB[j + (6) + 1];
            for (i = (6); i < limitA; i += (13)) {
                k = (nx * dataA[i + (2)]) + (ny * dataA[i + (2) + 1]);
                if (k < min) {
                    min = k;
                }
            }
            min -= dataB[j + (9)];

            if (min > max) {
                max = min;
                edge = j;
                first = false;
            }
        }

        // swap data so first polygon owns seperating axis.
        var flip = (first ? 1 : -1);
        var indA, indB;
        if (!first) {
            dataA = polyB._data;
            dataB = polyA._data;
            limitA = dataA.length;
            limitB = dataB.length;
            indA = (4);
            indB = (2);
        } else {
            indA = (2);
            indB = (4);
        }

        nx = dataA[edge + (6)];
        ny = dataA[edge + (6) + 1];

        // Find witness edge on dataB (not necessarigly polyB)
        min = inf;
        var witness;
        for (j = (6); j < limitB; j += (13)) {
            k = (nx * dataB[j + (6)]) + (ny * dataB[j + (6) + 1]);
            if (k < min) {
                min = k;
                witness = j;
            }
        }

        var next = witness + (13);
        if (next === limitB) {
            next = (6);
        }

        var kX, kY;
        var k1, k2;
        var x3, y3;
        var x4, y4;
        var dL;

        var x1 = dataB[witness + (2)];
        var y1 = dataB[witness + (2) + 1];
        var x2 = dataB[next + (2)];
        var y2 = dataB[next + (2) + 1];

        // Special case for parallel, intersecting edges.
        var parallel = (min < (Physics2DConfig.COLLINEAR_EPSILON - 1));
        if (max < 0 && parallel) {
            toiData[(0)] = (nx * flip);
            toiData[(0) + 1] = (ny * flip);

            // Clip (x1,y1), (x2,y2) to edge.
            // Projections relative to edge start.
            kX = dataA[edge + (2)];
            kY = dataA[edge + (2) + 1];
            dL = dataA[edge + (12)];

            k1 = (nx * (y1 - kY)) - (ny * (x1 - kX));
            if (k1 >= 0 && k1 <= dL) {
                toiData[indB] = kX = x1;
                toiData[indB + 1] = kY = y1;
            } else {
                k2 = (nx * (y2 - kY)) - (ny * (x1 - kX));
                if (k2 >= 0 && k2 <= dL) {
                    toiData[indB] = kX = x2;
                    toiData[indB + 1] = kY = y2;
                } else {
                    if (k1 < 0) {
                        k1 = -k1;
                    } else if (k1 > dL) {
                        k1 = (dL - k1);
                    }

                    toiData[indB] = kX = x1 - (ny * k1);
                    toiData[indB + 1] = kY = y1 + (nx * k1);
                }
            }

            // Witness on toiDataA is the projection.
            toiData[indA] = kX - (nx * max);
            toiData[indA + 1] = kY - (ny * max);

            return max;
        } else {
            if (max <= 0) {
                toiData[(0)] = (nx * flip);
                toiData[(0) + 1] = (ny * flip);

                // Find vertex on toiDataB that is 'deepest' This is a vertex of witness edge.
                k1 = (nx * x1) + (ny * y1);
                k2 = (nx * x2) + (ny * y2);
                if (k2 < k1) {
                    witness = next;
                }

                // Witness on toiDataB is the deep vertex.
                toiData[indB] = kX = dataB[witness + (2)];
                toiData[indB + 1] = kY = dataB[witness + (2) + 1];

                // Witness on toiDataA is the projection.
                toiData[indA] = kX - (nx * max);
                toiData[indA + 1] = kY - (ny * max);
                return max;
            } else {
                // Find closest point on dataA edge to witness edge.
                // Witness on dataB is one of the witness vertices.
                // Witness on dataA is the closest point (projection of witness on dataB)
                dL = dataA[edge + (12)];

                if (parallel) {
                    // Need to swap if dataB is 'longer' edge than on dataA.
                    var dL2 = dataB[witness + (12)];
                    if (dL2 > dL) {
                        dL = dL2;

                        // swap edge/witness
                        next = edge;
                        edge = witness;
                        witness = next;

                        next = (witness + (13));
                        if (next === limitA) {
                            next = (6);
                        }

                        x1 = dataA[witness + (2)];
                        y1 = dataA[witness + (2) + 1];
                        x2 = dataA[next + (2)];
                        y2 = dataA[next + (2) + 1];

                        // Change to dataB for (kX, kY) below.
                        dataA = dataB;

                        // flip everyyyyything.
                        nx *= -1;
                        ny *= -1;
                        flip *= -1;

                        var tmp = indA;
                        indA = indB;
                        indB = tmp;
                    }
                }

                kX = dataA[edge + (2)];
                kY = dataA[edge + (2) + 1];

                // 'time' of point w1 along edge.
                k1 = -((nx * (kY - y1)) - (ny * (kX - x1)));
                var in1 = true;
                if (k1 < 0) {
                    k1 = 0;
                    in1 = false;
                } else if (k1 > dL) {
                    k1 = dL;
                    in1 = false;
                }

                // 'time' of point w2 along edge.
                k2 = -((nx * (kY - y2)) - (ny * (kX - x2)));
                var in2 = true;
                if (k2 < 0) {
                    k2 = 0;
                    in2 = false;
                } else if (k2 > dL) {
                    k2 = dL;
                    in2 = false;
                }

                // point on edge closest to w1/w2, relative to closest points for axis.
                x3 = x1 - (kX - (ny * k1));
                y3 = y1 - (kY + (nx * k1));
                x4 = x2 - (kX - (ny * k2));
                y4 = y2 - (kY + (nx * k2));

                k1 = ((x3 * x3) + (y3 * y3));
                k2 = ((x4 * x4) + (y4 * y4));
                var rec;
                if (k1 < k2) {
                    // point closest to w1 is shorter distance.
                    toiData[indB] = kX = x1;
                    toiData[indB + 1] = kY = y1;
                    max = Math.sqrt(k1);
                    if (in1 || max < Physics2DConfig.NORMALIZE_EPSILON) {
                        toiData[(0)] = (nx *= flip);
                        toiData[(0) + 1] = (ny *= flip);
                    } else {
                        rec = flip / max;
                        toiData[(0)] = nx = (x3 * rec);
                        toiData[(0) + 1] = ny = (y3 * rec);
                    }
                } else {
                    // point closest to w2 is shorter distance.
                    toiData[indB] = kX = x2;
                    toiData[indB + 1] = kY = y2;
                    max = Math.sqrt(k2);
                    if (in2 || max < Physics2DConfig.NORMALIZE_EPSILON) {
                        toiData[(0)] = (nx *= flip);
                        toiData[(0) + 1] = (ny *= flip);
                    } else {
                        rec = flip / max;
                        toiData[(0)] = nx = (x4 * rec);
                        toiData[(0) + 1] = ny = (y4 * rec);
                    }
                }

                toiData[indA] = kX - (nx * max * flip);
                toiData[indA + 1] = kY - (ny * max * flip);
                return max;
            }
        }
    };

    // =====================================================================
    // Assumption, shapes have been updated by body.
    //   shapes must also be 'in' a Body for special contact data.
    // This method is not quite modular as test/distance
    // due to the complicated values required for contacts etc.
    // no AABB test performed here.
    Physics2DCollisionUtils.prototype._collide = function (shapeA, shapeB, arb) {
        if (shapeA._type === (0)) {
            if (shapeB._type === (0)) {
                return this._collideCircle2Circle(shapeA, shapeB, arb);
            } else {
                return this._collideCircle2Polygon(shapeA, shapeB, arb, false);
            }
        } else {
            if (shapeB._type === (0)) {
                return this._collideCircle2Polygon(shapeB, shapeA, arb, true);
            } else {
                return this._collidePolygon2Polygon(shapeA, shapeB, arb);
            }
        }
    };

    Physics2DCollisionUtils.prototype._collideCircle2Polygon = function (circle, polygon, arb, reverse) {
        var dataC = circle._data;
        var dataP = polygon._data;

        var cx = dataC[(9)];
        var cy = dataC[(9) + 1];
        var radius = dataC[(6)];

        var max = Number.NEGATIVE_INFINITY;

        var edge, proj;
        var index = (6);
        var limit = dataP.length;
        for (; index < limit; index += (13)) {
            proj = ((dataP[index + (6)] * cx) + (dataP[index + (6) + 1] * cy)) - (dataP[index + (9)] + radius);
            if (proj > 0) {
                return false;
            }
            if (proj > max) {
                max = proj;
                edge = index;
            }
        }

        var adata = arb._data;
        var con, cdata;

        var nx = dataP[edge + (6)];
        var ny = dataP[edge + (6) + 1];
        var vX, vY, lvX, lvY;
        var dx, dy;
        proj = ((nx * cy) - (ny * cx));
        if (proj >= dataP[edge + (10)]) {
            if (proj <= dataP[edge + (11)]) {
                // circle center within voronoi region of edge.
                // Take contact point to be consistently halfway into the overlap.
                proj = (radius + (max * 0.5));
                dx = (nx * proj);
                dy = (ny * proj);

                con = arb._injectContact(cx - dx, cy - dy, (reverse ? nx : -nx), (reverse ? ny : -ny), max, (0));

                arb._faceType = (reverse ? (1) : (2));
                arb._reverse = !reverse;
                adata[(11)] = dataP[edge + (4)];
                adata[(11) + 1] = dataP[edge + (4) + 1];
                adata[(13)] = dataP[edge + (8)];
                adata[(14)] = radius;

                cdata = con._data;
                cdata[(13)] = dataC[(7)];
                cdata[(13) + 1] = dataC[(7) + 1];
                return true;
            } else {
                var next = edge + (13);
                if (next === limit) {
                    next = (6);
                }
                vX = dataP[next + (2)];
                vY = dataP[next + (2) + 1];
                lvX = dataP[next + (0)];
                lvY = dataP[next + (0) + 1];
            }
        } else {
            vX = dataP[edge + (2)];
            vY = dataP[edge + (2) + 1];
            lvX = dataP[edge + (0)];
            lvY = dataP[edge + (0) + 1];
        }

        // Circle - Vertex
        dx = (cx - vX);
        dy = (cy - vY);
        var dsq = ((dx * dx) + (dy * dy));
        if (dsq > (radius * radius)) {
            return false;
        }

        if (dsq < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
            // Take contact point to be consistently halfway into the overlap.
            con = arb._injectContact(cx, cy, (reverse ? nx : -nx), (reverse ? ny : -ny), 0, (0));
        } else {
            var dist = Math.sqrt(dsq);
            var invDist = (1 / dist);
            var df = 0.5 + (radius * invDist * 0.5);
            if (!reverse) {
                invDist = -invDist;
            }

            // Take contact point to be consistently halfway into the overlap.
            con = arb._injectContact(cx - (dx * df), cy - (dy * df), dx * invDist, dy * invDist, dist - radius, (0));
        }

        cdata = con._data;
        if (reverse) {
            cdata[(13)] = lvX;
            cdata[(13) + 1] = lvY;
            cdata[(15)] = dataC[(7)];
            cdata[(15) + 1] = dataC[(7) + 1];
        } else {
            cdata[(13)] = dataC[(7)];
            cdata[(13) + 1] = dataC[(7) + 1];
            cdata[(15)] = lvX;
            cdata[(15) + 1] = lvY;
        }

        adata[(14)] = radius;
        arb._faceType = (0);
        arb._reverse = false;

        return true;
    };

    Physics2DCollisionUtils.prototype._collidePolygon2Polygon = function (polyA, polyB, arb) {
        var inf = Number.POSITIVE_INFINITY;
        var dataA = polyA._data;
        var dataB = polyB._data;

        var limitA = dataA.length;
        var limitB = dataB.length;

        var i, j;
        var min, k, nx, ny;

        var max = -inf;
        var first, edge, proj;

        for (i = (6); i < limitA; i += (13)) {
            min = inf;
            nx = dataA[i + (6)];
            ny = dataA[i + (6) + 1];
            proj = dataA[i + (9)];
            for (j = (6); j < limitB; j += (13)) {
                k = (nx * dataB[j + (2)]) + (ny * dataB[j + (2) + 1]);
                if (k < min) {
                    min = k;
                }
                if ((min - proj) <= max) {
                    break;
                }
            }
            min -= proj;
            if (min >= 0) {
                return false;
            }
            if (min > max) {
                max = min;
                edge = i;
                first = true;
            }
        }

        for (j = (6); j < limitB; j += (13)) {
            min = inf;
            nx = dataB[j + (6)];
            ny = dataB[j + (6) + 1];
            proj = dataB[j + (9)];
            for (i = (6); i < limitA; i += (13)) {
                k = (nx * dataA[i + (2)]) + (ny * dataA[i + (2) + 1]);
                if (k < min) {
                    min = k;
                }
                if ((min - proj) <= max) {
                    break;
                }
            }
            min -= proj;
            if (min >= 0) {
                return false;
            }
            if (min > max) {
                max = min;
                edge = j;
                first = false;
            }
        }

        // swap data so first polygon owns seperating axis.
        var flip = (first ? 1 : -1);
        var bdata;
        if (!first) {
            dataA = polyB._data;
            dataB = polyA._data;
            limitA = dataA.length;
            limitB = dataB.length;
            bdata = polyA.body._data;
        } else {
            bdata = polyB.body._data;
        }

        nx = dataA[edge + (6)];
        ny = dataA[edge + (6) + 1];

        // Find witness edge on dataB (not necessarigly polyB)
        min = inf;
        var witness;
        for (j = (6); j < limitB; j += (13)) {
            k = (nx * dataB[j + (6)]) + (ny * dataB[j + (6) + 1]);
            if (k < min) {
                min = k;
                witness = j;
            }
        }

        var next = witness + (13);
        if (next === limitB) {
            next = (6);
        }

        var c1X = dataB[witness + (2)];
        var c1Y = dataB[witness + (2) + 1];
        var c2X = dataB[next + (2)];
        var c2Y = dataB[next + (2) + 1];

        var dvX = (c2X - c1X);
        var dvY = (c2Y - c1Y);
        var d1 = (c1X * ny) - (c1Y * nx);
        var d2 = (c2X * ny) - (c2Y * nx);
        var den = (1 / (d2 - d1));

        // clip c1
        var t = (-dataA[edge + (11)] - d1) * den;
        if (t > Physics2DConfig.CLIP_EPSILON) {
            c1X += (dvX * t);
            c1Y += (dvY * t);
        }

        // clip c2
        t = (-dataA[edge + (10)] - d2) * den;
        if (t < -Physics2DConfig.CLIP_EPSILON) {
            c2X += (dvX * t);
            c2Y += (dvY * t);
        }

        var adata = arb._data;
        adata[(11)] = dataA[edge + (4)];
        adata[(11) + 1] = dataA[edge + (4) + 1];
        adata[(13)] = dataA[edge + (8)];
        adata[(14)] = 0.0;
        arb._faceType = (first ? (1) : (2));

        // Per contact distance
        proj = dataA[edge + (9)];
        var c1d = ((c1X * nx) + (c1Y * ny)) - proj;
        var c2d = ((c2X * nx) + (c2Y * ny)) - proj;

        var p1x = bdata[(2)];
        var p1y = bdata[(2) + 1];
        var cos = bdata[(5)];
        var sin = bdata[(5) + 1];

        if (c1d > 0 && c2d > 0) {
            return false;
        }

        var rx = (c1X - p1x);
        var ry = (c1Y - p1y);
        c1X -= (nx * c1d * 0.5);
        c1Y -= (ny * c1d * 0.5);
        var con = arb._injectContact(c1X, c1Y, nx * flip, ny * flip, c1d, (first ? (1) : (2)), c1d > 0)._data;
        con[(13)] = ((cos * rx) + (sin * ry));
        con[(13) + 1] = ((cos * ry) - (sin * rx));

        rx = (c2X - p1x);
        ry = (c2Y - p1y);
        c2X -= (nx * c2d * 0.5);
        c2Y -= (ny * c2d * 0.5);
        con = arb._injectContact(c2X, c2Y, nx * flip, ny * flip, c2d, (first ? (2) : (1)), c2d > 0)._data;
        con[(13)] = ((cos * rx) + (sin * ry));
        con[(13) + 1] = ((cos * ry) - (sin * rx));

        arb._reverse = (!first);

        return true;
    };

    Physics2DCollisionUtils.prototype._collideCircle2Circle = function (circleA, circleB, arb) {
        var dataA = circleA._data;
        var dataB = circleB._data;

        var x1 = dataA[(9)];
        var y1 = dataA[(9) + 1];
        var r1 = dataA[(6)];

        var dx = (dataB[(9)] - x1);
        var dy = (dataB[(9) + 1] - y1);
        var rSum = r1 + dataB[(6)];

        var dsq = ((dx * dx) + (dy * dy));
        if (dsq > (rSum * rSum)) {
            return false;
        }

        var con;
        if (dsq < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
            // Take contact point to be consistently halfway into the overlap.
            con = arb._injectContact(x1 + (dx * 0.5), y1 + (dy * 0.5), 1, 0, -rSum, (0));
        } else {
            var dist = Math.sqrt(dsq);
            var invDist = (1 / dist);
            var df = (0.5 + ((r1 - (0.5 * rSum)) * invDist));

            // Take contact point to be consistently halfway into the overlap.
            con = arb._injectContact(x1 + (dx * df), y1 + (dy * df), dx * invDist, dy * invDist, dist - rSum, (0));
        }

        var data = con._data;
        data[(13)] = dataA[(7)];
        data[(13) + 1] = dataA[(7) + 1];
        data[(15)] = dataB[(7)];
        data[(15) + 1] = dataB[(7) + 1];

        data = arb._data;
        data[(14)] = rSum;
        arb._faceType = (0);

        return true;
    };

    // =====================================================================
    // Assumption, shapes have been updated by body.
    // need not be 'in' a body.
    // No AABB test performed here.
    Physics2DCollisionUtils.prototype._test = function (shapeA, shapeB) {
        if (shapeA._type === (0)) {
            if (shapeB._type === (0)) {
                return this._testCircle2Circle(shapeA, shapeB);
            } else {
                return this._testCircle2Polygon(shapeA, shapeB);
            }
        } else {
            if (shapeB._type === (0)) {
                return this._testCircle2Polygon(shapeB, shapeA);
            } else {
                return this._testPolygon2Polygon(shapeA, shapeB);
            }
        }
    };

    Physics2DCollisionUtils.prototype._testCircle2Circle = function (circleA, circleB) {
        var dataA = circleA._data;
        var dataB = circleB._data;

        var dx = (dataA[(9)] - dataB[(9)]);
        var dy = (dataA[(9) + 1] - dataB[(9) + 1]);
        var rSum = dataA[(6)] + dataB[(6)];

        return (((dx * dx) + (dy * dy)) <= (rSum * rSum));
    };

    Physics2DCollisionUtils.prototype._testCircle2Polygon = function (circle, polygon) {
        var dataC = circle._data;
        var dataP = polygon._data;

        var cx = dataC[(9)];
        var cy = dataC[(9) + 1];
        var radius = dataC[(6)];

        var max = Number.NEGATIVE_INFINITY;
        var edge, proj;

        var index = (6);
        var limit = dataP.length;
        for (; index < limit; index += (13)) {
            // proj = world-normal dot position
            proj = ((dataP[index + (6)] * cx) + (dataP[index + (6) + 1] * cy));
            var dist = proj - (radius + dataP[index + (9)]);
            if (dist > 0) {
                return false;
            }

            if (dist > max) {
                max = dist;
                edge = index;
            }
        }

        // proj = world-normal perpdot position
        proj = ((dataP[edge + (6)] * cy) - (dataP[edge + (6) + 1] * cx));
        if (proj >= dataP[edge + (10)]) {
            if (proj <= dataP[edge + (11)]) {
                // circle center is within voronoi region of edge.
                return true;
            } else {
                // skip to next edge.
                edge += (13);
                if (edge === limit) {
                    edge = (6);
                }
            }
        }

        // Perform circle-vertex check.
        // delta = position - vertex
        var dx = (cx - dataP[edge + (2)]);
        var dy = (cy - dataP[edge + (2) + 1]);
        return (((dx * dx) + (dy * dy)) <= (radius * radius));
    };

    Physics2DCollisionUtils.prototype._testPolygon2Polygon = function (polyA, polyB) {
        var inf = Number.POSITIVE_INFINITY;
        var dataA = polyA._data;
        var dataB = polyB._data;

        var limitA = dataA.length;
        var limitB = dataB.length;

        var i, j;
        var min, proj, nx, ny;

        for (i = (6); i < limitA; i += (13)) {
            min = inf;
            nx = dataA[i + (6)];
            ny = dataA[i + (6) + 1];
            for (j = (6); j < limitB; j += (13)) {
                proj = (nx * dataB[j + (2)]) + (ny * dataB[j + (2) + 1]);
                if (proj < min) {
                    min = proj;
                }
            }
            if (min > dataA[i + (9)]) {
                return false;
            }
        }

        for (j = (6); j < limitB; j += (13)) {
            min = inf;
            nx = dataB[j + (6)];
            ny = dataB[j + (6) + 1];
            for (i = (6); i < limitA; i += (13)) {
                proj = (nx * dataA[i + (2)]) + (ny * dataA[i + (2) + 1]);
                if (proj < min) {
                    min = proj;
                }
            }
            if (min > dataB[j + (9)]) {
                return false;
            }
        }

        return true;
    };

    Physics2DCollisionUtils.create = function () {
        var c = new Physics2DCollisionUtils();
        c._toi = Physics2DTOIEvent.allocate();
        return c;
    };
    return Physics2DCollisionUtils;
})();

// =========================================================================
//
// Physics2D Device
//
var Physics2DDevice = (function () {
    function Physics2DDevice() {
        this.vendor = "Turbulenz";
    }
    Physics2DDevice.prototype.getDefaultMaterial = function () {
        return Physics2DMaterial.defaultMaterial;
    };

    Physics2DDevice.prototype.createCircleShape = function (params) {
        return Physics2DCircle.create(params);
    };

    Physics2DDevice.prototype.createPolygonShape = function (params) {
        return Physics2DPolygon.create(params, null);
    };

    Physics2DDevice.prototype.createRigidBody = function (params) {
        return Physics2DRigidBody.create(params);
    };

    Physics2DDevice.prototype.createWorld = function (params) {
        return Physics2DWorld.create(params);
    };

    Physics2DDevice.prototype.createMaterial = function (params) {
        return Physics2DMaterial.create(params);
    };

    Physics2DDevice.prototype.createSweepAndPruneBroadphase = function () {
        return Physics2DSweepAndPrune.create();
    };

    Physics2DDevice.prototype.createBoxTreeBroadphase = function () {
        return Physics2DBoxTreeBroadphase.create();
    };

    Physics2DDevice.prototype.createCollisionUtils = function () {
        return Physics2DCollisionUtils.create();
    };

    Physics2DDevice.prototype.createPointConstraint = function (params) {
        return Physics2DPointConstraint.create(params);
    };

    Physics2DDevice.prototype.createWeldConstraint = function (params) {
        return Physics2DWeldConstraint.create(params);
    };

    Physics2DDevice.prototype.createAngleConstraint = function (params) {
        return Physics2DAngleConstraint.create(params);
    };

    Physics2DDevice.prototype.createDistanceConstraint = function (params) {
        return Physics2DDistanceConstraint.create(params);
    };

    Physics2DDevice.prototype.createLineConstraint = function (params) {
        return Physics2DLineConstraint.create(params);
    };

    Physics2DDevice.prototype.createMotorConstraint = function (params) {
        return Physics2DMotorConstraint.create(params);
    };

    Physics2DDevice.prototype.createPulleyConstraint = function (params) {
        return Physics2DPulleyConstraint.create(params);
    };

    Physics2DDevice.prototype.createCustomConstraint = function (params) {
        return Physics2DCustomConstraint.create(params);
    };

    Physics2DDevice.prototype.createRectangleVertices = function (minX, minY, maxX, maxY) {
        var tmp;
        if (maxX < minX) {
            tmp = minX;
            minX = maxX;
            maxX = tmp;
        }
        if (maxY < minY) {
            tmp = minY;
            minY = maxY;
            maxY = tmp;
        }

        var v0 = new Physics2DDevice.prototype.floatArray(2);
        v0[0] = minX;
        v0[1] = minY;
        var v1 = new Physics2DDevice.prototype.floatArray(2);
        v1[0] = maxX;
        v1[1] = minY;
        var v2 = new Physics2DDevice.prototype.floatArray(2);
        v2[0] = maxX;
        v2[1] = maxY;
        var v3 = new Physics2DDevice.prototype.floatArray(2);
        v3[0] = minX;
        v3[1] = maxY;

        return [v0, v1, v2, v3];
    };

    Physics2DDevice.prototype.createBoxVertices = function (width, height) {
        var w = (width * 0.5);
        var h = (height * 0.5);

        var v0 = new Physics2DDevice.prototype.floatArray(2);
        v0[0] = -w;
        v0[1] = -h;
        var v1 = new Physics2DDevice.prototype.floatArray(2);
        v1[0] = w;
        v1[1] = -h;
        var v2 = new Physics2DDevice.prototype.floatArray(2);
        v2[0] = w;
        v2[1] = h;
        var v3 = new Physics2DDevice.prototype.floatArray(2);
        v3[0] = -w;
        v3[1] = h;

        return [v0, v1, v2, v3];
    };

    Physics2DDevice.prototype.createRegularPolygonVertices = function (diameterX, diameterY, numVertices) {
        var rX = (diameterX * 0.5);
        var rY = (diameterY * 0.5);
        var vertices = [];

        var num = numVertices;
        var angInc = (Math.PI * 2 / num);

        var i;
        for (i = 0; i < num; i += 1) {
            var ang = (angInc * i);
            var vec = vertices[vertices.length] = new Physics2DDevice.prototype.floatArray(2);
            vec[0] = (rX * Math.cos(ang));
            vec[1] = (rY * Math.sin(ang));
        }

        return vertices;
    };

    Physics2DDevice.create = function () {
        var pd = new Physics2DDevice();
        return pd;
    };
    Physics2DDevice.version = 1;
    return Physics2DDevice;
})();

// =========================================================================
// Detect correct typed arrays
((function () {
    Physics2DDevice.prototype.floatArray = function (arg) {
        if (arguments.length === 0) {
            return [];
        }

        var i, ret;
        if (typeof arg === "number") {
            ret = new Array(arg);
        } else {
            ret = [];
            for (i = 0; i < arg.length; i += 1) {
                ret[i] = arg[i];
            }
        }
        return ret;
    };

    Physics2DDevice.prototype.uint16Array = Physics2DDevice.prototype.floatArray;

    var testArray, textDescriptor;
    if (typeof Float32Array !== "undefined") {
        testArray = new Float32Array(4);
        textDescriptor = Object.prototype.toString.call(testArray);
        if (textDescriptor === '[object Float32Array]') {
            Physics2DDevice.prototype.floatArray = Float32Array;
        }
    }

    if (typeof Uint16Array !== "undefined") {
        testArray = new Uint16Array(4);
        textDescriptor = Object.prototype.toString.call(testArray);
        if (textDescriptor === '[object Uint16Array]') {
            Physics2DDevice.prototype.uint16Array = Uint16Array;
        }
    }
})());

// Must defer so that floatArray on Physics2DDevice is defined.
Physics2DMaterial.defaultMaterial = Physics2DMaterial.create();
