# [Sly](http://darsa.in/sly)

JavaScript library for one-directional scrolling with item based navigation support. 14KB minified, 6KB gzipped.

Sly supports navigation with:

- mouse wheel scrolling
- scrollbar (dragging the handle or clicking on scrollbar)
- pages bar
- various navigation buttons
- content dragging with mouse or touch
- automated cycling by items or pages
- lots of super useful methods

 ... and has a powerful & developer friendly API!

That's all build on a custom [highly optimized animation rendering](http://i.imgur.com/nszjJBZ.png) with
requestAnimationFrame, and GPU accelerated positioning with fallbacks for browsers that don't support it.

#### Dependencies

- jQuery 1.7+

Thats it. You don't need 200kB of jQuery-UI to Sly :)

#### Compatibility

Works everywhere, even in IE6+ abominations, but that is a complete accident :) IE 6-7 are not officially supported.

*Mobile:* Sly has a touch support, but mobile is not tested. If you want to help with that, you are welcome!

### [Changelog](https://github.com/Darsain/sly/wiki/Changelog)

Sly upholds the [Semantic Versioning Specification](http://semver.org/).

### [Forum](https://groups.google.com/d/forum/sly-js)

**Please do not populate Issues tracker with non-issues!** If you have a question about Sly, you can use the
**[Sly forum](https://groups.google.com/d/forum/sly-js)**.

## API documentation

- **[Markup](https://github.com/Darsain/sly/wiki/Markup)** - how should the HTML look like
- **[Calling](https://github.com/Darsain/sly/wiki/Calling)** - how to call Sly
- **[Options](https://github.com/Darsain/sly/wiki/Options)**
- **[Properties](https://github.com/Darsain/sly/wiki/Properties)**
- **[Methods](https://github.com/Darsain/sly/wiki/Methods)**
- **[Events](https://github.com/Darsain/sly/wiki/Events)**
- **[Parallax](https://github.com/Darsain/sly/wiki/Parallax)**

## Quick reference

Call via a jQuery proxy with all default options as defined in the source. Visit the
[Options Wiki page](https://github.com/Darsain/sly/wiki/Options) for more detailed documentation.

```js
$('#frame').sly({
	horizontal: 0, // Change to horizontal direction.

	// Item based navigation
	itemNav:      null, // Item navigation type. Can be: 'basic', 'centered', 'forceCentered'.
	itemSelector: null, // Select only items that match this selector.
	smart:        0,    // Repositions the activated item to help with further navigation.
	activateOn:   null, // Activate an item when it receives this event. Can be: 'click', 'mouseenter', ...
	activateMiddle: 0,  // In forceCentered navigation, always activate the item in the middle of the FRAME.

	// Scrolling
	scrollSource: null, // Selector or DOM element for catching the mouse wheel scrolling. Default is FRAME.
	scrollBy:     0,    // Number of pixels/items for one mouse scroll event. 0 to disable mouse scrolling.

	// Dragging
	dragSource:    null, // Selector or DOM element for catching dragging events. Default is FRAME.
	mouseDragging: 0,    // Enable navigation by dragging the SLIDEE with mouse cursor.
	touchDragging: 0,    // Enable navigation by dragging the SLIDEE with touch events.
	releaseSwing:  0,    // Ease out on dragging swing release.
	swingSpeed:    0.2,  // Swing synchronization speed, where: 1 = instant, 0 = infinite.

	// Scrollbar
	scrollBar:     null, // Selector or DOM element for scrollbar container.
	dragHandle:    0,    // Whether the scrollbar handle should be draggable.
	dynamicHandle: 0,    // Scrollbar handle represents the relation between hidden and visible content.
	minHandleSize: 50,   // Minimal height or width (depends on sly direction) of a handle in pixels.
	clickBar:      0,    // Enable navigation by clicking on scrollbar.
	syncSpeed:     0.5,  // Handle => SLIDEE synchronization speed, where: 1 = instant, 0 = infinite.

	// Pagesbar
	pagesBar:       null, // Selector or DOM element for pages bar container.
	activatePageOn: null, // Event used to activate page. Can be: click, mouseenter, ...
	pageBuilder:          // Page item generator.
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
	cycleBy:       null, // Enable automatic cycling by 'items' or 'pages'.
	cycleInterval: 5000, // Delay between cycles in milliseconds.
	pauseOnHover:  0,    // Pause cycling when mouse hovers over the FRAME.
	startPaused:   0,    // Whether to start in paused sate.

	// Mixed options
	moveBy:        300,     // Default speed in pixels per second used by forward & backward buttons.
	elasticBounds: 0,       // Stretch SLIDEE position limits when dragging past borders.
	speed:         0,       // Duration based animations speed in milliseconds. 0 to disable animations.
	easing:        'swing', // Easing for duration based (tweening) animations.
	startAt:       0,       // Starting offset in pixels or items.
	keyboardNavBy: 0,       // Enable keyboard navigation by 'items' or 'pages'.

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