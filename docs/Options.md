# Options

All default options are stored in the `Sly.defaults` object. You can modify them simply by:

```js
Sly.defaults.speed = 300;
Sly.defaults.smart = 1;
```

Or you can make it easier with jQuery.extend:

```js
jQuery.extend(Sly.defaults, {
	speed: 300,
	smart: 1
});
```

By default, everything is disabled. Initiating Sly with all default options will leave you with a dead FRAME that doesn't do anything.

## Quick reference

Sly call with all default options as defined in the source.

```js
var frame = new Sly('#frame', {
	slidee:     null,  // Selector, DOM element, or jQuery object with DOM element representing SLIDEE.
	horizontal: false, // Switch to horizontal mode.

	// Item based navigation
	itemNav:        null,  // Item navigation type. Can be: 'basic', 'centered', 'forceCentered'.
	itemSelector:   null,  // Select only items that match this selector.
	smart:          false, // Repositions the activated item to help with further navigation.
	activateOn:     null,  // Activate an item on this event. Can be: 'click', 'mouseenter', ...
	activateMiddle: false, // Always activate the item in the middle of the FRAME. forceCentered only.

	// Scrolling
	scrollSource: null,  // Element for catching the mouse wheel scrolling. Default is FRAME.
	scrollBy:     0,     // Pixels or items to move per one mouse scroll. 0 to disable scrolling.
	scrollHijack: 300,   // Milliseconds since last wheel event after which it is acceptable to hijack global scroll.
	scrollTrap:   false, // Don't bubble scrolling when hitting scrolling limits.

	// Dragging
	dragSource:    null,  // Selector or DOM element for catching dragging events. Default is FRAME.
	mouseDragging: false, // Enable navigation by dragging the SLIDEE with mouse cursor.
	touchDragging: false, // Enable navigation by dragging the SLIDEE with touch events.
	releaseSwing:  false, // Ease out on dragging swing release.
	swingSpeed:    0.2,   // Swing synchronization speed, where: 1 = instant, 0 = infinite.
	elasticBounds: false, // Stretch SLIDEE position limits when dragging past FRAME boundaries.
	interactive:   null,  // Selector for special interactive elements.

	// Scrollbar
	scrollBar:     null,  // Selector or DOM element for scrollbar container.
	dragHandle:    false, // Whether the scrollbar handle should be draggable.
	dynamicHandle: false, // Scrollbar handle represents the ratio between hidden and visible content.
	minHandleSize: 50,    // Minimal height or width (depends on sly direction) of a handle in pixels.
	clickBar:      false, // Enable navigation by clicking on scrollbar.
	syncSpeed:     0.5,   // Handle => SLIDEE synchronization speed, where: 1 = instant, 0 = infinite.

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
	cycleBy:       null,  // Enable automatic cycling by 'items' or 'pages'.
	cycleInterval: 5000,  // Delay between cycles in milliseconds.
	pauseOnHover:  false, // Pause cycling when mouse hovers over the FRAME.
	startPaused:   false, // Whether to start in paused sate.

	// Mixed options
	moveBy:        300,     // Speed in pixels per second used by forward and backward buttons.
	speed:         0,       // Animations speed in milliseconds. 0 to disable animations.
	easing:        'swing', // Easing for duration based (tweening) animations.
	startAt:       null,    // Starting offset in pixels or items.
	keyboardNavBy: null,    // Enable keyboard navigation by 'items' or 'pages'.

	// Classes
	draggedClass:  'dragged', // Class for dragged elements (like SLIDEE or scrollbar handle).
	activeClass:   'active',  // Class for active items and pages.
	disabledClass: 'disabled' // Class for disabled navigation elements.
});
```

# Options

### slidee

Type: `String|Element|Object`
Default: `null`

This option allows to manually set what will Sly use as a SLIDEE element. By default, SLIDEE is a 1st child of FRAME.

### horizontal

Type: `Boolean`
Default: `false`

Switches to horizontal mode.

---

###### Item based navigation

---

### itemNav

Type: `String`
Default: `null`

This option activates item based navigation. There are multiple navigation types:

- **basic**

    Items snap to FRAME edges.

- **centered**

    Activated item, or item that happens to be in the middle are positioned to the center of a visible FRAME when possible. "When possible" means that the first or last items wont detach SLIDEE from the FRAME edges, thus they will remain at the start or end of the visible FRAME.

- **forceCentered**

    Same as centered, without the "when possible" part. All items, even first and last ones can be positioned to the center of the frame when they are activated, or just moved there.

### itemSelector

Type: `String`
Default: `null`

Selector to be used for items. It only makes sense to use a selector that will select only visible items. If you'll select only some items, but leave others visible, the item based navigation won't work properly.

### smart

Type: `Boolean`
Default: `false`

Enables smart navigation. Smart navigation will re-position the activated item to help with further navigation. For example, in `basic` navigation type, when last visible item is activated, Sly will animate it to the start of the FRAME, as it assumes that user is moving forward.

In centered navigation types, all activated items are positioned to the center of the frame.

### activateOn

Type: `String`
Default: `null`

Event name. When an item will receive this event, it will be activated. You'll mostly want to set it to `click`. Leave `null` to disable activating items by user interaction.

### activateMiddle

Type: `Boolean`
Default: `false`

This will automatically activate an item that happens to be in the middle of the visible FRAME. This option is available only for `forceCentered` navigation type.

---

###### Scrolling

---

### scrollSource

Type: `Mixed`
Default: `FRAME`

Element to be used as a listener for mouse wheel scroll events. By default, FRAME is used.

You can pass a selector string, a DOM element, or a jQuery object with element. You can also pass the `document`, which is quite useful in [parallax mode](Parallax.md).

### scrollBy

Type: `Integer`
Default: `0`

Number of pixels, or - in item based navigation - items, to move per one mouse wheel scroll event. Leave at `0` to disable.

### scrollHijack

Type: `Integer`
Default: `300`

Number of milliseconds since last global wheel event after which it is acceptable to hijack global scroll.

### scrollTrap

Type: `Boolean`
Default: `false`

Set this to `true` to catch all scrolls originating on FRAME. By default, when there is nowhere to scroll, Sly lets scroll events bubble so they can scroll the parent document.

---

###### Dragging

---

Dragging can't be initiated by interactive elements. By default, Sly recognizes `input`, `button`, `select`, or a `textarea` elements as interactive. You can expand this pool by passing a selector into [`interactive`](#interactive) option described below.

### dragSource

Type: `Mixed`
Default: `FRAME`

Element to be used as a listener for dragging initiation events (mousedown/touchstart). By default, FRAME is used.

You can pass a selector string, a DOM element, or a jQuery object with element. You can also pass the `document`, which is quite useful in [parallax mode](Parallax.md).

### mouseDragging

Type: `Boolean`
Default: `false`

Enables navigation by dragging the FRAME content with mouse cursor.

### touchDragging

Type: `Boolean`
Default: `false`

Enables navigation by dragging the FRAME content with touch events.

### releaseSwing

Type: `Boolean`
Default: `false`

Whether Sly should calculate additional easing path for swipe/swing gestures after draggin has been released. The path length is calculated by the swing strength, i.e. the path that pointer moved in the last 40ms.

### swingSpeed

Type: `Float`
Default: `0.2`

This specifies the release swing animation speed. For this animation Sly uses non-duration based easing function that accepts synchronization factor instead of milliseconds. That means:

`1` = immediate, no animation
`0` = infinitely long animation

### elasticBounds

Type: `Boolean`
Default: `false`

Whether to stretch SLIDEE position limits when dragging past FRAME boundaries.

### interactive

Type: `String`
Default: `null`

Selector for elements that should be treated as interactive. Interactive elements don't initiate dragging. By default, Sly recognizes `input`, `button`, `select`, or a `textarea` elements as interactive. You can expand this pool by passing a selector into this option.

---

###### Scrollbar

---

### scrollBar

Type: `Mixed`
Default: `null`

Element to be used as a scrollbar. Scrollbar has to have one child that will represent the scrollbar handle. You can read more about exact requirements in the [Markup section](Markup.md).

You can pass a selector string, a DOM element, or a jQuery object with element.

### dragHandle

Type: `Boolean`
Default: `false`

Whether the scrollbar handle should be draggable (both mouse or touch events).

### dynamicHandle

Type: `Boolean`
Default: `false`

Whether the scrollbar handle size should be automatically adjusted to represent the ratio between hidden and visible content. When disabled, the handle will stay as big as CSS styles made it.

### minHandleSize

Type: `Integer`
Default: `50`

Minimal allowed handle size in pixels when `dynamicHandle` is enabled.

### clickBar

Type: `Boolean`
Default: `false`

Enables navigation by clicking on scrollbar.

### syncSpeed

Type: `Integer`
Default: `0.5`

When dragging the handle, this represents the synchronization animation speed. For this animation Sly uses non-duration based easing function that accepts synchronization factor instead of milliseconds. That means:

`1` = immediate, no animation
`0` = infinitely long animation

By default, `0.5` means that the synchronization will take 2-3 animation frames, enough for it to feel super responsive and smooth without the choppiness. Set it lower for lazy synchronization feel.

---

###### Pagesbar

---

### pagesBar

Type: `Mixed`
Default: `null`

Pass the element that will be used as a container for page items/buttons.

You can pass a selector string, a DOM element, or a jQuery object with element.

### activatePageOn

Type: `String`
Default: `null`

Event name. When a page item receives this event, the corresponding page will be activated. You'll mostly want to set it to `click`. Leave `null` to disable activating pages by user interaction.

### pageBuilder

Type: `Function`
Default: `fn`

A function that returns an HTML for one page item. This function accepts page index (starting at 0) as its first argument, and receives the current Sly instance object as its `this` value. The default function looks like this:

```js
pageBuilder: function (index) {
	return '<li>' + (index + 1) + '</li>';
},
```

---

###### Navigation buttons

---

All of the navigation button options are essentially just a convenience features, and could be easily replicated by [Sly methods](Methods.md).

### forward

Type: `Mixed`
Default: `null`

Selector string, DOM element, or a jQuery object with element for forward button.

Forward button initiates continuous movement forwards on `mousedown`, and stops the movement on `mouseup`.

### backward

Type: `Mixed`
Default: `null`

Selector string, DOM element, or a jQuery object with element for backward button.

Backward button initiates continuous movement backwards on `mousedown`, and stops the movement on `mouseup`.

### prev

Type: `Mixed`
Default: `null`

Selector string, DOM element, or a jQuery object with element for previous item button.

### next

Type: `Mixed`
Default: `null`

Selector string, DOM element, or a jQuery object with element for next item button.

### prevPage

Type: `Mixed`
Default: `null`

Selector string, DOM element, or a jQuery object with element for previous page button.

### nextPage

Type: `Mixed`
Default: `null`

Selector string, DOM element, or a jQuery object with element for next page button.

---

###### Automated cycling

---

### cycleBy

Type: `String`
Default: `null`

Activates automated cycling. Can be:

- **items** - for cycling by items
- **pages** - for cycling by pages

### cycleInterval

Type: `Integer`
Default: `5000`

Delay between cycles in milliseconds.

### pauseOnHover

Type: `Boolean`
Default: `false`

Whether to pause the cycling while the mouse is hovering over the FRAME.

### startPaused

Type: `Boolean`
Default: `false`

When `cycleBy` is enabled, this will start the Sly in paused mode.

---

###### Mixed options

---

### moveBy

Type: `Integer`
Default: `300`

Default speed in pixels per second used by forward & backward buttons.

### speed

Type: `Integer`
Default: `0`

Speed of duration based (tweening) animations in milliseconds.

### easing

Type: `String`
Default: `swing`

Easing function for duration based (tweening) animations. Default build in functions are `linear` & `swing`. For more, install the [jQuery Easing Plugin](http://gsgd.co.uk/sandbox/jquery/easing/).

### startAt

Type: `Integer|null`
Default: `null`

Offset in pixels to start Sly at. In item based navigations, this is an item index starting at `0`.

For example, when you have `startAt: 300`: In non-item based navigation, this says "move SLIDEE 300 pixels from the start on load". In item based navigation, this says "activated 300th item on Sly load, and place it at the start of the FRAME in basic, or center of the FRAME in centered navigation".

### keyboardNavBy

Type: `String`
Default: `null`

Enable keyboard navigation. Can be:

- **items** for navigation by items
- **pages** for navigation by pages

In vertical mode, arrows up & down will activate prev & next page or item. In horizontal mode, the same happens, but with left & right arrows.

---

###### Classes

---

Class names used on various elements to mark their state.

### draggedClass

Type: `String`
Default: `dragged`

Class added to scrollbar handle or SLIDEE when they are being dragged.

### activeClass

Type: `String`
Default: `active`

Class added to the active item, or page.

### disabledClass

Type: `String`
Default: `disabled`

Class added to buttons when they are disabled.

Buttons are being disabled when there would be no action after pressing them. For example: the previous item button when the very first item is activated.

If a button is a `<button>` or `<input>` element, it will also be marked with `disabled="disabled"` attribute.