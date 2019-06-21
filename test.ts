import Watchable, { Watcher, applyAsMixin } from "./watchable"

class NotifierViaInterface implements Watchable {
    watch(_: {
        callbackKey?: string,
        watcher?: Watcher
    }): string | undefined { return undefined }
    stopWatching(_: string): void { }
    notifyWatchers(_: string, ...__: any[]): void { }
}
applyAsMixin(NotifierViaInterface)

class NotifierViaSubclass extends Watchable {
}

const notifierViaInterface = new NotifierViaInterface()
    , notifierViaSubclass = new NotifierViaSubclass()

let recieved: { [s: string]: any } = {}

const callbackKey = "Watcher"
class TestingWatcher {
    constructor() {
        notifierViaInterface.watch({
            callbackKey,
            watcher: {
                go: (...args: any[]) => { recieved['notifierViaInterface_callbackKey'] = args }
            }
        })
        notifierViaInterface.watch({
            watcher: {
                go: (...args: any[]) => { recieved['notifierViaInterface_nocallbackKey'] = args }
            }
        })
        notifierViaSubclass.watch({
            callbackKey,
            watcher: {
                go: (...args: any[]) => { recieved['notifierViaSubclass_callbackKey'] = args }
            }
        })
        notifierViaSubclass.watch({
            watcher: {
                go: (...args: any[]) => { recieved['notifierViaSubclass_nocallbackKey'] = args }
            }
        })
    }

    stopWatching() {
        notifierViaInterface.stopWatching(callbackKey)
        notifierViaSubclass.stopWatching(callbackKey)
    }
}


const watcher = new TestingWatcher();
notifierViaInterface.notifyWatchers('go', 1);
notifierViaSubclass.notifyWatchers('go', 1);
console.log(recieved);
recieved = {}
watcher.stopWatching();
notifierViaInterface.notifyWatchers('go', 2);
notifierViaSubclass.notifyWatchers('go', 2);
console.log(recieved);
recieved = {}
