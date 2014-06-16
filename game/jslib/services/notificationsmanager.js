// Copyright (c) 2011-2013 Turbulenz Limited
;

;

;

var NotificationPromise = (function () {
    function NotificationPromise(nm) {
        this.__successCallback = null;
        this.__errorCallback = null;
        this.__id = null;
        this.__error = null;
        this.__nm = null;
        this.__toCancel = false;
        this.__nm = nm;
    }
    NotificationPromise.prototype.success = function (callback) {
        this.__successCallback = callback;

        var id = this.__id;
        if (id) {
            TurbulenzEngine.setTimeout(function () {
                callback(id);
            }, 0);
        }
        return this;
    };

    NotificationPromise.prototype.error = function (callback) {
        this.__errorCallback = callback;

        var error = this.__error;
        if (error) {
            TurbulenzEngine.setTimeout(function () {
                callback(error);
            }, 0);
        }
        return this;
    };

    NotificationPromise.prototype.cancel = function () {
        this.__toCancel = true;

        var id = this.__id;
        if (id) {
            this.__nm.cancelNotificationByID(id);
        }
    };

    NotificationPromise.prototype.getId = function () {
        return this.__id;
    };

    NotificationPromise.prototype.callSuccess = function (id) {
        this.__id = id;
        if (this.__successCallback) {
            this.__successCallback(id);
        }
        if (this.__toCancel) {
            this.__nm.cancelNotificationByID(id);
        }
    };

    NotificationPromise.prototype.callError = function (error) {
        this.__error = error;

        if (this.__errorCallback) {
            this.__errorCallback(error);
        }
    };
    return NotificationPromise;
})();

//
var NotificationsManager = (function () {
    function NotificationsManager() {
        this.keys = [];
    }
    NotificationsManager.prototype._validateKey = function (params) {
        var key = params.key;
        if (!key || !this.keys[key]) {
            throw new Error('Unknown key "' + key + '" given.');
        }
        return key;
    };

    NotificationsManager.prototype._validateMsg = function (params) {
        var msg = params.msg;

        if (!msg) {
            throw new Error('No "msg" given.');
        } else if (!msg.text) {
            throw new Error('msg has no "text" attribute.');
        }

        return msg;
    };

    /*
    * Sends an instant notification to one or more recipients. params should be an object containing
    *
    * key: string, the key of notification to be sent. Must be specified in notifications.yaml
    * msg: string, (For now. This should really be decided soon
    *
    * optional:
    * recipient: string, the username of the player to receive this notification. Defaults to the current user
    *
    * returns a NotificationPromise-object. The promise exposes 'success' and 'error' functions which can be passed
    * corresponding callback-functions.
    */
    NotificationsManager.prototype.sendInstantNotification = function (params) {
        var key = this._validateKey(params);
        var msg = this._validateMsg(params);

        var token = this.tokenFactory.next();
        var promise = new NotificationPromise(this);

        this.notificationPromises[token] = promise;

        if (!params.recipient) {
            throw new Error('Notification recipient is null');
        }

        var params = {
            token: token,
            session: this.gameSession,
            key: key,
            msg: msg,
            recipient: params.recipient,
            noNotification: params.noNotification
        };

        TurbulenzBridge.triggerSendInstantNotification(JSON.stringify(params));

        return promise;
    };

    /*
    * Sends a notification to the current user. params should be an object containing
    *
    * key: string, the key of notification to be sent. Must be specified in notifications.yaml
    * msg: string, (For now. This should really be decided soon
    *
    * optional:
    * delay: number, delay in seconds until the notification is sent. Defaults to 0
    *
    * returns a NotificationPromise-object. The promise exposes 'success' and 'error' functions (which can be passed
    * corresponding callback-functions) as well as a 'cancel' function which can be used to cancel the notification
    * as long as it hasn't been delivered yet
    */
    NotificationsManager.prototype.sendDelayedNotification = function (params) {
        var key = this._validateKey(params);
        var msg = this._validateMsg(params);

        var delay = params.delay || 0;
        if (isNaN(delay)) {
            throw new Error('delay is not a number: "' + delay + '"');
        }

        var token = this.tokenFactory.next();
        var promise = new NotificationPromise(this);

        this.notificationPromises[token] = promise;

        var params = {
            token: token,
            session: this.gameSession,
            key: key,
            msg: msg,
            delay: delay,
            noNotification: params.noNotification
        };

        TurbulenzBridge.triggerSendDelayedNotification(JSON.stringify(params));

        return promise;
    };

    NotificationsManager.prototype.cancelNotificationByID = function (ident) {
        TurbulenzBridge.triggerCancelNotificationByID(JSON.stringify({
            id: ident,
            session: this.gameSession
        }));
    };

    NotificationsManager.prototype.cancelNotificationsByKey = function (key) {
        if (!this.keys[key]) {
            throw new Error('Unknown key "' + key + '" given.');
        }
        TurbulenzBridge.triggerCancelNotificationsByKey(JSON.stringify({
            key: key,
            session: this.gameSession
        }));
    };

    NotificationsManager.prototype.cancelAllNotifications = function () {
        TurbulenzBridge.triggerCancelAllNotifications(JSON.stringify({
            session: this.gameSession
        }));
    };

    NotificationsManager.prototype.addNotificationListener = function (key, listener) {
        var keyHandlers;

        if (this.handlers.hasOwnProperty(key)) {
            // Check handler is not already stored
            keyHandlers = this.handlers[key];
            var length = keyHandlers.length;
            for (var i = 0; i < length; i += 1) {
                if (keyHandlers[i] === listener) {
                    // Event handler has already been added
                    return;
                }
            }
        } else {
            keyHandlers = this.handlers[key] = [];
        }

        keyHandlers.push(listener);
    };

    NotificationsManager.prototype.removeNotificationListener = function (key, listener) {
        if (this.handlers.hasOwnProperty(key)) {
            var keyHandlers = this.handlers[key];
            var length = keyHandlers.length;
            for (var i = 0; i < length; i += 1) {
                if (keyHandlers[i] === listener) {
                    keyHandlers.splice(i, 1);
                    break;
                }
            }
        }
    };

    NotificationsManager.prototype.onNotificationReceived = function (data) {
        if (this.handlers.hasOwnProperty(data.key)) {
            var length = this.handlers[data.key].length;
            for (var i = 0; i < length; i += 1) {
                this.handlers[data.key][i](data);
            }
        }
    };

    NotificationsManager.prototype.onNotificationSent = function (data) {
        var token = data.token;
        var promise = this.notificationPromises[token];

        if (promise) {
            if (data.id) {
                promise.callSuccess(data.id);
            }
            if (data.error) {
                delete data.token;
                promise.callError(data);
            }
            delete this.notificationPromises[token];
        }
    };

    NotificationsManager.prototype.requestUserNotificationSettings = function (successCallback, errorCallback) {
        this.service.request({
            url: '/api/v1/game-notifications/usersettings/read/' + this.gameSession.gameSlug,
            method: 'GET',
            callback: function (jsonResponse, status) {
                if (status !== 200 || !jsonResponse.ok) {
                    errorCallback({
                        error: jsonResponse.msg,
                        status: status
                    });
                } else {
                    successCallback(jsonResponse.data);
                }
            },
            requestHandler: this.requestHandler
        });
    };

    NotificationsManager.prototype.requestGameNotificationKeys = function (successCallback, errorCallback) {
        var that = this;
        this.service.request({
            url: '/api/v1/game-notifications/keys/read/' + this.gameSession.gameSlug,
            method: 'GET',
            callback: function (jsonResponse, status) {
                var data = jsonResponse.data;

                if (status !== 200 || !data.keys) {
                    errorCallback(data);
                } else {
                    that.keys = data.keys;
                    successCallback(data);
                }
            },
            requestHandler: this.requestHandler
        });
    };

    NotificationsManager.prototype.onInit = function () {
        this.ready = true;
        TurbulenzBridge.triggerInitNotificationManager(JSON.stringify({
            session: this.gameSession
        }));
    };

    NotificationsManager.create = function (requestHandler, gameSession, successCallbackFn, errorCallbackFn) {
        if (!errorCallbackFn) {
            errorCallbackFn = function () {
            };
        }

        if (!TurbulenzServices.available()) {
            debug.log("notificationsManagerCreateFn: !! TurbulenzServices not available");

            // Call error callback on a timeout to get the same behaviour as the ajax call
            TurbulenzEngine.setTimeout(function () {
                errorCallbackFn({
                    status: null,
                    error: 'TurbulenzServices.createNotificationsManager requires Turbulenz services'
                });
            }, 0);
            return null;
        }

        var notificationsManager = new NotificationsManager();

        notificationsManager.gameSession = gameSession;
        notificationsManager.handlers = {};

        notificationsManager.tokenFactory = SessionToken.create();
        notificationsManager.notificationPromises = {};
        TurbulenzBridge.setOnNotificationSent(function (data) {
            notificationsManager.onNotificationSent.call(notificationsManager, data);
        });

        TurbulenzBridge.setOnReceiveNotification(function (data) {
            notificationsManager.onNotificationReceived.call(notificationsManager, data);
        });

        notificationsManager.service = TurbulenzServices.getService('notifications');
        notificationsManager.requestHandler = requestHandler;

        notificationsManager.ready = false;

        notificationsManager.requestGameNotificationKeys(function () {
            notificationsManager.requestUserNotificationSettings(function () {
                notificationsManager.onInit();

                if (successCallbackFn) {
                    successCallbackFn(notificationsManager);
                }
            }, errorCallbackFn);
        }, errorCallbackFn);

        return notificationsManager;
    };
    NotificationsManager.version = 1;
    return NotificationsManager;
})();
