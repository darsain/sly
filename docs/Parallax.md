# Parallax

Sly parallax mode provides a great interface into which you can chain your parallax animation frame renderer. You can effortlessly utilize a lot of Sly's features, like animation easing functions, mouse/touch dragging, mouse wheel scrolling, scrollbar rendering, optimized requestAnimationFrame based animation rendering, ... and focus only on writing a function that will render one frame of your screen.

## Calling

You initiate parallax mode by passing an integer specifying the top scroll value as the first argument:

```js
var parallax = new Sly(10000, options);
```

## Usage

You'll generally want to bind your animation renderer to the `move` event. This event is directly chained to the requestAnimationFrame, and triggered on every animation frame when something is in motion, like user is scrolling, or dragging the handle or content.

```js
// Create a new Sly object in parallax mode
var parallax = new Sly(10000, {
	scrollSource: document, // Binds scroll listeners to `document`
	scrollBy: 100, // Scroll by 100 per `mousewheel` event

	dragSource: document, // Binds dragging listeners to `document`
	mouseDragging: 1, // Enables dragging by mouse
	touchDragging: 1, // Enables dragging by touch
	releaseSwing: 1,  // Enables release swing easing

	scrollBar: '#scrollbar', // Attaches a scroll bar

	speed: 600, // Duration based (tweening) animations speed in milliseconds
	easing: 'easeOutExpo' // Tweening animations easing function
});

// Register an animation renderer
parallax.on('load move', renderFrame);

// Initiate the Sly object
parallax.init();
```

The `renderFrame` function receives the Sly object as its `this` value that you use to access the position object, which is all you need to render one frame:

```js
function renderFrame(eventName) {
	this.pos.start; // Start position: `0`
	this.pos.cur; // Current position
	this.pos.dest; // In animation, this is the destination position
	this.pos.end; // End position: `10000` in this example
	// ... and now do something with it
}
```

### [Parallax mode example](http://darsa.in/sly/examples/parallax.html)

## Features disabled in parallax mode

- Item navigation (duh).
- Paging and pages bar.
- Animated cycling.
- Dynamic scrollbar handle.