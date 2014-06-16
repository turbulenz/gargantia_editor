/*jshint bitwise: false*/

function SaveData()
{
    this.localStorage = null;
    this.data = null;

    // Check for availability of localData

    try {
        if ("undefined" !== typeof localStorage)
        {
            // A security exception seems to be thrown here on IE11
            // depending on the users settings.

            this.localStorage = localStorage;
        }
    } catch (e) {

        console.log("!! Couldn't activate SaveData");
    }

    this._load();
    debug.assert(this.data);
}

SaveData.prototype = {

    _version: 1,
    _numMissions: 4,

    // Returns true if SaveData appears to be working on this browser.
    isActive: function saveDataIsActive()
    {
        return !!(this.localStorage);
    },

    // Save the given user config.  Currently this is just an
    // arbitrary object.  We do a shallow copy from the 'config'
    // parameter to an internal settings object, which get's stored as
    // a JSON string.  All existing attributes will be lost after this
    // operation, so the 'config' parameter must contain all
    // attributes to be saved.
    setUserConfig: function saveDataSetUserConfigFn(config)
    {
        debug.assert("object" === typeof config);
        var data = this.data;
        var destConfig = {};

        var k;
        for (k in config)
        {
            if (config.hasOwnProperty(k))
            {
                destConfig[k] = config[k];
            }
        }

        data.config = destConfig;
        this._save();
    },

    // Copy the currently saved config attributes out to an external
    // object 'destConfig' passed in by the caller.  Any existing
    // properties on 'destConfig' which do not conflict with saved
    // properties are left in tact (i.e. the caller can pass in
    // default settings and only those that have been stored wil be
    // updated).
    getUserConfig: function saveDataGetUserConfig(destConfig)
    {
        debug.assert("object" === typeof destConfig,
                     "destConfig must be an object");

        var config = this.data.config;
        var k;
        for (k in config)
        {
            if (config.hasOwnProperty(k))
            {
                destConfig[k] = config[k];
            }
        }
    },

    // A score and rating of zero indicates the mission was failed.
    setResultForMission: function saveDataSetResultForMissionFn(
        missionIndex,
        score,
        rating
    )
    {
        debug.assert("number" === typeof missionIndex);
        debug.assert("number" === typeof score);
        debug.assert("number" === typeof rating);
        debug.assert((0 === score && 0 === rating) ||
                     (0 !== score && 0 !== rating));

        var data = this.data;
        var missions = data.missions;
        var nextMission = this.getNextStageToPlay();

        // Only write the score if it hasn't already been set

        if (missionIndex < this._numMissions && missionIndex === nextMission)
        {
            var mission = missions[missionIndex];
            if (0 === score)
            {
                if (!mission)
                {
                    missions[missionIndex] = { score: 0, rating: 0, failed: 1 };
                }
                else
                {
                    mission.failed += 1;
                }
            }
            else
            {
                if (!mission)
                {
                    missions[missionIndex] = {
                        score: score,
                        rating: rating,
                        failed: 0
                    };
                }
                else
                {
                    debug.assert(0 === mission.score);
                    debug.assert(0 === mission.rating);

                    mission.score = score;
                    mission.rating = rating;
                }

                if (missionIndex === this._numMissions - 1)
                {
                    data.completed = true;
                }
            }

            this._save();
        }
    },

    // Returns undefined or { score: number, rating: number }
    getResultForMission: function saveDataGetResultForMissionFn(
        missionIndex
    )
    {
        var data = this.data;
        var missions = data.missions;
        var result = missions[missionIndex];

        if (result)
        {
            if ("number" === typeof result.score &&
                "number" === typeof result.rating &&
                "number" === typeof result.failed)
            {
                return result;
            }

            delete missions[missionIndex];
        }

        return undefined;
    },

    // Average the score and rating over all completed missions
    calculateTotals: function saveDataCalculateTotalsFn()
    {
        var numMissionsPlayed = this.getNextStageToPlay();
        if (0 === numMissionsPlayed)
        {
            return { score: 0, rating: 0 };
        }

        var score = 0;
        var rating = 0;
        var res;
        var i;
        for (i = 0 ; i < numMissionsPlayed ; i += 1)
        {
            res = this.getResultForMission(i);
            score += res.score;
            rating += res.rating;
        }

        score = score;
        rating = Math.round(rating / numMissionsPlayed);

        return {
            score: score,
            rating: rating
        };
    },

    // Returns an integer 0-4 (4 indicates that the game has been
    // completed once).
    getNextStageToPlay: function saveDataGetLastStagePlayed()
    {
        var data = this.data;
        var missions = data.missions;
        var numMissions = this._numMissions;
        var i;

        // Go through the list rather than just check missions.length
        // to ensure there is actually an entry for each mission.
        // Stop at the first index with no entry, or an entry that
        // hasn't been completed.

        for (i = 0 ; i < numMissions ; i += 1)
        {
            if (!missions.hasOwnProperty(i) || missions[i].score === 0)
            {
                return i;
            }
        }

        // We have an entry for all missions.

        debug.assert(i === numMissions, "i === numMissions");
        return numMissions;
    },

    // A flag indicating that the game has been completed once,
    // independent of the next mission state.  This should survive a
    // reset.  This will be used if we introduce some cross promotion
    // stuff.  We need to avoid users repeatedly clearing data and
    // recompleting the game to claim multiple codes / credits /
    // rewards (or whatever the corss promotion incentive is).
    hasBeenCompleted: function saveDataHasBeenCompleted()
    {
        return !!(this.data.completed);
    },

    // Reset only mission data, not saved options.
    resetMissionStatus: function saveDataResetMissionStatusFn()
    {
        var completed = false;
        var config = {};
        var data = this.data;

        // Retain only the 'completed' flag from existing data.

        if (data)
        {
            completed = !!(data.completed);
            config = data.config;
        }

        this.data = {
            version: this.version,
            config: config,
            missions: [],
            completed: completed
        };

        this._save();
    },

    reset: function saveDataResetFn()
    {
        var completed = false;
        var data = this.data;

        // Retain only the 'completed' flag from existing data.

        if (data)
        {
            completed = !!(data.completed);
        }

        this.data = {
            version: this.version,
            missions: [],
            config: {},
            completed: completed
        };

        this._save();
    },

    _cipher: function saveData_cipher(plaintext)
    {
        // TODO: Encode / obfuscate properly

        var numchars = plaintext.length;
        var bin = new Array(numchars * 2);
        var i;
        var c;
        for (i = 0 ; i < numchars ; i += 1)
        {
            c = plaintext.charCodeAt(i);
            c = (c - 32) ^ (i & 0xff);
            bin[2 * i] = c & 0xff;
            bin[2 * i + 1] = (c & 0xff00) >> 8;
        }

        var ctext = String.fromCharCode.apply(null, bin);
        return btoa(ctext);
    },

    _decipher: function saveData_decipher(ciphertext)
    {
        // TODO: Decode / de-obfuscate properly

        var ctext = atob(ciphertext);
        var bin = ctext.split("").map(function (c) {
            return c.charCodeAt(0);
        });
        var plaintext = "";
        var numchars = bin.length / 2;
        var i;
        var c;
        for (i = 0; i < numchars; i += 1)
        {
            c = bin[2 * i] | (bin[2 * i + 1] << 8);
            c = (c ^ (i & 0xff)) + 32;
            plaintext += String.fromCharCode(c);
        }

        return plaintext;
    },

    _save: function saveData_Save()
    {
        var ls = this.localStorage;
        if (!ls)
        {
            return;
        }

        var d = this.data;

        // TODO: Validate data again here

        try {
            var s = JSON.stringify(d);
            var c = this._cipher(s);

            ls.setItem("gargantia", c);
        }
        catch (e)
        {
        }
    },

    _load: function saveData_Load()
    {
        var ls = this.localStorage;
        if (!ls)
        {
            this.reset();
            return;
        }

        var c = ls.getItem("gargantia");
        if (c)
        {
            try {
                var s = this._decipher(c);
                if (s)
                {
                    var d = JSON.parse(s);

                    // TODO: Validate the data properly

                    this.data = d;
                    return;
                }
            } catch (e) {
            }
        }

        this.reset();
    },

    _dump: function saveData_Dump()
    {
        console.log("SaveData._dump: " + JSON.stringify(this.data));
    }
};

SaveData.create =  function saveDataCreate()
{
    if (debug)
    {
        if (false)
        {
            if (SaveData.test)
            {
                var f = SaveData.test;
                delete SaveData.test;
                f();
            }
        }
    }

    var sd = new SaveData();
    return sd;
};

// TEST

if (debug)
{

SaveData.test = function saveDataTestFn()
{
    (function () {
        var sd = SaveData.create();

        sd._dump();

        sd.reset();
        debug.assert(0 === sd.getNextStageToPlay());
        debug.assert(undefined === sd.getResultForMission(0));
        debug.assert(undefined === sd.getResultForMission(1));
        debug.assert(undefined === sd.getResultForMission(2));
        debug.assert(undefined === sd.getResultForMission(3));
        debug.assert("boolean" === typeof sd.hasBeenCompleted());
    })();

    (function () {
        var sd = SaveData.create();

        // HACK: reset the completed flag

        sd.data.completed = false;
        sd.reset();
        debug.assert(!sd.hasBeenCompleted());

        sd.setResultForMission(1, 1234, 2);

        debug.assert(0 === sd.getNextStageToPlay());
        debug.assert(undefined === sd.getResultForMission(0));
        debug.assert(undefined === sd.getResultForMission(1));
        debug.assert(undefined === sd.getResultForMission(2));
        debug.assert(undefined === sd.getResultForMission(3));
        debug.assert(false === sd.hasBeenCompleted());

        sd.setResultForMission(0, 1234, 2);

        debug.assert(1 === sd.getNextStageToPlay());
        debug.assert(1234 === sd.getResultForMission(0).score);
        debug.assert(   2 === sd.getResultForMission(0).rating);
        debug.assert(   0 === sd.getResultForMission(0).failed);
        debug.assert(undefined === sd.getResultForMission(1));
        debug.assert(undefined === sd.getResultForMission(2));
        debug.assert(undefined === sd.getResultForMission(3));
        debug.assert(false === sd.hasBeenCompleted());

        var totals = sd.calculateTotals();
        debug.assert(1234 === totals.score);
        debug.assert(   2 === totals.rating);

    })();

    // Don't allow writes for missions out of order

    (function () {
        var sd = SaveData.create();

        sd.reset();

        sd.setResultForMission(3, 3234, 1);
        debug.assert(undefined === sd.getResultForMission(0));
        debug.assert(undefined === sd.getResultForMission(1));
        debug.assert(undefined === sd.getResultForMission(2));
        debug.assert(undefined === sd.getResultForMission(3));
        debug.assert(false === sd.hasBeenCompleted());

        sd.setResultForMission(0, 1234, 1);
        sd.setResultForMission(1, 2234, 2);
        sd.setResultForMission(2, 3235, 3);

        debug.assert(3 === sd.getNextStageToPlay());
        debug.assert(1234 === sd.getResultForMission(0).score);
        debug.assert(   1 === sd.getResultForMission(0).rating);
        debug.assert(   0 === sd.getResultForMission(0).failed);
        debug.assert(2234 === sd.getResultForMission(1).score);
        debug.assert(   2 === sd.getResultForMission(1).rating);
        debug.assert(   0 === sd.getResultForMission(1).failed);
        debug.assert(3235 === sd.getResultForMission(2).score);
        debug.assert(   3 === sd.getResultForMission(2).rating);
        debug.assert(   0 === sd.getResultForMission(2).failed);
        debug.assert(undefined === sd.getResultForMission(3));
        debug.assert(false === sd.hasBeenCompleted());
        debug.assert((1234+2234+3235) === sd.calculateTotals().score);
        debug.assert((1+2+3)/3 === sd.calculateTotals().rating);

        sd.setResultForMission(3, 4234, 1);

        debug.assert(4 === sd.getNextStageToPlay());
        debug.assert(1234 === sd.getResultForMission(0).score);
        debug.assert(   1 === sd.getResultForMission(0).rating);
        debug.assert(   0 === sd.getResultForMission(0).failed);
        debug.assert(2234 === sd.getResultForMission(1).score);
        debug.assert(   2 === sd.getResultForMission(1).rating);
        debug.assert(   0 === sd.getResultForMission(1).failed);
        debug.assert(3235 === sd.getResultForMission(2).score);
        debug.assert(   3 === sd.getResultForMission(2).rating);
        debug.assert(   0 === sd.getResultForMission(2).failed);
        debug.assert(4234 === sd.getResultForMission(3).score);
        debug.assert(   1 === sd.getResultForMission(3).rating);
        debug.assert(   0 === sd.getResultForMission(3).failed);
        debug.assert(true === sd.hasBeenCompleted());
        debug.assert((1234+2234+3235+4234) === sd.calculateTotals().score);
        debug.assert(Math.round((1+2+3+1)/4) === sd.calculateTotals().rating);

        // Should not now be able to set the score for any stage

        sd.setResultForMission(2, 3235, 1);
        sd.setResultForMission(1, 2235, 3);
        sd.setResultForMission(3, 4235, 2);
        sd.setResultForMission(0, 1235, 2);

        debug.assert(1234 === sd.getResultForMission(0).score);
        debug.assert(   1 === sd.getResultForMission(0).rating);
        debug.assert(   0 === sd.getResultForMission(0).failed);
        debug.assert(2234 === sd.getResultForMission(1).score);
        debug.assert(   2 === sd.getResultForMission(1).rating);
        debug.assert(   0 === sd.getResultForMission(1).failed);
        debug.assert(3235 === sd.getResultForMission(2).score);
        debug.assert(   3 === sd.getResultForMission(2).rating);
        debug.assert(   0 === sd.getResultForMission(2).failed);
        debug.assert(4234 === sd.getResultForMission(3).score);
        debug.assert(   1 === sd.getResultForMission(3).rating);
        debug.assert(   0 === sd.getResultForMission(3).failed);
        debug.assert(true === sd.hasBeenCompleted());
        debug.assert((1234+2234+3235+4234) === sd.calculateTotals().score);
        debug.assert(Math.round((1+2+3+1)/4) === sd.calculateTotals().rating);

    })();

    // Failed missions

    (function () {
        var sd = SaveData.create();

        // HACK: reset the completed flag

        sd.data.completed = false;
        sd.reset();
        debug.assert(!sd.hasBeenCompleted());

        // Check failed count

        sd.setResultForMission(0, 0, 0);
        debug.assert(0 === sd.getNextStageToPlay());
        debug.assert(0 === sd.getResultForMission(0).score);
        debug.assert(0 === sd.getResultForMission(0).rating);
        debug.assert(1 === sd.getResultForMission(0).failed);

        // Check can't fail second mission

        sd.setResultForMission(1, 0, 0);
        debug.assert(0 === sd.getNextStageToPlay());
        debug.assert(0 === sd.getResultForMission(0).score);
        debug.assert(0 === sd.getResultForMission(0).rating);
        debug.assert(1 === sd.getResultForMission(0).failed);
        debug.assert(undefined === sd.getResultForMission(1));

        // Pass 1st mission, check failed is maintained

        sd.setResultForMission(0, 1235, 2);
        debug.assert(1 === sd.getNextStageToPlay());
        debug.assert(1235 === sd.getResultForMission(0).score);
        debug.assert(2 === sd.getResultForMission(0).rating);
        debug.assert(1 === sd.getResultForMission(0).failed);
        debug.assert(undefined === sd.getResultForMission(1));

        // Completed 2nd mission after 2 fails, check failing
        // completed missions 1 and 2

        sd.setResultForMission(0, 0, 0);
        sd.setResultForMission(1, 0, 0);
        sd.setResultForMission(1, 0, 0);
        sd.setResultForMission(1, 2235, 3);
        debug.assert(2    === sd.getNextStageToPlay());
        debug.assert(1235 === sd.getResultForMission(0).score);
        debug.assert(2    === sd.getResultForMission(0).rating);
        debug.assert(1    === sd.getResultForMission(0).failed);
        debug.assert(2235 === sd.getResultForMission(1).score);
        debug.assert(3    === sd.getResultForMission(1).rating);
        debug.assert(2    === sd.getResultForMission(1).failed);
        debug.assert(undefined === sd.getResultForMission(2));

        sd.setResultForMission(0, 0, 0);
        sd.setResultForMission(1, 0, 0);
        sd.setResultForMission(1, 0, 0);
        debug.assert(2    === sd.getNextStageToPlay());
        debug.assert(1235 === sd.getResultForMission(0).score);
        debug.assert(2    === sd.getResultForMission(0).rating);
        debug.assert(1    === sd.getResultForMission(0).failed);
        debug.assert(2235 === sd.getResultForMission(1).score);
        debug.assert(3    === sd.getResultForMission(1).rating);
        debug.assert(2    === sd.getResultForMission(1).failed);
        debug.assert(undefined === sd.getResultForMission(2));

        // Failing mission 3 doesn't set completed flag

        debug.assert(!sd.hasBeenCompleted());

        sd.setResultForMission(2, 3234, 3);
        sd.setResultForMission(3, 0, 0);

        debug.assert(!sd.hasBeenCompleted());
        debug.assert(3    === sd.getNextStageToPlay());
        debug.assert(1    === sd.getResultForMission(3).failed);

        sd.setResultForMission(3, 3234, 3);
        debug.assert(sd.hasBeenCompleted());

    })();

    // At this point, bail out if SaveData is not activated

    var sd = SaveData.create();
    if (!sd.isActive())
    {
        console.log("SaveData: tests halted (SaveData not active)");
        return;
    }

    // Check the completed flag survives a reset

    (function () {
        var sd = SaveData.create();

        sd.reset();

        debug.assert(undefined === sd.getResultForMission(0));
        debug.assert(undefined === sd.getResultForMission(1));
        debug.assert(undefined === sd.getResultForMission(2));
        debug.assert(undefined === sd.getResultForMission(3));
        debug.assert(true === sd.hasBeenCompleted());

    })();

    // Options tests

    (function () {

        var sd = SaveData.create();
        sd.reset();

        var options1 = {
            language: "ja",
            setting1: "default"
        };

        sd.getUserConfig(options1);
        debug.assert("ja" === options1.language, "options1.language");
        debug.assert("default" === options1.setting1, "options1.setting1");

        var options2 = {
            language: "en"
        };

        sd.setUserConfig(options2);
        sd.getUserConfig(options1);
        debug.assert("en" === options1.language, "options1.language");
        debug.assert("default" === options1.setting1, "options1.setting1");

        options2 = {
            language: "en",
            setting1: "userset"
        };

        sd.setUserConfig(options2);
        sd.getUserConfig(options1);
        debug.assert("en" === options1.language, "options1.language");
        debug.assert("userset" === options1.setting1, "options1.setting1");

    })();

    // Reset only mission status

    (function () {

        var sd = SaveData.create();
        sd.reset();

        var options1 = {
            language: "ja",
            setting1: "default"
        };

        sd.setUserConfig(options1);
        sd.setResultForMission(0, 1234, 1);
        sd.setResultForMission(1, 2234, 2);
        sd.setResultForMission(2, 3234, 3);
        sd.setResultForMission(3, 4234, 1);

        sd.resetMissionStatus();

        var o = {};
        sd.getUserConfig(o);
        debug.assert("ja" === o.language, "options1.language");
        debug.assert("default" === o.setting1, "options1.setting1");
        debug.assert(undefined === sd.getResultForMission(0));
        debug.assert(undefined === sd.getResultForMission(1));
        debug.assert(undefined === sd.getResultForMission(2));
        debug.assert(undefined === sd.getResultForMission(3));
        debug.assert(true === sd.hasBeenCompleted());

    })();

    // Tamper check

    (function () {
        var sd = SaveData.create();

        sd.reset();
        debug.assert(true === sd.hasBeenCompleted());

        sd.setResultForMission(0, 1234, 1);
        sd.setResultForMission(1, 2234, 2);
        sd.setResultForMission(2, 3234, 3);
        sd.setResultForMission(3, 4234, 1);

        var saved = localStorage.getItem("gargantia");
        saved = saved.slice(1);
        localStorage.setItem("gargantia", saved);

        sd = SaveData.create();

        debug.assert(0 === sd.getNextStageToPlay());
        debug.assert(undefined === sd.getResultForMission(0));
        debug.assert(undefined === sd.getResultForMission(1));
        debug.assert(undefined === sd.getResultForMission(2));
        debug.assert(undefined === sd.getResultForMission(3));
        debug.assert(false === sd.hasBeenCompleted());

    })();

    // Loading and saving

    (function () {
        var sd = SaveData.create();

        sd.reset();

        debug.assert(false === sd.hasBeenCompleted());

        sd.setResultForMission(0, 0, 0);
        sd.setResultForMission(0, 1234, 1);

        sd.setResultForMission(1, 0, 0);
        sd.setResultForMission(1, 0, 0);
        sd.setResultForMission(1, 2234, 2);

        sd.setResultForMission(2, 3234, 3);

        sd.setResultForMission(3, 0, 0);
        sd.setResultForMission(3, 0, 0);
        sd.setResultForMission(3, 0, 0);
        sd.setResultForMission(3, 0, 0);
        sd.setResultForMission(3, 4234, 1);

        sd = SaveData.create();

        debug.assert(4 === sd.getNextStageToPlay());
        debug.assert(1234 === sd.getResultForMission(0).score);
        debug.assert(   1 === sd.getResultForMission(0).rating);
        debug.assert(   1 === sd.getResultForMission(0).failed);
        debug.assert(2234 === sd.getResultForMission(1).score);
        debug.assert(   2 === sd.getResultForMission(1).rating);
        debug.assert(   2 === sd.getResultForMission(1).failed);
        debug.assert(3234 === sd.getResultForMission(2).score);
        debug.assert(   3 === sd.getResultForMission(2).rating);
        debug.assert(   0 === sd.getResultForMission(2).failed);
        debug.assert(4234 === sd.getResultForMission(3).score);
        debug.assert(   1 === sd.getResultForMission(3).rating);
        debug.assert(   4 === sd.getResultForMission(3).failed);
        debug.assert(true === sd.hasBeenCompleted());

    })();

    // Cipher / Decipher

    (function () {

        var x = "日本語";

        var cipher = SaveData.prototype._cipher;
        var decipher = SaveData.prototype._decipher;

        var y = decipher(cipher(x));
        debug.assert(x === y);

    })();

    console.log("SaveData: tests passed");
}

} // if (debug)
