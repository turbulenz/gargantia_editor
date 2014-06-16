// Copyright (c) 2012 Turbulenz Limited
var WebGLTouchEvent = (function () {
    function WebGLTouchEvent() {
    }
    WebGLTouchEvent.create = function (params) {
        var touchEvent = new WebGLTouchEvent();

        touchEvent.changedTouches = params.changedTouches;
        touchEvent.gameTouches = params.gameTouches;
        touchEvent.touches = params.touches;

        return touchEvent;
    };
    return WebGLTouchEvent;
})();
