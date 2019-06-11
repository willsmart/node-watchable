// watchable
// © Will Smart 2019. Licence: MIT

// This is a stupidly simple observer pattern util

// API is the function. Require via
//   const makeClassWatchable = require(pathToFile)
// then after creating your class use as:
//   makeClassWatchable(TheClass)

module.exports = makeClassWatchable;

let g_nextUniqueCallbackIndex = 1;

function uniqueCallbackKey() {
  return `callback__${g_nextUniqueCallbackIndex++}`;
}

function makeClassWatchable(watchableClass) {
  Object.assign(watchableClass.prototype, {
    watch({
      callbackKey,
      ...watcher
    }) {
      const me = this,
        {
          watchers: watchersWere,
          watchedNotificationTypes: watchedNotificationTypesWere
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

      if (Object.keys(watcher).length) {
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

      if (typeof me.firstWatcherAdded === 'function' && Object.keys(watchersWere) === 0 && Object.keys(newWatchers) !== 0) {
        me.firstWatcherAdded.call(me);
      } else if (typeof me.lastWatcherRemoved === 'function' && Object.keys(watchersWere) !== 0 && Object.keys(newWatchers) === 0) {
        me.lastWatcherRemoved.call(me);
      }
      if (typeof me.watchersChanged === 'function') {
        me.watchersChanged.call(me);
      }

      return callbackKey;
    },

    stopWatching(callbackKey) {
      this.watch({
        callbackKey
      });
    },

    forEachWatcherCallback(type, callback) {
      const me = this,
        {
          watchedNotificationTypes
        } = me,
        callbacks = watchedNotificationTypes && watchedNotificationTypes[type]

      if (!callbacks) return;

      for (const watcherCallback of callbacks) {
        callback.call(me, watcherCallback); // TODO async
      }
    },

    notifyWatchers(type, ...args) {
      const me = this;
      me.forEachWatcherCallback(type, callback => callback.apply(me, args));
    },
  });
}