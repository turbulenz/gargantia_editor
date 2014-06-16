/*global FastMath: false*/

function Collisions(globals) {
    this.globals = globals;
    this.scratchpad = {
        v0: globals.mathDevice.v3BuildZero()
    };
}

Collisions.prototype.thermalLift = function thermalLiftFn(object, thermals)
{
    var pos = object.position;
    var vel = object.velocity;

    var lift = this.scratchpad.v0;
    lift[0] = 0;
    lift[1] = 0;
    lift[2] = 0;

    var thermalCount = thermals.length;
    var i, xz, yy;
    for (i = 0; i < thermalCount; i += 1)
    {
        var thermal = thermals[i].getEC("ECThermals");
        var loc = thermal.loc;
        var invHalfSize = thermal.invHalfSize;

        var xi = (pos[0] - loc[0]) * invHalfSize[0];
        var xj = (pos[1] - loc[1]) * invHalfSize[1];
        var xk = (pos[2] - loc[2]) * invHalfSize[2];
        var M = thermal.m33Direction;
        if (thermal.direction !== "y+")
        {
            var x = M[0] * xi + M[3] * xj + M[6] * xk;
            var y = M[1] * xi + M[4] * xj + M[7] * xk;
            var z = M[2] * xi + M[5] * xj + M[8] * xk;
            xz = (x * x) + (z * z);
            yy = y * y;
        }
        else
        {
            xz = (xi * xi) + (xk * xk);
            yy = xj * xj;
        }
        if (xz < 1 && yy < 1)
        {
            var strength = (1 + FastMath.cos(yy * Math.PI)) * (1 + FastMath.cos(xz * Math.PI)) * 0.25;
            var lstrength = strength;
            var vproj = vel[0] * M[3] + vel[1] * M[4] + vel[2] * M[5];
            if (vproj > thermal.strength)
            {
                strength = 0;
            }
            else
            {
                strength *= thermal.strength * Math.exp(-1 / (0.1 + thermal.strength - vproj));
            }
            lift[0] += M[3] * strength;
            lift[1] += M[4] * strength;
            lift[2] += M[5] * strength;
            if (thermal.turbulenz !== 0)
            {
                var direction = this.turbulenzDirection(object, thermal);
                var tstrength = lstrength * thermal.turbulenz * 0.5;
                lift[0] += direction[0] * tstrength;
                lift[1] += direction[1] * tstrength;
                lift[2] += direction[2] * tstrength;
            }
        }
    }

    return lift;
};

Collisions.prototype.turbulenzDirection = function turbulenzDirectionFn(object, thermal)
{
    var map = object.turbulenzMap = (object.turbulenzMap || {});
    var direction = map[thermal.id];
    if (!direction)
    {
        direction = this.globals.mathDevice.v3Build((Math.random() * 2 - 1), (Math.random() * 2 - 1), (Math.random() * 2 - 1));
        map[thermal.id] = direction;
    }
    direction[0] = (direction[0] + (Math.random() * 2 - 1) * 0.25) % 1.0;
    direction[1] = (direction[1] + (Math.random() * 2 - 1) * 0.25) % 1.0;
    direction[2] = (direction[2] + (Math.random() * 2 - 1) * 0.25) % 1.0;
    return direction;
};

Collisions.prototype.birdThermalLift = function thermalLiftFn(object, thermals, scale)
{
    var pos = object.position;
    var vel = object.velocity;
    var accel = object.acceleration;

    var ss = (scale * 2 - 1);

    var thermalCount = thermals.length;
    var i, xz, yy;
    for (i = 0; i < thermalCount; i += 1)
    {
        var thermal = thermals[i].getEC("ECThermals");
        var loc = thermal.loc;
        var invHalfSize = thermal.invHalfSize;

        var xi = (pos[0] - loc[0]) * invHalfSize[0];
        var xj = (pos[1] - loc[1]) * invHalfSize[1];
        var xk = (pos[2] - loc[2]) * invHalfSize[2];
        var M = thermal.m33Direction;
        if (thermal.direction !== "y+")
        {
            var x = M[0] * xi + M[3] * xj + M[6] * xk;
            var y = M[1] * xi + M[4] * xj + M[7] * xk;
            var z = M[2] * xi + M[5] * xj + M[8] * xk;
            xz = (x * x) + (z * z);
            yy = y * y;
        }
        else
        {
            xz = (xi * xi) + (xk * xk);
            yy = xj * xj;
        }
        if (xz < 1 && yy < 1)
        {
            var strength = (1 + FastMath.cos(yy * Math.PI)) * (1 + FastMath.cos(xz * Math.PI)) * 0.25 * scale;
            var lstrength;
            var vproj = vel[0] * M[3] + vel[1] * M[4] + vel[2] * M[5];
            if (vproj > thermal.strength)
            {
                lstrength = 0;
            }
            else
            {
                lstrength = strength * Math.exp(-1 / (0.1 + thermal.strength - vproj));
            }
            var lift = lstrength * thermal.strength * 100 * ss;
            accel[0] += M[3] * lift;
            accel[1] += M[4] * lift;
            accel[2] += M[5] * lift;
            // only spiral in actual thermals.
            if (thermal.direction === "y+" && thermal.strength !== 0)
            {
                var pull = strength * thermal.strength * ss / ((1 + xz) * 20);
                accel[0] += (loc[0] - pos[0]) * pull;
                accel[2] += (loc[2] - pos[2]) * pull;
            }
            if (thermal.turbulenz !== 0)
            {
                var direction = this.turbulenzDirection(object, thermal);
                var tstrength = strength * 25 * thermal.turbulenz * ss;
                accel[0] += direction[0] * tstrength;
                accel[1] += direction[1] * tstrength;
                accel[2] += direction[2] * tstrength;
            }
        }
    }
};

Collisions.prototype.collideWithBlocks = function collideWithBlocksFn(object, blocks, collisionRadius, realCollisionRadius, reboundAcceleration)
{
    var md = this.globals.mathDevice;
    var pos = object.position;
    var vel = object.velocity;
    var accel = object.acceleration;

    var collidedCount = 0;

    var blockCount = blocks.length;
    var i;
    for (i = 0; i < blockCount; i += 1)
    {
        var block = blocks[i];
        if (!block.cube || !block.cube.block)
        {
            continue;
        }
        block = block.cube.block;

        var loc   = block.v3Location;
        var rot   = block.v3Rotation;
        var scale = block.v3Scale;
        var s0_2 = scale[0] * 0.5;
        var s1_2 = scale[1] * 0.5;
        var s2_2 = scale[2] * 0.5;

        // offset block location to get centre (TODO, not generic)
        var locx = loc[0];
        var locy = loc[1] + s1_2;
        var locz = loc[2];

        if (!block.m33Rotation)
        {
            if (rot[0] !== 0.0 ||
                rot[1] !== 0.0 ||
                rot[2] !== 0.0)
            {
                block.m33Rotation = md.m33BuildRotationXZY(rot);
                block.invM33Rotation = md.m33Inverse(block.m33Rotation);
            }
            else
            {
                // Just to make the objects look the same
                block.m33Rotation = undefined;
                block.invM33Rotation = undefined;
            }
        }
        var m33Rotation = block.m33Rotation;
        var invM33Rotation = block.invM33Rotation;
        var M;

        // compute local position of object w.r.t. block centre
        var x = pos[0] - locx;
        var y = pos[1] - locy;
        var z = pos[2] - locz;
        var localx, localy, localz;
        if (invM33Rotation)
        {
            M = invM33Rotation;
            localx = (x * M[0]) + (y * M[3]) + (z * M[6]);
            localy = (x * M[1]) + (y * M[4]) + (z * M[7]);
            localz = (x * M[2]) + (y * M[5]) + (z * M[8]);
        }
        else
        {
            localx = x;
            localy = y;
            localz = z;
        }

        // compute local contact point on block
        var contactx = (localx < -s0_2) ? -s0_2 : (localx > s0_2) ? s0_2 : localx;
        var contacty = (localy < -s1_2) ? -s1_2 : (localy > s1_2) ? s1_2 : localy;
        var contactz = (localz < -s2_2) ? -s2_2 : (localz > s2_2) ? s2_2 : localz;

        // compute world displacement vector from block to object.
        x = localx - contactx;
        y = localy - contacty;
        z = localz - contactz;
        var deltax, deltay, deltaz;
        if (m33Rotation)
        {
            M = m33Rotation;
            deltax = (x * M[0]) + (y * M[3]) + (z * M[6]);
            deltay = (x * M[1]) + (y * M[4]) + (z * M[7]);
            deltaz = (x * M[2]) + (y * M[5]) + (z * M[8]);
        }
        else
        {
            deltax = x;
            deltay = y;
            deltaz = z;
        }

        // normalize for world normal.
        var delta = Math.sqrt((deltax * deltax) + (deltay * deltay) + (deltaz * deltaz));
        var idelta;
        if (delta === 0.0)
        {
            deltax = 1.0;
            idelta = 1.0;
        }
        else
        {
            idelta = 1 / delta;
            deltax *= idelta;
            deltay *= idelta;
            deltaz *= idelta;
        }

        var proj = (vel[0] * deltax) + (vel[1] * deltay) + (vel[2] * deltaz);
        var sep;
        if (delta < realCollisionRadius)
        {
            sep = realCollisionRadius - delta;

            pos[0] += deltax * sep;
            pos[1] += deltay * sep;
            pos[2] += deltaz * sep;

            vel[0] -= deltax * proj;
            vel[1] -= deltay * proj;
            vel[2] -= deltaz * proj;

            if (!block.collided)
            {
                collidedCount += 1;
                block.collided = true;
            }
        }
        else if (delta < collisionRadius)
        {
            block.collided = false;
            sep = collisionRadius - delta;

            // compute normalized projected velocity onto normal's plane
            var vpx = vel[0] - (deltax * proj);
            var vpy = vel[1] - (deltay * proj);
            var vpz = vel[2] - (deltaz * proj);
            var vl = Math.sqrt((vpx * vpx) + (vpy * vpy) + (vpz * vpz));
            if (vl !== 0.0)
            {
                vl = 1.0 / vl;
            }
            vpx *= vl;
            vpy *= vl;
            vpz *= vl;

            var strength = Math.pow(sep, 1.75) * (proj < 0 ? (1 - proj) : (1 / (1 + proj))) * 0.05 * reboundAcceleration;
            accel[0] += deltax * strength;
            accel[1] += deltay * strength;
            accel[2] += deltaz * strength;

            strength *= 0.25;
            accel[0] += vpx * strength;
            accel[1] += vpy * strength;
            accel[2] += vpz * strength;
        }
        else
        {
            block.collided = false;
        }
    }

    return collidedCount;
};
