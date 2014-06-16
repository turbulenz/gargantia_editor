/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

//
//  ECHero!
//
//  I'm a HERO.
var ECHero = EntityComponentBase.extend(
{
    entityComponentName : 'ECHero',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : true,
    shouldAlwaysUpdate : false,
    shouldDraw : false,

    //Persistence info.
    shouldSave : false,
    realTime : false,

    init : function eCHeroInitFn(globals, parameters)
    {
        this._super(globals, parameters);
    },

    activate : function echeroActivateFn()
    {
        this._super();

        this.gameManager.addHeroEntity(this.entity);

        this.entity.setGameSpaceDynamic(true);    //DYNAMIC!
    },

    draw : function eCHeroDrawFn()
    {
    },

    drawDebug : function eCHeroDrawDebugFn()
    {
    },

    setGameSpace : function eCHeroSetGameSpaceFn(newSpace)
    {
        if (newSpace === this.currentGameSpace)
        {
            return;
        }

        if (this.currentGameSpace !== undefined)
        {
            this.currentGameSpace.removeHero();
        }

        //Switch curren game space.
        this.currentGameSpace   =   newSpace;
        if (this.currentGameSpace !== undefined)
        {
            this.currentGameSpace.addHero();
        }
    },

    update : function ecHeroUpdateFn()
    {
        this._super();
    },

    destroy : function eCHeroDestroyFn()
    {
        this._super();

        this.setGameSpace(undefined);
    }
});

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECHero.prototype.entityComponentName] = ECHero;

ECHero.create = function eCHeroCreateFn(globals, parameters)
{
    return new ECHero(globals, parameters);
};
