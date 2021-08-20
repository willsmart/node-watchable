"use strict";
// watchable
// © Will Smart 2019. Licence: MIT
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// This is a stupidly simple observer pattern util
// API is the function. Require via
//   const makeClassWatchable = require(pathToFile)
// then after creating your class use as:
//   makeClassWatchable(TheClass)
var g_nextUniqueCallbackIndex = 1;
var uniqueCallbackKey = function () { return "callback__" + g_nextUniqueCallbackIndex++; };
var Watchable = /** @class */ (function () {
    function Watchable() {
        this.watchers = {};
        this.watchedNotificationTypes = {};
    }
    Watchable.prototype.watch = function (_a) {
        var callbackKey = _a.callbackKey, watcher = _a.watcher;
        var me = this, watchersWere = me.watchers || {}, watchedNotificationTypesWere = me.watchedNotificationTypes || {}, watcherCallbacks = me.watcherCallbacks, newWatchers = Object.assign({}, watchersWere), newWatchedNotificationTypes = Object.assign({}, watchedNotificationTypesWere);
        if (callbackKey && watchersWere[callbackKey]) {
            var replacesWatcher = watchersWere[callbackKey];
            delete newWatchers[callbackKey];
            for (var _i = 0, _b = Object.keys(replacesWatcher); _i < _b.length; _i++) {
                var notificationType = _b[_i];
                var watcherCallbacks_1 = watchedNotificationTypesWere[notificationType];
                if (watcherCallbacks_1[callbackKey]) {
                    var _c = callbackKey, _remove = watcherCallbacks_1[_c], keep = __rest(watcherCallbacks_1, [typeof _c === "symbol" ? _c : _c + ""]);
                    newWatchedNotificationTypes[notificationType] = keep;
                }
            }
        }
        if (watcher) {
            watcher = Object.assign({}, watcher);
            if (!callbackKey)
                callbackKey = uniqueCallbackKey();
            newWatchers[callbackKey] = watcher;
            for (var _d = 0, _e = Object.entries(watcher); _d < _e.length; _d++) {
                var _f = _e[_d], notificationType = _f[0], callback = _f[1];
                if (typeof (callback) != 'function')
                    continue;
                var watcherCallbacks_2 = newWatchedNotificationTypes[notificationType] || (newWatchedNotificationTypes[notificationType] = Object.assign({}, watchedNotificationTypesWere[notificationType]));
                watcherCallbacks_2[callbackKey] = callback;
            }
        }
        me.watchedNotificationTypes = newWatchedNotificationTypes;
        me.watchers = newWatchers;
        if (watcherCallbacks) {
            if (watcherCallbacks.firstWatcherAdded && Object.keys(watchersWere).length === 0 && Object.keys(newWatchers).length !== 0) {
                watcherCallbacks.firstWatcherAdded.call(me);
            }
            else if (watcherCallbacks.lastWatcherRemoved && Object.keys(watchersWere).length !== 0 && Object.keys(newWatchers).length === 0) {
                watcherCallbacks.lastWatcherRemoved.call(me);
            }
            if (watcherCallbacks.watchersChanged) {
                watcherCallbacks.watchersChanged.call(me);
            }
        }
        return callbackKey;
    };
    Watchable.prototype.stopWatching = function (callbackKey) {
        this.watch({
            callbackKey: callbackKey
        });
    };
    Watchable.prototype.notifyWatchers = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var me = this, watchedNotificationTypes = me.watchedNotificationTypes, callbacks = watchedNotificationTypes && watchedNotificationTypes[type];
        if (!callbacks)
            return;
        for (var _a = 0, _b = Object.values(callbacks); _a < _b.length; _a++) {
            var watcherCallback = _b[_a];
            watcherCallback.apply(me, args); // TODO async
        }
    };
    return Watchable;
}());
exports.default = Watchable;
function applyAsMixin(toCtor) {
    toCtor.prototype["watch"] = Watchable.prototype.watch;
    toCtor.prototype["stopWatching"] = Watchable.prototype.stopWatching;
    toCtor.prototype["notifyWatchers"] = Watchable.prototype.notifyWatchers;
}
exports.applyAsMixin = applyAsMixin;
//# sourceMappingURL=watchable.js.map