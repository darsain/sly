# Events

You can register callbacks to Sly events in multiple ways.

Passing in a callbackMap on Sly object creation:

```js
var frame = new Sly('#frame', options, {
	load: fn,
	move: [fn1, fn2] // Multiple callbacks
}).init();
```

With `.on()`, `.one()` and `.off()` methods:

```js
var frame = new Sly('#frame', options);

// Register a callback to multiple events
frame.on('load move', fn);

// Register a callback that will be executed only once
frame.one('load', fn);

// Initiate Sly instance
frame.init();
```

Events via `jQuery.fn.sly`:

```js
$('#frame').sly('on', 'load move', fn);
```

More usage examples can be found in the [on, one, and off methods documentation](Methods.md).

## Common arguments

#### this

The `this` value in all callbacks is the sly object triggering the event. With it you have access to all [Sly object properties](Properties.md).

#### 1st argument

All callbacks receive the event name as the first argument.

---

Example:

```js
sly.on('load', function (eventName) {
	console.log(eventName); // 'load'
	console.log(this.pos);  // Sly position object
});
```

## Events

### load

Event triggered on first sly load, and on each `.reload()` method call.

Callback arguments:

1. **eventName** `String` Event name.

**NOTE**: The  `sly.pos` or `this.pos` object in this event also contains an `old` property, containing the position object as it was before the reload. The position object than looks like this:

```js
{
	cur: 100,
	dest: 100,
	end: 120,
	start: 0,
	old: {
		cur: 100,
		dest: 100,
		end: 100,
		start: 0
	}
}
```

---

### active

Event triggered when new item has been activated.

Callback arguments:

1. **eventName** `String` Event name.
2. **itemIndex** `Int` Index of activated item.

---

### activePage

Event triggered when new page has been activated, or Sly arrived at it while scrolling.

Callback arguments:

1. **eventName** `String` Event name.
2. **pageIndex** `Int` Index of activated page.

---

### change

Event triggered whenever a new position change has been requested. That means that when you call `.slideTo(newPos)` it will trigger one `change` event right before the animation starts.

Callback arguments:

1. **eventName** `String` Event name.

**Note!:** When dragging a scrollbar handle or a SLIDEE, this event is being triggered on each mouse move, which is quite often.

---

### move

Event triggered on every frame of the animation. Animations are chained to requestAnimationFrame, so the frequency of this event when Sly is in animation is 60 FPS.

Callback arguments:

1. **eventName** `String` Event name.

---

### moveStart

Event triggered on start of every animation or dragging. *or dragging* means that `moveStart` will fire only when you start dragging (touchstart, mousedown), and not when you just pause and start moving again.

Callback arguments:

1. **eventName** `String` Event name.

---

### moveEnd

Event triggered on end of every animation or dragging. *or dragging* means that `moveEnd` will fire only when you stop dragging (touchend, mouseup), and not when you just stop moving.

Callback arguments:

1. **eventName** `String` Event name.

---

### pause

Triggered when cycling has been paused. That includes `pauseOnHover` functionality.

Callback arguments:

1. **eventName** `String` Event name.

---

### resume

Triggered when cycling has been resumed.

Callback arguments:

1. **eventName** `String` Event name.

---

### cycle

Triggered on each cycle tick.

Callback arguments:

1. **eventName** `String` Event name.