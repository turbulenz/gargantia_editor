/*global AABBTree: false*/
/*global FastMath: false*/
/*global EntityComponentBase: false*/
/*global VMath: false*/


function BirdManager(globals)
{
    this.globals = globals;
    this.clear();

    this.birdFlockRadius = 20;
    this.birdMinSpeed = 5; //20;
    this.birdMaxSpeed = 10; //35;
    this.birdBoundsForce = 1.5;
    this.birdStableRepulsion = 20;
    this.birdRepulsion = 0.5;
    this.birdRepulsionDrag = 0.015;
    this.birdWeightBias = 0.085;
    this.birdAttraction = 4.0;
    this.birdVelocityAttraction = 2.5;

    this.collisionRadius = 30;
    this.realCollisionRadius = 2;
    this.reboundAcceleration = 0.05;

    this.birdRandomness = 1;
    this.birdRandomnessMax = 25;

    this.flockingDelay = 5;
    this.flockingCounter = 2;

    this.extents = globals.mathDevice.aabbBuildEmpty();

    this.scratchpad = {
        v0: globals.mathDevice.v3BuildZero()
    };

    var ui = globals.dynamicUI;
    if (ui)
    {
        var birds = ui.addGroup("Birds", globals.uiGroups.settings, function () {}, {collapsable: true});
        var group = ui.addGroup("Flocking", birds);
        var render = ui.addGroup("Rendering", birds);
        ui.watchVariable(
            'Flock Radius',
            this,
            'birdFlockRadius',
            'slider',
            group,
            {
                min : 10,
                max : 100,
                step : 5
            });

        ui.watchVariable(
            'Min Speed',
            this,
            'birdMinSpeed',
            'slider',
            group,
            {
                min : 5,
                max : 40,
                step : 5
            });

        ui.watchVariable(
            'Max Speed',
            this,
            'birdMaxSpeed',
            'slider',
            group,
            {
                min : 10,
                max : 60,
                step : 5
            });

        ui.watchVariable(
            'Bounds Force',
            this,
            'birdBoundsForce',
            'slider',
            group,
            {
                min : 0,
                max : 2.5,
                step : 0.00625 * 5
            });

        ui.watchVariable(
            'Max Crowding Radius',
            this,
            'birdStableRepulsion',
            'slider',
            group,
            {
                min : 0,
                max : 40,
                step : 5
            });

        ui.watchVariable(
            'Repulsion Force',
            this,
            'birdRepulsion',
            'slider',
            group,
            {
                min : 0,
                max : 1,
                step : 0.0125
            });

        ui.watchVariable(
            'Repulsion Drag',
            this,
            'birdRepulsionDrag',
            'slider',
            group,
            {
                min : 0,
                max : 0.25,
                step : 0.0125
            });

        ui.watchVariable(
            'Weight bias',
            this,
            'birdWeightBias',
            'slider',
            group,
            {
                min : 0,
                max : 0.25,
                step : 0.0125
            });

        ui.watchVariable(
            'Flock Attraction',
            this,
            'birdAttraction',
            'slider',
            group,
            {
                min: 0,
                max: 10,
                step: 0.25
            });

        ui.watchVariable(
            'Flock Velocity Attraction',
            this,
            'birdVelocityAttraction',
            'slider',
            group,
            {
                min: 0,
                max: 10,
                step: 0.25
            });


        ui.watchVariable(
            'Flock Update Delay',
            this,
            'flockingDelay',
            'slider',
            group,
            {
                min: 1,
                max: 60,
                step: 1.0
            });

        ui.watchVariable(
            'Scale',
            Bird,
            'scale',
            'vector-slider',
            render,
            {
                min: 0.5,
                max: 8,
                step: 0.5,
                dimension: 3
            });

        ui.watchVariable(
            'Roll',
            Bird,
            'roll',
            'slider',
            render,
            {
                min: 0,
                max: 0.04,
                step: 0.005
            });
    }
}

function Bird(globals, pos, vel)
{
    var md = globals.mathDevice;

    var buffer = new Float32Array(3 + 3 + 3 + 3);

    this.position = md.v3Copy(pos, buffer.subarray(0, 3));
    this.velocity = md.v3Copy(vel, buffer.subarray(3, 6));
    this.acceleration = md.v3BuildZero(buffer.subarray(6, 9));
    this.randomWalk = md.v3BuildZero(buffer.subarray(9, 12));
    this.numPairs = 0;
    this.pairs = [];

    this.roll = 0;

    this.node = globals.simpleSceneLoader.load("characters/seagull_01.dae", md.m43BuildTranslation(this.position));
    this.renderableNode = this._findRenderableNode(this.node);

    this.time = Math.random();

    this.bounds = null;
    this.spatialIndex = undefined;
    this.playingSounds = false;
}

Bird.scale = [2, 2, 2];
Bird.roll = 0.02;

Bird.prototype.destroy = function birdDestroyFn()
{
    // assumption: destroy birds only when destroying entire bird manager
    var scene = this.node.scene;
    if (scene)
    {
        scene.removeRootNode(this.node);
    }
    this.node = null;
};

// We are assuming the bird has a single node with a renderable on it
Bird.prototype._findRenderableNode = function _findRenderableNodeFn(node)
{
    if (!node.renderables)
    {
        var children = node.children;
        if (children)
        {
            return this._findRenderableNode(children[0]);
        }
    }
    return node;
};

Bird.prototype.updateNode = function birdUpdateNodeFn(frameIndex)
{
    var M = this.node.getLocalTransform();
    var pos = this.position;

    if (this.renderableNode.frameVisible === frameIndex)
    {
        this.renderableNode.renderables[0].techniqueParameters.time = (Math.abs((this.time % 1.0) - 0.5) - 0.25);

        var vel = this.velocity;
        var accel = this.acceleration;

        // compute transformation matrix for birds orientation.
        // z vector = negative velocity (mesh needs 180 degree rotation)
        var z0 = -vel[0];
        var z1 = -vel[1];
        var z2 = -vel[2];
        var zl = ((z0 * z0) + (z1 * z1) + (z2 * z2));
        if (zl)
        {
            zl = 1 / Math.sqrt(zl);
            z0 *= zl;
            z1 *= zl;
            z2 *= zl;
        }

        // x = rotated projection of z onto xz plane.
        var tx0 = -z2;
        var tx2 = z0;
        var txl = (1 - (z1 * z1));
        if (txl)
        {
            txl = 1 / Math.sqrt(txl);
            tx0 *= txl;
            tx2 *= txl;
        }

        // update roll based on right-acceleration.
        var targetRoll = -((accel[0] * tx0) + (accel[2] * tx2)) * Bird.roll;
        var pi_2 = Math.PI * 0.5;
        if (targetRoll < -pi_2)
        {
            targetRoll = -pi_2;
        }
        else if (targetRoll > pi_2)
        {
            targetRoll = pi_2;
        }
        var roll = this.roll;
        roll += (targetRoll - roll) * 0.05;
        this.roll = roll;

        // rotate x vector around z-vector based on roll.
        var s = FastMath.sin(roll);
        var c = FastMath.cos(roll);
        var t = 1 - c;
        var t0 = t * z0;
        var t2 = t * z2;
        var s0 = s * z0;
        var s1 = s * z1;
        var s2 = s * z2;
        var x0 = (t0 * z0 + c)  * tx0 + (t2 * z0 - s1) * tx2;
        var x1 = (t0 * z1 - s2) * tx0 + (t2 * z1 + s0) * tx2;
        var x2 = (t0 * z2 + s1) * tx0 + (t2 * z2 + c)  * tx2;

        // y vector = z cross x. x, z are orthogonal and unit, so no normalization required.
        var y0 = ((z1 * x2) - (z2 * x1));
        var y1 = ((z2 * x0) - (z0 * x2));
        var y2 = ((z0 * x1) - (z1 * x0));

        // update matrix with x,y,z vectors and bird position.
        var xl = Bird.scale[0];
        var yl = Bird.scale[1];
        zl = Bird.scale[2];
        M[0] = x0 * xl;
        M[1] = x1 * xl;
        M[2] = x2 * xl;
        M[3] = y0 * yl;
        M[4] = y1 * yl;
        M[5] = y2 * yl;
        M[6] = z0 * zl;
        M[7] = z1 * zl;
        M[8] = z2 * zl;
    }

    M[9]  = pos[0];
    M[10] = pos[1];
    M[11] = pos[2];

    this.node.setLocalTransform(M);
};

BirdManager.prototype.add = function birdManagerAddFn(bird)
{
    this.birds.push(bird);
    var pos = bird.position;
    var extents = this.extents;
    var r = this.birdFlockRadius;
    extents[0] = pos[0] - r;
    extents[1] = pos[1] - r;
    extents[2] = pos[2] - r;
    extents[3] = pos[0] + r;
    extents[4] = pos[1] + r;
    extents[5] = pos[2] + r;
    this.map.add(bird, extents);
};

BirdManager.prototype.clear = function birdManagerClearFn()
{
    var birds = this.birds;
    if (birds)
    {
        var count = birds.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            birds[i].destroy();
        }
    }

    this.birds = [];
    this.pairs = [];
    this.map = AABBTree.create(false);

    this.playingSounds = false;
};

BirdManager.prototype._updateFlockingExtents = function birdManagerUpdateFlockingExtentsFn()
{
    var map = this.map;
    var extents = this.extents;
    var birds = this.birds;
    var r = this.birdFlockRadius;
    var i, bird, pos, numBirds = birds.length;
    for (i = 0; i < numBirds; i += 1)
    {
        bird = birds[i];
        pos = bird.position;
        extents[0] = pos[0] - r;
        extents[1] = pos[1] - r;
        extents[2] = pos[2] - r;
        extents[3] = pos[0] + r;
        extents[4] = pos[1] + r;
        extents[5] = pos[2] + r;
        map.update(bird, extents);
    }
};

BirdManager.prototype._updateFlocking = function birdManagerUpdateFlockingFn()
{
    var map = this.map;
    var pairs = this.pairs;
    var birds = this.birds;
    var i, bird, bird2, numBirds = birds.length;
    var pos, pos2, vel, vel2, accel;

    this._updateFlockingExtents();

    // determine pairs of nearly overlapping birds.
    map.finalize();
    var numPairs = map.getOverlappingPairs(this.pairs, 0);

    // populate each birds own pair list.
    for (i = 0; i < numPairs; i += 2)
    {
        bird = pairs[i];
        bird2 = pairs[i + 1];
        bird.pairs[bird.numPairs] = bird2;
        bird2.pairs[bird2.numPairs] = bird;
        bird.numPairs += 1;
        bird2.numPairs += 1;
    }

    var md = this.globals.mathDevice;
    var dd = this.globals.debugDrawFlags.birds ? this.globals.debugDraw : null;

    // flock birds.
    var max = this.birdMaxSpeed;
    var min = this.birdMinSpeed;
    var r = this.birdFlockRadius;
    var r2 = r * r;
    var d0, d1, d2, del, attraction;
    for (i = 0; i < numBirds; i += 1)
    {
        bird = birds[i];

        var numPaired = bird.numPairs;
        if (numPaired === 0)
        {
            continue;
        }

        pos = bird.position;
        vel = bird.velocity;
        accel = bird.acceleration;

        var vlength = 0.25 * Math.sqrt(vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2]);

        var tpos0 = pos[0];
        var tpos1 = pos[1];
        var tpos2 = pos[2];
        var tweight = 1;

        var paired = bird.pairs;
        var j;
        for (j = 0; j < numPaired; j += 1)
        {
            bird2 = paired[j];
            pos2 = bird2.position;
            vel2 = bird2.velocity;

            d0 = pos[0] - pos2[0];
            d1 = pos[1] - pos2[1];
            d2 = pos[2] - pos2[2];
            del = d0 * d0 + d1 * d1 + d2 * d2;
            if (del > r2)
            {
                continue;
            }

            del = Math.sqrt(del);
            var proj = vel[0] * d0 + vel[1] * d1 + vel[2] * d2;
            if (proj > vlength * del)
            {
                continue;
            }

            tpos0 += pos2[0];
            tpos1 += pos2[1];
            tpos2 += pos2[2];
            tweight += 1;

            // Push eachother to maintain formation
            // Only perform attraction on self, allow partner
            // to do his own attraction to us.
            var force = (this.birdStableRepulsion - del) * this.birdRepulsion;
            if (force < 0)
            {
                continue;
            }

            var idel = 1 / del;
            d0 *= idel;
            d1 *= idel;
            d2 *= idel;
            accel[0] += d0 * force;
            accel[1] += d1 * force;
            accel[2] += d2 * force;

            var v0 = vel[0] - vel2[0];
            var v1 = vel[1] - vel2[1];
            var v2 = vel[2] - vel2[2];
            proj = (d0 * v0 + d1 * v1 + d2 * v2) * this.birdRepulsionDrag;
            accel[0] -= d0 * proj;
            accel[1] -= d1 * proj;
            accel[2] -= d2 * proj;
        }

        tweight = 1 / tweight;
        tpos0 *= tweight;
        tpos1 *= tweight;
        tpos2 *= tweight;
        if (dd)
        {
            dd.drawDebugLine(pos, md.v3Build(tpos0, tpos1, tpos2, this.scratchpad.v0), 1, 1, 0);
        }

        // attract to true average location
        d0 = tpos0 - pos[0];
        d1 = tpos1 - pos[1];
        d2 = tpos2 - pos[2];
        del = d0 * d0 + d1 * d1 + d2 * d2;
        var weight = 1 / (1 + del * this.birdWeightBias);
        var xweight = weight;

        attraction = this.birdAttraction * xweight;
        accel[0] += d0 * attraction;
        accel[1] += d1 * attraction;
        accel[2] += d2 * attraction;

        // compute weighted velocity at true average location
        var tvel0 = vel[0] * weight;
        var tvel1 = vel[1] * weight;
        var tvel2 = vel[2] * weight;
        tweight = weight;

        for (j = 0; j < numPaired; j += 1)
        {
            bird2 = paired[j];
            pos2 = bird2.position;
            vel2 = bird2.velocity;

            d0 = tpos0 - pos2[0];
            d1 = tpos1 - pos2[1];
            d2 = tpos2 - pos2[2];

            del = d0 * d0 + d1 * d1 + d2 * d2;
            weight = 1 / (1 + del * this.birdWeightBias);
            tvel0 += vel2[0] * weight;
            tvel1 += vel2[1] * weight;
            tvel2 += vel2[2] * weight;
            tweight += weight;
        }

        tweight = 1 / tweight;
        tvel0 *= tweight;
        tvel1 *= tweight;
        tvel2 *= tweight;

        del = tvel0 * tvel0 + tvel1 * tvel1 + tvel2 * tvel2;
        if (del)
        {
            del = (min + max) * 0.5 / Math.sqrt(del);
            tvel0 *= del;
            tvel1 *= del;
            tvel2 *= del;
        }

        d0 = tvel0 - vel[0];
        d1 = tvel1 - vel[1];
        d2 = tvel2 - vel[2];

        attraction = this.birdVelocityAttraction * xweight;
        accel[0] += d0 * attraction;
        accel[1] += d1 * attraction;
        accel[2] += d2 * attraction;
    }
};

BirdManager.prototype.update = function birdManagerUpdateFn(dt)
{
    this.flockingCounter -= 1;
    if (this.flockingCounter <= 0)
    {
        this.flockingCounter = this.flockingDelay;
        this._updateFlocking();
    }

    var max = this.birdMaxSpeed;
    var min = this.birdMinSpeed;
    var birds = this.birds;
    var i, bird, numBirds = birds.length;
    var pos, vel, accel;

    var gameManager = this.globals.gameManager;
    var cameraPosition = gameManager.gameCamera.currentV3Position;
    var cameraDistanceSq;
    var nearestBirdPosition = null;
    var nearestBirdDistanceSq = Number.MAX_VALUE;

    var gameSpace = gameManager.gameSpaceList[0];
    var tree;
    var collisions = gameManager.collisions;
    var blocks = [];
    // TODO assume 1 game space only.
    if (gameSpace)
    {
        gameSpace.finalizeIfNeeded();
        tree = gameSpace.cubeTree;
    }

    var md = this.globals.mathDevice;
    var dd = this.globals.debugDrawFlags.birds ? this.globals.debugDraw : null;

    var frameIndex = (this.globals.scene.frameIndex - 1);
    var thermals = EntityComponentBase.getEntitiesWithEC("ECThermals");
    var thermalStrength;
    var d0, d1, d2, del;
    for (i = 0; i < numBirds; i += 1)
    {
        bird = birds[i];
        pos = bird.position;
        vel = bird.velocity;
        accel = bird.acceleration;

        // Attraction to stay in original bounds.
        var bounds = bird.bounds;
        if (dd)
        {
            dd.drawDebugExtents(bounds, 0, 1, 0);
        }
        d0 = pos[0] > bounds[3] ? bounds[3] - pos[0] : pos[0] < bounds[0] ? bounds[0] - pos[0] : 0;
        d1 = pos[1] > bounds[4] ? bounds[4] - pos[1] : pos[1] < bounds[1] ? bounds[1] - pos[1] : 0;
        d2 = pos[2] > bounds[5] ? bounds[5] - pos[2] : pos[2] < bounds[2] ? bounds[2] - pos[2] : 0;
        var dl = (d0 * d0 + d1 * d1 + d2 * d2);
        if (dl > 0.001)
        {
            dl = Math.sqrt(dl);
            accel[0] += d0 * this.birdBoundsForce;
            accel[1] += d1 * this.birdBoundsForce;
            accel[2] += d2 * this.birdBoundsForce;
            var vdl = this.birdBoundsForce * 0.0015 * dl;
            accel[0] += vel[0] * vdl / (1 + Math.abs(d0));
            accel[1] += vel[1] * vdl / (1 + Math.abs(d1));
            accel[2] += vel[2] * vdl / (1 + Math.abs(d2));
            thermalStrength = 1 / (1 + dl);
        }
        else
        {
            thermalStrength = 1.0;
        }
        if (dd)
        {
            dd.drawDebugLine(pos, md.v3Add(pos, md.v3Build(d0, d1, d2)), 1, 0, 0);
        }

        if (pos[1] > (bounds[1] + bounds[4]) / 2)
        {
            accel[1] -= 10;
        }

        // World avoidance
        if (tree)
        {
            tree.getSphereOverlappingNodes(pos, this.collisionRadius, blocks);
            if (blocks.length)
            {
                collisions.collideWithBlocks(
                        bird,
                        blocks,
                        this.collisionRadius,
                        this.realCollisionRadius,
                        this.reboundAcceleration);
                blocks.length = 0;
            }
        }

        collisions.birdThermalLift(bird, thermals, thermalStrength);

        // Random walk
        var rand = bird.randomWalk;
        accel[0] += rand[0] * this.birdRandomness;
        accel[1] += rand[1] * this.birdRandomness;
        accel[2] += rand[2] * this.birdRandomness;
        rand[0] += Math.random() * 0.1;
        rand[1] += Math.random() * 0.1;
        rand[2] += Math.random() * 0.1;
        if (rand[0] * rand[0] > this.birdRandomnessMax)
        {
            rand[0] = -rand[0];
        }
        if (rand[1] * rand[1] > this.birdRandomnessMax)
        {
            rand[1] = -rand[1];
        }
        if (rand[2] * rand[2] > this.birdRandomnessMax)
        {
            rand[2] = -rand[2];
        }

        // Integrate velocity
        vel[0] += accel[0] * dt;
        vel[1] += accel[1] * dt;
        vel[2] += accel[2] * dt;

        // Max climb/fall. Keep these balanced to avoid birds accumulating lower down.
        del = md.v3Length(vel);
        if (vel[1] > 0.5 * del)
        {
            vel[1] = 0.5 * del;
        }
        else if (vel[1] < -0.5 * del)
        {
            vel[1] = -0.5 * del;
        }

        // Max/Min speed
        if (del > max)
        {
            del = max / del;
            vel[0] *= del;
            vel[1] *= del;
            vel[2] *= del;
        }
        else if (del < min)
        {
            del = min / del;
            vel[0] *= del;
            vel[1] *= del;
            vel[2] *= del;
        }

        // Integrate position
        pos[0] += vel[0] * dt;
        pos[1] += vel[1] * dt;
        pos[2] += vel[2] * dt;

        bird.time += dt;

        bird.updateNode(frameIndex);

        // Prepare bird for next update
        bird.numPairs = 0;
        accel[0] = accel[1] = accel[2] = 0;

        cameraDistanceSq = VMath.v3DistanceSq(pos, cameraPosition);
        if (cameraDistanceSq < nearestBirdDistanceSq)
        {
            nearestBirdDistanceSq = cameraDistanceSq;
            nearestBirdPosition = pos;
        }
    }

    if (nearestBirdPosition)
    {
        var gameSoundManager = gameManager.gameSoundManager;
        if (this.playingSounds === false)
        {
            if (nearestBirdDistanceSq < (100 * 100))
            {
                this.playingSounds = true;
                gameSoundManager.play('aud_gulls', nearestBirdPosition, 'BirdManager');
            }
        }
        else
        {
            if (nearestBirdDistanceSq < (100 * 100))
            {
                gameSoundManager.setPosition('aud_gulls', 'BirdManager', nearestBirdPosition);
            }
            else
            {
                this.playingSounds = false;
                gameSoundManager.stop('aud_gulls', 'BirdManager', 0);
            }
        }
    }
};
