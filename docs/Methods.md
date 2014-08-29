# Methods

Sly has a bunch of very useful methods that provide almost any functionality required. You can call them directly on a [sly object](Calling.md), or (if you are lame) via a `jQuery.fn.sly` proxy, like so:

```js
$('#frame').sly('method' [, arguments... ] );
```

The docs & examples below assume that:

```js
var sly = new Sly(frame, options).init();
```

## Methods

### #init()

Initiates Sly instance, i.e. sets the required styles, binds event handlers,...

This method returns the very same object it was called on, so you can chain it right after the instance creation:

```js
var sly = new Sly(frame, options, callbackMap).init();
```

The purpose of this is to give you time to register callbacks with `.on()` and `.off()` methods without using `callbackMap` argument before anything happens.

---

### #destroy()

Removes classes, resets positions, and unbinds all event listeners. When called via `.sly()` proxy, you can also use an alias:

```js
$('#frame').sly(false); // does the same thing
```

Returns the Sly object, so you can do shenanigans like `new Sly().init().destroy().init()`.

---

### #reload()

Recalculates sizes and positions of elements. Call it if any change has happened to FRAME or its content, like things have been appended, removed, or resized.

---

### #slideTo(position, [immediate])

Animate SLIDEE to a specific position - offset from the start of a FRAME in pixels. In item based navigation, final position will be adjusted to snap items to the edge/center of the visible FRAME.

- **position** `Integer` New SLIDEE position. It will be adjusted to fit within `pos.start` and `pos.end`.
- **[immediate]** `Boolean` When `true`, re-positioning will occur immediately without animation.

---

### #slideBy(delta, [immediate])

Animate SLIDEE by an amount of pixels. In item based navigation, final position will be adjusted to snap items to edge/center of the visible FRAME.

- **delta** `Integer` Number of pixels, or items (in item based navigation) to slide the SLIDEE by. Negative animates towards the beginning, positive towards the end. The final position will be adjusted to fit within `pos.start` and `pos.end`.
- **[immediate]** `Boolean` When `true`, re-positioning will occur immediately without animation.

This method is essentially just a shorthand for `sly.slideTo(sly.pos.dest + delta)`.

---

### #toStart([target], [immediate])

Positions **target** to the start of a visible FRAME. When no **target** is passed, the whole SLIDEE will be used.

Doesn't work in `centered` or `forceCentered` item navigation.

- **[target]** `Mixed` In item based navigation, it can be an item index, or an item DOM element. In non-item base navigation, it can be a selector or a DOM node of any element inside of SLIDEE.
- **[immediate]** `Boolean` When `true`, re-positioning will occur immediately without animation.

Examples:

```js
// Universal
sly.toStart(); // Position the whole SLIDEE to the start
sly.toStart(true); // Position whole SLIDEE to the start, immediately

// Item based navigation
sly.toStart(2); // Position 3rd item in SLIDEE to the start of a visible FRAME
sly.toStart($items.eq(1), true); // Position 2nd item in SLIDEE to the start, immediately

// Non-item based navigation
sly.toStart('h2'); // Position the first H2 element in SLIDEE to the start of a visible FRAME
sly.toStart($('h2').eq(1), true); // Position second H2 element in SLIDEE to the start, immediately
```

---

### #toCenter([target], [immediate])

Positions **target** to the center of a visible FRAME. When no **target** is passed, the whole SLIDEE will be used.

- **[target]** `Mixed` In item based navigation, it can be an item index, or an item DOM element. In non-item base navigation, it can be a selector or a DOM node of any element inside of SLIDEE.
- **[immediate]** `Boolean` When `true`, re-positioning will occur immediately without animation.

Examples from **toStart** apply here as well.

---

### #toEnd([target], [immediate])

Positions **target** to the end of a visible FRAME. When no **target** is passed, the whole SLIDEE will be used.

Doesn't work in `centered` or `forceCentered` item navigation.

- **[target]** `Mixed` In item based navigation, it can be an item index, or an item DOM element. In non-item base navigation, it can be a selector or a DOM node of any element inside of SLIDEE.
- **[immediate]** `Boolean` When `true`, re-positioning will occur immediately without animation.

Examples from **toStart** apply here as well.

---

### #moveBy(speed)

Initiates continuous linear movement in the direction and speed specified by `speed` argument. The movement will continue until the position reaches a limit, or `.stop()` method is called.

- **speed** `Int` Movement speed in pixels per second. Negative number means backward movement.

Examples:

```js
sly.moveBy(300); // Move forwards with speed of 300px per second
sly.moveby(-200); // Move backwards with speed of 200px per second
```

---

### #stop()

Stops the continuous movement initiated my `.moveBy()` method.

---

### #activate(item, [immediate])

Activates an item, and when `smart` is enabled, repositions it to help with further navigation. Irrelevant in non-item based navigation.

- **item** `Mixed` Index or DOM element of an item in SLIDEE that should be activated. Items index starts at `0`.
- **[immediate]** `Boolean` When `true`, re-positioning will occur immediately without animation.

---

### #prev()

Activates previous item. Irrelevant in non-item based navigation.

---

### #next()

Activates next item. Irrelevant in non-item based navigation.

---

### #activatePage(index, [immediate])

Activate a page.

- **index** `Int` Index of a page that should be activated, starting at 0.
- **[immediate]** `Boolean` When `true`, re-positioning will occur immediately without animation.

---

#### #prevPage()

Activates previous page. When **forceCentered** navigation is used, this is a mere alias of `.prev()` method.

---

#### #nextPage()

Activates next page. When **forceCentered** navigation is used, this is a mere alias of `.next()` method.

---

### #pause([priority])

Pauses automated cycling.

- **[priority]** `Int` Pause priority level. Default is `100`.

The priority level is used internally for `pauseOnHover` functionality. You can mostly ignore it.

---

### #resume([priority])

Resumes automated cycling.

- **[priority]** `Int` Resume priority level. Default is `100`.

Will resume only a pause  with equal or lower priority level.

The priority level is used internally for `pauseOnHover` functionality. You can mostly ignore it.

---

### #toggle()

Starts when paused, or pauses when cycling.

---

### #set(name, [value])

Updates one, or multiple values in an options object.

```js
sly.set('speed', 0); // Updates one property in options object
sly.set({ speed: 0, cycleInterval: 0 }); // Extends current options object
```

Not all options can be updated. This is the list of those that can:

- smart
- activateMiddle
- scrollBy
- mouseDragging
- touchDragging
- releaseSwing
- swingSpeed
- elasticBounds
- dragHandle
- clickBar
- syncSpeed
- cycleBy
- cycleInterval
- pauseOnHover
- moveBy
- speed
- easing
- keyboardNavBy
- draggedClass
- activeClass
- disabledClass

You can however update any option, and than do `sly.destroy().init()` to re-initiate Sly object, thus rebinding all event listeners, rebuilding pages, ...

---

### #add(item, [position])

Adds one or multiple items to the SLIDEE end, or a specified position, and than reloads the Sly object.

- **item** `Mixed` DOM element, DOM node list, array with DOM elements, or HTML string of new item(s).
- **[position]** `Int` The position where the new item should be placed. Relevant only in item based navigation.

When inserting new items, especially in item-based navigation, you want to use this method as it also handles the active item index. For example: when `sly.rel.activeItem: 8`, and inserting new item at position `6`, the item `6` will be pushed to position `7`, and `sly.rel.activeItem` will shift to `9`.

Examples:

```js
sly.add(document.createElement('li'), 5); // Insert item at position 5
sly.add([LIElement, LIElement]); // Insert multiple items at the end of SLIDEE
sly.add('<li></li>', 0); // Insert new item at the beginning of SLIDEE
```

---

### #remove(element)

Removes one element from SLIDEE, and reloads the Sly object.

- **element** `Mixed` In item based navigation, it can be item index, DOM element, or selector. In non-item based, it can be only a DOM element or selector.

---

### #moveAfter(item, position)

Method for re-arranging items. Moves an item after the position index. Irrelevant in non-item based navigation.

- **item** `Mixed` Item to be positioned. Can be DOM element, or relative item index.
- **position** `Mixed` Anchor item. Can be DOM element, or relative item index.

Relative index means, that you can pass negative index to select items from the end of items list. For example: passing `-1` selects the last item.

Examples:

```js
sly.moveAfter(0, -1); // Moves first item after the last item
sly.moveAfter(-2, 5); // Moves the second to last item after the 6th item
```

---

### #moveBefore(item, position)

Method for re-arranging items. Moves an item before the position index. Irrelevant in non-item based navigation.

- **item** `Mixed` Item to be positioned. Can be DOM element, or relative item index.
- **position** `Mixed` Anchor item. Can be DOM element, or relative item index.

Relative index means, that you can pass negative index to select items from the end of items list. For example: passing `-1` selects the last item.

Examples:

```js
sly.moveBefore(-1, 0); // Moves the last item before the first one
sly.moveBefore(-2, 5); // Moves the second to last item before the 6th item
```

---

### #on(eventName, callback)

Registers a callback to one or more of the Sly events. All available events and arguments they receive can be found in the [Events documentation](Events.md).

- **eventName** `Mixed` Name of the event, or callback map object.
- **callback** `Mixed` Callback function, or an array with callback functions.

Examples:

```js
// Basic usage
sly.on('load', function () {});

// Multiple events, one callback
sly.on('load move', function () {});

// Multiple callbacks for multiple events
sly.on('load move', [
	function () {},
	function () {}
]);

// Callback map object
sly.on({
	load: function () {},
	move: [
		function () {},
		function () {}
	]
});
```

---

### #one(eventName, callback)

Same as `.on()` method, but registered callbacks will be executed only once, and will be unbind afterwards.

- **eventName** `Mixed` Name of the event, or callback map object.
- **callback** `Mixed` Callback function, or an array with callback functions.

---

### #off(eventName, [callback])

Removes one, multiple, or all callbacks from one of the Sly events.

- **eventName** `String` Name of the event.
- **[callback]** `Mixed` Callback function, or an array with callback functions to be removed. Omit to remove all callbacks.

Examples:

```js
// Removes one callback from load event
sly.off('load', fn1);

// Removes one callback from multiple events
sly.off('load move', fn1);

// Removes multiple callbacks from multiple event
sly.off('load move', [ fn1, fn2 ]);

// Removes all callbacks from load event
sly.off('load');
```

---

### #getPos(item)

Returns the position object of a requested item.

- **item** In non-item based navigation, it can be DOM element, or selector for any item inside of a SLIDEE. In item based navigation, it can also be an index of item starting at 0.

The item position object looks like this:

```
{
	start: 100,  // Start position inside of the FRAME.
	center: 300, // Center position inside of the FRAME.
	end: 700,    // End position inside of the FRAME.
	size: 150    // Size in the current Sly direction.
}
```

When item hasn't been found, returns `false`.

---

### #getIndex(item)

Returns an index of an item in item based navigation, or -1 when not found.

- **item** Can be DOM node of an item element, or index in case of checks.

When you pass an integer to the **item** argument, the function will just check whether it is a valid index (fits between 0 and sly.items.length - 1), and return the very same number, or -1 when invalid.