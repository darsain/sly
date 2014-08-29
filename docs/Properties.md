# Properties

Sly instance exposes some useful properties. These properties are read only, and shouldn't be modified.

Assuming:

```js
var sly = new Sly(frame, options).init();
```

---

### sly.initialized

Type: `Boolean`

Flag of Sly initialized state. `true` when `.init()` has been called, `false` otherwise.

---

### sly.options

Type: `Object`

Object with all options used by the current Sly object. This is essentially a `Sly.defaults` object extended by options passed to `new Sly()`.

---

### sly.frame

Type: `Node`

FRAME element DOM node.

---

### sly.slidee

Type: `Node`

SLIDEE element DOM node.

---

### sly.pos

Type: `Object`

Sly position object specifying the SLIDEE positions and boundaries:

```js
{
	"start": 0,    // SLIDEE start of the frame position.
	"center": 713, // SLIDEE center of the frame position.
	"end": 1426,   // SLIDEE end of the frame position.
	"cur": 604,    // Current SLIDEE position.
	"dest": 604,   // When in animation, this is the SLIDEE destination position.
}
```

All positions are flipped from negative to positive numbers, so it would be easier to work with them.

For example: SLIDEE element, when at the end of the frame, has CSS property `left` equal to `-1426px` (or translateX(-1426px) in browsers that support it), but in the position object, this is represented by positive number `end: 1426`. All Sly methods than accept the flipped position state, like `.slideTo(200)` to slide 200 pixels from the start of the FRAME, `.slideBy(100)` to slide by 100px forwards, `slideBy(-100)` to slide by 100px backwards, `.moveBy(300)` to move 300px per second forwards, `.moveBy(-300)` to move 300px per second backwards, ...

---

### sly.rel

Type: `Object`

Sly relatives object:

```js
{
	"firstItem": 2,     // First at least half visible item in the FRAME.
	"lastItem": 9,      // Last at least half visible item in the FRAME.
	"centerItem": 5,    // Item in the middle of the visible FRAME.
	"activeItem": 0,    // Current active item.
	"activePage": 1,    // Current active page.
	"slideeSize": 2566, // LIDEE size.
	"frameSize": 1140,  // FRAME size.
	"sbSize": 1140,     // Scrolbar size.
	"handleSize": 506   // Scrollbar handle size.
}
```

All relatives are updated on every position change, so they are always current. The relatives are always determined from destination position (`pos.dest`), and never from current position (`pos.cur`).

The item properties in non-item based navigation (`firstItem`, ...) are `0` & irrelevant.

---

### sly.items

Type: `Array`

Array of item objects. This array is empty & irrelevant in non-item based navigation. Structure:

```js
[
	{
		el: DOMNode,  // Item element DOM node.
		start: 0,     // Item start of the FRAME position.
		center: -495, // Item center of the FRAME position.
		end: -990,    // Item end of the FRAME position.
		size: 151     // Item size in a corresponded Sly direction.
	},
	...
]
```

Following the position object flipping rule, the negative sign is flipped for each position property. The item object properties are than designed to be used like this:

```js
sly.slideTo(sly.items[6].center); // Animates 7th item to the center of the FRAME
```

But this is mostly for Sly internals, and is quite redundant as the same can be accomplished by:

```js
sly.toCenter(6);
```

By examining the item object in the example, you can see that `center` and `end` properties are out of bounds, as they are smaller than `sly.pos.start`, so Sly will never animate SLIDEE to such position (unless you are dragging the content past boundaries and `elasticBounds` are enabled). If Sly would be created with `forceCentered` navigation type, the `sly.pos.start` would be than equal to `-495`, which is the center position of the first object, i.e. `sly.items[0].center`.

---

### sly.pages

Type: `Array`

Array with page start positions:

```js
[
	0,    // First page start position.
	1057, // Second page start position.
	2114  // Third page start position.
]
```

The `sly.activatePage(1)` is then essentially just a shorthand for `sly.slideTo(sly.pages[1])`.

---

### sly.isPaused

Type: `Int`

Pause priority level. When cycling is paused, this value is higher than `0`, so it is safe to use it as a truthy value in conditionals: `if (sly.isPaused) { ... }`.