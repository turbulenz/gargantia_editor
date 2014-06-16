// Copyright (c) 2011-2013 Turbulenz Limited
;

;

;

;

;

;

;

;

;

;

//
// DataShare
//
var DataShare = (function () {
    function DataShare() {
    }
    DataShare.prototype.validateKey = function (key) {
        if (!key || typeof (key) !== "string") {
            throw new Error("Invalid key string (Key string is empty or not a string)");
        }

        if (!DataShare.keyValidate.test(key)) {
            throw new Error("Invalid key string (Only alphanumeric characters and .- are permitted)");
        }
    };

    DataShare.prototype.getKey = function (params) {
        var key;
        if (params.hasOwnProperty('key')) {
            key = params.key;
            this.validateKey(key);
        } else {
            throw new Error('Key missing from parameters');
        }
        return key;
    };

    DataShare.prototype.getAccess = function (params) {
        var access;
        if (params.hasOwnProperty('access')) {
            access = params.access;
            if (access !== DataShare.publicReadOnly && access !== DataShare.publicReadAndWrite) {
                throw new Error('Access must be publicReadOnly or publicReadAndWrite');
            }
        } else {
            access = null;
        }
        return access;
    };

    DataShare.prototype.isJoined = function (username) {
        var users = this.users;
        var usersLength = users.length;
        var usersIndex;
        var lowerUsername = username.toLowerCase();

        for (usersIndex = 0; usersIndex < usersLength; usersIndex += 1) {
            if (lowerUsername === users[usersIndex].toLowerCase()) {
                return true;
            }
        }
        return false;
    };

    DataShare.prototype.join = function (callbackFn, errorCallbackFn) {
        var that = this;
        var dataShareJoinCallback = function dataShareJoinCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            if (status === 200) {
                that.users = jsonResponse.data.users;
                that.joinable = true;
                if (callbackFn) {
                    callbackFn(true);
                }
            } else if (status === 403) {
                that.joinable = false;
                if (callbackFn) {
                    callbackFn(false);
                }
            } else if (errorCallback) {
                errorCallback("DataShare.join failed with " + "status " + status + ": " + jsonResponse.msg, status, that.join, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/data-share/join/' + this.gameSession.gameSlug + '/' + this.id,
            method: 'POST',
            callback: dataShareJoinCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShare.prototype.setJoinable = function (joinable, callbackFn, errorCallbackFn) {
        var that = this;
        var dataShareSetJoinableCallback = function dataShareSetJoinableCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            if (status === 200) {
                if (callbackFn) {
                    callbackFn();
                }
            } else if (errorCallback) {
                errorCallback("DataShare.setJoinable failed with " + "status " + status + ": " + jsonResponse.msg, status, that.setJoinable, [joinable, callbackFn]);
            }
        };

        if (joinable) {
            joinable = 1;
        } else {
            joinable = 0;
        }

        this.service.request({
            url: '/api/v1/data-share/set-properties/' + this.gameSession.gameSlug + '/' + this.id,
            method: 'POST',
            data: {
                joinable: joinable
            },
            callback: dataShareSetJoinableCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShare.prototype.leave = function (callbackFn, errorCallbackFn) {
        var that = this;
        var dataShareLeaveCallback = function dataShareLeaveCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;

            if (status === 200 || status === 403 || status === 404) {
                if (callbackFn) {
                    callbackFn();
                }
            } else if (errorCallback) {
                errorCallback("DataShare.leave failed with " + "status " + status + ": " + jsonResponse.msg, status, that.leave, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/data-share/leave/' + this.gameSession.gameSlug + '/' + this.id,
            method: 'POST',
            callback: dataShareLeaveCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShare.prototype.getKeys = function (callbackFn, errorCallbackFn) {
        var that = this;

        var dataShareGetKeysCallback = function dataShareGetKeysCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            if (status === 200) {
                var keys = jsonResponse.data.keys;
                callbackFn(keys);
            } else if (errorCallback) {
                errorCallback("DataShare.getKeys failed with " + "status " + status + ": " + jsonResponse.msg, status, that.getKeys, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/data-share/read/' + this.id,
            method: 'GET',
            data: {
                gameSessionId: this.gameSessionId
            },
            callback: dataShareGetKeysCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    DataShare.prototype.get = function (key, callbackFn, errorCallbackFn) {
        var that = this;
        this.validateKey(key);

        var dataShareGetCallback = function dataShareGetCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            if (status === 200) {
                var responseData = jsonResponse.data;
                if (responseData === null) {
                    delete that.tokens[key];
                    callbackFn(responseData);
                } else {
                    that.tokens[key] = responseData.token;
                    callbackFn(responseData);
                }
            } else if (errorCallback) {
                errorCallback("DataShare.get failed with " + "status " + status + ": " + jsonResponse.msg, status, that.get, [key, callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/data-share/read/' + this.id + '/' + key,
            method: 'GET',
            data: {
                gameSessionId: this.gameSessionId
            },
            callback: dataShareGetCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    DataShare.prototype.checkUnauthoizedError = function (jsonResponse, status) {
        if (status === 403 && jsonResponse.data && jsonResponse.data.reason) {
            if (jsonResponse.data.reason === 'read_only') {
                return DataShare.notSetReason.readOnly;
            }
            if (jsonResponse.data.reason === 'read_and_write') {
                return DataShare.notSetReason.readAndWrite;
            }
        }
        return null;
    };

    DataShare.prototype.set = function (params) {
        var that = this;
        var key = this.getKey(params);

        var dataShareSetCallback = function dataShareSetCallbackFn(jsonResponse, status) {
            if (status === 200) {
                var token = jsonResponse.data.token;
                if (token) {
                    that.tokens[key] = token;
                } else {
                    delete that.tokens[key];
                }
                if (params.callback) {
                    params.callback(true);
                }
            } else {
                var reason = that.checkUnauthoizedError(jsonResponse, status);
                if (reason) {
                    if (params.callback) {
                        params.callback(false, reason);
                    }
                } else {
                    var errorCallback = params.errorCallback || that.errorCallbackFn;
                    if (errorCallback) {
                        errorCallback("DataShare.set failed with " + "status " + status + ": " + jsonResponse.msg, status, that.set, [params]);
                    }
                }
            }
        };

        var dataSpec = {
            gameSessionId: this.gameSessionId,
            value: params.value
        };

        this.service.request({
            url: '/api/v1/data-share/set/' + this.id + '/' + key,
            method: 'POST',
            data: dataSpec,
            callback: dataShareSetCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    DataShare.prototype.compareAndSet = function (params) {
        var that = this;
        var key = this.getKey(params);

        var dataShareCompareAndSetCallback = function dataShareCompareAndSetCallbackFn(jsonResponse, status) {
            var errorCallback = params.errorCallback || that.errorCallbackFn;
            if (status === 200) {
                var responseData = jsonResponse.data;
                if (responseData.wasSet) {
                    if (responseData.token) {
                        that.tokens[key] = responseData.token;
                    } else {
                        delete that.tokens[key];
                    }
                    if (params.callback) {
                        params.callback(true);
                    }
                } else if (params.callback) {
                    params.callback(false, DataShare.notSetReason.changed);
                }
            } else {
                var reason = that.checkUnauthoizedError(jsonResponse, status);
                if (reason) {
                    if (params.callback) {
                        params.callback(false, reason);
                    }
                } else {
                    var errorCallback = params.errorCallback || that.errorCallbackFn;
                    errorCallback("DataShare.compareAndSet failed with " + "status " + status + ": " + jsonResponse.msg, status, that.compareAndSet, [params]);
                }
            }
        };

        var dataSpec = {
            gameSessionId: this.gameSessionId,
            token: this.tokens[key] || '',
            value: params.value
        };
        var access = this.getAccess(params);
        if (access !== null) {
            dataSpec.access = access;
        }

        this.service.request({
            url: '/api/v1/data-share/compare-and-set/' + this.id + '/' + key,
            method: 'POST',
            data: dataSpec,
            callback: dataShareCompareAndSetCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    DataShare.create = function (requestHandler, gameSession, params, errorCallbackFn) {
        if (!TurbulenzServices.available()) {
            debug.log("dataShareCreateFn: !! TurbulenzServices not available");

            // Call error callback on a timeout to get the same behaviour as the ajax call
            TurbulenzEngine.setTimeout(function () {
                if (errorCallbackFn) {
                    errorCallbackFn('DataShare.create requires Turbulenz services');
                }
            }, 0);
            return null;
        }

        var dataShare = new DataShare();

        dataShare.gameSession = gameSession;
        dataShare.gameSessionId = gameSession.gameSessionId;
        dataShare.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
        dataShare.service = TurbulenzServices.getService('datashare');
        dataShare.requestHandler = requestHandler;

        dataShare.id = params.id;
        dataShare.created = params.created;
        dataShare.owner = params.owner;
        dataShare.users = params.users;
        dataShare.joinable = params.joinable;

        dataShare.tokens = {};

        return dataShare;
    };
    DataShare.version = 1;

    DataShare.keyValidate = new RegExp('[A-Za-z0-9]+([\-\.][A-Za-z0-9]+)*');

    DataShare.publicReadOnly = 0;
    DataShare.publicReadAndWrite = 1;

    DataShare.notSetReason = {
        changed: 'changed',
        readOnly: 'readOnly',
        readAndWrite: 'readAndWrite'
    };
    return DataShare;
})();

//
// DataShareManager
//
var DataShareManager = (function () {
    function DataShareManager() {
    }
    DataShareManager.prototype.createDataShare = function (callbackFn, errorCallbackFn) {
        var that = this;

        var createDataShareCallback = function createDataShareCallbackFn(jsonResponse, status) {
            if (status === 200) {
                var dataShare = DataShare.create(that.requestHandler, that.gameSession, jsonResponse.data.datashare, errorCallback);
                callbackFn(dataShare);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                if (errorCallback) {
                    errorCallback("DataShareManager.createDataShare failed with " + "status " + status + ": " + jsonResponse.msg, status, that.createDataShare, [callbackFn, errorCallbackFn]);
                }
            }
        };

        var dataSpec = {
            gameSessionId: this.gameSessionId
        };

        this.service.request({
            url: '/api/v1/data-share/create/' + this.gameSession.gameSlug,
            method: 'POST',
            data: dataSpec,
            callback: createDataShareCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShareManager.prototype.findDataShares = function (params) {
        var that = this;
        if (!params.callback) {
            throw new Error('findDataShares missing callback parameter');
        }

        var findDataSharesCallback = function findDataSharesCallbackFn(jsonResponse, status) {
            var errorCallback = params.errorCallback || that.errorCallbackFn;
            if (status === 200) {
                var id;
                var dataShareMeta = jsonResponse.data.datashares;
                var dataShares = [];

                var dataShareMetaLength = dataShareMeta.length;
                var dataShareMetaIndex;
                for (dataShareMetaIndex = 0; dataShareMetaIndex < dataShareMetaLength; dataShareMetaIndex += 1) {
                    dataShares.push(DataShare.create(that.requestHandler, that.gameSession, dataShareMeta[dataShareMetaIndex], errorCallback));
                }
                params.callback(dataShares);
            } else if (errorCallback) {
                errorCallback("DataShareManager.findDataShares failed with " + "status " + status + ": " + jsonResponse.msg, status, that.findDataShares, [params]);
            }
        };

        var dataSpec = {};

        if (params.user) {
            dataSpec.username = params.user;
        }

        if (params.friendsOnly) {
            dataSpec.friendsOnly = 1;
        }

        this.service.request({
            url: '/api/v1/data-share/find/' + this.gameSession.gameSlug,
            method: 'GET',
            data: dataSpec,
            callback: findDataSharesCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShareManager.create = function (requestHandler, gameSession, errorCallbackFn) {
        if (!TurbulenzServices.available()) {
            debug.log("dataShareManagerCreateFn: !! TurbulenzServices not available");

            if (errorCallbackFn) {
                TurbulenzEngine.setTimeout(function () {
                    errorCallbackFn('DataShareManager.create requires Turbulenz services');
                }, 0);
            }
            return null;
        }

        var dataShareManager = new DataShareManager();

        dataShareManager.gameSession = gameSession;
        dataShareManager.gameSessionId = gameSession.gameSessionId;
        dataShareManager.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
        dataShareManager.service = TurbulenzServices.getService('datashare');
        dataShareManager.requestHandler = requestHandler;

        return dataShareManager;
    };
    DataShareManager.version = 1;
    return DataShareManager;
})();
