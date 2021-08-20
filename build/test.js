"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var watchable_1 = require("./watchable");
var NotifierViaInterface = /** @class */ (function () {
    function NotifierViaInterface() {
    }
    NotifierViaInterface.prototype.watch = function (_) { return undefined; };
    NotifierViaInterface.prototype.stopWatching = function (_) { };
    NotifierViaInterface.prototype.notifyWatchers = function (_) {
        var __ = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            __[_i - 1] = arguments[_i];
        }
    };
    return NotifierViaInterface;
}());
watchable_1.applyAsMixin(NotifierViaInterface);
var NotifierViaSubclass = /** @class */ (function (_super) {
    __extends(NotifierViaSubclass, _super);
    function NotifierViaSubclass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NotifierViaSubclass;
}(watchable_1.default));
var notifierViaInterface = new NotifierViaInterface(), notifierViaSubclass = new NotifierViaSubclass();
var recieved = {};
var callbackKey = "Watcher";
var TestingWatcher = /** @class */ (function () {
    function TestingWatcher() {
        notifierViaInterface.watch({
            callbackKey: callbackKey,
            watcher: {
                go: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    recieved['notifierViaInterface_callbackKey'] = args;
                }
            }
        });
        notifierViaInterface.watch({
            watcher: {
                go: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    recieved['notifierViaInterface_nocallbackKey'] = args;
                }
            }
        });
        notifierViaSubclass.watch({
            callbackKey: callbackKey,
            watcher: {
                go: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    recieved['notifierViaSubclass_callbackKey'] = args;
                }
            }
        });
        notifierViaSubclass.watch({
            watcher: {
                go: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    recieved['notifierViaSubclass_nocallbackKey'] = args;
                }
            }
        });
    }
    TestingWatcher.prototype.stopWatching = function () {
        notifierViaInterface.stopWatching(callbackKey);
        notifierViaSubclass.stopWatching(callbackKey);
    };
    return TestingWatcher;
}());
var watcher = new TestingWatcher();
notifierViaInterface.notifyWatchers('go', 1);
notifierViaSubclass.notifyWatchers('go', 1);
console.log(recieved);
recieved = {};
watcher.stopWatching();
notifierViaInterface.notifyWatchers('go', 2);
notifierViaSubclass.notifyWatchers('go', 2);
console.log(recieved);
recieved = {};
//# sourceMappingURL=test.js.map