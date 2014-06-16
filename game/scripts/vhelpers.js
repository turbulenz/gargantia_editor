//
//  VHelpers
//
//  Useful Math Functions
//

/*global Camera: false*/
/*global debug: false*/
/*global VMath: false*/

Math.sgn = function (x)
{
    return x < 0 ? -1 : x > 0 ? 1 : 0;
};

VMath.radiansToDegrees = (180.0 / Math.PI);
VMath.degreesToRadians = (Math.PI / 180.0);

VMath.scratchpad = {};

VMath.equal = function vmathEqual(a, b)
{
    return Math.abs(a - b) <= VMath.precision;
};

VMath.v3UpperLimitLength = function vmathv3UpperLimitLength(v3a, maximumLength, dst)
{
    debug.assert(debug.isVec3(v3a));
    debug.assert(debug.isNumber(maximumLength));

    if (this.v3LengthSq(v3a) > maximumLength * maximumLength)
    {
        return this.v3SetLength(v3a, maximumLength, dst);
    }

    // TODO: Shouldn't we return v3Copy(v3a) if dest === undefined?

    return dst;
};

VMath.v3LowerLimitLength = function vmathv3LowerLimitLength(v3a, minimumLength, dst)
{
    debug.assert(debug.isVec3(v3a));
    debug.assert(debug.isNumber(minimumLength));

    if (this.v3LengthSq(v3a) < minimumLength * minimumLength)
    {
        return this.v3SetLength(v3a, minimumLength, dst);
    }

    // TODO: Shouldn't we return v3Copy(v3a) if dest === undefined?

    return dst;
};

VMath.v3ClampLength = function vmathv3ClampLength(v3a, minimumLength, maximumLength, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    debug.assert(debug.isVec3(v3a));
    debug.assert(debug.isNumber(maximumLength));
    debug.assert(debug.isNumber(minimumLength));
    debug.assert(debug.isVec3(dst));

    if (this.v3LengthSq(v3a) < minimumLength * minimumLength)
    {
        this.v3SetLength(v3a, minimumLength, dst);
    }

    if (this.v3LengthSq(v3a) > maximumLength * maximumLength)
    {
        this.v3SetLength(v3a, maximumLength, dst);
    }

    return  dst;
};

VMath.v3ClampDistance = function vmathv3ClampDistance(v3Anchor, v3b, minimumDistance, maximumDistance, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    debug.assert(debug.isVec3(v3Anchor));
    debug.assert(debug.isVec3(v3b));
    debug.assert(debug.isNumber(minimumDistance));
    debug.assert(debug.isNumber(maximumDistance));
    debug.assert(debug.isVec3(dst));

    var scratchpad    = VMath.scratchpad;

    scratchpad.v3aTob = this.v3Sub(v3b, v3Anchor, scratchpad.v3aTob);

    this.v3ClampLength(scratchpad.v3aTob, minimumDistance, maximumDistance, scratchpad.v3aTob);

    return  this.v3Add(v3Anchor, scratchpad.v3aTob, dst);
};

VMath.v3SetLength = function vmathv3SetLength(v3a, length, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    debug.assert(debug.isVec3(v3a));
    debug.assert(debug.isNumber(length));
    debug.assert(debug.isVec3(dst));

    this.v3ScalarMul(v3a, length / this.v3Length(v3a), dst);

    return  dst;
};

VMath.getRayPlaneIntersection = function vmathGetRayPlaneIntersection(
    v3PlanePosition,
    v3PlaneNormal,
    v3LinePosition,
    v3LineNormal,
    dst)
{
    var scratchpad = VMath.scratchpad;

    var ensuredv3NormalisedLine = scratchpad.v3LineNormal = this.v3Copy(v3LineNormal, scratchpad.v3LineNormal);
    this.v3Normalize(ensuredv3NormalisedLine, ensuredv3NormalisedLine);

    //How far off plane is line position?
    var v3PlanePositionToLinePosition = scratchpad.v3PlanePosition = this.v3Sub(v3LinePosition,
                                                                                v3PlanePosition,
                                                                                scratchpad.v3PlanePosition);
    var distanceAlongPlaneNormalToLine = this.v3Dot(v3PlanePositionToLinePosition, v3PlaneNormal);

    var lineUnitsPerPlaneNormal = this.v3Dot(ensuredv3NormalisedLine, v3PlaneNormal);

    var v3PointOfIntersection = this.v3Sub(v3LinePosition,
                                           this.v3ScalarMul(ensuredv3NormalisedLine,
                                                            distanceAlongPlaneNormalToLine / lineUnitsPerPlaneNormal,
                                                            v3PlanePositionToLinePosition),
                                           dst);

    return v3PointOfIntersection;
};

VMath.getRayPlanePositiveIntersection = function vmathGetRayPlaneIntersection(
    v3PlanePosition,
    v3PlaneNormal,
    v3LinePosition,
    v3LineNormal,
    dst)
{
    var scratchpad = VMath.scratchpad;

    var ensuredv3NormalisedLine = scratchpad.v3LineNormal = this.v3Copy(v3LineNormal, scratchpad.v3LineNormal);
    this.v3Normalize(ensuredv3NormalisedLine, ensuredv3NormalisedLine);

    //How far off plane is line position?
    var v3PlanePositionToLinePosition = scratchpad.v3PlanePosition = this.v3Sub(v3LinePosition,
                                                                                v3PlanePosition,
                                                                                scratchpad.v3PlanePosition);
    var distanceAlongPlaneNormalToLine = this.v3Dot(v3PlanePositionToLinePosition, v3PlaneNormal);

    var lineUnitsPerPlaneNormal = this.v3Dot(ensuredv3NormalisedLine, v3PlaneNormal);

    if (lineUnitsPerPlaneNormal > 0.0)
    {
        return  undefined;
    }

    var v3PointOfIntersection = this.v3Sub(v3LinePosition,
                                           this.v3ScalarMul(ensuredv3NormalisedLine,
                                                            distanceAlongPlaneNormalToLine / lineUnitsPerPlaneNormal,
                                                            v3PlanePositionToLinePosition),
                                           dst);

    return v3PointOfIntersection;
};

VMath.clamp2DLineSegmentWithinCircle = function vmathClamp2DLineSegmentWithinCircleFn(v2CircleCentre, circleRadius, v2LineStart, v2LineEnd)
{
    // Checks whether or not the given 2D line segment intersects with the given circle.
    // If it does, the line segment is clamped to fit within the circle.
    var md = this;
    var scratchpad = VMath.scratchpad;

    var v2LineDirection           = scratchpad.v2LineDirection = md.v2Sub(v2LineEnd, v2LineStart, scratchpad.v2LineDirection);
    var v2CircleCentreToLineStart = scratchpad.v2CircleCentreToLineStart = md.v2Sub(v2LineStart, v2CircleCentre, scratchpad.v2CircleCentreToLineStart);

    var a = md.v2DistanceSq(v2LineStart, v2LineEnd);
    var b = 2.0 * md.v2Dot(v2LineDirection, v2CircleCentreToLineStart);
    var c = md.v2LengthSq(v2CircleCentre) + md.v2LengthSq(v2LineStart) - (2.0 * md.v2Dot(v2CircleCentre, v2LineStart)) - (circleRadius * circleRadius);

    var discriminant = b * b - 4 * a * c;
    if (discriminant < 0)
    {
        return false;
    }

    var sqrtDiscriminant = Math.sqrt(discriminant);

    var intersectionValueA = (-b - sqrtDiscriminant) / (2.0 * a);
    var intersectionValueB = (-b + sqrtDiscriminant) / (2.0 * a);

    if (intersectionValueA > 1.0)
    {
        return false;
    }
    if (intersectionValueB < 0.0)
    {
        return false;
    }

    //Important to do lineEnd first, because we may manipulate lineStart
    if (intersectionValueB <= 1)
    {
        v2LineEnd = md.v2AddScalarMul(v2LineStart, v2LineDirection, intersectionValueB, v2LineEnd);
    }

    if (intersectionValueA >= 0)
    {
        v2LineStart = md.v2AddScalarMul(v2LineStart, v2LineDirection, intersectionValueA, v2LineStart);
    }

    return true;
};

VMath.v2AddScalarMul = function v2AddScalarMulFn(a, b, c, dst)
{
    if (dst === undefined) {
        dst = this.v2BuildZero();
    }
    debug.assert(debug.isVec2(a));
    debug.assert(debug.isVec2(b));
    debug.assert(debug.isNumber(c));
    debug.assert(debug.isVec2(dst));
    dst[0] = a[0] + b[0] * c;
    dst[1] = a[1] + b[1] * c;
    return dst;
};

VMath.v3BuildRandom =   function vmathv3BuildRandom(scale, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    debug.assert(debug.isNumber(scale));
    debug.assert(debug.isVec3(dst));

    dst[0]  =   (Math.random() - 0.5) * 2.0 * scale;
    dst[1]  =   (Math.random() - 0.5) * 2.0 * scale;
    dst[2]  =   (Math.random() - 0.5) * 2.0 * scale;

    return  dst;
};

VMath.v3BuildRandomCircle   =   function vmathv3BuildRandomCircle(scale, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    debug.assert(debug.isNumber(scale));
    debug.assert(debug.isVec3(dst));

    dst =   this.angleToV3(Math.random() * Math.PI * 2.0);

    dst =   this.v3ScalarMul(dst, Math.random() * scale, dst);

    return  dst;
};

VMath.getNearestPointOnLineToPoint = function nearestPointOnLineToPointFn(v3LineStart, v3LineEnd, v3Point)
{
    debug.assert(debug.isVec3(v3LineStart));
    debug.assert(debug.isVec3(v3LineEnd));
    debug.assert(debug.isVec3(v3Point));

    var v3Line              =   this.v3Sub(v3LineEnd, v3LineStart);
    var distanceMax         =   this.v3Length(v3Line);
    this.v3Normalize(v3Line, v3Line);
    var v3LineStartToPoint  =   this.v3Sub(v3Point, v3LineStart);

    var distanceAlongLine   =   this.v3Dot(v3LineStartToPoint, v3Line);
    distanceAlongLine       =   this.clamp(distanceAlongLine, 0.0, distanceMax);

    var nearestV3PointOnLine    =   this.v3Add(v3LineStart, this.v3ScalarMul(v3Line, distanceAlongLine));

    return  nearestV3PointOnLine;
};

VMath.getLineIntersectSphere = function lineIntersectSphereFn(v3LineStart, v3LineEnd, v3Centre, radius)
{
    debug.assert(debug.isVec3(v3LineStart));
    debug.assert(debug.isVec3(v3LineEnd));
    debug.assert(debug.isVec3(v3Centre));
    debug.assert(debug.isNumber(radius));

    var v3NearestPoint    =   this.getNearestPointOnLineToPoint(v3LineStart, v3LineEnd, v3Centre);

    if (this.v3DistanceSq(v3NearestPoint, v3Centre) <= radius * radius)
    {
        return  this.v3Distance(v3LineStart, v3NearestPoint);
    }
    return  undefined;
};

VMath.getDistanceBetweenSegmentsSq = function distanceBetweenSegmentsSq(
    v3LineAStart,
    v3LineAEnd,
    v3LineBStart,
    v3LineBEnd,
    v3NearestA,
    v3NearestB)
{
    debug.assert(debug.isVec3(v3LineAStart));
    debug.assert(debug.isVec3(v3LineAEnd));
    debug.assert(debug.isVec3(v3LineBStart));
    debug.assert(debug.isVec3(v3LineBEnd));

    var   small_number    =   0.00000001;

    var md  =   this;
    var scratchpad = VMath.scratchpad;

    var   u   = scratchpad.u =  md.v3Sub(v3LineAEnd, v3LineAStart, scratchpad.u);
    var   v   = scratchpad.v =  md.v3Sub(v3LineBEnd, v3LineBStart, scratchpad.v);
    var   w   = scratchpad.w =  md.v3Sub(v3LineAStart, v3LineBStart, scratchpad.w);
    var   a   =   md.v3Dot(u, u);        // always >= 0
    var   b   =   md.v3Dot(u, v);
    var   c   =   md.v3Dot(v, v);        // always >= 0
    var   d   =   md.v3Dot(u, w);
    var   e   =   md.v3Dot(v, w);
    var   D   =   (a * c) - (b * b);  // always >= 0
    var   sc, sN;
    var   sD = D; // sc = sN / sD, default sD = D >= 0
    var   tc, tN;
    var   tD = D; // tc = tN / tD, default tD = D >= 0

    // compute the line parameters of the two closest points
    if (D < small_number) {     // the lines are almost parallel
        sN  =   0.0;            // force using point P0 on segment S1
        sD  =   1.0;            // to prevent possible division by 0.0 later
        tN  =   e;
        tD  =   c;
    }
    else {                // get the closest points on the infinite lines
        sN = ((b * e) - (c * d));
        tN = ((a * e) - (b * d));
        if (sN  <   0.0) {       // sc < 0 => the s=0 edge is visible
            sN  =   0.0;
            tN  =   e;
            tD  =   c;
        }
        else if (sN > sD) {  // sc > 1 => the s=1 edge is visible
            sN  =   sD;
            tN  =   e + b;
            tD  =   c;
        }
    }

    if (tN < 0.0) {           // tc < 0 => the t=0 edge is visible
        tN = 0.0;
        // recompute sc for this edge
        if (-d < 0.0)
        {
            sN  =   0.0;
        }
        else if (-d > a)
        {
            sN  =   sD;
        }
        else {
            sN  =   -d;
            sD  =   a;
        }
    }
    else if (tN > tD) {      // tc > 1 => the t=1 edge is visible
        tN = tD;
        // recompute sc for this edge
        if ((-d + b) < 0.0)
        {
            sN  =   0;
        }
        else if ((-d + b) > a)
        {
            sN  =   sD;
        }
        else {
            sN  =   (-d + b);
            sD  =   a;
        }
    }
    // finally do the division to get sc and tc
    sc = (Math.abs(sN) < small_number ? 0.0 : sN / sD);
    tc = (Math.abs(tN) < small_number ? 0.0 : tN / tD);

    // get the difference of the two closest points
    //var    dP = w + (sc * u) - (tc * v);  // = S1(sc) - S2(tc)
    var    dP = w;
    md.v3AddScalarMul(dP, u, sc, dP);
    md.v3AddScalarMul(dP, v, -tc, dP);

    if (v3NearestA)
    {
        debug.assert(debug.isVec3(v3NearestA));

        md.v3AddScalarMul(v3LineAStart, u, sc, v3NearestA);
    }
    if (v3NearestB)
    {
        debug.assert(debug.isVec3(v3NearestB));

        md.v3AddScalarMul(v3LineBStart, v, tc, v3NearestB);
    }

    /*Draw3dLine(v3LineAStart,v3LineAEnd,0xaaff0000);
     Draw3dLine(v3LineBStart,v3LineBEnd,0xaa00ff00);
     Draw3dLine(v3LineAStart+u*sc,v3LineBStart+v*tc,0xaa0000ff);*/

    return md.v3LengthSq(dP);   // return the closest distance
};

VMath.getLineIntersectCapsule = function lineIntersectCapsuleFn(v3LineStart, v3LineEnd, v3Centre, radius, height)
{
    debug.assert(debug.isVec3(v3LineStart));
    debug.assert(debug.isVec3(v3LineEnd));
    debug.assert(debug.isVec3(v3Centre));
    debug.assert(debug.isNumber(radius));
    debug.assert(debug.isNumber(height));

    var md             = this;
    var scratchpad     = VMath.scratchpad;
    var v3NearestPoint = scratchpad.v3NearestPoint = md.v3BuildZero(scratchpad.v3NearestPoint);
    var v3CentreTop    = scratchpad.v3CentreTop = md.v3Copy(v3Centre, scratchpad.v3CentreTop);
    v3CentreTop[1]  +=  height;
    var distanceSq  =   md.getDistanceBetweenSegmentsSq(v3LineStart, v3LineEnd, v3Centre, v3CentreTop, v3NearestPoint);

    if (distanceSq <= radius * radius)
    {
        return  md.v3Distance(v3LineStart, v3NearestPoint);
    }
    return  undefined;
};

VMath.getLineIntersectSphereOrCapsule = function lineIntersectSphereOrCapsuleFn(v3LineStart, v3LineEnd, v3Centre, radius, height)
{
    debug.assert(debug.isVec3(v3LineStart));
    debug.assert(debug.isVec3(v3LineEnd));
    debug.assert(debug.isVec3(v3Centre));
    debug.assert(debug.isNumber(radius));
    debug.assert(debug.isNumber(height));

    var md = this;
    if (height)
    {
        return  md.getLineIntersectCapsule(v3LineStart, v3LineEnd, v3Centre, radius, height);
    }
    return  md.getLineIntersectSphere(v3LineStart, v3LineEnd, v3Centre, radius);
};

VMath.angleToV3 = function angleToV3Fn(angle, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isVec3(dst));

    dst[0]  =   -Math.sin(angle);
    dst[1]  =   0.0;
    dst[2]  =   Math.cos(angle);

    return  dst;
};

VMath.v2BuildFromv3 = function v2BuildFromV3Fn(v3, dst)
{
    debug.assert(debug.isVec3(v3));
    return this.v2Build(v3[0], v3[2], dst);
};

VMath.v3BuildFromv2 = function v3BuildFromV2Fn(v2, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    debug.assert(debug.isVec2(v2));
    debug.assert(debug.isVec3(dst));

    dst[0] = v2[0];
    dst[1] = 0.0;
    dst[2] = v2[1];
    return dst;
};

VMath.v4BuildFromv3 = function v4BuildFromV3(v3, dst)
{
    if (dst === undefined)
    {
        dst = this.v4BuildZero();
    }

    debug.assert(debug.isVec3(v3));
    debug.assert(debug.isVec4(dst));

    dst[0] = v3[0];
    dst[1] = v3[1];
    dst[2] = v3[2];
    dst[3] = 0.0;
    return dst;
};

VMath.v3ToAngle = function v3ToAngleFn(v3)
{
    debug.assert(debug.isVec3(v3));

    return Math.atan2(-v3[0], v3[2]);
};

VMath.clampAngleToNearest = function clampAngleToNearest(angle, angleStep)
{
    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isNumber(angleStep));

    var boundAngle  =   this.boundAngle(angle);

    var steps   =   Math.round(boundAngle / angleStep);

    return  steps   *   angleStep;
};

VMath.angleToV2 = function angleToV2Fn(angle, dst)
{
    debug.assert(debug.isNumber(angle));
    return this.v2Build(-Math.sin(angle), Math.cos(angle), dst);
};

VMath.angleToV3 = function angleToV3Fn(angle, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isVec3(dst));

    dst[0]  =   -Math.sin(angle);
    dst[1]  =   0.0;
    dst[2]  =   Math.cos(angle);

    return  dst;
};

VMath.v2ToAngle = function v2ToAngleFn(v2)
{
    debug.assert(debug.isVec2(v2));

    return Math.atan2(-v2[0], v2[1]);
};

VMath.boundAngle = function boundAngleFn(angle)
{
    debug.assert(debug.isNumber(angle));

    var out_angle   =   angle;
    var twoPI       =   2.0 * Math.PI;
    out_angle       -=	twoPI * (Math.floor(angle / twoPI));
    return  out_angle;
};

VMath.lerpAngle = function lerpAngleFn(a, b, f)
{
    debug.assert(debug.isNumber(a));
    debug.assert(debug.isNumber(b));
    debug.assert(debug.isNumber(f));

    return  this.boundAngle(a + this.diffAngles(a, b) * f);
};

VMath.diffAngles    =   function diffAnglesFn(angle1, angle2)
{
    debug.assert(debug.isNumber(angle1));
    debug.assert(debug.isNumber(angle2));

    var PI          =   Math.PI;
    var twoPI       =   2.0 * PI;

    var bAngle1 =   this.boundAngle(angle1);
    var bAngle2 =   this.boundAngle(angle2);

    var difference	=	bAngle2 - bAngle1;

    if (Math.abs(difference) < Math.PI)
    {
        return  difference;
    }

    //Add 2MyPI to whichever one is less than PI.
    if (bAngle2 < PI)
    {
        difference	=	(bAngle2 + twoPI) - bAngle1;
    }
    else
    {
        difference	=	bAngle2 - (bAngle1 + twoPI);
    }
    return	difference;
};

VMath.remap = function remapFn(inLower, inUpper, outLower, outUpper, val)
{
    debug.assert(debug.isNumber(inLower));
    debug.assert(debug.isNumber(outLower));
    debug.assert(debug.isNumber(outUpper));
    debug.assert(debug.isNumber(val));

    var factor  =   this.getFactor(inLower, inUpper, val);
    factor  =   this.saturate(factor);
    return  this.lerp(outLower, outUpper, factor);
};

VMath.lerp = function lerpFn(a, b, factor)
{
    debug.assert(debug.isNumber(a));
    debug.assert(debug.isNumber(b));
    debug.assert(debug.isNumber(factor));

    if (b === a)
    {
        return a;
    }
    return  a + ((b - a) * factor);
};

VMath.getFactor = function getFactorFn(a, b, amount)
{
    debug.assert(debug.isNumber(a));
    debug.assert(debug.isNumber(b));
    debug.assert(debug.isNumber(amount));

    if (b === a)
    {
        return amount < a ? 0.0 : 1.0;
    }
    return  (amount - a) / (b - a);
};

VMath.clamp = function clampFn(a, lower, upper)
{
    debug.assert(debug.isNumber(a));
    debug.assert(debug.isNumber(lower));
    debug.assert(debug.isNumber(upper));

    return  Math.min(Math.max(a, lower), upper);
};

VMath.v2Clamp = function clampFn(a, v2Lower, v2Upper, dst)
{
    debug.assert(debug.isVec2(a));
    debug.assert(debug.isVec2(v2Lower));
    debug.assert(debug.isVec2(v2Upper));
    return this.v2Build(
        this.clamp(a[0], v2Lower[0], v2Upper[0]),
        this.clamp(a[1], v2Lower[1], v2Upper[1]),
        dst);
};

VMath.saturate = function saturateFn(a)
{
    debug.assert(debug.isNumber(a));

    return  Math.min(Math.max(a, 0.0), 1.0);
};

VMath.v3Saturate = function saturateFn(a, dst)
{
    debug.assert(debug.isVec3(a));
    debug.assert(debug.isVec3(dst));

    dst[0] = Math.min(Math.max(a[0], 0.0), 1.0);
    dst[1] = Math.min(Math.max(a[1], 0.0), 1.0);
    dst[2] = Math.min(Math.max(a[2], 0.0), 1.0);

    return dst;
};

VMath.v3SafeEqual   =   function v3SafeEqualFn(a, b, precision)
{
    var abs = Math.abs;
    if (precision === undefined)
    {
        precision = this.precision;
    }

    if ((a === undefined) !== (b === undefined))
    {
        return false;
    }

    debug.assert(debug.isVec3(a));
    debug.assert(debug.isVec3(b));
    debug.assert(debug.isNumber(precision));

    return (abs(a[0] - b[0]) <= precision &&
            abs(a[1] - b[1]) <= precision &&
            abs(a[2] - b[2]) <= precision);
};

VMath.aabbAddPoint = function aabbAddPointFn(aabb, v3Point)
{
    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isVec3(v3Point));

    var r0 = aabb[0];
    var r1 = aabb[1];
    var r2 = aabb[2];
    var r3 = aabb[3];
    var r4 = aabb[4];
    var r5 = aabb[5];

    var p0, p1, p2;

    p0 = v3Point[0];
    p1 = v3Point[1];
    p2 = v3Point[2];

    r0 = (r0 < p0 ? r0 : p0);
    r1 = (r1 < p1 ? r1 : p1);
    r2 = (r2 < p2 ? r2 : p2);
    r3 = (r3 > p0 ? r3 : p0);
    r4 = (r4 > p1 ? r4 : p1);
    r5 = (r5 > p2 ? r5 : p2);

    aabb[0] = r0;
    aabb[1] = r1;
    aabb[2] = r2;
    aabb[3] = r3;
    aabb[4] = r4;
    aabb[5] = r5;
};

VMath.aabbPointDistanceSq = function aabbPointDistanceSqFn(aabb, center)
{
    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isVec3(center));

    var centerX = center[0];
    var centerY = center[1];
    var centerZ = center[2];

    var minX = aabb[0];
    var minY = aabb[1];
    var minZ = aabb[2];
    var maxX = aabb[3];
    var maxY = aabb[4];
    var maxZ = aabb[5];
    var totalDistanceSq = 0, sideDistance;

    if (centerX < minX)
    {
        sideDistance = (minX - centerX);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    else if (centerX > maxX)
    {
        sideDistance = (centerX - maxX);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    if (centerY < minY)
    {
        sideDistance = (minY - centerY);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    else if (centerY > maxY)
    {
        sideDistance = (centerY - maxY);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    if (centerZ < minZ)
    {
        sideDistance = (minZ - centerZ);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    else if (centerZ > maxZ)
    {
        sideDistance = (centerZ - maxZ);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    return totalDistanceSq;
};

VMath.aabbPointDistance2DSq = function aabbPointDistance2DSqFn(aabb, center)
{
    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isVec3(center));

    var centerX = center[0];
    var centerZ = center[2];

    var minX = aabb[0];
    var minZ = aabb[2];
    var maxX = aabb[3];
    var maxZ = aabb[5];
    var totalDistanceSq = 0, sideDistance;

    if (centerX < minX)
    {
        sideDistance = (minX - centerX);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    else if (centerX > maxX)
    {
        sideDistance = (centerX - maxX);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    if (centerZ < minZ)
    {
        sideDistance = (minZ - centerZ);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    else if (centerZ > maxZ)
    {
        sideDistance = (centerZ - maxZ);
        totalDistanceSq += (sideDistance * sideDistance);
    }
    return totalDistanceSq;
};

//Untested.
//VMath.aabbSetMinSize = function aabbSetMinSizeFn(aabb, size, dst)
//{
//    var center  =   VMath.v3BuildZero();
//    var half    =   VMath.v3BuildZero();
//    VMath.aabbGetCenterAndHalf(aabb, center, half);
//
//    VMath.v3Max(half, size, half);
//
//    dst =   VMath.aabbBuildFromCentreHalfExtents(center, half, dst);
//
//    return  dst;
//};

VMath.aabbShrink = function aabbShrinkFn(aabb, amount, dst)
{
    if (dst === undefined)
    {
        dst = this.aabbBuildEmpty();
    }

    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isNumber(amount));
    debug.assert(debug.isAABB(dst));

    var center  =   this.v3BuildZero();
    var half    =   this.v3BuildZero();

    this.aabbGetCenterAndHalf(aabb, center, half);

    this.v3ScalarSub(half, amount, half);
    half =   this.v3ScalarMax(half, 0.0);  //no DST!

    this.aabbBuildFromCentreHalfExtents(center, half, dst);

    return  dst;
};


VMath.aabbSmallestPointOverlapDistance = function aabbPointOverlapFn(aabb, center)
{
    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isVec3(center));

    var centerX = center[0];
    var centerY = center[1];
    var centerZ = center[2];

    var minX = aabb[0];
    var minY = aabb[1];
    var minZ = aabb[2];
    var maxX = aabb[3];
    var maxY = aabb[4];
    var maxZ = aabb[5];
    var sideDistance;
    var smallestDistance;

    if (centerX > minX)
    {
        sideDistance = (centerX - minX);
        if ((smallestDistance === undefined) || sideDistance < smallestDistance)
        {
            smallestDistance    =   sideDistance;
        }
    }
    if (centerX < maxX)
    {
        sideDistance = (maxX - centerX);
        if ((smallestDistance === undefined) || sideDistance < smallestDistance)
        {
            smallestDistance    =   sideDistance;
        }
    }
    if (centerY > minY)
    {
        sideDistance = (centerY - minY);
        if ((smallestDistance === undefined) || sideDistance < smallestDistance)
        {
            smallestDistance    =   sideDistance;
        }
    }
    if (centerY < maxY)
    {
        sideDistance = (maxY - centerY);
        if ((smallestDistance === undefined) || sideDistance < smallestDistance)
        {
            smallestDistance    =   sideDistance;
        }
    }
    if (centerZ > minZ)
    {
        sideDistance = (centerZ - minZ);
        if ((smallestDistance === undefined) || sideDistance < smallestDistance)
        {
            smallestDistance    =   sideDistance;
        }
    }
    if (centerZ < maxZ)
    {
        sideDistance = (maxZ - centerZ);
        if ((smallestDistance === undefined) || sideDistance < smallestDistance)
        {
            smallestDistance    =   sideDistance;
        }
    }
    return smallestDistance;
};

VMath.aabbClampSphere = function aabbClampSphereFn(aabb, center, radius, v3dst)
{
    if (v3dst === undefined)
    {
        v3dst = this.v3BuildZero();
    }

    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isVec3(center));
    debug.assert(debug.isNumber(radius));
    debug.assert(debug.isVec3(v3dst));

    var aabbSmaller  =   this.aabbShrink(aabb, radius);

    return  this.aabbClampv3(aabbSmaller, center, v3dst);
};

VMath.aabbPointDistance = function aabbPointDistanceFn(aabb, center)
{
    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isVec3(center));

    return  Math.sqrt(this.aabbPointDistanceSq(aabb, center));
};

VMath.aabbPointDistance2D = function aabbPointDistance2DFn(aabb, center)
{
    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isVec3(center));

    return  Math.sqrt(this.aabbPointDistance2DSq(aabb, center));
};

VMath.v2DistanceSq = function v2DistanceSqFn(a, b)
{
    debug.assert(debug.isVec2(a));
    debug.assert(debug.isVec2(b));

    var d0 = a[0] - b[0];
    var d1 = a[1] - b[1];
    return ((d0 * d0) + (d1 * d1));
};

VMath.v3DistanceSq = function v3DistanceSqFn(a, b)
{
    debug.assert(debug.isVec3(a));
    debug.assert(debug.isVec3(b));

    var d0 = a[0] - b[0];
    var d1 = a[1] - b[1];
    var d2 = a[2] - b[2];
    return ((d0 * d0) + (d1 * d1) + (d2 * d2));
};

VMath.v3Distance = function v3DistanceFn(a, b)
{
    debug.assert(debug.isVec3(a));
    debug.assert(debug.isVec3(b));

    var d0 = a[0] - b[0];
    var d1 = a[1] - b[1];
    var d2 = a[2] - b[2];
    return Math.sqrt((d0 * d0) + (d1 * d1) + (d2 * d2));
};

VMath.v3Distance2DSq = function v3Distance2DSqFn(a, b)
{
    debug.assert(debug.isVec3(a));
    debug.assert(debug.isVec3(b));

    var d0 = a[0] - b[0];
    var d2 = a[2] - b[2];
    return ((d0 * d0) + (d2 * d2));
};

VMath.v3Distance2D = function v3Distance2DFn(a, b)
{
    debug.assert(debug.isVec3(a));
    debug.assert(debug.isVec3(b));

    var d0 = a[0] - b[0];
    var d2 = a[2] - b[2];
    return Math.sqrt((d0 * d0) + (d2 * d2));
};

VMath.v3GetX = function v3GetXFn(a)
{
    debug.assert(debug.isVec3(a));

    return  a[0];
};

VMath.v3GetY = function v3GetYFn(a)
{
    debug.assert(debug.isVec3(a));

    return  a[1];
};

VMath.v3GetZ = function v3GetZFn(a)
{
    debug.assert(debug.isVec3(a));

    return  a[2];
};

VMath.v3SetX = function v3SetXFn(val, dst)
{
    debug.assert(debug.isNumber(val));
    debug.assert(debug.isVec3(dst));

    dst[0]  =   val;
};

VMath.v3SetY = function v3SetYFn(val, dst)
{
    debug.assert(debug.isNumber(val));
    debug.assert(debug.isVec3(dst));

    dst[1]  =   val;
};

VMath.v3SetZ = function v3SetZFn(val, dst)
{
    debug.assert(debug.isNumber(val));
    debug.assert(debug.isVec3(dst));

    dst[2]  =   val;
};

VMath.v3Length2DSq = function v3Length2DSq(a)
{
    debug.assert(debug.isVec3(a));

    return (a[0] * a[0]) + (a[2] * a[2]);
};

VMath.v3LargestAbs = function v3LargestAbs(a)
{
    debug.assert(debug.isVec3(a));

    return Math.max(Math.abs(a[0]), Math.abs(a[1]), Math.abs(a[2]));
};

VMath.v3Length2D = function v3Length2DSq(a)
{
    debug.assert(debug.isVec3(a));

    return Math.sqrt((a[0] * a[0]) + (a[2] * a[2]));
};

VMath.v3MaxLength = function v3MaxLengthFn(v3, length, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    debug.assert(debug.isVec3(v3));
    debug.assert(debug.isNumber(length));
    debug.assert(debug.isVec3(dst));

    this.v3Copy(v3, dst);
    if (this.v3LengthSq(v3) > length * length)
    {
        this.v3Normalize(dst, dst);
        this.v3ScalarMul(dst, length, dst);
    }

    return  dst;
};

VMath.v3SafeCopy = function vMathv3CopyFn(src, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    if (src === undefined)
    {
        return dst;
    }

    debug.assert(debug.isVec3(src));
    debug.assert(debug.isVec3(dst));

    return this.v3Copy(src, dst);
};

VMath.m43BuildScale = function vMathm43BuildScale(v3Scale, dst)
{
    if (dst === undefined)
    {
        dst = this.m43BuildIdentity();
    }

    debug.assert(debug.isVec3(v3Scale));
    debug.assert(debug.isMtx43(dst));

    dst[0] = v3Scale[0];
    dst[1] = 0.0;
    dst[2] = 0.0;

    dst[3] = 0.0;
    dst[4] = v3Scale[1];
    dst[5] = 0.0;

    dst[6] = 0.0;
    dst[7] = 0.0;
    dst[8] = v3Scale[2];

    dst[9] = 0.0;
    dst[10] = 0.0;
    dst[11] = 0.0;

    return dst;
};

VMath.m43BuildScaleTranslate = function vMathm43BuildScaleTranslate(v3Scale, v3Translate, dst)
{
    if (dst === undefined)
    {
        dst = this.m43BuildIdentity();
    }

    debug.assert(debug.isVec3(v3Scale));
    debug.assert(debug.isVec3(v3Translate));
    debug.assert(debug.isMtx43(dst));

    dst[0] = v3Scale[0];
    dst[1] = 0.0;
    dst[2] = 0.0;

    dst[3] = 0.0;
    dst[4] = v3Scale[1];
    dst[5] = 0.0;

    dst[6] = 0.0;
    dst[7] = 0.0;
    dst[8] = v3Scale[2];

    dst[9] = v3Translate[0];
    dst[10] = v3Translate[1];
    dst[11] = v3Translate[2];

    return dst;
};

VMath.m43Equal = function m43EqualFn(a, b, precision)
{
    var abs = Math.abs;
    if (precision === undefined)
    {
        precision = this.precision;
    }

    debug.assert(debug.isMtx43(a));
    debug.assert(debug.isMtx43(b));
    debug.assert(debug.isNumber(precision));

    return (abs(a[0] - b[0]) <= precision &&
            abs(a[1] - b[1]) <= precision &&
            abs(a[2] - b[2]) <= precision &&
            abs(a[3] - b[3]) <= precision &&
            abs(a[4] - b[4]) <= precision &&
            abs(a[5] - b[5]) <= precision &&
            abs(a[6] - b[6]) <= precision &&
            abs(a[7] - b[7]) <= precision &&
            abs(a[8] - b[8]) <= precision &&
            abs(a[9] - b[9]) <= precision &&
            abs(a[10] - b[10]) <= precision &&
            abs(a[11] - b[11]) <= precision);
};

VMath.m43BuildRotationX = function vMathBuildRotationX(angle, dst)
{
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m43BuildIdentity();
    }

    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isMtx43(dst));

    dst[0] = 1.0;
    dst[1] = 0.0;
    dst[2] = 0.0;

    dst[3] = 0.0;
    dst[4] = c;
    dst[5] = -s;

    dst[6] = 0.0;
    dst[7] = s;
    dst[8] = c;

    dst[9] = 0.0;
    dst[10] = 0.0;
    dst[11] = 0.0;

    return dst;
};

VMath.m43BuildRotationY = function vMathBuildRotationX(angle, dst)
{
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m43BuildIdentity();
    }

    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isMtx43(dst));

    dst[0] = c;
    dst[1] = 0.0;
    dst[2] = s;

    dst[3] = 0.0;
    dst[4] = 1.0;
    dst[5] = 0.0;

    dst[6] = -s;
    dst[7] = 0.0;
    dst[8] = c;

    dst[9] = 0.0;
    dst[10] = 0.0;
    dst[11] = 0.0;

    return dst;
};

VMath.m43BuildRotationZ = function vMathBuildRotationZ(angle, dst)
{
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m43BuildIdentity();
    }

    dst[0] = c;
    dst[1] = s;
    dst[2] = 0.0;

    dst[3] = -s;
    dst[4] = c;
    dst[5] = 0.0;

    dst[6] = 0.0;
    dst[7] = 0.0;
    dst[8] = 1.0;

    dst[9] = 0.0;
    dst[10] = 0.0;
    dst[11] = 0.0;

    return dst;
};

VMath.m33BuildRotationX = function vMathBuildRotationX(angle, dst)
{
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isMtx33(dst));

    dst[0] = 1.0;
    dst[1] = 0.0;
    dst[2] = 0.0;

    dst[3] = 0.0;
    dst[4] = c;
    dst[5] = -s;

    dst[6] = 0.0;
    dst[7] = s;
    dst[8] = c;

    return dst;
};

VMath.m33BuildRotationY = function vMathBuildRotationX(angle, dst)
{
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isMtx33(dst));

    dst[0] = c;
    dst[1] = 0.0;
    dst[2] = s;

    dst[3] = 0.0;
    dst[4] = 1.0;
    dst[5] = 0.0;

    dst[6] = -s;
    dst[7] = 0.0;
    dst[8] = c;

    return dst;
};

VMath.m33BuildRotationZ = function vMathBuildRotationZ(angle, dst)
{
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isMtx33(dst));

    dst[0] = c;
    dst[1] = s;
    dst[2] = 0.0;

    dst[3] = -s;
    dst[4] = c;
    dst[5] = 0.0;

    dst[6] = 0.0;
    dst[7] = 0.0;
    dst[8] = 1.0;

    return dst;
};

VMath.m33RotateX = function vMathM33RotateX(a, angle, dst)
{
    var a0  = a[0];
    var a1  = a[1];
    var a2  = a[2];
    var a3  = a[3];
    var a4  = a[4];
    var a5  = a[5];
    var a6  = a[6];
    var a7  = a[7];
    var a8  = a[8];

    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isMtx33(a));
    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isMtx33(dst));

    dst[0] = a0;
    dst[1] = (c * a1 + s * a2);
    dst[2] = (-s * a1 + c * a2);

    dst[3] = a3;
    dst[4] = (c * a4 + s * a5);
    dst[5] = (-s * a4 + c * a5);

    dst[6] = a6;
    dst[7] = (c * a7 + s * a8);
    dst[8] = (-s * a7 + c * a8);

    return dst;
};

VMath.m33RotateY = function vMathM33RotateY(a, angle, dst)
{
    var a0  = a[0];
    var a1  = a[1];
    var a2  = a[2];
    var a3  = a[3];
    var a4  = a[4];
    var a5  = a[5];
    var a6  = a[6];
    var a7  = a[7];
    var a8  = a[8];

    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isMtx33(a));
    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isMtx33(dst));

    dst[0] = (c * a0 - s * a2);
    dst[1] = a1;
    dst[2] = (s * a0 + c * a2);

    dst[3] = (c * a3 - s * a5);
    dst[4] = a4;
    dst[5] = (s * a3 + c * a5);

    dst[6] = (c * a6 - s * a8);
    dst[7] = a7;
    dst[8] = (s * a6 + c * a8);

    return dst;
};

VMath.m33RotateZ = function vMathM33RotateZ(a, angle, dst)
{
    var a0  = a[0];
    var a1  = a[1];
    var a2  = a[2];
    var a3  = a[3];
    var a4  = a[4];
    var a5  = a[5];
    var a6  = a[6];
    var a7  = a[7];
    var a8  = a[8];

    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isMtx33(a));
    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isMtx33(dst));

    dst[0] = (c * a0 - s * a1);
    dst[1] = (s * a0 + c * a1);
    dst[2] = a2;

    dst[3] = (c * a3 - s * a4);
    dst[4] = (s * a3 + c * a4);
    dst[5] = a5;

    dst[6] = (c * a6 - s * a7);
    dst[7] = (s * a6 + c * a7);
    dst[8] = a8;

    return dst;
};

VMath.xzyAngles = function vmathXZYAngles(m, dst)
{
    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    var eps = 1e-6;
    var x, y, z;
    if (m[1] > -1 + eps && m[1] < 1 - eps)
    {
        z = Math.asin(-m[1]);
        var ic = 1 / Math.cos(z);
        y = Math.atan2(m[2] * ic, m[0] * ic);
        x = Math.atan2(m[7] * ic, m[4] * ic);
    }
    else if (m[1] <= -1 + eps)
    {
        z = Math.PI / 2;
        x = 0;
        y = Math.atan2(m[5], m[3]);
    }
    else
    {
        z = -Math.PI / 2;
        x = 0;
        y = Math.atan2(-m[5], -m[3]);
    }

    dst[0] = x;
    dst[1] = y;
    dst[2] = z;

    return dst;
};

// compute new orientation based on application of angular velocities 'w' with time step t.
VMath.m33Integrate = function vmathM33Integrate(m, w, t, dst)
{
    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    var a0 = m[0];
    var a1 = m[1];
    var a2 = m[2];
    var a3 = m[3];
    var a4 = m[4];
    var a5 = m[5];
    var a6 = m[6];
    var a7 = m[7];
    var a8 = m[8];

    var w0 = w[0] * t;
    var w1 = w[1] * t;
    var w2 = w[2] * t;

    dst[0] = a0 - (w2 * a1) + (w1 * a2);
    dst[1] = a1 + (w2 * a0) - (w0 * a2);
    dst[2] = a2 - (w1 * a0) + (w0 * a1);
    dst[3] = a3 - (w2 * a4) + (w1 * a5);
    dst[4] = a4 + (w2 * a3) - (w0 * a5);
    dst[5] = a5 - (w1 * a3) + (w0 * a4);
    dst[6] = a6 - (w2 * a7) + (w1 * a8);
    dst[7] = a7 + (w2 * a6) - (w0 * a8);
    dst[8] = a8 - (w1 * a6) + (w0 * a7);

    return this.m33Orthonormalize(dst, dst);
};

VMath.m33BuildRotationXZY = function vMathm33BuildRotationXZY(v3Rotation, dst)
{
    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isVec3(v3Rotation));
    debug.assert(debug.isMtx33(dst));

    var sx = Math.sin(v3Rotation[0]);
    var sy = Math.sin(v3Rotation[1]);
    var sz = Math.sin(v3Rotation[2]);

    var cx = Math.cos(v3Rotation[0]);
    var cy = Math.cos(v3Rotation[1]);
    var cz = Math.cos(v3Rotation[2]);

    //{
    //  Cos[Ry] Cos[Rz],
    //  -Sin[Rz],
    //  Cos[Rz] Sin[Ry]
    //},
    dst[0]  = cy * cz;
    dst[1]  = -sz;
    dst[2]  = cz * sy;

    //{
    //  Sin[Rx] Sin[Ry] + Cos[Rx] Cos[Ry] Sin[Rz],
    //  Cos[Rx] Cos[Rz],
    //  -Cos[Ry] Sin[Rx] + Cos[Rx] Sin[Ry] Sin[Rz]
    //},
    dst[3]  = sx * sy + cx * cy * sz;
    dst[4]  = cx * cz;
    dst[5]  = -cy * sx + cx * sy * sz;

    //{
    //  -Cos[Rx] Sin[Ry] + Cos[Ry] Sin[Rx] Sin[Rz],
    //  Cos[Rz] Sin[Rx],
    //  Cos[Rx] Cos[Ry] + Sin[Rx] Sin[Ry] Sin[Rz]
    //}
    dst[6]  = -cx * sy + cy * sx * sz;
    dst[7]  = cz * sx;
    dst[8]  = cx * cy + sx * sy * sz;

    return dst;

    // {
    //     {Cos[Ry] Cos[Rz], -Sin[Rz], Cos[Rz] Sin[Ry]},
    //     {Sin[Rx] Sin[Ry] + Cos[Rx] Cos[Ry] Sin[Rz], Cos[Rx] Cos[Rz], -Cos[Ry] Sin[Rx] + Cos[Rx] Sin[Ry] Sin[Rz]},
    //     {-Cos[Rx] Sin[Ry] + Cos[Ry] Sin[Rx] Sin[Rz], Cos[Rz] Sin[Rx], Cos[Rx] Cos[Ry] + Sin[Rx] Sin[Ry] Sin[Rz]}
    // }
};

VMath.m43BuildRotationXZY = function vMathm43BuildRotationXZY(v3Rotation, dst)
{
    if (dst === undefined)
    {
        dst = this.m43BuildIdentity();
    }

    debug.assert(debug.isVec3(v3Rotation));
    debug.assert(debug.isMtx43(dst));

    var sx = Math.sin(v3Rotation[0]);
    var sy = Math.sin(v3Rotation[1]);
    var sz = Math.sin(v3Rotation[2]);

    var cx = Math.cos(v3Rotation[0]);
    var cy = Math.cos(v3Rotation[1]);
    var cz = Math.cos(v3Rotation[2]);

    //{
    //  Cos[Ry] Cos[Rz],
    //  -Sin[Rz],
    //  Cos[Rz] Sin[Ry]
    //},
    dst[0]  = cy * cz;
    dst[1]  = -sz;
    dst[2]  = cz * sy;

    //{
    //  Sin[Rx] Sin[Ry] + Cos[Rx] Cos[Ry] Sin[Rz],
    //  Cos[Rx] Cos[Rz],
    //  -Cos[Ry] Sin[Rx] + Cos[Rx] Sin[Ry] Sin[Rz]
    //},
    dst[3]  = sx * sy + cx * cy * sz;
    dst[4]  = cx * cz;
    dst[5]  = -cy * sx + cx * sy * sz;

    //{
    //  -Cos[Rx] Sin[Ry] + Cos[Ry] Sin[Rx] Sin[Rz],
    //  Cos[Rz] Sin[Rx],
    //  Cos[Rx] Cos[Ry] + Sin[Rx] Sin[Ry] Sin[Rz]
    //}
    dst[6]  = -cx * sy + cy * sx * sz;
    dst[7]  = cz * sx;
    dst[8]  = cx * cy + sx * sy * sz;

    dst[9]  = 0.0;
    dst[10] = 0.0;
    dst[11] = 0.0;

    return dst;

    // {
    //     {Cos[Ry] Cos[Rz], -Sin[Rz], Cos[Rz] Sin[Ry]},
    //     {Sin[Rx] Sin[Ry] + Cos[Rx] Cos[Ry] Sin[Rz], Cos[Rx] Cos[Rz], -Cos[Ry] Sin[Rx] + Cos[Rx] Sin[Ry] Sin[Rz]},
    //     {-Cos[Rx] Sin[Ry] + Cos[Ry] Sin[Rx] Sin[Rz], Cos[Rz] Sin[Rx], Cos[Rx] Cos[Ry] + Sin[Rx] Sin[Ry] Sin[Rz]}
    // }
};

VMath.v3GetMax = function vMathv3GetMax(v3Max)
{
    debug.assert(debug.isVec3(v3Max));

    if (v3Max[0] > v3Max[1])
    {
        if (v3Max[0] > v3Max[2])
        {
            return  v3Max[0];
        }
        return  v3Max[2];
    }

    if (v3Max[1] > v3Max[2])
    {
        return  v3Max[1];
    }
    return  v3Max[2];
};

VMath.v3IsZero = function vMathv3IsZero(v3)
{
    debug.assert(debug.isVec3(v3));

    return ! (v3[0] !== 0.0 ||
              v3[1] !== 0.0 ||
              v3[2] !== 0.0);
};

VMath.aabbBuildFromCentreHalfExtents = function vMathAABBBuildFromCentreHalfExtentsFn(v3Centre, v3HalfExtents, dst)
{
    if (dst === undefined)
    {
        dst = this.aabbBuildEmpty();
    }

    debug.assert(debug.isVec3(v3Centre));
    debug.assert(debug.isVec3(v3HalfExtents));
    debug.assert(debug.isAABB(dst));

    var absv3HalfExtents    =   this.v3Abs(v3HalfExtents);
    return  this.aabbBuild(v3Centre[0] - absv3HalfExtents[0],
                            v3Centre[1] - absv3HalfExtents[1],
                            v3Centre[2] - absv3HalfExtents[2],
                            v3Centre[0] + absv3HalfExtents[0],
                            v3Centre[1] + absv3HalfExtents[1],
                            v3Centre[2] + absv3HalfExtents[2], dst);
};

VMath.aabbBuildFromCentreRadius = function vMathAABBBuildFromCentreRadiusFn(v3Centre, radius, dst)
{
    if (dst === undefined)
    {
        dst = this.aabbBuildEmpty();
    }

    debug.assert(debug.isVec3(v3Centre));
    debug.assert(debug.isNumber(radius));
    debug.assert(debug.isAABB(dst));

    return  this.aabbBuild(v3Centre[0] - radius,
                            v3Centre[1] - radius,
                            v3Centre[2] - radius,
                            v3Centre[0] + radius,
                            v3Centre[1] + radius,
                            v3Centre[2] + radius, dst);
};

VMath.aabbBuildFromMinAndMax = function vMathAABBBuildFromMinAndMaxFn(v3Min, v3Max, dst)
{
    if (dst === undefined)
    {
        dst = this.aabbBuildEmpty();
    }

    debug.assert(debug.isVec3(v3Min));
    debug.assert(debug.isVec3(v3Max));
    debug.assert(debug.isAABB(dst));

    return  this.aabbBuild(v3Min[0],
                            v3Min[1],
                            v3Min[2],
                            v3Max[0],
                            v3Max[1],
                            v3Max[2], dst);
};

VMath.aabbEnclosesPoint = function vMathAABBEnclosesv3Point(aabb, v3point)
{
    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isVec3(v3point));

    var x   =   v3point[0];
    var y   =   v3point[1];
    var z   =   v3point[2];

    return  (aabb[0] <= x &&
             aabb[1] <= y &&
             aabb[2] <= z &&
             aabb[3] >= x &&
             aabb[4] >= y &&
             aabb[5] >= z);
};

VMath.aabbClampv3 = function aabbClampv3(aabb, v3point, dst)
{
    var x   =   v3point[0];
    var y   =   v3point[1];
    var z   =   v3point[2];

    if (dst === undefined)
    {
        dst = this.v3BuildZero();
    }

    x   =   Math.max(x, aabb[0]);
    y   =   Math.max(y, aabb[1]);
    z   =   Math.max(z, aabb[2]);
    x   =   Math.min(x, aabb[3]);
    y   =   Math.min(y, aabb[4]);
    z   =   Math.min(z, aabb[5]);

    dst[0]   =   x;
    dst[1]   =   y;
    dst[2]   =   z;

    return  dst;
};

VMath.aabbMove = function vMathAABBEnclosesv3Point(aabb, v3point)
{
    debug.assert(debug.isAABB(aabb));
    debug.assert(debug.isVec3(v3point));

    var x   =   v3point[0];
    var y   =   v3point[1];
    var z   =   v3point[2];

    aabb[0] += x;
    aabb[1] += y;
    aabb[2] += z;
    aabb[3] += x;
    aabb[4] += y;
    aabb[5] += z;

    return  aabb;
};

VMath.aabbMergeable = function aabbMergeableFn(aabbA, aabbB)
{
    debug.assert(debug.isAABB(aabbA));
    debug.assert(debug.isAABB(aabbB));

    // var minX = aabb[0];
    // var minY = aabb[1];
    // var minZ = aabb[2];
    // var maxX = aabb[3];
    // var maxY = aabb[4];
    // var maxZ = aabb[5];

    var a0 = aabbA[0];
    var a1 = aabbA[1];
    var a2 = aabbA[2];
    var a3 = aabbA[3];
    var a4 = aabbA[4];
    var a5 = aabbA[5];

    var b0 = aabbB[0];
    var b1 = aabbB[1];
    var b2 = aabbB[2];
    var b3 = aabbB[3];
    var b4 = aabbB[4];
    var b5 = aabbB[5];

    if (a0 === b3 || b0 === a3)
    {
        if (a1 === b1 &&
            a2 === b2 &&
            a4 === b4 &&
            a5 === b5)
        {
            return  true;
        }
    }
    if (a1 === b4 || b1 === a4)
    {
        if (a0 === b0 &&
            a2 === b2 &&
            a3 === b3 &&
            a5 === b5)
        {
            return  true;
        }
    }
    if (a2 === b5 || b2 === a5)
    {
        if (a0 === b0 &&
            a1 === b1 &&
            a3 === b3 &&
            a4 === b4)
        {
            return  true;
        }
    }
    return  false;
};

VMath.m43BuildRotationZ = function vMathBuildRotationX(angle, dst)
{
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    if (dst === undefined)
    {
        dst = this.m43BuildIdentity();
    }

    debug.assert(debug.isNumber(angle));
    debug.assert(debug.isMtx43(dst));

    dst[0] = c;
    dst[1] = -s;
    dst[2] = 0.0;

    dst[3] = s;
    dst[4] = c;
    dst[5] = 0.0;

    dst[6] = 0.0;
    dst[7] = 0.0;
    dst[8] = 1.0;

    dst[9] = 0.0;
    dst[10] = 0.0;
    dst[11] = 0.0;

    return dst;
};

VMath.m44Equal = function m44EqualFn(a, b, precision)
{
    var abs = Math.abs;
    if (precision === undefined)
    {
        precision = this.precision;
    }

    debug.assert(debug.isMtx44(a));
    debug.assert(debug.isMtx44(b));
    debug.assert(debug.isNumber(precision));

    return (abs(a[0]  - b[0])  <= precision &&
            abs(a[1]  - b[1])  <= precision &&
            abs(a[2]  - b[2])  <= precision &&
            abs(a[3]  - b[3])  <= precision &&
            abs(a[4]  - b[4])  <= precision &&
            abs(a[5]  - b[5])  <= precision &&
            abs(a[6]  - b[6])  <= precision &&
            abs(a[7]  - b[7])  <= precision &&
            abs(a[8]  - b[8])  <= precision &&
            abs(a[9]  - b[9])  <= precision &&
            abs(a[10] - b[10]) <= precision &&
            abs(a[11] - b[11]) <= precision &&
            abs(a[12] - b[12]) <= precision &&
            abs(a[13] - b[13]) <= precision &&
            abs(a[14] - b[14]) <= precision &&
            abs(a[15] - b[15]) <= precision);
};

VMath.m43FromM33V3 = function m43FromM33V3Fn(m, v, dst)
{
    if (dst === undefined)
    {
        dst = this.m43BuildIdentity();
    }

    debug.assert(debug.isMtx33(m));
    debug.assert(debug.isVec3(v));
    debug.assert(debug.isMtx43(dst));

    dst[0] = m[0];
    dst[1] = m[1];
    dst[2] = m[2];
    dst[3] = m[3];
    dst[4] = m[4];
    dst[5] = m[5];
    dst[6] = m[6];
    dst[7] = m[7];
    dst[8] = m[8];
    dst[9] = v[0];
    dst[10] = v[1];
    dst[11] = v[2];

    return  dst;
};

VMath.m33FromM43 = function m33FromM43Fn(m, dst)
{
    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isMtx43(m));
    debug.assert(debug.isMtx33(dst));

    dst[0] = m[0];
    dst[1] = m[1];
    dst[2] = m[2];
    dst[3] = m[3];
    dst[4] = m[4];
    dst[5] = m[5];
    dst[6] = m[6];
    dst[7] = m[7];
    dst[8] = m[8];

    return  dst;
};

// Modified gram schmidt orthonormalization (from webgl physicsdevice)
VMath.m33Orthonormalize = function vmathM33Orthonormalize(m, dst)
{
    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isMtx33(m));
    debug.assert(debug.isMtx33(dst));

    var B0 = m[0];
    var B1 = m[1];
    var B2 = m[2];
    var B3 = m[3];
    var B4 = m[4];
    var B5 = m[5];
    var B6 = m[6];
    var B7 = m[7];
    var B8 = m[8];

    var scale;
    var sqrt = Math.sqrt;
    scale = 1 / sqrt((B0 * B0) + (B1 * B1) + (B2 * B2));
    B0 *= scale;
    B1 *= scale;
    B2 *= scale;

    scale = -((B0 * B3) + (B1 * B4) + (B2 * B5));
    B3 += B0 * scale;
    B4 += B1 * scale;
    B5 += B2 * scale;

    scale = 1 / sqrt((B3 * B3) + (B4 * B4) + (B5 * B5));
    B3 *= scale;
    B4 *= scale;
    B5 *= scale;

    scale = -((B0 * B6) + (B1 * B7) + (B2 * B8));
    B6 += B0 * scale;
    B7 += B1 * scale;
    B8 += B2 * scale;

    scale = -((B3 * B6) + (B4 * B7) + (B5 * B8));
    B6 += B3 * scale;
    B7 += B4 * scale;
    B8 += B5 * scale;

    scale = 1 / sqrt((B6 * B6) + (B7 * B7) + (B8 * B8));
    B6 *= scale;
    B7 *= scale;
    B8 *= scale;

    dst[0] = B0;
    dst[1] = B1;
    dst[2] = B2;
    dst[3] = B3;
    dst[4] = B4;
    dst[5] = B5;
    dst[6] = B6;
    dst[7] = B7;
    dst[8] = B8;

    return dst;
};

// Rotate matrix about its own x-axis
VMath.m33RotateSelfX = function vmathM33RotateSelfX(m, angle, dst)
{
    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isMtx33(m));
    debug.assert(debug.isMtx33(dst));

    var axis  = this.scratchpad.axis = this.v3Build(m[0], m[1], m[2], this.scratchpad.axis);
    var xform = this.scratchpad.xform = this.m33FromAxisRotation(axis, angle, this.scratchpad.xform);
    this.m33Mul(m, xform, dst);

    return dst;
};

// Rotate matrix about its own y-axis
VMath.m33RotateSelfY = function vmathM33RotateSelfY(m, angle, dst)
{
    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isMtx33(m));
    debug.assert(debug.isMtx33(dst));

    var axis  = this.scratchpad.axis = this.v3Build(m[3], m[4], m[5], this.scratchpad.axis);
    var xform = this.scratchpad.xform = this.m33FromAxisRotation(axis, angle, this.scratchpad.xform);
    this.m33Mul(m, xform, dst);

    return dst;
};

// Rotate matrix about its own z-axis
VMath.m33RotateSelfZ = function vmathM33RotateSelfZ(m, angle, dst)
{
    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isMtx33(m));
    debug.assert(debug.isMtx33(dst));

    var axis  = this.scratchpad.axis = this.v3Build(m[6], m[7], m[8], this.scratchpad.axis);
    var xform = this.scratchpad.xform = this.m33FromAxisRotation(axis, angle, this.scratchpad.xform);
    this.m33Mul(m, xform, dst);

    return dst;
};

VMath.quatFromM33 = function vmathQuatFromM33(m, dst)
{
    debug.assert(debug.isMtx33(m));

    var m0 = m[0];
    var m1 = m[1];
    var m2 = m[2];
    var m3 = m[3];
    var m4 = m[4];
    var m5 = m[5];
    var m6 = m[6];
    var m7 = m[7];
    var m8 = m[8];

    var x, y, z, w, s;
    var trace = m0 + m4 + m8 + 1;
    if (trace > this.precision)
    {
        w = Math.sqrt(trace) / 2;
        x = (m5 - m7) / (4 * w);
        y = (m6 - m2) / (4 * w);
        z = (m1 - m3) / (4 * w);
    }
    else
    {
        if ((m0 > m4) && (m0 > m8))
        {
            s = Math.sqrt(1.0 + m0 - m4 - m8) * 2; // S=4*qx
            w = (m5 - m7) / s;
            x = 0.25 * s;
            y = (m3 + m1) / s;
            z = (m6 + m2) / s;
        }
        else if (m4 > m8)
        {
            s = Math.sqrt(1.0 + m4 - m0 - m8) * 2; // S=4*qy
            w = (m6 - m2) / s;
            x = (m3 + m1) / s;
            y = 0.25 * s;
            z = (m7 + m5) / s;
        }
        else
        {
            s = Math.sqrt(1.0 + m8 - m0 - m4) * 2; // S=4*qz
            w = (m1 - m3) / s;
            x = (m6 + m2) / s;
            y = (m7 + m5) / s;
            z = 0.25 * s;
        }
    }

    if (!dst)
    {
        dst = VMath.v4BuildZero();
    }

    dst[0] = x;
    dst[1] = y;
    dst[2] = z;
    dst[3] = w;
    this.quatNormalize(dst, dst);
    this.quatConjugate(dst, dst);
    return dst;
};

VMath.m33Slerp = function vmathM33Slerp(a, b, delta, dst)
{
    if (dst === undefined)
    {
        dst = this.m33BuildIdentity();
    }

    debug.assert(debug.isMtx33(a));
    debug.assert(debug.isMtx33(b));
    debug.assert(debug.isMtx33(dst));

    var qa = this.quatFromM33(a, this.scratchpad.quat1);
    var qb = this.quatFromM33(b, this.scratchpad.quat2);
    this.quatSlerp(qa, qb, delta, qb);

    return this.m33FromQuat(qb, dst);
};

VMath.randomIntInRange = function vMathRandomIntInRange(min, max)
{
    debug.assert(debug.isNumber(min));
    debug.assert(debug.isNumber(max));

    return (Math.floor(Math.random() * (max - min + 1)) + min);
};

VMath.randomInRange = function vMathRandomInRange(min, max)
{
    debug.assert(debug.isNumber(min));
    debug.assert(debug.isNumber(max));

    return ((Math.random() * (max - min)) + min);
};

VMath.isMathArray = function isMathArrayFn(a)
{
    if (!(a instanceof Array))
    {
        return false;
    }

    var l = a.length;
    if (l > 16)
    {
        return false;
    }

    var i;
    for (i = 0 ; i < l ; i += 1)
    {
        if ('number' !== typeof a[i])
        {
            return false;
        }
    }
    return true;
};

VMath.copyAndConvertMathTypes = function copyAndConvertMathTypesFn(obj)
{
    if ('object' !== typeof obj) { return obj; }

    var v;
    for (var k in obj)
    {
        if ('__proto__' !== k && obj.hasOwnProperty(k))
        {
            v = obj[k];
            if (this.isMathArray(v))
            {
                obj[k] = new Float32Array(v);
                continue;
            }

            obj[k] = this.copyAndConvertMathTypes(v);
        }
    }

    return obj;
};

VMath.applyPatches = function vMathApplyPatches(mathDevice)
{
    var property;
    for (property in VMath)
    {
        if (VMath.hasOwnProperty(property) &&
            !mathDevice.hasOwnProperty(property))
        {
            mathDevice[property] = VMath[property];
        }
    }
};

//
//  Camera Helpers.
//

Camera.prototype.scratchpad = {};

Camera.prototype.setFOV = function cameraSetFOVFn(fov)
{
    debug.assert(debug.isNumber(fov));

    this.recipViewWindowX = 1.0 / Math.tan(fov * 0.5);
    this.recipViewWindowY = this.recipViewWindowX;

    if (fov !== this.fov)
    {
        this.updateProjectionMatrix();
    }
    this.fov = fov;
};

Camera.prototype.getFOV = function cameraGetFOVFn()
{
    if (this.fov !== undefined)
    {
        return this.fov;
    }

    this.fov    =   Math.atan(1.0 / this.recipViewWindowX) * 2.0;
    return this.fov;
};

Camera.prototype.extractSmallestFOV = function cameraExtractSmallestFOVFn()
{
    if (this.recipViewWindowY * this.aspectRatio > this.recipViewWindowX)
    {
        return Math.atan(1.0 / (this.recipViewWindowY * this.aspectRatio)) * 2.0;
    }
    return  this.getFOV();
};

Camera.prototype.setGlobals = function cameraSetGlobalsFn(globals)
{
    this.globals    =   globals;
};

Camera.prototype.normalisedToScreen = function cameraNormalisedToScreen(vec2NormalisedCoord, dst)
{
    debug.assert(debug.isVec2(vec2NormalisedCoord));

    var gd = this.globals.graphicsDevice;
    var screenWidth = gd.width;
    var screenHeight = gd.height;

    return this.md.v2Build(vec2NormalisedCoord[0] * screenWidth, vec2NormalisedCoord[1] * screenHeight, dst);
};

Camera.prototype.screenToNormalised = function cameraScreenToNormalised(vec2ScreenCoord, dst)
{
    debug.assert(debug.isVec2(vec2ScreenCoord));

    var gd = this.globals.graphicsDevice;
    var screenWidth = gd.width;
    var screenHeight = gd.height;

    return this.md.v2Build(vec2ScreenCoord[0] / screenWidth, vec2ScreenCoord[1] / screenHeight, dst);
};

Camera.prototype.screenRadiusToWorldRadius = function cameraScreenRadiusToWorldRadius(v3Location, pixels)
{
    debug.assert(debug.isVec3(v3Location));
    debug.assert(debug.isNumber(pixels));

    //Distance to location.
    var md              =   this.md;
    var gd              =   this.globals.graphicsDevice;
    var screenWidth     =   gd.width;

    var fov             =   this.getFOV();

    var worldLocation   =   md.m43Pos(this.matrix);

    var distance        =   md.v3Distance(v3Location, worldLocation);

    //Angle described by pixels.
    var angle           =   fov * pixels / screenWidth;

    //Radius = sin(angle) * distance

    return  Math.sin(angle) * distance;
};

Camera.prototype.getv3Location = function cameraGetv3Location()
{
    var md              =   this.md;
    var worldLocation   =   md.m43Pos(this.matrix);

    return  worldLocation;
    //return  md.v3Copy(worldLocation);
};

Camera.prototype.getv3Forward = function cameraGetv3Forward()
{
    var md   =   this.md;
    var at   =   md.m43At(this.matrix);

    return  md.v3Neg(at);
};

Camera.prototype.screenToWorld = function cameraScreenToWorld(x, y, distance, dst)
{
    debug.assert(debug.isNumber(x));
    debug.assert(debug.isNumber(y));
    debug.assert(debug.isNumber(distance));

    var scratchpad = Camera.prototype.scratchpad;
    var md = this.md;

    var vec2Norm = scratchpad.v2Norm = md.v2Build(x, y, scratchpad.v2Norm);
    vec2Norm = this.screenToNormalised(vec2Norm, vec2Norm);

    var v4Norm = scratchpad.v4Norm = md.v4Build((2.0 * vec2Norm[0]) - 1.0, 1.0 - (2.0 * vec2Norm[1]), -1.0, 1.0,
                                                scratchpad.v4Norm);

    if (!this.prevViewProjectionMatrix || !md.m44Equal(this.prevViewProjectionMatrix, this.viewProjectionMatrix))
    {
        this.invViewProjectionMatrix    = md.m44Inverse(this.viewProjectionMatrix, this.invViewProjectionMatrix);
        this.prevViewProjectionMatrix   = md.m44Copy(this.viewProjectionMatrix, this.prevViewProjectionMatrix);
    }

    if (this.invViewProjectionMatrix.length > 0)
    {
        var v4World = scratchpad.v4World = md.m44Transform(this.invViewProjectionMatrix, v4Norm, scratchpad.v4World);
        var v3World = scratchpad.v3World = md.v3Build(v4World[0], v4World[1], v4World[2], scratchpad.v3World);
        md.v3ScalarMul(v3World, (1 / v4World[3]), v3World);
        var v3Pos = scratchpad.v3Pos = md.m43Pos(this.matrix, scratchpad.v3Pos);
        var camToWorld = md.v3Sub(v3World, v3Pos, v3Pos);
        md.v3Normalize(camToWorld, camToWorld);
        var newWorldLocation = md.v3AddScalarMul(v3World, camToWorld, distance, dst);

        return newWorldLocation;
    }

    return  null;
};

Camera.prototype.worldToScreen = function cameraWorldToScreen(v3World, dst)
{
    debug.assert(debug.isVec3(v3World));
    var scratchpad = Camera.prototype.scratchpad;
    var md = this.md;

    var viewProjectionMatrix = this.viewProjectionMatrix;
    var v4World = scratchpad.v4World = md.v4Build(v3World[0], v3World[1], v3World[2], 1.0, scratchpad.v4World);
    var v4Norm = scratchpad.v4Norm = md.m44Transform(viewProjectionMatrix, v4World, scratchpad.v4Norm);

    if (v4Norm[3] === 0.0)
    {
        return;
    }

    v4Norm[0] /= v4Norm[3];
    v4Norm[1] /= v4Norm[3];
    v4Norm[2] /= v4Norm[3];

    if (v4Norm[3] < 0.0)
    {
        return undefined;
    }

    var vec2Norm = md.v2Build((v4Norm[0] + 1.0) * 0.5, (-v4Norm[1] + 1.0) * 0.5, dst);
    var vec2Screen = this.normalisedToScreen(vec2Norm, vec2Norm);

    return vec2Screen;
};
