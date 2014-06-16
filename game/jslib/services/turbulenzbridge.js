// Copyright (c) 2011-2013 Turbulenz Limited
/*global window: false*/
/*global TurbulenzServices: false*/
/*global debug: false*/
/*jshint nomen: false*/
/*
* An object that takes care of communication with the gamesite and, among
* other things, replaces the deprecated 'osdlib' module.
*
* It wraps an EventEmitter instance that is stored on the page and provides
* methods that manually display the 'loading'-flag, post certain events to
* the page or request information about a player's settings.
*/
var TurbulenzBridge = (function () {
    function TurbulenzBridge() {
    }
    TurbulenzBridge._initInstance = /**
    * Try to find an 'EventEmitter' object on the page and cache it.
    */
    function () {
        var Turbulenz = window.top.Turbulenz;

        if (Turbulenz && Turbulenz.Services) {
            var bridge = Turbulenz.Services.bridge;
            if (!bridge) {
                return;
            }

            this._bridge = bridge;

            this.emit = bridge.emit;

            // TODO can remove all of these or's after gamesite and hub updates
            this.on = bridge.gameListenerOn || bridge.addListener || bridge.setListener;

            // we cant use off yet because the function received on the other VM is re-wrapped each time
            // this.off = bridge.gameListenerOff;
            // Legacy functions addListener/setListener
            this.addListener = bridge.gameListenerOn || bridge.addListener || bridge.setListener;
            this.setListener = bridge.gameListenerOn || bridge.setListener;
        } else {
            debug.log("No turbulenz services");
        }

        if (typeof TurbulenzServices !== 'undefined') {
            TurbulenzServices.addBridgeEvents();
        }
    };

    TurbulenzBridge.isInitialised = function () {
        return (this._bridge !== undefined);
    };

    TurbulenzBridge.emit = /* tslint:disable:no-empty */
    function (serviceName, request, arg) {
    };

    TurbulenzBridge.on = function (serviceName, cb) {
    };

    TurbulenzBridge.addListener = //off: function offFn() {},
    function () {
    };

    TurbulenzBridge.setListener = function (eventName, listener) {
    };

    TurbulenzBridge.setOnReceiveConfig = /* tslint:enable:no-empty */
    /**
    * Message that passes game configuration information from the hosting site
    */
    function (callback) {
        this.on('config.set', callback);
    };

    TurbulenzBridge.triggerRequestConfig = function () {
        this.emit('config.request');
    };

    TurbulenzBridge.startLoading = /**
    * Methods to signal the beginning and end of load/save processes.
    * This will display hints to the player and helps the page
    * to prioritize resources.
    */
    function () {
        this.emit('status.loading.start');
    };

    TurbulenzBridge.startSaving = function () {
        this.emit('status.saving.start');
    };

    TurbulenzBridge.stopLoading = function () {
        this.emit('status.loading.stop');
    };

    TurbulenzBridge.stopSaving = function () {
        this.emit('status.saving.stop');
    };

    TurbulenzBridge.createdGameSession = /**
    * These methods tell the gamesite the gameSession so it can
    * emit a heartbeat for the message server to detect.
    * gameSessionId - A string for identifying the current game session
    */
    function (gameSessionId) {
        this.emit('game.session.created', gameSessionId);
    };

    TurbulenzBridge.destroyedGameSession = function (gameSessionId) {
        this.emit('game.session.destroyed', gameSessionId);
    };

    TurbulenzBridge.setGameSessionStatus = function (gameSessionId, status) {
        this.emit('game.session.status', gameSessionId, status);
    };

    TurbulenzBridge.setGameSessionInfo = function (info) {
        this.emit('game.session.info', info);
    };

    TurbulenzBridge.updateUserBadge = /**
    * Update a userbadge. Used by the BadgeManager
    */
    function (badge) {
        this.emit('userbadge.update', badge);
    };

    TurbulenzBridge.updateLeaderBoard = /**
    * Update a leaderboard. Used by the LeaderboardManager
    */
    function (scoreData) {
        this.emit('leaderboards.update', scoreData);
    };

    TurbulenzBridge.setOnMultiplayerSessionToJoin = /**
    * Handle multiplayer join events
    */
    function (callback) {
        this.on('multiplayer.session.join', callback);
    };

    TurbulenzBridge.triggerJoinedMultiplayerSession = function (session) {
        this.emit('multiplayer.session.joined', session);
    };

    TurbulenzBridge.triggerLeaveMultiplayerSession = function (sessionId) {
        this.emit('multiplayer.session.leave', sessionId);
    };

    TurbulenzBridge.triggerMultiplayerSessionMakePublic = function (sessionId) {
        this.emit('multiplayer.session.makepublic', sessionId);
    };

    TurbulenzBridge.setOnBasketUpdate = /**
    * Handle store basket events
    */
    function (callback) {
        this.on('basket.site.update', callback);
    };

    TurbulenzBridge.triggerBasketUpdate = function (basket) {
        this.emit('basket.game.update.v2', basket);
    };

    TurbulenzBridge.triggerUserStoreUpdate = function (items) {
        this.emit('store.user.update', items);
    };

    TurbulenzBridge.setOnPurchaseConfirmed = function (callback) {
        this.on('purchase.confirmed', callback);
    };

    TurbulenzBridge.setOnPurchaseRejected = function (callback) {
        this.on('purchase.rejected', callback);
    };

    TurbulenzBridge.triggerShowConfirmPurchase = function () {
        this.emit('purchase.show.confirm');
    };

    TurbulenzBridge.triggerFetchStoreMeta = function () {
        this.emit('fetch.store.meta');
    };

    TurbulenzBridge.setOnStoreMeta = function (callback) {
        this.on('store.meta.v2', callback);
    };

    TurbulenzBridge.triggerSendInstantNotification = /**
    * Handle in-game notification events
    */
    function (notification) {
        this.emit('notifications.ingame.sendInstant', notification);
    };

    TurbulenzBridge.triggerSendDelayedNotification = function (notification) {
        this.emit('notifications.ingame.sendDelayed', notification);
    };

    TurbulenzBridge.setOnNotificationSent = function (callback) {
        this.on('notifications.ingame.sent', callback);
    };

    TurbulenzBridge.triggerCancelNotificationByID = function (params) {
        this.emit('notifications.ingame.cancelByID', params);
    };

    TurbulenzBridge.triggerCancelNotificationsByKey = function (params) {
        this.emit('notifications.ingame.cancelByKey', params);
    };

    TurbulenzBridge.triggerCancelAllNotifications = function (params) {
        this.emit('notifications.ingame.cancelAll', params);
    };

    TurbulenzBridge.triggerInitNotificationManager = function (params) {
        this.emit('notifications.ingame.initNotificationManager', params);
    };

    TurbulenzBridge.setOnReceiveNotification = function (callback) {
        this.on('notifications.ingame.receive', callback);
    };

    TurbulenzBridge.changeAspectRatio = /**
    * Methods to signal changes of the viewport's aspect ratio to the page.
    */
    function (ratio) {
        this.emit('change.viewport.ratio', ratio);
    };

    TurbulenzBridge.setOnViewportHide = /**
    * Methods to set callbacks to react to events happening on the page.
    */
    function (callback) {
        this.on('change.viewport.hide', callback);
    };

    TurbulenzBridge.setOnViewportShow = function (callback) {
        this.on('change.viewport.show', callback);
    };

    TurbulenzBridge.setOnFullscreenOn = function (callback) {
        this.on('change.viewport.fullscreen.on', callback);
    };

    TurbulenzBridge.setOnFullscreenOff = function (callback) {
        this.on('change.viewport.fullscreen.off', callback);
    };

    TurbulenzBridge.setOnMenuStateChange = function (callback) {
        this.on('change.menu.state', callback);
    };

    TurbulenzBridge.setOnUserStateChange = function (callback) {
        this.on('change.user.state', callback);
    };

    TurbulenzBridge.triggerOnFullscreen = /**
    * Methods to send trigger event-emission on the page. These
    * prompt the page to trigger the aforementioned corresponding
    * onXXXX methods.
    */
    function () {
        this.emit('trigger.viewport.fullscreen');
    };

    TurbulenzBridge.triggerOnViewportVisibility = function () {
        this.emit('trigger.viewport.visibility');
    };

    TurbulenzBridge.triggerOnMenuStateChange = function () {
        this.emit('trigger.menu.state');
    };

    TurbulenzBridge.triggerOnUserStateChange = function () {
        this.emit('trigger.user.state');
    };

    TurbulenzBridge.queryFullscreen = /**
    * Methods to send requests for information to the page. These
    * methods can be used to send state-queries. They take a callback
    * function and prompt the page to call it.
    */
    /**
    * callback - a function that takes a single boolean value that
    * will be set to 'true' if the viewport is in fullscreen.
    */
    function (callback) {
        this.emit('query.viewport.fullscreen', callback);
    };

    TurbulenzBridge.queryViewportVisibility = /**
    * callback - a function that takes a single boolean value that
    * will be set to 'true' if the viewport is visible.
    */
    function (callback) {
        this.emit('query.viewport.visibility', callback);
    };

    TurbulenzBridge.queryMenuState = /**
    * callback - a function that takes an object-representation of
    * the current menu-state.
    */
    function (callback) {
        this.emit('query.menu.state', callback);
    };

    TurbulenzBridge.queryUserState = /**
    * callback - a function that takes an object-representation of
    * the current state of the user's settings.
    */
    function (callback) {
        this.emit('query.user.state', callback);
    };
    TurbulenzBridge._bridge = undefined;
    return TurbulenzBridge;
})();

if (!TurbulenzBridge.isInitialised()) {
    TurbulenzBridge._initInstance();
}
