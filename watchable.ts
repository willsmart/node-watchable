// watchable
// © Will Smart 2019. Licence: MIT

// This is a stupidly simple observer pattern util

// API is the function. Require via
//   const makeClassWatchable = require(pathToFile)
// then after creating your class use as:
//   makeClassWatchable(TheClass)

let g_nextUniqueCallbackIndex = 1
const uniqueCallbackKey = () => `callback__${g_nextUniqueCallbackIndex++}`;


export interface IWatchableCallbacks {
  firstWatcherAdded?(): void;
  lastWatcherRemoved?(): void;
  watchersChanged?(): void;
}

export interface WatcherCallback {
  (...args: any[]): void
}

export interface Watcher {
  [s: string]: WatcherCallback
}

export default class Watchable {
  watchers?: { [s: string]: Watcher } = {};
  watchedNotificationTypes?: { [s: string]: { [s: string]: WatcherCallback } } = {};
  watcherCallbacks?: IWatchableCallbacks;

  watch({ callbackKey, watcher }: {
    callbackKey?: string,
    watcher?: Watcher
  }) {
    const me = this,
      watchersWere = me.watchers || {},
      watchedNotificationTypesWere = me.watchedNotificationTypes || {},
      {
        watcherCallbacks
      } = me,
      newWatchers = Object.assign({}, watchersWere),
      newWatchedNotificationTypes = Object.assign({}, watchedNotificationTypesWere)

    if (callbackKey && watchersWere[callbackKey]) {
      const replacesWatcher = watchersWere[callbackKey]
      delete newWatchers[callbackKey]

      for (const notificationType of Object.keys(replacesWatcher)) {
        const watcherCallbacks = watchedNotificationTypesWere[notificationType]
        if (watcherCallbacks[callbackKey]) {
          const {
            [callbackKey]: _remove, ...keep
          } = watcherCallbacks;
          newWatchedNotificationTypes[notificationType] = keep;
        }
      }
    }

    if (watcher) {
      watcher = Object.assign({}, watcher)

      if (!callbackKey) callbackKey = uniqueCallbackKey();
      newWatchers[callbackKey] = watcher;

      for (const [notificationType, callback] of Object.entries(watcher)) {
        if (typeof (callback) != 'function') continue;

        const watcherCallbacks = newWatchedNotificationTypes[notificationType] || (newWatchedNotificationTypes[notificationType] = Object.assign({}, watchedNotificationTypesWere[notificationType]))
        watcherCallbacks[callbackKey] = callback;
      }
    }

    me.watchedNotificationTypes = newWatchedNotificationTypes;
    me.watchers = newWatchers

    if (watcherCallbacks) {
      if (watcherCallbacks.firstWatcherAdded && Object.keys(watchersWere).length === 0 && Object.keys(newWatchers).length !== 0) {
        watcherCallbacks.firstWatcherAdded.call(me);
      } else if (watcherCallbacks.lastWatcherRemoved && Object.keys(watchersWere).length !== 0 && Object.keys(newWatchers).length === 0) {
        watcherCallbacks.lastWatcherRemoved.call(me);
      }
      if (watcherCallbacks.watchersChanged) {
        watcherCallbacks.watchersChanged.call(me);
      }
    }

    return callbackKey;
  }
  stopWatching(callbackKey: string) {
    this.watch({
      callbackKey
    });
  }


  notifyWatchers(type: string, ...args: any[]) {
    const me = this, {
      watchedNotificationTypes
    } = me,

      callbacks = watchedNotificationTypes && watchedNotificationTypes[type]

    if (!callbacks) return;

    for (const watcherCallback of Object.values(callbacks)) {
      watcherCallback.apply(me, args); // TODO async
    }
  }
}

export function applyAsMixin(toCtor: any) {
  toCtor.prototype["watch"] = Watchable.prototype.watch;
  toCtor.prototype["stopWatching"] = Watchable.prototype.stopWatching;
  toCtor.prototype["notifyWatchers"] = Watchable.prototype.notifyWatchers;
}
