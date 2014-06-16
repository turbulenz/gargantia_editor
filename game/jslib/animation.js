// Copyright (c) 2009-2014 Turbulenz Limited
/*global TurbulenzEngine: false*/
;

;

;

;

;

var AnimationMath = {
    quatPosscalefromm43: function quatPosscalefromm43Fn(matrix, mathDevice) {
        var v3Length = mathDevice.v3Length;
        var v3ScalarMul = mathDevice.v3ScalarMul;
        var v3Build = mathDevice.v3Build;

        var right = mathDevice.m43Right(matrix);
        var up = mathDevice.m43Up(matrix);
        var at = mathDevice.m43At(matrix);

        var sx = v3Length.call(mathDevice, right);
        var sy = v3Length.call(mathDevice, up);
        var sz = v3Length.call(mathDevice, at);
        var det = mathDevice.m43Determinant(matrix);

        var scale = v3Build.call(mathDevice, sx, sy, sz);
        var unitScale = v3Build.call(mathDevice, 1, 1, 1);

        if (!mathDevice.v3Equal(scale, unitScale) || det < 0) {
            if (det < 0) {
                sx *= -1;
                scale = v3Build.call(mathDevice, sx, sy, sz);
            }

            mathDevice.m43SetRight(matrix, v3ScalarMul.call(mathDevice, right, 1 / sx));
            mathDevice.m43SetUp(matrix, v3ScalarMul.call(mathDevice, up, 1 / sy));
            mathDevice.m43SetAt(matrix, v3ScalarMul.call(mathDevice, at, 1 / sz));
        } else {
            scale = unitScale;
        }

        var quat = mathDevice.quatFromM43(matrix);
        var pos = mathDevice.m43Pos(matrix);

        var result = {
            rotation: quat,
            translation: pos,
            scale: scale
        };

        return result;
    }
};

var AnimationChannels = {
    copy: function animationChannelsCopyFn(channels) {
        var channelCopy = {};
        var c;
        for (c in channels) {
            if (channels.hasOwnProperty(c)) {
                channelCopy[c] = true;
            }
        }

        return channelCopy;
    },
    union: function animationChannelsUnionFn(channelsA, channelsB) {
        var channelUnion = {};
        var c;
        for (c in channelsA) {
            if (channelsA.hasOwnProperty(c)) {
                channelUnion[c] = true;
            }
        }
        for (c in channelsB) {
            if (channelsB.hasOwnProperty(c)) {
                channelUnion[c] = true;
            }
        }

        return channelUnion;
    },
    add: function animationChannelsAddFn(channels, newChannels) {
        var c;
        for (c in newChannels) {
            if (newChannels.hasOwnProperty(c)) {
                channels[c] = true;
            }
        }
    }
};

var Animation = {
    minKeyframeDelta: 0.0001,
    standardGetJointWorldTransform: function StandardGetJointWorldTransformFn(controller, jointId, mathDevice, asMatrix) {
        var m43FromRT = mathDevice.m43FromRT;
        var quatCopy = mathDevice.quatCopy;
        var v3Copy = mathDevice.v3Copy;
        var output = controller.output;
        var hasScale = controller.outputChannels.scale;
        var joint = output[jointId];
        var hierarchyParents = controller.getHierarchy().parents;
        var parentIndex = hierarchyParents[jointId];
        var parentJoint;
        if (hasScale) {
            var m43Mul = mathDevice.m43Mul;
            var parentMatrix;
            var matrix = mathDevice.m43FromRTS(joint.rotation, joint.translation, joint.scale);
            while (parentIndex !== -1) {
                parentJoint = output[parentIndex];
                parentMatrix = mathDevice.m43FromRTS(parentJoint.rotation, parentJoint.translation, parentJoint.scale, parentMatrix);

                matrix = m43Mul.call(mathDevice, matrix, parentMatrix, matrix);

                parentIndex = hierarchyParents[parentIndex];
            }
            if (asMatrix) {
                return matrix;
            } else {
                // TODO: add to mathdevice
                var result = AnimationMath.quatPosscalefromm43(matrix, mathDevice);
                return {
                    rotation: result.rotation,
                    translation: result.translation
                };
            }
        } else {
            var rotation = quatCopy.call(mathDevice, joint.rotation);
            var translation = v3Copy.call(mathDevice, joint.translation);
            while (parentIndex !== -1) {
                parentJoint = output[parentIndex];

                mathDevice.quatMulTranslate(parentJoint.rotation, parentJoint.translation, rotation, translation, rotation, translation);

                parentIndex = hierarchyParents[parentIndex];
            }

            if (asMatrix) {
                return m43FromRT.call(mathDevice, rotation, translation);
            } else {
                return { rotation: rotation, translation: translation };
            }
        }
    }
};

//
// InterpolatorController
//
var InterpolatorController = (function () {
    function InterpolatorController() {
    }
    InterpolatorController.prototype.addTime = function (delta) {
        this.currentTime += delta * this.rate;
        this.dirty = true;
        this.dirtyBounds = true;

        // deal with looping animations, we do this during addTime to ensure callbacks
        // are fired if someone doesn't call update
        var anim = this.currentAnim;
        var animLength = anim.length;

        while (this.currentTime > animLength) {
            var numNodes = this.hierarchy.numNodes;
            var index;

            for (index = 0; index < numNodes; index += 1) {
                this.translationEndFrames[index] = 0;
                this.rotationEndFrames[index] = 0;
                this.scaleEndFrames[index] = 0;
            }

            if (this.onUpdateCallback) {
                // call the update callback as though we're at the end of the animation
                var tempTime = this.currentTime;
                this.currentTime = animLength;
                this.onUpdateCallback(this);
                if (this.currentTime === animLength) {
                    // Only restore the old time if the update callback didn't change it
                    this.currentTime = tempTime;
                } else if (this.currentTime < animLength) {
                    // If the update callback reset the animation to a valid state don't continue
                    return;
                }
            }

            if (this.looping) {
                if (this.onLoopCallback) {
                    if (!this.onLoopCallback(this)) {
                        return;
                    }
                }
                if (0 !== animLength) {
                    this.currentTime -= animLength;
                } else {
                    this.currentTime = 0;
                    break;
                }
            } else {
                if (this.onFinishedCallback) {
                    if (!this.onFinishedCallback(this)) {
                        return;
                    }
                }
                this.currentTime = animLength;
                break;
            }
        }

        if (this.onUpdateCallback) {
            this.onUpdateCallback(this);
        }
    };

    InterpolatorController.prototype.update = function () {
        var mathDevice = this.mathDevice;

        var anim = this.currentAnim;
        var nodeData = anim.nodeData;
        var numJoints = this.hierarchy.numNodes;
        var outputArray = this.output;

        var animHasScale = anim.channels.scale;

        var defaultScale;
        if (animHasScale) {
            defaultScale = mathDevice.v3Build(1, 1, 1);
        }

        var scratchPad = InterpolatorController.prototype.scratchPad;
        var v1 = scratchPad.v1;
        var v2 = scratchPad.v2;
        var q1 = scratchPad.q1;
        var q2 = scratchPad.q2;
        var delta, j;

        for (j = 0; j < numJoints; j += 1) {
            var data = nodeData[j];
            var jointChannels = data.channels;
            var jointHasScale = jointChannels ? jointChannels.scale : animHasScale;
            var hasScale = jointHasScale || animHasScale;
            var jointKeys = data.keyframes;
            var jointBase = data.baseframe;
            var baseQuat, basePos, baseScale;
            var jointOutput = outputArray[j];

            if (jointBase) {
                baseQuat = jointBase.rotation;
                basePos = jointBase.translation;
                baseScale = jointBase.scale;

                /*jshint bitwise: false*/
                jointHasScale = jointHasScale || (baseScale !== undefined);
                /*jshint bitwise: true*/
            }

            if (!jointKeys) {
                // Completely non animated joint so copy the base
                jointOutput.rotation = mathDevice.quatCopy(baseQuat, jointOutput.rotation);
                jointOutput.translation = mathDevice.v3Copy(basePos, jointOutput.translation);
                if (hasScale) {
                    if (jointHasScale) {
                        jointOutput.scale = mathDevice.v3Copy(baseScale, jointOutput.scale);
                    } else {
                        jointOutput.scale = mathDevice.v3Copy(defaultScale, jointOutput.scale);
                    }
                }
            } else {
                // Find the pair of keys wrapping current time
                var offset = 0;
                var stride = 0;
                var offsetMinusStride = 0;
                var endFrameOffset = 0;
                var channels = data.channels;
                if (channels.rotation) {
                    stride = channels.rotation.stride;
                    offset = channels.rotation.offset;
                    endFrameOffset = offset + (channels.rotation.count - 1) * stride;

                    if (this.currentTime <= jointKeys[offset]) {
                        jointOutput.rotation = mathDevice.quatBuild(jointKeys[offset + 1], jointKeys[offset + 2], jointKeys[offset + 3], jointKeys[offset + 4], jointOutput.rotation);
                    } else if (this.currentTime >= jointKeys[endFrameOffset]) {
                        jointOutput.rotation = mathDevice.quatBuild(jointKeys[endFrameOffset + 1], jointKeys[endFrameOffset + 2], jointKeys[endFrameOffset + 3], jointKeys[endFrameOffset + 4], jointOutput.rotation);
                    } else {
                        offset = this.rotationEndFrames[j] || offset;

                        while (this.currentTime > jointKeys[offset]) {
                            offset += stride;
                        }

                        this.rotationEndFrames[j] = offset;
                        offsetMinusStride = offset - stride;

                        delta = (this.currentTime - jointKeys[offsetMinusStride]) / (jointKeys[offset] - jointKeys[offsetMinusStride]);

                        q1[0] = jointKeys[offsetMinusStride + 1];
                        q1[1] = jointKeys[offsetMinusStride + 2];
                        q1[2] = jointKeys[offsetMinusStride + 3];
                        q1[3] = jointKeys[offsetMinusStride + 4];

                        q2[0] = jointKeys[offset + 1];
                        q2[1] = jointKeys[offset + 2];
                        q2[2] = jointKeys[offset + 3];
                        q2[3] = jointKeys[offset + 4];

                        jointOutput.rotation = mathDevice.quatSlerp(q1, q2, delta, jointOutput.rotation);
                    }
                } else {
                    jointOutput.rotation = mathDevice.quatCopy(baseQuat, jointOutput.rotation);
                }

                if (channels.translation) {
                    stride = channels.translation.stride;
                    offset = channels.translation.offset;

                    endFrameOffset = offset + (channels.translation.count - 1) * stride;

                    if (this.currentTime <= jointKeys[offset]) {
                        jointOutput.translation = mathDevice.v3Build(jointKeys[offset + 1], jointKeys[offset + 2], jointKeys[offset + 3], jointOutput.translation);
                    } else if (this.currentTime >= jointKeys[endFrameOffset]) {
                        jointOutput.translation = mathDevice.v3Build(jointKeys[endFrameOffset + 1], jointKeys[endFrameOffset + 2], jointKeys[endFrameOffset + 3], jointOutput.translation);
                    } else {
                        offset = this.translationEndFrames[j] || offset;

                        while (this.currentTime > jointKeys[offset]) {
                            offset += stride;
                        }

                        this.translationEndFrames[j] = offset;
                        offsetMinusStride = offset - stride;

                        delta = (this.currentTime - jointKeys[offsetMinusStride]) / (jointKeys[offset] - jointKeys[offsetMinusStride]);

                        v1[0] = jointKeys[offsetMinusStride + 1];
                        v1[1] = jointKeys[offsetMinusStride + 2];
                        v1[2] = jointKeys[offsetMinusStride + 3];

                        v2[0] = jointKeys[offset + 1];
                        v2[1] = jointKeys[offset + 2];
                        v2[2] = jointKeys[offset + 3];

                        jointOutput.translation = mathDevice.v3Lerp(v1, v2, delta, jointOutput.translation);
                    }
                } else {
                    jointOutput.translation = mathDevice.v3Copy(basePos, jointOutput.translation);
                }

                if (channels.scale) {
                    stride = channels.scale.stride;
                    offset = channels.scale.offset;

                    endFrameOffset = offset + (channels.scale.count - 1) * stride;

                    if (this.currentTime <= jointKeys[offset]) {
                        jointOutput.scale = mathDevice.v3Build(jointKeys[offset + 1], jointKeys[offset + 2], jointKeys[offset + 3], jointOutput.scale);
                    } else if (this.currentTime >= jointKeys[endFrameOffset]) {
                        jointOutput.scale = mathDevice.v3Build(jointKeys[endFrameOffset + 1], jointKeys[endFrameOffset + 2], jointKeys[endFrameOffset + 3], jointOutput.scale);
                    } else {
                        offset = this.scaleEndFrames[j] || offset;

                        while (this.currentTime > jointKeys[offset]) {
                            offset += stride;
                        }

                        this.scaleEndFrames[j] = offset;
                        offsetMinusStride = offset - stride;

                        delta = (this.currentTime - jointKeys[offsetMinusStride]) / (jointKeys[offset] - jointKeys[offsetMinusStride]);

                        v1[0] = jointKeys[offsetMinusStride + 1];
                        v1[1] = jointKeys[offsetMinusStride + 2];
                        v1[2] = jointKeys[offsetMinusStride + 3];

                        v2[0] = jointKeys[offset + 1];
                        v2[1] = jointKeys[offset + 2];
                        v2[2] = jointKeys[offset + 3];

                        jointOutput.scale = mathDevice.v3Lerp(v1, v2, delta, jointOutput.scale);
                    }
                } else {
                    if (hasScale) {
                        if (jointHasScale) {
                            jointOutput.scale = mathDevice.v3Copy(baseScale, jointOutput.scale);
                        } else {
                            jointOutput.scale = mathDevice.v3Copy(defaultScale, jointOutput.scale);
                        }
                    }
                }
            }
        }

        this.dirty = false;

        if (this.dirtyBounds) {
            this.updateBounds();
        }
    };

    InterpolatorController.prototype.updateBounds = function () {
        if (!this.dirtyBounds) {
            return;
        }

        this.dirtyBounds = false;

        var currentTime = this.currentTime;
        var anim = this.currentAnim;
        var mathDevice = this.mathDevice;
        var ibounds = this.bounds;

        // work out the offset in the frame list and the delta between frame pairs
        var bounds = anim.bounds;
        var numFrames = bounds.length;
        if (currentTime > bounds[numFrames - 1].time) {
            // copy the end bounds
            var endBounds = bounds[numFrames - 1];
            ibounds.center = mathDevice.v3Copy(endBounds.center, ibounds.center);
            ibounds.halfExtent = mathDevice.v3Copy(endBounds.halfExtent, ibounds.halfExtent);
            return;
        }

        if (currentTime < bounds[0].time) {
            // copy the start bounds
            var startBounds = bounds[0];
            ibounds.center = mathDevice.v3Copy(startBounds.center, ibounds.center);
            ibounds.halfExtent = mathDevice.v3Copy(startBounds.halfExtent, ibounds.halfExtent);
            return;
        }

        var endBound = 1;
        while (currentTime > bounds[endBound].time) {
            endBound += 1;
        }

        var startBound = (endBound - 1);
        var boundsStart = bounds[startBound];
        var boundsEnd = bounds[endBound];
        var startTime = boundsStart.time;
        var endTime = boundsEnd.time;
        var delta = (currentTime - startTime) / (endTime - startTime);

        // If delta is close to the limits we just copy the bounds
        var minKeyframeDelta = Animation.minKeyframeDelta;
        if (delta < minKeyframeDelta) {
            // copy the bounds
            ibounds.center = mathDevice.v3Copy(boundsStart.center, ibounds.center);
            ibounds.halfExtent = mathDevice.v3Copy(boundsStart.halfExtent, ibounds.halfExtent);
        } else if ((1.0 - delta) < minKeyframeDelta) {
            // copy the bounds
            ibounds.center = mathDevice.v3Copy(boundsEnd.center, ibounds.center);
            ibounds.halfExtent = mathDevice.v3Copy(boundsEnd.halfExtent, ibounds.halfExtent);
        } else {
            // accumulate the bounds as average of the center position and max of the extent
            // plus the half distance between the centers
            var centerSum = mathDevice.v3Add(boundsStart.center, boundsEnd.center, ibounds.center);
            var newCenter = mathDevice.v3ScalarMul(centerSum, 0.5, centerSum);
            ibounds.center = newCenter;

            var newExtent = mathDevice.v3Max(boundsStart.halfExtent, boundsEnd.halfExtent, ibounds.halfExtent);
            var centerOffset = mathDevice.v3Sub(boundsStart.center, newCenter, this.scratchPad.v1);
            centerOffset = mathDevice.v3Abs(centerOffset, centerOffset);
            ibounds.halfExtent = mathDevice.v3Add(newExtent, centerOffset, newExtent);
        }
    };

    InterpolatorController.prototype._updateBoundsNoop = function () {
        this.dirtyBounds = false;
    };

    // Note this is purely a transform for the given joint and doesn't include parent transforms
    InterpolatorController.prototype.getJointTransform = function (jointId) {
        var mathDevice = this.mathDevice;
        var m43FromRTS = mathDevice.m43FromRTS;
        var m43FromRT = mathDevice.m43FromRT;
        var quatSlerp = mathDevice.quatSlerp;
        var v3Lerp = mathDevice.v3Lerp;

        var anim = this.currentAnim;
        var animHasScale = anim.channels.scale;
        if (this.dirty) {
            var nodeData = anim.nodeData;

            var jointKeys = nodeData[jointId].keyframes;
            var jointBase = nodeData[jointId].jointBase;

            var jointChannels = nodeData[jointId].channels;
            var jointHasScale = jointChannels ? jointChannels.scale : animHasScale;
            var hasScale = jointHasScale || animHasScale;

            var baseQuat, basePos, baseScale;
            if (jointBase) {
                baseQuat = jointBase.rotation;
                basePos = jointBase.translation;
                baseScale = jointBase.scale;
            }

            if (!jointKeys) {
                if (hasScale) {
                    return m43FromRTS.call(mathDevice, baseQuat, basePos, baseScale || mathDevice.v3Build(1, 1, 1));
                } else {
                    return m43FromRT.call(mathDevice, baseQuat, basePos);
                }
            } else {
                // Find the pair of keys wrapping current time
                var endFrame = 1;
                while (this.currentTime > jointKeys[endFrame].time) {
                    endFrame += 1;
                }
                var startFrame = endFrame - 1;
                var startTime = jointKeys[startFrame].time;
                var endTime = jointKeys[endFrame].time;
                var delta = (this.currentTime - startTime) / (endTime - startTime);

                if (delta < Animation.minKeyframeDelta) {
                    var thisKey = jointKeys[startFrame];
                    if (hasScale) {
                        return m43FromRTS.call(mathDevice, thisKey.rotation || baseQuat, thisKey.translation || basePos, thisKey.scale || baseScale || mathDevice.v3Build(1, 1, 1));
                    } else {
                        return m43FromRT.call(mathDevice, thisKey.rotation || baseQuat, thisKey.translation || basePos);
                    }
                } else {
                    // For each joint slerp between the quats and return the quat pos result
                    var k1 = jointKeys[startFrame];
                    var k2 = jointKeys[endFrame];

                    var q1 = k1.rotation || baseQuat;
                    var q2 = k2.rotation || baseQuat;
                    var rotation = quatSlerp.call(mathDevice, q1, q2, delta);

                    var pos1 = k1.translation || basePos;
                    var pos2 = k2.translation || basePos;
                    var translation = v3Lerp.call(mathDevice, pos1, pos2, delta);

                    if (hasScale) {
                        var scale;
                        if (jointHasScale) {
                            var s1 = k1.scale || baseScale;
                            var s2 = k2.scale || baseScale;

                            scale = v3Lerp.call(mathDevice, s1, s2, delta);
                        } else {
                            scale = mathDevice.v3Build(1, 1, 1);
                        }
                        return m43FromRTS.call(mathDevice, rotation, translation, scale);
                    } else {
                        return m43FromRT.call(mathDevice, rotation, translation);
                    }
                }
            }
        } else {
            var jointOutput = this.output[jointId];
            if (animHasScale) {
                return m43FromRTS.call(mathDevice, jointOutput.rotation, jointOutput.translation, jointOutput.scale);
            } else {
                return m43FromRT.call(mathDevice, jointOutput.rotation, jointOutput.translation);
            }
        }
    };

    InterpolatorController.prototype.getJointWorldTransform = function (jointId, asMatrix) {
        if (this.dirty) {
            // May as well do a full update since we're accessing the output randomly
            this.update();
        }

        return Animation.standardGetJointWorldTransform(this, jointId, this.mathDevice, asMatrix);
    };

    InterpolatorController.prototype.setAnimation = function (animation, looping) {
        this.currentAnim = animation;
        this.currentTime = 0.0;
        var index;
        var numNodes = this.hierarchy.numNodes;

        if (!this.translationEndFrames || this.translationEndFrames.length !== numNodes) {
            this.translationEndFrames = new Uint32Array(numNodes);
            this.rotationEndFrames = new Uint32Array(numNodes);
            this.scaleEndFrames = new Uint32Array(numNodes);
        } else {
            for (index = 0; index < numNodes; index += 1) {
                this.translationEndFrames[index] = 0;
                this.rotationEndFrames[index] = 0;
                this.scaleEndFrames[index] = 0;
            }
        }

        this.dirty = true;
        this.dirtyBounds = true;
        if (looping) {
            this.looping = true;
        } else {
            this.looping = false;
        }

        this.outputChannels = AnimationChannels.copy(animation.channels);

        // Check if we need to update bounds
        var bounds = animation.bounds;
        var numFrames = bounds.length;
        debug.assert(0 < numFrames);
        var centerStart = bounds[0].center;
        var halfExtentStart = bounds[0].halfExtent;
        var n;
        for (n = 1; n < numFrames; n += 1) {
            var frame = bounds[n];
            var center = frame.center;
            var halfExtent = frame.halfExtent;
            if (centerStart[0] !== center[0] || centerStart[1] !== center[1] || centerStart[2] !== center[2] || halfExtentStart[0] !== halfExtent[0] || halfExtentStart[1] !== halfExtent[1] || halfExtentStart[2] !== halfExtent[2]) {
                break;
            }
        }
        if (n < numFrames) {
            this.updateBounds = InterpolatorController.prototype.updateBounds;
        } else {
            this.updateBounds = InterpolatorController.prototype._updateBoundsNoop;

            var ibounds = this.bounds;
            var mathDevice = this.mathDevice;
            ibounds.center = mathDevice.v3Copy(centerStart, ibounds.center);
            ibounds.halfExtent = mathDevice.v3Copy(halfExtentStart, ibounds.halfExtent);
        }
    };

    InterpolatorController.prototype.setTime = function (time) {
        this.currentTime = time;
        this.dirty = true;
        this.dirtyBounds = true;
        var numNodes = this.hierarchy.numNodes;
        var index;

        for (index = 0; index < numNodes; index += 1) {
            this.translationEndFrames[index] = 0;
            this.rotationEndFrames[index] = 0;
            this.scaleEndFrames[index] = 0;
        }
    };

    InterpolatorController.prototype.setRate = function (rate) {
        this.rate = rate;
    };

    InterpolatorController.prototype.getHierarchy = function () {
        return this.hierarchy;
    };

    InterpolatorController.create = // Constructor function
    function (hierarchy) {
        var i = new InterpolatorController();
        i.hierarchy = hierarchy;

        var md = TurbulenzEngine.getMathDevice();
        i.mathDevice = md;
        i.bounds = { center: md.v3BuildZero(), halfExtent: md.v3BuildZero() };

        var output = [];
        i.output = output;
        i.outputChannels = {};
        var numJoints = hierarchy.numNodes;
        for (var j = 0; j < numJoints; j += 1) {
            output[j] = {};
        }
        i.rate = 1.0;
        i.currentTime = 0.0;
        i.looping = false;
        i.dirty = true;
        i.dirtyBounds = true;

        if (!InterpolatorController.prototype.scratchPad) {
            InterpolatorController.prototype.scratchPad = {
                v1: md.v3BuildZero(),
                v2: md.v3BuildZero(),
                q1: md.quatBuild(0, 0, 0, 1),
                q2: md.quatBuild(0, 0, 0, 1)
            };
        }

        return i;
    };
    InterpolatorController.version = 1;
    return InterpolatorController;
})();
InterpolatorController.prototype.scratchV3 = null;

// This controller works off a base interpolator and copies all it's output data
// but allows a list of controllers and nodes to overload the output
// Note it only overloads the output quat pos and not any bounds etc
var OverloadedNodeController = (function () {
    function OverloadedNodeController() {
    }
    OverloadedNodeController.prototype.addTime = function (delta) {
        this.dirty = true;
        this.dirtyBounds = true;

        this.baseController.addTime(delta);
    };

    OverloadedNodeController.prototype.update = function () {
        this.baseController.update();

        var nodeOverloads = this.nodeOverloads;
        var numOverloads = nodeOverloads.length;
        var output = this.output;
        for (var o = 0; o < numOverloads; o += 1) {
            var overload = nodeOverloads[o];
            var overloadSource = overload.sourceController;
            if (overloadSource.dirty) {
                overloadSource.update();
            }
            output[overload.overloadIndex] = overloadSource.getJointWorldTransform(overload.sourceIndex);
            if (this.outputChannels.scale && !overloadSource.outputChannels.scale) {
                output[overload.overloadIndex].scale = this.mathDevice.v3Build(1, 1, 1);
            }
        }

        this.dirty = false;

        if (this.dirtyBounds) {
            this.baseController.updateBounds();
            this.dirtyBounds = false;
        }
    };

    OverloadedNodeController.prototype.updateBounds = function () {
        if (this.dirtyBounds) {
            this.baseController.updateBounds();
            this.dirtyBounds = false;
        }
    };

    // Note this is purely a transform for the given joint and doesn't include parent transforms
    OverloadedNodeController.prototype.getJointTransform = function (jointId) {
        // TODO: check if the jointId is overloaded and return the correct one
        return this.baseController.getJointTransform(jointId);
    };

    OverloadedNodeController.prototype.getJointWorldTransform = function (jointId, asMatrix) {
        // TODO: check if the jointId is overloaded and return the correct one
        return this.baseController.getJointWorldTransform(jointId, asMatrix);
    };

    OverloadedNodeController.prototype.getHierarchy = function () {
        return this.baseController.getHierarchy();
    };

    OverloadedNodeController.prototype.addOverload = function (sourceController, sourceIndex, overloadIndex) {
        // TODO: should ensure the dest overload index is unique in the list
        AnimationChannels.add(this.outputChannels, sourceController.outputChannels);
        this.nodeOverloads.push({
            sourceController: sourceController,
            sourceIndex: sourceIndex,
            overloadIndex: overloadIndex
        });
    };

    OverloadedNodeController.create = // Constructor function
    function (baseController) {
        var c = new OverloadedNodeController();
        c.baseController = baseController;
        c.bounds = baseController.bounds;
        c.output = baseController.output;
        c.outputChannels = {};
        c.nodeOverloads = [];
        c.dirty = true;
        c.dirtyBounds = true;

        c.mathDevice = TurbulenzEngine.getMathDevice();

        return c;
    };
    OverloadedNodeController.version = 1;
    return OverloadedNodeController;
})();

var ReferenceController = (function () {
    function ReferenceController() {
    }
    ReferenceController.create = // Constructor function
    function (baseController) {
        /*jshint proto:true*/
        var c = new ReferenceController();

        /*jshint nomen: false*/
        /*jshint proto: true*/
        c.__proto__ = baseController;

        /*jshint proto: false*/
        /*jshint nomen: true*/
        var setReferenceController = function setReferenceControllerFn(controller) {
            var referenceSource = this.referenceSource;
            delete this.referenceSource;
            delete this.setReferenceController;
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    referenceSource[p] = this[p];
                    delete this[p];
                }
            }

            /*jshint nomen: false*/
            /*jshint proto: true*/
            this.__proto__ = controller;

            /*jshint proto: false*/
            /*jshint nomen: true*/
            this.referenceSource = controller;
            this.setReferenceController = setReferenceController;
        };

        c.referenceSource = baseController;
        c.setReferenceController = setReferenceController;

        /*jshint proto:false*/
        return c;
    };
    return ReferenceController;
})();

// The TransitionController interpolates between the fixed state of
// input controllers across a period of time
var TransitionController = (function () {
    function TransitionController() {
    }
    TransitionController.prototype.addTime = function (delta) {
        this.dirty = true;

        // Note we don't dirty the bounds since we simply use the merged bounds of fixed states
        this.transitionTime += delta;

        while (this.transitionTime > this.transitionLength) {
            if (this.onFinishedTransitionCallback) {
                if (!this.onFinishedTransitionCallback(this)) {
                    return;
                }
            }
            this.transitionTime = this.transitionLength;
        }

        if (this.onUpdateCallback) {
            this.onUpdateCallback(this);
        }
    };

    TransitionController.prototype.update = function () {
        var mathDevice = this.mathDevice;
        var quatSlerp = mathDevice.quatSlerp;
        var v3Lerp = mathDevice.v3Lerp;
        var v3Copy = mathDevice.v3Copy;

        this.startController.update();
        this.endController.update();

        var output = this.output;
        var outputChannels = this.outputChannels;
        var outputScale = outputChannels.scale;
        var scaleOnStart = this.startController.outputChannels.scale;
        var scaleOnEnd = this.endController.outputChannels.scale;

        var startOutput = this.startController.output;
        var endOutput = this.endController.output;
        var delta = this.transitionTime / this.transitionLength;

        // For each joint slerp between the quats and return the quat pos result
        var numJoints = this.startController.getHierarchy().numNodes;
        for (var j = 0; j < numJoints; j += 1) {
            var joint = output[j];
            if (!joint) {
                output[j] = joint = {};
            }
            var j1 = startOutput[j];
            var j2 = endOutput[j];

            joint.rotation = quatSlerp.call(mathDevice, j1.rotation, j2.rotation, delta, joint.rotation);
            joint.translation = v3Lerp.call(mathDevice, j1.translation, j2.translation, delta, joint.translation);

            if (outputScale) {
                if (scaleOnStart) {
                    if (scaleOnEnd) {
                        joint.scale = v3Lerp.call(mathDevice, j1.scale, j2.scale, delta, joint.scale);
                    } else {
                        joint.scale = v3Copy.call(mathDevice, j1.scale, joint.scale);
                    }
                } else if (scaleOnEnd) {
                    joint.scale = v3Copy.call(mathDevice, j2.scale, joint.scale);
                }
            }
        }

        this.dirty = false;

        if (this.dirtyBounds) {
            this.updateBounds();
        }
    };

    TransitionController.prototype.updateBounds = function () {
        var startController = this.startController;
        var endController = this.endController;
        if (startController.dirtyBounds) {
            startController.updateBounds();
        }
        if (endController.dirtyBounds) {
            endController.updateBounds();
        }

        // accumulate the bounds as average of the center position and max of the extent
        // plus the half distance between the centers
        var boundsStart = startController.bounds;
        var boundsEnd = endController.bounds;

        var mathDevice = this.mathDevice;
        var v3Add = mathDevice.v3Add;

        var centerSum = v3Add.call(mathDevice, boundsStart.center, boundsEnd.center);
        var newCenter = mathDevice.v3ScalarMul(centerSum, 0.5, centerSum);
        this.bounds.center = newCenter;
        var newExtent = mathDevice.v3Max(boundsStart.halfExtent, boundsEnd.halfExtent);

        // Calc the largest extent for all axis
        var max = Math.max;
        var maxExt = max(newExtent[0], max(newExtent[1], newExtent[2]));
        newExtent = mathDevice.v3Build(maxExt, maxExt, maxExt);

        var centerOffset = mathDevice.v3Sub(boundsStart.center, newCenter);
        centerOffset = mathDevice.v3Abs(centerOffset, centerOffset);
        this.bounds.halfExtent = v3Add.call(mathDevice, newExtent, centerOffset, newExtent);

        this.dirtyBounds = false;
    };

    // Note this is purely a transform for the given joint and doesn't include parent transforms
    TransitionController.prototype.getJointTransform = function (jointId) {
        if (this.dirty) {
            // Note this is not necessarily the most efficient solution, we only need one joint
            this.update();
        }

        var output = this.output;
        var jointOutput = output[jointId];
        return jointOutput;
    };

    TransitionController.prototype.getJointWorldTransform = function (jointId, asMatrix) {
        if (this.dirty) {
            // May as well do a full update since we're accessing the output randomly
            this.update();
        }

        return Animation.standardGetJointWorldTransform(this, jointId, this.mathDevice, asMatrix);
    };

    TransitionController.prototype.setStartController = function (controller) {
        this.startController = controller;
        this.outputChannels = AnimationChannels.union(this.startController.outputChannels, this.endController.outputChannels);
        this.dirty = true;
        this.dirtyBounds = true;
    };

    TransitionController.prototype.setEndController = function (controller) {
        this.endController = controller;
        this.outputChannels = AnimationChannels.union(this.startController.outputChannels, this.endController.outputChannels);
        this.dirty = true;
        this.dirtyBounds = true;
    };

    TransitionController.prototype.setTransitionLength = function (length) {
        this.transitionLength = length;
        this.dirty = true;
        this.dirtyBounds = true;
    };

    TransitionController.prototype.setTime = function (time) {
        this.transitionTime = time;
        this.dirty = true;
        this.dirtyBounds = true;
    };

    TransitionController.prototype.setRate = function (rate) {
        this.rate = rate;
    };

    TransitionController.prototype.getHierarchy = function () {
        // Return the start controller, they should match anyway
        return this.startController.getHierarchy();
    };

    TransitionController.create = // Constructor function
    function (startController, endController, length) {
        var c = new TransitionController();

        var md = TurbulenzEngine.getMathDevice();
        c.mathDevice = md;
        c.bounds = { center: md.v3BuildZero(), halfExtent: md.v3BuildZero() };

        c.startController = startController;
        c.endController = endController;
        c.outputChannels = AnimationChannels.union(startController.outputChannels, endController.outputChannels);
        c.output = [];
        c.transitionTime = 0;
        c.transitionLength = length;
        c.dirty = true;
        c.dirtyBounds = true;

        return c;
    };
    TransitionController.version = 1;
    return TransitionController;
})();

// The BlendController blends between the animating state of input controllers given a user specified delta
var BlendController = (function () {
    function BlendController() {
    }
    BlendController.prototype.addTime = function (delta) {
        this.dirty = true;
        this.dirtyBounds = true;

        var controllers = this.controllers;
        var numControllers = controllers.length;
        for (var i = 0; i < numControllers; i += 1) {
            var controller = controllers[i];
            controller.addTime(delta);
        }
    };

    BlendController.prototype.update = function () {
        var mathDevice = this.mathDevice;

        // Decide the pair of controllers we'll blend between and the delta
        var controllers = this.controllers;
        var numControllers = controllers.length;
        var deltaStep = 1 / (numControllers - 1);
        var first = Math.floor(this.blendDelta / deltaStep);
        var last = Math.min(first + 1, numControllers - 1);
        var delta = (this.blendDelta - (first * deltaStep)) / deltaStep;

        var startController = controllers[first];
        var endController = controllers[last];

        startController.update();
        endController.update();

        var output = this.output;
        var outputChannels = this.outputChannels;
        var outputScale = outputChannels.scale;
        var scaleOnStart = startController.outputChannels.scale;
        var scaleOnEnd = endController.outputChannels.scale;

        var startOutput = startController.output;
        var endOutput = endController.output;

        // For each joint slerp between the quats and return the quat pos result
        var numJoints = startController.getHierarchy().numNodes;
        for (var j = 0; j < numJoints; j += 1) {
            var joint = output[j];
            if (!joint) {
                output[j] = joint = {};
            }
            var j1 = startOutput[j];
            var j2 = endOutput[j];

            joint.rotation = mathDevice.quatSlerp(j1.rotation, j2.rotation, delta, joint.rotation);
            joint.translation = mathDevice.v3Lerp(j1.translation, j2.translation, delta, joint.translation);

            if (outputScale) {
                if (scaleOnStart) {
                    if (scaleOnEnd) {
                        joint.scale = mathDevice.v3Lerp(j1.scale, j2.scale, delta, joint.scale);
                    } else {
                        joint.scale = mathDevice.v3Copy(j1.scale, joint.scale);
                    }
                } else if (scaleOnEnd) {
                    joint.scale = mathDevice.v3Copy(j2.scale, joint.scale);
                }
            }
        }

        this.dirty = false;

        if (this.dirtyBounds) {
            this.updateBounds();
        }
    };

    BlendController.prototype.updateBounds = function () {
        // Decide the pair of controllers we'll blend between and update and merge their bounds
        var controllers = this.controllers;
        var numControllers = controllers.length;
        var deltaStep = 1 / (numControllers - 1);
        var first = Math.floor(this.blendDelta / deltaStep);
        var last = Math.min(first + 1, numControllers - 1);

        var startController = controllers[first];
        var endController = controllers[last];

        if (startController.dirtyBounds) {
            startController.updateBounds();
        }
        if (endController.dirtyBounds) {
            endController.updateBounds();
        }

        // accumulate the bounds as average of the center position and max of the extent
        // plus the half distance between the centers
        var boundsStart = startController.bounds;
        var boundsEnd = endController.bounds;

        var mathDevice = this.mathDevice;

        var centerSum = mathDevice.v3Add(boundsStart.center, boundsEnd.center, this.bounds.center);
        var newCenter = mathDevice.v3ScalarMul(centerSum, 0.5, centerSum);
        this.bounds.center = newCenter;
        var newExtent = mathDevice.v3Max(boundsStart.halfExtent, boundsEnd.halfExtent, this.bounds.halfExtent);
        var centerOffset = mathDevice.v3Sub(boundsStart.center, newCenter, this.scratchV3);
        centerOffset = mathDevice.v3Abs(centerOffset, centerOffset);
        this.bounds.halfExtent = mathDevice.v3Add(newExtent, centerOffset, newExtent);

        this.dirtyBounds = false;
    };

    // Note this is purely a transform for the given joint and doesn't include parent transforms
    BlendController.prototype.getJointTransform = function (jointId) {
        if (this.dirty) {
            // Note this is not necessarily the most efficient solution, we only need one joint
            this.update();
        }

        return this.output[jointId];
    };

    BlendController.prototype.getJointWorldTransform = function (jointId, asMatrix) {
        if (this.dirty) {
            // May as well do a full update since we're accessing the output randomly
            this.update();
        }

        return Animation.standardGetJointWorldTransform(this, jointId, this.mathDevice, asMatrix);
    };

    BlendController.prototype.setBlendDelta = function (delta) {
        this.blendDelta = (0 < delta ? delta : 0);
        this.dirty = true;
        this.dirtyBounds = true;
    };

    BlendController.prototype.setTime = function (time) {
        var controllers = this.controllers;
        var numControllers = controllers.length;
        for (var i = 0; i < numControllers; i += 1) {
            var controller = controllers[i];
            controller.setTime(time);
        }
        this.dirty = true;
        this.dirtyBounds = true;
    };

    BlendController.prototype.setRate = function (rate) {
        var controllers = this.controllers;
        var numControllers = controllers.length;
        for (var i = 0; i < numControllers; i += 1) {
            controllers[i].setRate(rate);
        }
    };

    BlendController.prototype.getHierarchy = function () {
        // Return the first controller since they should all match
        return this.controllers[0].getHierarchy();
    };

    BlendController.create = // Constructor function
    function (controllers) {
        var c = new BlendController();
        c.outputChannels = {};
        c.controllers = [];
        var numControllers = controllers.length;
        c.controllers.length = numControllers;
        for (var i = 0; i < numControllers; i += 1) {
            var inputController = controllers[i];
            c.controllers[i] = inputController;

            debug.assert(inputController.getHierarchy().numNodes === c.getHierarchy().numNodes, "All controllers to a blend controller must have the same number of joints");

            AnimationChannels.add(c.outputChannels, inputController.outputChannels);
        }

        var md = TurbulenzEngine.getMathDevice();
        c.mathDevice = md;
        c.bounds = { center: md.v3BuildZero(), halfExtent: md.v3BuildZero() };

        c.output = [];
        c.blendDelta = 0;
        c.dirty = true;
        c.dirtyBounds = true;

        if (c.scratchV3 === null) {
            BlendController.prototype.scratchV3 = md.v3BuildZero();
        }

        return c;
    };
    BlendController.version = 1;
    return BlendController;
})();

BlendController.prototype.scratchV3 = null;

// The MaskController takes joints from various controllers based on a per joint mask
var MaskController = (function () {
    function MaskController() {
    }
    MaskController.prototype.addTime = function (delta) {
        this.dirty = true;
        this.dirtyBounds = true;

        var controllers = this.controllers;
        var numControllers = controllers.length;
        for (var i = 0; i < numControllers; i += 1) {
            var controller = controllers[i];
            controller.addTime(delta);
        }
    };

    MaskController.prototype.update = function () {
        var output = this.output;
        var outputChannels = this.outputChannels;
        var outputScale = outputChannels.scale;

        var mathDevice = this.mathDevice;
        var controllers = this.controllers;
        var numControllers = controllers.length;
        var masks = this.masks;
        for (var i = 0; i < numControllers; i += 1) {
            var controller = controllers[i];
            controller.update();
            var controllerOutput = controller.output;
            var controllerHasScale = controller.outputChannels.scale;
            var createScale = outputScale && !controllerHasScale;
            var mask = masks[i];

            // For each joint copy over if the mask is set
            var numJoints = controller.getHierarchy().numNodes;
            for (var j = 0; j < numJoints; j += 1) {
                var joint = output[j];
                if (!joint) {
                    output[j] = joint = {};
                }
                if (mask[j]) {
                    joint.rotation = mathDevice.quatCopy(controllerOutput[j].rotation, joint.rotation);
                    joint.translation = mathDevice.v3Copy(controllerOutput[j].translation, joint.translation);
                    if (createScale) {
                        joint.scale = mathDevice.v3BuildOne(joint.scale);
                    } else if (outputScale) {
                        joint.scale = mathDevice.v3Copy(controllerOutput[j].scale, joint.scale);
                    }
                }
            }
        }

        this.dirty = false;

        if (this.dirtyBounds) {
            this.updateBounds();
        }
    };

    MaskController.prototype.updateBounds = function () {
        // Update and merge the bounds of all the controllers
        var controllers = this.controllers;
        var numControllers = controllers.length;

        if (numControllers) {
            for (var c = 0; c < numControllers; c += 1) {
                controllers[c].updateBounds();
            }

            var bounds0 = controllers[0].bounds;
            var bounds = { center: bounds0.center, halfExtent: bounds0.halfExtent };

            var mathDevice = this.mathDevice;
            var v3Add = mathDevice.v3Add;
            var v3ScalarMul = mathDevice.v3ScalarMul;
            var v3Max = mathDevice.v3Max;
            var v3Sub = mathDevice.v3Sub;
            var v3Abs = mathDevice.v3Abs;

            for (c = 1; c < numControllers; c += 1) {
                var controller = controllers[c];
                var cBounds = controller.bounds;

                var centerSum = v3Add.call(mathDevice, bounds.center, cBounds.center);
                var newCenter = v3ScalarMul.call(mathDevice, centerSum, 0.5, centerSum);
                bounds.center = newCenter;
                var newExtent = v3Max.call(mathDevice, bounds.halfExtent, cBounds.halfExtent);
                var centerOffset = v3Sub.call(mathDevice, bounds.center, newCenter);
                centerOffset = v3Abs.call(mathDevice, centerOffset, centerOffset);
                bounds.halfExtent = v3Add.call(mathDevice, newExtent, centerOffset, newExtent);
            }

            this.bounds = bounds;
        }

        this.dirtyBounds = false;
    };

    // Note this is purely a transform for the given joint and doesn't include parent transforms
    MaskController.prototype.getJointTransform = function (jointId) {
        if (this.dirty) {
            // Note this is not necessarily the most efficient solution, we only need one joint
            this.update();
        }

        return this.output[jointId];
    };

    MaskController.prototype.getJointWorldTransform = function (jointId, asMatrix) {
        if (this.dirty) {
            // May as well do a full update since we're accessing the output randomly
            this.update();
        }

        return Animation.standardGetJointWorldTransform(this, jointId, this.mathDevice, asMatrix);
    };

    MaskController.prototype.setTime = function (time) {
        var controllers = this.controllers;
        var numControllers = controllers.length;
        for (var i = 0; i < numControllers; i += 1) {
            var controller = controllers[i];
            controller.setTime(time);
        }
        this.dirty = true;
        this.dirtyBounds = true;
    };

    MaskController.prototype.setRate = function (rate) {
        var controllers = this.controllers;
        var numControllers = controllers.length;
        for (var i = 0; i < numControllers; i += 1) {
            controllers[i].setRate(rate);
        }
    };

    MaskController.prototype.setMask = function (controllerIndex, maskJoints, maskArray) {
        var controller = this.controllers[controllerIndex];
        var hierarchy = controller.getHierarchy();
        var hierarchyNames = hierarchy.names;
        var hierarchyParents = hierarchy.parents;
        var numJoints = hierarchy.numNodes;

        var j;
        var mask;
        if (maskArray) {
            mask = maskArray.slice();
        } else {
            mask = [];
            for (j = 0; j < numJoints; j += 1) {
                mask[j] = false;
            }
        }
        this.masks[controllerIndex] = mask;

        // Build a dictionary of joint indices
        var jointDict = {};
        for (j = 0; j < numJoints; j += 1) {
            jointDict[hierarchyNames[j]] = j;
        }

        var hasParent = function hasParentFn(joint, parent) {
            while (joint !== -1) {
                if (joint === parent) {
                    return true;
                }
                joint = hierarchyParents[joint];
            }
            return false;
        };

        // Process the maskJoints string which is of the form
        // " *origin *hips -*waist "
        var maskList = maskJoints.split(" ");
        var numElements = maskList.length;
        for (var e = 0; e < numElements; e += 1) {
            var setValue = true;
            var maskStr = maskList[e];
            if (maskStr !== "") {
                if (maskStr[0] === "-") {
                    setValue = false;
                    maskStr = maskStr.slice(1);
                }
                if (maskStr[0] === "*") {
                    maskStr = maskStr.slice(1);
                    var rootIndex = jointDict[maskStr];
                    for (j = 0; j < numJoints; j += 1) {
                        if (j === rootIndex || hasParent(j, rootIndex)) {
                            mask[j] = setValue;
                        }
                    }
                } else {
                    mask[jointDict[maskStr]] = setValue;
                }
            }
        }
    };

    MaskController.prototype.getHierarchy = function () {
        // Return the first controller since they should all match
        return this.controllers[0].getHierarchy();
    };

    MaskController.create = // Constructor function
    function (controllers) {
        var c = new MaskController();
        c.outputChannels = {};
        c.controllers = [];
        c.masks = [];
        var numControllers = controllers.length;
        c.controllers.length = numControllers;
        for (var i = 0; i < numControllers; i += 1) {
            var inputController = controllers[i];
            c.controllers[i] = inputController;

            debug.assert(inputController.getHierarchy().numNodes === c.getHierarchy().numNodes, "All controllers to a mask controller must have the same number of joints");

            AnimationChannels.add(c.outputChannels, inputController.outputChannels);
        }

        var md = TurbulenzEngine.getMathDevice();
        c.mathDevice = md;
        c.bounds = { center: md.v3BuildZero(), halfExtent: md.v3BuildZero() };

        c.output = [];
        c.dirty = true;
        c.dirtyBounds = true;

        return c;
    };
    MaskController.version = 1;
    return MaskController;
})();

// The PoseController allows the user to set a fixed set of joint transforms to pose a hierarchy
var PoseController = (function () {
    function PoseController() {
    }
    // Controller Base End
    /* tslint:disable:no-empty */
    PoseController.prototype.addTime = function (delta) {
    };

    PoseController.prototype.update = function () {
    };

    /* tslint:enable:no-empty */
    PoseController.prototype.updateBounds = function () {
        if (this.dirtyBounds) {
            // First generate ltms for the pose
            var md = this.mathDevice;
            var output = this.output;
            var numJoints = this.hierarchy.numNodes;
            var parents = this.hierarchy.parents;
            var ltms = [];
            var jointMatrix, joint;
            for (var j = 0; j < numJoints; j += 1) {
                joint = output[j];
                if (joint.scale) {
                    jointMatrix = md.m43FromRTS(joint.rotation, joint.translation, joint.scale, jointMatrix);
                } else {
                    jointMatrix = md.m43FromRT(joint.rotation, joint.translation, jointMatrix);
                }

                var parent = parents[j];
                if (parent !== -1) {
                    ltms[j] = md.m43Mul(jointMatrix, ltms[parent], ltms[j]);
                } else {
                    ltms[j] = md.m43Copy(jointMatrix, ltms[j]);
                }
            }

            // Now add all the positions to a bbox
            var maxNumber = Number.MAX_VALUE;
            var min = md.v3Build(maxNumber, maxNumber, maxNumber);
            var max = md.v3Build(-maxNumber, -maxNumber, -maxNumber);
            for (j = 0; j < numJoints; j += 1) {
                jointMatrix = ltms[j];
                var pos = md.m43Pos(jointMatrix);
                min = md.v3Min(min, pos);
                max = md.v3Max(max, pos);
            }

            // Now set the bounds
            this.bounds.center = md.v3ScalarMul(md.v3Add(min, max), 0.5);
            this.bounds.halfExtent = md.v3ScalarMul(md.v3Sub(max, min), 0.5);
        }

        this.dirtyBounds = false;
    };

    // Note this is purely a transform for the given joint and doesn't include parent transforms
    PoseController.prototype.getJointTransform = function (jointId) {
        var output = this.output;
        return output[jointId];
    };

    PoseController.prototype.getJointWorldTransform = function (jointId, asMatrix) {
        return Animation.standardGetJointWorldTransform(this, jointId, this.mathDevice, asMatrix);
    };

    /* tslint:disable:no-empty */
    PoseController.prototype.setTime = function (time) {
    };

    PoseController.prototype.setRate = function (rate) {
    };

    /* tslint:enable:no-empty */
    PoseController.prototype.setOutputChannels = function (channels) {
        this.outputChannels = channels;
    };

    PoseController.prototype.setJointPose = function (jointIndex, rotation, translation, scale) {
        // TODO: should I clone the math structures
        this.output[jointIndex].rotation = rotation;
        this.output[jointIndex].translation = translation;
        this.output[jointIndex].scale = scale;
        this.dirtyBounds = true;
    };

    PoseController.prototype.getHierarchy = function () {
        // Return the first controller since they should all match
        return this.hierarchy;
    };

    PoseController.create = // Constructor function
    function (hierarchy) {
        var mathDevice = TurbulenzEngine.getMathDevice();

        var c = new PoseController();
        c.hierarchy = hierarchy;

        var md = TurbulenzEngine.getMathDevice();
        c.mathDevice = md;
        c.bounds = { center: md.v3BuildZero(), halfExtent: md.v3BuildZero() };

        var output = [];
        c.output = output;
        c.outputChannels = {};

        // Initialize the output based on the hierarchy joint count
        var identityQuat = mathDevice.quatBuild(0, 0, 0, 1);
        var identityPos = mathDevice.v3BuildZero();
        var identityScale = mathDevice.v3BuildOne();
        var numJoints = hierarchy.numNodes;
        for (var j = 0; j < numJoints; j += 1) {
            output[j] = { rotation: identityQuat, translation: identityPos, scale: identityScale };
        }
        c.dirtyBounds = true;

        return c;
    };
    PoseController.version = 1;
    return PoseController;
})();

//
// NodeTransformController
//
var NodeTransformController = (function () {
    function NodeTransformController() {
    }
    NodeTransformController.prototype.addTime = function (delta) {
        this.inputController.addTime(delta);
        this.dirty = true;
    };

    NodeTransformController.prototype.setInputController = function (input) {
        this.inputController = input;
        this.dirty = true;
    };

    NodeTransformController.prototype.setHierarchy = function (hierarchy, fromNode) {
        var matchJointHierarchy = function matchJointHierarchyFn(rootIndex, rootNode, nodesMap, numJoints, jointNames, jointParents) {
            nodesMap[rootIndex] = rootNode;

            var nextIndex = rootIndex + 1;
            while (nextIndex < numJoints) {
                var nextJointParent = jointParents[nextIndex];
                var nextJointName = jointNames[nextIndex];
                if (nextJointParent !== rootIndex) {
                    // nextJoint doesn't have me as a parent so we must be going back up the hierarchy
                    return nextIndex;
                } else {
                    var foundChild = false;
                    var jointNode;
                    if (rootNode) {
                        // Try and find a node matching the joint name
                        var jointName = nextJointName;
                        var children = rootNode.children;
                        if (children) {
                            var numChildren = children.length;
                            for (var c = 0; c < numChildren; c += 1) {
                                var child = rootNode.children[c];
                                if (child.name === jointName) {
                                    foundChild = true;
                                    nextIndex = matchJointHierarchy(nextIndex, child, nodesMap, numJoints, jointNames, jointParents);
                                }
                            }
                        }
                    }

                    if (!foundChild) {
                        nextIndex = matchJointHierarchy(nextIndex, jointNode, nodesMap, numJoints, jointNames, jointParents);
                    }
                }
            }

            return nextIndex;
        };

        this.hierarchy = hierarchy;
        this.dirty = true;

        var jointNames = hierarchy.names;
        var jointParents = hierarchy.parents;
        var numJoints = hierarchy.numNodes;
        for (var j = 0; j < numJoints; j += 1) {
            var parentIndex = jointParents[j];
            if (parentIndex === -1) {
                var rootNode = null;

                if (fromNode && fromNode.name === jointNames[j]) {
                    rootNode = fromNode;
                } else {
                    rootNode = this.scene.findNode(jointNames[j]);
                }

                if (rootNode) {
                    j = matchJointHierarchy(j, rootNode, this.nodesMap, numJoints, jointNames, jointParents);

                    // matchJointHierarchy returns the next joint to process but the loop will step to the node after
                    j -= 1;
                }
            }
        }
    };

    NodeTransformController.prototype.setScene = function (scene) {
        this.scene = scene;
        this.setHierarchy(this.hierarchy);
    };

    NodeTransformController.prototype.update = function () {
        if (!this.dirty && !this.inputController.dirty) {
            return;
        }

        if (this.inputController.dirty) {
            this.inputController.update();
        }

        var mathDevice = this.mathDevice;

        // convert the input interpolator quat pos data into skinning matrices
        var node;

        var interpOut = this.inputController.output;
        var interpChannels = this.inputController.outputChannels;
        var hasScale = interpChannels.scale;
        var hierarchy = this.hierarchy;
        var nodesMap = this.nodesMap;
        var ltms = this.ltms;
        var numJoints = hierarchy.numNodes;

        var jointMatrix, quatPos;

        for (var j = 0; j < numJoints; j += 1) {
            var interpVal = interpOut[j];

            if (hasScale) {
                jointMatrix = mathDevice.m43FromRTS(interpVal.rotation, interpVal.translation, interpVal.scale, jointMatrix);
            } else {
                quatPos = mathDevice.quatPosBuild(interpVal.rotation, interpVal.translation, quatPos);
                jointMatrix = mathDevice.m43FromQuatPos(quatPos, ltms[j]);
            }

            node = nodesMap[j];
            if (node) {
                node.setLocalTransform(jointMatrix);
            }
        }

        this.dirty = false;
    };

    NodeTransformController.create = // Constructor function
    function (hierarchy, scene) {
        var c = new NodeTransformController();

        var numNodes = hierarchy.numNodes;
        c.dirty = true;
        c.ltms = [];
        c.ltms.length = numNodes;
        c.nodesMap = [];
        c.nodesMap.length = numNodes;
        c.scene = scene;
        c.setHierarchy(hierarchy);

        c.mathDevice = TurbulenzEngine.getMathDevice();

        return c;
    };
    NodeTransformController.version = 1;
    return NodeTransformController;
})();

//
// SkinController
//
var SkinController = (function () {
    function SkinController() {
    }
    SkinController.prototype.setInputController = function (input) {
        this.inputController = input;
        this.dirty = true;
    };

    SkinController.prototype.setSkeleton = function (skeleton) {
        this.skeleton = skeleton;
        this.dirty = true;

        // Update the size of our buffers
        var newNumBones = skeleton.numNodes;
        this.ltms.length = newNumBones;
        this.output.length = newNumBones;
    };

    SkinController.prototype.update = function () {
        if (!this.dirty && !this.inputController.dirty) {
            return;
        }

        if (this.inputController.dirty) {
            this.inputController.update();
        }

        // convert the input interpolator quat pos data into skinning matrices
        var md = this.md;
        var interpOut = this.inputController.output;
        var interpChannels = this.inputController.outputChannels;
        var hasScale = interpChannels.scale;
        var invBoneLTMs = this.skeleton.invBoneLTMs;
        var jointParents = this.skeleton.parents;
        var ltms = this.ltms;
        var output = this.output;
        var numBones = this.skeleton.numNodes;
        for (var b = 0; b < numBones; b += 1) {
            var interpVal = interpOut[b];
            var boneMatrix;
            if (hasScale) {
                boneMatrix = md.m43FromRTS(interpVal.rotation, interpVal.translation, interpVal.scale, ltms[b]);
            } else {
                boneMatrix = md.m43FromRT(interpVal.rotation, interpVal.translation, ltms[b]);
            }
            var parentIndex = jointParents[b];
            if (parentIndex !== -1) {
                boneMatrix = md.m43Mul(boneMatrix, ltms[parentIndex], ltms[b]);
            }
            ltms[b] = boneMatrix;
            output[b] = md.m43MulTranspose(invBoneLTMs[b], boneMatrix, output[b]);
        }
        this.dirty = false;
    };

    SkinController.create = // Constructor function
    function (md) {
        var c = new SkinController();

        c.md = md;
        c.dirty = true;
        c.ltms = [];
        c.output = [];

        return c;
    };
    SkinController.version = 1;
    return SkinController;
})();

//
// GPUSkinController
//
var GPUSkinController = (function () {
    function GPUSkinController() {
    }
    GPUSkinController.prototype.setInputController = function (input) {
        this.inputController = input;
        this.dirty = true;
    };

    GPUSkinController.prototype.setSkeleton = function (skeleton) {
        var oldNumBones = -1;
        if (this.skeleton) {
            oldNumBones = this.skeleton.numNodes;
        }
        this.skeleton = skeleton;
        this.dirty = true;

        // Update the size of our buffers
        var newNumBones = skeleton.numNodes;
        if (oldNumBones !== newNumBones) {
            this.ltms.length = newNumBones;
            var size = this.bufferSize || (newNumBones * 12);
            this.output = this.gd.createTechniqueParameterBuffer({
                numFloats: size,
                dynamic: true
            });
        }
    };

    GPUSkinController.prototype.update = function () {
        if (!this.dirty && !this.inputController.dirty) {
            return;
        }

        if (this.inputController.dirty) {
            this.inputController.update();
        }

        // convert the input interpolator quat pos data into skinning matrices
        var output = this.output;
        var md = this.md;
        var interpOut = this.inputController.output;
        var interpChannels = this.inputController.outputChannels;
        var hasScale = interpChannels.scale;
        var invBoneLTMs = this.skeleton.invBoneLTMs;
        var jointParents = this.skeleton.parents;
        var ltms = this.ltms;
        var outputMat = this.outputMat;
        var convertedquatPos = this.convertedquatPos;
        var numBones = this.skeleton.numNodes;
        var offset = 0;
        var ltm;
        for (var b = 0; b < numBones; b += 1) {
            var interpVal = interpOut[b];
            var parentIndex = jointParents[b];

            if (parentIndex !== -1) {
                if (hasScale) {
                    convertedquatPos = md.m43FromRTS(interpVal.rotation, interpVal.translation, interpVal.scale, convertedquatPos);
                } else {
                    convertedquatPos = md.m43FromRT(interpVal.rotation, interpVal.translation, convertedquatPos);
                }
                ltms[b] = ltm = md.m43Mul(convertedquatPos, ltms[parentIndex], ltms[b]);
            } else {
                if (hasScale) {
                    ltms[b] = ltm = md.m43FromRTS(interpVal.rotation, interpVal.translation, interpVal.scale, ltms[b]);
                } else {
                    ltms[b] = ltm = md.m43FromRT(interpVal.rotation, interpVal.translation, ltms[b]);
                }
            }

            outputMat = md.m43MulTranspose(invBoneLTMs[b], ltm, outputMat);
            output.setData(outputMat, offset, 12);
            offset += 12;
        }

        this.dirty = false;
    };

    GPUSkinController.setDefaultBufferSize = function (size) {
        GPUSkinController.prototype.defaultBufferSize = size;
    };

    GPUSkinController.create = // Constructor function
    function (gd, md, bufferSize) {
        var c = new GPUSkinController();

        c.md = md;
        c.gd = gd;
        c.dirty = true;
        c.ltms = [];
        c.outputMat = md.m34BuildIdentity();
        c.convertedquatPos = md.m43BuildIdentity();
        c.bufferSize = bufferSize || GPUSkinController.prototype.defaultBufferSize;

        return c;
    };
    GPUSkinController.version = 1;
    return GPUSkinController;
})();

GPUSkinController.prototype.defaultBufferSize = undefined;

//
// SkinnedNode
//
// TODO: Extends SceneNode?
var SkinnedNode = (function () {
    function SkinnedNode() {
    }
    SkinnedNode.prototype.addTime = function (delta) {
        this.input.addTime(delta);
        this.skinController.dirty = true;
    };

    SkinnedNode.prototype.setNodeHierarchyBoneMatricesAndBounds = function (node, extents, skinController) {
        var isFullySkinned = (!node.lightInstances || node.lightInstances.length === 0);

        var renderables = node.renderables;
        if (renderables) {
            var numRenderables = renderables.length;
            for (var i = 0; i < numRenderables; i += 1) {
                var renderable = renderables[i];
                if (renderable.isSkinned()) {
                    renderable.skinController = skinController;
                    renderable.addCustomWorldExtents(extents);
                } else {
                    isFullySkinned = false;
                }
            }
        }

        var children = node.children;
        if (children) {
            var numChildren = children.length;
            for (var c = 0; c < numChildren; c += 1) {
                var childSkinned = this.setNodeHierarchyBoneMatricesAndBounds(children[c], extents, skinController);
                if (!childSkinned) {
                    isFullySkinned = false;
                }
            }
        }

        if (isFullySkinned) {
            node.addCustomWorldExtents(extents);
        } else {
            if (node.getCustomWorldExtents()) {
                node.removeCustomWorldExtents();
            }
        }

        return isFullySkinned;
    };

    SkinnedNode.prototype.update = function (updateSkinController) {
        // update the skin controller
        var skinController = this.skinController;
        if (updateSkinController) {
            skinController.update();
        } else {
            if (this.input.dirtyBounds) {
                this.input.updateBounds();
            }
        }

        // calculate the bounds in world space
        var bounds = skinController.inputController.bounds;
        var extents = this.scratchExtents;
        var matrix = this.node.getWorldTransform();
        var c0 = bounds.center[0];
        var c1 = bounds.center[1];
        var c2 = bounds.center[2];
        var h0 = bounds.halfExtent[0];
        var h1 = bounds.halfExtent[1];
        var h2 = bounds.halfExtent[2];
        if (matrix) {
            var abs = Math.abs;

            var m0 = matrix[0];
            var m1 = matrix[1];
            var m2 = matrix[2];
            var m3 = matrix[3];
            var m4 = matrix[4];
            var m5 = matrix[5];
            var m6 = matrix[6];
            var m7 = matrix[7];
            var m8 = matrix[8];

            var ct0, ct1, ct2;
            if (c0 !== 0 || c1 !== 0 || c2 !== 0) {
                ct0 = (m0 * c0 + m3 * c1 + m6 * c2 + matrix[9]);
                ct1 = (m1 * c0 + m4 * c1 + m7 * c2 + matrix[10]);
                ct2 = (m2 * c0 + m5 * c1 + m8 * c2 + matrix[11]);
            } else {
                ct0 = matrix[9];
                ct1 = matrix[10];
                ct2 = matrix[11];
            }

            var ht0 = (abs(m0) * h0 + abs(m3) * h1 + abs(m6) * h2);
            var ht1 = (abs(m1) * h0 + abs(m4) * h1 + abs(m7) * h2);
            var ht2 = (abs(m2) * h0 + abs(m5) * h1 + abs(m8) * h2);

            extents[0] = (ct0 - ht0);
            extents[1] = (ct1 - ht1);
            extents[2] = (ct2 - ht2);
            extents[3] = (ct0 + ht0);
            extents[4] = (ct1 + ht1);
            extents[5] = (ct2 + ht2);
        } else {
            extents[0] = (c0 - h0);
            extents[1] = (c1 - h1);
            extents[2] = (c2 - h2);
            extents[3] = (c0 + h0);
            extents[4] = (c1 + h1);
            extents[5] = (c2 + h2);
        }

        this.setNodeHierarchyBoneMatricesAndBounds(this.node, extents, skinController);
    };

    SkinnedNode.prototype.getJointIndex = function (jointName) {
        var jointNames = this.skinController.skeleton.names;
        var numBones = this.skinController.skeleton.numNodes;
        var jointIndex = -1;
        for (var b = 0; b < numBones; b += 1) {
            if (jointNames[b] === jointName) {
                jointIndex = b;
                break;
            }
        }
        return jointIndex;
    };

    SkinnedNode.prototype.getJointLTM = function (jointIndex, dst) {
        if (this.input.dirty) {
            this.input.update();
        }

        // convert the input quat pos data into skinning matrices
        var md = this.md;
        var interpOut = this.input.output;
        var interpChannels = this.input.outputChannels;
        var hasScale = interpChannels.scale;

        var jointParents = this.skinController.skeleton.parents;

        var jointOutput = interpOut[jointIndex];

        var boneMatrix;
        if (hasScale) {
            boneMatrix = md.m43FromRTS(jointOutput.rotation, jointOutput.translation, jointOutput.scale, dst);
        } else {
            boneMatrix = md.m43FromRT(jointOutput.rotation, jointOutput.translation, dst);
        }

        var parentMatrix = this.scratchM43;

        while (jointParents[jointIndex] !== -1) {
            jointIndex = jointParents[jointIndex];
            jointOutput = interpOut[jointIndex];
            if (hasScale) {
                parentMatrix = md.m43FromRTS(jointOutput.rotation, jointOutput.translation, jointOutput.scale, parentMatrix);
            } else {
                parentMatrix = md.m43FromRT(jointOutput.rotation, jointOutput.translation, parentMatrix);
            }
            boneMatrix = md.m43Mul(boneMatrix, parentMatrix, boneMatrix);
        }
        return boneMatrix;
    };

    SkinnedNode.prototype.setInputController = function (controller) {
        this.input = controller;
        this.skinController.setInputController(controller);
        this.skinController.dirty = true;
    };

    SkinnedNode.prototype.getSkeleton = function () {
        return this.skinController.skeleton;
    };

    SkinnedNode.create = // Constructor function
    function (gd, md, node, skeleton, inputController, bufferSize) {
        var sn = new SkinnedNode();

        sn.md = md;
        sn.input = inputController;
        if (gd) {
            sn.skinController = GPUSkinController.create(gd, md, bufferSize);
        } else {
            sn.skinController = SkinController.create(md);
        }

        if (sn.input) {
            sn.skinController.setInputController(sn.input);
        }
        sn.skinController.setSkeleton(skeleton);
        sn.node = node;

        if (sn.scratchM43 === null) {
            SkinnedNode.prototype.scratchM43 = md.m43BuildIdentity();
        }

        if (sn.scratchExtents === null) {
            SkinnedNode.prototype.scratchExtents = md.aabbBuildEmpty();
        }

        return sn;
    };
    SkinnedNode.version = 1;
    return SkinnedNode;
})();

SkinnedNode.prototype.scratchM43 = null;
SkinnedNode.prototype.scratchExtents = null;
