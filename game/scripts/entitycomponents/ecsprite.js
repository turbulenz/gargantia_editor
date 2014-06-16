//
//  ECSprite!
//

/*global EntityComponentBase: false*/
/*global SimpleSprite: false*/
/*global EntityComponentSortOrder: false*/

var ECSprite = EntityComponentBase.extend(
{
    entityComponentName : 'ECSprite',

    //Update info.
    sortPriority : EntityComponentSortOrder.DRAW,
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    shouldUpdate : false,
    shouldDraw : true,

    //Networking info.
    shouldSerialize        : true,
    shouldDeltaSerialize   : true,

    //Persistence info.
    shouldSave : false,

    realTime : true,    //To honour this make sure you reference parameters through this.archetype

    parameters :
    {
        color :
        {
            description     :   'The colour of the sprite',
            defaultValue    :   [1.0, 1.0, 1.0, 1.0],
            minValue        :   0.0,
            maxValue        :   1.0,
            step            :   0.1
        },

        rotationSpeed : 0.0,

        size : 1,

        screenSpace : false
    },

    init : function eCSpriteInitFn(globals, parameters)
    {
        this._super(globals, parameters);

        this.path        =   this.safeCopy(parameters.path, "models/cube.dae");
        this.size        =   this.safeCopy(parameters.scale, 1.0);
        this.screenSpace =   this.safeCopy(parameters.screenSpace, false);

        this.scale      =   1.0;

        this.visible = true;

        this.spriteParameters = {
            v3Location  :   null,
            size        :   0,
            offsetX     :   0,
            offsetY     :   0,
            blendStyle  :   SimpleSprite.prototype.blendStyle.NORMAL,
            texture     :   this.path,
            v4color     :   null,
            angle       :   0,
            uvRectangle :   null
        };
    },

    update : function eCSpriteUpdateFn()
    {
        this._super();
    },

    setVisible : function ecspriteSetVisibleFn(isVisible)
    {
        this.visible = isVisible;
    },

    isVisible : function ecspriteIsVisibleFn()
    {
        return this.visible;
    },

    draw : function eCSpriteDrawFn()
    {
        var v3Location;

        var visible = this.isVisible();

        if (visible)
        {
            var ecMesh  = this.getEntityEC('ECMesh');
            if (ecMesh)
            {
                visible = ecMesh.isVisible();

                v3Location = this.v3Scratch3 = ecMesh.getTransformedv3Location(this.v3Scratch3);
            }
            else
            {
                v3Location = this.getv3Location();
            }
        }

        if (visible)
        {
            var globals     =   this.globals;
            var sr          =   globals.simpleSpriteRenderer;
            var archetype   =   this.archetype;
            var additive    =   archetype.additive;

            var rotationAmount  =   globals.gameCurrentTime * archetype.rotationSpeed;

            var screenScale = 1.0;
            if (this.screenSpace)
            {
                var mathDevice = globals.mathDevice;
                var position = this.v3Scratch = mathDevice.m43Pos(globals.camera.matrix, this.v3Scratch);
                var difference = mathDevice.v3Sub(v3Location, position, position);
                var at = this.v3Scratch2 = mathDevice.m43At(globals.camera.matrix, this.v3Scratch2);
                screenScale = Math.abs(mathDevice.v3Dot(difference, at)) / 50;
            }

            /*jshint bitwise: false*/
            var spriteParameters = this.spriteParameters;
            spriteParameters.v3Location  = v3Location;
            spriteParameters.size        = (this.scale * archetype.size) * screenScale;
            spriteParameters.offsetX     = archetype.offsetX;
            spriteParameters.offsetY     = (archetype.offsetY | 0) + (this.screenSpace ? screenScale : 0);
            spriteParameters.blendStyle  = additive ? SimpleSprite.prototype.blendStyle.ADD : SimpleSprite.prototype.blendStyle.NORMAL;
            spriteParameters.texture     = this.path;
            spriteParameters.v4color     = archetype.color;
            spriteParameters.angle       = rotationAmount;
            spriteParameters.uvRectangle = archetype.uvRectangle;
            sr.addSprite(this.spriteParameters);
            /*jshint bitwise: true*/
        }
    },

    setScale : function eCSpriteSetScaleFn(scale)
    {
        this.scale  =   scale;
    },

    getScale : function eCSpriteGetScale()
    {
        return this.scale;
    },

    setOffset : function setOffsetFn(offsetX, offsetY)
    {
        this.offsetX    =   offsetX;
        this.offsetY    =   offsetY;
    },

    serialize : function eCSpriteSerializeFn(eCData)
    {
        this._super(eCData);

        eCData.path         =   this.path;

        eCData.scale        =   this.scale;
    },

    serializeDelta : function eCSpriteSerializeDeltaFn(eCData)
    {
        this.serialize(eCData);
    }
});

ECSprite.preloadComponent = function eCSpritePreloadComponentFn(globals, componentParameters)
{
    globals.textureManager.load(componentParameters.path);
};

ECSprite.create = function eCSpriteCreateFn(globals, parameters)
{
    return new ECSprite(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECSprite.prototype.entityComponentName] = ECSprite;
