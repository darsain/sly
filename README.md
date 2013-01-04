# [Sly](http://darsa.in/sly)

jQuery plugin for one-directional scrolling with item based navigation support. 11.5KB minified, 4.5KB gzipped.

#### Dependencies

Except jQuery, there are **no other dependencies**. That means you don't need 200kB of jQuery-UI to use it.

#### Compatibility

Works everywhere! I'm afraid even in IE6 (not intended, honest). Mobile is not tested.

### [Changelog](https://github.com/Darsain/sly/wiki/Changelog)

Sly upholds the [Semantic Versioning Specification](http://semver.org/), and right now is in **beta**. For more info,
read the [Roadmap section](#roadmap) below.

## API documentation

- [Introduction](https://github.com/Darsain/sly/wiki/Home) - how to call sly
- [Markup](https://github.com/Darsain/sly/wiki/Markup) - how should the HTML look like
- [Options](https://github.com/Darsain/sly/wiki/Options)
- [Methods](https://github.com/Darsain/sly/wiki/Methods)
- [Callbacks & DOM Events](https://github.com/Darsain/sly/wiki/Callbacks-&-DOM-Events)

## Quick reference

Call with all default options as defined in the source. Visit the
[Options Wiki page](https://github.com/Darsain/sly/wiki/Options) for more detailed documentation.

```js
var sly = $('#frame').sly({
	// Sly direction
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
	drag:          0,       // Enable navigation by dragging the SLIDEE.
	elasticBounds: 0,       // Stretch SLIDEE position limits when dragging past borders.
	speed:         0,       // Animations speed in milliseconds. 0 to disable animations.
	easing:        'swing', // Animations easing.
	scrollSource:  null,    // Selector or DOM element for catching the mouse wheel event. Default is FRAME.
	dragSource:    null,    // Selector or DOM element for catching the mouse dragging events. Default is FRAME.
	startAt:       0,       // Starting offset in pixels or items.
	keyboardNavBy: 0,       // Enable keyboard navigation by 'items' or 'pages'.

	// Classes
	draggedClass:  'dragged',  // Class for dragged elements (like SLIDEE or scrollbar handle).
	activeClass:   'active',   // Class for active items and pages.
	disabledClass: 'disabled', // Class for disabled navigation elements.

	// Performance
	domEvents: 1 // Disable DOM events if you are not using them.
}, true);
```

## Roadmap

**This plugin is in development!** and the API may change before the 1.0.0 release.

To do before 1.0.0:

- Touch events support.

## Contributing

Contributions are welcome! But please:

- Maintain the coding style used throughout the project.
- The resulting code has to pass JSHint with options defined in the header. [SublimeLinter FTW!](https://github.com/SublimeLinter/SublimeLinter)
