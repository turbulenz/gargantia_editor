/*global debug: false*/
/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/
/*global GameSoundManager: false*/
/*global VMath: false*/

var ECVolumeBox = EntityComponentBase.extend(
    {
        entityComponentName : 'ECVolumeBox',

        //Update info.
        updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
        sortPriority : EntityComponentSortOrder.NORMAL,
        shouldUpdate : true,
        shouldAlwaysUpdate : true, //If this is true, the entity will update even if it is far away from the hero.
        shouldDraw : true,

        //Persistence info.
        shouldSave : true,

        realTime : false,    //To honour this make sure you reference parameters through this.archetype

        storeGlobalList : true, // Setting this to true causes the game to store a global list of all active entities with
        // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ECVolumeBox)

        parameters :
        {
            sound: '',
            maxDistance: 100
        },

        editableProperties :
        [
        ],

        serialize : function ecHoopSpawnerSerializeFn()
        {
            return {};
        },

        deserialize : function ecHoopSpawnerDeserializeFn(ecData)
        {
        },

        // Standard ctor - add class members here and initialise if possible
        // Only read/modify this ec here
        init : function ECVolumeBoxInitFn(globals, parameters)
        {
            this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!

            this.worldExtents = globals.mathDevice.aabbBuildEmpty();
        },

        // Optional - entity is about to be placed in game
        // Only read/modify this entity here - do not query external entities or external ecs.
        // Can carry out some side effects here e.g. register with game managers, add event listeners
        activate : function ECVolumeBoxActivateFn()
        {
            this._super(); // IMPORTANT - MUST BE CALLED!
            var gameSoundManager = this.gameManager.gameSoundManager;
            gameSoundManager.play(this.archetype.sound, undefined /*this.entity.getv3Location()*/, this.entity.name, 0);
            var ecMesh = this.entity.getEC('ECMesh');
            debug.assert(ecMesh);
            ecMesh.getWorldExtents(this.worldExtents);
        },

        // Can query other entities here
        update : function ECVolumeBoxUpdateFn()
        {
            this._super(); // IMPORTANT - MUST BE CALLED!

            var cameraPosition = this.gameManager.gameCamera.currentV3Position;
            var distance = Math.sqrt(this.globals.mathDevice.aabbPointDistanceSq(this.worldExtents, cameraPosition));
            var volume = VMath.clamp(1.0 - distance / this.archetype.maxDistance, 0, 1);
            var baseVolume = GameSoundManager.archetypes[this.archetype.sound].volume;
            volume *= baseVolume;
            this.gameManager.gameSoundManager.setVolume(this.archetype.sound, this.entity.name, volume, 0.1);
        },

        draw : function ECVolumeBoxDrawFn()
        {
        },

        drawDebug : function ECVolumeBoxDrawFn()
        {
            // var dd = this.globals.debugDraw;
            // dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
        },

        // For recovering after the game goes to sleep
        manageLargeTimeStep : function ECVolumeBoxManageLargeTimeStepFn(timeDelta)
        {
            this._super(timeDelta);
        },

        //Death (when health hits 0)
        onDeath : function ECVolumeBoxOnDeathFn()
        {
        },

        //Destruction.
        onToBeDestroyed : function ECVolumeBoxOnToBeDestroyedFn()
        {
            this._super(); // IMPORTANT - MUST BE CALLED!
        },

        destroy : function ECVolumeBoxDestroyFn()
        {
            this._super(); // IMPORTANT - MUST BE CALLED!
        }
    });


ECVolumeBox.create = function ECVolumeBoxCreateFn(globals, parameters)
{
    return new ECVolumeBox(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECVolumeBox.prototype.entityComponentName] = ECVolumeBox;