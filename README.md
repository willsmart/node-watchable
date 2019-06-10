# node-watchable
This is just small and simple mixin to make any given JS class observable.

It is a building block I use often and I'm in the process of moving these small building blocks out to seperate packages for reuse. 
This will be used in my `nobo` project revamp.

## Installation
Clone this repository and require from your node file. 
I'll make this a proper npm package soon.

## Usage
From your class file:
```
const makeClassWatchable = require('node-watchable/watchable.js');

class Foo {
    bar() {
        notifyWatchers('foobarred'); // any additional args here will be passed on to the watchers
    }
}

makeClassWatchable(Foo)

module.exports = Foo
```

To listen:
```
const foo = new Foo(),
      callbackKey = foo.watch({
          foobarred: ()=>{
              ...
          }
      })

...

foo.unwatch({callbackKey})
```

## Nuance
- Each object has an object holding its listeners, which are keyed by their `callbackKey` value. This means that any object can only have one listener for any particular `callbackKey` value. If `watch` is called on an object without explicitly providing a `callbackKey` value, a globally unique value will be used. Either way, the function returns whatever `callbackKey` was used.
- The `listener` argument to `watch` watches for notifications by mapping notification types to functions. If any listener function returns a promise (eg as an async function), the `notifyWatchers` will return a promise to wait for it to finish (using `Promise.all`).

## Async examples
```
class Foo {
    async bar() {
        await notifyWatchers('foobarred');
    } 
}

makeClassWatchable(Foo)

const foo = new Foo(),
      foo.watch({
          async foobarred() {
              // replace with your fav async call
              await new Promise(resolve=>{setTimeout(resolve, 1000)});
          }
      })
```

Or, using my prefered style, avoiding the async functions and waiting for promises to resolve/reject in the laziest way possible.
```
const clearPromises = require('clearPromises'),  // repo coming soon
      promises = [];

class Foo {
    bar(promises) {
        notifyWatchers({
            type: 'foobarred',
            promises
        });
    } 
}

makeClassWatchable(Foo)

const foo = new Foo(),
      foo.watch({
          foobarred(promises) {
              doSomeOtherProcess(promises)
              promises.push(new Promise(resolve=>{setTimeout(resolve, 1000)}));
          }
      })

foo.bar(promises);

await clearPromises(promises);
```

See my `node-clearPromises` repository for more details about this pattern.

## Licence
MIT. Go for your life so long as I'm mentioned somewhere.

## Bugs/Requests
On this repo is perfect.



