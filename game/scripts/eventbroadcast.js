// Class that is responsible for sending game events (JSON data) from
// the game to the hosting page.

/*global console: false*/
/*global debug: false*/
/*global TurbulenzEngine: false*/

function EventBroadcast()
{
    var findEventsElement = function findEventsElementFn(w)
    {
        if (w)
        {
            var doc = w.document;
            if (doc)
            {
                return doc.getElementById("tz_game_events");
            }
        }
    };

    var _win;
    if ("undefined" !== typeof window)
    {
        _win = window;
        this.outputElement =
            findEventsElement(_win) || findEventsElement(_win.parent);

        var evb = this;
        _win.tzSendEventToGame = function tzSendEventToGameFn(eventObject)
        {
            var deliver = function ()
            {
                var handler = evb.eventHandler;
                if (handler)
                {
                    handler(eventObject);
                }
                else
                {
                    TurbulenzEngine.setTimeout(deliver, 1000);
                }
            };
            TurbulenzEngine.setTimeout(deliver, 0);
        };
    }
    else
    {
        this.outputElement = null;
    }

    this.lastLoadingProgress = 0.0;
    this.eventHandler = null;

    return this;
}

EventBroadcast.prototype = {

    _send: function eventBroadcastSendFn(eventObject)
    {
        var outputElement = this.outputElement;
        if (!outputElement)
        {
            debug.log("EVENT: " + JSON.stringify(eventObject));
            return;
        }

        // TODO: Some event validation?

        try
        {
            var eventText = JSON.stringify(eventObject);
        }
        catch (e)
        {
        }

        var placeEvent = function placeEventFn()
        {
            if (0 === outputElement.innerHTML.length)
            {
                outputElement.innerHTML = eventText;
                return;
            }

            TurbulenzEngine.setTimeout(placeEvent, 1000);
        };
        placeEvent();
    },

    setPageEventHandler: function eventBroadcastSetPageEventHandler(fn)
    {
        this.eventHandler = fn;
    },

    missionComplete:
    function eventBroadcastMissionCompleteFn(missionIdx,
                                             score, rating,
                                             totalScore, totalRating,
                                             char_en, en, char_ja, ja,
                                             language, arcadeMode)
    {
        debug.assert("number" === typeof missionIdx);
        debug.assert("number" === typeof score);
        debug.assert("number" === typeof rating);
        debug.assert("number" === typeof totalScore);
        debug.assert("number" === typeof totalRating);
        debug.assert("string" === typeof char_en);
        debug.assert("string" === typeof en);
        debug.assert("string" === typeof char_ja);
        debug.assert("string" === typeof ja);
        debug.assert("en" === language || "ja" === language);
        debug.assert(0 <= missionIdx && missionIdx <= 3, "missionIdx");
        debug.assert(1 <= rating && rating <= 3, "rating");
        debug.assert(1 <= totalRating && totalRating <= 3, "totalRating");
        debug.assert("boolean" === typeof arcadeMode);

        this._send({
            event: "missioncomplete",
            mission: missionIdx,
            score: score,
            rating: rating,
            totalScore: totalScore,
            totalRating: totalRating,
            char_en: char_en,
            en: en,
            char_ja: char_ja,
            ja: ja,
            language: language,
            mode: (arcadeMode)?("mission"):("story")
        });
    },

    loadingProgress: function eventBroadcastLoadingProgressFn(progress)
    {
        debug.assert("number" === typeof progress);

        if (this.lastLoadingProgress < progress)
        {
            this._send({
                event: "loading",
                progress: progress
            });
            this.lastLoadingProgress = progress;
        }
    },

    gameComplete: function eventBroadcastGameComplete(score, rating, DMMCode,
                                                      language)
    {
        debug.assert("number" === typeof score);
        debug.assert("number" === typeof rating);
        debug.assert("string" === typeof DMMCode);
        debug.assert("string" === typeof language);

        this._send({
            event: "gamecomplete",
            score: score,
            rating: rating,
            dmmcode: DMMCode,
            language: language
        });
    },

    hideMenu: function eventBroadcastHideMenuFn()
    {
        this._send({ event: "hidemenu" });
    },

    showMenu: function eventBroadcastShowideMenuFn()
    {
        this._send({ event: "showmenu" });
    }
};

EventBroadcast.create = function eventBroadcastCreateFn()
{
    if (debug)
    {
        // if (false)
        {
            if (EventBroadcast.test)
            {
                var f = EventBroadcast.test;
                delete EventBroadcast.test;
                f();
            }
        }
    }

    var eb = new EventBroadcast();
    return eb;
};

if (debug)
{
    EventBroadcast.test = function eventBroadcastTestFn()
    {
        var eb = EventBroadcast.create();
        eb._send({
            event: "test",
            score: 1234,
            rating: 2
        });

        eb.missionComplete(0, 1024, 1, 1024, 1,
                           "Amy", "English 0", "エイミー", "日本語 0", "en", false);
        eb.missionComplete(1, 1024, 3, 2048, 2,
                           "Bellows", "English 1", "ベローズ", "日本語 1", "ja",
                           false);
        eb.missionComplete(2, 1024, 2, 3072, 2,
                           "Pinion", "English 2", "ピニオン", "日本語 2", "ja", true);
        eb.missionComplete(3, 1024, 3, 4096, 3,
                           "Chamber", "English 3", "チェインバー", "日本語 3", "en",
                          true);

        console.log("EventBroadcast: tests passed");
    };

}
