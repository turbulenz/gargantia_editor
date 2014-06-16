// Copyright (c) 2011-2012 Turbulenz Limited
"use strict";
//
// WebGLNetworkDevice
//
var WebGLNetworkDevice = (function () {
    function WebGLNetworkDevice() {
    }
    WebGLNetworkDevice.prototype.createWebSocket = function (url, protocol) {
        var WebSocketConstructor = this.WebSocketConstructor;
        if (WebSocketConstructor) {
            var ws;
            if (protocol) {
                ws = new WebSocketConstructor(url, protocol);
            } else {
                ws = new WebSocketConstructor(url);
            }
            if (typeof ws.destroy === "undefined") {
                ws.destroy = function websocketDestroyFn() {
                    this.onopen = null;
                    this.onerror = null;
                    this.onclose = null;
                    this.onmessage = null;
                    this.close();
                };
            }
            return ws;
        } else {
            return null;
        }
    };

    WebGLNetworkDevice.prototype.update = function () {
    };

    WebGLNetworkDevice.create = function (params) {
        var nd = new WebGLNetworkDevice();
        return nd;
    };
    WebGLNetworkDevice.version = 1;
    return WebGLNetworkDevice;
})();

WebGLNetworkDevice.prototype.WebSocketConstructor = (window.WebSocket ? window.WebSocket : window.MozWebSocket);
