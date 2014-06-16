// Copyright (c) 2009-2012 Turbulenz Limited

/*jshint bitwise: false*/
/*global debug: false*/
/*global Float32Array: false*/

function SimpleSprite(globals)
{
    this.globals = globals;
    var gd = globals.graphicsDevice;

    debug.evaluate(this.maxSprites *= 32);
    debug.assert(this.maxSprites * 6 < 1<<16); // Must fit in 16 bit indicies.

    // Index buffer generation.
    var numIndexBufferIndices = 6 * this.maxSprites;

    var indexBufferParameters = {
        numIndices: numIndexBufferIndices,
        format: 'USHORT'
    };

    var indexBuffer = gd.createIndexBuffer(indexBufferParameters);

    var writer = indexBuffer.map();
    if (writer)
    {
        var v0, v1, v2, v3;
        for (var i = 0; i < this.maxSprites; i += 1)
        {
            v0 = 4 * i + 0;
            v1 = 4 * i + 1;
            v2 = 4 * i + 2;
            v3 = 4 * i + 3;
            writer(v0, v1, v2);
            writer(v2, v1, v3);
        }

        indexBuffer.unmap(writer);
    }

    this.indexBuffer = indexBuffer;

    this.numVerticesPerParticle = 4;
    this.numVertexBufferVertices = this.numVerticesPerParticle * this.maxSprites;

    var vertexBufferParameters = {
        numVertices : this.numVertexBufferVertices,
        attributes : ['FLOAT3', 'FLOAT2', 'FLOAT4'],
        dynamic : true,
        'transient': true
    };

    // Dynamic vertexBuffer created for changing position and vertex color
    this.vertexBuffer = gd.createVertexBuffer(vertexBufferParameters);
    this.semantics = gd.createSemantics([gd.SEMANTIC_POSITION, gd.SEMANTIC_TEXCOORD, gd.SEMANTIC_COLOR]);
    this.primitive = gd.PRIMITIVE_TRIANGLES;
    this.globalTechniqueParameters = gd.createTechniqueParameters(
        {
            worldViewProjection: null
        });
    this.localTechniqueParameters = gd.createTechniqueParameters(
        {
            diffuse: null
        });


    var md = globals.mathDevice;

    this.spriteList = [];
    this.spriteCache = [];

    var floatArray = new Float32Array(this.maxSprites * (3 + 4 + 3 + 4));
    var offset = 0;

    for (var index = 0; index < this.maxSprites; index += 1)
    {
        this.spriteCache[index] = {v3location  :   md.v3BuildZero(floatArray.subarray(offset, offset + 3)),
                                   sizeX       :   0.0,
                                   sizeY       :   0.0,
                                   v4color     :   md.v4BuildOne(floatArray.subarray(offset + 3, offset + 7)),
                                   texture     :   null,
                                   blendStyle  :   this.blendStyle.NORMAL,
                                   out         :   md.v3BuildZero(floatArray.subarray(offset + 7, offset + 10)),
                                   outValid    :   false,
                                   angle       :   0.0,
                                   offsetX     :   0.0,
                                   offsetY     :   0.0,
                                   offsetAngle :   0.0,
                                   uvRectangle :   md.v4BuildZero(floatArray.subarray(offset + 10, offset + 14))
                                  };
        offset += 14;
    }

    this.scratchPad = {
        thisUp: md.v3BuildOne(),
        thisRight : md.v3BuildOne(),
        rightScaled : md.v3BuildOne(),
        upScaled : md.v3BuildOne(),
        yAxis : md.v3BuildYAxis(),
        tr : md.v3BuildOne(),
        tl : md.v3BuildOne(),
        br : md.v3BuildOne(),
        bl : md.v3BuildOne()
    };

    this.writerArray = new Float32Array(this.numVertexBufferVertices * 9);
}

SimpleSprite.prototype =
{
    maxSprites : 256,

    blendStyle :
    {
        NORMAL : 0,
        ADD : 1,
        NORMAL_NO_Z : 2,
        ADD_NO_Z : 3//,
        //INVERT : 4
    },

    blendNames :
    [
        "blend_particle",
        "add_particle",
        "blend_particle_no_z",
        "add_particle_no_z"//,
        //'invfilter_particle'
    ],

    alignment :
    {
        CAMERA : 'camera',
        HORIZONTAL : 'horizontal',
        DIRECTION : 'direction',
        VERTICAL_CAMERA : 'verticalCamera',
        VERTICAL_DIRECTION : 'verticalDirection'
    },

    alignmentMap :
    {
        camera : function simplespriteCameraFn()
        {
            return false; //Default
        },

        horizontal : function simplespriteHorizontalFn(v3Direction, v3Out)
        {
            var md = this.globals.mathDevice;

            md.v3BuildYAxis(v3Out);

            return true;
        },

        direction : function simplespriteDirectionFn(v3Direction, v3Out)
        {
            if (!v3Direction)
            {
                return false;
            }
            var md = this.globals.mathDevice;

            md.v3Copy(v3Direction, v3Out);
        },

        verticalCamera : function simplespriteVerticalCameraFn(v3Direction, v3Out)
        {
            var globals = this.globals;
            var md = globals.mathDevice;
            var camera = globals.camera;
            var cameraMatrix;

            cameraMatrix = camera.matrix;

            md.m43At(cameraMatrix, v3Out);
            v3Out[0] *= -1.0;
            v3Out[1] = 0.0;
            v3Out[2] *= -1.0;

            if (md.v3LengthSq(v3Out) < 0.0001)
            {
                return false;
            }
            md.v3Normalize(v3Out, v3Out);

            return true;
        },

        verticalDirection : function simplespriteVerticalDirectionFn(v3Direction, v3Out)
        {
            if (!v3Direction)
            {
                return false;
            }

            var globals = this.globals;
            var md = globals.mathDevice;

            md.v3Copy(v3Direction, v3Out);
            v3Out[1] = 0.0;

            if (md.v3LengthSq(v3Out) < 0.0001)
            {
                return false;
            }
            md.v3Normalize(v3Out, v3Out);

            return true;
        }
    },

    buildv3Direction : function simplespriteBuildv3DirectionFn(alignment, v3Direction, v3Out)
    {
        return this.alignmentMap[alignment].call(this, v3Direction, v3Out);
    },

    addSprite : function simpleSpriteAddSpriteFn(params) //v3location, size, v4color, texture, blendStyle, v3Direction, alignment
    {
        if (this.spriteList.length >= this.maxSprites)
        {
            return;
        }

        var md  =   this.globals.mathDevice;

        var sprite_to_add = this.spriteCache[this.spriteList.length];

        sprite_to_add.v3location = params.v3Location ? md.v3Copy(params.v3Location, sprite_to_add.v3location) : md.v3BuildZero(sprite_to_add.v3location);
        sprite_to_add.sizeX = params.sizeX !== undefined ? params.sizeX : (params.size !== undefined ? params.size : 1.0);
        sprite_to_add.sizeY = params.sizeY !== undefined ? params.sizeY : (params.size !== undefined ? params.size : 1.0);
        sprite_to_add.v4color = params.v4color ? md.v4Copy(params.v4color, sprite_to_add.v4color) : md.v4BuildOne(sprite_to_add.v4color);

        if (params.v3color)
        {
            sprite_to_add.v4color = md.v4BuildFromv3(params.v3color, sprite_to_add.v4color);
        }
        if (params.alpha)
        {
            sprite_to_add.v4color[3] = params.alpha;
        }

        sprite_to_add.texture = params.texture ? params.texture : "textures/Test.dds";
        sprite_to_add.blendStyle = params.blendStyle ? params.blendStyle : this.blendStyle.NORMAL;

        sprite_to_add.outValid = false;
        if (params.alignment)
        {
            if (this.buildv3Direction(params.alignment ? params.alignment : this.alignment.CAMERA, params.v3Direction, sprite_to_add.out))
            {
                sprite_to_add.outValid = true;
            }
        }
        else if (params.out)
        {
            sprite_to_add.out      = md.v3Copy(params.out, sprite_to_add.out);
            sprite_to_add.outValid = true;
        }

        sprite_to_add.angle = params.angle ? params.angle : 0.0;
        sprite_to_add.offsetX = params.offsetX ? params.offsetX : 0.0;
        sprite_to_add.offsetY = params.offsetY ? params.offsetY : 0.0;
        sprite_to_add.offsetAngle = params.offsetAngle ? params.offsetAngle : 0.0;

        if (params.uvRectangle)
        {
            md.v4Copy(params.uvRectangle, sprite_to_add.uvRectangle);
        }
        else
        {
            md.v4Build(0.0, 0.0, 1.0, 1.0, sprite_to_add.uvRectangle);
        }

        this.spriteList.push(sprite_to_add);
    },

    drawSprites : function simpleSpriteDrawSpriteFn()
    {
        if (this.spriteList.length === 0)
        {
            return;
        }

        var globals =   this.globals;
        var md      =   globals.mathDevice;
        var camera  =   globals.camera;
        var tm      =   globals.textureManager;
        var gd      =   globals.graphicsDevice;
        var sm      =   globals.shaderManager;
        var sbs     =   globals.simpleBlendStyle;
        var gpfx    =   globals.gamePostEffects;

        var sprite_list =   this.spriteList;
        var num_sprites =   sprite_list.length;
//        var number_of_verts_to_change = 4 * num_sprites;

        var sprites_drawn = 0;
        var sprites_to_be_drawn = 0;

        var that = this;

        var rootTwo = Math.sqrt(2.0);
        var fortyFive = Math.PI * 0.25;
        var sin_value;
        var cos_value;

        var writerArray = this.writerArray;
        var writerIndex = 0;

        function writer(position, u, v, color)
        {
            writerArray[writerIndex]      = position[0];
            writerArray[writerIndex + 1]  = position[1];
            writerArray[writerIndex + 2]  = position[2];
            writerArray[writerIndex + 3]  = u;
            writerArray[writerIndex + 4]  = v;
            writerArray[writerIndex + 5]  = color[0];
            writerArray[writerIndex + 6]  = color[1];
            writerArray[writerIndex + 7]  = color[2];
            writerArray[writerIndex + 8]  = color[3];
            writerIndex += 9;
        }

        var doDraw = function doDrawFn()
        {
            that.vertexBuffer.setData(writerArray, 0, sprites_to_be_drawn * 4);
            writerIndex = 0;

            if (sprites_to_be_drawn === 1)
            {
                gd.draw(gd.PRIMITIVE_TRIANGLE_STRIP, 4, 0);
            }
            else
            {
                gd.drawIndexed(gd.PRIMITIVE_TRIANGLES, sprites_to_be_drawn * 6, 0);
            }

            sprites_drawn += sprites_to_be_drawn;
            sprites_to_be_drawn =   0;
        };

        gd.setStream(this.vertexBuffer, this.semantics);
        gd.setIndexBuffer(this.indexBuffer);

        sbs.prime(gd, camera, globals.gamePostEffects);

        if (writer)
        {
            var cameraMatrix = camera.matrix;

            var scratchPad = this.scratchPad;
            var thisUp = md.v3BuildOne(scratchPad.thisUp);
            var thisRight = md.v3BuildOne(scratchPad.thisRight);

            var rightScaled = md.v3BuildOne(scratchPad.rightScaled);
            var upScaled = md.v3BuildOne(scratchPad.upScaled);
            var yAxis = md.v3BuildYAxis(scratchPad.yAxis);

            var tr  = md.v3BuildOne(scratchPad.tr);
            var tl  = md.v3BuildOne(scratchPad.tl);
            var br  = md.v3BuildOne(scratchPad.br);
            var bl  = md.v3BuildOne(scratchPad.bl);

            for (var i = 0; i < num_sprites; i += 1)
            {
                var this_sprite = sprite_list[i];

                var this_blendStyle = this_sprite.blendStyle;
                var this_texture    = this_sprite.texture;

                if (sbs.isNewStyleOrTexture(this_blendStyle, this_texture))
                {
                    if (sprites_to_be_drawn > 0)
                    {
                        doDraw();
                    }

                    sbs.setStyleAndTexture(tm, sm, gd, gpfx, this_blendStyle, this_texture);
                }

                var position    = this_sprite.v3location;
                var sizeX       = this_sprite.sizeX;
                var sizeY       = this_sprite.sizeY;

                if (this_sprite.outValid)
                {
                    if (Math.abs(this_sprite.out[1]) === 1.0)
                    {
                        md.v3BuildZAxis(thisUp);
                        md.v3BuildXAxis(thisRight);
                    }
                    else
                    {
                        md.v3Cross(this_sprite.out, yAxis, thisRight);
                        md.v3Cross(thisRight, this_sprite.out, thisUp);

                        md.v3Normalize(thisRight, thisRight);
                        md.v3Normalize(thisUp, thisUp);
                    }

                    md.v3Neg(thisRight, thisRight);
                }
                else
                {
                    md.m43Up(cameraMatrix, thisUp);
                    md.m43Right(cameraMatrix, thisRight);
                }

                md.v3ScalarMul(thisRight, sizeX, rightScaled);
                md.v3ScalarMul(thisUp, sizeY, upScaled);

                if (this_sprite.offsetX !== 0.0 || this_sprite.offsetY)
                {
                    if (this_sprite.offsetAngle !== 0.0)
                    {
                        sin_value   =   Math.sin(this_sprite.offsetAngle);
                        cos_value   =   Math.cos(this_sprite.offsetAngle);

                        md.v3AddScalarMul(position, thisRight, this_sprite.offsetX * cos_value, position);
                        md.v3AddScalarMul(position, thisUp, -this_sprite.offsetX * sin_value, position);

                        md.v3AddScalarMul(position, thisRight, this_sprite.offsetY * sin_value, position);
                        md.v3AddScalarMul(position, thisUp, this_sprite.offsetY * cos_value, position);
                    }
                    else
                    {
                        md.v3AddScalarMul(position, thisRight, this_sprite.offsetX, position);
                        md.v3AddScalarMul(position, thisUp, this_sprite.offsetY, position);
                    }
                }

                if (this_sprite.angle !== 0.0)
                {
                    sin_value   =   Math.sin(this_sprite.angle + fortyFive) * rootTwo;
                    cos_value   =   Math.cos(this_sprite.angle + fortyFive) * rootTwo;

                    md.v3AddScalarMul(position, rightScaled, sin_value,  tr);
                    md.v3AddScalarMul(tr,       upScaled,    cos_value,  tr);

                    md.v3AddScalarMul(position, rightScaled, -cos_value, tl);
                    md.v3AddScalarMul(tl,       upScaled,    sin_value,  tl);

                    md.v3AddScalarMul(position, rightScaled, cos_value,  br);
                    md.v3AddScalarMul(br,       upScaled,    -sin_value, br);

                    md.v3AddScalarMul(position, rightScaled, -sin_value, bl);
                    md.v3AddScalarMul(bl,       upScaled,    -cos_value, bl);
                }
                else
                {
                    md.v3Add(position, rightScaled, tr);
                    md.v3Add(tr,       upScaled,    tr);

                    md.v3Sub(position, rightScaled, tl);
                    md.v3Add(tl,       upScaled,    tl);

                    md.v3Add(position, rightScaled, br);
                    md.v3Sub(br,       upScaled,    br);

                    md.v3Sub(position, rightScaled, bl);
                    md.v3Sub(bl,       upScaled,    bl);
                }

                var color = this_sprite.v4color;
                var uvRectangle = this_sprite.uvRectangle;

                writer(br, uvRectangle[2], uvRectangle[3], color);
                writer(tr, uvRectangle[2], uvRectangle[1], color);
                writer(bl, uvRectangle[0], uvRectangle[3], color);
                writer(tl, uvRectangle[0], uvRectangle[1], color);

                sprites_to_be_drawn += 1;
            }
        }

        if (sprites_to_be_drawn > 0)
        {
            doDraw();
        }

        sbs.end(gd);

        this.clearSpriteList();
    },

    clearSpriteList : function simplespriteClearSpriteListFn()
    {
        this.spriteList.length = 0;
    }
};

SimpleSprite.create = function simpleSpriteCreateFn(globals)
{
    return new SimpleSprite(globals);
};
