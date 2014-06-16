// Copyright (c) 2011-2014 Turbulenz Limited
;

;

;

var RequestHandler = (function () {
    function RequestHandler() {
        this.reasonConnectionLost = 0;
        this.reasonServiceBusy = 1;
    }
    RequestHandler.prototype.retryExponential = function (callContext, requestFn, status) {
        if (!this.notifiedConnectionLost && TurbulenzEngine.time - this.connectionLostTime > (this.notifyTime * 0.001)) {
            this.notifiedConnectionLost = true;

            var reason;
            if (status === 0) {
                reason = this.reasonConnectionLost;
            } else {
                reason = this.reasonServiceBusy;
            }
            callContext.reason = reason;
            this.onRequestTimeout(reason, callContext);
        }

        if (this.connected) {
            this.connectionLostTime = TurbulenzEngine.time;
            this.notifiedConnectionLost = false;
            this.connected = false;
            this.reconnectTest = callContext;

            callContext.status = status;
        } else if (this.reconnectTest !== callContext) {
            var reconnectedObserver = this.reconnectedObserver;
            var onReconnected = function onReconnectedFn() {
                reconnectedObserver.unsubscribe(onReconnected);
                requestFn();
            };
            reconnectedObserver.subscribe(onReconnected);
            return;
        }

        if (callContext.expTime) {
            callContext.expTime = 2 * callContext.expTime;
            if (callContext.expTime > this.maxRetryTime) {
                callContext.expTime = this.maxRetryTime;
            }
        } else {
            callContext.expTime = this.initialRetryTime;
        }

        if (callContext.retries) {
            callContext.retries += 1;
        } else {
            callContext.retries = 1;
        }
        TurbulenzEngine.setTimeout(requestFn, callContext.expTime);
    };

    RequestHandler.prototype.retryAfter = function (callContext, retryAfter, requestFn, status) {
        if (callContext.retries) {
            callContext.retries += 1;
        } else {
            callContext.firstRetry = TurbulenzEngine.time;
            callContext.retries = 1;
        }

        if (!callContext.notifiedMaxRetries && TurbulenzEngine.time - callContext.firstRetry + retryAfter > this.notifyTime) {
            callContext.notifiedMaxRetries = true;

            var reason = this.reasonServiceBusy;
            callContext.reason = reason;
            this.onRequestTimeout(reason, callContext);
        }

        TurbulenzEngine.setTimeout(requestFn, retryAfter * 1000);
    };

    RequestHandler.prototype.request = function (callContext) {
        var makeRequest;
        var that = this;

        var responseCallback = function responseCallbackFn(responseAsset, status) {
            if (that.destroyed) {
                return;
            }

            var sendEventToHandlers = that.sendEventToHandlers;
            var handlers = that.handlers;

            if (status === 0 || status === 408 || status === 429 || status === 480 || status === 504) {
                that.retryExponential(callContext, makeRequest, status);
                return;
            }

            if (!that.connected) {
                // Reconnected!
                that.connected = true;
                if (that.reconnectTest === callContext && that.notifiedConnectionLost) {
                    that.onReconnected(that.reconnectTest.reason, that.reconnectTest);
                }
                that.reconnectTest = null;
                that.reconnectedObserver.notify();
            }

            if (callContext.responseFilter && !callContext.responseFilter.call(this, callContext, makeRequest, responseAsset, status)) {
                return;
            }

            if (that.responseFilter && !that.responseFilter(callContext, makeRequest, responseAsset, status)) {
                return;
            }

            if (callContext.onload) {
                var nameStr;
                if (responseAsset && responseAsset.name) {
                    nameStr = responseAsset.name;
                } else {
                    nameStr = callContext.src;
                }

                sendEventToHandlers(handlers.eventOnload, { eventType: "eventOnload", name: nameStr });

                callContext.onload(responseAsset, status, callContext);
                callContext.onload = null;
            }
            callContext = null;
        };

        makeRequest = function makeRequestFn() {
            if (that.destroyed) {
                return;
            }

            if (callContext.requestFn) {
                if (callContext.requestOwner) {
                    callContext.requestFn.call(callContext.requestOwner, callContext.src, responseCallback, callContext);
                } else {
                    callContext.requestFn(callContext.src, responseCallback, callContext);
                }
            } else if (callContext.requestOwner) {
                callContext.requestOwner.request(callContext.src, responseCallback, callContext);
            } else {
                TurbulenzEngine.request(callContext.src, responseCallback);
            }
        };

        makeRequest();
    };

    RequestHandler.prototype.addEventListener = function (eventType, eventListener) {
        var i;
        var length;
        var eventHandlers;

        if (this.handlers.hasOwnProperty(eventType)) {
            eventHandlers = this.handlers[eventType];

            if (eventListener) {
                // Check handler is not already stored
                length = eventHandlers.length;
                for (i = 0; i < length; i += 1) {
                    if (eventHandlers[i] === eventListener) {
                        // Event handler has already been added
                        return;
                    }
                }

                eventHandlers.push(eventListener);
            }
        }
    };

    RequestHandler.prototype.removeEventListener = function (eventType, eventListener) {
        var i;
        var length;
        var eventHandlers;

        if (this.handlers.hasOwnProperty(eventType)) {
            eventHandlers = this.handlers[eventType];

            if (eventListener) {
                length = eventHandlers.length;
                for (i = 0; i < length; i += 1) {
                    if (eventHandlers[i] === eventListener) {
                        eventHandlers.splice(i, 1);
                        break;
                    }
                }
            }
        }
    };

    RequestHandler.prototype.sendEventToHandlers = function (eventHandlers, arg0) {
        var i;
        var length = eventHandlers.length;

        if (length) {
            for (i = 0; i < length; i += 1) {
                eventHandlers[i](arg0);
            }
        }
    };

    RequestHandler.prototype.destroy = function () {
        this.destroyed = true;
        this.handlers = null;
        this.onReconnected = null;
        this.onRequestTimeout = null;
    };

    RequestHandler.create = function (params) {
        var rh = new RequestHandler();

        rh.initialRetryTime = params.initialRetryTime || 0.5 * 1000;
        rh.notifyTime = params.notifyTime || 4 * 1000;
        rh.maxRetryTime = params.maxRetryTime || 8 * 1000;

        rh.notifiedConnectionLost = false;
        rh.connected = true;
        rh.reconnectedObserver = Observer.create();
        rh.reconnectTest = null;

        /* tslint:disable:no-empty */
        rh.onReconnected = params.onReconnected || function onReconnectedFn() {
        };
        rh.onRequestTimeout = params.onRequestTimeout || function onRequestTimeoutFn(/* callContext */ ) {
        };

        /* tslint:enable:no-empty */
        var handlers = { eventOnload: [] };
        rh.handlers = handlers;

        return rh;
    };
    return RequestHandler;
})();
