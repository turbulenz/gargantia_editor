//
// GameGrid - class description
//

/*global GameGridSquare: false*/

function GameGrid() {}

GameGrid.prototype =
{
    gridSize    :   100.0,
    scratchpad  : {},

    initialize : function gamegridInitializeFn(aabbExtents)
    {
        var md           = this.globals.mathDevice;
        var v3Lower      = md.aabbMin(aabbExtents);
        var v3Upper      = md.aabbMax(aabbExtents);
        this.aabbExtents = md.aabbCopy(aabbExtents);

        this.v3Lower     = v3Lower;
        this.v3Upper     = v3Upper;
        var v2Dimensions = this.scratchpad.v2UppderIndex = this.getGridIndexFromLocation(v3Upper, this.scratchpad.v2UppderIndex);

        v2Dimensions[0] +=  1.0;
        v2Dimensions[1] +=  1.0;

        var i;

        var gridArray   =   new Array(v2Dimensions[0]);

        for (i = 0; i < v2Dimensions[0]; i += 1)
        {
            gridArray[i] = new Array(v2Dimensions[1]);
        }

        this.physGrid   =   [];

        this.gridArray  =   gridArray;
    },

    getGridIndexFromLocation : function gamegridgetGridIndexFromLocation(v3Location, v2Destination)
    {
        var md  =   this.globals.mathDevice;
        var scratchpad = this.scratchpad;

        scratchpad.v3Vector = md.v3Sub(v3Location, this.v3Lower, scratchpad.v3Vector);
        v2Destination  = md.v2BuildFromv3(scratchpad.v3Vector, v2Destination);
        md.v2ScalarMul(v2Destination, 1.0 / this.gridSize, v2Destination);

        v2Destination[0]  =   Math.floor(v2Destination[0]);
        v2Destination[1]  =   Math.floor(v2Destination[1]);

        if (this.gridArray)
        {
            v2Destination[0]  =   md.clamp(v2Destination[0], 0, this.gridArray.length - 1);
            v2Destination[1]  =   md.clamp(v2Destination[1], 0, this.gridArray[0].length - 1);
        }

        return  v2Destination;
    },

    getGridIndexXFromLocationX : function gamegridgetGridIndexXFromLocationX(worldX)
    {
        var gridX = Math.floor((worldX - this.v3Lower[0]) / this.gridSize);

        if (this.gridArray)
        {
            gridX = gridX < 0 ? 0 : gridX > this.gridArray.length - 1 ? this.gridArray.length - 1 : gridX;
        }

        return  gridX;
    },

    getGridIndexYFromLocationZ : function gamegridgetGridIndexYFromLocationZ(worldZ)
    {
        var gridY = Math.floor((worldZ - this.v3Lower[2]) / this.gridSize);

        if (this.gridArray)
        {
            gridY = gridY < 0 ? 0 : gridY > this.gridArray[0].length - 1 ? this.gridArray[0].length - 1 : gridY;
        }

        return gridY;
    },

    getLocationFromGridIndex : function gamegridgetLocationFromGridIndexFn(x, y, v3Destination)
    {
        var md  =   this.globals.mathDevice;

        v3Destination  =   md.v3Build(x * this.gridSize, 0.0, y * this.gridSize, v3Destination);
        md.v3Add(v3Destination, this.v3Lower, v3Destination);

        return  v3Destination;
    },

    getGridSquareFromIndex : function gamegridGetGridSquareFromIndexFn(x, y)
    {
        var gridSquare  =   this.gridArray[x][y];
        var md, v3Lower;
        var scratchpad = this.scratchpad;

        if (!gridSquare)
        {
            md         = this.globals.mathDevice;
            v3Lower    = this.getLocationFromGridIndex(x, y, scratchpad.v3Location);
            v3Lower[1] = this.v3Lower[1]    -   10.0;
            scratchpad.v3Upper    = md.v3Copy(v3Lower, scratchpad.v3Upper);
            scratchpad.v3Upper[0] += this.gridSize;
            scratchpad.v3Upper[1] = this.v3Upper[1]    +   10.0;
            scratchpad.v3Upper[2] += this.gridSize;

            gridSquare = this.gridArray[x][y]    =   GameGridSquare.create(this.globals, this, v3Lower, scratchpad.v3Upper);
        }
        return  gridSquare;
    },

    debugDraw : function gameGridDebugDrawFn()
    {
        var debugDrawGridSquares = function (gridSquare)
        {
            gridSquare.debugDraw();
        };

        this.applyToGridSquaresWithinExtents(this.aabbExtents, debugDrawGridSquares);
    },

    // getGridSquareFromLocation : function gamegridGetGridSquareFromLocationFn(v3Location)
    // {
    //     var v2Index =   this.getGridIndexFromLocation(v3Location);
    //     return  this.getGridSquareFromIndex(v2Index[0], v2Index[1]);
    // },


    applyToGridSquaresWithinExtents : function gamegridApplyToGridSquaresWithinExtents(aabbExtents, toApplyToGridSquares)
    {
        var v3LowerX = this.getGridIndexXFromLocationX(aabbExtents[0]);
        var v3LowerY = this.getGridIndexYFromLocationZ(aabbExtents[2]);

        var v3UpperX = this.getGridIndexXFromLocationX(aabbExtents[3]);
        var v3UpperY = this.getGridIndexYFromLocationZ(aabbExtents[5]);

        var thisGridSquare;

        var x;
        var y;

        for (x = v3LowerX; x <= v3UpperX; x += 1)
        {
            for (y = v3LowerY; y <= v3UpperY; y += 1)
            {
                thisGridSquare  =   this.getGridSquareFromIndex(x, y);
                toApplyToGridSquares(thisGridSquare);

                //thisGridSquare.debugDraw();
            }
        }
    },

    applyToPhysicsSpheresWithinExtents : function gamegridapplyToEntitiesWithinExtents(aabbExtents, toApplyToPhysSpheres)
    {
        var appliedMap  =   {};
        var toApplyToGridSquares = function (gridSquare)
        {
            gridSquare.applyToPhysicsSpheres(toApplyToPhysSpheres, appliedMap);
        };

        this.applyToGridSquaresWithinExtents(aabbExtents, toApplyToGridSquares);
    },

    applyToEntitiesWithinExtents : function gamegridapplyToEntitiesWithinExtents(aabbExtents, toApplyToEntities, appliedMap)
    {
        if (!appliedMap)
        {
            appliedMap  =   {};
        }
        var toApplyToGridSquares = function (gridSquare)
        {
            if (gridSquare.hasEntities())
            {
                gridSquare.applyToGameEntities(toApplyToEntities, appliedMap);
            }
        };

        this.applyToGridSquaresWithinExtents(aabbExtents, toApplyToGridSquares);
    },

    applyToUpdatingEntitiesWithinExtents : function gamegridapplyToUpdatingEntitiesWithinExtents(aabbExtents, toApplyToEntities, appliedMap)
    {
        if (!appliedMap)
        {
            appliedMap  =   {};
        }
        var toApplyToGridSquares = function (gridSquare)
        {
            if (gridSquare.hasUpdatingEntities())
            {
                gridSquare.applyToUpdatingGameEntities(toApplyToEntities, appliedMap);
            }
        };

        this.applyToGridSquaresWithinExtents(aabbExtents, toApplyToGridSquares);
    },

    applyToDrawnEntitiesWithinExtents : function gamegridapplyToDrawnEntitiesWithinExtents(aabbExtents, toApplyToEntities, appliedMap)
    {
        if (!appliedMap)
        {
            appliedMap  =   {};
        }
        var toApplyToGridSquares = function (gridSquare)
        {
            if (gridSquare.hasUpdatingEntities())
            {
                gridSquare.applyToDrawnGameEntities(toApplyToEntities, appliedMap);
            }
        };

        this.applyToGridSquaresWithinExtents(aabbExtents, toApplyToGridSquares);
    },

    addEntityToGridSquaresWithinExtents : function gamegridAddEntityToGridSquareInsideAABB(aabbExtents, gameEntity)
    {
        var addEntityToGridSquare = function (gridSquare)
        {
            gridSquare.addGameEntity(gameEntity);
        };

        this.applyToGridSquaresWithinExtents(aabbExtents, addEntityToGridSquare);
    },

    removeEntityFromGridSquaresWithinExtents : function gamegriRemoveEntityToGridSquareInsideAABB(aabbExtents, gameEntity)
    {
        var removeEntityFromGridSquare = function (gridSquare)
        {
            gridSquare.removeGameEntity(gameEntity);
        };

        this.applyToGridSquaresWithinExtents(aabbExtents, removeEntityFromGridSquare);
    },

    //Physics management.
    addGridSquareToPhysics : function gamegridAddGridSquareToPhysicsFn(gameGridSquare)
    {
        this.physGrid.push(gameGridSquare);
    },

    removeGridSquareFromPhysics : function gamegridRemoveGridSquareFromPhysics(gameGridSquare)
    {
        var index_to_splice = this.physGrid.indexOf(gameGridSquare);
        if (index_to_splice >= 0)
        {
            this.physGrid.splice(index_to_splice, 1);
        }
    },

    resolvePhysicsSphereCollisions : function gamegridResolvePhysicsSphereCollisionsFn()
    {
        var physGrid       = this.physGrid;
        var physGridLength = physGrid.length;
        var physGridIndex;

        for (physGridIndex = 0; physGridIndex < physGridLength; physGridIndex += 1)
        {
            physGrid[physGridIndex].resolvePhysicsSphereCollision();
        }

    }
};

GameGrid.create = function gameGridCreateFn(globals, aabbExtents)
{
    var gameGrid = new GameGrid();

    gameGrid.globals    =   globals;
    gameGrid.initialize(aabbExtents);

    return gameGrid;
};
