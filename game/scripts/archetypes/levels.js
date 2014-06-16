var LevelArchetypes = {};

function makeScoring(params)
{
    return {
        timer       : params.timer        || 180.0,
        timeBonus   : params.timeBonus    || 0.0,

        ringMiss    : params.ringMiss     || 0.0,
        ringOuter   : params.ringOuter    || 0.0,
        ringMid     : params.ringMid      || 0.0,
        ringInner   : params.ringInner    || 0.0,
        ringBullsEye: params.ringBullsEye || 0.0,

        collectable : params.collectable  || 0.0,
        outoforder  : params.outoforder   || 0.0,

        obstacleHit : params.obstacleHit  || 0.0,
        limitsHit   : params.limitsHit    || 0.0,
        stallTimeHit: params.stallTimeHit || 0.0,

        oneStar     : params.oneStar      || 0.0,
        twoStar     : params.twoStar      || 0.0,
        threeStar   : params.threeStar    || 0.0
    };
}

LevelArchetypes["levels/mission_1.json"] = {
    type: "PlayStateRings",
    guiString: "GUI_BUTTON_MISSION_1",
    missionIndex: 0,

    scoring : makeScoring({
        timer       : 180.0,
        timeBonus   : 50,

        ringMiss    : -350,
        ringMid     : 150,
        ringInner   : 180,
        ringBullsEye: 250,

        oneStar     : 1500,
        twoStar     : 3500,
        threeStar   : 4500
    }),

    lighting : "normal",
    music : "aud_mission_123"
};

for (var level in LevelArchetypes)
{
    if (LevelArchetypes.hasOwnProperty(level))
    {
        LevelArchetypes[level].path = level;
    }
}
