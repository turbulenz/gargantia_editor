// Copyright (c) 2011-2013 Turbulenz Limited
;

;

var CustomMetricEvent = (function () {
    function CustomMetricEvent() {
    }
    CustomMetricEvent.create = function () {
        return new CustomMetricEvent();
    };
    return CustomMetricEvent;
})();
;

var CustomMetricEventBatch = (function () {
    function CustomMetricEventBatch() {
    }
    CustomMetricEventBatch.prototype.push = function (key, value) {
        var event = CustomMetricEvent.create();
        event.key = key;
        event.value = value;
        event.timeOffset = TurbulenzEngine.time;
        this.events.push(event);
    };

    CustomMetricEventBatch.prototype.length = function () {
        return this.events.length;
    };

    CustomMetricEventBatch.prototype.clear = function () {
        this.events.length = 0;
    };

    CustomMetricEventBatch.create = function () {
        var batch = new CustomMetricEventBatch();
        batch.events = [];
        return batch;
    };
    return CustomMetricEventBatch;
})();
;

;

;

// -----------------------------------------------------------------------------
// ServiceRequester
// -----------------------------------------------------------------------------
var ServiceRequester = (function () {
    function ServiceRequester() {
    }
    // make a request if the service is available. Same parameters as an
    // Utilities.ajax call with extra argument:
    //     neverDiscard - Never discard the request. Always queues the request
    //                    for when the service is again available. (Ignores
    //                    server preference)
    ServiceRequester.prototype.request = function (params) {
        var discardRequestFn = function discardRequestFn() {
            if (params.callback) {
                params.callback({ 'ok': false, 'msg': 'Service Unavailable. Discarding request' }, 503);
            }
        };

        var that = this;
        var serviceStatusObserver = this.serviceStatusObserver;

        var onServiceStatusChange;
        onServiceStatusChange = function onServiceStatusChangeFn(running, discardRequest) {
            if (discardRequest) {
                if (!params.neverDiscard) {
                    serviceStatusObserver.unsubscribe(onServiceStatusChange);
                    discardRequestFn();
                }
            } else if (running) {
                serviceStatusObserver.unsubscribe(onServiceStatusChange);
                that.request(params);
            }
        };

        if (!this.running) {
            if (this.discardRequests && !params.neverDiscard) {
                TurbulenzEngine.setTimeout(discardRequestFn, 0);
                return false;
            }

            if (!params.waiting) {
                params.waiting = true;
                serviceStatusObserver.subscribe(onServiceStatusChange);
            }
            return true;
        }

        var oldResponseFilter = params.responseFilter;
        params.responseFilter = function checkServiceUnavailableFn(callContext, makeRequest, responseJSON, status) {
            if (status === 503) {
                var responseObj = JSON.parse(responseJSON);
                var statusObj = responseObj.data;
                var discardRequests = (statusObj ? statusObj.discardRequests : true);
                that.discardRequests = discardRequests;

                if (discardRequests && !params.neverDiscard) {
                    discardRequestFn();
                } else {
                    serviceStatusObserver.subscribe(onServiceStatusChange);
                }
                TurbulenzServices.serviceUnavailable(that, callContext);

                // An error occurred so return false to avoid calling the success callback
                return false;
            } else {
                if (oldResponseFilter) {
                    return oldResponseFilter.call(params.requestHandler, callContext, makeRequest, responseJSON, status);
                }
                return true;
            }
        };

        Utilities.ajax(params);
        return true;
    };

    ServiceRequester.create = function (serviceName, params) {
        var serviceRequester = new ServiceRequester();

        if (!params) {
            params = {};
        }

        // we assume everything is working at first
        serviceRequester.running = true;
        serviceRequester.discardRequests = false;
        serviceRequester.serviceStatusObserver = Observer.create();

        serviceRequester.serviceName = serviceName;

        serviceRequester.onServiceUnavailable = params.onServiceUnavailable;
        serviceRequester.onServiceAvailable = params.onServiceAvailable;

        return serviceRequester;
    };
    return ServiceRequester;
})();
;

//
// TurbulenzServices
//
var TurbulenzServices = (function () {
    function TurbulenzServices() {
    }
    TurbulenzServices.available = function () {
        return window.gameSlug !== undefined;
    };

    TurbulenzServices.addBridgeEvents = function () {
        var turbulenz = window.top.Turbulenz;
        var turbulenzData = (turbulenz && turbulenz.Data) || {};
        var sessionToJoin = turbulenzData.joinMultiplayerSessionId;
        var that = this;

        var onJoinMultiplayerSession = function onJoinMultiplayerSessionFn(joinMultiplayerSessionId) {
            that.multiplayerJoinRequestQueue.push(joinMultiplayerSessionId);
        };

        var onReceiveConfig = function onReceiveConfigFn(configString) {
            var config = JSON.parse(configString);

            if (config.mode) {
                that.mode = config.mode;
            }

            if (config.joinMultiplayerSessionId) {
                that.multiplayerJoinRequestQueue.push(config.joinMultiplayerSessionId);
            }

            that.bridgeServices = !!config.bridgeServices;
        };

        if (sessionToJoin) {
            this.multiplayerJoinRequestQueue.push(sessionToJoin);
        }

        TurbulenzBridge.setOnMultiplayerSessionToJoin(onJoinMultiplayerSession);
        TurbulenzBridge.setOnReceiveConfig(onReceiveConfig);
        TurbulenzBridge.triggerRequestConfig();

        // Setup framework for asynchronous function calls
        this.responseHandlers = [null];

        // 0 is reserved value for no registered callback
        this.responseIndex = 0;
        TurbulenzBridge.on("bridgeservices.response", function (jsondata) {
            that.routeResponse(jsondata);
        });
    };

    TurbulenzServices.callOnBridge = function (event, data, callback) {
        var request = {
            data: data,
            key: undefined
        };
        if (callback) {
            this.responseIndex += 1;
            this.responseHandlers[this.responseIndex] = callback;
            request.key = this.responseIndex;
        }
        TurbulenzBridge.emit('bridgeservices.' + event, JSON.stringify(request));
    };

    TurbulenzServices.addSignature = function (data, url) {
        var str;
        data.requestUrl = url;
        str = TurbulenzEngine.encrypt(JSON.stringify(data));
        data.str = str;
        data.signature = TurbulenzEngine.generateSignature(str);
        return data;
    };

    TurbulenzServices.routeResponse = function (jsondata) {
        var response = JSON.parse(jsondata);
        var index = response.key || 0;
        var callback = this.responseHandlers[index];
        if (callback) {
            this.responseHandlers[index] = null;
            callback(response.data);
        }
    };

    TurbulenzServices.onServiceUnavailable = function (serviceName, callContext) {
    };

    TurbulenzServices.onServiceAvailable = function (serviceName, callContext) {
    };

    TurbulenzServices.createGameSession = /* tslint:enable:no-empty */
    function (requestHandler, sessionCreatedFn, errorCallbackFn) {
        return GameSession.create(requestHandler, sessionCreatedFn, errorCallbackFn);
    };

    TurbulenzServices.createMappingTable = function (requestHandler, gameSession, tableReceivedFn, defaultMappingSettings, errorCallbackFn) {
        var mappingTable;
        var mappingTableSettings = gameSession && gameSession.mappingTable;

        var mappingTableURL;
        var mappingTablePrefix;
        var assetPrefix;

        if (mappingTableSettings) {
            mappingTableURL = mappingTableSettings.mappingTableURL;
            mappingTablePrefix = mappingTableSettings.mappingTablePrefix;
            assetPrefix = mappingTableSettings.assetPrefix;
        } else if (defaultMappingSettings) {
            mappingTableURL = defaultMappingSettings.mappingTableURL || (defaultMappingSettings.mappingTableURL === "" ? "" : "mapping_table.json");
            mappingTablePrefix = defaultMappingSettings.mappingTablePrefix || (defaultMappingSettings.mappingTablePrefix === "" ? "" : "staticmax/");
            assetPrefix = defaultMappingSettings.assetPrefix || (defaultMappingSettings.assetPrefix === "" ? "" : "missing/");
        } else {
            mappingTableURL = "mapping_table.json";
            mappingTablePrefix = "staticmax/";
            assetPrefix = "missing/";
        }

        // If there is an error, inject any default mapping data and
        // inform the caller.
        var mappingTableErr = function mappingTableErrFn(msg) {
            var mapping = defaultMappingSettings && (defaultMappingSettings.urnMapping || {});
            var errorCallback = errorCallbackFn || TurbulenzServices.defaultErrorCallback;

            mappingTable.setMapping(mapping);
            errorCallback(msg);
        };

        var mappingTableParams = {
            mappingTableURL: mappingTableURL,
            mappingTablePrefix: mappingTablePrefix,
            assetPrefix: assetPrefix,
            requestHandler: requestHandler,
            onload: tableReceivedFn,
            errorCallback: mappingTableErr
        };

        mappingTable = MappingTable.create(mappingTableParams);
        return mappingTable;
    };

    TurbulenzServices.createLeaderboardManager = function (requestHandler, gameSession, leaderboardMetaReceived, errorCallbackFn) {
        return LeaderboardManager.create(requestHandler, gameSession, leaderboardMetaReceived, errorCallbackFn);
    };

    TurbulenzServices.createBadgeManager = function (requestHandler, gameSession) {
        return BadgeManager.create(requestHandler, gameSession);
    };

    TurbulenzServices.createStoreManager = function (requestHandler, gameSession, storeMetaReceived, errorCallbackFn) {
        return StoreManager.create(requestHandler, gameSession, storeMetaReceived, errorCallbackFn);
    };

    TurbulenzServices.createNotificationsManager = function (requestHandler, gameSession, successCallbackFn, errorCallbackFn) {
        return NotificationsManager.create(requestHandler, gameSession, successCallbackFn, errorCallbackFn);
    };

    TurbulenzServices.createMultiplayerSessionManager = function (requestHandler, gameSession) {
        return MultiPlayerSessionManager.create(requestHandler, gameSession);
    };

    TurbulenzServices.createUserProfile = function (requestHandler, profileReceivedFn, errorCallbackFn) {
        var userProfile = {};

        if (!errorCallbackFn) {
            errorCallbackFn = TurbulenzServices.defaultErrorCallback;
        }

        var loadUserProfileCallback = function loadUserProfileCallbackFn(userProfileData) {
            if (userProfileData && userProfileData.ok) {
                userProfileData = userProfileData.data;
                var p;
                for (p in userProfileData) {
                    if (userProfileData.hasOwnProperty(p)) {
                        userProfile[p] = userProfileData[p];
                    }
                }
            }
        };

        var url = '/api/v1/profiles/user';

        if (TurbulenzServices.available()) {
            this.getService('profiles').request({
                url: url,
                method: 'GET',
                callback: function createUserProfileAjaxErrorCheck(jsonResponse, status) {
                    if (status === 200) {
                        loadUserProfileCallback(jsonResponse);
                    } else if (errorCallbackFn) {
                        errorCallbackFn("TurbulenzServices.createUserProfile error with HTTP status " + status + ": " + jsonResponse.msg, status);
                    }
                    if (profileReceivedFn) {
                        profileReceivedFn(userProfile);
                    }
                },
                requestHandler: requestHandler
            });
        }

        return userProfile;
    };

    TurbulenzServices.upgradeAnonymousUser = // This should only be called if UserProfile.anonymous is true.
    function (upgradeCB) {
        if (upgradeCB) {
            var onUpgrade = function onUpgradeFn(_signal) {
                upgradeCB();
            };
            TurbulenzBridge.on('user.upgrade.occurred', onUpgrade);
        }

        TurbulenzBridge.emit('user.upgrade.show');
    };

    TurbulenzServices.sendCustomMetricEvent = function (eventKey, eventValue, requestHandler, gameSession, errorCallbackFn) {
        if (!errorCallbackFn) {
            errorCallbackFn = TurbulenzServices.defaultErrorCallback;
        }

        // defaultErrorCallback should never be null, so this should
        // hold.
        debug.assert(errorCallbackFn, "no error callback");

        if (!TurbulenzServices.available()) {
            errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "failed: Service not available", 0);
            return;
        }

        if (('string' !== typeof eventKey) || (0 === eventKey.length)) {
            errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "failed: Event key must be a non-empty string", 0);
            return;
        }

        if ('number' !== typeof eventValue || isNaN(eventValue) || !isFinite(eventValue)) {
            if ('[object Array]' !== Object.prototype.toString.call(eventValue)) {
                errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "failed: Event value must be a number or " + "an array of numbers", 0);
                return;
            }

            var i, valuesLength = eventValue.length;
            for (i = 0; i < valuesLength; i += 1) {
                if ('number' !== typeof eventValue[i] || isNaN(eventValue[i]) || !isFinite(eventValue[i])) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "failed: Event value array elements must " + "be numbers", 0);
                    return;
                }
            }
        }

        this.getService('customMetrics').request({
            url: '/api/v1/custommetrics/add-event/' + gameSession.gameSlug,
            method: 'POST',
            data: {
                'key': eventKey,
                'value': eventValue,
                'gameSessionId': gameSession.gameSessionId
            },
            callback: function sendCustomMetricEventAjaxErrorCheck(jsonResponse, status) {
                if (status !== 200) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "error with HTTP status " + status + ": " + jsonResponse.msg, status);
                }
            },
            requestHandler: requestHandler,
            encrypt: true
        });
    };

    TurbulenzServices.sendCustomMetricEventBatch = function (eventBatch, requestHandler, gameSession, errorCallbackFn) {
        if (!errorCallbackFn) {
            errorCallbackFn = TurbulenzServices.defaultErrorCallback;
        }

        if (!TurbulenzServices.available()) {
            if (errorCallbackFn) {
                errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Service not available", 0);
            }
            return;
        }

        // Validation
        // Test eventBatch is correct type
        var currentTime = TurbulenzEngine.time;
        var events = eventBatch.events;
        var eventIndex;
        var numEvents = events.length;
        for (eventIndex = 0; eventIndex < numEvents; eventIndex += 1) {
            var eventKey = events[eventIndex].key;
            var eventValue = events[eventIndex].value;
            var eventTime = events[eventIndex].timeOffset;

            if (('string' !== typeof eventKey) || (0 === eventKey.length)) {
                if (errorCallbackFn) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Event key must be a" + " non-empty string", 0);
                }
                return;
            }

            if ('number' !== typeof eventValue || isNaN(eventValue) || !isFinite(eventValue)) {
                if ('[object Array]' !== Object.prototype.toString.call(eventValue)) {
                    if (errorCallbackFn) {
                        errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Event value must be a" + " number or an array of numbers", 0);
                    }
                    return;
                }

                var i, valuesLength = eventValue.length;
                for (i = 0; i < valuesLength; i += 1) {
                    if ('number' !== typeof eventValue[i] || isNaN(eventValue[i]) || !isFinite(eventValue[i])) {
                        if (errorCallbackFn) {
                            errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Event value array" + " elements must be numbers", 0);
                        }
                        return;
                    }
                }
            }

            if ('number' !== typeof eventTime || isNaN(eventTime) || !isFinite(eventTime)) {
                if (errorCallbackFn) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Event time offset is" + " corrupted", 0);
                }
                return;
            }

            // Update the time offset to be relative to the time we're sending the batch,
            // the server will use this to calculate event times
            events[eventIndex].timeOffset = eventTime - currentTime;
        }

        this.getService('customMetrics').request({
            url: '/api/v1/custommetrics/add-event-batch/' + gameSession.gameSlug,
            method: 'POST',
            data: { 'batch': events, 'gameSessionId': gameSession.gameSessionId },
            callback: function sendCustomMetricEventBatchAjaxErrorCheck(jsonResponse, status) {
                if (status !== 200 && errorCallbackFn) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch error with HTTP status " + status + ": " + jsonResponse.msg, status);
                }
            },
            requestHandler: requestHandler,
            encrypt: true
        });
    };

    TurbulenzServices.getService = function (serviceName) {
        var services = this.services;
        if (services.hasOwnProperty(serviceName)) {
            return services[serviceName];
        } else {
            var service = ServiceRequester.create(serviceName);
            services[serviceName] = service;
            return service;
        }
    };

    TurbulenzServices.serviceUnavailable = function (service, callContext) {
        var waitingServices = this.waitingServices;
        var serviceName = service.serviceName;
        if (waitingServices.hasOwnProperty(serviceName)) {
            return;
        }

        waitingServices[serviceName] = service;

        service.running = false;

        var onServiceUnavailableCallbacks = function onServiceUnavailableCallbacksFn(service) {
            var onServiceUnavailable = callContext.onServiceUnavailable;
            if (onServiceUnavailable) {
                onServiceUnavailable.call(service, callContext);
            }
            if (service.onServiceUnavailable) {
                service.onServiceUnavailable();
            }
            if (TurbulenzServices.onServiceUnavailable) {
                TurbulenzServices.onServiceUnavailable(service);
            }
        };

        if (service.discardRequests) {
            onServiceUnavailableCallbacks(service);
        }

        if (this.pollingServiceStatus) {
            return;
        }

        var that = this;
        var pollServiceStatus;

        var serviceUrl = '/api/v1/service-status/game/read/' + window.gameSlug;
        var servicesStatusCB = function servicesStatusCBFn(responseObj, status) {
            if (status === 200) {
                var statusObj = responseObj.data;
                var servicesObj = statusObj.services;

                var retry = false;
                var serviceName;
                for (serviceName in waitingServices) {
                    if (waitingServices.hasOwnProperty(serviceName)) {
                        var service = waitingServices[serviceName];
                        var serviceData = servicesObj[serviceName];
                        var serviceRunning = serviceData.running;

                        service.running = serviceRunning;
                        service.description = serviceData.description;

                        if (serviceRunning) {
                            if (service.discardRequests) {
                                var onServiceAvailable = callContext.onServiceAvailable;
                                if (onServiceAvailable) {
                                    onServiceAvailable.call(service, callContext);
                                }
                                if (service.onServiceAvailable) {
                                    service.onServiceAvailable();
                                }
                                if (TurbulenzServices.onServiceAvailable) {
                                    TurbulenzServices.onServiceAvailable(service);
                                }
                            }

                            delete waitingServices[serviceName];
                            service.discardRequests = false;
                            service.serviceStatusObserver.notify(serviceRunning, service.discardRequests);
                        } else {
                            if (serviceData.discardRequests && !service.discardRequests) {
                                service.discardRequests = true;
                                onServiceUnavailableCallbacks(service);

                                // discard all waiting requests
                                service.serviceStatusObserver.notify(serviceRunning, service.discardRequests);
                            }
                            retry = true;
                        }
                    }
                }
                if (!retry) {
                    this.pollingServiceStatus = false;
                    return;
                }
                TurbulenzEngine.setTimeout(pollServiceStatus, statusObj.pollInterval * 1000);
            } else {
                TurbulenzEngine.setTimeout(pollServiceStatus, that.defaultPollInterval);
            }
        };

        pollServiceStatus = function pollServiceStatusFn() {
            Utilities.ajax({
                url: serviceUrl,
                method: 'GET',
                callback: servicesStatusCB
            });
        };

        pollServiceStatus();
    };
    TurbulenzServices.multiplayerJoinRequestQueue = {
        // A FIFO queue that passes events through to the handler when
        // un-paused and buffers up events while paused
        argsQueue: [],
        /* tslint:disable:no-empty */
        handler: function nopFn() {
        },
        /* tslint:enable:no-empty */
        context: undefined,
        paused: true,
        onEvent: function onEventFn(handler, context) {
            this.handler = handler;
            this.context = context;
        },
        push: function pushFn(sessionId) {
            var args = [sessionId];
            if (this.paused) {
                this.argsQueue.push(args);
            } else {
                this.handler.apply(this.context, args);
            }
        },
        shift: function shiftFn() {
            var args = this.argsQueue.shift();
            return args ? args[0] : undefined;
        },
        clear: function clearFn() {
            this.argsQueue = [];
        },
        pause: function pauseFn() {
            this.paused = true;
        },
        resume: function resumeFn() {
            this.paused = false;
            while (this.argsQueue.length) {
                this.handler.apply(this.context, this.argsQueue.shift());
                if (this.paused) {
                    break;
                }
            }
        }
    };

    TurbulenzServices.defaultErrorCallback = function (errorMsg, httpStatus) {
    };

    TurbulenzServices.services = {};
    TurbulenzServices.waitingServices = {};
    TurbulenzServices.pollingServiceStatus = false;

    TurbulenzServices.defaultPollInterval = 4000;
    return TurbulenzServices;
})();

if (typeof TurbulenzBridge !== 'undefined') {
    TurbulenzServices.addBridgeEvents();
} else {
    debug.log("No TurbulenzBridge object");
}
