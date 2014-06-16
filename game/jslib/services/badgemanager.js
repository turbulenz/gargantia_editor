// Copyright (c) 2011-2012 Turbulenz Limited
;

//badges is created by Turbulenzservices.createBadges
var BadgeManager = (function () {
    function BadgeManager() {
    }
    // list all badges (just queries the yaml file)
    BadgeManager.prototype.listUserBadges = function (callbackFn, errorCallbackFn) {
        var that = this;
        var cb = function cbFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(jsonResponse.data);
            } else if (status === 404) {
                callbackFn(null);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("Badges.listUserBadges failed with status " + status + ": " + jsonResponse.msg, status, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/badges/progress/read/' + this.gameSession.gameSlug,
            method: 'GET',
            callback: cb,
            requestHandler: this.requestHandler
        });
    };

    BadgeManager.prototype.awardUserBadge = function (badge_key, callbackFn, errorCallbackFn) {
        this.addUserBadge(badge_key, null, callbackFn, errorCallbackFn);
    };

    BadgeManager.prototype.updateUserBadgeProgress = function (badge_key, current, callbackFn, errorCallbackFn) {
        var that = this;
        if (current && typeof current === 'number') {
            this.addUserBadge(badge_key, current, callbackFn, errorCallbackFn);
        } else {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            errorCallback("Badges.updateUserBadgeProgress expects a numeric value for current", 400, [badge_key, current, callbackFn]);
        }
    };

    // add a badge to a user (gets passed a badge and a current level
    // over POST, the username is taken from the environment)
    BadgeManager.prototype.addUserBadge = function (badge_key, current, callbackFn, errorCallbackFn) {
        var that = this;
        var cb = function cbFn(jsonResponse, status) {
            if (status === 200) {
                var userbadge = jsonResponse.data;
                userbadge.gameSlug = that.gameSession.gameSlug;
                TurbulenzBridge.updateUserBadge(userbadge);
                callbackFn(userbadge);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("Badges.addUserBadge failed with status " + status + ": " + jsonResponse.msg, status, [badge_key, current, callbackFn]);
            }
        };

        var dataSpec = {};
        dataSpec.gameSessionId = this.gameSessionId;
        dataSpec.badge_key = badge_key;

        var url = '/api/v1/badges/progress/add/' + this.gameSession.gameSlug;

        if (current) {
            dataSpec.current = current;
        }

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.addSignature(dataSpec, url);
            TurbulenzServices.callOnBridge('badge.add', dataSpec, function unpackResponse(response) {
                cb(response, response.status);
            });
        } else {
            this.service.request({
                url: url,
                method: 'POST',
                data: dataSpec,
                callback: cb,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }
    };

    // list all badges (just queries the yaml file)
    BadgeManager.prototype.listBadges = function (callbackFn, errorCallbackFn) {
        var that = this;
        var cb = function cbFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(jsonResponse.data);
            } else if (status === 404) {
                callbackFn(null);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("Badges.listBadges failed with status " + status + ": " + jsonResponse.msg, status, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/badges/read/' + that.gameSession.gameSlug,
            method: 'GET',
            callback: cb,
            requestHandler: this.requestHandler
        });
    };

    BadgeManager.prototype.errorCallbackFn = function () {
        var x = Array.prototype.slice.call(arguments);
        Utilities.log('BadgeManager error: ', x);
    };

    BadgeManager.create = function (requestHandler, gameSession) {
        if (!TurbulenzServices.available()) {
            return null;
        }

        var badgeManager = new BadgeManager();

        badgeManager.gameSession = gameSession;
        badgeManager.gameSessionId = gameSession.gameSessionId;
        badgeManager.service = TurbulenzServices.getService('badges');
        badgeManager.requestHandler = requestHandler;

        return badgeManager;
    };
    BadgeManager.version = 1;
    return BadgeManager;
})();
