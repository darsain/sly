# [Sly](http://darsa.in/sly)

JavaScript library for one-directional scrolling with item based navigation support. 12KB minified, 4.5KB gzipped.

Sly supports navigation with mouse wheel scrolling, scrollbar, pages bar, navigation buttons, content dragging, touch
events, automated cycling, ... and has a powerful developer friendly API.

That's all build around a custom [highly optimized animation rendering](http://i.imgur.com/dk0nV.png) with
requestAnimationFrame, and GPU accelerated positioning with fallbacks for browsers that do not support it.

#### Dependencies

- jQuery 1.7+

Thats it. You don't need 200kB of jQuery-UI to Sly :)

#### Compatibility

Works everywhere, even in IE6+ abominations, but that is a complete accident :) IE 6-7 are not officially supported.

*Mobile:* Sly has a touch events support, but mobile is not tested. If you want to help with that, you are welcome!

### [Changelog](https://github.com/Darsain/sly/wiki/Changelog)

Sly upholds the [Semantic Versioning Specification](http://semver.org/).

### [Forum](https://groups.google.com/d/forum/sly-js)

**Please do not populate Issues tracker with non-issues!** If you have a question about Sly, you can use the
**[Sly forum](https://groups.google.com/d/forum/sly-js)**.

## API documentation

- **[Markup](https://github.com/Darsain/sly/wiki/Markup)** - how should the HTML look like
- **[Calling](https://github.com/Darsain/sly/wiki/Calling)** - how to call Sly
- **[Options](https://github.com/Darsain/sly/wiki/Options)**
- **[Methods](https://github.com/Darsain/sly/wiki/Methods)**
- **[Events](https://github.com/Darsain/sly/wiki/Events)**
- **[Parallax](https://github.com/Darsain/sly/wiki/Parallax)**

## Quick reference

Call via a jQuery proxy with all default options as defined in the source. Visit the
[Options Wiki page](https://github.com/Darsain/sly/wiki/Options) for more detailed documentation.

```js
$('#frame').sly({
	// Sly type
	horizontal: 0,    // Change to horizontal direction.
	itemNav:    null, // Item navigation type. Can be: basic, smart, centered, forceCentered.

	// Scrollbar
	scrollBar:     null, // Selector or DOM element for scrollbar container.
	dragHandle:    0,    // Whether the scrollbar handle should be dragable.
	dynamicHandle: 0,    // Scrollbar handle represents the relation between hidden and visible content.
	minHandleSize: 50,   // Minimal height or width (depends on sly direction) of a handle in pixels.
	clickBar:      0,    // Enable navigation by clicking on scrollbar.
	syncFactor:    0.50, // Handle => SLIDEE sync factor. 0-1 floating point, where 1 = immediate, 0 = infinity.

	// Pagesbar
	pagesBar:    null, // Selector or DOM element for pages bar container.
	pageBuilder:       // Page item generator.
		function (index) {
			return '<li>' + (index + 1) + '</li>';
		},

	// Navigation buttons
	forward:  null, // Selector or DOM element for "forward movement" button.
	backward: null, // Selector or DOM element for "backward movement" button.
	prev:     null, // Selector or DOM element for "previous item" button.
	next:     null, // Selector or DOM element for "next item" button.
	prevPage: null, // Selector or DOM element for "previous page" button.
	nextPage: null, // Selector or DOM element for "next page" button.

	// Automated cycling
	cycleBy:       null, // Enable automatic cycling. Can be: items, pages.
	cycleInterval: 5000, // Delay between cycles in milliseconds.
	pauseOnHover:  0,    // Pause cycling when mouse hovers over a frame
	startPaused:   0,    // Whether to start in paused sate.

	// Mixed options
	scrollBy:      0,       // Number of pixels/items for one mouse scroll event. 0 to disable mouse scrolling.
	moveBy:        300,     // Number of pixels to move per second in continuous animations (forward/backward).
	dragging:      0,       // Enable navigation by dragging the SLIDEE.
	elasticBounds: 0,       // Stretch SLIDEE position limits when dragging past borders.
	speed:         0,       // Animations speed in milliseconds. 0 to disable animations.
	easing:        'swing', // Animations easing.
	scrollSource:  null,    // Selector or DOM element for catching the mouse wheel event. Default is FRAME.
	dragSource:    null,    // Selector or DOM element for catching the mouse dragging events. Default is FRAME.
	startAt:       0,       // Starting offset in pixels or items.
	keyboardNavBy: 0,       // Enable keyboard navigation by 'items' or 'pages'.
	domEvents:     0,       // Enable DOM events if you wish to use them instead of callbacks API (not recommended).

	// Classes
	draggedClass:  'dragged',  // Class for dragged elements (like SLIDEE or scrollbar handle).
	activeClass:   'active',   // Class for active items and pages.
	disabledClass: 'disabled'  // Class for disabled navigation elements.
});
```

## Roadmap

All of the desired features have been implemented.

Maaaaybe never, but I'd liked to:

- Dropping jQuery dependency, and transforming Sly into a [Component](http://component.io/) compoment.
- RTL layout support.

## Contributing

Please, read the [Contributing Guidelines](CONTRIBUTING.md) for this project.